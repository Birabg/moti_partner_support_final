import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { authenticateToken } from "../src/middleware/auth.middleware";
import { requirePermission } from "../src/middleware/rbac.middleware";
import { JwtUtils, type JwtPayload } from "../src/utils/jwt";

const targetModules = [
  "cases",
  "roleassignment",
  "analytics",
  "department",
  "division",
  "section",
];

const baseFolder = path.resolve(process.cwd(), "src/modules");

function walkRoutes(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkRoutes(resolved));
    } else if (entry.isFile() && entry.name.endsWith(".route.ts")) {
      results.push(resolved);
    }
  }

  return results;
}

function scanRouteFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  const usesAuth = /router\.use\(\s*authenticateToken\s*\)/.test(content);

  const endpoints = lines
    .map((line, index) => {
      const match = line.match(/router\.(post|put|patch|delete|get)\s*\(\s*["'`](.+?)["'`]/);
      if (!match) {
        return null;
      }

      const method = match[1].toUpperCase();
      const route = match[2];
      const hasPermission = /requirePermission\(/.test(line);
      return {
        method,
        route,
        hasPermission,
        lineNumber: index + 1,
      };
    })
    .filter(Boolean) as Array<{
      method: string;
      route: string;
      hasPermission: boolean;
      lineNumber: number;
    }>;

  return { filePath, usesAuth, endpoints };
}

function printAudit(result: ReturnType<typeof scanRouteFile>) {
  const targetName = path.relative(baseFolder, result.filePath);
  console.log(`\n=== ${targetName} ===`);
  console.log(`Authentication middleware: ${result.usesAuth ? "FOUND" : "MISSING"}`);

  if (result.endpoints.length === 0) {
    console.log("No route definitions found.");
    return;
  }

  for (const endpoint of result.endpoints) {
    const type = ["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method)
      ? "MUTATION"
      : "READ";
    const status = endpoint.hasPermission ? "permission OK" : "permission MISSING";
    console.log(
      `${endpoint.lineNumber}: ${endpoint.method} ${endpoint.route} [${type}] -> ${status}`,
    );
  }
}

function createMockResponse() {
  let statusCode = 200;
  let body: any = undefined;

  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: any) {
      body = payload;
      return this;
    },
    getStatus() {
      return statusCode;
    },
    getBody() {
      return body;
    },
  } as unknown as { status(code: number): any; json(body: any): any; getStatus(): number; getBody(): any };
}

function runAuthTests() {
  console.log("\n=== Middleware runtime verification ===");

  const noAuthReq: any = { headers: {} };
  const invalidAuthReq: any = { headers: { authorization: "Bearer bad.token" } };
  const validToken = JwtUtils.generateAccessToken({
    userId: "audit-user",
    partyType: "STAFF",
    permissions: [],
  });
  const validAuthReq: any = {
    headers: { authorization: `Bearer ${validToken}` },
  };

  let called = false;
  const authRes = createMockResponse();
  authenticateToken(noAuthReq, authRes as any, () => {
    called = true;
  });
  assert.strictEqual(authRes.getStatus(), 401, "authenticateToken should reject missing header");
  assert.strictEqual(called, false, "authenticateToken should not call next() when auth is missing");

  called = false;
  const invalidRes = createMockResponse();
  authenticateToken(invalidAuthReq, invalidRes as any, () => {
    called = true;
  });
  assert.strictEqual(invalidRes.getStatus(), 401, "authenticateToken should reject invalid token");
  assert.strictEqual(called, false, "authenticateToken should not call next() with invalid token");

  called = false;
  const validRes = createMockResponse();
  authenticateToken(validAuthReq, validRes as any, () => {
    called = true;
  });
  assert.strictEqual(validRes.getStatus(), 200, "authenticateToken should accept a valid token");
  assert.strictEqual(called, true, "authenticateToken should call next() for valid token");

  const permissionReq: any = { user: { userId: "audit-user", partyType: "STAFF", permissions: [] } };
  called = false;
  const permissionRes = createMockResponse();
  requirePermission("CASE_CREATE")(permissionReq, permissionRes as any, () => {
    called = true;
  });
  assert.strictEqual(permissionRes.getStatus(), 403, "requirePermission should reject missing permission");
  assert.strictEqual(called, false, "requirePermission should not call next() without required permission");

  called = false;
  const grantedReq: any = {
    user: { userId: "audit-user", partyType: "STAFF", permissions: ["CASE_CREATE"] },
  };
  const grantedRes = createMockResponse();
  requirePermission("CASE_CREATE")(grantedReq, grantedRes as any, () => {
    called = true;
  });
  assert.strictEqual(grantedRes.getStatus(), 200, "requirePermission should allow valid permission");
  assert.strictEqual(called, true, "requirePermission should call next() when permissions match");

  called = false;
  const superAdminReq: any = {
    user: { userId: "audit-user", partyType: "STAFF", permissions: [], isSAdmin: true },
  };
  const superAdminRes = createMockResponse();
  requirePermission("SOME_RANDOM_PERMISSION")(superAdminReq, superAdminRes as any, () => {
    called = true;
  });
  assert.strictEqual(superAdminRes.getStatus(), 200, "requirePermission should allow superadmins regardless of permissions");
  assert.strictEqual(called, true, "requirePermission should call next() for superadmin");

  called = false;
  const missingContextReq: any = {};
  const missingContextRes = createMockResponse();
  requirePermission("ANY")(missingContextReq, missingContextRes as any, () => {
    called = true;
  });
  assert.strictEqual(missingContextRes.getStatus(), 401, "requirePermission should reject when no user context exists");
  assert.strictEqual(called, false, "requirePermission should not call next() with missing req.user");

  console.log("Middleware runtime verification passed.");
}

function main() {
  console.log("Starting manual RBAC audit...");

  const routeFiles = walkRoutes(baseFolder).filter((routeFile) => {
    return targetModules.some((moduleName) => routeFile.includes(path.join("src", "modules", moduleName)));
  });

  if (routeFiles.length === 0) {
    console.log("No route files found in the target module directories.");
    process.exit(1);
  }

  let issues = 0;

  for (const routeFile of routeFiles) {
    const result = scanRouteFile(routeFile);
    printAudit(result);

    if (!result.usesAuth) {
      issues += 1;
      console.log("  >> MISSING authentication middleware in this route file.");
    }

    for (const endpoint of result.endpoints) {
      const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method);
      if (isMutation && !endpoint.hasPermission) {
        issues += 1;
        console.log(
          `  >> MISSING requirePermission for mutation route ${endpoint.method} ${endpoint.route}`,
        );
      }
    }
  }

  if (issues > 0) {
    console.log(`\nAudit completed with ${issues} issue(s) found.`);
  } else {
    console.log("\nAudit completed with no route permission issues detected.");
  }

  runAuthTests();
}

main();

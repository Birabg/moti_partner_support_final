import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/error";

export const requirePermission = (...requiredPermissions: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {

      console.log("USER =", req.user);
      console.log("REQUIRED =", requiredPermissions);

      if (!req.user) {
        throw new UnauthorizedError(
          "Authentication token context unavailable."
        );
      }

      if (req.user.partyType === "STAFF" && req.user.isSAdmin) {
        return next();
      }

      const userPermissions = req.user.permissions || [];

      console.log("USER PERMISSIONS =", userPermissions);

      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      console.log("HAS PERMISSION =", hasPermission);

      if (!hasPermission) {
        throw new ForbiddenError(
          "Access Denied: Missing required permission clearance."
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
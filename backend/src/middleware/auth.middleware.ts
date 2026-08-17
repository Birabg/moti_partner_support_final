import { Request, Response, NextFunction } from "express";
import { JwtUtils, JwtPayload } from "../utils/jwt";
import { UnauthorizedError } from "../utils/error";
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Prefer Authorization header, but allow EventSource and other clients to pass the access token via query string as a fallback.
    const authHeader = req.headers.authorization;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query && typeof req.query.access_token === "string") {
      token = req.query.access_token as string;
    }

    if (!token) {
      throw new UnauthorizedError(
        "Access denied. Secure authorization token missing.",
      );
    }

    const decoded = JwtUtils.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ message: error.message });
    return;
  }
};

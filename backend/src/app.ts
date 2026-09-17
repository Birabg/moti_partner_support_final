import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { ApiRouter } from "./route/route.index";
import {
    ProfileRouter
}
from "./modules/profile/profile.route";
const app: Application = express();

app.set("json replacer", (_key: string, value: unknown) =>
  typeof value === "bigint" ? Number(value) : value
);

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
app.use("/api/profile", ProfileRouter);
app.use("/api", ApiRouter);


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(" Application Error Root:", err);

  res.status(err.status || 500).json({
    error:
      err.message ||
      "An unexpected operational failure occurred. Please try again.",
  });
});

export default app;

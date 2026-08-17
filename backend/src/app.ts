import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { ApiRouter } from "./route/route.index";
import {
    ProfileRouter
}
from "./modules/profile/profile.route";
const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    "/api/profile",
    ProfileRouter
);
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

// src/modules/reports/export.controller.ts

import { Request, Response, NextFunction } from "express";

import {
   generatePdf,
   generateExcel,
   generateCsv,
} from "./export.service";

/* ==========================================================
   EXPORT PDF
========================================================== */

export const exportPdf = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
       const actor = req.user as any;
       const file = actor?.partyType === "CUSTOMER"
           ? await generatePdf(actor.userId, "CUSTOMER")
           : await generatePdf();

       res.setHeader(
           "Content-Type",
           "application/pdf"
       );

       res.setHeader(
           "Content-Disposition",
           "attachment; filename=support-report.pdf"
       );

       res.status(200).send(file);
   } catch (error) {
       next(error);
   }
};

/* ==========================================================
   EXPORT EXCEL
========================================================== */

export const exportExcel = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
       const actor = req.user as any;
       const file = actor?.partyType === "CUSTOMER"
           ? await generateExcel(actor.userId, "CUSTOMER")
           : await generateExcel();

       res.setHeader(
           "Content-Type",
           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
       );

       res.setHeader(
           "Content-Disposition",
           "attachment; filename=support-report.xlsx"
       );

       res.status(200).send(file);
   } catch (error) {
       next(error);
   }
};

/* ==========================================================
   EXPORT CSV
========================================================== */

export const exportCsv = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
       const actor = req.user as any;
       const file = actor?.partyType === "CUSTOMER"
           ? await generateCsv(actor.userId, "CUSTOMER")
           : await generateCsv();

       res.setHeader(
           "Content-Type",
           "text/csv"
       );

       res.setHeader(
           "Content-Disposition",
           "attachment; filename=support-report.csv"
       );

       res.status(200).send(file);
   } catch (error) {
       next(error);
   }
};
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

        const file =
            await generatePdf();


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

        const file =
            await generateExcel();


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

        const file =
            await generateCsv();


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
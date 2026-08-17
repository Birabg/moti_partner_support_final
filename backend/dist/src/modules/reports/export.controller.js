"use strict";
// src/modules/reports/export.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCsv = exports.exportExcel = exports.exportPdf = void 0;
const export_service_1 = require("./export.service");
/* ==========================================================
   EXPORT PDF
========================================================== */
const exportPdf = async (req, res, next) => {
    try {
        const file = await (0, export_service_1.generatePdf)();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=support-report.pdf");
        res.status(200).send(file);
    }
    catch (error) {
        next(error);
    }
};
exports.exportPdf = exportPdf;
/* ==========================================================
   EXPORT EXCEL
========================================================== */
const exportExcel = async (req, res, next) => {
    try {
        const file = await (0, export_service_1.generateExcel)();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=support-report.xlsx");
        res.status(200).send(file);
    }
    catch (error) {
        next(error);
    }
};
exports.exportExcel = exportExcel;
/* ==========================================================
   EXPORT CSV
========================================================== */
const exportCsv = async (req, res, next) => {
    try {
        const file = await (0, export_service_1.generateCsv)();
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=support-report.csv");
        res.status(200).send(file);
    }
    catch (error) {
        next(error);
    }
};
exports.exportCsv = exportCsv;

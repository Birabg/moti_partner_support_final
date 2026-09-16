"use strict";
// src/modules/reports/export.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCsv = exports.generateExcel = exports.generatePdf = exports.getReportData = void 0;
const database_1 = require("../../config/database");
const exceljs_1 = __importDefault(require("exceljs"));
const PDFDocument = require("pdfkit");
const csv_writer_1 = require("csv-writer");
const getReportData = async (userId, actorType) => {
    const where = actorType === "CUSTOMER" && userId
        ? { customerId: userId }
        : {};
    const cases = await database_1.prisma.caseReport.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            customer: {
                select: {
                    firstName: true,
                    middleName: true,
                    email: true,
                },
            },
            assignedSupport: {
                select: {
                    firstName: true,
                    middleName: true,
                    email: true,
                },
            },
        },
    });
    return cases;
};
exports.getReportData = getReportData;
/* ==========================================================
   PDF EXPORT
========================================================== */
const generatePdf = async (userId, actorType) => {
    const data = await (0, exports.getReportData)(userId, actorType);
    return new Promise((resolve) => {
        const doc = new PDFDocument({
            margin: 40,
            size: "A4",
        });
        const buffers = [];
        doc.on("data", (chunk) => {
            buffers.push(chunk);
        });
        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
        doc
            .fontSize(22)
            .text("Support Case Report", {
            align: "center",
        });
        doc.moveDown();
        doc
            .fontSize(12)
            .text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown();
        data.forEach((item, index) => {
            doc
                .fontSize(15)
                .text(`Case ${index + 1}`);
            doc.text(`Case Number: ${item.caseNumber}`);
            doc.text(`Subject: ${item.subject}`);
            doc.text(`Status: ${item.status}`);
            doc.moveDown();
        });
        doc.end();
    });
};
exports.generatePdf = generatePdf;
/* ==========================================================
   EXCEL EXPORT
========================================================== */
const generateExcel = async (userId, actorType) => {
    const data = await (0, exports.getReportData)(userId, actorType);
    const workbook = new exceljs_1.default.Workbook();
    const sheet = workbook.addWorksheet("Reports");
    sheet.columns = [
        {
            header: "Case Number",
            key: "caseNumber",
            width: 20,
        },
        {
            header: "Subject",
            key: "subject",
            width: 35,
        },
        {
            header: "Status",
            key: "status",
            width: 20,
        }
    ];
    data.forEach((item) => {
        sheet.addRow({
            caseNumber: item.caseNumber,
            subject: item.subject,
            status: item.status,
        });
    });
    const excelBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(excelBuffer);
};
exports.generateExcel = generateExcel;
/* ==========================================================
   CSV EXPORT
========================================================== */
const generateCsv = async (userId, actorType) => {
    const data = await (0, exports.getReportData)(userId, actorType);
    const csv = (0, csv_writer_1.createObjectCsvStringifier)({
        header: [
            {
                id: "caseNumber",
                title: "CASE NUMBER",
            },
            {
                id: "subject",
                title: "SUBJECT",
            },
            {
                id: "status",
                title: "STATUS",
            },
        ],
    });
    const records = data.map((item) => ({
        caseNumber: item.caseNumber,
        subject: item.subject,
        status: item.status,
    }));
    const csvContent = csv.getHeaderString() +
        csv.stringifyRecords(records);
    return Buffer.from(csvContent);
};
exports.generateCsv = generateCsv;

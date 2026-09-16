// src/modules/reports/export.service.ts

import { prisma } from "../../config/database";
import ExcelJS from "exceljs";
import PDFDocument = require("pdfkit");
import { createObjectCsvStringifier } from "csv-writer";

export const getReportData = async (userId?: string, actorType?: "CUSTOMER" | "STAFF") => {
   const where = actorType === "CUSTOMER" && userId
       ? { customerId: userId }
       : {};

   const cases = await prisma.caseReport.findMany({
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

/* ==========================================================
   PDF EXPORT
========================================================== */

export const generatePdf = async (userId?: string, actorType?: "CUSTOMER" | "STAFF"): Promise<Buffer> => {
   const data = await getReportData(userId, actorType);

    return new Promise((resolve) => {

        const doc = new PDFDocument({
            margin: 40,
            size: "A4",
        });


        const buffers: Buffer[] = [];


        doc.on(
            "data",
            (chunk: Buffer) => {
                buffers.push(chunk);
            }
        );


        doc.on(
            "end",
            () => {
                resolve(
                    Buffer.concat(buffers)
                );
            }
        );


        doc
            .fontSize(22)
            .text(
                "Support Case Report",
                {
                    align: "center",
                }
            );


        doc.moveDown();


        doc
            .fontSize(12)
            .text(
                `Generated: ${new Date().toLocaleString()}`
            );


        doc.moveDown();


        data.forEach((item, index) => {

            doc
                .fontSize(15)
                .text(
                    `Case ${index + 1}`
                );


            doc.text(
                `Case Number: ${item.caseNumber}`
            );


            doc.text(
                `Subject: ${item.subject}`
            );


            doc.text(
                `Status: ${item.status}`
            );


            doc.moveDown();

        });


        doc.end();

    });
};

/* ==========================================================
   EXCEL EXPORT
========================================================== */

export const generateExcel = async (userId?: string, actorType?: "CUSTOMER" | "STAFF"): Promise<Buffer> => {
 
    const data = await getReportData(userId, actorType);

    const workbook =
        new ExcelJS.Workbook();


    const sheet =
        workbook.addWorksheet("Reports");


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


    data.forEach((item: any) => {

        sheet.addRow({

            caseNumber:
                item.caseNumber,

            subject:
                item.subject,

            status:
                item.status,

        });

    });


    const excelBuffer =
        await workbook.xlsx.writeBuffer();


    return Buffer.from(
        excelBuffer as ArrayBuffer
    );
};

/* ==========================================================
   CSV EXPORT
========================================================== */

export const generateCsv = async (userId?: string, actorType?: "CUSTOMER" | "STAFF"): Promise<Buffer> => {
 
    const data =
        await getReportData(userId, actorType);


    const csv =
        createObjectCsvStringifier({

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


    const records =
        data.map((item: any) => ({

            caseNumber:
                item.caseNumber,

            subject:
                item.subject,

            status:
                item.status,

        }));


    const csvContent =
        csv.getHeaderString() +
        csv.stringifyRecords(records);


    return Buffer.from(
        csvContent
    );
};
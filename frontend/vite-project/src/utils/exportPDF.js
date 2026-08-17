import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export function exportCasesPDF(cases) {

    const pdf = new jsPDF();

    pdf.setFontSize(18);

    pdf.text(

        "Case Report",

        14,

        20

    );

    autoTable(pdf, {

        startY: 30,

        head: [[

            "Case",

            "Customer",

            "Status",

            "Priority",

            "Date"

        ]],

        body: cases.map(caseItem => [

            caseItem.caseNumber,

            `${caseItem.customer?.firstName ?? ""} ${caseItem.customer?.lastName ?? ""}`,

            caseItem.status,

            caseItem.priority,

            new Date(caseItem.createdAt).toLocaleDateString()

        ])

    });

    pdf.save("Cases.pdf");

}
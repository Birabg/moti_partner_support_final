import * as XLSX from "xlsx";

export function exportCasesExcel(cases) {

    const rows = cases.map(caseItem => ({

        "Case Number": caseItem.caseNumber,

        Customer:
            `${caseItem.customer?.firstName ?? ""} ${caseItem.customer?.lastName ?? ""}`,

        Email:
            caseItem.customer?.email ?? "",

        Status:
            caseItem.status,

        Priority:
            caseItem.priority,

        "Created Date":
            new Date(caseItem.createdAt).toLocaleDateString()

    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Cases"

    );

    XLSX.writeFile(

        workbook,

        "Cases.xlsx"

    );

}
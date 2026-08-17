import Papa from "papaparse";

export function exportCasesCSV(cases) {

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

    const csv = Papa.unparse(rows);

    const blob = new Blob(

        [csv],

        {

            type: "text/csv;charset=utf-8;"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Cases.csv";

    link.click();

    URL.revokeObjectURL(url);

}
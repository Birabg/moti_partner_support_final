import { FaFilePdf, FaFileExcel, FaFileCsv } from "react-icons/fa";
import Button from "../ui/Button";
import { ReportsApi } from "../../api/reportsApi";

export default function ExportButtons() {

    async function download(filePromise, filename) {
        try {

            const response =
                await filePromise;

            const url =
                window.URL.createObjectURL(
                    new Blob([response.data])
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download = filename;

            document.body.appendChild(link);

            link.click();

            link.remove();

        } catch (error) {

            console.log(error);

            alert("Export failed.");

        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                onClick={() => download(ReportsApi.exportPdf(), "Reports.pdf")}
                variant="outline"
                size="sm"
                className="min-w-[120px] justify-center"
            >
                <FaFilePdf className="h-4 w-4" />
                Export PDF
            </Button>
            <Button
                onClick={() => download(ReportsApi.exportExcel(), "Reports.xlsx")}
                variant="outline"
                size="sm"
                className="min-w-[120px] justify-center"
            >
                <FaFileExcel className="h-4 w-4" />
                Export Excel
            </Button>
            <Button
                onClick={() => download(ReportsApi.exportCsv(), "Reports.csv")}
                variant="outline"
                size="sm"
                className="min-w-[120px] justify-center"
            >
                <FaFileCsv className="h-4 w-4" />
                Export CSV
            </Button>
        </div>
    );
}
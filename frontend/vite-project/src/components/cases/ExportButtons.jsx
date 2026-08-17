import Button from "../ui/Button";
import { exportCasesCSV } from "../../utils/exportCSV";
import { exportCasesExcel } from "../../utils/exportExcel";
import { exportCasesPDF } from "../../utils/exportPDF";

export default function ExportButtons({ cases }) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                onClick={() => exportCasesCSV(cases)}
                variant="outline"
                size="sm"
                className="min-w-[100px] justify-center"
            >
                CSV
            </Button>
            <Button
                onClick={() => exportCasesExcel(cases)}
                variant="outline"
                size="sm"
                className="min-w-[100px] justify-center"
            >
                Excel
            </Button>
            <Button
                onClick={() => exportCasesPDF(cases)}
                variant="outline"
                size="sm"
                className="min-w-[100px] justify-center"
            >
                PDF
            </Button>
        </div>
    );
}

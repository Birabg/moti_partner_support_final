import ExportButtons from "./ExportButtons";

export default function CaseToolbar({ refresh, cases }) {
    return (
        <div className="flex items-center justify-end gap-3">
            <ExportButtons cases={cases} />
            <button
                onClick={refresh}
                className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition"
            >
                Refresh
            </button>
        </div>
    );
}

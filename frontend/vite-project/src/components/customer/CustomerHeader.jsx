export default function CustomerHeader({ customer, displayName }) {
    const name = displayName || customer?.firstName || "Customer";

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">{`Welcome back, ${name}`}</p>
        </div>
    );
}

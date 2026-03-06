export default function DashboardOverview() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back. Here's what's happening with your applications.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Placeholder cards */}
                <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-700">Total Applications</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-700">Interviews Scheduled</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-700">Available Credits</h3>
                    <p className="text-3xl font-bold text-primary">1,000</p>
                </div>
            </div>
        </div>
    );
}

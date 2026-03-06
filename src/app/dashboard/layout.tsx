import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
            <Sidebar />
            <main className="flex-1 flex flex-col p-4 md:p-8 min-w-0">
                {children}
            </main>
        </div>
    );
}

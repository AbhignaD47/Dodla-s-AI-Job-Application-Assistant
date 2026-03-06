import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: dbUser } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
    if (!dbUser?.is_admin) {
        redirect("/dashboard");
    }

    // Fetch stats and lists
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { data: promos } = await supabase.from('promo_codes').select(`
    *,
    promo_code_usage (
      user_id,
      users ( email )
    )
  `).order('created_at', { ascending: false });

    return (
        <div className="container mx-auto py-10 px-4 mt-16 max-w-6xl flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users, promos, and system settings.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-700">Total Users</h3>
                    <p className="text-3xl font-bold">{usersCount || 0}</p>
                </div>
                <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-700">Total Promos</h3>
                    <p className="text-3xl font-bold">{promos?.length || 0}</p>
                </div>
                <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-700">Used Promos</h3>
                    <p className="text-3xl font-bold text-amber-500">{promos?.filter(p => p.is_used).length || 0}</p>
                </div>
                <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-700">Active Promos</h3>
                    <p className="text-3xl font-bold text-emerald-500">{promos?.filter(p => !p.is_used && p.is_active).length || 0}</p>
                </div>
            </div>

            {/* Promos Section */}
            <div className="flex flex-col gap-4 mt-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Promo Codes</h2>
                    <form action={async () => {
                        "use server";
                        // Server action to create a promo code 
                        // In a real app, use the API route or call Supabase directly from this server action.
                    }}>
                        {/* We rely on Client Component for actual interactive promo creation */}
                    </form>
                </div>

                <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-700">Code</th>
                                <th className="px-6 py-3 font-semibold text-slate-700">Discount</th>
                                <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-3 font-semibold text-slate-700">Used By</th>
                                <th className="px-6 py-3 font-semibold text-slate-700 text-right">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos?.map((promo) => (
                                <tr key={promo.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{promo.code}</td>
                                    <td className="px-6 py-4">{promo.discount_percent}%</td>
                                    <td className="px-6 py-4">
                                        {promo.is_used ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Used</span>
                                        ) : promo.is_active ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Active</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {promo.promo_code_usage?.[0]?.users?.email || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                        {new Date(promo.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {(!promos || promos.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No promo codes found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

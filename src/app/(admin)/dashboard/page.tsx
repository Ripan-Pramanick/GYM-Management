export const instant = false;

import { Users, CreditCard, TrendingUp, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function DashboardOverview() {
  await connection();
  const supabase = await createClient();

  const { data: payments } = await supabase.from('payments').select('amount');
  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;


  const { count: activeMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');


  const { data: unpaidInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .in('status', ['pending', 'overdue']);
  const totalDues = unpaidInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

  // 4. Recent Registrations
  const { data: recentRegistrations } = await supabase
    .from('members')
    .select(`
      id, joining_date, status,
      profiles (full_name),
      member_subscriptions (
        membership_plans (name)
      )
    `)
    .order('joining_date', { ascending: false })
    .limit(5);

  // 5. Today's Attendance (New Live Fetch)
  const today = new Date().toISOString().split('T')[0];
  const { count: todayAttendance } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);

  // Formatting helpers
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const stats = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Active Members", value: activeMembers?.toString() || "0", icon: Users, color: "text-brand-red" },
    { label: "Outstanding Dues", value: formatCurrency(totalDues), icon: CreditCard, color: "text-orange-500" },
    { label: "Attendance Today", value: todayAttendance?.toString() || "0", icon: Activity, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-brand-gray">Welcome back. Here is what's happening at FITCORE today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-brand-card p-6 rounded-2xl border border-white/5 shadow-lg transition-all hover:border-white/10 hover:shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-brand-gray text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Members Panel */}
        <div className="lg:col-span-2 bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recent Registrations</h2>
            <button className="text-sm text-brand-red hover:text-red-400 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentRegistrations?.map((member: any) => {
              const name = Array.isArray(member.profiles) ? member.profiles[0]?.full_name : member.profiles?.full_name;
              const sub = Array.isArray(member.member_subscriptions) ? member.member_subscriptions[0] : member.member_subscriptions;
              const planName = sub?.membership_plans?.name || "No Plan";
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{name}</span>
                    <span className="text-brand-gray text-xs">{planName} Plan • {formatDate(member.joining_date)}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    member.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {member.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:border-brand-red transition-colors group">
              <span className="text-white font-medium group-hover:text-brand-red transition-colors">Add New Member</span>
              <Users className="h-5 w-5 text-brand-gray group-hover:text-brand-red" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:border-brand-red transition-colors group">
              <span className="text-white font-medium group-hover:text-brand-red transition-colors">Record Payment</span>
              <CreditCard className="h-5 w-5 text-brand-gray group-hover:text-brand-red" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
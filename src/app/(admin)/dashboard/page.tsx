"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Users, CreditCard, TrendingUp, Activity, Calendar, Receipt } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function DashboardOverview() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const [
        paymentsRes,
        activeMembersRes,
        unpaidInvoicesRes,
        recentMembersRes,
        attendanceRes,
      ] = await Promise.all([
        supabase.from("payments").select("amount"),
        supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("invoices").select("amount").in("status", ["pending", "overdue"]),
        supabase
          .from("members")
          .select("id, full_name, plan, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("attendance").select("*", { count: "exact", head: true }).eq("date", today),
      ]);

      const revenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const dues = unpaidInvoicesRes.data?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0;

      setTotalRevenue(revenue);
      setActiveMembers(activeMembersRes.count || 0);
      setTotalDues(dues);
      setTodayAttendance(attendanceRes.count || 0);
      setRecentRegistrations(recentMembersRes.data || []);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const stats = [
    { label: "Total Revenue", value: isLoading ? "..." : formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Active Members", value: isLoading ? "..." : activeMembers.toString(), icon: Users, color: "text-brand-red" },
    { label: "Outstanding Dues", value: isLoading ? "..." : formatCurrency(totalDues), icon: CreditCard, color: "text-orange-500" },
    { label: "Attendance Today", value: isLoading ? "..." : todayAttendance.toString(), icon: Activity, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-brand-gray">Welcome back. Here is what's happening at FITCORE today.</p>
      </div>

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
        <div className="lg:col-span-2 bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recent Registrations</h2>
            <Link href="/dashboard/members" className="text-sm text-brand-red hover:text-red-400 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-8 text-center text-brand-gray">Loading recent registrations...</div>
            ) : recentRegistrations.length > 0 ? (
              recentRegistrations.map((member: any) => {
                const planName = member.plan ? member.plan.replace("-", " ") : "No";

                return (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{member.full_name || "Unknown"}</span>
                      <span className="text-brand-gray text-xs capitalize">
                        {planName} Plan • {formatDate(member.created_at)}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        member.status?.toLowerCase() === "active"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {member.status || "active"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-brand-gray">No recent registrations found.</div>
            )}
          </div>
        </div>

        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/members/new"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:border-brand-red transition-colors group"
            >
              <span className="text-white font-medium group-hover:text-brand-red transition-colors">Add New Member</span>
              <Users className="h-5 w-5 text-brand-gray group-hover:text-brand-red" />
            </Link>
            <Link
              href="/dashboard/payments/new"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:border-brand-red transition-colors group"
            >
              <span className="text-white font-medium group-hover:text-brand-red transition-colors">Record Payment</span>
              <CreditCard className="h-5 w-5 text-brand-gray group-hover:text-brand-red" />
            </Link>
            <Link
              href="/dashboard/classes/new"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:border-brand-red transition-colors group"
            >
              <span className="text-white font-medium group-hover:text-brand-red transition-colors">Schedule Class</span>
              <Calendar className="h-5 w-5 text-brand-gray group-hover:text-brand-red" />
            </Link>
            <Link
              href="/dashboard/expenses/new"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/5 hover:border-brand-red transition-colors group"
            >
              <span className="text-white font-medium group-hover:text-brand-red transition-colors">Record Expense</span>
              <Receipt className="h-5 w-5 text-brand-gray group-hover:text-brand-red" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
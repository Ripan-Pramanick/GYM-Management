"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Users, IndianRupee } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { FinancialChart, MemberGrowthChart } from "./components/AnalyticsCharts";
import { ExportButton } from "./components/ExportButton";

export default function AnalyticsPage() {
  const [financialData, setFinancialData] = useState<{ month: string; revenue: number; expenses: number; members: number }[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, expenses: 0, profit: 0 });
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
    const fetchAnalytics = async () => {
      setIsLoading(true);

      const [paymentsRes, expensesRes, membersRes] = await Promise.all([
        supabase.from("payments").select("amount, payment_date"),
        supabase.from("expenses").select("amount, date"),
        supabase.from("members").select("id, created_at"),
      ]);

      const payments = paymentsRes.data || [];
      const expenses = expensesRes.data || [];
      const members = membersRes.data || [];

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const buckets: Record<string, { key: string; month: string; revenue: number; expenses: number; members: number }> = {};

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
        buckets[key] = { key, month: label, revenue: 0, expenses: 0, members: 0 };
      }

      const getBucket = (dateStr?: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!buckets[key]) {
          const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
          buckets[key] = { key, month: label, revenue: 0, expenses: 0, members: 0 };
        }
        return buckets[key];
      };

      let totalRevenue = 0;
      let totalExpenses = 0;

      payments.forEach((p: any) => {
        const amt = Number(p.amount || 0);
        totalRevenue += amt;
        const bucket = getBucket(p.payment_date);
        if (bucket) bucket.revenue += amt;
      });

      expenses.forEach((e: any) => {
        const amt = Number(e.amount || 0);
        totalExpenses += amt;
        const bucket = getBucket(e.date);
        if (bucket) bucket.expenses += amt;
      });

      members.forEach((m: any) => {
        const bucket = getBucket(m.created_at);
        if (bucket) bucket.members += 1;
      });

      const sortedData = Object.values(buckets).sort((a, b) => a.key.localeCompare(b.key));

      setFinancialData(sortedData);
      setTotals({
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
      });
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [supabase]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics & Reports</h1>
          <p className="text-brand-gray text-sm">Track your gym's financial performance and member growth.</p>
        </div>
        <ExportButton data={financialData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-white">{isLoading ? "..." : formatCurrency(totals.revenue)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><IndianRupee className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-white">{isLoading ? "..." : formatCurrency(totals.expenses)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><IndianRupee className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Net Profit</h3>
          <p className={`text-3xl font-bold ${totals.profit >= 0 ? "text-blue-500" : "text-red-500"}`}>
            {isLoading ? "..." : formatCurrency(totals.profit)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">Revenue vs Expenses</h2>
          <p className="text-brand-gray text-sm mb-6">Monthly financial comparison.</p>
          <FinancialChart data={financialData} />
        </div>

        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-white">Member Growth</h2>
            <div className="p-2 rounded-lg bg-brand-red/10 text-brand-red">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-brand-gray text-sm mb-6">New member acquisitions over time.</p>
          <MemberGrowthChart data={financialData} />
        </div>
      </div>
    </div>
  );
}
export const instant = false;

import { Download, TrendingUp, Users, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { FinancialChart, MemberGrowthChart } from "./components/AnalyticsCharts";
import { ExportButton } from "./components/ExportButton";

export default async function AnalyticsPage() {
  await connection(); 
  const supabase = await createClient();


  const { data: payments } = await supabase.from('payments').select('amount, payment_date');
  const { data: expenses } = await supabase.from('expenses').select('amount, date');
  const { data: members } = await supabase.from('members').select('joining_date');

  const financialData = [
    { month: "Aug", revenue: 45000, expenses: 32000 },
    { month: "Sep", revenue: 52000, expenses: 28000 },
    { month: "Oct", revenue: payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0, expenses: expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0 },
  ];

 const memberData = [
    { month: "Aug", members: 12 },
    { month: "Sep", members: 18 },
    { month: "Oct", members: members?.length || 0 },
  ];

  const totalRevenue = financialData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = financialData.reduce((sum, m) => sum + m.expenses, 0);
  const profit = totalRevenue - totalExpenses;

  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics & Reports</h1>
          <p className="text-brand-gray text-sm">Track your gym's financial performance and member growth.</p>
        </div>
        <ExportButton data={financialData} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Revenue (Q3)</h3>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><IndianRupee className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Expenses (Q3)</h3>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><IndianRupee className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Net Profit (Q3)</h3>
          <p className="text-3xl font-bold text-blue-500">{formatCurrency(profit)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Chart */}
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">Revenue vs Expenses</h2>
          <p className="text-brand-gray text-sm mb-6">Monthly financial comparison.</p>
          <FinancialChart data={financialData} />
        </div>

        {/* Member Growth Chart */}
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-white">Member Growth</h2>
            <div className="p-2 rounded-lg bg-brand-red/10 text-brand-red">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-brand-gray text-sm mb-6">New member acquisitions over time.</p>
          <MemberGrowthChart data={memberData} />
        </div>
      </div>
    </div>
  );
}
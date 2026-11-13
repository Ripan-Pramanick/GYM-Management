export const instant = false;

import { FileText, Download, Filter, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function ReportsPage() {
  await connection();
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id, amount, payment_date, payment_method, status,
      members (
        profiles (full_name)
      )
    `)
    .order('payment_date', { ascending: false });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Detailed Reports</h1>
          <p className="text-brand-gray text-sm">Generate and export tabular data for accounting and auditing.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#09090b] border border-white/10 text-white hover:bg-white/5 font-medium h-11 px-4 rounded-xl transition-colors">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-brand-red/20">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-card border border-brand-red/20 rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red"><FileText className="h-6 w-6" /></div>
            <div>
              <h3 className="text-white font-bold">Transaction History</h3>
              <p className="text-brand-gray text-sm">All member payments</p>
            </div>
          </div>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><FileSpreadsheet className="h-6 w-6" /></div>
            <div>
              <h3 className="text-white font-bold">Expense Ledger</h3>
              <p className="text-brand-gray text-sm">Gym operational costs</p>
            </div>
          </div>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><FileText className="h-6 w-6" /></div>
            <div>
              <h3 className="text-white font-bold">Attendance Log</h3>
              <p className="text-brand-gray text-sm">Daily member check-ins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#09090b]/50">
          <h2 className="text-lg font-bold text-white">Recent Transactions Preview</h2>
        </div>
        <Table>
          <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-brand-gray font-semibold">Date</TableHead>
              <TableHead className="text-brand-gray font-semibold">Member</TableHead>
              <TableHead className="text-brand-gray font-semibold">Method</TableHead>
              <TableHead className="text-brand-gray font-semibold">Amount</TableHead>
              <TableHead className="text-brand-gray font-semibold text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((payment: any) => {
              const memberInfo = Array.isArray(payment.members) ? payment.members[0] : payment.members;
              const profileInfo = Array.isArray(memberInfo?.profiles) ? memberInfo?.profiles[0] : memberInfo?.profiles;
              
              return (
                <TableRow key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="text-brand-gray">{formatDate(payment.payment_date)}</TableCell>
                  <TableCell className="font-medium text-white">{profileInfo?.full_name || 'N/A'}</TableCell>
                  <TableCell className="text-brand-gray capitalize">{payment.payment_method}</TableCell>
                  <TableCell className="text-white font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-semibold px-3 py-1 capitalize">
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
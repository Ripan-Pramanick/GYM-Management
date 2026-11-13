"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ArrowUpRight, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from '@supabase/ssr';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
      
      // Fetch Payments joined with Invoices and Members
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id, amount, payment_method, payment_date, reference_number,
          invoices (
            status,
            members ( full_name, plan )
          )
        `)
        .order('payment_date', { ascending: false });

      if (paymentsData) {
        setPayments(paymentsData);
        // Calculate Total Revenue
        const revenue = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
        setTotalRevenue(revenue);
      }

      // Fetch Unpaid Invoices for Total Dues
      const { data: unpaidInvoices } = await supabase
        .from('invoices')
        .select('amount')
        .in('status', ['pending', 'overdue']);
        
      if (unpaidInvoices) {
        const dues = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
        setTotalDues(dues);
      }

      setIsLoading(false);
    };

    fetchFinancialData();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Payments & Income</h1>
          <p className="text-brand-gray text-sm">Manage member transactions and outstanding dues.</p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-brand-red/20">
            <Plus className="mr-2 h-5 w-5" /> Record Payment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><ArrowUpRight className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><CreditCard className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Transactions</h3>
          <p className="text-2xl font-bold text-white mb-1">{payments.length} Successful</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500"><AlertCircle className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Outstanding Dues</h3>
          <p className="text-2xl font-bold text-orange-500 mb-1">{formatCurrency(totalDues)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
          <Input 
            placeholder="Search by member name or Ref ID..." 
            className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5">Export CSV</Button>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-brand-gray font-semibold">Date</TableHead>
              <TableHead className="text-brand-gray font-semibold">Member</TableHead>
              <TableHead className="text-brand-gray font-semibold">Plan</TableHead>
              <TableHead className="text-brand-gray font-semibold">Method & Ref</TableHead>
              <TableHead className="text-brand-gray font-semibold">Status</TableHead>
              <TableHead className="text-brand-gray font-semibold text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brand-gray">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : payments.length > 0 ? (
              payments.map((payment: any) => {
                // Ensure we safely extract nested relation data
                const invoice = payment.invoices;
                const member = invoice?.members;
                const memberName = member?.full_name || "Unknown";
                const planName = member?.plan ? member.plan.replace('-', ' ') : "Unknown";

                return (
                  <TableRow key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-brand-gray whitespace-nowrap">{formatDate(payment.payment_date)}</TableCell>
                    <TableCell className="font-medium text-white">{memberName}</TableCell>
                    <TableCell className="text-brand-gray capitalize">{planName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white text-sm uppercase">{payment.payment_method?.replace('_', ' ') || 'CASH'}</span>
                        <span className="text-brand-gray text-xs">{payment.reference_number || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-semibold px-3 py-1">
                        PAID
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brand-gray">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
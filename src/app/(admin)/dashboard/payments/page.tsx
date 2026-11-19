"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ArrowUpRight, CreditCard, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from "@supabase/ssr";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
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
    const fetchFinancialData = async () => {
      setIsLoading(true);

      const [paymentsRes, unpaidRes] = await Promise.all([
        supabase
          .from("payments")
          .select(`
            id, amount, payment_method, payment_date, reference_number,
            invoices (
              status,
              members ( full_name, plan )
            )
          `)
          .order("payment_date", { ascending: false }),
        supabase
          .from("invoices")
          .select("amount")
          .in("status", ["pending", "overdue"]),
      ]);

      if (paymentsRes.data) {
        setPayments(paymentsRes.data);
        const revenue = paymentsRes.data.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setTotalRevenue(revenue);
      }

      if (unpaidRes.data) {
        const dues = unpaidRes.data.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
        setTotalDues(dues);
      }

      setIsLoading(false);
    };

    fetchFinancialData();
  }, [supabase]);

  const extractMemberInfo = (payment: any) => {
    const invoice = Array.isArray(payment.invoices) ? payment.invoices[0] : payment.invoices;
    const member = Array.isArray(invoice?.members) ? invoice.members[0] : invoice?.members;
    return {
      memberName: member?.full_name || "Unknown",
      planName: member?.plan ? member.plan.replace("-", " ") : "Unknown",
    };
  };

  const filteredPayments = payments.filter((payment) => {
    const query = searchQuery.toLowerCase();
    const { memberName, planName } = extractMemberInfo(payment);
    const refNo = (payment.reference_number || "").toLowerCase();
    const method = (payment.payment_method || "").toLowerCase();

    return (
      memberName.toLowerCase().includes(query) ||
      planName.toLowerCase().includes(query) ||
      refNo.includes(query) ||
      method.includes(query)
    );
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Member", "Plan", "Payment Method", "Reference ID", "Status", "Amount (INR)"];
    const rows = filteredPayments.map((payment) => {
      const { memberName, planName } = extractMemberInfo(payment);
      return [
        formatDate(payment.payment_date),
        `"${memberName}"`,
        `"${planName}"`,
        (payment.payment_method || "CASH").toUpperCase(),
        `"${payment.reference_number || "-"}"`,
        "PAID",
        payment.amount || 0,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Fitcore_Payments_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-white">{isLoading ? "..." : formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Transactions</h3>
          <p className="text-2xl font-bold text-white mb-1">{isLoading ? "..." : `${payments.length} Successful`}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Outstanding Dues</h3>
          <p className="text-2xl font-bold text-orange-500 mb-1">{isLoading ? "..." : formatCurrency(totalDues)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
          <Input
            placeholder="Search by member name or Ref ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl focus-visible:ring-brand-red"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
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
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((payment: any) => {
                const { memberName, planName } = extractMemberInfo(payment);

                return (
                  <TableRow key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-brand-gray whitespace-nowrap">{formatDate(payment.payment_date)}</TableCell>
                    <TableCell className="font-medium text-white">{memberName}</TableCell>
                    <TableCell className="text-brand-gray capitalize">{planName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white text-sm uppercase">
                          {payment.payment_method?.replace("_", " ") || "CASH"}
                        </span>
                        <span className="text-brand-gray text-xs">{payment.reference_number || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-semibold px-3 py-1">
                        PAID
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {formatCurrency(Number(payment.amount || 0))}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brand-gray">
                  {searchQuery ? `No payments found matching "${searchQuery}".` : "No payments found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
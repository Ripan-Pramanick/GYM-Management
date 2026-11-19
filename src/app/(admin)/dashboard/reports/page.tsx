"use client";

import { useState, useEffect, useMemo } from "react";
import { FileText, Download, Filter, FileSpreadsheet, Users, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from "@supabase/ssr";

type ReportType = "transactions" | "expenses" | "payroll";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("transactions");
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    const fetchReportsData = async () => {
      setIsLoading(true);

      const [paymentsRes, expensesRes, payrollRes] = await Promise.all([
        supabase
          .from("payments")
          .select(`
            id, amount, payment_date, payment_method, reference_number,
            invoices (
              status,
              members ( full_name, plan )
            )
          `)
          .order("payment_date", { ascending: false }),
        supabase.from("expenses").select("*").order("date", { ascending: false }),
        supabase.from("payroll").select("*").order("created_at", { ascending: false }),
      ]);

      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
      if (payrollRes.data) setPayroll(payrollRes.data);

      setIsLoading(false);
    };

    fetchReportsData();
  }, [supabase]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date: string) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredPayments = payments.filter((payment) => {
    const invoice = Array.isArray(payment.invoices) ? payment.invoices[0] : payment.invoices;
    const member = Array.isArray(invoice?.members) ? invoice.members[0] : invoice?.members;
    const memberName = (member?.full_name || "Unknown").toLowerCase();
    const method = (payment.payment_method || "").toLowerCase();
    const ref = (payment.reference_number || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = memberName.includes(query) || method.includes(query) || ref.includes(query);
    const matchesMonth = selectedMonth ? (payment.payment_date || "").startsWith(selectedMonth) : true;
    return matchesSearch && matchesMonth;
  });

  const filteredExpenses = expenses.filter((expense) => {
    const vendor = (expense.vendor || "").toLowerCase();
    const category = (expense.category || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = vendor.includes(query) || category.includes(query);
    const matchesMonth = selectedMonth ? (expense.date || "").startsWith(selectedMonth) : true;
    return matchesSearch && matchesMonth;
  });

  const filteredPayroll = payroll.filter((record) => {
    const staffName = (record.staff_name || "").toLowerCase();
    const jobTitle = (record.job_title || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = staffName.includes(query) || jobTitle.includes(query);
    const matchesMonth = selectedMonth ? (record.month || "").startsWith(selectedMonth) : true;
    return matchesSearch && matchesMonth;
  });

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[] = [];
    let filePrefix = "Fitcore_Report";

    if (activeReport === "transactions") {
      filePrefix = "Fitcore_Transactions";
      headers = ["Date", "Member", "Plan", "Method", "Reference", "Amount (INR)", "Status"];
      rows = filteredPayments.map((payment) => {
        const invoice = Array.isArray(payment.invoices) ? payment.invoices[0] : payment.invoices;
        const member = Array.isArray(invoice?.members) ? invoice.members[0] : invoice?.members;
        return [
          formatDate(payment.payment_date),
          `"${member?.full_name || "Unknown"}"`,
          `"${member?.plan || "N/A"}"`,
          payment.payment_method || "cash",
          `"${payment.reference_number || "-"}"`,
          payment.amount || 0,
          invoice?.status || "paid",
        ].join(",");
      });
    } else if (activeReport === "expenses") {
      filePrefix = "Fitcore_Expenses";
      headers = ["Date", "Category", "Vendor", "Method", "Amount (INR)", "Status"];
      rows = filteredExpenses.map((expense) =>
        [
          formatDate(expense.date),
          `"${expense.category || "N/A"}"`,
          `"${expense.vendor || "N/A"}"`,
          expense.payment_method || "cash",
          expense.amount || 0,
          expense.status || "paid",
        ].join(",")
      );
    } else {
      filePrefix = "Fitcore_Payroll";
      headers = ["Month", "Staff Name", "Role", "Base Salary (INR)", "Total Payable (INR)", "Status"];
      rows = filteredPayroll.map((record) =>
        [
          record.month || "-",
          `"${record.staff_name || "N/A"}"`,
          `"${record.job_title || "N/A"}"`,
          record.base_amount || 0,
          record.total_amount || 0,
          record.payment_status || "pending",
        ].join(",")
      );
    }

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filePrefix}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Detailed Reports</h1>
          <p className="text-brand-gray text-sm">Generate and export tabular data for accounting and auditing.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`border border-white/10 text-white font-medium h-11 px-4 rounded-xl transition-colors ${
              showFilters ? "bg-white/10" : "bg-[#09090b] hover:bg-white/5"
            }`}
          >
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button
            onClick={handleExportCSV}
            className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-brand-red/20"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-4 rounded-2xl border border-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl focus-visible:ring-brand-red"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl [color-scheme:dark]"
            />
            {(searchQuery || selectedMonth) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMonth("");
                }}
                className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5"
              >
                <X className="mr-1 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => setActiveReport("transactions")}
          className={`bg-brand-card border rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-colors ${
            activeReport === "transactions" ? "border-brand-red" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red"><FileText className="h-6 w-6" /></div>
            <div>
              <h3 className="text-white font-bold">Transaction History</h3>
              <p className="text-brand-gray text-sm">All member payments ({payments.length})</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveReport("expenses")}
          className={`bg-brand-card border rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-colors ${
            activeReport === "expenses" ? "border-brand-red" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><FileSpreadsheet className="h-6 w-6" /></div>
            <div>
              <h3 className="text-white font-bold">Expense Ledger</h3>
              <p className="text-brand-gray text-sm">Gym operational costs ({expenses.length})</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveReport("payroll")}
          className={`bg-brand-card border rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-colors ${
            activeReport === "payroll" ? "border-brand-red" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><Users className="h-6 w-6" /></div>
            <div>
              <h3 className="text-white font-bold">Payroll Ledger</h3>
              <p className="text-brand-gray text-sm">Staff salaries & payouts ({payroll.length})</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#09090b]/50">
          <h2 className="text-lg font-bold text-white">
            {activeReport === "transactions" && "Transaction History Preview"}
            {activeReport === "expenses" && "Expense Ledger Preview"}
            {activeReport === "payroll" && "Payroll Ledger Preview"}
          </h2>
        </div>

        {activeReport === "transactions" && (
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment: any) => {
                  const invoice = Array.isArray(payment.invoices) ? payment.invoices[0] : payment.invoices;
                  const member = Array.isArray(invoice?.members) ? invoice.members[0] : invoice?.members;

                  return (
                    <TableRow key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="text-brand-gray">{formatDate(payment.payment_date)}</TableCell>
                      <TableCell className="font-medium text-white">{member?.full_name || "Unknown"}</TableCell>
                      <TableCell className="text-brand-gray uppercase">{payment.payment_method?.replace("_", " ") || "CASH"}</TableCell>
                      <TableCell className="text-white font-medium">{formatCurrency(Number(payment.amount || 0))}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-semibold px-3 py-1 uppercase">
                          {invoice?.status || "PAID"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                    No transaction records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {activeReport === "expenses" && (
          <Table>
            <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-brand-gray font-semibold">Date</TableHead>
                <TableHead className="text-brand-gray font-semibold">Category</TableHead>
                <TableHead className="text-brand-gray font-semibold">Vendor</TableHead>
                <TableHead className="text-brand-gray font-semibold">Amount</TableHead>
                <TableHead className="text-brand-gray font-semibold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                    Loading expenses...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense: any) => (
                  <TableRow key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-brand-gray">{formatDate(expense.date)}</TableCell>
                    <TableCell className="font-medium text-white capitalize">{expense.category || "N/A"}</TableCell>
                    <TableCell className="text-brand-gray">{expense.vendor || "N/A"}</TableCell>
                    <TableCell className="text-white font-medium">{formatCurrency(Number(expense.amount || 0))}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={`${
                          expense.status?.toLowerCase() === "paid"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-orange-500/10 text-orange-500"
                        } border-none font-semibold px-3 py-1 uppercase`}
                      >
                        {expense.status || "PAID"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                    No expense records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {activeReport === "payroll" && (
          <Table>
            <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-brand-gray font-semibold">Month</TableHead>
                <TableHead className="text-brand-gray font-semibold">Staff Member</TableHead>
                <TableHead className="text-brand-gray font-semibold">Role</TableHead>
                <TableHead className="text-brand-gray font-semibold">Total Payable</TableHead>
                <TableHead className="text-brand-gray font-semibold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                    Loading payroll records...
                  </TableCell>
                </TableRow>
              ) : filteredPayroll.length > 0 ? (
                filteredPayroll.map((record: any) => (
                  <TableRow key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-brand-gray">{record.month || "-"}</TableCell>
                    <TableCell className="font-medium text-white">{record.staff_name || "N/A"}</TableCell>
                    <TableCell className="text-brand-gray">{record.job_title || "N/A"}</TableCell>
                    <TableCell className="text-white font-medium">{formatCurrency(Number(record.total_amount || 0))}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={`${
                          record.payment_status?.toLowerCase() === "paid"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-orange-500/10 text-orange-500"
                        } border-none font-semibold px-3 py-1 uppercase`}
                      >
                        {record.payment_status || "PENDING"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                    No payroll records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Receipt, ArrowDownRight, IndianRupee, Download, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from "@supabase/ssr";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
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
    const fetchExpenses = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error(error);
      }

      if (data) {
        setExpenses(data);
      }
      setIsLoading(false);
    };

    fetchExpenses();
  }, [supabase]);

  const handleMarkPaid = async (id: string) => {
    const { error } = await supabase
      .from("expenses")
      .update({ status: "paid" })
      .eq("id", id);

    if (error) {
      alert("Failed to update status: " + error.message);
      return;
    }

    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, status: "paid" } : exp))
    );
  };

  const handleDeleteExpense = async (expense: any) => {
    const confirmed = window.confirm(`Delete expense "${expense.vendor || "this record"}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("expenses").delete().eq("id", expense.id);

    if (error) {
      alert("Failed to delete expense: " + error.message);
      return;
    }

    setExpenses((prev) => prev.filter((exp) => exp.id !== expense.id));
  };

  const filteredExpenses = expenses.filter((expense) => {
    const query = searchQuery.toLowerCase();
    const vendor = expense.vendor?.toLowerCase() || "";
    const category = expense.category?.toLowerCase() || "";
    const matchesSearch = vendor.includes(query) || category.includes(query);
    const matchesMonth = selectedMonth ? expense.date?.startsWith(selectedMonth) : true;
    return matchesSearch && matchesMonth;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  const pendingExpenses = filteredExpenses
    .filter((exp) => exp.status?.toLowerCase() === "pending")
    .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  const categoryTotals = filteredExpenses.reduce((acc: Record<string, number>, exp) => {
    const cat = exp.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  let topCategory = "N/A";
  let maxCategoryAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxCategoryAmount) {
      maxCategoryAmount = amt;
      topCategory = cat;
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Category", "Vendor / Description", "Payment Method", "Status", "Amount (INR)"];
    const rows = filteredExpenses.map((expense) =>
      [
        formatDate(expense.date),
        `"${expense.category || "N/A"}"`,
        `"${expense.vendor || "N/A"}"`,
        (expense.payment_method || "cash").toUpperCase(),
        (expense.status || "paid").toUpperCase(),
        Number(expense.amount || 0),
      ].join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Fitcore_Expenses_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Expenses</h1>
          <p className="text-brand-gray text-sm">Track gym maintenance, rent, and operational costs.</p>
        </div>
        <Link href="/dashboard/expenses/new">
          <Button className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-brand-red/20">
            <Plus className="mr-2 h-5 w-5" /> Record Expense
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-white">{isLoading ? "..." : formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Top Category</h3>
          <p className="text-2xl font-bold text-white mb-1 capitalize">{isLoading ? "..." : topCategory}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Pending Payments</h3>
          <p className="text-2xl font-bold text-orange-500 mb-1">{isLoading ? "..." : formatCurrency(pendingExpenses)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
          <Input
            placeholder="Search vendor or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl focus-visible:ring-brand-red"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl [color-scheme:dark] w-auto"
          />
          {selectedMonth && (
            <Button
              variant="outline"
              onClick={() => setSelectedMonth("")}
              className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5"
            >
              Clear
            </Button>
          )}
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
              <TableHead className="text-brand-gray font-semibold">Category</TableHead>
              <TableHead className="text-brand-gray font-semibold">Vendor / Description</TableHead>
              <TableHead className="text-brand-gray font-semibold">Payment Method</TableHead>
              <TableHead className="text-brand-gray font-semibold">Status</TableHead>
              <TableHead className="text-brand-gray font-semibold text-right">Amount</TableHead>
              <TableHead className="text-brand-gray font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                  Loading expenses...
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense: any) => {
                const isPending = expense.status?.toLowerCase() === "pending";

                return (
                  <TableRow key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-brand-gray whitespace-nowrap">{formatDate(expense.date)}</TableCell>
                    <TableCell className="font-medium text-white capitalize">{expense.category || "N/A"}</TableCell>
                    <TableCell className="text-brand-gray">{expense.vendor || "N/A"}</TableCell>
                    <TableCell className="text-brand-gray capitalize">
                      {expense.payment_method?.replace("_", " ") || "Cash"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          !isPending ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                        } border-none font-semibold px-3 py-1 hover:opacity-80 capitalize`}
                      >
                        {expense.status || "Paid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {formatCurrency(Number(expense.amount || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        {isPending && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(expense.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 rounded-lg text-xs"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Mark Paid
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Expense"
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-brand-gray hover:text-brand-red h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
export const instant = false;

import Link from "next/link";
import { Plus, Search, Receipt, ArrowDownRight, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function ExpensesPage() {
  await connection();
  const supabase = await createClient();

  
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  
  
  const pendingExpenses = expenses?.filter(exp => exp.status?.toLowerCase() === 'pending')
                                  .reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  
    
  const categoryTotals = expenses?.reduce((acc: any, exp) => {
    const cat = exp.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {});
  
  let topCategory = "N/A";
  let maxCategoryAmount = 0;
  if (categoryTotals) {
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if ((amt as number) > maxCategoryAmount) {
        maxCategoryAmount = amt as number;
        topCategory = cat;
      }
    }
  }

  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500"><ArrowDownRight className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Receipt className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Top Category</h3>
          <p className="text-2xl font-bold text-white mb-1 capitalize">{topCategory}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><IndianRupee className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Pending Payments</h3>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(pendingExpenses)}</p>
        </div>
      </div>

      
      <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
          <Input 
            placeholder="Search vendor or category..." 
            className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5">Filter by Month</Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses?.map((expense: any) => (
              <TableRow key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="text-brand-gray whitespace-nowrap">{formatDate(expense.date)}</TableCell>
                <TableCell className="font-medium text-white capitalize">{expense.category}</TableCell>
                <TableCell className="text-brand-gray">{expense.vendor}</TableCell>
                <TableCell className="text-brand-gray capitalize">{expense.payment_method?.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge className={`${
                    expense.status?.toLowerCase() === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                  } border-none font-semibold px-3 py-1 hover:opacity-80 capitalize`}>
                    {expense.status || 'Paid'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-white">{formatCurrency(expense.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(!expenses || expenses.length === 0) && (
          <div className="p-8 text-center text-brand-gray">No expenses found.</div>
        )}
      </div>
    </div>
  );
}
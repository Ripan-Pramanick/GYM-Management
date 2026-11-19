"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const expenseSchema = z.object({
  vendor: z.string().min(2, "Vendor or description is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  status: z.string().min(1, "Status is required"),
  date: z.string().min(1, "Date is required"),
});

export default function NewExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vendor: "",
      amount: "",
      category: "",
      paymentMethod: "cash",
      status: "paid",
      date: "",
    },
  });

  useEffect(() => {
    form.setValue("date", new Date().toISOString().split("T")[0]);
  }, [form]);

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    try {
      setIsLoading(true);

      const { error } = await supabase.from("expenses").insert([
        {
          vendor: values.vendor.trim(),
          category: values.category,
          amount: parseFloat(values.amount),
          payment_method: values.paymentMethod,
          status: values.status,
          date: values.date,
        },
      ]);

      if (error) throw error;

      alert("Expense Recorded Successfully!");
      router.push("/dashboard/expenses");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Failed to record expense: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses">
          <Button variant="ghost" size="icon" className="text-brand-gray hover:text-white hover:bg-white/5">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Record Expense</h1>
          <p className="text-brand-gray text-sm">Log a new gym expense or utility bill.</p>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Vendor / Description</FormLabel>
                    <FormControl>
                      <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="e.g. Electricity Bill" {...field} />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="any"
                        className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl text-lg font-bold"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-brand-card border-white/10 text-white">
                        <SelectItem value="utilities">Utilities (Electric, Water)</SelectItem>
                        <SelectItem value="maintenance">Equipment Maintenance</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="supplies">Cleaning/Office Supplies</SelectItem>
                        <SelectItem value="marketing">Marketing & Ads</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-brand-card border-white/10 text-white">
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-brand-card border-white/10 text-white">
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl [color-scheme:dark]" {...field} />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Link href="/dashboard/expenses">
                <Button type="button" variant="ghost" className="text-brand-gray hover:text-white h-12 px-6 rounded-xl">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-brand-red hover:bg-red-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-brand-red/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Record Expense"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
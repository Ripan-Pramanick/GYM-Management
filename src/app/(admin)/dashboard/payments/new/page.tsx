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
import { createBrowserClient } from '@supabase/ssr';

const paymentSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  referenceNo: z.string().optional(),
});

export default function RecordPaymentPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { 
      memberId: "", 
      amount: "", 
      date: "", 
      paymentMethod: "", 
      referenceNo: "" 
    },
  });

  useEffect(() => {
    form.setValue("date", new Date().toISOString().split('T')[0]);

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('members')
        .select('id, full_name, plan')
        .order('full_name', { ascending: true });
        
      if (data) {
        setMembers(data);
      }
    };
    fetchMembers();
  }, [form, supabase]);

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    try {
      setIsLoading(true);

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          member_id: values.memberId,
          amount: parseFloat(values.amount),
          status: 'paid',
          due_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          invoice_id: invoiceData.id,
          amount: parseFloat(values.amount),
          payment_method: values.paymentMethod,
          reference_number: values.referenceNo,
          payment_date: new Date(values.date).toISOString(),
        }]);

      if (paymentError) throw paymentError;

      alert("Payment Recorded Successfully!");
      router.push("/dashboard/payments");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert("Failed to record payment: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments">
          <Button variant="ghost" size="icon" className="text-brand-gray hover:text-white hover:bg-white/5">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Record Member Payment</h1>
          <p className="text-brand-gray text-sm">Log an incoming payment against a member's outstanding dues.</p>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField control={form.control} name="memberId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Select Member</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                        <SelectValue placeholder="Search member..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-brand-card border-white/10 text-white">
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name} ({member.plan ? member.plan.replace('-', ' ') : 'No Plan'})
                        </SelectItem>
                      ))}
                      {members.length === 0 && (
                        <SelectItem value="loading" disabled>Loading members...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Amount Paid (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl text-lg font-bold" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="paymentMethod" render={({ field }) => (
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
              )} />

              <FormField control={form.control} name="referenceNo" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Reference / Transaction ID</FormLabel>
                  <FormControl>
                    <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="e.g. UPI-12345678" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl [color-scheme:dark]" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Link href="/dashboard/payments">
                <Button type="button" variant="ghost" className="text-brand-gray hover:text-white h-12 px-6 rounded-xl">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-brand-red hover:bg-red-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-brand-red/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
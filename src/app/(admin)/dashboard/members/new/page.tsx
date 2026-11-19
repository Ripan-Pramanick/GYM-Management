"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createBrowserClient } from "@supabase/ssr";

const PLAN_PRICES: Record<string, number> = {
  monthly: 1499,
  quarterly: 3999,
  "half-yearly": 6999,
  yearly: 11999,
};

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  emergencyContact: z.string().min(10, "Emergency contact required"),
  plan: z.string().min(1, "Please select a membership plan"),
});

export default function NewMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "", phone: "", emergencyContact: "", plan: "" },
  });

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const { data: newMember, error } = await supabase
        .from("members")
        .insert([
          {
            full_name: values.fullName.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            emergency_contact: values.emergencyContact.trim(),
            plan: values.plan,
            status: "active",
          },
        ])
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      const planAmount = PLAN_PRICES[values.plan] || 0;
      if (newMember?.id && planAmount > 0) {
        const { error: invoiceError } = await supabase.from("invoices").insert([
          {
            member_id: newMember.id,
            amount: planAmount,
            status: "pending",
            due_date: new Date().toISOString(),
          },
        ]);

        if (invoiceError) {
          console.error("Invoice Creation Error:", invoiceError);
        }
      }

      alert("Member Added Successfully!");
      router.push("/dashboard/members");
      router.refresh();
    } catch (error: any) {
      console.error("Database Insert Error:", error);
      alert("Failed to add member: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="icon" className="text-brand-gray hover:text-white hover:bg-white/5">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Register New Member</h1>
          <p className="text-brand-gray text-sm">Fill in the details to create a new membership profile.</p>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Full Name</FormLabel>
                    <FormControl>
                      <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Email Address (For Login)</FormLabel>
                    <FormControl>
                      <Input type="email" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Phone Number</FormLabel>
                    <FormControl>
                      <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-gray">Emergency Contact</FormLabel>
                    <FormControl>
                      <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="+91 98765 00000" {...field} />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Initial Subscription</h3>
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel className="text-brand-gray">Membership Plan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-brand-card border-white/10 text-white">
                        <SelectItem value="monthly">Monthly - ₹1,499</SelectItem>
                        <SelectItem value="quarterly">Quarterly - ₹3,999</SelectItem>
                        <SelectItem value="half-yearly">Half-Yearly - ₹6,999</SelectItem>
                        <SelectItem value="yearly">Yearly - ₹11,999</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Link href="/dashboard/members">
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
                  "Register Member"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
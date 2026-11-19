"use client";

import { useState, useEffect, useMemo } from "react";
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
import { createBrowserClient } from '@supabase/ssr';

const staffSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  role: z.string().min(1, "Please select a role"),
  jobTitle: z.string().min(2, "Job title is required"),
  specialization: z.string().optional(),
  baseSalary: z.string().min(1, "Base salary is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  status: z.string().min(1, "Status is required"),
});

export default function NewStaffPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      role: "trainer",
      jobTitle: "",
      specialization: "",
      baseSalary: "",
      joiningDate: "",
      status: "active",
    },
  });

  useEffect(() => {
    form.setValue("joiningDate", new Date().toISOString().split('T')[0]);
  }, [form]);

  async function onSubmit(values: z.infer<typeof staffSchema>) {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('staff')
        .insert([
          {
            full_name: values.fullName,
            phone: values.phone,
            role: values.role,
            job_title: values.jobTitle,
            specialization: values.specialization || null,
            base_salary: parseFloat(values.baseSalary),
            joining_date: values.joiningDate,
            status: values.status,
          }
        ]);

      if (error) throw error;

      alert("Staff Member Added Successfully!");
      router.push("/dashboard/staff");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Failed to add staff member: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/staff">
          <Button variant="ghost" size="icon" className="text-brand-gray hover:text-white hover:bg-white/5">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Add Staff Member</h1>
          <p className="text-brand-gray text-sm">Register a new trainer, manager, or support staff member.</p>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Full Name</FormLabel>
                  <FormControl>
                    <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="e.g. Arjun Mehta" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Phone Number</FormLabel>
                  <FormControl>
                    <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Staff Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-brand-card border-white/10 text-white">
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="support">Support Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Job Title</FormLabel>
                  <FormControl>
                    <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="e.g. Senior Strength Coach" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="specialization" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Specialization (Optional)</FormLabel>
                  <FormControl>
                    <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="e.g. HIIT, CrossFit, Yoga" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="baseSalary" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Monthly Base Salary (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl text-lg font-bold" placeholder="25000" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="joiningDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Joining Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl [color-scheme:dark]" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-brand-card border-white/10 text-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Link href="/dashboard/staff">
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
                    Saving...
                  </>
                ) : (
                  "Save Staff Member"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
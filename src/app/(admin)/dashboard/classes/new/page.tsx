"use client";

import { useState } from "react";
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

const formSchema = z.object({
  className: z.string().min(2, "Class name is required"),
  instructor: z.string().min(2, "Instructor name is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  capacity: z.string().min(1, "Capacity is required"),
});

export default function NewClassPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { className: "", instructor: "", time: "", duration: "", capacity: "" },
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('classes')
        .insert([
          {
            name: values.className,
            instructor: values.instructor,
            time: values.time,
            duration: values.duration,
            capacity: parseInt(values.capacity),
            status: 'active',
          }
        ]);

      if (error) throw error;

      alert("Class Added Successfully!");
      router.push('/dashboard/classes');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Failed to add class: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/classes">
          <Button variant="ghost" size="icon" className="text-brand-gray hover:text-white hover:bg-white/5">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Class</h1>
          <p className="text-brand-gray text-sm">Schedule a new fitness class and assign an instructor.</p>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="className" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Class Name</FormLabel>
                  <FormControl>
                    <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="e.g. Yoga, HIIT, Crossfit" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="instructor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Instructor Name</FormLabel>
                  <FormControl>
                    <Input className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Schedule Time</FormLabel>
                  <FormControl>
                    <Input type="time" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />

              <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Duration</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-brand-card border-white/10 text-white">
                      <SelectItem value="30 mins">30 mins</SelectItem>
                      <SelectItem value="45 mins">45 mins</SelectItem>
                      <SelectItem value="60 mins">60 mins</SelectItem>
                      <SelectItem value="90 mins">90 mins</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="capacity" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-gray">Max Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl" placeholder="e.g. 20" {...field} />
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Link href="/dashboard/classes">
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
                  "Create Class"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
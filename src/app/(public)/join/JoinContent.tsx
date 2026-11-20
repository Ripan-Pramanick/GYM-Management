"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { CheckCircle2, Loader2 } from "lucide-react";

const PLAN_PRICES: Record<string, number> = {
  monthly: 1499,
  quarterly: 3999,
  "half-yearly": 6999,
  yearly: 11999,
};

const VALID_PLANS = ["monthly", "quarterly", "half-yearly", "yearly"];

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  plan: z.string().min(1, "Please select a membership plan"),
});

export default function JoinContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState<{ name: string; plan: string } | null>(null);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      plan: "",
    },
  });

  useEffect(() => {
    const planParam = searchParams.get("plan")?.toLowerCase() || "";
    if (VALID_PLANS.includes(planParam)) {
      form.setValue("plan", planParam);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const cleanName = values.fullName.trim();
      const cleanEmail = values.email.trim();
      const cleanPhone = values.phone.trim();

      const { data: branchData } = await supabase
        .from("branches")
        .select("id")
        .limit(1)
        .maybeSingle();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: "FitcorePassword123!",
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const userId = authData.user?.id;

      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: cleanName,
          phone: cleanPhone,
          role: "member",
        });
      }

      const memberPayload: Record<string, any> = {
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        plan: values.plan,
        status: "active",
      };

      if (userId) {
        memberPayload.id = userId;
      }
      if (branchData?.id) {
        memberPayload.branch_id = branchData.id;
      }

      const { data: memberRecord, error: memberError } = await supabase
        .from("members")
        .insert([memberPayload])
        .select("id")
        .single();

      if (memberError) {
        throw memberError;
      }

      const planAmount = PLAN_PRICES[values.plan] || 0;
      if (memberRecord?.id && planAmount > 0) {
        await supabase.from("invoices").insert([
          {
            member_id: memberRecord.id,
            amount: planAmount,
            status: "pending",
            due_date: new Date().toISOString(),
          },
        ]);
      }

      setRegisteredInfo({ name: cleanName, plan: values.plan });
      setIsCompleted(true);
      form.reset();
    } catch (error: any) {
      alert("Registration failed: " + (error?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(bgRef.current, { opacity: 0.15, scale: 1 });
        gsap.set([cardRef.current, ".join-text-anim", ".form-item-anim"], {
          opacity: 1,
          y: 0,
          x: 0,
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        bgRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 0.15, duration: 2, ease: "power2.out" }
      )
        .fromTo(cardRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=1.5")
        .fromTo(
          ".join-text-anim",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          "-=0.6"
        )
        .fromTo(
          ".form-item-anim",
          { x: -15, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          "-=0.4"
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#09090b] pt-32 pb-16 px-4 flex items-center justify-center relative overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 opacity-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Join Fitcore Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>

      <div
        ref={cardRef}
        className="max-w-md w-full mx-auto bg-[#09090b]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative z-10 shadow-2xl opacity-0"
      >
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="text-center py-6 space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome to FITCORE!</h2>
            <p className="text-brand-gray text-sm leading-relaxed">
              Thank you, <span className="text-white font-semibold">{registeredInfo?.name}</span>. Your{" "}
              <span className="text-brand-red font-semibold capitalize">
                {registeredInfo?.plan.replace("-", " ")}
              </span>{" "}
              membership profile has been created. Visit our front desk to complete payment and activate your pass.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button className="w-full bg-brand-red hover:bg-red-700 text-white h-12 rounded-xl font-bold">
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="join-text-anim text-3xl font-bold text-white mb-2">Join FITCORE</h1>
              <p className="join-text-anim text-brand-gray text-sm">
                Start your premium fitness journey today.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="form-item-anim">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="form-item-anim">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="form-item-anim">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+91 98765 43210"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="form-item-anim">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Membership Plan</FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(val || "")}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-red/20 transition-all">
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#09090b] border-white/10 text-white">
                            <SelectItem value="monthly">Monthly - ₹1,499</SelectItem>
                            <SelectItem value="quarterly">Quarterly - ₹3,999</SelectItem>
                            <SelectItem value="half-yearly">Half-Yearly - ₹6,999</SelectItem>
                            <SelectItem value="yearly">Yearly - ₹11,999</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="form-item-anim pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-brand-red hover:bg-red-700 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-brand-red/20 transition-all disabled:opacity-70"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dumbbell, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/images/hero-bg.jpg"
          alt="Login Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]" />

      <div className="max-w-md w-full mx-auto bg-[#09090b]/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative z-10 shadow-2xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-gray hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Website
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-brand-red rounded-xl shadow-lg shadow-brand-red/25">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-brand-gray text-sm">Sign in to your FITCORE account.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@fitcore.com"
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-white">Password</FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl pr-11 focus:border-brand-red focus:ring-brand-red/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-brand-red hover:bg-red-700 text-white h-12 rounded-xl font-bold text-lg transition-all mt-4 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
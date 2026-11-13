"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError("")
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]"></div>
      
      <div className="max-w-md w-full mx-auto bg-[#09090b]/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-brand-red rounded-xl">
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
                      placeholder="admin@fitcore.demo"
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-brand-red hover:bg-red-700 text-white h-12 rounded-xl font-bold text-lg transition-all mt-4" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
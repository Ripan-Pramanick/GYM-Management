"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import Image from "next/image" // Added next/image

const formSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  plan: z.string().min(1),
})

export default function JoinPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  
  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      plan: "",
    },
  })

  // === 100% UNTOUCHED SUPABASE LOGIC ===
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { data: branchData } = await supabase.from('branches').select('id').limit(1).single()
      
      if (branchData) {
         const { data: authData } = await supabase.auth.signUp({
           email: values.email,
           password: "FitcorePassword123!",
         })

         if (authData.user) {
           await supabase.from("profiles").insert({
             id: authData.user.id,
             full_name: values.fullName,
             phone: values.phone,
             role: "member"
           })
           
           await supabase.from("members").insert({
             id: authData.user.id,
             branch_id: branchData.id,
             status: "active"
           })
         }
      }
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // === GSAP CINEMATIC ENTRANCE ===
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // 1. Background slow zoom
    tl.fromTo(bgRef.current,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 0.15, duration: 2, ease: "power2.out" }
    )
    // 2. Form card slides up
    .fromTo(cardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=1.5"
    )
    // 3. Header text reveals
    .fromTo(".join-text-anim",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
      "-=0.6"
    )
    // 4. Form fields stagger in
    .fromTo(".form-item-anim",
      { x: -15, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
      "-=0.4"
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-[#09090b] pt-32 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background using Next.js Image Component */}
      <div ref={bgRef} className="absolute inset-0 opacity-0">
        <Image 
          src="/images/hero-bg.jpg" 
          alt="Join Fitcore Background" 
          fill 
          className="object-cover object-center" 
          priority 
        />
      </div>
      
      {/* Animated Form Card */}
      <div 
        ref={cardRef}
        className="max-w-md w-full mx-auto bg-[#09090b]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative z-10 shadow-2xl opacity-0"
      >
        <div className="text-center mb-8">
          <h1 className="join-text-anim text-3xl font-bold text-white mb-2">Join FITCORE</h1>
          <p className="join-text-anim text-brand-gray text-sm">Start your premium fitness journey today.</p>
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
                      <Input className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all" {...field} />
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
                      <Input type="email" className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all" {...field} />
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
                      <Input className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-red/20 transition-all">
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#09090b] border-white/10 text-white">
                        <SelectItem value="monthly">Pro Monthly - ₹2,500</SelectItem>
                        <SelectItem value="quarterly">Elite Quarterly - ₹6,500</SelectItem>
                        <SelectItem value="yearly">Supreme Yearly - ₹20,000</SelectItem>
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
                  className="w-full bg-brand-red hover:bg-red-700 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-brand-red/20 transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Complete Registration"}
                </Button>
              </motion.div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
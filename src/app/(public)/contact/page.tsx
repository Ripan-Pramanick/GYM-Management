"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image"; // Added next/image

// Ensure ScrollTrigger is registered safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values); // Handled by backend in Phase 8
    setIsSubmitted(true);
  }

  useGSAP(() => {
    // Cinematic entrance timeline for the contact section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    // 1. Text reveals
    tl.fromTo(".contact-text-anim", 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
    )
    // 2. Contact info list items stagger in from the left
    .fromTo(".contact-info-item", 
      { x: -20, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out" }, 
      "-=0.4"
    )
    // 3. Icons pop scale
    .fromTo(".contact-icon", 
      { scale: 0 }, 
      { scale: 1, duration: 0.4, stagger: 0.15, ease: "back.out(1.7)" }, 
      "<" // Start precisely with the list items
    )
    // 4. Form card slides up
    .fromTo(".contact-form-card", 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
      "-=0.8"
    );
  }, { scope: containerRef });

  return (
    <>
      <PageHeader 
        title="Contact Us" 
        subtitle="Have questions? We'd love to hear from you." 
        // Updated to use the local image path
        bgImage="/images/hero-bg.jpg"
      />
      
      <section ref={containerRef} className="py-24 bg-brand-dark min-h-screen">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Contact Details */}
          <div>
            <h2 className="contact-text-anim text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Get In <span className="text-brand-red">Touch</span>
            </h2>
            <p className="contact-text-anim text-brand-gray mb-10 text-lg leading-relaxed max-w-md">
              Fill out the form and our team will get back to you within 24 hours. We are here to help you start your journey.
            </p>
            
            <div className="space-y-8">
              <div className="contact-info-item flex items-center gap-5 text-gray-300 hover:text-white transition-colors">
                <div className="contact-icon w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-brand-red h-5 w-5" />
                </div>
                <span className="text-base">123 Fitness Street, Kolkata, India</span>
              </div>
              
              <div className="contact-info-item flex items-center gap-5 text-gray-300 hover:text-white transition-colors">
                <div className="contact-icon w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Phone className="text-brand-red h-5 w-5" />
                </div>
                <span className="text-base">+91 98765 43210</span>
              </div>
              
              <div className="contact-info-item flex items-center gap-5 text-gray-300 hover:text-white transition-colors">
                <div className="contact-icon w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="text-brand-red h-5 w-5" />
                </div>
                <span className="text-base">info@fitcore.com</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="contact-form-card bg-[#09090b] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
            {/* Subtle glow effect behind the card */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-red/5 blur-[100px] pointer-events-none" />

            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-center py-16 flex flex-col items-center justify-center h-full"
              >
                <div className="w-20 h-20 rounded-full bg-brand-red/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-brand-red" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Message Sent!</h3>
                <p className="text-brand-gray text-lg">We will get back to you soon.</p>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-gray">Full Name</FormLabel>
                      <FormControl>
                        <Input className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-gray">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20 transition-all" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-gray">Your Message</FormLabel>
                      <FormControl>
                        <Textarea className="bg-white/5 border-white/10 text-white min-h-[140px] rounded-xl resize-none focus:border-brand-red focus:ring-brand-red/20 transition-all" placeholder="How can we help you?" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )} />
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                    <Button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-brand-red/20 transition-all">
                      Send Message
                    </Button>
                  </motion.div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
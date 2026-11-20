"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/components/animations/useScrollReveal";

const plans = [
  { name: "Monthly", slug: "monthly", price: "1,499", duration: "/month", desc: "Flexible commitment", popular: false },
  { name: "Quarterly", slug: "quarterly", price: "3,999", duration: "₹1,333 / month", desc: "Save 11%", popular: true },
  { name: "Half-Yearly", slug: "half-yearly", price: "6,999", duration: "₹1,166 / month", desc: "Save 22%", popular: false },
  { name: "Yearly", slug: "yearly", price: "11,999", duration: "₹999 / month", desc: "Save 33%", popular: false },
];

export default function Membership() {
  const containerRef = useRef<HTMLElement>(null);
  useScrollReveal(containerRef, ".mem-anim");

  return (
    <section ref={containerRef} className="py-24 bg-brand-dark">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="space-y-4 mem-anim">
            <span className="text-brand-red text-sm font-bold tracking-widest uppercase">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Choose Your <br />
              <span className="text-brand-red">Perfect Plan</span>
            </h2>
            <p className="text-brand-gray max-w-md">Flexible memberships designed for your goals and lifestyle.</p>
          </div>
          <Link href="/membership" className="mem-anim text-white hover:text-brand-red flex items-center text-sm font-semibold transition-colors">
            View All Plans <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className="mem-anim"
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div
                className={`relative p-8 rounded-2xl bg-brand-card flex flex-col h-full border transition-colors ${
                  plan.popular
                    ? "border-brand-red shadow-[0_0_30px_-10px_rgba(255,48,40,0.3)]"
                    : "border-white/5 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full"
                  >
                    Most Popular
                  </motion.div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{plan.name}</h3>
                  <span className="text-xs font-semibold text-brand-red bg-brand-red/10 px-2.5 py-0.5 rounded-full">
                    {plan.desc}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                </div>
                <p className="text-brand-gray text-sm mb-8">{plan.duration}</p>

                <ul className="space-y-4 mb-8 flex-1">
                  {["Full gym access", "Group classes", "Locker facility", "Trainer support"].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-brand-red shrink-0" /> {benefit}
                    </li>
                  ))}
                </ul>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link href={`/join?plan=${plan.slug}`} className="block w-full">
                    <Button
                      className={`w-full rounded-full ${
                        plan.popular
                          ? "bg-brand-red hover:bg-red-700 text-white"
                          : "bg-white/5 hover:bg-white/10 text-white"
                      }`}
                    >
                      Choose Plan
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
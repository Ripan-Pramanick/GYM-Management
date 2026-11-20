"use client";

import { useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const plans = [
  { name: "Monthly", slug: "monthly", price: "1,499", duration: "₹1,499 / month", badge: "Flexible", popular: false },
  { name: "Quarterly", slug: "quarterly", price: "3,999", duration: "₹1,333 / month", badge: "Save 11%", popular: true },
  { name: "Half-Yearly", slug: "half-yearly", price: "6,999", duration: "₹1,166 / month", badge: "Save 22%", popular: false },
  { name: "Yearly", slug: "yearly", price: "11,999", duration: "₹999 / month", badge: "Save 33%", popular: false },
];

export default function MembershipContent() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(".plan-card-anim", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".plan-card-anim",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <>
      <PageHeader
        title="Membership Plans"
        subtitle="Choose the right commitment for your fitness journey."
        bgImage="/images/hero-bg.jpg"
      />

      <section ref={containerRef} className="py-24 bg-[#050505] flex-1">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                className="plan-card-anim h-full"
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div
                  className={`relative p-8 rounded-3xl bg-brand-card flex flex-col h-full border transition-colors duration-300 ${
                    plan.popular
                      ? "border-brand-red shadow-[0_0_30px_-10px_rgba(255,48,40,0.3)]"
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  {plan.popular && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-red text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-brand-red/40"
                    >
                      Most Popular
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium text-xl">{plan.name}</h3>
                    <span className="text-xs font-semibold text-brand-red bg-brand-red/10 px-2.5 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white tracking-tight">₹{plan.price}</span>
                  </div>

                  <p className="text-brand-gray text-sm mb-8 font-medium">{plan.duration}</p>

                  <ul className="space-y-5 mb-10 flex-1">
                    {["Full gym access", "Group classes", "Locker facility", "Trainer support"].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5 text-brand-red" />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Link href={`/join?plan=${plan.slug}`}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        className={`w-full rounded-xl h-12 text-base font-bold transition-all ${
                          plan.popular
                            ? "bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-brand-red/20"
                            : "bg-white/5 hover:bg-white/10 text-white"
                        }`}
                      >
                        Select Plan
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
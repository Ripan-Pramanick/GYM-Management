"use client";

import { useRef } from "react";
import { Dumbbell, Users, ClipboardList, Heart } from "lucide-react";
import { useScrollReveal } from "@/components/animations/useScrollReveal";

const features = [
  { icon: Dumbbell, title: "Modern Equipment", desc: "World-class fitness gear" },
  { icon: Users, title: "Expert Trainers", desc: "Certified & experienced" },
  { icon: ClipboardList, title: "Personalized Plans", desc: "Built for your goals" },
  { icon: Heart, title: "Supportive Community", desc: "Train together, grow together" }
];

export default function FeatureStrip() {
  const containerRef = useRef<HTMLElement>(null);
  useScrollReveal(containerRef, ".feat-item");

  return (
    <section ref={containerRef} className="border-y border-white/5 bg-[#09090b]">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="feat-item flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-brand-card border border-white/5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                <feat.icon className="h-6 w-6 text-brand-red transition-transform group-hover:scale-110" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm transition-colors group-hover:text-brand-red">{feat.title}</h4>
                <p className="text-brand-gray text-xs">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
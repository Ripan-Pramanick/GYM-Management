"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/components/animations/useScrollReveal";
import Image from "next/image";

const trainers = [
  { name: "Arjun Mehta", spec: "Strength & Conditioning", img: "/images/arjun-mehta.jpg" },
  { name: "Neha Kapoor", spec: "Yoga & Wellness", img: "/images/yoga.jpg" },
  { name: "Rohit Sharma", spec: "HIIT & Cardio", img: "/images/gym-facility.jpg" },
  { name: "Priya Singh", spec: "Zumba & Functional", img: "/images/priya-singh.jpg" },
];

export default function Trainers() {
  const containerRef = useRef<HTMLElement>(null);
  useScrollReveal(containerRef, ".trn-anim");

  return (
    <section ref={containerRef} className="py-24 bg-[#050505]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-12 trn-anim">
          <div>
            <span className="text-brand-red text-sm font-bold tracking-widest uppercase mb-4 block">Our Experts</span>
            <h2 className="text-4xl font-bold text-white">Meet Our Experts</h2>
          </div>
          <Link href="/trainers" className="hidden md:flex text-white hover:text-brand-red items-center text-sm font-semibold transition-colors">
            View All Trainers <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer, i) => (
            <Link
              key={i}
              href="/trainers"
              className="trn-anim bg-brand-card rounded-xl overflow-hidden border border-white/5 group transition-colors hover:border-brand-red/30 block"
            >
              <div className="h-64 overflow-hidden relative">
                <Image
                  src={trainer.img}
                  alt={trainer.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-white font-bold text-lg mb-1">{trainer.name}</h3>
                <p className="text-brand-red text-sm">{trainer.spec}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 md:hidden text-center">
          <Link href="/trainers" className="inline-flex text-white hover:text-brand-red items-center text-sm font-semibold transition-colors">
            View All Trainers <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
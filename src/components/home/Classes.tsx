"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/components/animations/useScrollReveal";
import Image from "next/image"; // Added next/image

const classes = [
  { name: "Yoga", desc: "Mind & Flexibility", img: "/images/yoga.jpg" },
  { name: "Zumba", desc: "Fun & Fitness", img: "/images/zumba.jpg" },
  { name: "Strength Training", desc: "Build Muscle", img: "/images/hero-bg.jpg" },
  { name: "HIIT", desc: "Burn Calories", img: "/images/hiit.jpg" },
  { name: "Personal Training", desc: "1-on-1 Guidance", img: "/images/personal-training.jpg" },
];

export default function Classes() {
  const containerRef = useRef<HTMLElement>(null);
  useScrollReveal(containerRef, ".cls-anim");

  return (
    <section ref={containerRef} className="py-24 bg-brand-dark">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-12 cls-anim">
          <div>
            <span className="text-brand-red text-sm font-bold tracking-widest uppercase mb-4 block">Fitness Classes</span>
            <h2 className="text-4xl font-bold text-white">Group Classes For Every Goal</h2>
          </div>
          <Link href="/classes" className="hidden md:flex text-white hover:text-brand-red items-center text-sm font-semibold transition-colors">
            View All Classes <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {classes.map((cls, i) => (
            <div key={i} className="cls-anim group relative rounded-xl overflow-hidden h-72 cursor-pointer">
              {/* Replaced img with Next.js Image */}
              <Image 
                src={cls.img} 
                alt={cls.name} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 transform transition-transform duration-300 group-hover:-translate-y-2">
                <h3 className="text-white font-bold text-lg mb-1">{cls.name}</h3>
                <p className="text-brand-gray text-xs">{cls.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
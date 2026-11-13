"use client";

import { useRef } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image"; // Added next/image

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Updated data array to use local images
const classesData = [
  { slug: "yoga", name: "Yoga", desc: "Mind & Flexibility", img: "/images/yoga.jpg" },
  { slug: "zumba", name: "Zumba", desc: "Fun & Fitness", img: "/images/zumba.jpg" },
  { slug: "strength", name: "Strength Training", desc: "Build Muscle", img: "/images/hero-bg.jpg" },
  { slug: "hiit", name: "HIIT", desc: "Burn Calories", img: "/images/hiit.jpg" },
];

export default function ClassesPage() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Cinematic stagger entrance for class cards
    gsap.fromTo(".class-card-anim",
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, { scope: containerRef });

  return (
    <>
      <PageHeader 
        title="Group Classes" 
        subtitle="Find the perfect class to push your limits and meet your goals."
        bgImage="/images/hero-bg.jpg" 
      />
      
      <section ref={containerRef} className="py-24 bg-brand-dark min-h-screen">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classesData.map((cls) => (
            <motion.div 
              key={cls.slug} 
              className="class-card-anim"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Link href={`/classes/${cls.slug}`} className="group relative rounded-2xl overflow-hidden h-80 block border border-white/5 transition-colors hover:border-brand-red/30 shadow-lg shadow-black/20">
                
                {/* Replaced img tag with Next.js Image component */}
                <Image 
                  src={cls.img} 
                  alt={cls.name} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" 
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />
                
                {/* Content Box */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end transform transition-transform duration-300 group-hover:-translate-y-2">
                  <div>
                    <h3 className="text-white font-bold text-xl md:text-2xl mb-1">{cls.name}</h3>
                    <p className="text-brand-gray text-sm">{cls.desc}</p>
                  </div>
                  
                  {/* Animated Action Button */}
                  <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-lg shadow-brand-red/40">
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
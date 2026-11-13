"use client";

import { useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image"; // Added next/image

// Ensure ScrollTrigger is registered safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Updated trainers array to use local images
const trainers = [
  { name: "Arjun Mehta", spec: "Strength & Conditioning", img: "/images/arjun-mehta.jpg" },
  { name: "Neha Kapoor", spec: "Yoga & Wellness", img: "/images/yoga.jpg" },
  { name: "Rohit Sharma", spec: "HIIT & Cardio", img: "/images/gym-facility.jpg" }, // Using a generic facility image as a placeholder for Rohit
  { name: "Priya Singh", spec: "Zumba & Functional", img: "/images/priya-singh.jpg" },
];

export default function TrainersPage() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Cinematic stagger entrance for trainer cards
    gsap.fromTo(".trainer-card-anim",
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
          toggleActions: "play none none reverse"
        }
      }
    );
  }, { scope: containerRef });

  return (
    <>
      <PageHeader 
        title="Our Experts" 
        subtitle="Meet the professionals dedicated to your fitness." 
        // Updated to use local image
        bgImage="/images/personal-training.jpg"
      />
      
      <section ref={containerRef} className="py-24 bg-[#050505] min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer, i) => (
              <motion.div 
                key={i} 
                className="trainer-card-anim h-full"
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="bg-brand-card rounded-2xl overflow-hidden border border-white/5 group h-full flex flex-col transition-colors hover:border-brand-red/30 shadow-lg shadow-black/20">
                  
                  {/* Image Section with Grayscale transition using Next.js Image */}
                  <div className="h-72 overflow-hidden relative">
                    <Image 
                      src={trainer.img} 
                      alt={trainer.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent opacity-50" />
                  </div>
                  
                  {/* Details Section */}
                  <div className="p-6 text-center flex-1 flex flex-col justify-center">
                    <h3 className="text-white font-bold text-xl mb-1 transition-colors group-hover:text-brand-red">{trainer.name}</h3>
                    <p className="text-brand-gray text-sm mb-4">{trainer.spec}</p>
                    
                    {/* Social Links */}
                    <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-white/5">
                      <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-brand-gray hover:bg-brand-red hover:text-white text-xs font-bold tracking-wider transition-all transform hover:scale-110">
                        IG
                      </a>
                      <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-brand-gray hover:bg-brand-red hover:text-white text-xs font-bold tracking-wider transition-all transform hover:scale-110">
                        X
                      </a>
                    </div>
                  </div>
                  
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
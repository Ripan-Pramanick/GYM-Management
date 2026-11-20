"use client";

import { useRef } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const trainers = [
  {
    name: "Arjun Mehta",
    spec: "Strength & Conditioning",
    experience: "8+ Years Exp.",
    img: "/images/arjun-mehta.jpg",
    alt: "Arjun Mehta - Strength and Conditioning Coach at FITCORE",
  },
  {
    name: "Neha Kapoor",
    spec: "Yoga & Wellness",
    experience: "6+ Years Exp.",
    img: "/images/yoga.jpg",
    alt: "Neha Kapoor - Yoga and Wellness Instructor at FITCORE",
  },
  {
    name: "Rohit Sharma",
    spec: "HIIT & Cardio",
    experience: "7+ Years Exp.",
    img: "/images/gym-facility.jpg",
    alt: "Rohit Sharma - HIIT and Cardio Specialist at FITCORE",
  },
  {
    name: "Priya Singh",
    spec: "Zumba & Functional",
    experience: "5+ Years Exp.",
    img: "/images/priya-singh.jpg",
    alt: "Priya Singh - Zumba and Functional Fitness Trainer at FITCORE",
  },
];

export default function TrainersContent() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(".trainer-card-anim", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".trainer-card-anim",
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
        title="Our Experts"
        subtitle="Meet the professionals dedicated to your fitness."
        bgImage="/images/personal-training.jpg"
      />

      <section ref={containerRef} className="py-24 bg-[#050505] flex-1">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer) => (
              <motion.div
                key={trainer.name}
                className="trainer-card-anim h-full"
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="bg-brand-card rounded-2xl overflow-hidden border border-white/5 group h-full flex flex-col transition-colors hover:border-brand-red/30 shadow-lg shadow-black/20">
                  <div className="h-72 overflow-hidden relative">
                    <Image
                      src={trainer.img}
                      alt={trainer.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent opacity-60" />
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
                      {trainer.experience}
                    </span>
                  </div>

                  <div className="p-6 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1 transition-colors group-hover:text-brand-red">
                        {trainer.name}
                      </h3>
                      <p className="text-brand-gray text-sm mb-4">{trainer.spec}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <Link
                        href="/join"
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:text-brand-red transition-colors"
                      >
                        Train With {trainer.name.split(" ")[0]}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
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
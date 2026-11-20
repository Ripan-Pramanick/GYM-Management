"use client";

import { useRef } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const classesData = [
  { slug: "yoga", name: "Yoga", desc: "Mind & Flexibility", img: "/images/yoga.jpg" },
  { slug: "zumba", name: "Zumba", desc: "Fun & Fitness", img: "/images/zumba.jpg" },
  { slug: "strength", name: "Strength Training", desc: "Build Muscle", img: "/images/hero-bg.jpg" },
  { slug: "hiit", name: "HIIT", desc: "Burn Calories", img: "/images/hiit.jpg" },
];

export default function ClassesContent() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(".class-card-anim", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".class-card-anim",
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
        title="Group Classes"
        subtitle="Find the perfect class to push your limits and meet your goals."
        bgImage="/images/hero-bg.jpg"
      />

      <section ref={containerRef} className="py-24 bg-brand-dark flex-1">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {classesData.map((cls) => (
            <motion.div
              key={cls.slug}
              className="class-card-anim"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Link
                href={`/classes/${cls.slug}`}
                className="group relative rounded-2xl overflow-hidden h-80 block border border-white/5 transition-colors hover:border-brand-red/30 shadow-lg shadow-black/20"
              >
                <Image
                  src={cls.img}
                  alt={cls.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end transform transition-transform duration-300 group-hover:-translate-y-2">
                  <div>
                    <h3 className="text-white font-bold text-xl md:text-2xl mb-1">{cls.name}</h3>
                    <p className="text-brand-gray text-sm">{cls.desc}</p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-lg shadow-brand-red/40">
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
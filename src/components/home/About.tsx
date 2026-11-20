"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { value: "5+", label: "Years of Experience" },
  { value: "2K+", label: "Happy Members" },
  { value: "15+", label: "Expert Trainers" },
  { value: "10+", label: "Fitness Programs" },
];

export default function About() {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(".about-anim", { y: 0, opacity: 1 });
        if (imageRef.current) {
          gsap.set(imageRef.current, {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
          });
        }
        return;
      }

      gsap.fromTo(
        ".about-anim",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        imageRef.current,
        { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", scale: 1.1 },
        {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          scale: 1,
          duration: 1.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 bg-[#050505]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div ref={imageRef} className="relative rounded-2xl overflow-hidden aspect-[4/5] lg:aspect-square">
            <Image
              src="/images/about-header.jpg"
              alt="FITCORE Gym Facility"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent" />
            <div className="absolute bottom-8 left-8 bg-brand-card/90 backdrop-blur border border-white/10 p-6 rounded-xl">
              <div className="text-brand-red font-bold text-3xl mb-1">25K+</div>
              <div className="text-white text-sm">People Trained</div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <span className="about-anim text-brand-red text-sm font-bold tracking-widest uppercase mb-4 block">
                About Fitcore
              </span>
              <h2 className="about-anim text-4xl md:text-5xl font-bold text-white mb-6">
                More Than a Gym.
                <br />A Stronger <span className="text-brand-red">Community.</span>
              </h2>
              <p className="about-anim text-brand-gray leading-relaxed text-lg">
                At FITCORE, we believe fitness is a lifestyle. Our mission is to help you build a stronger, healthier and happier you with the right guidance, environment and community.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="about-anim">
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-brand-gray">{stat.label}</div>
                </div>
              ))}
            </div>

            <Link href="/about" className="about-anim inline-block">
              <Button className="bg-brand-red hover:bg-red-700 text-white rounded-full px-8 transition-transform hover:scale-105">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
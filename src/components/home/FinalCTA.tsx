"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(bgRef.current, {
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.fromTo(
        ".cta-anim",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 md:py-32 relative overflow-hidden bg-[#09090b]">
      <div ref={bgRef} className="absolute inset-0 origin-center">
        <Image
          src="/images/hero-bg.webp"
          alt="CTA Background"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-black/80 to-[#09090b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-red/20 via-transparent to-transparent" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 text-center flex flex-col items-center">
        <span className="cta-anim text-brand-red text-sm font-bold tracking-widest uppercase mb-4 block">
          Ready To Transform?
        </span>
        <h2 className="cta-anim text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Your Fitness Journey <br className="hidden sm:block" />
          <span className="text-brand-red">Starts Today.</span>
        </h2>
        <p className="cta-anim text-brand-gray text-base md:text-lg max-w-2xl mx-auto mb-10">
          Take the first step towards a stronger, healthier and more confident you. Join FITCORE and train with the best.
        </p>

        <Link href="/join" className="cta-anim">
          <Button className="bg-brand-red hover:bg-red-700 text-white rounded-full px-10 py-6 text-lg font-bold transition-all shadow-lg shadow-brand-red/20 group">
            Join FITCORE
            <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">&rarr;</span>
          </Button>
        </Link>
      </div>
    </section>
  );
}
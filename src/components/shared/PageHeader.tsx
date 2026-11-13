"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  bgImage: string;
}

export function PageHeader({ title, subtitle, bgImage }: PageHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Background image slowly zooms from scale 1.10 to 1
    tl.fromTo(
      bgRef.current,
      { scale: 1.10, opacity: 0 },
      { scale: 1, opacity: 0.6, duration: 2, ease: "power2.out" }
    )
    // 2. Heading reveals with an upward fade
    .fromTo(
      ".header-title",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=1.5"
    )
    // 3. Subtitle fades upward
    .fromTo(
      ".header-subtitle",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      "-=1"
    );

    // Subtle scroll-based parallax for the background
    gsap.to(bgRef.current, {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Dark overlay transition */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
      
      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 relative z-20 text-center max-w-3xl mt-16">
        <h1 className="header-title text-4xl md:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight mb-4">
          {title}
        </h1>
        <p className="header-subtitle text-brand-gray text-lg md:text-xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
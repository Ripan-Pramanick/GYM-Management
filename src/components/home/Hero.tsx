"use client";

import { useRef, lazy, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, User } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";



export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isTouch, setIsTouch] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);


  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

 
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0 });

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".hero-badge", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2 })
      .fromTo(".hero-word", { y: 40, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.1 }, "-=0.6")
      .fromTo(".hero-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.8")
      .fromTo(".hero-btn", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 }, "-=0.6")
      .fromTo(".hero-avatar", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.5)" }, "-=0.4")
      .fromTo(".hero-stats-text", { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.5");


    if (!reduceMotion && bgRef.current) {
      gsap.fromTo(
        bgRef.current,
        { scale: 1.05 },
        { scale: 1.12, duration: 20, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
    }
  }, { scope: containerRef, dependencies: [reduceMotion] });


  useEffect(() => {
    if (isTouch || reduceMotion || !bgRef.current) return;

    const bg = bgRef.current;
    
   
    const xTo = gsap.quickTo(bg, "x", { duration: 1.5, ease: "power3.out" });
    const yTo = gsap.quickTo(bg, "y", { duration: 1.5, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16; // Restrained 16px max shift
      const y = (e.clientY / innerHeight - 0.5) * 16;
      xTo(-x);
      yTo(-y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isTouch, reduceMotion]);

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center pt-20 overflow-hidden bg-brand-dark">
      
 
      <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform">
        
      
        
     
        <video 
          ref={videoRef}
          src="/video/Man_lifting_dumbbell_in_gym_43d88871_1080p.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-10 w-full h-full object-cover opacity-90 transition-opacity duration-1000 mix-blend-screen"
        />
      </div>

      {/* Red ambient sweep lighting */}
      <div className="absolute inset-0 z-[1] bg-brand-red/5 mix-blend-overlay pointer-events-none" />
     

      {/* Overlay gradient to ensure text readability */}
      <div className="absolute inset-0 z-[3] bg-gradient-to-r from-black/95 via-black/70 to-transparent pointer-events-none" />

      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-8 relative z-[4] pointer-events-none">
        <div className="max-w-3xl space-y-6 pointer-events-auto">
          
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 rounded-full bg-brand-red shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
            <span className="text-xs font-medium uppercase tracking-wider text-brand-gray">Discipline Builds Freedom</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight uppercase tracking-tight" style={{ perspective: "1000px" }}>
            <span className="hero-word inline-block">Stronger</span> <br />
            <span className="hero-word inline-block text-brand-red drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">Every Day</span> <br />
            <span className="hero-word inline-block">Starts Here</span>
          </h1>

          <p className="hero-desc text-brand-gray text-lg md:text-xl max-w-xl leading-relaxed">
            Premium training, world-class equipment and a supportive community to help you become a healthier, stronger and more confident you.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <div className="hero-btn">
              <Link href="/join">
                <Button className="bg-brand-red hover:bg-red-700 text-white rounded-full px-8 py-6 text-base font-semibold transition-transform hover:scale-105">
                  Join Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="hero-btn">
              <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base font-semibold transition-transform hover:scale-105">
                <Play className="mr-2 h-5 w-5 text-brand-red fill-brand-red" /> Watch Our Story
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-8">
            <div className="flex -space-x-4">
              {/* Replaced external pravatar links with generic highly-styled user avatars */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="hero-avatar w-10 h-10 rounded-full border-2 border-brand-dark bg-brand-red/10 backdrop-blur-sm flex items-center justify-center shadow-lg relative z-10">
                  <User className="w-5 h-5 text-white/70" />
                </div>
              ))}
            </div>
            <div className="hero-stats-text flex flex-col">
              <span className="text-white font-bold text-sm">2K+ Members</span>
              <span className="text-brand-gray text-xs">Already transformed their lives</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
"use client";

import { useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Check } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image"; // Added next/image

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function AboutPage() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // === TEXT ANIMATION TIMELINE ===
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".story-text-container",
        start: "top 80%",
        toggleActions: "play none none reverse",
      }
    });

    textTl.fromTo(".story-eyebrow", 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    )
    .fromTo(".story-heading", 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 
      "-=0.4"
    )
    .fromTo(".story-desc", 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 
      "-=0.5"
    )
    .fromTo(".story-list-item", 
      { x: -20, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 
      "-=0.4"
    )
    .fromTo(".story-check-icon", 
      { scale: 0 }, 
      { scale: 1, duration: 0.4, stagger: 0.15, ease: "back.out(1.7)" }, 
      "<" 
    );

    // === IMAGE CLIP-PATH & PARALLAX ANIMATIONS ===
    const image1 = ".story-img-1";
    const image2 = ".story-img-2";

    gsap.fromTo(image1,
      { clipPath: "inset(0 100% 0 0)", scale: 1.1 },
      { clipPath: "inset(0 0% 0 0)", scale: 1, duration: 1.5, ease: "power3.inOut",
        scrollTrigger: {
          trigger: image1,
          start: "top 85%",
        }
      }
    );

    gsap.fromTo(image2,
      { clipPath: "inset(100% 0 0 0)", scale: 1.1 },
      { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 1.5, ease: "power3.inOut",
        scrollTrigger: {
          trigger: image2,
          start: "top 85%",
        }
      }
    );

    gsap.to(image1, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: ".story-images-container",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

    gsap.to(image2, {
      yPercent: -25,
      ease: "none",
      scrollTrigger: {
        trigger: ".story-images-container",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

  }, { scope: containerRef });

  return (
    <>
      <PageHeader 
        title="About Fitcore" 
        subtitle="We are more than just a gym. We are a community dedicated to building stronger, healthier lives."
        bgImage="/images/about-header.jpg"
      />
      
      <section ref={containerRef} className="py-24 bg-brand-dark min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="story-text-container space-y-6">
              <span className="story-eyebrow text-brand-red font-bold tracking-widest uppercase text-sm block">Our Story</span>
              <h2 className="story-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Built on Discipline, <br className="hidden sm:block" />
                Driven by <span className="text-brand-red">Results.</span>
              </h2>
              <p className="story-desc text-brand-gray leading-relaxed text-lg">
                Founded with a vision to redefine fitness, FITCORE provides a premium environment where discipline meets top-tier coaching. We don't just offer equipment; we offer a complete ecosystem designed to push your limits and achieve sustainable health.
              </p>
              
              <ul className="space-y-4 pt-6">
                {[
                  "State-of-the-art facility spanning 10,000 sq ft.", 
                  "Certified elite trainers with proven track records.", 
                  "Holistic approach combining training, nutrition, and recovery."
                ].map((item, i) => (
                  <li key={i} className="story-list-item flex items-start gap-3">
                    <div className="story-check-icon shrink-0 mt-0.5">
                      <Check className="text-brand-red h-5 w-5" />
                    </div>
                    <span className="text-gray-300 text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="story-images-container grid grid-cols-2 gap-4 md:gap-6 relative">
              {/* Added relative and height to parent container for Next.js Image fill */}
              <div className="story-img-1 relative overflow-hidden rounded-2xl mt-6 group h-64 md:h-80 w-full">
                <Image 
                  src="/images/gym-facility.jpg" 
                  alt="Fitcore Gym Facility" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="story-img-2 relative overflow-hidden rounded-2xl mt-12 md:mt-20 group h-64 md:h-80 w-full">
                <Image 
                  src="/images/personal-training.jpg" 
                  alt="Personal Training at Fitcore" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
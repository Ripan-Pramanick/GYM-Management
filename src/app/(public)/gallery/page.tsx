"use client";

import { useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Maximize2 } from "lucide-react";
import Image from "next/image"; // Added next/image

// Ensure ScrollTrigger is registered safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Updated to use the local images you downloaded
const galleryImages = [
  "/images/hero-bg.jpg",
  "/images/gym-facility.jpg",
  "/images/personal-training.jpg",
  "/images/zumba.jpg",
  "/images/yoga.jpg",
  "/images/hiit.jpg",
];

export default function GalleryPage() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Cinematic stagger entrance for gallery items
    gsap.fromTo(".gallery-item",
      { y: 40, opacity: 0, scale: 0.95 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        duration: 0.8, 
        stagger: 0.1, 
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
        title="Gallery" 
        subtitle="A glimpse into our state-of-the-art facility." 
        // Updated to use the local image path
        bgImage="/images/about-header.jpg"
      />
      
      <section ref={containerRef} className="py-24 bg-brand-dark min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((imgSrc, index) => (
              <motion.div 
                key={index} 
                className="gallery-item relative aspect-square rounded-2xl overflow-hidden bg-[#09090b] cursor-pointer group shadow-lg shadow-black/40"
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                {/* Replaced img tag with Next.js Image component */}
                <Image 
                  src={imgSrc} 
                  alt={`Fitcore Gallery Image ${index + 1}`} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                />
                
                {/* Premium Red Overlay on Hover */}
                <div className="absolute inset-0 bg-brand-red/0 group-hover:bg-brand-red/10 transition-colors duration-500 z-10" />
                
                {/* Centered Action Icon with Blur Effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 z-20">
                  <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <Maximize2 className="w-6 h-6 text-white" />
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
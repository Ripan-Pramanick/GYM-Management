"use client";

import { useRef, useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const galleryItems = [
  { src: "/images/hero-bg.jpg", title: "Strength & Free Weights Zone", alt: "FITCORE Strength Training and Free Weights Area" },
  { src: "/images/gym-facility.jpg", title: "Modern Workout Floor", alt: "FITCORE 10,000 Sq Ft Modern Gym Facility" },
  { src: "/images/personal-training.jpg", title: "1-on-1 Personal Training", alt: "Certified Personal Trainer Coaching Session at FITCORE" },
  { src: "/images/zumba.jpg", title: "High-Energy Zumba Studio", alt: "Group Zumba Fitness Class at FITCORE" },
  { src: "/images/yoga.jpg", title: "Mindful Yoga & Mobility", alt: "Yoga and Flexibility Training Studio at FITCORE" },
  { src: "/images/hiit.jpg", title: "HIIT & Conditioning Turf", alt: "High Intensity Interval Training Zone at FITCORE" },
];

export default function GalleryContent() {
  const containerRef = useRef<HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : null));
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(".gallery-item", { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.fromTo(
        ".gallery-item",
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
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : null));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null
    );
  };

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="A glimpse into our state-of-the-art facility."
        bgImage="/images/about-header.jpg"
      />

      <section ref={containerRef} className="py-24 bg-brand-dark flex-1">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => (
              <motion.div
                key={item.src}
                onClick={() => setSelectedIndex(index)}
                className="gallery-item relative aspect-square rounded-2xl overflow-hidden bg-[#09090b] cursor-pointer group shadow-lg shadow-black/40 border border-white/5 hover:border-brand-red/30 transition-colors"
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity z-10" />
                <div className="absolute inset-0 bg-brand-red/0 group-hover:bg-brand-red/10 transition-colors duration-500 z-10" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 z-20">
                  <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-4 left-5 right-5 z-20">
                  <p className="text-white font-semibold text-sm md:text-base">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close lightbox"
              className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-brand-red text-white flex items-center justify-center transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-4 md:left-8 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-brand-red text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#09090b] shadow-2xl"
            >
              <Image
                src={galleryItems[selectedIndex].src}
                alt={galleryItems[selectedIndex].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-contain"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-5 flex justify-between items-center">
                <span className="text-white font-semibold text-base md:text-lg">
                  {galleryItems[selectedIndex].title}
                </span>
                <span className="text-brand-gray text-sm">
                  {selectedIndex + 1} / {galleryItems.length}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-4 md:right-8 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-brand-red text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
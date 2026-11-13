import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RefObject } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function useScrollReveal(triggerRef: RefObject<HTMLElement | null>, targetSelector: string) {
  useGSAP(() => {
    gsap.fromTo(
      targetSelector,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: triggerRef });
}
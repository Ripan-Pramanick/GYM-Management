import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us | 10,000 Sq Ft Premium Gym in Kolkata",
  description:
    "Discover FITCORE's story. A 10,000 sq ft state-of-the-art fitness facility in Kolkata with certified elite trainers, modern equipment, and holistic coaching.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
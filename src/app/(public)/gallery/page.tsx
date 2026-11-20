import type { Metadata } from "next";
import GalleryContent from "./GalleryContent";

export const metadata: Metadata = {
  title: "Gym Gallery | Inside FITCORE Fitness Facility in Kolkata",
  description:
    "Take a visual tour of FITCORE Kolkata. Explore our strength training zones, cardio equipment, personal training studios, Yoga, and Zumba spaces.",
  alternates: {
    canonical: "/gallery",
  },
};

export default function GalleryPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitcore.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "FITCORE Gym Facility Gallery",
    url: `${siteUrl}/gallery`,
    image: [
      `${siteUrl}/images/hero-bg.jpg`,
      `${siteUrl}/images/gym-facility.jpg`,
      `${siteUrl}/images/personal-training.jpg`,
      `${siteUrl}/images/zumba.jpg`,
      `${siteUrl}/images/yoga.jpg`,
      `${siteUrl}/images/hiit.jpg`,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GalleryContent />
    </>
  );
}
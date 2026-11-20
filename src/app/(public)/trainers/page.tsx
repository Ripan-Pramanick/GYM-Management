import type { Metadata } from "next";
import TrainersContent from "./TrainersContent";

export const metadata: Metadata = {
  title: "Certified Gym Trainers & Fitness Experts | FITCORE Kolkata",
  description:
    "Meet FITCORE's certified fitness trainers in Kolkata specializing in Strength & Conditioning, Yoga, HIIT, Zumba, and 1-on-1 Personal Training.",
  alternates: {
    canonical: "/trainers",
  },
};

export default function TrainersPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitcore.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FITCORE Certified Fitness Trainers",
    url: `${siteUrl}/trainers`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Person",
          name: "Arjun Mehta",
          jobTitle: "Strength & Conditioning Coach",
          worksFor: { "@type": "HealthClub", name: "FITCORE" },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Person",
          name: "Neha Kapoor",
          jobTitle: "Yoga & Wellness Instructor",
          worksFor: { "@type": "HealthClub", name: "FITCORE" },
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "Person",
          name: "Rohit Sharma",
          jobTitle: "HIIT & Cardio Specialist",
          worksFor: { "@type": "HealthClub", name: "FITCORE" },
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "Person",
          name: "Priya Singh",
          jobTitle: "Zumba & Functional Trainer",
          worksFor: { "@type": "HealthClub", name: "FITCORE" },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrainersContent />
    </>
  );
}
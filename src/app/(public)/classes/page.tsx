import type { Metadata } from "next";
import ClassesContent from "./ClassesContent";

export const metadata: Metadata = {
  title: "Group Fitness Classes | Yoga, Zumba, Strength & HIIT",
  description:
    "Explore energetic group fitness classes at FITCORE Kolkata including Yoga, Zumba, Strength Training, and high-intensity HIIT sessions led by certified trainers.",
  alternates: {
    canonical: "/classes",
  },
};

export default function ClassesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitcore.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FITCORE Group Fitness Classes",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Yoga",
        url: `${siteUrl}/classes/yoga`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Zumba",
        url: `${siteUrl}/classes/zumba`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Strength Training",
        url: `${siteUrl}/classes/strength`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "HIIT",
        url: `${siteUrl}/classes/hiit`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClassesContent />
    </>
  );
}
import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us | Get in Touch with FITCORE Kolkata",
  description:
    "Have questions about gym memberships, personal training, or class schedules? Contact FITCORE at 123 Fitness Street, Kolkata or call +91 98765 43210.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitcore.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact FITCORE",
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "HealthClub",
      name: "FITCORE",
      telephone: "+91-98765-43210",
      email: "info@fitcore.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "123 Fitness Street",
        addressLocality: "Kolkata",
        addressRegion: "West Bengal",
        addressCountry: "IN",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactContent />
    </>
  );
}
import type { Metadata } from "next";
import MembershipContent from "./MembershipContent";

export const metadata: Metadata = {
  title: "Gym Membership Plans & Pricing | FITCORE Kolkata",
  description:
    "Compare flexible gym membership plans at FITCORE Kolkata. Monthly (₹1,499), Quarterly (₹3,999), Half-Yearly (₹6,999), and Yearly (₹11,999) packages with full gym and group class access.",
  alternates: {
    canonical: "/membership",
  },
};

export default function MembershipPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitcore.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "FITCORE Gym Membership Plans",
    url: `${siteUrl}/membership`,
    itemListElement: [
      {
        "@type": "Offer",
        name: "Monthly Membership",
        price: "1499",
        priceCurrency: "INR",
        url: `${siteUrl}/join?plan=monthly`,
      },
      {
        "@type": "Offer",
        name: "Quarterly Membership",
        price: "3999",
        priceCurrency: "INR",
        url: `${siteUrl}/join?plan=quarterly`,
      },
      {
        "@type": "Offer",
        name: "Half-Yearly Membership",
        price: "6999",
        priceCurrency: "INR",
        url: `${siteUrl}/join?plan=half-yearly`,
      },
      {
        "@type": "Offer",
        name: "Yearly Membership",
        price: "11999",
        priceCurrency: "INR",
        url: `${siteUrl}/join?plan=yearly`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MembershipContent />
    </>
  );
}
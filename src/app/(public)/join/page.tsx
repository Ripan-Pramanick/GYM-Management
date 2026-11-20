import type { Metadata } from "next";
import { Suspense } from "react";
import JoinContent from "./JoinContent";

export const metadata: Metadata = {
  title: "Join FITCORE | Online Gym Membership Registration",
  description:
    "Sign up online for FITCORE gym in Kolkata. Choose from Monthly, Quarterly, Half-Yearly, or Yearly fitness membership plans starting at ₹1,499.",
  alternates: {
    canonical: "/join",
  },
};

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <JoinContent />
    </Suspense>
  );
}
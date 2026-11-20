export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Flame, Users, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClassItem {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  trainer: string;
  duration: string;
  intensity: string;
  schedule: string;
  calories: string;
  benefits: string[];
}

const CLASSES_DATA: Record<string, ClassItem> = {
  yoga: {
    slug: "yoga",
    name: "Yoga",
    tagline: "Mind, Mobility & Core Balance",
    description:
      "Restore flexibility, improve posture, and build deep core stability through guided Hatha and Vinyasa flows led by certified wellness instructors.",
    image: "/images/yoga.jpg",
    trainer: "Neha Kapoor",
    duration: "60 Mins",
    intensity: "Low to Moderate",
    schedule: "Mon, Wed, Fri • 7:00 AM & 6:00 PM",
    calories: "250 - 350 kcal",
    benefits: [
      "Enhances joint mobility and full-body flexibility",
      "Reduces stress and improves breathing control",
      "Strengthens deep stabilizer and core muscles",
      "Suitable for beginners and experienced practitioners",
    ],
  },
  zumba: {
    slug: "zumba",
    name: "Zumba",
    tagline: "High-Energy Dance & Cardio Fitness",
    description:
      "Turn your cardio workout into an energetic dance party. Burn calories fast with Latin and Bollywood rhythm routines designed for maximum fun and endurance.",
    image: "/images/zumba.jpg",
    trainer: "Priya Singh",
    duration: "45 Mins",
    intensity: "Moderate to High",
    schedule: "Tue, Thu, Sat • 8:00 AM & 7:00 PM",
    calories: "450 - 600 kcal",
    benefits: [
      "Boosts cardiovascular endurance and stamina",
      "Improves coordination, rhythm, and agility",
      "High calorie burn in a fun group environment",
      "No prior dance experience required",
    ],
  },
  strength: {
    slug: "strength",
    name: "Strength Training",
    tagline: "Build Lean Muscle & Raw Power",
    description:
      "Master compound lifts, progressive overload, and hypertrophy training using Olympic barbells, dumbbells, and calibrated strength machines under expert supervision.",
    image: "/images/hero-bg.jpg",
    trainer: "Arjun Mehta",
    duration: "60 Mins",
    intensity: "High",
    schedule: "Mon to Sat • 6:30 AM, 5:30 PM & 8:00 PM",
    calories: "400 - 550 kcal",
    benefits: [
      "Increases lean muscle mass and functional strength",
      "Accelerates resting metabolic rate for fat loss",
      "Improves bone density and joint resilience",
      "Personalized form correction from certified coaches",
    ],
  },
  hiit: {
    slug: "hiit",
    name: "HIIT",
    tagline: "Maximum Burn & Athletic Conditioning",
    description:
      "Push your metabolic limits with short, explosive bursts of high-intensity functional intervals paired with active recovery to torch fat long after your session ends.",
    image: "/images/hiit.jpg",
    trainer: "Rohit Sharma",
    duration: "45 Mins",
    intensity: "Very High",
    schedule: "Tue, Thu, Sat • 7:00 AM & 6:30 PM",
    calories: "550 - 750 kcal",
    benefits: [
      "Triggers afterburn effect (EPOC) for 24-hour fat loss",
      "Improves speed, power, and athletic conditioning",
      "Time-efficient 45-minute full-body workout",
      "Scalable intensity levels for all fitness stages",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.toLowerCase() || "";
  const classInfo = CLASSES_DATA[slug];

  if (!classInfo) {
    return {
      title: "Class Not Found",
    };
  }

  return {
    title: `${classInfo.name} Classes in Kolkata | ${classInfo.tagline}`,
    description: classInfo.description,
    alternates: {
      canonical: `/classes/${classInfo.slug}`,
    },
    openGraph: {
      title: `${classInfo.name} at FITCORE Kolkata`,
      description: classInfo.description,
      images: [
        {
          url: classInfo.image,
          width: 1200,
          height: 630,
          alt: `${classInfo.name} Class at FITCORE`,
        },
      ],
    },
  };
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.toLowerCase() || "";
  const classInfo = CLASSES_DATA[slug];

  if (!classInfo) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitcore.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${classInfo.name} Group Fitness Class`,
    description: classInfo.description,
    url: `${siteUrl}/classes/${classInfo.slug}`,
    provider: {
      "@type": "HealthClub",
      name: "FITCORE",
      sameAs: siteUrl,
    },
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-28 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl space-y-12">
        <div>
          <Link
            href="/classes"
            className="inline-flex items-center gap-2 text-brand-gray hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Classes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 sm:h-96 lg:h-[460px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={classInfo.image}
              alt={`${classInfo.name} Class at FITCORE`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <span className="bg-brand-red text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                {classInfo.intensity} Intensity
              </span>
              <span className="bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/10">
                Coach: {classInfo.trainer}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-brand-red text-sm font-bold tracking-widest uppercase block mb-2">
                {classInfo.tagline}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                {classInfo.name}
              </h1>
              <p className="text-brand-gray text-base md:text-lg leading-relaxed">
                {classInfo.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-brand-card border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-brand-red" />
                </div>
                <div>
                  <p className="text-xs text-brand-gray">Duration</p>
                  <p className="text-sm font-bold text-white">{classInfo.duration}</p>
                </div>
              </div>

              <div className="bg-brand-card border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0">
                  <Flame className="h-5 w-5 text-brand-red" />
                </div>
                <div>
                  <p className="text-xs text-brand-gray">Avg. Burn</p>
                  <p className="text-sm font-bold text-white">{classInfo.calories}</p>
                </div>
              </div>

              <div className="bg-brand-card border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 col-span-2">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-brand-red" />
                </div>
                <div>
                  <p className="text-xs text-brand-gray">Weekly Schedule</p>
                  <p className="text-sm font-bold text-white">{classInfo.schedule}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-white font-semibold text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-red" />
                Key Session Benefits
              </h2>
              <ul className="space-y-2.5">
                {classInfo.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/join">
                <Button className="bg-brand-red hover:bg-red-700 text-white rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-brand-red/20">
                  Join This Class <ChevronRight className="ml-1.5 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/membership">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/15 text-white hover:bg-white/5 rounded-full px-7 h-12 text-base font-semibold"
                >
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
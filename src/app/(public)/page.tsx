import Hero from "@/components/home/Hero";
import FeatureStrip from "@/components/home/FeatureStrip";
import Membership from "@/components/home/Membership";
import About from "@/components/home/About";
import Classes from "@/components/home/Classes";
import Trainers from "@/components/home/Trainers";
import FinalCTA from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeatureStrip />
      <Membership />
      <About />
      <Classes />
      <Trainers />
      <FinalCTA />
    </div>
  );
}
import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import CustomerTypeSelector from "@/components/sections/CustomerTypeSelector";
import HowItWorks from "@/components/sections/HowItWorks";
import Benefits from "@/components/sections/Benefits";
import SavingsCTA from "@/components/sections/SavingsCTA";
import FAQSection from "@/components/sections/FAQSection";
import FinalCTA from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <CustomerTypeSelector />
      <HowItWorks />
      <Benefits />
      <SavingsCTA />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

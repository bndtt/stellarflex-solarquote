"use client";

import { MapPin, Zap, Settings, Wrench } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";
import AnimatedHighlight from "@/components/ui/AnimatedHighlight";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Enter your address & energy bill",
    description: "Tell us where you are and how much you currently spend on electricity.",
  },
  {
    number: "02",
    icon: Zap,
    title: "Get an instant AI-powered quote",
    description: "Our system analyzes your roof, sun exposure, and energy usage in seconds.",
  },
  {
    number: "03",
    icon: Settings,
    title: "Customize your solar plan",
    description: "Choose your panels, batteries, and financing option to fit your budget.",
  },
  {
    number: "04",
    icon: Wrench,
    title: "Get approved & we install",
    description: "We manage permits, installation, and utility connection — you just enjoy the savings.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary uppercase tracking-tight mb-4">
            How It <AnimatedHighlight color="rgba(59,130,246,0.12)">Works</AnimatedHighlight>
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Going solar is easier than you think. Four simple steps to clean, affordable energy.
          </p>
        </FadeIn>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-[72px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500/10 via-cyan-500/30 to-blue-500/10 z-0" />

          <StaggerContainer className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <StaggerItem key={step.number}>
                <TiltCard tiltMax={10} className="rounded-2xl h-full">
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-neutral-200/60 hover-glow text-center h-full">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-6">
                      <step.icon className="h-7 w-7 text-blue-500" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-primary to-primary-light text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-3">{step.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

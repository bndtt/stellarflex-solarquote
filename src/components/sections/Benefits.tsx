"use client";

import Link from "next/link";
import { TrendingDown, Brain, Landmark, DollarSign, Award, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { FadeIn, StaggerContainer, StaggerItem, motion } from "@/components/ui/Motion";
import AnimatedHighlight from "@/components/ui/AnimatedHighlight";

const benefits = [
  {
    icon: TrendingDown,
    title: "Up to 30% lower pricing",
    description: "Competitive rates through partnerships with top-tier manufacturers.",
  },
  {
    icon: Brain,
    title: "AI-powered accuracy",
    description: "Advanced algorithms ensure your quote is precise and optimized.",
  },
  {
    icon: Landmark,
    title: "Ontario incentive expertise",
    description: "We help you maximize Net Metering, Greener Homes, and more.",
  },
  {
    icon: DollarSign,
    title: "$0 upfront options",
    description: "Flexible financing so you can start saving from day one.",
  },
  {
    icon: Award,
    title: "Premium Canadian equipment",
    description: "Panels and inverters tested for Ontario's climate and weather.",
  },
  {
    icon: ShieldCheck,
    title: "25-year warranty",
    description: "Long-term peace of mind with industry-leading warranty coverage.",
  },
];

export default function Benefits() {
  return (
    <section className="py-20 lg:py-32 bg-white relative">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          {/* Left side — Heading + CTA (40%) */}
          <FadeIn className="lg:w-5/12 lg:sticky lg:top-32 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary uppercase tracking-tight leading-tight mb-5">
              Why Choose
              <br />
              <AnimatedHighlight color="rgba(6,182,212,0.15)">
                <span className="gradient-text">StellarFlex</span>
              </AnimatedHighlight>?
            </h2>
            <p className="text-lg text-neutral-500 max-w-md mx-auto lg:mx-0 mb-8">
              We combine cutting-edge technology with local expertise to deliver the best
              solar experience in Ontario.
            </p>
            {/* Accent line */}
            <div className="hidden lg:block w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-8" />
            <div className="hidden lg:block">
              <Link href="/get-quote">
                <Button size="lg" className="btn-shine">Get Your Free Quote</Button>
              </Link>
            </div>
          </FadeIn>

          {/* Right side — Benefit grid (60%) */}
          <StaggerContainer className="lg:w-7/12 grid sm:grid-cols-2 gap-5 w-full">
            {benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-neutral-50/80 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/60 hover-glow glow-border h-full"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500/15 to-cyan-500/5 rounded-lg flex items-center justify-center mb-4 ring-1 ring-blue-500/10">
                    <benefit.icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-base font-semibold text-primary mb-1.5">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Mobile CTA */}
          <div className="lg:hidden w-full text-center">
            <Link href="/get-quote">
              <Button size="lg" className="btn-shine">Get Your Free Quote</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

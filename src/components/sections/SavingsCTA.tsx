"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/Motion";
import AnimatedHighlight from "@/components/ui/AnimatedHighlight";
import SectionDivider from "@/components/ui/SectionDivider";

export default function SavingsCTA() {
  return (
    <>
      <SectionDivider variant="curve" color="fill-primary" flip />
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary-dark via-primary to-primary-light relative overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-20 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See how much you can <AnimatedHighlight color="rgba(103,232,249,0.2)"><span className="gradient-text-light">save with solar</span></AnimatedHighlight>
            </h2>
            <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
              Ontario electricity rates are rising every year. Lock in lower energy costs
              with a solar system designed for your property.
            </p>
            <Link href="/get-quote">
              <Button size="lg" className="btn-shine">
                Get Your Free Quote
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

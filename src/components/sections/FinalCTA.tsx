"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import MagneticWrap from "@/components/ui/MagneticWrap";
import { FadeIn } from "@/components/ui/Motion";

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-dark via-primary to-primary-light relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight leading-tight mb-5">
            Ready to{" "}
            <span className="gradient-text-light">Go Solar</span>?
          </h2>
          <p className="text-lg text-neutral-300 mb-10 max-w-xl mx-auto">
            Get your free quote in seconds. No obligation, no pressure — just
            transparent solar pricing for your Ontario property.
          </p>
          <MagneticWrap>
            <Link href="/get-quote">
              <Button size="lg" className="pulse-glow btn-shine text-base px-10 py-4">
                Get Your Free Quote
              </Button>
            </Link>
          </MagneticWrap>
        </FadeIn>
      </div>
    </section>
  );
}

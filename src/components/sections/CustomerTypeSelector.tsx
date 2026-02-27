"use client";

import Link from "next/link";
import { Home, Building2, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { FadeIn, StaggerContainer, StaggerItem, motion } from "@/components/ui/Motion";
import SectionDivider from "@/components/ui/SectionDivider";

export default function CustomerTypeSelector() {
  return (
    <section className="py-20 lg:py-32 bg-neutral-50 relative">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          {/* Left side — Heading & description */}
          <FadeIn className="lg:w-5/12 lg:sticky lg:top-32 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary uppercase tracking-tight leading-tight mb-5">
              Solar Solutions
              <br />
              <span className="gradient-text">For Every Property</span>
            </h2>
            <p className="text-lg text-neutral-500 max-w-md mx-auto lg:mx-0">
              Whether you own a home or run a business, we have the right solar plan for you.
              Start saving today.
            </p>
            {/* Accent line */}
            <div className="hidden lg:block w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-8" />
          </FadeIn>

          {/* Right side — Cards */}
          <StaggerContainer className="lg:w-7/12 space-y-6 w-full">
            {/* Residential Card */}
            <StaggerItem>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-neutral-200/60 hover:border-blue-500/30 glow-border">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-300">
                      <Home className="h-7 w-7 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-primary mb-2">Residential Solar</h3>
                      <p className="text-neutral-500 mb-5">
                        Lower your hydro bills, increase your home value, and gain energy
                        independence with a custom solar system for your home.
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Link href="/get-quote?type=residential">
                          <Button>Get Home Quote</Button>
                        </Link>
                        <Link href="/residential" className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all text-sm">
                          Learn more <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Commercial Card */}
            <StaggerItem>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-neutral-200/60 hover:border-secondary/30">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 group-hover:shadow-lg group-hover:shadow-secondary/10 transition-all duration-300">
                      <Building2 className="h-7 w-7 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-primary mb-2">Commercial Solar</h3>
                      <p className="text-neutral-500 mb-5">
                        Reduce operating costs, boost your ESG credentials, and earn strong ROI
                        with a commercial solar installation.
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Link href="/get-quote?type=commercial">
                          <Button variant="secondary">Get Business Quote</Button>
                        </Link>
                        <Link href="/commercial" className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all text-sm">
                          Learn more <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      <SectionDivider variant="wave" color="fill-white" />
    </section>
  );
}

"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

import SectionDivider from "@/components/ui/SectionDivider";
import MorphingBlob from "@/components/ui/MorphingBlob";
import ParallaxBackground from "@/components/ui/ParallaxBackground";
import { motion } from "@/components/ui/Motion";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export default function Hero() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 3D parallax solar panel background */}
      <ParallaxBackground />

      {/* Morphing gradient blob */}
      <MorphingBlob className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-60 pointer-events-none" />

      {/* Decorative background blurs — hidden on mobile for performance */}
      <div className="absolute inset-0 hidden lg:block">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-40">
        <div className="flex flex-col items-center">
          <motion.div
            className="text-center max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Headline — word-by-word blur reveal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-primary-dark uppercase tracking-tight leading-[1.05] mb-6">
              {["Ontario's", "Smartest"].map((word, i) => (
                <motion.span
                  key={word}
                  className="inline-block mr-[0.3em]"
                  variants={wordReveal}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="gradient-text inline-block"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Solar Quotes
              </motion.span>
            </h1>

            <motion.p
              className="text-xl sm:text-2xl text-neutral-600 font-light mb-4"
              variants={fadeUp}
            >
              For homes and businesses.
            </motion.p>

            {/* Subheadline */}
            <motion.p
              className="text-base sm:text-lg text-neutral-500 mb-10 max-w-xl mx-auto"
              variants={fadeUp}
            >
              Get an instant, AI-powered solar quote in seconds. Transparent pricing.
              Premium equipment. $0 upfront options.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeUp}
            >
              <Link href="/get-quote?type=residential">
                <Button size="lg" className="pulse-glow btn-shine text-base px-8 py-4">
                  Get Home Quote
                </Button>
              </Link>
              <Link href="/get-quote?type=commercial">
                <Button variant="outline" size="lg" className="text-base px-8 py-4">
                  Get Business Quote
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave section divider */}
      <SectionDivider variant="wave" color="fill-primary-dark" />
    </section>
  );
}

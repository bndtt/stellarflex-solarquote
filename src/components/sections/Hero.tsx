"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

import SectionDivider from "@/components/ui/SectionDivider";
import MorphingBlob from "@/components/ui/MorphingBlob";
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

// Solar ray angles for the animated sun
const RAY_COUNT = 12;
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => (360 / RAY_COUNT) * i);

// Orbiting "energy" particles
const ORBIT_PARTICLES = [
  { radius: 100, size: 4, duration: 20, delay: 0, color: "rgba(59, 130, 246, 0.5)" },
  { radius: 100, size: 3, duration: 20, delay: 6.6, color: "rgba(6, 182, 212, 0.45)" },
  { radius: 100, size: 3, duration: 20, delay: 13.3, color: "rgba(99, 102, 241, 0.45)" },
  { radius: 150, size: 3, duration: 30, delay: 0, color: "rgba(16, 185, 129, 0.35)" },
  { radius: 150, size: 2, duration: 30, delay: 10, color: "rgba(52, 211, 153, 0.3)" },
  { radius: 150, size: 3, duration: 30, delay: 20, color: "rgba(5, 150, 105, 0.3)" },
  { radius: 200, size: 2, duration: 45, delay: 0, color: "rgba(59, 130, 246, 0.2)" },
  { radius: 200, size: 2, duration: 45, delay: 15, color: "rgba(6, 182, 212, 0.18)" },
  { radius: 200, size: 2, duration: 45, delay: 30, color: "rgba(99, 102, 241, 0.15)" },
];

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
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side — Text content (60%) */}
          <motion.div
            className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none"
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
              className="text-base sm:text-lg text-neutral-500 mb-10 max-w-xl mx-auto lg:mx-0"
              variants={fadeUp}
            >
              Get an instant, AI-powered solar quote in seconds. Transparent pricing.
              Premium equipment. $0 upfront options.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
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

          {/* Right side — Solar system animation (40%) — hidden on mobile */}
          <motion.div
            className="hidden lg:flex items-center justify-center flex-shrink-0"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            <div className="relative" style={{ width: 440, height: 440 }}>
              {/* Orbit rings */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 440">
                <circle cx="220" cy="220" r="100" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="220" cy="220" r="150" fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="1" strokeDasharray="4 8" />
                <circle cx="220" cy="220" r="200" fill="none" stroke="rgba(59,130,246,0.04)" strokeWidth="1" strokeDasharray="4 10" />
              </svg>

              {/* Central sun with rotating rays */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* Sun glow */}
                <motion.div
                  className="absolute -inset-10 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)" }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Sun core */}
                <motion.div
                  className="relative w-20 h-20 rounded-full"
                  style={{ background: "radial-gradient(circle at 40% 40%, rgba(59,130,246,0.35), rgba(6,182,212,0.2))" }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Rotating rays */}
                <motion.svg
                  className="absolute -inset-12 w-[calc(100%+96px)] h-[calc(100%+96px)]"
                  viewBox="0 0 200 200"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                  {RAYS.map((angle) => (
                    <line
                      key={angle}
                      x1="100"
                      y1="100"
                      x2={100 + Math.cos((angle * Math.PI) / 180) * 90}
                      y2={100 + Math.sin((angle * Math.PI) / 180) * 90}
                      stroke="rgba(59, 130, 246, 0.12)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  ))}
                </motion.svg>
              </div>

              {/* Orbiting energy particles */}
              {ORBIT_PARTICLES.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{ width: 0, height: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: p.delay,
                  }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      background: p.color,
                      boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                      transform: `translateX(${p.radius}px) translateY(-${p.size / 2}px)`,
                    }}
                  />
                </motion.div>
              ))}

              {/* Small solar panel icons orbiting */}
              <motion.div
                className="absolute top-1/2 left-1/2"
                style={{ width: 0, height: 0 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 20 20"
                  className="opacity-[0.25]"
                  style={{ transform: "translateX(130px) translateY(-11px)" }}
                >
                  <rect x="1" y="1" width="18" height="14" rx="1" fill="none" stroke="rgba(103,232,249,0.8)" strokeWidth="1" />
                  <line x1="7" y1="1" x2="7" y2="15" stroke="rgba(103,232,249,0.6)" strokeWidth="0.5" />
                  <line x1="13" y1="1" x2="13" y2="15" stroke="rgba(103,232,249,0.6)" strokeWidth="0.5" />
                  <line x1="1" y1="8" x2="19" y2="8" stroke="rgba(103,232,249,0.6)" strokeWidth="0.5" />
                  <line x1="10" y1="15" x2="10" y2="19" stroke="rgba(103,232,249,0.5)" strokeWidth="1" />
                </svg>
              </motion.div>

              <motion.div
                className="absolute top-1/2 left-1/2"
                style={{ width: 0, height: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 65, repeat: Infinity, ease: "linear", delay: 5 }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  className="opacity-[0.2]"
                  style={{ transform: "translateX(175px) translateY(-9px)" }}
                >
                  <rect x="1" y="1" width="18" height="14" rx="1" fill="none" stroke="rgba(16,185,129,0.8)" strokeWidth="1" />
                  <line x1="7" y1="1" x2="7" y2="15" stroke="rgba(16,185,129,0.6)" strokeWidth="0.5" />
                  <line x1="13" y1="1" x2="13" y2="15" stroke="rgba(16,185,129,0.6)" strokeWidth="0.5" />
                  <line x1="1" y1="8" x2="19" y2="8" stroke="rgba(16,185,129,0.6)" strokeWidth="0.5" />
                  <line x1="10" y1="15" x2="10" y2="19" stroke="rgba(16,185,129,0.5)" strokeWidth="1" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave section divider */}
      <SectionDivider variant="wave" color="fill-primary-dark" />
    </section>
  );
}

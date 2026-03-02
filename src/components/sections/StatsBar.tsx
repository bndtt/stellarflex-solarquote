"use client";

import { AnimatedNumber, motion } from "@/components/ui/Motion";
import CircularProgress from "@/components/ui/CircularProgress";

const stats = [
  { value: 500, suffix: "+", label: "Ontario Installations", percent: 85, compact: false },
  { value: 4.9, suffix: "\u2605", label: "Customer Rating", decimals: true, percent: 98, compact: false },
  { value: 2800, prefix: "$", suffix: "+", label: "Avg Annual Savings", percent: 75, compact: true },
  { value: 25, suffix: " yr", label: "Warranty Coverage", percent: 100, compact: false },
];

export default function StatsBar() {
  return (
    <section className="bg-primary-dark relative overflow-hidden">
      {/* Subtle gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center lg:px-8"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <CircularProgress percent={stat.percent} size={100} strokeWidth={3}>
                <p className={`font-extrabold text-white tracking-tight ${stat.compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}>
                  {stat.decimals ? (
                    <span>{stat.prefix}{stat.value}{stat.suffix}</span>
                  ) : (
                    <AnimatedNumber
                      value={stat.value}
                      prefix={stat.prefix || ""}
                      suffix={stat.suffix || ""}
                    />
                  )}
                </p>
              </CircularProgress>
              <p className="text-xs sm:text-sm text-neutral-400 uppercase tracking-wider font-medium mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Subtle gradient accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
    </section>
  );
}

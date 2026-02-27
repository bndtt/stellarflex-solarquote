"use client";

import { AnimatedNumber, motion } from "@/components/ui/Motion";

const stats = [
  { value: 500, suffix: "+", label: "Ontario Installations" },
  { value: 4.9, suffix: "\u2605", label: "Customer Rating", decimals: true },
  { value: 2800, prefix: "$", suffix: "+", label: "Avg Annual Savings" },
  { value: 25, suffix: " yr", label: "Warranty Coverage" },
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
              className="text-center lg:px-8"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
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
              <p className="text-xs sm:text-sm text-neutral-400 uppercase tracking-wider font-medium mt-1">
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

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedHighlightProps {
  children: React.ReactNode;
  color?: string;
  delay?: number;
  className?: string;
}

export default function AnimatedHighlight({
  children,
  color = "rgba(59,130,246,0.15)",
  delay = 0.3,
  className,
}: AnimatedHighlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <span ref={ref} className={`relative inline-block ${className ?? ""}`}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 w-full h-[30%] -z-10 rounded-sm origin-left"
        style={{ backgroundColor: color }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MorphingBlobProps {
  className?: string;
}

const blobPaths = [
  "M45.3,-51.2C58.3,-40.5,68.2,-25.3,71.2,-8.6C74.2,8.1,70.3,26.3,60.1,39.8C49.9,53.3,33.4,62.1,15.8,66.1C-1.8,70.1,-20.5,69.3,-36.1,61.3C-51.7,53.3,-64.2,38.1,-69.5,20.8C-74.8,3.5,-72.9,-15.9,-63.8,-30.7C-54.7,-45.5,-38.4,-55.7,-22.1,-65.1C-5.8,-74.5,10.5,-83.1,24.1,-76.6C37.7,-70.1,48.6,-48.5,45.3,-51.2Z",
  "M39.9,-47.5C52.2,-36.3,63,-23.1,67.2,-7.3C71.4,8.5,69,26.9,59.5,40.1C50,53.3,33.4,61.3,16.2,64.8C-1,68.3,-18.8,67.3,-34.3,60C-49.8,52.7,-63,39.1,-68.7,22.8C-74.4,6.5,-72.6,-12.5,-64,-27.5C-55.4,-42.5,-40,-53.5,-24.5,-63.3C-9,-73.1,6.6,-81.7,20.3,-77.6C34,-73.5,45.8,-56.7,39.9,-47.5Z",
  "M43.5,-50.8C56.4,-41.7,67,-27.3,70.8,-11.1C74.6,5.1,71.6,23.1,62.2,36.6C52.8,50.1,37,59.1,20.3,63.4C3.6,67.7,-14,67.3,-29.7,61C-45.4,54.7,-59.2,42.5,-66.1,27C-73,11.5,-73,-7.3,-66.2,-22.2C-59.4,-37.1,-45.8,-48.1,-31.8,-56.8C-17.8,-65.5,-3.4,-71.9,9.5,-69.6C22.4,-67.3,33.8,-56.3,43.5,-50.8Z",
];

export default function MorphingBlob({ className }: MorphingBlobProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Skip expensive SVG morphing + blur on mobile
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  // On mobile, render a simple static gradient circle instead
  if (isMobile) {
    return (
      <div className={className}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100/30 to-cyan-100/20" />
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.svg
        viewBox="-100 -100 200 200"
        className="w-full h-full"
        style={{ filter: "blur(40px)" }}
      >
        <defs>
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.15)" />
            <stop offset="50%" stopColor="rgba(6,182,212,0.12)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.1)" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#blobGradient)"
          animate={{
            d: blobPaths,
          }}
          transition={{
            d: {
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }}
        />
      </motion.svg>
    </div>
  );
}

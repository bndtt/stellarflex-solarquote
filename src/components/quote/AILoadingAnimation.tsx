"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "@/components/ui/Motion";
import { Check, Loader2 } from "lucide-react";

const ANALYSIS_STEPS = [
  { label: "Analyzing location & solar data", duration: 1600 },
  { label: "Calculating optimal system size", duration: 1500 },
  { label: "Estimating energy production", duration: 1500 },
  { label: "Evaluating incentives & savings", duration: 1600 },
  { label: "Preparing your personalized quote", duration: 1800 },
];

const TOTAL_DURATION = ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0);

interface AILoadingAnimationProps {
  isLoading: boolean;
  onMinimumTimeReached: () => void;
}

export default function AILoadingAnimation({ isLoading, onMinimumTimeReached }: AILoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    const timeouts: NodeJS.Timeout[] = [];
    let elapsed = 0;

    ANALYSIS_STEPS.forEach((_, index) => {
      timeouts.push(setTimeout(() => setCurrentStep(index), elapsed));
      elapsed += ANALYSIS_STEPS[index].duration;
      timeouts.push(setTimeout(() => setCompletedSteps(prev => [...prev, index]), elapsed));
    });

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (TOTAL_DURATION / 50)), 100));
    }, 50);
    timeouts.push(progressInterval as unknown as NodeJS.Timeout);

    timeouts.push(setTimeout(() => onMinimumTimeReached(), TOTAL_DURATION));

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(progressInterval);
    };
  }, [isLoading, onMinimumTimeReached]);

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16 px-4 max-w-md mx-auto">
      {/* Spinning arc */}
      <div className="relative w-14 h-14 sm:w-20 sm:h-20 mb-6 sm:mb-10">
        {/* Outer faint ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="2" />
        </svg>
        {/* Spinning gradient arc */}
        {reducedMotion ? (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36 * 0.3} ${2 * Math.PI * 36 * 0.7}`}
            />
          </svg>
        ) : (
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 80 80"
            animate={{ rotate: 360 }}
            transition={{ duration: isMobile ? 4 : 2, repeat: Infinity, ease: "linear" }}
          >
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36 * 0.3} ${2 * Math.PI * 36 * 0.7}`}
            />
          </motion.svg>
        )}
        {/* Center pulse dot */}
        {reducedMotion || isMobile ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
          </div>
        ) : (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
          </motion.div>
        )}
      </div>

      {/* Current step text */}
      <div className="h-7 mb-5 sm:mb-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentStep >= 0 && (
            <motion.p
              key={currentStep}
              className="text-sm text-neutral-500 font-medium text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {ANALYSIS_STEPS[currentStep].label}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Thin progress bar */}
      <div className="w-full max-w-xs h-0.5 bg-neutral-100 rounded-full overflow-hidden mb-5 sm:mb-8">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Step indicators — minimal dots */}
      <div className="flex items-center gap-2 sm:gap-3">
        {ANALYSIS_STEPS.map((_, index) => {
          const isCompleted = completedSteps.includes(index);
          const isProcessing = currentStep === index && !isCompleted;

          return (
            <div key={index} className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Check className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className={`h-4 w-4 text-blue-500 ${reducedMotion ? "" : "animate-spin"}`} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="wait"
                    className="w-1.5 h-1.5 rounded-full bg-neutral-200"
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "@/components/ui/Motion";
import { MapPin, Sun, Zap, DollarSign, FileCheck, Check, Loader2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const ANALYSIS_STEPS = [
  { icon: MapPin, label: "Analyzing location & solar data", duration: 1600 },
  { icon: Sun, label: "Calculating optimal system size", duration: 1500 },
  { icon: Zap, label: "Estimating energy production", duration: 1500 },
  { icon: DollarSign, label: "Evaluating incentives & savings", duration: 1600 },
  { icon: FileCheck, label: "Preparing your personalized quote", duration: 1800 },
];

const TOTAL_DURATION = ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0);

interface AILoadingAnimationProps {
  isLoading: boolean;
  onMinimumTimeReached: () => void;
}

// Neural network node positions (7 nodes in a loose pattern)
const NODES = [
  { cx: 100, cy: 60, r: 8 },
  { cx: 55, cy: 95, r: 6 },
  { cx: 145, cy: 95, r: 6 },
  { cx: 35, cy: 140, r: 7 },
  { cx: 100, cy: 130, r: 9 },
  { cx: 165, cy: 140, r: 7 },
  { cx: 100, cy: 180, r: 6 },
];

// Connections between nodes
const EDGES = [
  [0, 1], [0, 2], [0, 4],
  [1, 3], [1, 4],
  [2, 4], [2, 5],
  [3, 6], [4, 6], [5, 6],
  [3, 4], [4, 5],
];

export default function AILoadingAnimation({ isLoading, onMinimumTimeReached }: AILoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeNodes, setActiveNodes] = useState<number[]>([]);

  // Generate stable random particles
  const particles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      driftX: (Math.random() - 0.5) * 30,
      driftY: -20 - Math.random() * 40,
    })),
  []);

  useEffect(() => {
    if (!isLoading) return;

    const timeouts: NodeJS.Timeout[] = [];
    let elapsed = 0;

    // Progress through each step
    ANALYSIS_STEPS.forEach((_, index) => {
      // Start step
      timeouts.push(setTimeout(() => {
        setCurrentStep(index);
        // Light up nodes progressively
        setActiveNodes(prev => [...prev, index, (index + 2) % NODES.length]);
      }, elapsed));

      elapsed += ANALYSIS_STEPS[index].duration;

      // Complete step
      timeouts.push(setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
      }, elapsed));
    });

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (TOTAL_DURATION / 50));
        return Math.min(next, 100);
      });
    }, 50);
    timeouts.push(progressInterval as unknown as NodeJS.Timeout);

    // Signal completion
    timeouts.push(setTimeout(() => {
      setActiveNodes([0, 1, 2, 3, 4, 5, 6]); // All nodes active
      onMinimumTimeReached();
    }, TOTAL_DURATION));

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(progressInterval);
    };
  }, [isLoading, onMinimumTimeReached]);

  return (
    <div className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light rounded-xl shadow-2xl p-8 max-w-lg mx-auto overflow-hidden min-h-[520px] flex flex-col">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? "rgba(59, 130, 246, 0.3)"
              : p.id % 3 === 1
                ? "rgba(16, 185, 129, 0.25)"
                : "rgba(255, 255, 255, 0.15)",
          }}
          animate={{
            y: [0, p.driftY],
            x: [0, p.driftX],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Progress bar at top */}
      <div className="relative w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-secondary"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Neural network SVG */}
      <div className="relative flex justify-center mb-6">
        <svg viewBox="0 0 200 220" className="w-40 h-40 sm:w-48 sm:h-48">
          {/* Edges */}
          {EDGES.map(([from, to], i) => {
            const fromNode = NODES[from];
            const toNode = NODES[to];
            const isActive = activeNodes.includes(from) && activeNodes.includes(to);
            return (
              <motion.line
                key={`edge-${i}`}
                x1={fromNode.cx}
                y1={fromNode.cy}
                x2={toNode.cx}
                y2={toNode.cy}
                stroke={isActive ? "rgba(59, 130, 246, 0.6)" : "rgba(255, 255, 255, 0.1)"}
                strokeWidth={isActive ? 1.5 : 0.8}
                strokeDasharray={isActive ? "none" : "4 4"}
                animate={{
                  stroke: isActive ? "rgba(59, 130, 246, 0.6)" : "rgba(255, 255, 255, 0.1)",
                  strokeWidth: isActive ? 1.5 : 0.8,
                }}
                transition={{ duration: 0.5 }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node, i) => {
            const isActive = activeNodes.includes(i);
            return (
              <g key={`node-${i}`}>
                {/* Glow ring */}
                {isActive && (
                  <motion.circle
                    cx={node.cx}
                    cy={node.cy}
                    r={node.r + 6}
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth={1}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <motion.circle
                  cx={node.cx}
                  cy={node.cy}
                  r={node.r}
                  fill={isActive ? "rgba(6, 182, 212, 0.8)" : "rgba(255, 255, 255, 0.15)"}
                  stroke={isActive ? "rgba(6, 182, 212, 1)" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth={1.5}
                  animate={{
                    fill: isActive ? "rgba(6, 182, 212, 0.8)" : "rgba(255, 255, 255, 0.15)",
                    scale: isActive ? [1, 1.15, 1] : 1,
                  }}
                  transition={{
                    fill: { duration: 0.4 },
                    scale: { duration: 1.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" },
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Analysis Steps */}
      <div className="relative flex-1 space-y-3">
        {ANALYSIS_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isProcessing = currentStep === index && !isCompleted;
          const isPending = currentStep < index;

          return (
            <motion.div
              key={index}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-300",
                isProcessing && "bg-white/10",
                isCompleted && "bg-white/5",
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  ) : isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-7 h-7 rounded-full border-2 border-cyan-400/40 flex items-center justify-center"
                    >
                      <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center"
                    >
                      <step.icon className="h-3.5 w-3.5 text-white/30" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isCompleted
                    ? "text-secondary"
                    : isProcessing
                      ? "text-white"
                      : "text-white/40",
                )}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom branding */}
      <motion.div
        className="relative flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="h-4 w-4 text-cyan-400" />
        <span className="text-xs font-medium text-white/60 tracking-wide uppercase">
          StellarFlex AI
        </span>
      </motion.div>
    </div>
  );
}

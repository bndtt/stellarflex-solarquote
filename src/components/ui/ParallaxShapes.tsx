"use client";

import { useEffect, useRef, useState } from "react";

interface Shape {
  type: "circle" | "ring" | "dot";
  x: string;
  y: string;
  size: number;
  speed: number;
  color: string;
}

interface ParallaxShapesProps {
  shapes: Shape[];
  className?: string;
}

export default function ParallaxShapes({ shapes, className }: ParallaxShapesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsMobile(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const els = container.children as HTMLCollectionOf<HTMLElement>;

    let raf = 0;
    function animate() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const offset = (centerY - viewCenter) / window.innerHeight;

      for (let i = 0; i < els.length; i++) {
        const speed = shapes[i]?.speed ?? 0.5;
        els[i].style.transform = `translateY(${offset * speed * -60}px)`;
      }
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [shapes, isMobile]);

  if (isMobile) return null;

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ""}`}>
      {shapes.map((shape, i) => (
        <div
          key={i}
          className="absolute will-change-transform transition-transform duration-100"
          style={{ left: shape.x, top: shape.y }}
        >
          {shape.type === "circle" && (
            <div
              className="rounded-full"
              style={{
                width: shape.size,
                height: shape.size,
                background: shape.color,
              }}
            />
          )}
          {shape.type === "ring" && (
            <div
              className="rounded-full border"
              style={{
                width: shape.size,
                height: shape.size,
                borderColor: shape.color,
              }}
            />
          )}
          {shape.type === "dot" && (
            <div
              className="rounded-full"
              style={{
                width: shape.size,
                height: shape.size,
                background: shape.color,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Pre-defined shape sets for different sections
export const LIGHT_SECTION_SHAPES: Shape[] = [
  { type: "circle", x: "5%", y: "15%", size: 8, speed: 0.3, color: "rgba(59,130,246,0.08)" },
  { type: "ring", x: "85%", y: "25%", size: 24, speed: 0.6, color: "rgba(6,182,212,0.1)" },
  { type: "dot", x: "92%", y: "70%", size: 6, speed: 0.4, color: "rgba(59,130,246,0.1)" },
  { type: "circle", x: "10%", y: "80%", size: 12, speed: 0.5, color: "rgba(6,182,212,0.06)" },
  { type: "ring", x: "45%", y: "90%", size: 16, speed: 0.7, color: "rgba(99,102,241,0.06)" },
];

export const DARK_SECTION_SHAPES: Shape[] = [
  { type: "circle", x: "8%", y: "20%", size: 6, speed: 0.4, color: "rgba(103,232,249,0.08)" },
  { type: "ring", x: "88%", y: "30%", size: 20, speed: 0.5, color: "rgba(103,232,249,0.06)" },
  { type: "dot", x: "75%", y: "75%", size: 4, speed: 0.3, color: "rgba(59,130,246,0.1)" },
  { type: "circle", x: "15%", y: "85%", size: 10, speed: 0.6, color: "rgba(6,182,212,0.05)" },
];

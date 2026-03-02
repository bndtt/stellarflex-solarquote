"use client";

import { useEffect, useRef, useState } from "react";

const LAYERS = [
  {
    src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1400",
    depth: 15,
    opacity: 0.12,
    filter: "grayscale(1) contrast(1.1) brightness(0.6)",
    blendMode: "normal" as const,
  },
  {
    src: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1400",
    depth: 30,
    opacity: 0.08,
    filter: "grayscale(1) contrast(1.2) brightness(0.7)",
    blendMode: "screen" as const,
  },
  {
    src: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&q=80&w=1400",
    depth: 45,
    opacity: 0.06,
    filter: "grayscale(1) contrast(1.3) brightness(0.8)",
    blendMode: "overlay" as const,
  },
];

interface ParallaxBackgroundProps {
  className?: string;
}

export default function ParallaxBackground({ className }: ParallaxBackgroundProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 768px)").matches) {
      setIsMobile(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Entrance animation
    canvas.style.opacity = "0";
    canvas.style.transform = "rotateX(65deg) rotateZ(0deg) scale(0.85)";

    const timeout = setTimeout(() => {
      canvas.style.transition = "all 2s cubic-bezier(0.16, 1, 0.3, 1)";
      canvas.style.opacity = "1";
      canvas.style.transform = "rotateX(55deg) rotateZ(-20deg) scale(1)";
    }, 400);

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const x = (window.innerWidth / 2 - e.pageX) / 30;
      const y = (window.innerHeight / 2 - e.pageY) / 30;

      canvas.style.transform = `rotateX(${55 + y / 2}deg) rotateZ(${-20 + x / 2}deg)`;

      layerRefs.current.forEach((layer, index) => {
        if (!layer) return;
        const moveX = x * (index + 1) * 0.15;
        const moveY = y * (index + 1) * 0.15;
        layer.style.transform = `translateZ(${LAYERS[index].depth}px) translate(${moveX}px, ${moveY}px)`;
      });
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isMobile]);

  // On mobile, show a single static solar panel image with a subtle tint
  if (isMobile) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ""}`}>
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url(${LAYERS[0].src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(1) contrast(1.1) brightness(0.6)",
          }}
        />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ""}`}>
      {/* Perspective viewport */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: 2000 }}
      >
        {/* 3D canvas */}
        <div
          ref={canvasRef}
          className="relative"
          style={{
            width: "120%",
            height: "120%",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Image layers */}
          {LAYERS.map((layer, i) => (
            <div
              key={i}
              ref={(el) => { layerRefs.current[i] = el; }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${layer.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: layer.filter,
                opacity: layer.opacity,
                mixBlendMode: layer.blendMode,
                border: "1px solid rgba(59, 130, 246, 0.04)",
                transition: "transform 0.4s ease",
              }}
            />
          ))}

          {/* Topographic contour lines */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%",
              backgroundImage:
                "repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, rgba(59,130,246,0.03) 41px, transparent 42px)",
              transform: "translateZ(60px)",
            }}
          />
        </div>
      </div>

      {/* Blue tint overlay to unify with site palette */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-cyan-50/20" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const visible = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Skip on touch devices — no mouse to track
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const glow = glowRef.current;
    if (!glow) return;

    function onMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        glow!.style.opacity = "1";
      }
    }

    function onLeave() {
      visible.current = false;
      glow!.style.opacity = "0";
    }

    function animate() {
      current.current.x += (mouse.current.x - current.current.x) * 0.15;
      current.current.y += (mouse.current.y - current.current.y) * 0.15;
      glow!.style.transform = `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`;
      raf.current = requestAnimationFrame(animate);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[600px] h-[600px] pointer-events-none z-0 opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(circle, rgba(59,130,246,0.045) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)",
      }}
    />
  );
}

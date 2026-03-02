"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar!.style.width = `${progress}%`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-[width] duration-100 ease-out"
        style={{ boxShadow: "0 0 10px rgba(59,130,246,0.5), 0 0 20px rgba(6,182,212,0.3)" }}
      />
    </div>
  );
}

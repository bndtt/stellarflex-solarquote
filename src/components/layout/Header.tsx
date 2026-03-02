"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Sun, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import MobileNav from "./MobileNav";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScroll = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 50);
      // Hide header on scroll down, show on scroll up (only after 300px)
      if (y > 300) {
        setHidden(y > lastScroll.current && y - lastScroll.current > 5);
      } else {
        setHidden(false);
      }
      lastScroll.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-md border-b border-neutral-200/80"
          : "bg-white/80 backdrop-blur-md border-b border-neutral-200/60 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-12 lg:h-14" : "h-16 lg:h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sun
              className={`text-blue-500 transition-all duration-300 ${
                scrolled ? "h-6 w-6" : "h-8 w-8"
              }`}
            />
            <span
              className={`font-bold text-primary transition-all duration-300 ${
                scrolled ? "text-lg" : "text-xl"
              }`}
            >
              Stellar<span className="gradient-text">Flex</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors nav-link-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link href="/get-quote">
              <Button size="sm">Get Quote</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-neutral-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

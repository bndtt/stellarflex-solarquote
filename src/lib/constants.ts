// Site-wide constants and metadata for StellarFlex SolarQuote

export const SITE_CONFIG = {
  name: "StellarFlex SolarQuote",
  tagline: "Solar made simple — for your home and business.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stellarflexsolarquote.com",
  email: "hello@stellarflexsolarquote.com",
  phone: "(647) 555-0123", // Update with real number
  location: "Ontario, Canada",
};

// Brand color palette — matches CSS variables in globals.css
export const COLORS = {
  primary: "#1a365d",       // Deep solar blue — trust, professionalism
  accent: "#f59e0b",        // Warm amber/gold — energy, solar, warmth
  secondary: "#10b981",     // Fresh green — sustainability, savings
  neutralDark: "#334155",   // Slate 700
  neutralMid: "#64748b",    // Slate 500
  neutralLight: "#f1f5f9",  // Slate 100
};

// Social proof stats shown across the site
export const STATS = {
  installations: "500+",
  rating: "4.9",
  avgSavings: "$2,800+",
  warranty: "25",
};

// Navigation links used in Header and Footer
export const NAV_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Residential", href: "/residential" },
  { label: "Commercial", href: "/commercial" },
  { label: "Solar Academy", href: "/solar-academy" },
  { label: "Reviews", href: "/reviews" },
  { label: "FAQ", href: "/faq" },
];

// Footer quick links (includes additional pages)
export const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "FAQ", href: "/faq" },
  { label: "Solar Academy", href: "/solar-academy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

// Social media links
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/stellarflexsolarquote",
  instagram: "https://instagram.com/stellarflexsolarquote",
  linkedin: "https://linkedin.com/company/stellarflexsolarquote",
};

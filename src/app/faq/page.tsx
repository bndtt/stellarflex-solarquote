"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "@/components/ui/Motion";

const faqCategories = [
  {
    category: "General",
    questions: [
      {
        q: "What is solar energy and how do solar panels work?",
        a: "Solar panels contain photovoltaic (PV) cells that convert sunlight into direct current (DC) electricity. An inverter then converts this to alternating current (AC), which powers your home or business. Any excess energy can be sent back to the grid through Net Metering.",
      },
      {
        q: "Is solar energy reliable in Ontario?",
        a: "Yes! Ontario receives 1,400–1,600 hours of peak sun per year, which is plenty for effective solar generation. Solar panels work even on cloudy days (at reduced capacity) and actually perform better in cooler temperatures.",
      },
    ],
  },
  {
    category: "Pricing & Savings",
    questions: [
      {
        q: "How much does a solar installation cost in Ontario?",
        a: "Residential systems typically cost $15,000–$30,000 before incentives, depending on system size. Commercial systems vary widely based on scale. With financing options, many customers pay $0 upfront.",
      },
      {
        q: "How much can I save with solar?",
        a: "Most Ontario homeowners save $2,000–$4,000 per year on electricity. Savings depend on your system size, energy usage, and local utility rates. With rising hydro costs, savings increase over time.",
      },
      {
        q: "What is the payback period?",
        a: "Typical residential payback is 7–10 years. Commercial systems often pay back in 5–8 years. After payback, your solar energy is essentially free for the remaining 15–20 years of panel life.",
      },
    ],
  },
  {
    category: "Ontario-Specific",
    questions: [
      {
        q: "What incentives are available in Ontario?",
        a: "Key incentives include: Net Metering (credits for excess energy), the Canada Greener Homes Grant/Loan program, Capital Cost Allowance for businesses, and property tax exemptions in many municipalities.",
      },
      {
        q: "How does Net Metering work in Ontario?",
        a: "When your solar panels produce more electricity than you use, the excess flows back to the grid. Your utility (Hydro One, Toronto Hydro, etc.) gives you credits that offset your bill when you use more electricity than you produce, like at night or in winter.",
      },
      {
        q: "How does Ontario weather affect solar panels?",
        a: "Ontario's climate is well-suited for solar. Cold temperatures actually improve panel efficiency. Snow typically slides off angled panels, and any light dusting has minimal impact. The biggest factor is sun hours, and Ontario gets enough for excellent solar production.",
      },
    ],
  },
  {
    category: "Installation",
    questions: [
      {
        q: "How long does installation take?",
        a: "The physical installation takes 1–3 days for residential and 1–4 weeks for commercial. The full process including permits, utility approval, and inspections typically takes 4–8 weeks in Ontario.",
      },
      {
        q: "Do I need permits for solar in Ontario?",
        a: "Yes, solar installations require building permits and electrical permits. We handle all permit applications as part of our service. Some municipalities also require site plan approval for larger commercial systems.",
      },
      {
        q: "Is my roof suitable for solar panels?",
        a: "Most roofs are suitable. Ideal conditions include: south-facing orientation, 15–40 degree slope, minimal shading, and a roof in good condition. Our AI quoting tool analyzes your roof automatically, and our site survey confirms suitability.",
      },
    ],
  },
  {
    category: "Equipment & Warranty",
    questions: [
      {
        q: "What brand of panels do you use?",
        a: "We use premium Tier 1 panels from manufacturers like Canadian Solar, Longi, and QCells. All our equipment is tested for Canadian climate conditions and backed by manufacturer warranties.",
      },
      {
        q: "What warranty coverage is provided?",
        a: "You get a 25-year performance warranty on panels, 12–25 year warranty on inverters (depending on brand), and a 10-year workmanship warranty on our installation.",
      },
    ],
  },
  {
    category: "Financing",
    questions: [
      {
        q: "What financing options are available?",
        a: "Three options: (1) Lease/PPA — $0 down, fixed monthly payments, provider maintains the system. (2) Solar Loan — $0 down, you own the system, build equity. (3) Cash Purchase — no ongoing payments, maximum lifetime savings.",
      },
      {
        q: "What is a PPA (Power Purchase Agreement)?",
        a: "A PPA means a solar company installs panels on your property at no cost, and you agree to buy the electricity they produce at a fixed rate — typically lower than your current utility rate. You save money without any upfront investment.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-neutral-300">
            Everything you need to know about going solar in Ontario.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {faqCategories.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-xl font-bold text-primary mb-4">{cat.category}</h2>
              <div className="space-y-3">
                {cat.questions.map((faq) => {
                  const key = `${cat.category}-${faq.q}`;
                  const isOpen = openItems[key];
                  return (
                    <div
                      key={key}
                      className="border border-neutral-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <span className="font-medium text-primary pr-4">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-neutral-400 flex-shrink-0 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 text-neutral-500 text-sm leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

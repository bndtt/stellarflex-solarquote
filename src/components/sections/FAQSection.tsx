"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AnimatePresence, motion, FadeIn } from "@/components/ui/Motion";

const faqs = [
  {
    question: "How much does solar cost in Ontario?",
    answer:
      "The average residential solar installation in Ontario costs between $15,000–$30,000 before incentives. With financing options, many homeowners pay $0 upfront and start saving immediately. Commercial installations vary based on size and complexity.",
  },
  {
    question: "How does Net Metering work in Ontario?",
    answer:
      "Net Metering allows you to send excess solar energy back to the grid and receive credits on your electricity bill. When your panels produce more than you use (common in summer), those credits offset your usage during less sunny months.",
  },
  {
    question: "Will solar panels work in Ontario's climate?",
    answer:
      "Yes! Solar panels actually perform better in cooler temperatures. Ontario receives enough sunlight to make solar highly effective. Snow usually slides off angled panels, and the panels continue producing energy even on cloudy days.",
  },
  {
    question: "How long does installation take?",
    answer:
      "A typical residential installation takes 1–3 days of actual installation work. However, the full process — including permits, utility approval, and inspections — usually takes 4–8 weeks in Ontario.",
  },
  {
    question: "What financing options are available?",
    answer:
      "We offer three main options: Lease/PPA ($0 down, fixed monthly payments), Solar Loan ($0 down, you own the system), and Cash Purchase (maximum long-term savings). Each has different benefits depending on your situation.",
  },
  {
    question: "What warranty do you provide?",
    answer:
      "We provide a 25-year performance warranty on panels, 12–25 year warranty on inverters, and a 10-year workmanship warranty on our installation. Your investment is protected for decades.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-neutral-500">
            Quick answers to common solar questions.{" "}
            <Link href="/faq" className="text-blue-500 hover:underline">
              See all FAQs
            </Link>
          </p>
        </FadeIn>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl overflow-hidden transition-all duration-300",
                openIndex === index
                  ? "border border-blue-500/30 shadow-md shadow-blue-500/5 bg-white"
                  : "border border-neutral-200 hover:border-neutral-300",
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="font-medium text-primary pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-neutral-400 flex-shrink-0 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-neutral-500 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { MapPin, Zap, Settings, ClipboardCheck, Wrench, PlugZap } from "lucide-react";
import FinalCTA from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how to go solar with StellarFlex in 6 simple steps. From instant quote to installation — we handle everything for your Ontario property.",
};

const steps = [
  {
    icon: MapPin,
    title: "Get a Quote",
    description:
      "Enter your address and monthly electricity bill into our AI-powered quoting tool. You'll get an instant estimate based on your roof, sun exposure, and energy usage.",
  },
  {
    icon: Settings,
    title: "Customize Your Plan",
    description:
      "Choose your panel type, battery storage options, and system size. Our tool recommends the best configuration for your needs and budget.",
  },
  {
    icon: Zap,
    title: "Choose Financing",
    description:
      "Pick the payment option that works for you: Lease/PPA ($0 down), Solar Loan ($0 down, you own it), or Cash Purchase (maximum savings).",
  },
  {
    icon: ClipboardCheck,
    title: "Site Survey & Approval",
    description:
      "Our team conducts a detailed site assessment, handles all permit applications, and coordinates with your local Ontario utility (Hydro One, Toronto Hydro, etc.).",
  },
  {
    icon: Wrench,
    title: "Installation",
    description:
      "Professional installation typically takes 1–3 days. We handle everything — mounting, wiring, inverter setup, and cleanup.",
  },
  {
    icon: PlugZap,
    title: "Activation & Monitoring",
    description:
      "Once your utility gives the green light, your system goes live. Monitor your energy production and savings in real-time.",
  },
];

const financing = [
  {
    title: "Lease / PPA",
    highlight: "$0 down",
    features: [
      "No upfront cost",
      "Fixed monthly payments",
      "Provider maintains the system",
      "Predictable savings from day one",
    ],
  },
  {
    title: "Solar Loan",
    highlight: "You own it",
    features: [
      "$0 down available",
      "You own the system",
      "Tax credit eligible",
      "Build home equity",
    ],
  },
  {
    title: "Cash Purchase",
    highlight: "Max savings",
    features: [
      "No monthly payments",
      "Full ownership from day one",
      "Maximum long-term ROI",
      "Highest lifetime savings",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            How It Works
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Going solar in Ontario is simpler than you think. Here&apos;s your
            step-by-step journey from quote to clean energy.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="relative w-14 h-14 bg-cyan-400/10 rounded-xl flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-blue-500" />
                    <span className="absolute -top-2 -left-2 w-7 h-7 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Options */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Financing Options
            </h2>
            <p className="text-lg text-neutral-500">
              Choose the payment plan that fits your budget and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {financing.map((option) => (
              <div
                key={option.title}
                className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm"
              >
                <h3 className="text-xl font-bold text-primary mb-1">
                  {option.title}
                </h3>
                <p className="text-blue-500 font-semibold mb-4">{option.highlight}</p>
                <ul className="space-y-2">
                  {option.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-sm text-neutral-500 flex items-start gap-2"
                    >
                      <span className="text-secondary mt-1">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

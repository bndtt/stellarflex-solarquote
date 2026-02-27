import type { Metadata } from "next";
import Link from "next/link";
import { Building2, TrendingUp, Leaf, BarChart3, Clock, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import FinalCTA from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Commercial Solar",
  description:
    "Reduce operating costs with commercial solar in Ontario. Strong ROI, tax advantages, and sustainability branding for your business.",
};

const benefits = [
  { icon: TrendingUp, title: "Strong ROI", description: "Most commercial systems pay for themselves in 5–8 years." },
  { icon: BarChart3, title: "Reduced operating costs", description: "Cut your electricity expenses by up to 70%." },
  { icon: Leaf, title: "ESG & sustainability", description: "Boost your brand with demonstrable environmental commitment." },
  { icon: ShieldCheck, title: "Tax advantages", description: "Capital cost allowance (CCA) deductions for solar assets." },
  { icon: Clock, title: "Long asset life", description: "25+ year panel life with minimal maintenance." },
  { icon: Building2, title: "Multiple install types", description: "Rooftop, ground-mount, and carport options available." },
];

export default function CommercialPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Reduce operating costs with commercial solar
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-8">
            Ontario businesses are switching to solar for predictable energy costs,
            strong ROI, and a competitive sustainability advantage.
          </p>
          <Link href="/get-quote?type=commercial">
            <Button size="lg" variant="secondary">Get Business Quote</Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Benefits for businesses
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <b.icon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">{b.title}</h3>
                  <p className="text-sm text-neutral-500">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Types */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Commercial installation types
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-primary mb-2">Rooftop</h3>
              <p className="text-sm text-neutral-500">
                Ideal for warehouses, offices, and retail spaces with large flat or
                low-slope roofs. No additional land needed.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-primary mb-2">Ground-Mount</h3>
              <p className="text-sm text-neutral-500">
                Perfect for businesses with available land. Allows optimal panel angle
                and easy maintenance access.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-primary mb-2">Carport</h3>
              <p className="text-sm text-neutral-500">
                Dual-purpose: generate solar energy while providing covered parking
                for employees and customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

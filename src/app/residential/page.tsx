import type { Metadata } from "next";
import Link from "next/link";
import { Home, TrendingUp, Zap, ShieldCheck, DollarSign, Sun } from "lucide-react";
import Button from "@/components/ui/Button";
import FinalCTA from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Residential Solar",
  description:
    "Power your Ontario home with solar. Lower hydro bills, increase home value, and gain energy independence. Get an instant quote today.",
};

const benefits = [
  { icon: DollarSign, title: "Lower hydro bills", description: "Save up to 70% on your monthly electricity costs." },
  { icon: TrendingUp, title: "Increase home value", description: "Solar homes sell for 4-6% more on average." },
  { icon: Zap, title: "Energy independence", description: "Generate your own clean energy and reduce grid reliance." },
  { icon: ShieldCheck, title: "25-year warranty", description: "Long-term protection on panels and workmanship." },
  { icon: Sun, title: "Net Metering credits", description: "Earn credits for excess energy sent back to the grid." },
  { icon: Home, title: "$0 upfront options", description: "Start saving immediately with flexible financing." },
];

export default function ResidentialPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Power your home with solar
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-8">
            Join hundreds of Ontario homeowners saving thousands every year with
            a custom solar system designed for your home.
          </p>
          <Link href="/get-quote?type=residential">
            <Button size="lg">Get Your Home Quote</Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Benefits for homeowners
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                  <b.icon className="h-6 w-6 text-blue-500" />
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

      {/* Ontario Incentives */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Ontario residential incentives
          </h2>
          <div className="space-y-4 text-neutral-600">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-primary mb-2">Net Metering</h3>
              <p className="text-sm">
                Send excess solar energy back to the grid and receive credits on your
                electricity bill. Available province-wide through your local utility.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-primary mb-2">Canada Greener Homes</h3>
              <p className="text-sm">
                Federal grants and interest-free loans to help Canadian homeowners
                make energy-efficient upgrades, including solar panels.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-primary mb-2">Property Tax Exemption</h3>
              <p className="text-sm">
                In many Ontario municipalities, solar installations do not increase
                your property tax assessment, meaning free added home value.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

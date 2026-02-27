import type { Metadata } from "next";
import { Target, Eye, Leaf, Users } from "lucide-react";
import FinalCTA from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about StellarFlex SolarQuote — Ontario's trusted solar energy partner for homes and businesses. Our mission, values, and local expertise.",
};

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description: "No hidden fees, no pressure sales. What you see is what you get.",
  },
  {
    icon: Target,
    title: "Technology-First",
    description: "AI-powered quotes and cutting-edge solar equipment for optimal results.",
  },
  {
    icon: Users,
    title: "Local Expertise",
    description: "Deep knowledge of Ontario utilities, incentives, regulations, and weather.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Every installation brings Ontario closer to a clean energy future.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            About StellarFlex SolarQuote
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            We&apos;re on a mission to make solar energy accessible, affordable, and
            straightforward for every Ontario home and business.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-6">Our Story</h2>
          <div className="prose prose-lg text-neutral-600 space-y-4">
            <p>
              StellarFlex SolarQuote was founded with a simple observation: getting a
              solar quote in Ontario shouldn&apos;t be complicated. Too many homeowners
              and business owners were overwhelmed by confusing pricing, pushy sales
              tactics, and a lack of transparency.
            </p>
            <p>
              We built a platform that puts the power back in your hands. Our
              AI-powered quoting tool gives you an accurate, instant estimate — no
              phone calls, no home visits, no obligations. Just the information you
              need to make a smart decision about solar energy.
            </p>
            <p>
              What makes us different? We serve <strong>both residential and
              commercial</strong> customers with equal expertise. Whether you&apos;re a
              homeowner looking to lower your hydro bill or a business owner seeking
              ROI through clean energy, we have the right solution.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-400/10 rounded-xl mb-4">
                  <value.icon className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {value.title}
                </h3>
                <p className="text-neutral-500 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

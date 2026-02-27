import type { Metadata } from "next";
import { Star } from "lucide-react";
import FinalCTA from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Read what Ontario homeowners and businesses say about their StellarFlex SolarQuote experience. 4.9★ average rating.",
};

// Placeholder reviews — replace with real testimonials or pull from a CMS/database
const reviews = [
  {
    name: "Sarah M.",
    location: "Toronto, ON",
    type: "Residential",
    rating: 5,
    text: "The entire process was seamless. Got my quote online in minutes, and the installation team was professional and fast. My hydro bill dropped by 65%!",
  },
  {
    name: "David K.",
    location: "Ottawa, ON",
    type: "Residential",
    rating: 5,
    text: "I compared three solar companies and StellarFlex had the best pricing and most transparent process. No surprise costs. Highly recommend.",
  },
  {
    name: "Maria L.",
    location: "Hamilton, ON",
    type: "Commercial",
    rating: 5,
    text: "We installed solar on our warehouse roof and the ROI has been incredible. The business team really understood our needs and the tax implications.",
  },
  {
    name: "James R.",
    location: "Mississauga, ON",
    type: "Residential",
    rating: 4,
    text: "Great experience overall. The AI quote was surprisingly accurate compared to the final price. Only minor delays with municipal permits, which isn't their fault.",
  },
  {
    name: "Priya S.",
    location: "Brampton, ON",
    type: "Commercial",
    rating: 5,
    text: "Our retail location now runs almost entirely on solar. Customers love seeing the sustainability commitment, and the savings are real.",
  },
  {
    name: "Mike T.",
    location: "London, ON",
    type: "Residential",
    rating: 5,
    text: "From quote to installation in under 6 weeks. The Net Metering credits have been a great bonus — we're actually getting money back in summer months.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-blue-400 fill-blue-400" : "text-neutral-300"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Customer Reviews
          </h1>
          <p className="text-lg text-neutral-300">
            See what Ontario homeowners and businesses say about going solar with us.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm"
              >
                <StarRating rating={review.rating} />
                <p className="text-neutral-600 mt-3 mb-4 text-sm leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary text-sm">{review.name}</p>
                    <p className="text-xs text-neutral-400">{review.location}</p>
                  </div>
                  <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
                    {review.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

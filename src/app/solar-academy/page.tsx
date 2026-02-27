import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Solar Academy",
  description:
    "Learn everything about solar energy in Ontario. Guides on incentives, savings, installation, and more from StellarFlex SolarQuote.",
};

// Placeholder blog posts — will be replaced with MDX-based content in Phase 2
const posts = [
  {
    slug: "how-net-metering-works-ontario",
    title: "How Net Metering Works in Ontario",
    excerpt:
      "Net Metering lets you send excess solar energy back to the grid and earn credits. Here's how it works and why it matters for your savings.",
    category: "Ontario Incentives",
    readTime: "5 min",
    date: "2026-02-15",
  },
  {
    slug: "residential-vs-commercial-solar",
    title: "Residential vs. Commercial Solar: What's the Difference?",
    excerpt:
      "Both home and business solar systems generate clean energy, but the sizing, financing, and ROI work differently. Let's break it down.",
    category: "Solar Basics",
    readTime: "6 min",
    date: "2026-02-10",
  },
  {
    slug: "ontario-solar-incentives-2026",
    title: "Ontario Solar Incentives & Rebates in 2026",
    excerpt:
      "A complete guide to every incentive, grant, and tax benefit available to Ontario homeowners and businesses going solar this year.",
    category: "Ontario Incentives",
    readTime: "7 min",
    date: "2026-02-05",
  },
  {
    slug: "how-much-can-ontario-homeowner-save",
    title: "How Much Can an Ontario Homeowner Save with Solar?",
    excerpt:
      "We break down realistic savings estimates based on system size, location, and current hydro rates across Ontario.",
    category: "Savings & Finance",
    readTime: "5 min",
    date: "2026-01-28",
  },
  {
    slug: "is-your-roof-ready-for-solar",
    title: "Is Your Roof Ready for Solar? A Checklist",
    excerpt:
      "Not sure if your roof can support solar panels? Use this checklist to assess age, orientation, shading, and structural requirements.",
    category: "Residential Tips",
    readTime: "4 min",
    date: "2026-01-20",
  },
  {
    slug: "understanding-hydro-bill-going-solar",
    title: "Understanding Your Hydro Bill: A Guide for Going Solar",
    excerpt:
      "Before going solar, it helps to understand how your Ontario hydro bill works — TOU rates, delivery charges, and where solar fits in.",
    category: "Solar Basics",
    readTime: "6 min",
    date: "2026-01-15",
  },
];

export default function SolarAcademyPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Solar Academy
          </h1>
          <p className="text-lg text-neutral-300">
            Guides, tips, and insights to help you make the smartest solar decision
            for your Ontario property.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/solar-academy/${post.slug}`}
                className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Placeholder image area */}
                <div className="h-40 bg-gradient-to-br from-primary/10 to-cyan-400/10 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-primary/30" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-blue-500 uppercase tracking-wider">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold text-primary mt-1 mb-2 group-hover:text-blue-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

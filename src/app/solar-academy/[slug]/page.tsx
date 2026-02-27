import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FinalCTA from "@/components/sections/FinalCTA";

// Placeholder blog post page — will be replaced with MDX rendering in Phase 2
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/solar-academy"
            className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Solar Academy
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            {slug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </h1>

          <div className="prose prose-lg text-neutral-600 mt-8">
            <p>
              This article is coming soon. We&apos;re currently building out our
              Solar Academy content with detailed guides about solar energy in
              Ontario.
            </p>
            <p>
              In the meantime, check out our{" "}
              <Link href="/faq" className="text-blue-500 hover:underline">
                FAQ page
              </Link>{" "}
              for answers to common solar questions, or{" "}
              <Link href="/get-quote" className="text-blue-500 hover:underline">
                get a free quote
              </Link>{" "}
              to see how much you could save.
            </p>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

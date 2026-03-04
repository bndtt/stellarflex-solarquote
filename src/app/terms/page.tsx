import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "SolarQuote terms and conditions of service.",
};

export default function TermsPage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg text-neutral-600">
        <h1 className="text-3xl font-bold text-primary">Terms & Conditions</h1>
        <p className="text-sm text-neutral-400">Last updated: February 2026</p>

        <h2>Use of Website</h2>
        <p>
          By accessing and using the {SITE_CONFIG.name} website, you agree to comply
          with these terms and conditions. If you do not agree, please do not use our
          website.
        </p>

        <h2>Solar Quotes</h2>
        <p>
          Quotes provided through our website are estimates based on the information
          you provide and publicly available data. Final pricing may vary after a
          detailed site assessment. Quotes are not binding contracts.
        </p>

        <h2>Accuracy of Information</h2>
        <p>
          While we strive to keep all information on our website accurate and
          up-to-date, we cannot guarantee the accuracy of all content, including
          savings estimates, incentive information, and equipment specifications.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible
          for the content or practices of these external sites.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          {SITE_CONFIG.name} shall not be liable for any direct, indirect, incidental,
          or consequential damages arising from your use of this website or reliance on
          information provided herein.
        </p>

        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of the Province of Ontario and the
          federal laws of Canada applicable therein.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these terms, contact us at{" "}
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-blue-500">
            {SITE_CONFIG.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

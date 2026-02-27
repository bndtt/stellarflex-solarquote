import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "StellarFlex SolarQuote privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg text-neutral-600">
        <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
        <p className="text-sm text-neutral-400">Last updated: February 2026</p>

        <h2>Information We Collect</h2>
        <p>
          When you use our website or request a solar quote, we may collect your name,
          email address, phone number, property address, and electricity usage information.
        </p>

        <h2>How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide you with an accurate solar quote</li>
          <li>Contact you about your quote and our services</li>
          <li>Improve our website and services</li>
          <li>Send relevant communications (with your consent)</li>
        </ul>

        <h2>Data Protection</h2>
        <p>
          We comply with the Personal Information Protection and Electronic Documents
          Act (PIPEDA) and take reasonable measures to protect your personal data. We
          do not sell your information to third parties.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies and similar technologies for analytics (Google Analytics) and
          to improve your browsing experience. You can manage cookie preferences in
          your browser settings.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          Our website integrates with third-party services for quoting, analytics, and
          email. These services have their own privacy policies and data handling
          practices.
        </p>

        <h2>Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data. Contact
          us at{" "}
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-blue-500">
            {SITE_CONFIG.email}
          </a>{" "}
          to exercise these rights.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related inquiries, email us at{" "}
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-blue-500">
            {SITE_CONFIG.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

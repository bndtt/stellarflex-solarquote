import Link from "next/link";
import { Sun, Mail, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sun className="h-7 w-7 text-cyan-400" />
              <span className="text-lg font-bold">
                Stellar<span className="text-cyan-400">Flex</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-300 mb-4">
              {SITE_CONFIG.tagline}
            </p>
            {/* Social links */}
            <div className="flex gap-4">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-cyan-400 transition-colors"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-cyan-400 transition-colors"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-cyan-400 transition-colors"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-300 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-neutral-300">
                <Mail className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-cyan-400 transition-colors">
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-300">
                <Phone className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <a href={`tel:${SITE_CONFIG.phone}`} className="hover:text-cyan-400 transition-colors">
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-300">
                <MapPin className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Serving all of Ontario, Canada</span>
              </li>
            </ul>
          </div>

          {/* CTA column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Ready to Go Solar?
            </h3>
            <p className="text-sm text-neutral-300 mb-4">
              Get your free, instant solar quote in seconds. No obligation.
            </p>
            <Link
              href="/get-quote"
              className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20 btn-shine"
            >
              Get Free Quote
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-neutral-400">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

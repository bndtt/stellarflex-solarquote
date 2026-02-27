"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { AnimatePresence, motion } from "@/components/ui/Motion";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-lg"
        >
          <nav className="flex flex-col px-4 py-4 gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block px-4 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.05, duration: 0.2 }}
              className="pt-3 mt-2 border-t border-neutral-200"
            >
              <Link href="/get-quote" onClick={onClose}>
                <Button className="w-full">Get Quote</Button>
              </Link>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

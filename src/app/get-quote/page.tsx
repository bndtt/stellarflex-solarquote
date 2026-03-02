"use client";

import { useState, useEffect, useCallback } from "react";
import { Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import AddressInput from "@/components/ui/AddressInput";
import QuoteOrbitalView from "@/components/quote/QuoteOrbitalView";
import AILoadingAnimation from "@/components/quote/AILoadingAnimation";
import { AnimatePresence, motion } from "@/components/ui/Motion";
import type { QuoteUiPayload } from "@/types/quote";

export default function GetQuotePage() {
  const [type, setType] = useState<"residential" | "commercial">("residential");
  const [quoteResult, setQuoteResult] = useState<QuoteUiPayload | null>(null);

  const residentialEmbedUrl = process.env.NEXT_PUBLIC_QUOTE_EMBED_RESIDENTIAL;
  const commercialEmbedUrl = process.env.NEXT_PUBLIC_QUOTE_EMBED_COMMERCIAL;
  const embedUrl = type === "residential" ? residentialEmbedUrl : commercialEmbedUrl;
  const hasRealEmbed = embedUrl && !embedUrl.includes("provider.com");

  const handleReset = () => {
    setQuoteResult(null);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-5 right-5 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {quoteResult ? "Your Solar Quote" : "Get Your Free Solar Quote"}
          </h1>
          <p className="text-neutral-300 mb-8">
            {quoteResult
              ? `${type === "residential" ? "Residential" : "Commercial"} solar estimate for Ontario`
              : "Select your property type and get an instant AI-powered estimate."}
          </p>

          {/* Property Type Selector — only show before results */}
          {!quoteResult && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setType("residential")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                  type === "residential"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20",
                )}
              >
                <Home className="h-5 w-5" />
                I&apos;m a Homeowner
              </button>
              <button
                onClick={() => setType("commercial")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                  type === "commercial"
                    ? "bg-secondary text-white shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20",
                )}
              >
                <Building2 className="h-5 w-5" />
                I&apos;m a Business Owner
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {quoteResult ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <QuoteOrbitalView quote={quoteResult} onReset={handleReset} />
            </motion.div>
          ) : hasRealEmbed ? (
            <iframe
              src={embedUrl}
              className="w-full min-h-[700px] border-0 rounded-xl shadow-lg"
              title={`${type} solar quote`}
              loading="lazy"
            />
          ) : (
            <QuoteForm type={type} onQuoteGenerated={setQuoteResult} />
          )}
        </div>
      </section>
    </>
  );
}

// --- Quote Form ---

interface FormData {
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  monthlyBillRange: string;
  monthlyBillExact: string;
  useExactBill: boolean;
  monthlyKwhExact: string;
  useExactKwh: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

function QuoteForm({
  type,
  onQuoteGenerated,
}: {
  type: "residential" | "commercial";
  onQuoteGenerated: (quote: QuoteUiPayload) => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    address: "",
    city: "",
    latitude: null,
    longitude: null,
    monthlyBillRange: "$200 – $300",
    monthlyBillExact: "",
    useExactBill: false,
    monthlyKwhExact: "",
    useExactKwh: false,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  // Dual-gate: both API response and animation must finish
  const [apiDone, setApiDone] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [pendingQuote, setPendingQuote] = useState<QuoteUiPayload | null>(null);

  const update = (field: keyof FormData, value: string | boolean | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalSteps = 4;

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  // Reveal results only when both API and animation are done
  useEffect(() => {
    if (apiDone && animationDone && pendingQuote) {
      const timer = setTimeout(() => {
        setLoading(false);
        onQuoteGenerated(pendingQuote);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [apiDone, animationDone, pendingQuote, onQuoteGenerated]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setApiDone(false);
    setAnimationDone(false);
    setPendingQuote(null);

    try {
      const payload: Record<string, unknown> = {
        propertyType: type,
        address: formData.address,
        city: formData.city,
        province: "ON",
        latitude: formData.latitude,
        longitude: formData.longitude,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      };

      if (formData.useExactKwh && formData.monthlyKwhExact) {
        payload.electricityInputMethod = "kwh_exact";
        payload.monthlyKwhExact = parseFloat(formData.monthlyKwhExact);
      } else if (formData.useExactBill && formData.monthlyBillExact) {
        payload.electricityInputMethod = "bill_exact";
        payload.monthlyBillExact = parseFloat(formData.monthlyBillExact);
      } else {
        payload.electricityInputMethod = "bill_range";
        payload.monthlyBillRange = formData.monthlyBillRange;
      }

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Quote generation failed");
      }

      setPendingQuote(data.quote);
      setApiDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <AILoadingAnimation
            isLoading={loading}
            onMinimumTimeReached={handleAnimationComplete}
          />
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
        >
    <div className="bg-white rounded-xl border border-neutral-200 shadow-lg p-8 max-w-lg mx-auto">
      <div className="text-sm text-neutral-400 mb-2">
        Step {step} of {totalSteps} &middot;{" "}
        {type === "residential" ? "Residential" : "Commercial"} Quote
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-neutral-100 rounded-full mb-8">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Address */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-primary">Your Address</h3>
            <p className="text-sm text-neutral-500">
              Where is your property located in Ontario?
            </p>
            <AddressInput
              value={formData.address}
              onChange={(val) => update("address", val)}
              onSelect={(suggestion) => {
                setFormData((prev) => ({
                  ...prev,
                  address: suggestion.street,
                  city: suggestion.city,
                  latitude: suggestion.latitude,
                  longitude: suggestion.longitude,
                }));
              }}
              placeholder="Start typing your address..."
            />
            <input
              type="text"
              placeholder="City (auto-filled from address)"
              value={formData.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => setStep(2)}
              className="w-full"
              disabled={!formData.city.trim()}
            >
              Next
            </Button>
          </motion.div>
        )}

        {/* Step 2: Electricity Usage */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-primary">Electricity Usage</h3>
            <p className="text-sm text-neutral-500">
              How much electricity do you use? More precise data = more accurate quote.
            </p>

            {/* Toggle for input precision */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => { update("useExactBill", false); update("useExactKwh", false); }}
                className={cn(
                  "px-3 py-1.5 rounded-full border transition-colors",
                  !formData.useExactBill && !formData.useExactKwh
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-neutral-300 text-neutral-500",
                )}
              >
                Bill Range
              </button>
              <button
                onClick={() => { update("useExactBill", true); update("useExactKwh", false); }}
                className={cn(
                  "px-3 py-1.5 rounded-full border transition-colors",
                  formData.useExactBill && !formData.useExactKwh
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-neutral-300 text-neutral-500",
                )}
              >
                Exact Bill $
              </button>
              <button
                onClick={() => { update("useExactKwh", true); update("useExactBill", false); }}
                className={cn(
                  "px-3 py-1.5 rounded-full border transition-colors",
                  formData.useExactKwh
                    ? "bg-secondary text-white border-secondary"
                    : "border-neutral-300 text-neutral-500",
                )}
              >
                Exact kWh (Best)
              </button>
            </div>

            {!formData.useExactBill && !formData.useExactKwh && (
              <select
                value={formData.monthlyBillRange}
                onChange={(e) => update("monthlyBillRange", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Under $100</option>
                <option>$100 – $200</option>
                <option>$200 – $300</option>
                <option>$300 – $500</option>
                <option>$500+</option>
              </select>
            )}

            {formData.useExactBill && !formData.useExactKwh && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                <input
                  type="number"
                  placeholder="Monthly bill amount"
                  value={formData.monthlyBillExact}
                  onChange={(e) => update("monthlyBillExact", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.useExactKwh && (
              <>
                <input
                  type="number"
                  placeholder="Monthly kWh usage (check your hydro bill)"
                  value={formData.monthlyKwhExact}
                  onChange={(e) => update("monthlyKwhExact", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-secondary">
                  Tip: Find this on your Hydro bill under &quot;Total kWh Used&quot;
                </p>
              </>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1"
                disabled={
                  (formData.useExactBill && !formData.useExactKwh && !formData.monthlyBillExact) ||
                  (formData.useExactKwh && !formData.monthlyKwhExact)
                }
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-primary">Contact Information</h3>
            <p className="text-sm text-neutral-500">
              Optional — provide your contact to receive a copy of your quote.
            </p>
            <input
              type="text"
              placeholder="Full name"
              value={formData.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email address"
              value={formData.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-primary">Review & Get Quote</h3>

            {/* Summary */}
            <div className="bg-neutral-50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Property type</span>
                <span className="font-medium text-primary capitalize">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Location</span>
                <span className="font-medium text-primary">
                  {formData.city || "Ontario"}{formData.address ? `, ${formData.address}` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Electricity</span>
                <span className="font-medium text-primary">
                  {formData.useExactKwh && formData.monthlyKwhExact
                    ? `${formData.monthlyKwhExact} kWh/mo`
                    : formData.useExactBill && formData.monthlyBillExact
                      ? `$${formData.monthlyBillExact}/mo`
                      : formData.monthlyBillRange}
                </span>
              </div>
              {formData.contactName && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Contact</span>
                  <span className="font-medium text-primary">{formData.contactName}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-400">
              Your quote will be generated instantly using our AI-powered engine with
              Ontario-specific solar data, utility rates, and incentive programs.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
              >
                Get My Quote
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

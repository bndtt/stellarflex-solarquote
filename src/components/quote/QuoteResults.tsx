"use client";

import { useState, useEffect } from "react";
import { Sun, Zap, DollarSign, Calendar, AlertTriangle, Shield, TrendingUp, Info, Leaf, TreePine, Car, Home } from "lucide-react";
import type { QuoteUiPayload, Range } from "@/types/quote";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/ui/Motion";

interface QuoteResultsProps {
  quote: QuoteUiPayload;
  onReset: () => void;
}

export default function QuoteResults({ quote, onReset }: QuoteResultsProps) {
  return (
    <StaggerContainer stagger={0.12} className="max-w-4xl mx-auto space-y-6">
      {/* Quote Label & Confidence Banner */}
      <StaggerItem>
        <div
          className={cn(
            "rounded-xl p-4 border",
            quote.isRemoteEstimate
              ? "bg-amber-50 border-amber-200"
              : quote.overallConfidence >= 60
                ? "bg-green-50 border-green-200"
                : "bg-blue-50 border-blue-200",
          )}
        >
          <div className="flex items-start gap-3">
            {quote.isRemoteEstimate ? (
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {quote.quoteLabel} &middot; Confidence: {quote.overallConfidence}%
              </p>
              {quote.isRemoteEstimate && (
                <p className="text-xs text-amber-700 mt-1">
                  This estimate uses regional averages. For better accuracy, provide
                  your exact monthly kWh usage or book a free site consultation.
                </p>
              )}
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Warnings */}
      {quote.warnings.length > 0 && (
        <StaggerItem>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Notes</p>
            <ul className="text-xs text-neutral-500 space-y-1">
              {quote.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </StaggerItem>
      )}

      {/* Primary Results Grid */}
      <StaggerItem>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResultCard
            icon={Sun}
            label="System Size"
            value={quote.systemSizeKw}
            suffix=" kW"
            range={quote.ranges.systemSizeKw}
            unit="kW"
            color="text-blue-500"
          />
          <ResultCard
            icon={Zap}
            label="Annual Production"
            value={quote.annualProductionKwh}
            suffix=" kWh"
            range={quote.ranges.annualProductionKwh}
            unit="kWh"
            color="text-secondary"
          />
          <ResultCard
            icon={DollarSign}
            label="Net Cost"
            value={quote.netCost}
            prefix="$"
            range={quote.ranges.netCost}
            unit="$"
            rangePrefix="$"
            color="text-primary"
          />
          <ResultCard
            icon={Calendar}
            label="Payback Period"
            value={quote.paybackYears}
            suffix=" years"
            range={quote.ranges.paybackYears}
            unit="years"
            color="text-cyan-600"
          />
        </div>
      </StaggerItem>

      {/* Lifetime Savings Highlight */}
      <StaggerItem>
        <div className="bg-gradient-to-br from-secondary to-green-600 rounded-xl p-6 text-white text-center">
          <p className="text-sm font-medium text-green-100 uppercase tracking-wide mb-1">
            Your 25-Year Net Savings
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold">
            <AnimatedNumber value={quote.ranges.annualSavings.base * 25 - quote.netCost} prefix="$" />
          </p>
          <p className="text-sm text-green-100 mt-2">
            That&apos;s money back in your pocket after your system pays for itself
          </p>
        </div>
      </StaggerItem>

      {/* Savings Breakdown */}
      <StaggerItem>
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Projected Savings</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-300">Monthly Savings</p>
              <p className="text-2xl font-bold">
                <AnimatedNumber value={quote.monthlySavings} prefix="$" suffix="/mo" />
              </p>
              <RangeLabel range={quote.ranges.monthlySavings} prefix="$" />
            </div>
            <div>
              <p className="text-sm text-neutral-300">Annual Savings</p>
              <p className="text-2xl font-bold">
                <AnimatedNumber value={quote.annualSavings} prefix="$" suffix="/yr" />
              </p>
              <RangeLabel range={quote.ranges.annualSavings} prefix="$" />
            </div>
            <div>
              <p className="text-sm text-neutral-300">Total Installed Cost</p>
              <p className="text-2xl font-bold">
                <AnimatedNumber value={quote.totalInstalledCost} prefix="$" />
              </p>
              <RangeLabel range={quote.ranges.totalInstalledCost} prefix="$" />
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Environmental Impact */}
      <StaggerItem>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6">
          <h3 className="text-lg font-semibold text-emerald-800 mb-1 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            Your Environmental Impact
          </h3>
          <p className="text-sm text-emerald-600 mb-4">
            By going solar, you&apos;re making a real difference for the planet
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactCard
              icon={Leaf}
              value={quote.environmentalImpact.lifetimeCo2OffsetTonnes}
              unit="tonnes"
              label="CO2 Prevented"
              sublabel="over 25 years"
            />
            <ImpactCard
              icon={TreePine}
              value={quote.environmentalImpact.equivalentTreesPlanted}
              unit="trees"
              label="Equivalent Trees"
              sublabel="planted for 25 years"
            />
            <ImpactCard
              icon={Car}
              value={quote.environmentalImpact.equivalentCarsOffRoad}
              unit="cars"
              label="Cars Off the Road"
              sublabel="each year"
            />
            <ImpactCard
              icon={Home}
              value={quote.environmentalImpact.equivalentHomesElectrified}
              unit="homes"
              label="Homes Powered"
              sublabel="each year"
            />
          </div>
          <p className="text-xs text-emerald-500 mt-4 text-center">
            {quote.environmentalImpact.lifetimeCleanEnergyMwh.toLocaleString()} MWh of clean energy over 25 years
          </p>
        </div>
      </StaggerItem>

      {/* Incentives */}
      <StaggerItem>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Estimated Incentives
          </h3>
          <p className="text-2xl font-bold text-secondary mb-1">
            <AnimatedNumber value={quote.totalIncentives} prefix="$" />
          </p>
          <RangeLabel range={quote.ranges.totalIncentives} prefix="$" className="text-neutral-500" />
          <p className="text-xs text-neutral-400 mt-2">
            Includes applicable government rebates, tax credits, and incentive programs. Subject to eligibility and program availability.
          </p>
        </div>
      </StaggerItem>

      {/* Financing Options */}
      {quote.financing.length > 0 && (
        <StaggerItem>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Financing Options</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {quote.financing.map((option) => (
                <div
                  key={option.type}
                  className="border border-neutral-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-primary text-sm">{option.label}</h4>
                  {option.type === "cash" ? (
                    <p className="text-xl font-bold text-primary mt-2">
                      ${option.downPayment.toLocaleString()}
                    </p>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-primary mt-2">
                        ${option.monthlyPayment.base}/mo
                      </p>
                      <p className="text-xs text-neutral-400">
                        {option.termYears} year term
                        {option.interestRate ? ` @ ${option.interestRate}%` : ""}
                      </p>
                    </>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    Down payment: ${option.downPayment.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>
      )}

      {/* Confidence Breakdown */}
      <StaggerItem>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Estimate Confidence</h3>
          <div className="space-y-3">
            <ConfidenceBar label="Input Quality" value={quote.confidenceBreakdown.inputQualityConfidence} delay={0} />
            <ConfidenceBar label="Roof Geometry" value={quote.confidenceBreakdown.roofGeometryConfidence} delay={100} />
            <ConfidenceBar label="Shading" value={quote.confidenceBreakdown.shadingConfidence} delay={200} />
            <ConfidenceBar label="Tariff / Rates" value={quote.confidenceBreakdown.tariffConfidence} delay={300} />
            <ConfidenceBar label="Incentives" value={quote.confidenceBreakdown.incentivesConfidence} delay={400} />
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Confidence improves with exact kWh data and a professional site survey.
          </p>
        </div>
      </StaggerItem>

      {/* Actions */}
      <StaggerItem>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-6 py-3 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors active:scale-[0.98]"
          >
            Get Another Quote
          </button>
          <a
            href={`mailto:hello@stellarflexsolarquote.com?subject=Solar Quote ${quote.propertyType}&body=I received a ${quote.quoteLabel} for ${quote.systemSizeKw} kW. I'd like to discuss next steps.`}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-lg text-sm font-semibold text-center transition-all duration-300 active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-blue-500/20"
          >
            Discuss This Quote
          </a>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}

// --- Sub-components ---

function ResultCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  range,
  unit,
  rangePrefix,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  range: Range;
  unit: string;
  rangePrefix?: string;
  color: string;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-200/60 p-4 hover-glow">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-xs text-neutral-500 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-primary">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
      <RangeLabel range={range} unit={unit} prefix={rangePrefix} />
    </div>
  );
}

function RangeLabel({
  range,
  unit,
  prefix,
  className,
}: {
  range: Range;
  unit?: string;
  prefix?: string;
  className?: string;
}) {
  const fmt = (n: number) => {
    const formatted = n >= 1000 ? n.toLocaleString() : n.toString();
    return prefix ? `${prefix}${formatted}` : formatted;
  };
  return (
    <p className={cn("text-xs text-neutral-400 mt-0.5", className)}>
      Range: {fmt(range.low)} – {fmt(range.high)} {unit && !prefix ? unit : ""}
    </p>
  );
}

function ImpactCard({
  icon: Icon,
  value,
  unit,
  label,
  sublabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  unit: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="bg-white/70 rounded-lg p-4 text-center">
      <Icon className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-emerald-800">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-xs font-semibold text-emerald-700 uppercase">{unit}</p>
      <p className="text-xs text-emerald-600 mt-1">{label}</p>
      <p className="text-[10px] text-emerald-400">{sublabel}</p>
    </div>
  );
}

function ConfidenceBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100 + delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="font-medium text-neutral-700">{value}%</span>
      </div>
      <div className="w-full h-2 bg-neutral-100 rounded-full">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            value >= 70 ? "bg-secondary shadow-sm shadow-secondary/30" : value >= 40 ? "bg-blue-500 shadow-sm shadow-blue-500/30" : "bg-red-400",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

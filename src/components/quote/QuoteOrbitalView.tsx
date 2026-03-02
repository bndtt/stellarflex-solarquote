"use client";

import { Sun, Zap, DollarSign, TrendingUp, Calendar, Leaf, Shield, AlertTriangle } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import type { TimelineItem } from "@/components/ui/radial-orbital-timeline";
import type { QuoteUiPayload, Range } from "@/types/quote";
import { cn } from "@/lib/utils";

interface QuoteOrbitalViewProps {
  quote: QuoteUiPayload;
  onReset: () => void;
}

function fmtRange(range: Range, prefix = "", suffix = ""): string {
  const fmt = (n: number) => n >= 1000 ? n.toLocaleString() : n.toString();
  return `Range: ${prefix}${fmt(range.low)}${suffix} – ${prefix}${fmt(range.high)}${suffix}`;
}

export default function QuoteOrbitalView({ quote, onReset }: QuoteOrbitalViewProps) {
  const timelineData: TimelineItem[] = [
    {
      id: 1,
      title: "System Size",
      date: `${quote.systemSizeKw} kW`,
      content: `Your optimal system is ${quote.systemSizeKw} kW. ${fmtRange(quote.ranges.systemSizeKw, "", " kW")}`,
      category: "System",
      icon: Sun,
      relatedIds: [2, 3],
      status: "completed",
      energy: quote.confidenceBreakdown.inputQualityConfidence,
    },
    {
      id: 2,
      title: "Production",
      date: `${quote.annualProductionKwh.toLocaleString()} kWh/yr`,
      content: `Estimated annual energy production of ${quote.annualProductionKwh.toLocaleString()} kWh per year. ${fmtRange(quote.ranges.annualProductionKwh, "", " kWh")}`,
      category: "Production",
      icon: Zap,
      relatedIds: [1, 4],
      status: "completed",
      energy: quote.confidenceBreakdown.roofGeometryConfidence,
    },
    {
      id: 3,
      title: "Net Cost",
      date: `$${quote.netCost.toLocaleString()}`,
      content: `Net cost after incentives: $${quote.netCost.toLocaleString()}. Total installed: $${quote.totalInstalledCost.toLocaleString()}. ${fmtRange(quote.ranges.netCost, "$")}`,
      category: "Cost",
      icon: DollarSign,
      relatedIds: [1, 5],
      status: "completed",
      energy: quote.confidenceBreakdown.tariffConfidence,
    },
    {
      id: 4,
      title: "Savings",
      date: `$${quote.monthlySavings}/mo`,
      content: `Monthly savings: $${quote.monthlySavings}/mo. Annual savings: $${quote.annualSavings.toLocaleString()}/yr. 25-year net savings: $${(quote.ranges.annualSavings.base * 25 - quote.netCost).toLocaleString()}.`,
      category: "Savings",
      icon: TrendingUp,
      relatedIds: [2, 5],
      status: "completed",
      energy: quote.confidenceBreakdown.tariffConfidence,
    },
    {
      id: 5,
      title: "Payback",
      date: `${quote.paybackYears} years`,
      content: `Your system pays for itself in ${quote.paybackYears} years. ${fmtRange(quote.ranges.paybackYears, "", " years")}. After payback, it's pure savings.`,
      category: "Payback",
      icon: Calendar,
      relatedIds: [3, 4],
      status: "completed",
      energy: quote.confidenceBreakdown.incentivesConfidence,
    },
    {
      id: 6,
      title: "Environment",
      date: `${quote.environmentalImpact.lifetimeCo2OffsetTonnes}t CO2`,
      content: `${quote.environmentalImpact.lifetimeCo2OffsetTonnes} tonnes CO2 prevented. Equivalent to ${quote.environmentalImpact.equivalentTreesPlanted} trees planted, ${quote.environmentalImpact.equivalentCarsOffRoad} cars off the road, and powering ${quote.environmentalImpact.equivalentHomesElectrified} homes.`,
      category: "Environment",
      icon: Leaf,
      relatedIds: [2],
      status: "completed",
      energy: 85,
    },
    {
      id: 7,
      title: "Incentives",
      date: `$${quote.totalIncentives.toLocaleString()}`,
      content: `Estimated incentives: $${quote.totalIncentives.toLocaleString()}. ${fmtRange(quote.ranges.totalIncentives, "$")}. Includes government rebates, tax credits, and incentive programs.`,
      category: "Incentives",
      icon: Shield,
      relatedIds: [3, 5],
      status: "completed",
      energy: quote.confidenceBreakdown.incentivesConfidence,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Confidence banner */}
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
            <p className="text-xs text-neutral-500 mt-1">
              Click on any orbiting node to explore your quote details
            </p>
          </div>
        </div>
      </div>

      {/* Orbital timeline */}
      <RadialOrbitalTimeline timelineData={timelineData} />

      {/* Action buttons */}
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
    </div>
  );
}

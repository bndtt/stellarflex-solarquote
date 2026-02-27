// POST /api/quote — Generates a solar quote from user input
import { NextResponse } from "next/server";
import { generateQuote, mapQuoteOutputToUiPayload } from "@/lib/quote-engine";
import type { QuoteInput } from "@/types/quote";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<QuoteInput>;

    // Generate the full quote
    const quoteOutput = await generateQuote(body);

    // Map to UI-friendly payload
    const uiPayload = mapQuoteOutputToUiPayload(quoteOutput);

    return NextResponse.json({
      success: true,
      quote: uiPayload,
      fullQuote: quoteOutput, // Include full output for debugging/advanced display
    });
  } catch (error) {
    console.error("Quote generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate quote. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

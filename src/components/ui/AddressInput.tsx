"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressSuggestion {
  displayName: string;
  street: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressInput({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing your address...",
  className,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const encoded = encodeURIComponent(`${query}, Ontario, Canada`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=5&countrycodes=ca`,
        {
          headers: {
            "Accept-Language": "en",
            // Nominatim requires a User-Agent for their usage policy
            "User-Agent": "StellarFlexSolarQuote/1.0",
          },
        },
      );

      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      const data = await response.json();

      const mapped: AddressSuggestion[] = data
        .filter((item: Record<string, unknown>) => item.address)
        .map((item: Record<string, unknown>) => {
          const addr = item.address as Record<string, string>;
          const houseNumber = addr.house_number || "";
          const road = addr.road || "";
          const street = [houseNumber, road].filter(Boolean).join(" ");
          const city =
            addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || "";

          return {
            displayName: item.display_name as string,
            street: street || (item.display_name as string).split(",")[0],
            city,
            latitude: parseFloat(item.lat as string),
            longitude: parseFloat(item.lon as string),
          };
        })
        .filter((s: AddressSuggestion) => s.city); // Only show results with a city

      setSuggestions(mapped);
      setIsOpen(mapped.length > 0);
      setActiveIndex(-1);
    } catch {
      // API unreachable — fail silently, plain text input still works
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(newValue: string) {
    onChange(newValue);

    // Debounce the API call (300ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(newValue);
    }, 300);
  }

  function handleSelect(suggestion: AddressSuggestion) {
    onChange(suggestion.street);
    onSelect(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent",
            className,
          )}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm transition-colors",
                  index === activeIndex
                    ? "bg-accent/10 text-primary"
                    : "hover:bg-neutral-50 text-neutral-700",
                )}
              >
                <span className="font-medium">{suggestion.street}</span>
                {suggestion.city && (
                  <span className="text-neutral-400 ml-1">
                    — {suggestion.city}, ON
                  </span>
                )}
              </button>
            </li>
          ))}
          <li className="px-4 py-1.5 text-[10px] text-neutral-300 border-t border-neutral-100">
            Powered by OpenStreetMap
          </li>
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type IndianLanguage = {
  code: string;
  name: string;
  nativeName: string;
  popular?: boolean;
};

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  { code: "en", name: "English", nativeName: "English", popular: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", popular: true },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", popular: true },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", popular: true },
  { code: "mr", name: "Marathi", nativeName: "मराठी", popular: true },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", popular: true },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", popular: true },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", popular: true },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", popular: true },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", popular: true },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली" },
  { code: "bho", name: "Bhojpuri", nativeName: "भोजपुरी" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر" },
];

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay?: boolean; includedLanguages?: string },
          containerId: string,
        ) => void;
        InlineLayout?: { SIMPLE: number };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function clearTranslationCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
    window.location.hostname;
}

function setTranslationCookie(langCode: string) {
  if (typeof document === "undefined") return;
  if (langCode === "en") {
    document.cookie = "googtrans=/en/en; path=/;";
  } else {
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
  }
}

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize and ensure English is default on every page load/refresh
  useEffect(() => {
    // Clear existing translation cookie so default is ALWAYS English on refresh
    clearTranslationCookie();

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
          },
          "google_translate_element",
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    setOpen(false);
    setSearch("");

    const setComboValue = () => {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
        return true;
      }
      return false;
    };

    setTranslationCookie(langCode);

    if (!setComboValue()) {
      // Retry once combo is loaded
      setTimeout(setComboValue, 300);
      setTimeout(setComboValue, 800);
    }
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()),
  );

  const currentLanguageObj =
    INDIAN_LANGUAGES.find((l) => l.code === selectedLang) ?? INDIAN_LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden container for Google Translate widget */}
      <div id="google_translate_element" className="hidden" />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-900 active:scale-95 sm:px-3 sm:py-1.5",
          open && "border-sky-400 bg-sky-50 ring-2 ring-sky-200",
        )}
        aria-label="Select Language"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5 text-sky-600 sm:h-4 sm:w-4" />
        <span className="notranslate font-medium tracking-tight" translate="no">
          {currentLanguageObj.nativeName}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-slate-400 transition-transform duration-200",
            open && "rotate-180 text-sky-600",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 sm:w-80">
          {/* Header & Search */}
          <div className="border-b border-slate-100 p-1.5 pb-2">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Language
              </span>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                All India
              </span>
            </div>
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language / भाषा खोजें..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                autoFocus
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            {filteredLanguages.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">No language found</p>
            ) : (
              <div className="grid grid-cols-1 gap-0.5">
                {filteredLanguages.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "bg-sky-100/90 text-sky-900 font-bold"
                          : "text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="notranslate text-sm font-semibold" translate="no">
                          {lang.nativeName}
                        </span>
                        <span className="text-[11px] text-slate-500">{lang.name}</span>
                      </div>
                      {isSelected ? <Check className="h-4 w-4 text-sky-700" /> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

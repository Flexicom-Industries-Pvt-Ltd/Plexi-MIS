"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useIsEntrySheet } from "@/hooks/useIsEntrySheet";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "plascom-mis-pwa-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PwaInstallPrompt() {
  const isEntrySheet = useIsEntrySheet();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onInstallable = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHint(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onInstallable);

    if (isIos()) {
      const timer = window.setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 2500);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onInstallable);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onInstallable);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
    setIosHint(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      }
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  }, [deferred]);

  if (!visible || isStandalone()) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-50 border-sky-200 bg-gradient-to-r from-sky-700 to-sky-600 p-4 text-white shadow-lg",
        isEntrySheet ? "top-[57px] border-b" : "bottom-0 border-t safe-bottom-pad",
      )}
      role="dialog"
      aria-label="Install app"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
          <Image src="/icon.png" alt="" width={40} height={40} className="h-full w-full object-contain" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Install Plascom MIS</p>
          <p className="mt-0.5 text-sm text-sky-100">
            {iosHint
              ? "Tap Share, then “Add to Home Screen” for quick factory access."
              : "Add to your home screen for fast daily entry — works like a native app."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!iosHint ? (
              <button
                type="button"
                onClick={install}
                disabled={!deferred || installing}
                className="min-h-[44px] rounded-xl bg-white px-4 py-2 text-sm font-bold text-sky-800 disabled:opacity-70"
              >
                {installing ? "Installing..." : "Install Now"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="min-h-[44px] rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-2 hover:bg-white/10"
          aria-label="Dismiss install prompt"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

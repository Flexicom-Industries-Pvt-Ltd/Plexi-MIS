"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clearAllCaches } from "@/lib/mis/mis-day-cache";
import { cn } from "@/lib/utils";

const UNLOCK_KEY = "plascom-mis-admin-key";
const UNLOCK_TTL_MS = 30 * 60 * 1000;
const TAP_TARGET = 7;
const TAP_WINDOW_MS = 4000;

type UnlockState = {
  key: string;
  expiresAt: number;
};

function readUnlock(): UnlockState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UNLOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UnlockState;
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(UNLOCK_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeUnlock(key: string) {
  const payload: UnlockState = { key, expiresAt: Date.now() + UNLOCK_TTL_MS };
  sessionStorage.setItem(UNLOCK_KEY, JSON.stringify(payload));
}

export function HiddenAdminPanel() {
  const router = useRouter();
  const tapTimes = useRef<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [unlocked, setUnlocked] = useState<UnlockState | null>(null);
  const [busy, setBusy] = useState<"purge" | "simulate" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmPurge, setConfirmPurge] = useState("");

  useEffect(() => {
    setMounted(true);
    setUnlocked(readUnlock());
    fetch("/api/mis/admin/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setEnabled(Boolean(json.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const registerTap = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    tapTimes.current = [...tapTimes.current.filter((time) => now - time < TAP_WINDOW_MS), now];
    if (tapTimes.current.length >= TAP_TARGET) {
      tapTimes.current = [];
      setOpen(true);
      setMessage(null);
      setError(null);
    }
  }, [enabled]);

  const verifyKey = useCallback(async () => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/mis/admin/verify", {
        method: "POST",
        headers: { "x-mis-admin-key": adminKey },
      });
      if (!res.ok) {
        setError("Invalid admin key.");
        return;
      }
      writeUnlock(adminKey);
      setUnlocked(readUnlock());
      setMessage("Admin tools unlocked for this session.");
    } catch {
      setError("Could not verify admin key.");
    }
  }, [adminKey]);

  const runAction = useCallback(
    async (action: "purge" | "simulate") => {
      const key = unlocked?.key ?? adminKey;
      if (!key || !unlocked) {
        setError("Enter and verify the admin key first.");
        return;
      }

      setBusy(action);
      setError(null);
      setMessage(null);

      try {
        const res = await fetch(`/api/mis/admin/${action}`, {
          method: "POST",
          headers: { "x-mis-admin-key": key },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Action failed");

        clearAllCaches();
        if (action === "purge") {
          setMessage(`Deleted ${json.deletedDays ?? 0} MIS day(s).`);
          setConfirmPurge("");
        } else {
          setMessage(
            `Created ${json.createdDays} demo day(s) from ${json.templateSource}: ${(json.dates as string[]).join(", ")}`,
          );
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      } finally {
        setBusy(null);
      }
    },
    [adminKey, router, unlocked],
  );

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex max-h-[min(92dvh,760px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Hidden admin tools"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Hidden Admin Tools</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Factory-only controls. Tap logo 7 times to open.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {!enabled ? (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    Admin tools are disabled. Set <code className="font-mono">MIS_ADMIN_SECRET</code> on the server.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <label className="text-sm font-semibold text-slate-800" htmlFor="admin-key">
                        Step 1 — Admin key
                      </label>
                      <p className="text-xs text-slate-600">
                        Enter the secret key, then tap Unlock before using the tools below.
                      </p>
                      <input
                        id="admin-key"
                        type="password"
                        value={adminKey}
                        onChange={(event) => setAdminKey(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base"
                        placeholder="Enter secret key"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={verifyKey}
                        className="min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Unlock
                      </button>
                      {unlocked ? (
                        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                          Unlocked for 30 minutes.
                        </p>
                      ) : null}
                    </div>

                    <div
                      className={cn(
                        "space-y-3 rounded-2xl border border-red-200 bg-red-50/70 p-4",
                        !unlocked && "pointer-events-none opacity-50",
                      )}
                    >
                      <p className="text-sm font-semibold text-red-900">Step 2 — Kill switch</p>
                      <p className="text-xs text-red-800">
                        Permanently deletes every MIS day, all four sheets, and all history.
                      </p>
                      <input
                        type="text"
                        value={confirmPurge}
                        onChange={(event) => setConfirmPurge(event.target.value)}
                        disabled={!unlocked}
                        className="w-full rounded-xl border border-red-200 bg-white px-3 py-3 text-base"
                        placeholder="Type DELETE to confirm"
                      />
                      <button
                        type="button"
                        disabled={!unlocked || busy !== null || confirmPurge !== "DELETE"}
                        onClick={() => runAction("purge")}
                        className={cn(
                          "min-h-[44px] w-full rounded-xl px-4 py-2 text-sm font-bold text-white",
                          confirmPurge === "DELETE" && unlocked
                            ? "bg-red-700 hover:bg-red-800"
                            : "bg-red-300",
                        )}
                      >
                        {busy === "purge" ? "Deleting..." : "Delete all MIS data"}
                      </button>
                    </div>

                    <div
                      className={cn(
                        "space-y-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4",
                        !unlocked && "pointer-events-none opacity-50",
                      )}
                    >
                      <p className="text-sm font-semibold text-sky-900">Step 3 — Simulate 6 days</p>
                      <p className="text-xs text-sky-800">
                        Fills the last 6 days (not today) using yesterday&apos;s data pattern with small daily variation.
                      </p>
                      <button
                        type="button"
                        disabled={!unlocked || busy !== null}
                        onClick={() => runAction("simulate")}
                        className="min-h-[44px] w-full rounded-xl bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-60"
                      >
                        {busy === "simulate" ? "Simulating..." : "Simulate 6 days"}
                      </button>
                    </div>

                    {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
                    {error ? <p className="text-sm text-red-700">{error}</p> : null}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={registerTap}
        className="flex shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white p-1 shadow-sm"
        aria-label="Plascom MIS home"
      >
        <img src="/icon.png" alt="" className="h-9 w-9 object-contain" />
      </button>
      {modal}
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/api-client";
import { createSpin } from "@/lib/api/endpoints";
import type { SpinResponse } from "@/types/api";

type SlotSymbol = "cherry" | "lemon" | "apple" | "banana" | "?";

type ReelTuple = [SlotSymbol, SlotSymbol, SlotSymbol];

const BET_OPTIONS = [
  "0.50",
  "1.00",
  "1.50",
  "2.00",
  "2.50",
  "3.00",
  "3.50",
  "4.00",
  "4.50",
  "5.00",
];

const SYMBOLS: SlotSymbol[] = ["cherry", "lemon", "apple", "banana"];

const SYMBOL_EMOJI: Record<SlotSymbol, string> = {
  cherry: "🍒",
  lemon: "🍋",
  apple: "🍎",
  banana: "🍌",
  "?": "?",
};

interface SlotMachinePanelProps {
  gameId: string;
  balance: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  onSpinComplete: () => Promise<void>;
}

export function SlotMachinePanel({
  gameId,
  balance,
  isAuthenticated,
  isAuthLoading,
  onSpinComplete,
}: SlotMachinePanelProps) {
  const [betAmount, setBetAmount] = useState("1.00");

  const [displayReels, setDisplayReels] = useState<ReelTuple>([
    "cherry",
    "lemon",
    "banana",
  ]);

  const [spinResult, setSpinResult] = useState<SpinResponse | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [isLeverPulled, setIsLeverPulled] = useState(false);
  const [floatingResult, setFloatingResult] = useState<{
    id: number;
    amount: string;
    type: "win" | "loss";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const floatingResultTimeoutRef = useRef<number | null>(null);

  function showFloatingResult(result: {
    amount: string;
    type: "win" | "loss";
  }) {
    if (floatingResultTimeoutRef.current !== null) {
      window.clearTimeout(floatingResultTimeoutRef.current);
    }

    const resultId = Date.now();

    setFloatingResult({
      id: resultId,
      amount: result.amount,
      type: result.type,
    });

    floatingResultTimeoutRef.current = window.setTimeout(() => {
      setFloatingResult((current) => {
        if (current?.id !== resultId) {
          return current;
        }

        return null;
      });

      floatingResultTimeoutRef.current = null;
    }, 5000);
  }

  useEffect(() => {
    return () => {
      if (floatingResultTimeoutRef.current !== null) {
        window.clearTimeout(floatingResultTimeoutRef.current);
      }
    };
  }, []);

  const canSpin =
    isAuthenticated && balance !== null && Number(balance) >= Number(betAmount);

  const winAmount = spinResult?.grossWinnings ?? "0.00";
  const netAmount = spinResult?.netResult ?? "0.00";
  const multiplier = spinResult?.payoutMultiplier ?? "0.00";

  const isWin = Number(netAmount) > 0;

  async function handlePullLever() {
    if (!isAuthenticated) {
      setError("Please login before spinning");
      return;
    }

    if (!canSpin) {
      setError("Insufficient balance");
      return;
    }

    setError(null);
    setSpinResult(null);
    setFloatingResult(null);

    if (floatingResultTimeoutRef.current !== null) {
      window.clearTimeout(floatingResultTimeoutRef.current);
      floatingResultTimeoutRef.current = null;
    }
    setIsSpinning(true);
    setIsLeverPulled(true);

    const intervalId = window.setInterval(() => {
      setDisplayReels(getRandomReels());
    }, 80);

    try {
      const [response] = await Promise.all([
        createSpin({
          gameId,
          betAmount,
          idempotencyKey: createIdempotencyKey(),
        }),
        sleep(1500),
      ]);

      window.clearInterval(intervalId);

      setDisplayReels([
        response.reels[0] as SlotSymbol,
        response.reels[1] as SlotSymbol,
        response.reels[2] as SlotSymbol,
      ]);

      setSpinResult(response);

      const grossWinnings = Number(response.grossWinnings);

      showFloatingResult({
        amount: grossWinnings > 0 ? response.grossWinnings : response.betAmount,
        type: grossWinnings > 0 ? "win" : "loss",
      });

      await onSpinComplete();
    } catch (caughtError) {
      window.clearInterval(intervalId);

      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError("Spin could not be completed");
      }
    } finally {
      setIsSpinning(false);

      window.setTimeout(() => {
        setIsLeverPulled(false);
      }, 350);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[500px] overflow-visible md:max-w-[560px] lg:max-w-[600px] xl:max-w-[500px]">
      {floatingResult && (
        <div
          key={floatingResult.id}
          className={`slot-floating-result absolute -right-2 top-4 z-30 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black shadow-2xl md:-right-16 ${
            floatingResult.type === "win"
              ? "border-emerald-400 bg-emerald-950 text-emerald-200 shadow-emerald-950/50"
              : "border-red-400 bg-red-950 text-red-200 shadow-red-950/50"
          }`}
        >
          <span>{floatingResult.type === "win" ? "+" : "-"}</span>

          <span>🪙</span>

          <span>{floatingResult.amount}</span>
        </div>
      )}
      <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.22),rgba(127,29,29,0.22),transparent_70%)] blur-2xl" />

      <section className="relative rounded-[2rem] border border-red-950 bg-gradient-to-b from-red-700 via-red-950 to-zinc-950 p-3 shadow-2xl shadow-red-950/40">
        <div className="rounded-[1.7rem] border-4 border-yellow-500/80 bg-gradient-to-b from-red-700 to-red-950 p-2.5 shadow-inner">
          <header className="rounded-2xl border border-yellow-300/40 bg-zinc-950 px-4 py-2.5 shadow-inner">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-300">
                  Jackpot Slot
                </p>

                <h2 className="mt-1 truncate text-lg font-black text-white">
                  Pull to Spin
                </h2>
              </div>

              <div className="rounded-xl border border-yellow-500/30 bg-yellow-400/10 px-3 py-1.5 text-right">
                <p className="text-base font-black text-white">Balance</p>

                <p className="text-lg font-black text-white">
                  {isAuthLoading ? "..." : balance ? balance : "--"}
                </p>
              </div>
            </div>
          </header>

          <div className="relative mt-3 rounded-[1.5rem] border-4 border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-700 p-2.5 shadow-xl">
            <div className="absolute left-1/2 top-1/2 h-1 w-[92%] -translate-x-1/2 -translate-y-1/2 bg-red-500/50 shadow-[0_0_18px_rgba(239,68,68,0.8)]" />

            <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-zinc-950 p-2.5">
              {displayReels.map((symbol, index) => (
                <div
                  key={index}
                  className={`flex aspect-square items-center justify-center rounded-2xl border-4 border-zinc-800 bg-gradient-to-b from-white via-zinc-100 to-zinc-300 text-4xl shadow-inner ${
                    isSpinning ? "reel-spinning" : "reel-settled"
                  }`}
                >
                  <span className="drop-shadow-md">{SYMBOL_EMOJI[symbol]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 rounded-2xl border border-yellow-500/30 bg-zinc-950/75 p-2.5">
            <div className="grid grid-cols-4 gap-2">
              <HudMetric label="Bet" value={betAmount} />

              <HudMetric
                label="Win"
                value={winAmount}
                tone={Number(winAmount) > 0 ? "win" : undefined}
              />

              <HudMetric
                label="Net"
                value={netAmount}
                tone={
                  Number(netAmount) > 0
                    ? "win"
                    : Number(netAmount) < 0
                      ? "loss"
                      : undefined
                }
              />

              <HudMetric
                label="X"
                value={`x${multiplier}`}
                tone={isWin ? "win" : undefined}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_96px]">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Bet amount
                </label>

                <select
                  value={betAmount}
                  disabled={isSpinning}
                  onChange={(event) => setBetAmount(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm font-semibold text-white outline-none focus:border-yellow-400 disabled:opacity-60"
                >
                  {BET_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  disabled={isSpinning || !isAuthenticated || !canSpin}
                  onClick={() => void handlePullLever()}
                  className="h-12 w-full bg-yellow-400 px-5 text-sm font-black uppercase tracking-wide text-red-950 shadow-lg shadow-yellow-950/30 hover:bg-amber-300 sm:h-11"
                >
                  {isSpinning ? "..." : "Pull"}
                </Button>
              </div>
            </div>

            {spinResult && (
              <div
                className={`rounded-xl border px-3 py-2 text-center text-sm font-bold ${
                  isWin
                    ? "border-emerald-900 bg-emerald-950 text-emerald-200"
                    : "border-red-900 bg-red-950 text-red-200"
                }`}
              >
                {isWin
                  ? `You won ${spinResult.grossWinnings}!`
                  : `You lost ${spinResult.betAmount}. Try again.`}
              </div>
            )}

            {!isAuthenticated && !isAuthLoading && (
              <Alert variant="warning" className="px-3 py-2 text-xs">
                Login required.{" "}
                <Link
                  href="/login"
                  className="font-semibold text-amber-300 hover:text-amber-200"
                >
                  Go to login
                </Link>
              </Alert>
            )}

            {isAuthenticated && !canSpin && (
              <Alert variant="error" className="px-3 py-2 text-xs">
                Balance is lower than selected bet.
              </Alert>
            )}

            {error && <Alert variant="error">{error}</Alert>}
          </div>
        </div>
      </section>

      <button
        type="button"
        disabled={isSpinning || !isAuthenticated || !canSpin}
        onClick={() => void handlePullLever()}
        className={`slot-lever absolute -right-11 top-24 hidden h-40 w-12 xl:block ${
          isLeverPulled ? "slot-lever-pulled" : ""
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label="Pull slot machine lever"
      >
        <span className="slot-lever-track" />

        <span className="slot-lever-assembly">
          <span className="slot-lever-rod">
            <span className="slot-lever-knob" />
          </span>
        </span>
      </button>
    </div>
  );
}

function HudMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "win" | "loss";
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-base font-black ${
          tone === "win"
            ? "text-emerald-300"
            : tone === "loss"
              ? "text-red-300"
              : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getRandomReels(): ReelTuple {
  return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
}

function getRandomSymbol(): SlotSymbol {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function createIdempotencyKey(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

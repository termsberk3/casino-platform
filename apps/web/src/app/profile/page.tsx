"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  convertMyBalance,
  getMyFavorites,
  getSpinHistory,
} from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/api-client";
import { useAuth } from "@/providers/auth-provider";
import type {
  Game,
  MyBalanceConversionResponse,
  SpinHistoryItem,
} from "@/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

const CURRENCY_OPTIONS = ["EUR", "USD", "TRY", "GBP"];

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [favorites, setFavorites] = useState<Game[]>([]);
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [conversion, setConversion] =
    useState<MyBalanceConversionResponse | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    let isMounted = true;

    if (!isAuthenticated) {
      void Promise.resolve().then(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }

    async function loadProfileData() {
      setIsLoadingData(true);
      setError(null);

      try {
        const [favoritesResponse, historyResponse] = await Promise.all([
          getMyFavorites(),
          getSpinHistory(),
        ]);

        if (!isMounted) {
          return;
        }

        setFavorites(favoritesResponse.items);
        setSpinHistory(historyResponse.items);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        if (caughtError instanceof ApiError) {
          setError(caughtError.message);
        } else {
          setError("Profile data could not be loaded");
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    void loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      let isMounted = true;

      void Promise.resolve().then(() => {
        if (isMounted) {
          setConversion(null);
        }
      });

      return () => {
        isMounted = false;
      };
    }

    let isMounted = true;

    async function loadConversion() {
      setIsConverting(true);

      try {
        const response = await convertMyBalance(selectedCurrency);

        if (isMounted) {
          setConversion(response);
        }
      } catch {
        if (isMounted) {
          setConversion(null);
        }
      } finally {
        if (isMounted) {
          setIsConverting(false);
        }
      }
    }

    void loadConversion();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, selectedCurrency, user]);

  if (isAuthLoading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
        <h1 className="text-2xl font-bold text-white">Login required</h1>

        <p className="mt-2 text-sm text-zinc-400">
          You need to login to view your profile.
        </p>

        <Link href="/login">
          <Button className="mt-6">Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
          Profile
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Email
            </span>

            <p className="mt-2 break-all text-lg font-semibold text-white">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Display name
            </span>

            <p className="mt-2 text-lg font-semibold text-white">
              {user.displayName || "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Balance
            </span>

            <p className="mt-2 text-3xl font-bold text-white">{user.balance}</p>
          </div>
        </div>
      </section>

      {error && <Alert variant="error">{error}</Alert>}

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white">Currency conversion</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Convert your current balance to another currency.
          </p>

          <label className="mt-6 block text-sm font-medium text-zinc-300">
            Currency
          </label>

          <select
            value={selectedCurrency}
            onChange={(event) => setSelectedCurrency(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          >
            {CURRENCY_OPTIONS.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Converted balance
            </span>

            <p className="mt-2 text-3xl font-bold text-white">
              {isConverting
                ? "Converting..."
                : conversion
                  ? `${conversion.convertedBalance.amount} ${conversion.convertedBalance.currency}`
                  : "Unavailable"}
            </p>

            {conversion && (
              <p className="mt-3 text-xs text-zinc-500">
                Rate: {conversion.rate} · Date: {conversion.rateDate || "N/A"} ·{" "}
                {conversion.cached ? "cached" : "fresh"}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Favorite games</h2>

              <p className="mt-2 text-sm text-zinc-400">
                Games you saved from the listing or detail page.
              </p>
            </div>

            <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300">
              {favorites.length}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {isLoadingData ? (
              <LoadingState label="Loading favorites..." />
            ) : favorites.length === 0 ? (
              <EmptyState
                title="No favorite games yet"
                description="Browse games and save the ones you like."
                action={
                  <Link href="/">
                    <Button>Browse games</Button>
                  </Link>
                }
              />
            ) : (
              favorites.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:border-emerald-700"
                >
                  <div className="relative aspect-[16/10] bg-zinc-950">
                    <Image
                      src={game.thumbnailUrl}
                      alt={game.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      {game.providerName}
                    </p>

                    <h3 className="mt-1 line-clamp-1 font-bold text-white">
                      {game.name}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Spin history</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Latest 50 transactional slot spins.
            </p>
          </div>

          <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300">
            {spinHistory.length}
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
          {isLoadingData ? (
            <div className="bg-zinc-950 p-6">
              <LoadingState label="Loading spin history..." />
            </div>
          ) : spinHistory.length === 0 ? (
            <div className="bg-zinc-950 p-6">
              <EmptyState
                title="No spins yet"
                description="Open a game and create your first transactional slot spin."
                action={
                  <Link href="/">
                    <Button>Play a game</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Reels</th>
                    <th className="px-4 py-3">Bet</th>
                    <th className="px-4 py-3">Multiplier</th>
                    <th className="px-4 py-3">Net</th>
                    <th className="px-4 py-3">Balance after</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {spinHistory.map((spin) => (
                    <tr key={spin.id}>
                      <td className="px-4 py-3 text-zinc-400">
                        {formatDate(spin.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-xl">
                        {formatSymbol(spin.reel1)} {formatSymbol(spin.reel2)}{" "}
                        {formatSymbol(spin.reel3)}
                      </td>

                      <td className="px-4 py-3 text-zinc-200">
                        {spin.betAmount}
                      </td>

                      <td className="px-4 py-3 text-zinc-200">
                        x{spin.payoutMultiplier}
                      </td>

                      <td
                        className={`px-4 py-3 font-semibold ${
                          Number(spin.netResult) >= 0
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {spin.netResult}
                      </td>

                      <td className="px-4 py-3 text-zinc-200">
                        {spin.balanceAfter}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function formatSymbol(symbol: string): string {
  const symbols: Record<string, string> = {
    cherry: "🍒",
    lemon: "🍋",
    apple: "🍎",
    banana: "🍌",
  };

  return symbols[symbol] || symbol;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

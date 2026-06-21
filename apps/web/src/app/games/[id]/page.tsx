"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SlotMachinePanel } from "@/components/slot/slot-machine-panel";

import {
  addFavorite,
  createSpin,
  getGameById,
  getMyFavorites,
  removeFavorite,
} from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/api-client";
import { useAuth } from "@/providers/auth-provider";
import type { Game, SpinResponse } from "@/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

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

export default function GameDetailPage() {
  const params = useParams();
  const rawGameId = params.id;
  const gameId = Array.isArray(rawGameId) ? rawGameId[0] : rawGameId;

  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    refreshUser,
    user,
  } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [betAmount, setBetAmount] = useState("1.00");
  const [spinResult, setSpinResult] = useState<SpinResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSpin = useMemo(() => {
    if (!isAuthenticated || !user) {
      return false;
    }

    return Number(user.balance) >= Number(betAmount);
  }, [isAuthenticated, user, betAmount]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    let isMounted = true;

    async function fetchGame() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getGameById(gameId!);

        if (isMounted) {
          setGame(response);
        }
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        if (caughtError instanceof ApiError) {
          setError(caughtError.message);
        } else {
          setError("Game could not be loaded");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchGame();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    let isMounted = true;

    async function fetchFavoriteState() {
      if (!isAuthenticated) {
        if (isMounted) {
          setIsFavorite(false);
        }

        return;
      }

      try {
        const response = await getMyFavorites();

        if (!isMounted) {
          return;
        }

        setIsFavorite(
          response.items.some((favoriteGame) => favoriteGame.id === gameId),
        );
      } catch {
        if (isMounted) {
          setIsFavorite(false);
        }
      }
    }

    void fetchFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [gameId, isAuthenticated]);

  async function handleToggleFavorite() {
    if (!game) {
      return;
    }

    if (!isAuthenticated) {
      setError("Please login to manage favorites");
      return;
    }

    setIsFavoriteLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        await removeFavorite(game.id);
        setIsFavorite(false);
      } else {
        await addFavorite(game.id);
        setIsFavorite(true);
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError("Favorite could not be updated");
      }
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  async function handleSpin() {
    if (!game) {
      return;
    }

    if (!isAuthenticated) {
      setError("Please login before spinning");
      return;
    }

    if (!canSpin) {
      setError("Insufficient balance");
      return;
    }

    setIsSpinning(true);
    setError(null);
    setSpinResult(null);

    try {
      const response = await createSpin({
        gameId: game.id,
        betAmount,
        idempotencyKey: createIdempotencyKey(),
      });

      setSpinResult(response);

      await refreshUser();
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError("Spin could not be completed");
      }
    } finally {
      setIsSpinning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
        <LoadingState label="Loading game..." />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="space-y-4">
        <Link
          href="/"
          className="text-sm text-yellow-400 hover:text-yellow-200"
        >
          ← Back to games
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          {error || "Game could not be found"}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_40%)]">
        <Link
          href="/"
          className="inline-flex text-sm text-yellow-400 hover:text-yellow-200"
        >
          ← Back to games
        </Link>

        {error && <Alert variant="error">{error}</Alert>}

        <section className="mx-auto min-h-[calc(100dvh-9rem)] max-w-4xl py-6 md:py-8">
          <div className="mb-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              {game.providerName}
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
              {game.name}
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
              Choose your bet, pull the lever, and let the reels decide your
              payout.
            </p>

            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                disabled={isFavoriteLoading}
                onClick={() => void handleToggleFavorite()}
                className={
                  isFavorite
                    ? "border-amber-400 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
                    : ""
                }
              >
                {isFavoriteLoading
                  ? "Updating..."
                  : isFavorite
                    ? "★ Remove from favorites"
                    : "☆ Add to favorites"}
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-6 w-full md:mt-8 xl:mt-5">
            <SlotMachinePanel
              gameId={game.id}
              balance={user?.balance ?? null}
              isAuthenticated={isAuthenticated}
              isAuthLoading={isAuthLoading}
              onSpinComplete={refreshUser}
            />
          </div>
        </section>
      </div>
    </div>
  );
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

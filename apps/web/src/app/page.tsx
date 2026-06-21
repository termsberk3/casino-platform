"use client";

import { useEffect, useMemo, useState } from "react";

import {
  addFavorite,
  getMyFavorites,
  listGames,
  removeFavorite,
  searchGames,
} from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/api-client";
import { useAuth } from "@/providers/auth-provider";
import type { Game, Pagination } from "@/types/api";
import { GameCard } from "@/components/games/game-card";
import { GameCardSkeletonGrid } from "@/components/games/game-card-skeleton";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 400;

function canSearch(query: string): boolean {
  return new RegExp(`.{${MIN_SEARCH_LENGTH},}`).test(query.trim());
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("");
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const hasSearchQuery = canSearch(query);

  const title = useMemo(() => {
    if (hasSearchQuery) {
      return `Search results for "${query.trim()}"`;
    }

    return "Featured games";
  }, [hasSearchQuery, query]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    const normalizedProvider = provider.trim();

    if (normalizedQuery.length > 0 && !canSearch(normalizedQuery)) {
      return;
    }

    let isMounted = true;

    const timeoutId = window.setTimeout(() => {
      async function loadGames() {
        setIsLoading(true);
        setError(null);

        try {
          const response = canSearch(normalizedQuery)
            ? await searchGames({
                q: normalizedQuery,
                page,
                limit: 12,
                provider: normalizedProvider || undefined,
              })
            : await listGames({
                page,
                limit: 12,
                provider: normalizedProvider || undefined,
              });

          if (!isMounted) {
            return;
          }

          setGames(response.items);
          setPagination(response.pagination);
        } catch (caughtError) {
          if (!isMounted) {
            return;
          }

          if (caughtError instanceof ApiError) {
            setError(caughtError.message);
          } else {
            setError("Games could not be loaded");
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      void loadGames();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, provider, page]);

  async function loadFavorites() {
    try {
      const response = await getMyFavorites();

      setFavoriteIds(new Set(response.items.map((game) => game.id)));
    } catch {
      setFavoriteIds(new Set());
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      void Promise.resolve().then(() => void loadFavorites());
    } else {
      void Promise.resolve().then(() => setFavoriteIds(new Set()));
    }
  }, [isAuthenticated]);

  function handleClearFilters() {
    setQuery("");
    setProvider("");
    setPage(1);
  }

  async function handleToggleFavorite(gameId: string) {
    if (!isAuthenticated) {
      setError("Please login to manage favorites");
      return;
    }

    setFavoriteLoadingId(gameId);
    setError(null);

    const isFavorite = favoriteIds.has(gameId);

    try {
      if (isFavorite) {
        await removeFavorite(gameId);

        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(gameId);
          return next;
        });
      } else {
        await addFavorite(gameId);

        setFavoriteIds((current) => {
          const next = new Set(current);
          next.add(gameId);
          return next;
        });
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError("Favorite could not be updated");
      }
    } finally {
      setFavoriteLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl md:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Casino Platform
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Browse games, save favorites, and try your luck.
          </h1>

          <p className="mt-4 text-zinc-400">
            Search games from the backend, filter by provider, and favorite
            games after logging in.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search games, e.g. fire"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
            />

            {query.trim().length === 1 && (
              <p className="mt-2 text-xs text-zinc-500">
                Type at least 2 characters to search.
              </p>
            )}
          </div>

          <input
            value={provider}
            onChange={(event) => {
              setProvider(event.target.value);
              setPage(1);
            }}
            placeholder="Provider, e.g. BGaming"
            className="rounded-xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
          />

          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-xl border border-yellow-700/30 bg-zinc-950 px-5 py-3 font-semibold text-yellow-100 transition hover:border-yellow-500/60 hover:bg-yellow-400/10 hover:text-yellow-200"
          >
            Clear
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>

            {pagination && (
              <p className="mt-1 text-sm text-zinc-400">
                {pagination.totalItems} games · page {pagination.page} of{" "}
                {pagination.totalPages}
              </p>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-zinc-400">
              Login to add games to favorites.
            </p>
          )}
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <GameCardSkeletonGrid />
        ) : games.length === 0 ? (
          <EmptyState
            title="No games found"
            description="Try another search term or clear your filters."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={favoriteIds.has(game.id)}
                isFavoriteLoading={favoriteLoadingId === game.id}
                onToggleFavorite={(selectedGameId) =>
                  void handleToggleFavorite(selectedGameId)
                }
              />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-zinc-400">
              Page {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((current) =>
                  pagination
                    ? Math.min(pagination.totalPages, current + 1)
                    : current,
                )
              }
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

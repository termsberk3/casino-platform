import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Game } from "@/types/api";

interface GameCardProps {
  game: Game;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  onToggleFavorite?: (gameId: string) => void;
}

export function GameCard({
  game,
  isFavorite = false,
  isFavoriteLoading = false,
  onToggleFavorite,
}: GameCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-xl shadow-black/20 transition duration-200 hover:-translate-y-1 hover:border-yellow-500/50 hover:shadow-[0_0_28px_rgba(234,179,8,0.12)]">
      <Link href={`/games/${game.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950">
          <Image
            src={game.thumbnailUrl}
            alt={game.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-2 transition duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <div>
          <p className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-yellow-200">
            {game.providerName}
          </p>

          <Link href={`/games/${game.id}`} className="mt-1 block">
            <h3 className="line-clamp-1 text-lg font-bold text-white hover:text-yellow-300">
              {game.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-zinc-500">
            External ID: {game.externalId ?? "N/A"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/games/${game.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-400"
          >
            Play
          </Link>

          <Button
            type="button"
            variant="secondary"
            disabled={isFavoriteLoading}
            onClick={() => onToggleFavorite?.(game.id)}
            className={cn(
              isFavorite &&
                "border-amber-400 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
            )}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavoriteLoading ? "..." : isFavorite ? "★" : "☆"}
          </Button>
        </div>
      </div>
    </article>
  );
}

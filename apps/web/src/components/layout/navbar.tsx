"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isGamesActive = pathname === "/";

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-white transition hover:text-yellow-200"
        >
          Casino Platform
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-semibold transition",
              isGamesActive
                ? "border-yellow-500/40 bg-yellow-400/10 text-yellow-100"
                : "border-transparent text-zinc-300 hover:border-yellow-500/30 hover:bg-yellow-400/10 hover:text-yellow-100",
            )}
          >
            Games
          </Link>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsMenuOpen((current) => !current);
              }}
              className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-2 py-1.5 transition hover:border-yellow-500/50 hover:bg-yellow-400/10"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500/30 bg-gradient-to-b from-zinc-800 to-zinc-950 text-yellow-200 shadow-inner">
                <UserIcon />
              </span>

              {isAuthenticated && user && (
                <span className="hidden max-w-[180px] truncate text-sm text-zinc-300 lg:block">
                  {user.email} · Balance {user.balance}
                </span>
              )}
            </button>

            {isMenuOpen && (
              <div
                onClick={(event) => event.stopPropagation()}
                className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40"
              >
                {isLoading ? (
                  <div className="px-4 py-3 text-sm text-zinc-400">
                    Loading...
                  </div>
                ) : isAuthenticated && user ? (
                  <>
                    <div className="border-b border-zinc-800 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.email}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        Balance {user.balance}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "block px-4 py-3 text-sm font-semibold transition",
                        pathname === "/profile"
                          ? "bg-yellow-400/10 text-yellow-100"
                          : "text-zinc-300 hover:bg-yellow-400/10 hover:text-yellow-100",
                      )}
                    >
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        void handleLogout();
                      }}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-red-200 transition hover:bg-red-950 hover:text-red-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-b border-zinc-800 px-4 py-3">
                      <p className="text-sm font-semibold text-white">
                        Guest player
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        Login to save favorites and spin.
                      </p>
                    </div>

                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-yellow-400/10 hover:text-yellow-100"
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-yellow-400/10 hover:text-yellow-100"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.75 20a7.25 7.25 0 0 1 14.5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

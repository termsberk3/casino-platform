"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ApiError } from "@/lib/api/api-client";
import { useAuth } from "@/providers/auth-provider";
import { getFirstZodError, loginSchema } from "@/lib/validation/auth-schemas";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const parsed = loginSchema.safeParse({
      email,
      password,
    });

    if (!parsed.success) {
      setError(getFirstZodError(parsed.error));
      return;
    }

    setIsSubmitting(true);

    try {
      await login(parsed.data);
      router.push("/");
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Login</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Sign in to manage favorites and play the slot machine.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300">Email</label>

            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300">
              Password
            </label>

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-400">
          No account?{" "}
          <Link
            href="/register"
            className="text-emerald-300 hover:text-emerald-200"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

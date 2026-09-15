"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        setError("Email verification is required by Supabase. Please check your inbox or disable 'Confirm email' in Supabase Auth settings.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    // Full redirect to ensure SSR cookies are recognized across all routes
    window.location.href = redirect;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-5 sm:p-8 rounded-2xl shadow-xl w-full"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div>
        <label htmlFor="login-email" className="label text-xs">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field text-sm py-2.5 sm:py-3"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="login-password"
            className="label text-xs"
            style={{ marginBottom: 0 }}
          >
            Password
          </label>
          <Link
            href="/reset-password"
            className="text-xs text-[var(--gold)] hover:underline"
          >
            Forgot?
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field text-sm py-2.5 sm:py-3"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 leading-relaxed" role="alert">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full text-xs sm:text-sm font-bold py-3 rounded-xl shadow-md active:scale-98">
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <p
        className="text-xs sm:text-sm text-center pt-2 text-[var(--text-secondary)]"
      >
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="text-[var(--gold)] font-semibold hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75dvh] flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-sm">
        {/* Logo Header */}
        <div className="text-center mb-8 sm:mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-decoration-none">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#f0d888] to-[#9a7c3a] text-black font-serif font-bold text-lg shadow-md">
              Z
            </div>
            <span
              className="text-2xl font-serif tracking-widest text-[var(--text-primary)]"
            >
              ZEVIORA
            </span>
          </Link>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">
            Sign in to access your wishlist & cart
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8 text-sm text-[var(--text-muted)]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

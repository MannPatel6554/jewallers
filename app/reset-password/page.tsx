"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account?tab=password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2rem",
                fontWeight: 300,
                letterSpacing: "0.15em",
                color: "var(--text-primary)",
              }}
            >
              ZEVIORA
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Reset your password
          </p>
        </div>

        {sent ? (
          <div
            className="p-6 rounded-lg text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="mb-3 text-4xl">✉️</div>
            <h2 className="text-lg mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}>
              Check your inbox
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="btn-outline text-sm">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-5 sm:p-8 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs sm:text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <div>
              <label htmlFor="reset-email" className="label text-xs">Email Address</label>
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm py-2.5 sm:py-3"
                placeholder="your@email.com"
              />
            </div>

            {error && (
              <p className="text-xs sm:text-sm p-3 rounded-lg" style={{ color: "var(--error)", background: "rgba(239, 68, 68, 0.08)" }} role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending…" : "Send Reset Link"}
            </button>

            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none" }}>
                ← Back to Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

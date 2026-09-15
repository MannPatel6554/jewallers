"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (signUpData.user && !signUpData.session) {
      setError("");
      alert("Account created successfully! If email confirmation is enabled in your Supabase project, please check your email inbox to verify, or sign in now.");
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-5 sm:p-8 rounded-2xl"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div>
        <label htmlFor="signup-name" className="label text-xs">
          Your Name
        </label>
        <input
          id="signup-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field text-sm py-2.5 sm:py-3"
          placeholder="Priya Sharma"
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="label text-xs">
          Email Address
        </label>
        <input
          id="signup-email"
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
        <label htmlFor="signup-password" className="label text-xs">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field text-sm py-2.5 sm:py-3"
          placeholder="Min 8 characters"
        />
      </div>

      {error && (
        <p className="text-xs sm:text-sm p-3 rounded-lg" style={{ color: "var(--error)", background: "rgba(239, 68, 68, 0.08)" }} role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creating account…" : "Create Account"}
      </button>

      <p
        className="text-sm text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Already have an account?{" "}
        <Link
          href={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
          style={{ color: "var(--gold)", textDecoration: "none" }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
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
            Create your account
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8 text-sm text-[var(--text-muted)]">Loading...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}

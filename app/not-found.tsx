import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center px-4 text-center">
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(4rem, 10vw, 7rem)",
          color: "var(--gold)",
          lineHeight: 1,
          marginBottom: "1rem",
        }}
      >
        404
      </div>
      <h1
        className="text-2xl font-light mb-3"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--text-primary)",
        }}
      >
        Page Not Found
      </h1>
      <p
        className="text-sm max-w-md mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        The jewellery piece or page you are looking for might have been moved or
        is currently unavailable.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/" className="btn-primary">
          Return Home
        </Link>
        <Link href="/collection" className="btn-outline">
          Explore Collection
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => {
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
}

function getSnapshot(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const docTheme = document.documentElement.getAttribute("data-theme");
  if (docTheme === "dark" || docTheme === "light") return docTheme;
  const stored = localStorage.getItem("zeviora-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}


export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("zeviora-theme", next);
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-md cursor-pointer"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(201, 168, 76, 0.2) 0%, rgba(201, 168, 76, 0.08) 100%)"
          : "linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(240, 216, 136, 0.15) 100%)",
        border: "1.5px solid var(--gold)",
        color: "var(--gold)",
        boxShadow: isDark
          ? "0 0 12px rgba(201, 168, 76, 0.25)"
          : "0 2px 8px rgba(0, 0, 0, 0.08)",
      }}
      title={`Currently in ${isDark ? "Dark" : "Light"} mode. Click to switch to ${isDark ? "Light" : "Dark"} mode.`}
    >
      {isDark ? (
        // Bold, glowing golden Sun icon for Dark mode
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#f0d888] transition-transform duration-500 hover:rotate-90"
        >
          <circle cx="12" cy="12" r="4.5" fill="#f0d888" fillOpacity="0.4" />
          <line x1="12" y1="1.5" x2="12" y2="4" strokeWidth="2.5" />
          <line x1="12" y1="20" x2="12" y2="22.5" strokeWidth="2.5" />
          <line x1="4.22" y1="4.22" x2="6" y2="6" strokeWidth="2.5" />
          <line x1="18" y1="18" x2="19.78" y2="19.78" strokeWidth="2.5" />
          <line x1="1.5" y1="12" x2="4" y2="12" strokeWidth="2.5" />
          <line x1="20" y1="12" x2="22.5" y2="12" strokeWidth="2.5" />
          <line x1="4.22" y1="19.78" x2="6" y2="18" strokeWidth="2.5" />
          <line x1="18" y1="6" x2="19.78" y2="4.22" strokeWidth="2.5" />
        </svg>
      ) : (
        // Deep golden / crescent Moon with stars for Light mode
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="#c9a84c"
          fillOpacity="0.35"
          stroke="#9a7c3a"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#9a7c3a] transition-transform duration-500 hover:-rotate-12"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          <circle cx="18.5" cy="5.5" r="1" fill="#9a7c3a" stroke="none" />
        </svg>
      )}
    </button>
  );
}

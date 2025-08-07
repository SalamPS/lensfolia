/* eslint-disable @next/next/no-img-element */
// components/TitleBadge.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface TitleBadgeProps {
  title: string;
  iconLight: string;
  iconDark: string;
}

export default function TitleBadge({
  title,
  iconLight,
  iconDark,
}: TitleBadgeProps) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Hanya set isMounted = true setelah mount di client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Tentukan warna teks berdasarkan tema
  const textColor = isMounted
    ? theme === "dark"
      ? "text-zinc-50"
      : "text-zinc-500"
    : "text-zinc-500"; // Placeholder sesuai dengan fallback SSR

  // Tentukan icon src
  const iconSrc = isMounted
    ? theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? iconDark
      : iconLight
    : iconLight;

  return (
    <div
      className={`bg-card inset-shadow-foreground/5 border-border shadow-foreground/10 flex w-fit items-center justify-center gap-2 rounded-full border-2 px-4 py-2 shadow-lg inset-shadow-sm ${
        !isMounted ? "opacity-0" : ""
      }`}
    >
      <img
        src={iconSrc}
        alt="tag-icon"
        width={16}
        height={16}
        className="text-white"
      />
      <p className={`text-xs font-semibold ${textColor}`}>{title}</p>
    </div>
  );
}

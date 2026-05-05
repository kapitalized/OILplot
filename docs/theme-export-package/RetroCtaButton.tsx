"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function RetroCtaButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground border-2 border-oilplot-ink shadow-retro-sm hover:opacity-95 transition-opacity"
    >
      <Zap size={16} className="shrink-0 fill-white text-white" aria-hidden />
      {children}
    </Link>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "light" | "dark" | "outline";
  className?: string;
};

const variants = {
  light: "bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-white",
  dark: "bg-[var(--color-ink)] text-white hover:bg-[var(--color-clay)]",
  outline:
    "border border-current bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white",
};

export function ButtonLink({
  href,
  children,
  variant = "dark",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-clay)] ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "light" | "dark" | "outline";
  className?: string;
};

const variants = {
  light:
    "bg-[var(--studio-ivory-white)] text-[var(--studio-midnight-black)] hover:bg-[var(--studio-warm-beige)]",
  dark:
    "bg-[var(--studio-champagne-gold)] text-[var(--studio-midnight-black)] hover:bg-[var(--studio-warm-beige)]",
  outline:
    "border border-[var(--studio-champagne-gold)] bg-transparent text-[var(--studio-midnight-black)] hover:bg-[var(--studio-champagne-gold)]",
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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors hover:shadow-lg hover:shadow-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--studio-champagne-gold)] ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

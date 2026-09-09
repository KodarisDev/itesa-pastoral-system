import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CtaButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "brand";
}

/** CTA "píldora" con capa de acento desfasada detrás — firma visual de la capa marca (§7.2b). */
const BRAND_GRADIENT = "linear-gradient(135deg, #c0392b, #922b21)";

export function CtaButton({ href, children, variant = "dark", className, ...props }: CtaButtonProps) {
  return (
    <Link href={href} className={cn("group relative inline-flex items-center", className)} {...props}>
      <span
        className="absolute inset-y-0 right-0 w-[calc(100%-1.5rem)] rounded-xl transition-transform duration-300 group-hover:translate-x-0.5"
        style={{ background: BRAND_GRADIENT }}
      />
      <span
        className={cn(
          "relative z-10 rounded-xl px-5 py-3 text-sm font-medium text-white",
          variant === "dark" && "bg-neutral-950 dark:bg-white dark:text-neutral-900",
        )}
        style={variant === "brand" ? { background: BRAND_GRADIENT } : undefined}
      >
        {children}
      </span>
      <span className="relative -left-px z-10 flex h-10 w-10 items-center justify-center rounded-xl text-white">
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

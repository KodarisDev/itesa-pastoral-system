import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "success" | "warning" | "neutral";
}

const ICON_WRAP: Record<NonNullable<StatCardProps["accent"]>, string> = {
  brand: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40",
  success: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/40",
  warning: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40",
  neutral: "bg-gray-50 text-gray-500 border-gray-100 dark:bg-neutral-800 dark:text-gray-400 dark:border-neutral-700",
};

export function StatCard({ label, value, icon: Icon, accent = "neutral" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-gray-800 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-100">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border", ICON_WRAP[accent])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

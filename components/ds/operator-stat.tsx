import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stripes = {
  indigo: "border-l-indigo-500",
  violet: "border-l-violet-500",
  emerald: "border-l-emerald-500",
} as const;

const iconTone = {
  indigo: "text-indigo-600 dark:text-indigo-400",
  violet: "text-violet-600 dark:text-violet-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
} as const;

export type OperatorStatStripe = keyof typeof stripes;

export function OperatorStatTile({
  label,
  value,
  hint,
  icon: Icon,
  stripe = "indigo",
  valueClassName,
  iconClassName,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: LucideIcon;
  stripe?: OperatorStatStripe;
  valueClassName?: string;
  iconClassName?: string;
}) {
  return (
    <Card className={cn("border-l-4 shadow-sm", stripes[stripe])}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className={cn("size-4 shrink-0", iconClassName ?? iconTone[stripe])} aria-hidden />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className={cn("text-2xl font-semibold tabular-nums tracking-tight", valueClassName)}>{value}</p>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

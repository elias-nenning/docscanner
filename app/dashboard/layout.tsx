import { OperatorAppShell } from "@/components/operator/OperatorAppShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <OperatorAppShell>{children}</OperatorAppShell>;
}

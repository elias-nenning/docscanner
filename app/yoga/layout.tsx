import YogaShell from "@/components/yoga/YogaShell";
import AuthGate from "@/components/auth/AuthGate";

export default function YogaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <AuthGate>
        <YogaShell>{children}</YogaShell>
      </AuthGate>
    </div>
  );
}

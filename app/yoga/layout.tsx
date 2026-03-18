import Nav from "@/components/Nav";
import YogaShell from "@/components/yoga/YogaShell";
import AuthGate from "@/components/auth/AuthGate";

export default function YogaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <Nav />
      <div className="flex flex-1 min-h-0">
        <AuthGate>
          <YogaShell>{children}</YogaShell>
        </AuthGate>
      </div>
    </div>
  );
}

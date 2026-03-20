"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/useAuth";
import { FlowFillAppBridge } from "@/components/FlowFillAppBridge";
import { Header } from "@/components/header";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/yoga/home";
  const { login, hydrated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const ok = await login(email, password);
      if (ok) router.replace(next);
      else setErr("Could not sign in. Check your email or try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
          Email
        </label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="ff-input mt-1.5" required />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="ff-input mt-1.5"
          required
        />
      </div>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <Link href="/" className="text-center text-xs text-muted-foreground hover:text-foreground hover:underline">
        Back to home
      </Link>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Header />
      <main className="ff-page-frame max-w-md px-4 py-10 md:px-6">
        <div className="ff-panel p-5 sm:p-6">
          <h1 className="text-center text-lg font-semibold tracking-tight text-foreground sm:text-xl">Sign in</h1>
          <p className="mt-1 text-center text-xs text-muted-foreground sm:text-sm">
            Lands in <strong className="font-medium text-foreground">Studio</strong>; header opens{" "}
            <strong className="font-medium text-foreground">Operator</strong>.
          </p>
          <div className="mt-4 flex justify-center">
            <FlowFillAppBridge />
          </div>
          <div className="mt-6">
            <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

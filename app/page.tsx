"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";

function FlowFillWatermark() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-[0.10] select-none">
        <div className="text-[220px] leading-none font-black tracking-tighter text-indigo-700">⚡</div>
      </div>
      <div className="absolute top-28 left-1/2 -translate-x-1/2 opacity-[0.08] select-none">
        <div className="text-[120px] leading-none font-black tracking-tight text-zinc-900">FlowFill</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
    </div>
  );
}

function Landing() {
  const { isAuthed, login, register } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const primaryCta = useMemo(() => (isAuthed ? "Go to menu" : mode === "login" ? "Log in" : "Register"), [isAuthed, mode]);

  async function submit() {
    setError(null);
    if (isAuthed) {
      router.push("/menu");
      return;
    }
    setLoading(true);
    const ok = mode === "login" ? await login(email, password) : await register(name, email, password);
    setLoading(false);
    if (!ok) {
      setError(mode === "login" ? "Login failed. Check your email or register first." : "Register failed. Email may already be used.");
      return;
    }
    router.push(next || "/menu");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 relative">
      <FlowFillWatermark />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-zinc-200 rounded-full px-4 py-2">
              <span className="text-lg">⚡</span>
              <span className="font-bold">FlowFill</span>
              <span className="text-zinc-500 text-sm">Light</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Hello</h1>
            <p className="mt-2 text-zinc-600">Log in or register to start booking.</p>
          </div>

          <div className="bg-white/90 backdrop-blur border border-zinc-200 rounded-3xl p-6 shadow-sm">
            {!isAuthed ? (
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                    mode === "login" ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Log in
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                    mode === "register" ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Register
                </button>
              </div>
            ) : null}

            {mode === "register" && !isAuthed ? (
              <div className="mb-3">
                <label className="text-xs font-semibold text-zinc-600">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
            ) : null}

            {!isAuthed ? (
              <>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-zinc-600">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-zinc-600">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </>
            ) : null}

            {error ? <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl">{error}</div> : null}

            <button
              onClick={submit}
              disabled={loading}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                loading ? "bg-zinc-200 text-zinc-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? "Signing in…" : primaryCta}
            </button>

            <div className="mt-4 text-xs text-zinc-500">
              Uses your FastAPI backend. Password is not enforced yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <Landing />;
}

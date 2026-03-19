"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";
import { useTheme } from "@/components/theme/useTheme";

type SettingsState = {
  notifications: boolean;
  emailUpdates: boolean;
  language: "en" | "de";
  reduceMotion: boolean;
};

const SETTINGS_KEY = "flowfill.settings.v1";

function readSettings(): SettingsState {
  if (typeof window === "undefined") {
    return { notifications: true, emailUpdates: true, language: "en", reduceMotion: false };
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { notifications: true, emailUpdates: true, language: "en", reduceMotion: false };
    return { notifications: true, emailUpdates: true, language: "en", reduceMotion: false, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return { notifications: true, emailUpdates: true, language: "en", reduceMotion: false };
  }
}

function writeSettings(s: SettingsState) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export default function YogaSettingsPage() {
  const router = useRouter();
  const { user, isAuthed, logout } = useAuth();
  const { mode, setMode } = useTheme();

  const [settings, setSettings] = useState<SettingsState>(() => readSettings());

  const title = useMemo(() => (isAuthed ? "Settings" : "Sign in"), [isAuthed]);

  function update(next: Partial<SettingsState>) {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      writeSettings(merged);
      return merged;
    });
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Account + appearance preferences.</p>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="text-sm font-bold text-zinc-900 dark:text-white">Account</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{user ? `Signed in as ${user.email}` : "Not signed in"}</div>

          <div className="mt-4 flex gap-2">
            {!isAuthed ? (
              <button onClick={() => router.push("/")} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition">
                Sign in
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className="bg-zinc-900 hover:bg-black text-white rounded-xl px-4 py-2 text-sm font-semibold transition dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="text-sm font-bold text-zinc-900 dark:text-white">Appearance</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Choose light or dark mode.</div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setMode("light")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                mode === "light"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                  : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setMode("dark")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                mode === "dark"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-200"
                  : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              Dark
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">Reduce motion</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Prefer fewer animations.</div>
            </div>
            <button
              onClick={() => update({ reduceMotion: !settings.reduceMotion })}
              className={`w-12 h-7 rounded-full border transition flex items-center px-1 ${
                settings.reduceMotion ? "bg-indigo-600 border-indigo-600" : "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
              }`}
              aria-label="Toggle reduce motion"
            >
              <span className={`w-5 h-5 rounded-full bg-white transition ${settings.reduceMotion ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-700 dark:text-zinc-200">Push notifications</span>
              <input type="checkbox" checked={settings.notifications} onChange={(e) => update({ notifications: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-700 dark:text-zinc-200">Email updates</span>
              <input type="checkbox" checked={settings.emailUpdates} onChange={(e) => update({ emailUpdates: e.target.checked })} />
            </label>
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="text-sm font-bold text-zinc-900 dark:text-white">Language</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">UI language preference.</div>
          <div className="mt-4">
            <select
              value={settings.language}
              onChange={(e) => update({ language: e.target.value as SettingsState["language"] })}
              className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-950 dark:text-white"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}


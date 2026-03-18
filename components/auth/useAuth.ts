"use client";

import { useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

const STORAGE_KEY = "flowfill.auth.user.v1";

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeUser(user: AuthUser | null) {
  try {
    if (!user) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());

  useEffect(() => {
    writeUser(user);
  }, [user]);

  const isAuthed = useMemo(() => Boolean(user), [user]);

  function login(email: string, password: string) {
    // Demo auth: accept any non-empty credentials
    if (!email.trim() || !password.trim()) return false;
    setUser({
      id: `u_${Math.random().toString(36).slice(2)}`,
      email: email.trim().toLowerCase(),
      name: email.split("@")[0]?.trim() || "User",
    });
    return true;
  }

  function register(name: string, email: string, password: string) {
    if (!name.trim() || !email.trim() || !password.trim()) return false;
    setUser({
      id: `u_${Math.random().toString(36).slice(2)}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
    });
    return true;
  }

  function logout() {
    setUser(null);
  }

  return { user, isAuthed, login, register, logout };
}


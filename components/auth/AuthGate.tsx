"use client";

import { PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";

export default function AuthGate({ children }: PropsWithChildren) {
  const { isAuthed } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthed) {
      router.replace(`/?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthed, pathname, router]);

  if (!isAuthed) return null;
  return <>{children}</>;
}


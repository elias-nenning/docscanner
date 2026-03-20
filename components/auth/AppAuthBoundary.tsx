"use client";

import { PropsWithChildren } from "react";

/**
 * Previously gated all routes except `/` behind login. The app is now browsable
 * without signing in; use {@link AuthGate} in a specific layout if a route
 * should require auth again.
 */
export default function AppAuthBoundary({ children }: PropsWithChildren) {
	return <>{children}</>;
}

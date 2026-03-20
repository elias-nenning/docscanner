import type { Metadata } from "next";
import "./globals.css";
import ThemeInit from "@/components/theme/ThemeInit";
import AppAuthBoundary from "@/components/auth/AppAuthBoundary";

export const metadata: Metadata = {
  title: "FlowFill · Studio utilization & booking",
  description:
    "Scheduling and incentive analytics for boutique fitness: time-based credits, fill-rate attribution, and operator dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "system-ui, sans-serif" }}>
        <ThemeInit />
        <AppAuthBoundary>{children}</AppAuthBoundary>
      </body>
    </html>
  );
}

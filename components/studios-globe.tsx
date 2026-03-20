"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import type { StudioWithCoords } from "@/lib/studioCoordinates";

export function markerIdForStudio(studioId: number) {
  return "st" + String(studioId).replace("-", "neg");
}

type GlobeMarker = {
  location: [number, number];
  size: number;
  id: string;
  color?: [number, number, number];
};

export function StudiosGlobe({
  studios,
  maxSize = 520,
  minSize = 280,
  className,
}: {
  studios: StudioWithCoords[];
  /** Max CSS width/height of the square globe (px). */
  maxSize?: number;
  minSize?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const markersRef = useRef<GlobeMarker[]>([]);
  const darkRef = useRef(0);
  const [wrapRef, bounds] = useMeasure();

  markersRef.current = studios.map((s) => ({
    location: [s.lat, s.lon],
    size: 0.042,
    id: markerIdForStudio(s.id),
    color: [0.32, 0.38, 0.28],
  }));

  useEffect(() => {
    const el = document.documentElement;
    darkRef.current = el.classList.contains("dark") ? 1 : 0;
    const mo = new MutationObserver(() => {
      darkRef.current = el.classList.contains("dark") ? 1 : 0;
    });
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  const studioKey = studios.map((s) => s.id).join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bounds.width < 32) return;

    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 2);
    const cssSize = Math.max(minSize, Math.min(maxSize, bounds.width));
    const width = cssSize * dpr;
    const height = cssSize * dpr;

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width,
      height,
      phi: phiRef.current,
      theta: 0.22,
      dark: darkRef.current,
      diffuse: 1.12,
      mapSamples: maxSize < 360 ? 10_000 : 14_000,
      mapBrightness: darkRef.current ? 4.2 : 5.8,
      mapBaseBrightness: darkRef.current ? 0.04 : 0,
      baseColor: darkRef.current ? [0.11, 0.12, 0.11] : [0.98, 0.98, 0.97],
      markerColor: [0.32, 0.38, 0.28],
      glowColor: darkRef.current ? [0.28, 0.32, 0.26] : [0.88, 0.9, 0.85],
      markers: markersRef.current,
      scale: 1,
      opacity: 1,
      markerElevation: 0.06,
    });

    let raf = 0;
    const tick = () => {
      phiRef.current += 0.003;
      globe.update({
        phi: phiRef.current,
        dark: darkRef.current,
        markers: markersRef.current,
        mapBrightness: darkRef.current ? 4.2 : 5.8,
        baseColor: darkRef.current ? [0.11, 0.12, 0.11] : [0.98, 0.98, 0.97],
        glowColor: darkRef.current ? [0.28, 0.32, 0.26] : [0.88, 0.9, 0.85],
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
    };
  }, [bounds.width, studioKey, maxSize, minSize]);

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-square w-full overflow-hidden rounded-xl border border-border/80 bg-muted/35 dark:border-border/50 dark:bg-card/30 ${className ?? ""}`}
      style={{ maxWidth: maxSize }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full [touch-action:none]"
        aria-label="Globe showing studio locations"
      />
    </div>
  );
}

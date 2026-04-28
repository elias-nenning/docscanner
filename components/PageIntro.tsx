"use client";

import { motion } from "framer-motion";

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 240, delay: 0.03 }}
      className="mb-8 space-y-3"
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight lg:text-4xl">{title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground lg:text-base">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

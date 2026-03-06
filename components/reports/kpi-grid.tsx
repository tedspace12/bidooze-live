"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { KpiCard } from "./report-types";

interface KpiGridProps {
  cards: KpiCard[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" as const },
  },
};

export function KpiGrid({ cards }: KpiGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
    >
      {cards.map((kpi) => (
        <motion.div
          key={kpi.title}
          variants={item}
          className={`group relative overflow-hidden rounded-xl border p-3 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
            kpi.accent
              ? "border-primary/35 bg-primary/10"
              : kpi.alert
                ? "border-destructive/40 bg-destructive/10"
                : "border-border/70 bg-background/60"
          }`}
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{kpi.title}</p>
            <kpi.icon
              className={`h-3.5 w-3.5 ${
                kpi.alert ? "text-destructive" : "text-muted-foreground"
              }`}
            />
          </div>
          <p
            className={`text-2xl font-semibold tracking-[-0.03em] ${
              kpi.alert ? "text-destructive" : kpi.accent ? "text-primary" : ""
            }`}
          >
            {kpi.value}
          </p>
          {kpi.delta ? (
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  kpi.trend === "up"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-destructive/35 bg-destructive/10 text-destructive"
                }`}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {kpi.delta}
              </span>
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>
          )}

          {kpi.tooltip && (
            <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 w-56 translate-y-1 rounded-lg border border-border/60 bg-background/85 p-2 text-xs text-muted-foreground opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              {kpi.tooltip}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import type { SwipeDirection } from "@/app/actions/swipe";
import {
  initials,
  countPreferenceMatches,
  preferenceMatchLabel,
} from "@/lib/models";

export type DeckFeature = {
  key: string;
  label: string;
  category: string;
  value: string | null;
};

export type DeckModel = {
  id: string;
  name: string;
  provider: string;
  tagline: string | null;
  description: string | null;
  avatarUrl: string | null;
  contextWindow: number | null;
  inputPricePerM: number | null;
  outputPricePerM: number | null;
  releaseDate: string | null;
  features: DeckFeature[];
};

export type SwipeCardHandle = {
  fly: (direction: SwipeDirection) => void;
};

const SWIPE_THRESHOLD = 120;

const CATEGORY_STYLES: Record<string, string> = {
  MODALITY: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
  CAPABILITY: "bg-violet-500/15 text-violet-200 ring-violet-400/30",
  DEPLOYMENT: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  PRICING: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  CONTEXT: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
};

type Props = {
  model: DeckModel;
  interactive: boolean;
  offset: number;
  preferredKeys: string[];
  onDecision: (direction: SwipeDirection) => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { model, interactive, offset, preferredKeys, onDecision },
  ref
) {
  const preferred = new Set(preferredKeys);
  const matchCount = countPreferenceMatches(model.features, preferred);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);
  const [decided, setDecided] = useState(false);

  function fly(direction: SwipeDirection) {
    if (decided) return;
    setDecided(true);
    animate(x, direction === "RIGHT" ? 800 : -800, {
      duration: 0.35,
      ease: "easeOut",
      onComplete: () => onDecision(direction),
    });
  }

  useImperativeHandle(ref, () => ({ fly }), [decided]);

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) fly("RIGHT");
    else if (info.offset.x < -SWIPE_THRESHOLD) fly("LEFT");
    else animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
  }

  return (
    <motion.div
      className="absolute inset-0 select-none"
      style={{
        x: interactive ? x : 0,
        rotate: interactive ? rotate : 0,
        zIndex: 100 - offset,
      }}
      initial={false}
      animate={{
        scale: 1 - offset * 0.04,
        y: offset * 14,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={interactive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={interactive ? handleDragEnd : undefined}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-2xl backdrop-blur">
        {/* Header / avatar */}
        <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-fuchsia-600/40 via-violet-600/30 to-sky-600/30">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold tracking-tight ring-1 ring-white/20">
            {initials(model.name)}
          </div>

          {/* LIKE / NOPE stamps */}
          {interactive && (
            <>
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute left-5 top-5 -rotate-12 rounded-lg border-2 border-emerald-400 px-3 py-1 text-xl font-extrabold uppercase tracking-widest text-emerald-300"
              >
                Match
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="absolute right-5 top-5 rotate-12 rounded-lg border-2 border-rose-400 px-3 py-1 text-xl font-extrabold uppercase tracking-widest text-rose-300"
              >
                Pass
              </motion.div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold">{model.name}</h2>
              <span className="text-sm text-zinc-400">{model.provider}</span>
            </div>
            {model.tagline && (
              <p className="mt-1 text-sm text-fuchsia-300">{model.tagline}</p>
            )}
            {preferredKeys.length > 0 && matchCount > 0 && (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                ✦ {preferenceMatchLabel(matchCount)}
              </p>
            )}
          </div>

          {model.description && (
            <p className="text-sm leading-relaxed text-zinc-300">
              {model.description}
            </p>
          )}

          <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-400">
            {model.contextWindow != null && (
              <span>🧠 {model.contextWindow.toLocaleString()} ctx</span>
            )}
            {model.inputPricePerM != null && (
              <span>
                💵 ${model.inputPricePerM}/M in
                {model.outputPricePerM != null && ` · $${model.outputPricePerM}/M out`}
              </span>
            )}
            {model.releaseDate && <span>📅 {model.releaseDate.slice(0, 10)}</span>}
          </div>

          {model.features.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {model.features.map((f) => {
                const isPref = preferred.has(f.key);
                return (
                  <span
                    key={f.key}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                      isPref
                        ? "bg-emerald-400/25 text-emerald-50 ring-2 ring-emerald-400"
                        : CATEGORY_STYLES[f.category] ??
                          "bg-white/10 text-zinc-200 ring-white/20"
                    }`}
                  >
                    {isPref ? "✓ " : ""}
                    {f.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

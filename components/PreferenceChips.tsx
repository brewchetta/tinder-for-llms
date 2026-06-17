"use client";

import { useState, useTransition } from "react";
import { togglePreference } from "@/app/actions/preferences";
import { groupFeaturesByCategory } from "@/lib/models";

export type PrefFeature = {
  id: string;
  key: string;
  label: string;
  category: string;
};

const CATEGORY_TITLES: Record<string, string> = {
  MODALITY: "Modalities",
  CAPABILITY: "Capabilities",
  CONTEXT: "Context",
  DEPLOYMENT: "Deployment",
  PRICING: "Pricing",
};

export function PreferenceChips({
  features,
  initialSelected,
}: {
  features: PrefFeature[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected)
  );
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    // Optimistic flip; revert if the server action fails.
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    startTransition(async () => {
      try {
        await togglePreference(id);
      } catch (err) {
        console.error("Failed to toggle preference", err);
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    });
  }

  const grouped = groupFeaturesByCategory(features);

  return (
    <div className="flex flex-col gap-6">
      {grouped.map(({ category, items }) => (
        <section key={category} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {CATEGORY_TITLES[category] ?? category}
          </h2>
          <div className="flex flex-wrap gap-2">
            {items.map((f) => {
              const on = selected.has(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition ${
                    on
                      ? "bg-emerald-400/25 text-emerald-100 ring-2 ring-emerald-400"
                      : "bg-white/5 text-zinc-300 ring-white/15 hover:bg-white/10"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-xs text-zinc-500">
        {selected.size === 0
          ? "Pick the features you care about — they'll be highlighted on matching cards."
          : `${selected.size} preference${selected.size > 1 ? "s" : ""} selected. Matching features glow on each card.`}
      </p>
    </div>
  );
}

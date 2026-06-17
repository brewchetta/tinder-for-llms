"use client";

import { useRef, useState, useTransition } from "react";
import { recordSwipe, type SwipeDirection } from "@/app/actions/swipe";
import {
  SwipeCard,
  type DeckModel,
  type SwipeCardHandle,
} from "@/components/SwipeCard";

export function SwipeDeck({
  models,
  preferredKeys,
}: {
  models: DeckModel[];
  preferredKeys: string[];
}) {
  const [cards, setCards] = useState<DeckModel[]>(models);
  const [, startTransition] = useTransition();
  const topRef = useRef<SwipeCardHandle>(null);

  function commit(model: DeckModel, direction: SwipeDirection) {
    setCards((prev) => prev.filter((c) => c.id !== model.id));
    startTransition(async () => {
      try {
        await recordSwipe(model.id, direction);
      } catch (err) {
        console.error("Failed to record swipe", err);
      }
    });
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-2xl">🎉</p>
        <p className="text-lg font-medium">You&apos;ve seen every model</p>
        <p className="max-w-xs text-sm text-zinc-400">
          Check your matches, or unmatch one to bring it back into the deck.
        </p>
        <a
          href="/matches"
          className="mt-2 rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold hover:bg-fuchsia-500"
        >
          View matches
        </a>
      </div>
    );
  }

  const top = cards[0];

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative h-[30rem] w-full max-w-sm">
        {cards.slice(0, 3).map((model, i) => (
          <SwipeCard
            key={model.id}
            ref={i === 0 ? topRef : undefined}
            model={model}
            interactive={i === 0}
            offset={i}
            preferredKeys={preferredKeys}
            onDecision={(dir) => commit(model, dir)}
          />
        ))}
      </div>

      <div className="flex items-center gap-6">
        <button
          aria-label="Pass"
          onClick={() => topRef.current?.fly("LEFT")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/40 bg-zinc-900/80 text-2xl text-rose-400 shadow-lg transition hover:scale-105 hover:bg-rose-500/10"
        >
          ✕
        </button>
        <button
          aria-label="Match"
          onClick={() => topRef.current?.fly("RIGHT")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-zinc-900/80 text-2xl text-emerald-400 shadow-lg transition hover:scale-105 hover:bg-emerald-500/10"
        >
          ♥
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Drag the card or use the buttons · {cards.length} left ·{" "}
        <span className="text-zinc-400">{top.name}</span>
      </p>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SwipeDeck } from "@/components/SwipeDeck";
import type { DeckModel } from "@/components/SwipeCard";

// Always reflect the latest swipe state for this user.
export const dynamic = "force-dynamic";

export default async function SwipePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [swiped, prefs] = await Promise.all([
    prisma.swipe.findMany({
      where: { userId: session.user.id },
      select: { aiModelId: true },
    }),
    prisma.userPreference.findMany({
      where: { userId: session.user.id },
      include: { feature: true },
    }),
  ]);
  const swipedIds = swiped.map((s) => s.aiModelId);
  const preferredKeys = prefs.map((p) => p.feature.key);

  const models = await prisma.aiModel.findMany({
    where: { id: { notIn: swipedIds } },
    include: { features: { include: { feature: true } } },
    orderBy: { createdAt: "asc" },
  });

  const deck: DeckModel[] = models.map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    tagline: m.tagline,
    description: m.description,
    avatarUrl: m.avatarUrl,
    contextWindow: m.contextWindow,
    inputPricePerM: m.inputPricePerM,
    outputPricePerM: m.outputPricePerM,
    releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
    features: m.features.map((mf) => ({
      key: mf.feature.key,
      label: mf.feature.label,
      category: mf.feature.category,
      value: mf.value,
    })),
  }));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      {preferredKeys.length === 0 && (
        <a
          href="/preferences"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 hover:bg-white/10"
        >
          ✦ Set your preferences to highlight matching features →
        </a>
      )}
      <SwipeDeck models={deck} preferredKeys={preferredKeys} />
    </div>
  );
}

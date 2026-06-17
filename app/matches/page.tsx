import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unmatch } from "@/app/actions/swipe";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [matches, prefs] = await Promise.all([
    prisma.swipe.findMany({
      where: { userId: session.user.id, direction: "RIGHT" },
      include: { aiModel: { include: { features: { include: { feature: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userPreference.findMany({
      where: { userId: session.user.id },
      include: { feature: true },
    }),
  ]);
  const preferred = new Set(prefs.map((p) => p.feature.key));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Your matches</h1>
        <span className="text-sm text-zinc-400">{matches.length} total</span>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center">
          <p className="text-zinc-300">No matches yet.</p>
          <a
            href="/swipe"
            className="mt-3 inline-block rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold hover:bg-fuchsia-500"
          >
            Start swiping
          </a>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {matches.map(({ aiModel: m }) => (
            <li
              key={m.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h2 className="truncate text-lg font-semibold">{m.name}</h2>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {m.provider}
                  </span>
                </div>
                {m.tagline && (
                  <p className="text-sm text-fuchsia-300">{m.tagline}</p>
                )}
                {(() => {
                  const matchCount = m.features.filter((mf) =>
                    preferred.has(mf.feature.key)
                  ).length;
                  return preferred.size > 0 && matchCount > 0 ? (
                    <p className="mt-1 text-xs font-semibold text-emerald-300">
                      ✦ {matchCount} preference match{matchCount > 1 ? "es" : ""}
                    </p>
                  ) : null;
                })()}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.features.map((mf) => {
                    const isPref = preferred.has(mf.feature.key);
                    return (
                      <span
                        key={mf.feature.key}
                        className={`rounded-full px-2 py-0.5 text-xs ring-1 ${
                          isPref
                            ? "bg-emerald-400/25 text-emerald-50 ring-2 ring-emerald-400"
                            : "bg-white/10 text-zinc-200 ring-white/15"
                        }`}
                      >
                        {isPref ? "✓ " : ""}
                        {mf.feature.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <form
                action={async () => {
                  "use server";
                  await unmatch(m.id);
                }}
              >
                <button className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300 hover:bg-rose-500/10 hover:text-rose-300">
                  Unmatch
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

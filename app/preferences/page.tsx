import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PreferenceChips } from "@/components/PreferenceChips";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [features, prefs] = await Promise.all([
    prisma.feature.findMany({ orderBy: [{ category: "asc" }, { label: "asc" }] }),
    prisma.userPreference.findMany({
      where: { userId: session.user.id },
      select: { featureId: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Your preferences</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tell us what you want in a model. We&apos;ll highlight the features that
          match while you swipe.
        </p>
      </div>

      <PreferenceChips
        features={features}
        initialSelected={prefs.map((p) => p.featureId)}
      />

      <a
        href="/swipe"
        className="self-start rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold hover:bg-fuchsia-500"
      >
        Start swiping →
      </a>
    </div>
  );
}

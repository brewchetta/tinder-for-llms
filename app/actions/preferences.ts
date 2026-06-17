"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Toggle a feature in the current user's preferences. Adding a preference means
 * "I want models with this feature" — used to highlight matching features on
 * each card. Idempotent per (user, feature) via the unique constraint.
 */
export async function togglePreference(featureId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const key = { userId: session.user.id, featureId };
  const existing = await prisma.userPreference.findUnique({
    where: { userId_featureId: key },
  });

  if (existing) {
    await prisma.userPreference.delete({ where: { userId_featureId: key } });
  } else {
    await prisma.userPreference.create({ data: key });
  }

  revalidatePath("/preferences");
  revalidatePath("/swipe");
  revalidatePath("/matches");
}

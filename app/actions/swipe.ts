"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SwipeDirection = "LEFT" | "RIGHT";

/**
 * Record a swipe decision for the current user. One decision per (user, model)
 * is enforced by a DB unique constraint, so re-swiping just updates it.
 * A RIGHT swipe is a "match"; a LEFT swipe hides the model from the deck.
 */
export async function recordSwipe(aiModelId: string, direction: SwipeDirection) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.swipe.upsert({
    where: { userId_aiModelId: { userId: session.user.id, aiModelId } },
    update: { direction },
    create: { userId: session.user.id, aiModelId, direction },
  });

  // The deck is managed optimistically on the client; matches need a refresh.
  revalidatePath("/matches");
}

/**
 * Remove a match (delete the swipe). The model returns to the deck so the user
 * can decide again.
 */
export async function unmatch(aiModelId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.swipe.deleteMany({
    where: { userId: session.user.id, aiModelId },
  });

  revalidatePath("/matches");
  revalidatePath("/swipe");
}

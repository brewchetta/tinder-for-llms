import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordSwipe, unmatch } from "@/app/actions/swipe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// The server actions depend on the session, the DB, and Next's cache. We mock
// all three so the tests assert the action's own logic (auth guard, the exact
// Prisma call, and which paths get revalidated) without a real DB or request.
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    swipe: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const mockAuth = vi.mocked(auth);
const signedInAs = (userId: string) =>
  mockAuth.mockResolvedValue({ user: { id: userId } } as never);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("recordSwipe", () => {
  it("throws when there is no session user", async () => {
    mockAuth.mockResolvedValue(null as never);
    await expect(recordSwipe("model-1", "RIGHT")).rejects.toThrow(
      "Unauthorized"
    );
    expect(prisma.swipe.upsert).not.toHaveBeenCalled();
  });

  it("upserts the swipe scoped to the session user", async () => {
    signedInAs("user-1");
    await recordSwipe("model-1", "RIGHT");

    expect(prisma.swipe.upsert).toHaveBeenCalledWith({
      where: { userId_aiModelId: { userId: "user-1", aiModelId: "model-1" } },
      update: { direction: "RIGHT" },
      create: { userId: "user-1", aiModelId: "model-1", direction: "RIGHT" },
    });
  });

  it("re-swiping updates the existing decision (LEFT)", async () => {
    signedInAs("user-1");
    await recordSwipe("model-1", "LEFT");

    expect(prisma.swipe.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { direction: "LEFT" },
        create: expect.objectContaining({ direction: "LEFT" }),
      })
    );
  });

  it("revalidates the matches page so a new match shows up", async () => {
    signedInAs("user-1");
    await recordSwipe("model-1", "RIGHT");
    expect(revalidatePath).toHaveBeenCalledWith("/matches");
  });
});

describe("unmatch", () => {
  it("throws when there is no session user", async () => {
    mockAuth.mockResolvedValue(null as never);
    await expect(unmatch("model-1")).rejects.toThrow("Unauthorized");
    expect(prisma.swipe.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes the swipe for this user and model", async () => {
    signedInAs("user-1");
    await unmatch("model-1");
    expect(prisma.swipe.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", aiModelId: "model-1" },
    });
  });

  it("revalidates both matches and swipe so the model returns to the deck", async () => {
    signedInAs("user-1");
    await unmatch("model-1");
    expect(revalidatePath).toHaveBeenCalledWith("/matches");
    expect(revalidatePath).toHaveBeenCalledWith("/swipe");
  });
});

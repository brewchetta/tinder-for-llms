import { describe, it, expect, vi, beforeEach } from "vitest";
import { togglePreference } from "@/app/actions/preferences";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userPreference: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockAuth = vi.mocked(auth);
const signedInAs = (userId: string) =>
  mockAuth.mockResolvedValue({ user: { id: userId } } as never);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("togglePreference", () => {
  it("throws when there is no session user", async () => {
    mockAuth.mockResolvedValue(null as never);
    await expect(togglePreference("feat-1")).rejects.toThrow("Unauthorized");
    expect(prisma.userPreference.findUnique).not.toHaveBeenCalled();
  });

  it("adds the preference when it does not exist yet", async () => {
    signedInAs("user-1");
    vi.mocked(prisma.userPreference.findUnique).mockResolvedValue(null as never);

    await togglePreference("feat-1");

    expect(prisma.userPreference.create).toHaveBeenCalledWith({
      data: { userId: "user-1", featureId: "feat-1" },
    });
    expect(prisma.userPreference.delete).not.toHaveBeenCalled();
  });

  it("removes the preference when it already exists", async () => {
    signedInAs("user-1");
    vi.mocked(prisma.userPreference.findUnique).mockResolvedValue({
      userId: "user-1",
      featureId: "feat-1",
    } as never);

    await togglePreference("feat-1");

    expect(prisma.userPreference.delete).toHaveBeenCalledWith({
      where: { userId_featureId: { userId: "user-1", featureId: "feat-1" } },
    });
    expect(prisma.userPreference.create).not.toHaveBeenCalled();
  });

  it("looks the preference up scoped to the session user", async () => {
    signedInAs("user-7");
    vi.mocked(prisma.userPreference.findUnique).mockResolvedValue(null as never);

    await togglePreference("feat-9");

    expect(prisma.userPreference.findUnique).toHaveBeenCalledWith({
      where: { userId_featureId: { userId: "user-7", featureId: "feat-9" } },
    });
  });

  it("revalidates the pages that show preference highlighting", async () => {
    signedInAs("user-1");
    vi.mocked(prisma.userPreference.findUnique).mockResolvedValue(null as never);

    await togglePreference("feat-1");

    expect(revalidatePath).toHaveBeenCalledWith("/preferences");
    expect(revalidatePath).toHaveBeenCalledWith("/swipe");
    expect(revalidatePath).toHaveBeenCalledWith("/matches");
  });
});

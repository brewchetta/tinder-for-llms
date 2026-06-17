import { describe, it, expect } from "vitest";
import {
  initials,
  countPreferenceMatches,
  preferenceMatchLabel,
  groupFeaturesByCategory,
  CATEGORY_ORDER,
} from "@/lib/models";

describe("initials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(initials("Claude Opus")).toBe("CO");
    expect(initials("gpt four")).toBe("GF");
  });

  it("uses only the first two words when there are more", () => {
    expect(initials("a b c d")).toBe("AB");
  });

  it("handles a single word", () => {
    expect(initials("Gemini")).toBe("G");
  });

  it("collapses extra and surrounding whitespace", () => {
    expect(initials("  Claude   Opus  ")).toBe("CO");
  });
});

describe("countPreferenceMatches", () => {
  const features = [{ key: "text" }, { key: "vision" }, { key: "coding" }];

  it("counts features whose key is preferred", () => {
    expect(countPreferenceMatches(features, ["vision", "coding"])).toBe(2);
  });

  it("returns 0 when nothing is preferred", () => {
    expect(countPreferenceMatches(features, [])).toBe(0);
  });

  it("ignores preferred keys the model does not have", () => {
    expect(countPreferenceMatches(features, ["audio", "video"])).toBe(0);
  });

  it("accepts a Set as well as an array", () => {
    expect(countPreferenceMatches(features, new Set(["text"]))).toBe(1);
  });

  it("does not double-count duplicate preferred keys", () => {
    expect(countPreferenceMatches(features, ["text", "text"])).toBe(1);
  });
});

describe("preferenceMatchLabel", () => {
  it("returns null for zero or negative counts", () => {
    expect(preferenceMatchLabel(0)).toBeNull();
    expect(preferenceMatchLabel(-1)).toBeNull();
  });

  it("uses the singular for exactly one", () => {
    expect(preferenceMatchLabel(1)).toBe("1 preference match");
  });

  it("uses the plural for more than one", () => {
    expect(preferenceMatchLabel(3)).toBe("3 preference matches");
  });
});

describe("groupFeaturesByCategory", () => {
  it("orders groups by CATEGORY_ORDER regardless of input order", () => {
    const grouped = groupFeaturesByCategory([
      { category: "PRICING", label: "Premium" },
      { category: "MODALITY", label: "Text" },
      { category: "CAPABILITY", label: "Coding" },
    ]);
    expect(grouped.map((g) => g.category)).toEqual([
      "MODALITY",
      "CAPABILITY",
      "PRICING",
    ]);
  });

  it("drops categories with no items", () => {
    const grouped = groupFeaturesByCategory([
      { category: "MODALITY", label: "Text" },
    ]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].items).toHaveLength(1);
  });

  it("keeps every item in its category group", () => {
    const grouped = groupFeaturesByCategory([
      { category: "MODALITY", label: "Text" },
      { category: "MODALITY", label: "Vision" },
    ]);
    expect(grouped[0].items.map((i) => i.label)).toEqual(["Text", "Vision"]);
  });

  it("ignores unknown categories not in CATEGORY_ORDER", () => {
    const grouped = groupFeaturesByCategory([
      { category: "UNKNOWN", label: "x" },
      { category: "CONTEXT", label: "Long context" },
    ]);
    expect(grouped.map((g) => g.category)).toEqual(["CONTEXT"]);
  });

  it("CATEGORY_ORDER covers the documented feature categories", () => {
    expect([...CATEGORY_ORDER].sort()).toEqual(
      ["CAPABILITY", "CONTEXT", "DEPLOYMENT", "MODALITY", "PRICING"].sort()
    );
  });
});

// Pure, framework-free helpers for presenting Ai models. Kept out of the React
// components so they can be unit-tested in isolation.

export type CategorizedFeature = {
  key: string;
  label: string;
  category: string;
};

/**
 * Derive a short avatar label from a model name: the first letter of up to the
 * first two whitespace-separated words, uppercased. e.g. "GPT 4o" -> "G4".
 */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * How many of a model's features the user has marked as preferred. `preferred`
 * is a set/array of feature `key`s.
 */
export function countPreferenceMatches(
  features: { key: string }[],
  preferred: Iterable<string>
): number {
  const set = preferred instanceof Set ? preferred : new Set(preferred);
  return features.filter((f) => set.has(f.key)).length;
}

/**
 * Human label for a preference-match count, e.g. 1 -> "1 preference match",
 * 3 -> "3 preference matches". Returns null when there is nothing to show.
 */
export function preferenceMatchLabel(count: number): string | null {
  if (count <= 0) return null;
  return `${count} preference match${count > 1 ? "es" : ""}`;
}

/**
 * The fixed display order of feature categories on the preferences page.
 */
export const CATEGORY_ORDER = [
  "MODALITY",
  "CAPABILITY",
  "CONTEXT",
  "DEPLOYMENT",
  "PRICING",
] as const;

/**
 * Group features into the canonical category order, dropping empty groups.
 * Used by the preferences UI to lay out chips by section.
 */
export function groupFeaturesByCategory<T extends { category: string }>(
  features: T[]
): { category: string; items: T[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: features.filter((f) => f.category === category),
  })).filter((g) => g.items.length > 0);
}

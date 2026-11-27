/** The A–Z strip: A to Z, then # for names that start with anything else. */
export const LETTERS: readonly string[] = [...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), "#"];

export function letterOf(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

/**
 * The letter to jump to for a touch on LETTERS[index]: that letter if it has
 * hotels, else the next one that does, else the closest before it.
 */
export function nearestLetter(index: number, present: ReadonlySet<string>): string | null {
  const at = Math.min(Math.max(index, 0), LETTERS.length - 1);
  const after = LETTERS.slice(at).find((l) => present.has(l));
  return after ?? [...LETTERS.slice(0, at)].reverse().find((l) => present.has(l)) ?? null;
}

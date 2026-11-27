import { randomUUID } from "node:crypto";
import { coreName, normaliseCompanyName, similarity } from "./names";
import { DEFAULT_RULES, type ListRules } from "./rules";

/** The fields of a row that matter for duplicate checking. */
export interface DuplicateCandidate {
  company_name_normalised?: string | undefined;
  brand_name?: string | undefined;
  emails: readonly string[];
  gstin?: string | undefined;
  udyam_number?: string | undefined;
  city?: string | undefined;
  district?: string | undefined;
}

export interface DuplicateResult {
  /** Per row: the duplicate group id, or undefined if the row looks unique. */
  groupIds: (string | undefined)[];
  /** Per row: true if its email is also used by a clearly different company. */
  sharedEmail: boolean[];
}

/**
 * Link rows that look like the same supplier. Rows are never merged or
 * changed: linked rows share a group id and a human confirms.
 *
 * Linked when:
 * - same GSTIN or same Udyam number (any location), or
 * - same email and similar names, or
 * - similar names (or brand matches name) and compatible location.
 * Same email with clearly different names → shared_email, not a duplicate.
 */
export function findDuplicates(
  rows: readonly DuplicateCandidate[],
  rules: Pick<ListRules, "fuzzyNameThreshold"> = DEFAULT_RULES,
  newId: () => string = randomUUID,
): DuplicateResult {
  const links = new UnionFind(rows.length);
  const sharedEmail = rows.map(() => false);
  const names = rows.map((row) => namesOf(row));
  const locations = rows.map((row) => locationOf(row));

  const sameName = (i: number, j: number): boolean =>
    namesMatch(names[i] ?? [], names[j] ?? [], rules.fuzzyNameThreshold);

  for (const key of ["gstin", "udyam_number"] as const) {
    for (const group of groupBy(rows, (row) => (row[key] ? [row[key]] : []))) {
      linkAll(links, group);
    }
  }

  for (const group of groupBy(rows, (row) => row.emails)) {
    for (const [i, j] of pairs(group)) {
      if (sameName(i, j)) links.union(i, j);
      else {
        sharedEmail[i] = true;
        sharedEmail[j] = true;
      }
    }
  }

  // Fuzzy names: compare only rows whose names share a 3-character prefix
  // (blocking). A block can still be large when many names start alike
  // ("Shree …", "Sri …"), so the cheap checks (location, name length) run
  // before the expensive edit-distance comparison. Plain loops, no
  // allocations per pair: this inner loop runs millions of times on big lists.
  const blocks = groupBy(rows, (_, index) =>
    (names[index] ?? []).map((name) => name.slice(0, 3)),
  );
  for (const block of blocks) {
    for (let a = 0; a < block.length; a++) {
      const i = block[a] ?? 0;
      const locationI = locations[i];
      for (let b = a + 1; b < block.length; b++) {
        const j = block[b] ?? 0;
        if (
          locationI &&
          locationsCompatible(locationI, locations[j]) &&
          links.find(i) !== links.find(j) &&
          sameName(i, j)
        ) {
          links.union(i, j);
        }
      }
    }
  }

  return { groupIds: links.groupIds(newId), sharedEmail };
}

/** Core company name plus core brand name, for comparison. */
function namesOf(row: DuplicateCandidate): string[] {
  const names =
    row.company_name_normalised === undefined
      ? []
      : [coreName(row.company_name_normalised)];
  if (row.brand_name !== undefined) {
    names.push(coreName(normaliseCompanyName(row.brand_name)));
  }
  return [...new Set(names.filter((name) => name.length > 0))];
}

function namesMatch(
  a: readonly string[],
  b: readonly string[],
  threshold: number,
): boolean {
  return a.some((x) =>
    b.some(
      (y) =>
        lengthsAllowMatch(x, y, threshold) && similarity(x, y) >= threshold,
    ),
  );
}

/**
 * Quick exact pre-check: the edit distance is at least the length difference,
 * so if even that would put similarity below the threshold, the names can't
 * match. Same formula as `similarity`, so it never rejects a real match.
 */
function lengthsAllowMatch(a: string, b: string, threshold: number): boolean {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return true;
  return 1 - Math.abs(a.length - b.length) / longest >= threshold;
}

interface Location {
  district?: string | undefined;
  city?: string | undefined;
}

/** District and city, trimmed and lowercased once per row. */
function locationOf(row: DuplicateCandidate): Location {
  return {
    district: row.district?.trim().toLowerCase(),
    city: row.city?.trim().toLowerCase(),
  };
}

/** If both rows have a district (or city), they must match. Missing location doesn't block a match. */
function locationsCompatible(a: Location, b: Location | undefined): boolean {
  if (!b) return true;
  if (a.district !== undefined && b.district !== undefined) {
    return a.district === b.district;
  }
  if (a.city !== undefined && b.city !== undefined) return a.city === b.city;
  return true;
}

/** Group row indexes by every key a row produces; only groups with 2+ rows. */
function groupBy(
  rows: readonly DuplicateCandidate[],
  keysOf: (row: DuplicateCandidate, index: number) => readonly string[],
): number[][] {
  const map = new Map<string, number[]>();
  rows.forEach((row, index) => {
    for (const key of new Set(keysOf(row, index))) {
      const list = map.get(key);
      if (list) list.push(index);
      else map.set(key, [index]);
    }
  });
  return [...map.values()].filter((list) => list.length > 1);
}

function* pairs(items: readonly number[]): Generator<[number, number]> {
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      yield [items[a] ?? 0, items[b] ?? 0];
    }
  }
}

function linkAll(links: UnionFind, group: readonly number[]): void {
  const [first, ...rest] = group;
  if (first === undefined) return;
  for (const other of rest) links.union(first, other);
}

class UnionFind {
  private readonly parent: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
  }

  find(i: number): number {
    let root = i;
    while (this.parent[root] !== root) root = this.parent[root] ?? root;
    let node = i;
    while (node !== root) {
      const next = this.parent[node] ?? root;
      this.parent[node] = root;
      node = next;
    }
    return root;
  }

  union(a: number, b: number): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB)
      this.parent[Math.max(rootA, rootB)] = Math.min(rootA, rootB);
  }

  /** A new id per group of 2+ rows, assigned in row order; undefined for single rows. */
  groupIds(newId: () => string): (string | undefined)[] {
    const sizes = new Map<number, number>();
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i);
      sizes.set(root, (sizes.get(root) ?? 0) + 1);
    }
    const ids = new Map<number, string>();
    return this.parent.map((_, i) => {
      const root = this.find(i);
      if ((sizes.get(root) ?? 0) < 2) return undefined;
      let id = ids.get(root);
      if (id === undefined) {
        id = newId();
        ids.set(root, id);
      }
      return id;
    });
  }
}

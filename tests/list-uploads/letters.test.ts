import { describe, expect, it } from "vitest";
import { LETTERS, letterOf, nearestLetter } from "@/components/ListUpload/letters";

describe("A–Z strip", () => {
  it("files names under their first letter, others under #", () => {
    expect(letterOf("meridian Grand")).toBe("M");
    expect(letterOf("  The Astor")).toBe("T");
    expect(letterOf("7 Seas Hotel")).toBe("#");
    expect(letterOf("")).toBe("#");
    expect(LETTERS).toHaveLength(27);
  });

  const present = new Set(["M", "S", "T"]);
  const at = (letter: string) => LETTERS.indexOf(letter);

  it("goes to the letter itself when it has hotels", () => {
    expect(nearestLetter(at("S"), present)).toBe("S");
  });

  it("goes to the next letter with hotels, else the closest before", () => {
    expect(nearestLetter(at("A"), present)).toBe("M");
    expect(nearestLetter(at("N"), present)).toBe("S");
    expect(nearestLetter(at("Z"), present)).toBe("T");
    expect(nearestLetter(at("#"), present)).toBe("T");
  });

  it("copes with a finger above or below the strip, and with no hotels", () => {
    expect(nearestLetter(-5, present)).toBe("M");
    expect(nearestLetter(99, present)).toBe("T");
    expect(nearestLetter(0, new Set())).toBeNull();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

// Fake DNS: each domain maps to what resolveMx / resolve4 return or throw.
type Answer = unknown[] | { code: string };
const mx = new Map<string, Answer>();
const a = new Map<string, Answer>();

vi.mock("node:dns", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:dns")>();
  const answer = (table: Map<string, Answer>, domain: string) => {
    const result = table.get(domain) ?? { code: real.promises.NOTFOUND };
    return Array.isArray(result) ? Promise.resolve(result) : Promise.reject(Object.assign(new Error("dns"), result));
  };
  class Resolver {
    resolveMx(domain: string) {
      return answer(mx, domain);
    }
    resolve4(domain: string) {
      return answer(a, domain);
    }
  }
  return { ...real, promises: { ...real.promises, Resolver } };
});

const { checkEmailDomains, domainOf } = await import("@/lib/list-uploads/email-domains");

beforeEach(() => {
  mx.clear();
  a.clear();
});

describe("domainOf", () => {
  it("takes the part after the last @, lowercased", () => {
    expect(domainOf("Asha@Example.COM ")).toBe("example.com");
    expect(domainOf('"a@b"@example.in')).toBe("example.in");
  });
});

describe("checkEmailDomains", () => {
  it("tells apart working, missing, mail-less and unknown domains", async () => {
    mx.set("works.example", [{ exchange: "mx.works.example", priority: 10 }]);
    mx.set("nullmx.example", [{ exchange: "", priority: 0 }]);
    mx.set("aonly.example", { code: "ENODATA" });
    a.set("aonly.example", ["192.0.2.1"]);
    mx.set("bare.example", { code: "ENODATA" });
    a.set("bare.example", { code: "ENODATA" });
    mx.set("timeout.example", { code: "ETIMEOUT" });

    const verdicts = await checkEmailDomains([
      "works.example",
      "missing.example",
      "nullmx.example",
      "aonly.example",
      "bare.example",
      "timeout.example",
      "works.example",
    ]);
    expect(Object.fromEntries(verdicts)).toEqual({
      "works.example": "ok",
      "missing.example": "no_domain",
      "nullmx.example": "no_mail",
      "aonly.example": "ok",
      "bare.example": "no_mail",
      "timeout.example": "unknown",
    });
  });
});

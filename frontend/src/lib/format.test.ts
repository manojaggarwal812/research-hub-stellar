import { describe, expect, it } from "vitest";
import { formatXlm, paginate, shortAddress } from "@/lib/format";

describe("format helpers", () => {
  it("formats XLM amounts", () => {
    expect(formatXlm(120000)).toBe("120,000");
  });

  it("shortens addresses", () => {
    expect(shortAddress("GABCDEFGHIJKLMNOP", 4)).toBe("GABC…MNOP");
  });

  it("paginates lists", () => {
    const result = paginate([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.totalPages).toBe(3);
  });
});

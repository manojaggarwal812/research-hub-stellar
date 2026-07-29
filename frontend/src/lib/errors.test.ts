import { describe, expect, it } from "vitest";
import { parseSorobanError } from "@/lib/errors";

describe("parseSorobanError", () => {
  it("maps contract error 11 to duplicate university message", () => {
    expect(parseSorobanError("HostError: Error(Contract, #11)")).toContain(
      "already registered a university",
    );
  });

  it("maps unauthorized", () => {
    expect(parseSorobanError("simulation failed: Error(Contract, #3)")).toContain(
      "Unauthorized",
    );
  });
});

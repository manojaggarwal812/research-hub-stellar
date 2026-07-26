import { describe, expect, it } from "vitest";
import { seedProjects, seedReviews, seedUniversities } from "@/lib/seed";

describe("seed data integrity", () => {
  it("has unique project ids", () => {
    const ids = seedProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links projects to known universities", () => {
    const uniIds = new Set(seedUniversities.map((u) => u.id));
    for (const project of seedProjects) {
      expect(uniIds.has(project.universityId)).toBe(true);
    }
  });

  it("keeps released amount within grant amount", () => {
    for (const project of seedProjects) {
      expect(project.releasedAmount).toBeLessThanOrEqual(project.grantAmount);
    }
  });

  it("keeps review scores in range", () => {
    for (const review of seedReviews) {
      expect(review.score).toBeGreaterThanOrEqual(0);
      expect(review.score).toBeLessThanOrEqual(100);
    }
  });
});

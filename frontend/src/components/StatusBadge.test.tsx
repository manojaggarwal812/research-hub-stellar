import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/StatusBadge";

describe("StatusBadge", () => {
  it("renders status text", () => {
    render(<StatusBadge value="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});

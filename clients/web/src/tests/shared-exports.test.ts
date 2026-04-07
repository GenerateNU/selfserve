import { describe, expect, it } from "vitest";
import * as shared from "@shared";

describe("shared package exports", () => {
  it("exports the guest booking group sizes hook", () => {
    expect(shared.useGetGuestBookingsGroupSizes).toBeTypeOf("function");
  });
});

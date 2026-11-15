import { describe, expect, it } from "vite-plus/test";
import { searchTerms, toSearchQuery } from "./text";

describe("searchTerms", () => {
  it("drops stop words and keeps the words that carry meaning", () => {
    expect(searchTerms("Why did we move off Auth0?")).toEqual(["move", "auth0"]);
  });

  it("deduplicates repeated terms", () => {
    expect(searchTerms("pricing pricing cap")).toEqual(["pricing", "cap"]);
  });

  it("falls back to the raw question when every word is a stop word", () => {
    expect(toSearchQuery("Why?")).toBe("Why?");
  });
});

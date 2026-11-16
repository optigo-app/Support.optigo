import qs from "qs";
import LZString from "lz-string";
import {
  decodeFilterQuery,
  encodeFilterQuery,
  normalizeFilters,
  getSearchTextFromUrl,
  removeSearchTextFromUrl,
} from "../urlFilterCodec";

const roundTrip = (data, rest) => normalizeFilters(decodeFilterQuery(encodeFilterQuery(data, rest)).data);

describe("urlFilterCodec", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("keeps short filters as readable plain params", () => {
    const search = encodeFilterQuery({ status: ["1", "2"], searchQuery: "login", isStarred: true });
    expect(search).toBe("?status=1%2C2&searchQuery=login&isStarred=true");
    expect(decodeFilterQuery(search).source).toBe("plain");
  });

  it("returns an empty string when no filter is set", () => {
    expect(encodeFilterQuery({ status: [], searchQuery: "", isStarred: false })).toBe("");
  });

  it("compresses long filters into ?f= and round-trips them, including unicode", () => {
    const longText = `क्या हाल है ${"mobile login issue ".repeat(40)}`;
    const data = { searchQuery: longText, mentions: ["harshit", "bhavisha"], status: ["1"] };
    const search = encodeFilterQuery(data);
    expect(search.startsWith("?f=1.")).toBe(true);
    expect(search.length).toBeLessThan(qs.stringify({ searchQuery: longText }).length);
    expect(decodeFilterQuery(search).source).toBe("compressed");
    expect(roundTrip(data)).toMatchObject({ searchQuery: longText, mentions: ["harshit", "bhavisha"], status: ["1"] });
  });

  it("falls back to sessionStorage (?fk=) when even the compressed value is too long", () => {
    let seed = 7;
    const noise = Array.from({ length: 4000 }, () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed.toString(36);
    }).join("");
    const data = { searchQuery: noise };
    const search = encodeFilterQuery(data);
    expect(search).toMatch(/^\?fk=[a-z0-9]+$/);
    expect(roundTrip(data).searchQuery).toBe(noise);
  });

  it("an ?fk= link with no stored payload decodes to defaults instead of throwing", () => {
    const result = decodeFilterQuery("?fk=abc123");
    expect(result.source).toBe("invalid");
    expect(normalizeFilters(result.data).searchQuery).toBe("");
  });

  it("still reads legacy plain URLs, including the ?search= alias", () => {
    expect(normalizeFilters(decodeFilterQuery("?status=1,2&mentions=a,b&search=hello").data)).toMatchObject({
      status: ["1", "2"],
      mentions: ["a", "b"],
      searchQuery: "hello",
    });
  });

  it("handles corrupt, unknown-version and oversized ?f= values without throwing", () => {
    expect(decodeFilterQuery("?f=1.@@@not-valid@@@").source).toBe("invalid");
    expect(decodeFilterQuery("?f=garbage").source).toBe("invalid");
    expect(decodeFilterQuery("?f=2.abc").source).toBe("invalid");
    const huge = `?f=1.${LZString.compressToEncodedURIComponent(JSON.stringify({ searchQuery: "x".repeat(150000) }))}`;
    expect(decodeFilterQuery(huge).source).toBe("invalid");
  });

  it("coerces wrong types from a hand-edited payload", () => {
    const evil = `?f=1.${LZString.compressToEncodedURIComponent(JSON.stringify({ status: { a: 1 }, isStarred: "yes", searchQuery: 5, mentions: [1, "ok"] }))}`;
    expect(normalizeFilters(decodeFilterQuery(evil).data)).toMatchObject({
      status: [],
      isStarred: false,
      searchQuery: "5",
      mentions: ["ok"],
    });
  });

  it("preserves non-filter params and can read/remove the search text in both formats", () => {
    const longText = "long search ".repeat(40);
    const compressed = encodeFilterQuery({ searchQuery: longText, status: ["3"] }, { company: "ACME" });
    expect(decodeFilterQuery(compressed).rest).toEqual({ company: "ACME" });
    expect(getSearchTextFromUrl(compressed)).toBe(longText);
    const cleared = removeSearchTextFromUrl(compressed);
    expect(getSearchTextFromUrl(cleared)).toBe("");
    expect(normalizeFilters(decodeFilterQuery(cleared).data).status).toEqual(["3"]);
    expect(decodeFilterQuery(cleared).rest).toEqual({ company: "ACME" });

    expect(removeSearchTextFromUrl("?search=hi&company=ACME")).toBe("?company=ACME");
    expect(removeSearchTextFromUrl("?company=ACME")).toBe("?company=ACME");
  });
});

import { describe, expect, it } from "vitest";
import { isMoraText, splitByMora } from "./mora";

const okCases = new Map<string, string[]>([
  ["とうきょう", ["と", "う", "きょ", "う"]],
  ["おーさか", ["お", "ー", "さ", "か"]],
  ["おおおかやま", ["お", "お", "お", "か", "や", "ま"]],
  ["でぃずにーらんど", ["でぃ", "ず", "に", "ー", "ら", "ん", "ど"]],
  ["ヴぃっせるこうべ", ["ヴぃ", "っ", "せ", "る", "こ", "う", "べ"]],
]);

describe("isMoraText", () => {
  it("should work correctly", () => {
    for (const text of okCases.keys()) {
      expect(isMoraText(text)).toBe(true);
    }

    const failed = ["", " ", "よみうりランド", "驫木"];

    for (const text of failed) {
      expect(isMoraText(text)).toBe(false);
    }
  });
});

describe("splitByMora", () => {
  it("should split text by mora correctly", () => {
    for (const [text, moras] of okCases.entries()) {
      expect(splitByMora(text)).toEqual(moras);
    }
  });
});

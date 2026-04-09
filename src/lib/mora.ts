/**
 * Check whether a given text consists of valid mora characters.
 *
 * Valid mora characters include:
 * - Hiragana
 * - Cho-on
 * - "ヴ"
 *
 * @param text Text.
 * @returns `true` when a given text is a valid mora text.
 */
export function isMoraText(text: string): boolean {
  return /^[\u3040-\u309F\u30F4ー]+$/.test(text);
}

const TWO_CHARS_MORAS = [
  "きゃ",
  "きゅ",
  "きょ",
  "しゃ",
  "しゅ",
  "しょ",
  "ちゃ",
  "ちゅ",
  "ちょ",
  "にゃ",
  "にゅ",
  "にょ",
  "ひゃ",
  "ひゅ",
  "ひょ",
  "みゃ",
  "みゅ",
  "みょ",
  "りゃ",
  "りゅ",
  "りょ",
  "ぎゃ",
  "ぎゅ",
  "ぎょ",
  "じゃ",
  "じゅ",
  "じょ",
  "びゃ",
  "びゅ",
  "びょ",
  "ぴゃ",
  "ぴゅ",
  "ぴょ",
  "てぃ",
  "でぃ",
  "ふぁ",
  "ふぃ",
  "ふぇ",
  "ふぉ",
  "うぃ",
  "うぇ",
  "うぉ",
  "ヴぁ",
  "ヴぃ",
  "ヴぇ",
  "ヴぉ",
  "つぁ",
  "つぃ",
  "つぇ",
  "つぉ",
  "てゅ",
  "でゅ",
  "とぅ",
  "どぅ",
  "ふゅ",
];

/**
 * Split a text into an array of moras.
 * @param text Text.
 * @returns Array of moras.
 */
export function splitByMora(text: string): string[] {
  const moras: string[] = [];
  let i = 0;

  while (i < text.length) {
    // Check two-character mora.
    if (i + 1 < text.length) {
      const twoChars = text.slice(i, i + 2);
      if (TWO_CHARS_MORAS.includes(twoChars)) {
        moras.push(twoChars);
        i += 2;
        continue;
      }
    }

    // Add single-character mora.
    moras.push(text[i]);
    i++;
  }

  return moras;
}

/**
 * Pitch accent.
 *
 * "H" stands for high pitch and "L" stands for low pitch.
 */
export type MoraPitch = "H" | "L";

/**
 * Pair of mora and its pitch accent.
 */
export type MoraWithPitch = {
  mora: string;
  pitch: MoraPitch;
};

/**
 * ひらがなの読みをモーラ単位に分割するユーティリティ
 */

// 拗音・拡張音のパターン（小さい文字が続くもの）
const YOUON_PATTERNS = [
  // 基本拗音
  'きゃ', 'きゅ', 'きょ',
  'しゃ', 'しゅ', 'しょ',
  'ちゃ', 'ちゅ', 'ちょ',
  'にゃ', 'にゅ', 'にょ',
  'ひゃ', 'ひゅ', 'ひょ',
  'みゃ', 'みゅ', 'みょ',
  'りゃ', 'りゅ', 'りょ',
  'ぎゃ', 'ぎゅ', 'ぎょ',
  'じゃ', 'じゅ', 'じょ',
  'びゃ', 'びゅ', 'びょ',
  'ぴゃ', 'ぴゅ', 'ぴょ',
  // 拡張音（外来語用）
  'てぃ', 'でぃ',
  'ふぁ', 'ふぃ', 'ふぇ', 'ふぉ',
  'うぃ', 'うぇ', 'うぉ',
  'ヴぁ', 'ヴぃ', 'ヴぅ', 'ヴぇ', 'ヴぉ',
  'つぁ', 'つぃ', 'つぇ', 'つぉ',
  'とぅ', 'どぅ',
]

/**
 * ひらがな文字列をモーラ単位の配列に分割する
 * @param reading ひらがなの読み
 * @returns モーラの配列
 */
export function splitToMora(reading: string): string[] {
  const moras: string[] = []
  let i = 0

  while (i < reading.length) {
    // 2文字の拗音・拡張音をチェック
    if (i + 1 < reading.length) {
      const twoChars = reading.slice(i, i + 2)
      if (YOUON_PATTERNS.includes(twoChars)) {
        moras.push(twoChars)
        i += 2
        continue
      }
    }

    // 1文字として追加
    moras.push(reading[i])
    i++
  }

  return moras
}

/**
 * 長音を正規化する（おう/おお → ー）
 * @param reading ひらがなの読み
 * @returns 正規化された読み
 */
export function normalizeLongVowels(reading: string): string {
  return reading
    .replace(/おう/g, 'おー')
    .replace(/おお/g, 'おー')
    .replace(/うう/g, 'うー')
    .replace(/いい/g, 'いー')
    .replace(/ええ/g, 'えー')
    .replace(/ああ/g, 'あー')
}

/**
 * 入力がひらがなのみかどうかを検証する
 * @param input 入力文字列
 * @returns ひらがなのみの場合true
 */
export function isHiraganaOnly(input: string): boolean {
  // ひらがな、長音記号、空白を許容
  return /^[\u3040-\u309Fー\s]*$/.test(input)
}

export type Pitch = 'H' | 'L'

export interface MoraWithPitch {
  mora: string
  pitch: Pitch
}

/**
 * 太陽星座（サンサイン）
 * 生年月日からサンサインを判定する。
 * 境界±2日は isBorderline: true（時刻によって変わる可能性がある）。
 */

export interface SunSignResult {
  sign: string;
  isBorderline: boolean;
}

/**
 * 各サインの開始日（近似値）。
 * 実際は年によって1日前後するため、境界付近は isBorderline フラグを立てる。
 * 配列の順番に従い「最後にマッチした行」を採用する。
 * 1/1〜1/19 はどの行にもマッチしないため、デフォルトの「やぎ座」が適用される。
 */
const SIGNS: Array<{ sign: string; m: number; d: number }> = [
  { sign: 'みずがめ座', m: 1,  d: 20 },
  { sign: 'うお座',     m: 2,  d: 19 },
  { sign: 'おひつじ座', m: 3,  d: 21 },
  { sign: 'おうし座',   m: 4,  d: 20 },
  { sign: 'ふたご座',   m: 5,  d: 21 },
  { sign: 'かに座',     m: 6,  d: 21 },
  { sign: 'しし座',     m: 7,  d: 23 },
  { sign: 'おとめ座',   m: 8,  d: 23 },
  { sign: 'てんびん座', m: 9,  d: 23 },
  { sign: 'さそり座',   m: 10, d: 23 },
  { sign: 'いて座',     m: 11, d: 22 },
  { sign: 'やぎ座',     m: 12, d: 22 },
];

/** 境界とみなす日数（前後この日数以内なら isBorderline: true） */
const BORDER_DAYS = 2;

const MONTH_OFFSETS = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

function doy(m: number, d: number): number {
  return MONTH_OFFSETS[m] + d;
}

/** 年をまたぐ日差を考慮した日数差（最小値） */
function absDayDiff(m1: number, d1: number, m2: number, d2: number): number {
  const diff = Math.abs(doy(m1, d1) - doy(m2, d2));
  return Math.min(diff, 365 - diff);
}

/**
 * 生年月日 "YYYY-MM-DD" からサンサインを返す。
 */
export function calcSunSign(birthdate: string): SunSignResult {
  const [, mm, dd] = birthdate.split('-').map(Number);
  const t = mm * 100 + dd; // e.g., 520 → 5月20日

  // デフォルトはやぎ座（1/1〜1/19 および 12/22〜）
  let sign = 'やぎ座';
  let signM = 12;
  let signD = 22;

  for (const s of SIGNS) {
    if (t >= s.m * 100 + s.d) {
      sign = s.sign;
      signM = s.m;
      signD = s.d;
    }
  }

  // 次のサイン開始日（境界判定用）
  const signIdx = SIGNS.findIndex((s) => s.sign === sign);
  const next =
    signIdx >= 0 && signIdx < SIGNS.length - 1
      ? SIGNS[signIdx + 1]
      : { m: 1, d: 20 }; // やぎ座の次はみずがめ座

  const daysFromStart = absDayDiff(mm, dd, signM, signD);
  const daysToNext = absDayDiff(mm, dd, next.m, next.d);
  const isBorderline = daysFromStart <= BORDER_DAYS || daysToNext <= BORDER_DAYS;

  return { sign, isBorderline };
}

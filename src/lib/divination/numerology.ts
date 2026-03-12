/**
 * 数秘術（ライフパスナンバー）
 * 生年月日からライフパスを算出。11, 22, 33 はマスターナンバーとして維持。
 */

/**
 * 生年月日 "YYYY-MM-DD" からライフパスナンバーを計算する。
 * @returns 1〜9, 11, 22, 33
 */
export function calcLifePath(birthdate: string): number {
  const digits = birthdate.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }
  return sum;
}

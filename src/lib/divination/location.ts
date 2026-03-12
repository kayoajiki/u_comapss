/**
 * 出生地補正（地方太陽時）
 * 補正分数 = Math.round((経度 - 135) × 4)
 */

export const LONGITUDE: Record<string, number> = {
  '北海道': 141.4,
  '札幌': 141.4,
  '東京': 139.7,
  '東京都': 139.7,
  '横浜': 139.6,
  '神奈川': 139.6,
  '埼玉': 139.6,
  '千葉': 140.1,
  '名古屋': 136.9,
  '愛知': 136.9,
  '大阪': 135.5,
  '大阪府': 135.5,
  '京都': 135.8,
  '兵庫': 135.2,
  '滋賀': 136.0,
  '奈良': 135.8,
  '広島': 132.5,
  '福岡': 130.4,
  '那覇': 127.7,
  '沖縄': 127.7,
};

/**
 * 出生地から補正分数を算出する。
 * 未登録の場合は 0 を返す（補正なしで続行）。
 */
export function getLocationOffsetMinutes(place: string | null | undefined): number {
  if (!place) return 0;
  const lon = LONGITUDE[place] ?? null;
  if (lon === null) return 0;
  return Math.round((lon - 135) * 4);
}

/**
 * JST の時刻文字列 "HH:MM" に補正分数を加算し、
 * 地方太陽時の "HH:MM" を返す。
 */
export function adjustTimeByOffsetMinutes(
  timeStr: string,
  offsetMin: number
): { adjustedTime: string; dayShift: number } {
  const [h = 0, min = 0] = timeStr.split(':').map(Number);
  const totalMin = h * 60 + min + offsetMin;
  const normalized = ((totalMin % 1440) + 1440) % 1440;
  const adjH = Math.floor(normalized / 60);
  const adjM = normalized % 60;
  const dayShift = Math.floor(totalMin / 1440) - (totalMin < 0 ? 1 : 0);
  const adjustedTime = `${String(adjH).padStart(2, '0')}:${String(adjM).padStart(2, '0')}`;
  return { adjustedTime, dayShift };
}

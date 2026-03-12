/**
 * 紫微斗数（iztro）
 * ロケールは必ず 'ja-JP'。副星は adjectiveStars から TARGET_ADJ を抽出。
 */

import { astro } from 'iztro';
import {
  getLocationOffsetMinutes,
  adjustTimeByOffsetMinutes,
} from './location';

const LOCALE = 'ja-JP' as const;

/** 副星の対象（adjectiveStars から抽出） */
const TARGET_ADJ = ['天喜', '天刑', '紅鸞', '天姚'];

/** 宮の表示順（命宮を先頭に） */
const PALACE_ORDER = [
  '命宮',
  '兄弟',
  '夫妻',
  '子女',
  '財帛',
  '疾厄',
  '遷移',
  '僕役',
  '官祿',
  '田宅',
  '福德',
  '父母',
];

const SHICHEN_LABELS: Record<number, string> = {
  0: '子時',
  1: '丑時',
  2: '寅時',
  3: '卯時',
  4: '辰時',
  5: '巳時',
  6: '午時',
  7: '未時',
  8: '申時',
  9: '酉時',
  10: '戌時',
  11: '亥時',
};

/**
 * JST "HH:MM" を地方太陽時補正し、時辰番号（0〜11）に変換する。
 * 時辰: 0=子(23-1時), 1=丑(1-3時), ... 11=亥(21-23時)
 */
export function timeToShichenIndex(timeStr: string, offsetMin: number): number {
  const { adjustedTime } = adjustTimeByOffsetMinutes(timeStr, offsetMin);
  const [h = 0] = adjustedTime.split(':').map(Number);
  return Math.floor(((h + 1) % 24) / 2);
}

export interface ZiweiPalace {
  name: string;
  isBodyPalace: boolean;
  majorStars: Array<{
    name: string;
    brightness: string;
    mutagen: string | null;
  }>;
  minorStars: string[];
}

export interface ZiweiResult {
  fiveElementsClass: string;
  bodyMain: string;
  lifeMain: string;
  palaces: ZiweiPalace[];
  locationOffset?: {
    place: string;
    offsetMin: number;
    originalShichen: number;
    adjustedShichen: number;
    shichenLabel: string;
  };
}

export interface CalcZiweiInput {
  birthdate: string;
  birthtime: string;
  gender: 'female' | 'male';
  birthplace?: string | null;
}

interface PalaceLike {
  name: string;
  isBodyPalace?: boolean;
  majorStars?: Array<{ name: string; brightness?: string; mutagen?: string }>;
  minorStars?: Array<{ name: string }>;
  adjectiveStars?: Array<{ name: string }>;
}

function pickPalaceByName(
  palaces: PalaceLike[],
  palName: string
): PalaceLike | undefined {
  const exact = palaces.find((p) => p.name === palName || p.name === palName + '宮');
  if (exact) return exact;
  return palaces.find((p) => p.name.startsWith(palName));
}

/**
 * 紫微斗数を計算する。時刻は必須。
 */
export function calcZiwei(input: CalcZiweiInput): ZiweiResult {
  const { birthdate, birthtime, gender, birthplace } = input;
  const offsetMin = getLocationOffsetMinutes(birthplace);
  const adjustedShichen = timeToShichenIndex(birthtime, offsetMin);

  const result = astro.bySolar(
    birthdate,
    adjustedShichen,
    gender,
    false,
    LOCALE
  );

  const palaceList: ZiweiPalace[] = [];
  const palaces = result.palaces as PalaceLike[];
  for (const palName of PALACE_ORDER) {
    const palace = pickPalaceByName(palaces, palName);
    if (!palace) continue;

    const majorStars = (palace.majorStars ?? []).map((s) => ({
      name: s.name,
      brightness: s.brightness ?? '',
      mutagen: s.mutagen ?? null,
    }));
    const minorNames = (palace.minorStars ?? []).map((s) => s.name);
    const adjNames = (palace.adjectiveStars ?? [])
      .filter((s) => TARGET_ADJ.includes(s.name))
      .map((s) => s.name);
    const minorStars = [...minorNames, ...adjNames];

    palaceList.push({
      name: palace.name,
      isBodyPalace: Boolean(palace.isBodyPalace),
      majorStars,
      minorStars,
    });
  }

  const out: ZiweiResult = {
    fiveElementsClass: result.fiveElementsClass ?? '',
    bodyMain: result.body ?? '',
    lifeMain: result.soul ?? '',
    palaces: palaceList,
  };

  if (birthplace && offsetMin !== 0) {
    const [h] = birthtime.split(':').map(Number);
    const originalShichen = Math.floor(((h + 1) % 24) / 2);
    out.locationOffset = {
      place: birthplace,
      offsetMin,
      originalShichen,
      adjustedShichen,
      shichenLabel: SHICHEN_LABELS[adjustedShichen] ?? '',
    };
  }

  return out;
}

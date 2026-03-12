/**
 * 四柱推命（lunar-typescript + 鳥海流蔵干）
 * getYun(): 0=女性, 1=男性
 */

import { Solar } from 'lunar-typescript';
import {
  getLocationOffsetMinutes,
  adjustTimeByOffsetMinutes,
} from './location';

// ===== 中国語 → 日本語 用語変換 =====
const JA: Record<string, string> = {
  '比肩': '比肩',
  '劫财': '劫財',
  '食神': '食神',
  '伤官': '傷官',
  '偏财': '偏財',
  '正财': '正財',
  '偏官': '偏官',
  '七杀': '偏官',
  '偏印': '偏印',
  '正印': '印綬',
  '长生': '長生',
  '沐浴': '沐浴',
  '冠带': '冠帯',
  '临官': '建禄',
  '帝旺': '帝旺',
  '衰': '衰',
  '病': '病',
  '死': '死',
  '墓': '墓',
  '绝': '絶',
  '胎': '胎',
  '养': '養',
};
function ja(s: string): string {
  return JA[s] ?? s;
}

// ===== 鳥海流蔵干表 =====
const TORIUMI: Record<
  string,
  Array<{ gan: string; label: '初気' | '中気' | '本気'; until: number | null }>
> = {
  '子': [{ gan: '癸', label: '本気', until: null }],
  '丑': [
    { gan: '癸', label: '初気', until: 9 },
    { gan: '辛', label: '中気', until: 12 },
    { gan: '己', label: '本気', until: null },
  ],
  '寅': [
    { gan: '戊', label: '初気', until: 7 },
    { gan: '丙', label: '中気', until: 14 },
    { gan: '甲', label: '本気', until: null },
  ],
  '卯': [{ gan: '乙', label: '本気', until: null }],
  '辰': [
    { gan: '乙', label: '初気', until: 9 },
    { gan: '癸', label: '中気', until: 12 },
    { gan: '戊', label: '本気', until: null },
  ],
  '巳': [
    { gan: '戊', label: '初気', until: 5 },
    { gan: '庚', label: '中気', until: 14 },
    { gan: '丙', label: '本気', until: null },
  ],
  '午': [
    { gan: '己', label: '初気', until: 19 },
    { gan: '丁', label: '本気', until: null },
  ],
  '未': [
    { gan: '丁', label: '初気', until: 9 },
    { gan: '乙', label: '中気', until: 12 },
    { gan: '己', label: '本気', until: null },
  ],
  '申': [
    { gan: '戊', label: '初気', until: 10 },
    { gan: '壬', label: '中気', until: 13 },
    { gan: '庚', label: '本気', until: null },
  ],
  '酉': [{ gan: '辛', label: '本気', until: null }],
  '戌': [
    { gan: '辛', label: '初気', until: 9 },
    { gan: '丁', label: '中気', until: 13 },
    { gan: '戊', label: '本気', until: null },
  ],
  '亥': [
    { gan: '甲', label: '初気', until: 12 },
    { gan: '壬', label: '本気', until: null },
  ],
};

const ZHI_TO_JIEQI: Record<string, string[]> = {
  '寅': ['立春', 'LI_CHUN'],
  '卯': ['惊蛰', 'JING_ZHE'],
  '辰': ['清明', 'QING_MING'],
  '巳': ['立夏', 'LI_XIA'],
  '午': ['芒种', 'MANG_ZHONG'],
  '未': ['小暑', 'XIAO_SHU'],
  '申': ['立秋', 'LI_QIU'],
  '酉': ['白露', 'BAI_LU'],
  '戌': ['寒露', 'HAN_LU'],
  '亥': ['立冬', 'LI_DONG'],
  '子': ['大雪', 'DA_XUE'],
  '丑': ['小寒', 'XIAO_HAN'],
};

function elapsedDaysFromJieqi(
  birthSolar: Solar,
  monthZhi: string,
  jieqiTable: Record<string, Solar>
): number | null {
  const names = ZHI_TO_JIEQI[monthZhi] ?? [];
  let jieqi: Solar | null = null;
  for (const name of names) {
    if (jieqiTable[name]) {
      jieqi = jieqiTable[name];
      break;
    }
  }
  if (!jieqi) return null;
  const b = new Date(
    birthSolar.getYear(),
    birthSolar.getMonth() - 1,
    birthSolar.getDay(),
    birthSolar.getHour?.() ?? 12
  );
  const j = new Date(
    jieqi.getYear(),
    jieqi.getMonth() - 1,
    jieqi.getDay(),
    jieqi.getHour?.() ?? 0
  );
  return Math.floor((b.getTime() - j.getTime()) / 86400000) + 1;
}

function selectHideGan(
  zhi: string,
  days: number | null
): { gan: string; label: '初気' | '中気' | '本気' } | null {
  const table = TORIUMI[zhi];
  if (!table || days === null) return null;
  for (const entry of table) {
    if (entry.until === null || days <= entry.until) return entry;
  }
  return table[table.length - 1] ?? null;
}

function countWuXing(ganZhiList: string[]): {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
} {
  const all = ganZhiList.join('');
  return {
    木: (all.match(/木/g) ?? []).length,
    火: (all.match(/火/g) ?? []).length,
    土: (all.match(/土/g) ?? []).length,
    金: (all.match(/金/g) ?? []).length,
    水: (all.match(/水/g) ?? []).length,
  };
}

// ===== 公開型（api-spec 準拠） =====
export interface BranchInfo {
  zhi: string;
  hideGan: string;
  hideGanLabel: '初気' | '中気' | '本気';
  shiShen: string;
  diShi: string;
  elapsedDays: number;
}

export interface BaziResult {
  pillars: {
    year: { ganZhi: string };
    month: { ganZhi: string };
    day: { ganZhi: string };
    time: { ganZhi: string } | null;
  };
  dayGan: string;
  shiShenGan: {
    year: string;
    month: string;
    time: string | null;
  };
  branches: {
    year: BranchInfo;
    month: BranchInfo;
    day: BranchInfo;
    time: BranchInfo | null;
  };
  wuXing: { 木: number; 火: number; 土: number; 金: number; 水: number };
  xunKong: {
    year: string;
    month: string;
    day: string;
    time: string | null;
  };
  nineStar: { year: string; month: string; day: string };
  daYun: {
    startAge: string;
    list: Array<{ ganZhi: string; startAge: number; endAge: number }>;
  };
  locationOffset?: {
    place: string;
    offsetMin: number;
    adjustedTime: string;
  };
}

export interface CalcBaziInput {
  birthdate: string;
  birthtime?: string | null;
  birthplace?: string | null;
  gender?: 'female' | 'male';
}

/**
 * 四柱推命を計算する。
 * birthtime が無い場合は時柱なしで計算。gender は大運の順逆に使用（0=女性・1=男性）。
 */
export function calcBazi(input: CalcBaziInput): BaziResult {
  const { birthdate, birthtime, birthplace, gender = 'female' } = input;
  const [y, m, d] = birthdate.split('-').map(Number);
  const offsetMin = getLocationOffsetMinutes(birthplace);
  let solar: Solar;

  if (birthtime) {
    const { adjustedTime, dayShift } = adjustTimeByOffsetMinutes(
      birthtime,
      offsetMin
    );
    const [adjH, adjM] = adjustedTime.split(':').map(Number);
    const adjDate = new Date(y, m - 1, d + dayShift);
    solar = Solar.fromYmdHms(
      adjDate.getFullYear(),
      adjDate.getMonth() + 1,
      adjDate.getDate(),
      adjH,
      adjM,
      0
    );
  } else {
    solar = Solar.fromYmd(y, m, d);
  }

  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  const yearGZ = bazi.getYear();
  const monthGZ = bazi.getMonth();
  const dayGZ = bazi.getDay();
  const timeGZ = birthtime ? bazi.getTime() : null;

  const wxList = [
    bazi.getYearWuXing(),
    bazi.getMonthWuXing(),
    bazi.getDayWuXing(),
  ];
  if (birthtime) wxList.push(bazi.getTimeWuXing());
  const wuXing = countWuXing(wxList);

  const dayGan = bazi.getDayGan();
  const shiShenGan = {
    year: ja(bazi.getYearShiShenGan()),
    month: ja(bazi.getMonthShiShenGan()),
    time: birthtime ? ja(bazi.getTimeShiShenGan()) : null,
  };

  const monthZhi = bazi.getMonthZhi();
  const jieqiTable = lunar.getJieQiTable();
  const elapsedDays = elapsedDaysFromJieqi(solar, monthZhi, jieqiTable);
  const days = elapsedDays ?? 0;

  const zhiList = [
    bazi.getYearZhi(),
    bazi.getMonthZhi(),
    bazi.getDayZhi(),
    birthtime ? bazi.getTimeZhi() : null,
  ];
  const allHide = [
    bazi.getYearHideGan(),
    bazi.getMonthHideGan(),
    bazi.getDayHideGan(),
    birthtime ? bazi.getTimeHideGan() : null,
  ];
  const allSS = [
    bazi.getYearShiShenZhi(),
    bazi.getMonthShiShenZhi(),
    bazi.getDayShiShenZhi(),
    birthtime ? bazi.getTimeShiShenZhi() : null,
  ];
  const allDiShi = [
    bazi.getYearDiShi(),
    bazi.getMonthDiShi(),
    bazi.getDayDiShi(),
    birthtime ? bazi.getTimeDiShi() : null,
  ];

  function toBranchInfo(
    zhi: string,
    gz: string,
    hideGans: string[],
    ssList: string[],
    diShi: string
  ): BranchInfo {
    const selected = selectHideGan(zhi, elapsedDays);
    const idx = selected ? hideGans.indexOf(selected.gan) : -1;
    const shiShen = idx >= 0 ? ja(ssList[idx] ?? '') : '';
    return {
      zhi,
      hideGan: selected?.gan ?? '',
      hideGanLabel: selected?.label ?? '本気',
      shiShen,
      diShi: diShi ? ja(diShi) : '',
      elapsedDays: days,
    };
  }

  const branches = {
    year: toBranchInfo(
      bazi.getYearZhi(),
      yearGZ,
      bazi.getYearHideGan(),
      bazi.getYearShiShenZhi(),
      bazi.getYearDiShi()
    ),
    month: toBranchInfo(
      bazi.getMonthZhi(),
      monthGZ,
      bazi.getMonthHideGan(),
      bazi.getMonthShiShenZhi(),
      bazi.getMonthDiShi()
    ),
    day: toBranchInfo(
      bazi.getDayZhi(),
      dayGZ,
      bazi.getDayHideGan(),
      bazi.getDayShiShenZhi(),
      bazi.getDayDiShi()
    ),
    time: birthtime
      ? toBranchInfo(
          bazi.getTimeZhi(),
          bazi.getTime(),
          bazi.getTimeHideGan(),
          bazi.getTimeShiShenZhi(),
          bazi.getTimeDiShi()
        )
      : null,
  };

  const fmtNineStar = (ns: { getNumber: () => string; getColor: () => string; getWuXing: () => string }) =>
    `${ns.getNumber()}${ns.getColor()}${ns.getWuXing()}星`;
  const nineStar = {
    year: fmtNineStar(lunar.getYearNineStar()),
    month: fmtNineStar(lunar.getMonthNineStar()),
    day: fmtNineStar(lunar.getDayNineStar()),
  };

  const xunKong = {
    year: bazi.getYearXunKong(),
    month: bazi.getMonthXunKong(),
    day: bazi.getDayXunKong(),
    time: birthtime ? bazi.getTimeXunKong() : null,
  };

  // getYun: 0=女性, 1=男性
  const genderNum = gender === 'female' ? 0 : 1;
  const yun = bazi.getYun(genderNum);
  const startAge = `${yun.getStartYear()}歳${yun.getStartMonth()}ヶ月`;
  const daYunList = yun.getDaYun().slice(1, 7);

  const result: BaziResult = {
    pillars: {
      year: { ganZhi: yearGZ },
      month: { ganZhi: monthGZ },
      day: { ganZhi: dayGZ },
      time: timeGZ ? { ganZhi: timeGZ } : null,
    },
    dayGan,
    shiShenGan,
    branches,
    wuXing,
    xunKong,
    nineStar,
    daYun: {
      startAge,
      list: daYunList.map((dy) => ({
        ganZhi: dy.getGanZhi(),
        startAge: dy.getStartAge(),
        endAge: dy.getEndAge(),
      })),
    },
  };

  if (birthtime && birthplace && offsetMin !== 0) {
    const { adjustedTime } = adjustTimeByOffsetMinutes(birthtime, offsetMin);
    result.locationOffset = {
      place: birthplace,
      offsetMin,
      adjustedTime,
    };
  }

  return result;
}

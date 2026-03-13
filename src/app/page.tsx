"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  year: z.string().min(1, "年を選択してください"),
  month: z.string().min(1, "月を選択してください"),
  day: z.string().min(1, "日を選択してください"),
  birthtime: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}:\d{2}$/.test(val),
      "時刻は HH:MM 形式で入力してください"
    ),
  unknownTime: z.boolean().optional(),
  birthplace: z.string().optional(),
  gender: z.enum(["female", "male"]).optional(),
}).superRefine((values, ctx) => {
  const { year, month, day } = values;
  if (!year || !month || !day) return;
  const birthdateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;
  const birthdate = new Date(birthdateStr);
  const today = new Date();
  if (Number.isNaN(birthdate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["day"],
      message: "有効な日付を選択してください",
    });
    return;
  }
  if (birthdate >= today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["day"],
      message: "生年月日は過去の日付を選択してください",
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export default function HomePage() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i)),
    [currentYear]
  );
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1)),
    []
  );
  const days = useMemo(
    () => Array.from({ length: 31 }, (_, i) => String(i + 1)),
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "female",
      unknownTime: false,
    },
  });

  const unknownTime = watch("unknownTime");

  const onSubmit = (values: FormValues) => {
    const birthdate = `${values.year}-${values.month.padStart(
      2,
      "0"
    )}-${values.day.padStart(2, "0")}`;

    const params = new URLSearchParams();
    params.set("birthdate", birthdate);

    if (!values.unknownTime && values.birthtime) {
      params.set("birthtime", values.birthtime);
    }
    if (values.birthplace) {
      params.set("birthplace", values.birthplace);
    }
    if (values.gender) {
      params.set("gender", values.gender);
    }

    router.push(`/result?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-md">
        <header className="mb-6 text-center">
          <div className="text-xs tracking-[0.3em] text-violet-400 mb-2">
            ✦ 人生の羅針盤 ✦
          </div>
          <h1
            className="text-2xl text-violet-800 mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            人生の羅針盤
          </h1>
          <p className="text-sm text-violet-400">
            生年月日から、自分を知る旅が始まる。
          </p>
        </header>

        <section className="bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-violet-700 mb-1">
                生年月日
                <span className="ml-1 text-pink-400 text-xs">必須</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    className="w-full bg-white/50 border border-violet-200/50 rounded-xl px-3 py-2 text-violet-900 focus:outline-none focus:border-violet-400 text-sm"
                    {...register("year")}
                  >
                    <option value="">年</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <select
                    className="w-full bg-white/50 border border-violet-200/50 rounded-xl px-3 py-2 text-violet-900 focus:outline-none focus:border-violet-400 text-sm"
                    {...register("month")}
                  >
                    <option value="">月</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <select
                    className="w-full bg-white/50 border border-violet-200/50 rounded-xl px-3 py-2 text-violet-900 focus:outline-none focus:border-violet-400 text-sm"
                    {...register("day")}
                  >
                    <option value="">日</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {errors.year && (
                <p className="mt-1 text-xs text-pink-500">{errors.year.message}</p>
              )}
              {errors.month && (
                <p className="mt-1 text-xs text-pink-500">{errors.month.message}</p>
              )}
              {errors.day && (
                <p className="mt-1 text-xs text-pink-500">{errors.day.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-violet-700 mb-1">
                生まれた時刻（わかる場合）
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  className="w-full bg-white/50 border border-violet-200/50 rounded-xl px-3 py-2 text-violet-900 focus:outline-none focus:border-violet-400 text-sm disabled:opacity-60"
                  {...register("birthtime")}
                  disabled={unknownTime}
                />
              </div>
              <label className="mt-1 flex items-center gap-2 text-xs text-violet-500">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-violet-300 text-violet-500"
                  {...register("unknownTime")}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setValue("unknownTime", checked);
                    if (checked) {
                      setValue("birthtime", undefined);
                    }
                  }}
                />
                時刻がわからない
              </label>
              {errors.birthtime && (
                <p className="mt-1 text-xs text-pink-500">
                  {errors.birthtime.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-violet-700 mb-1">
                出生地（都道府県）
              </label>
              <select
                className="w-full bg-white/50 border border-violet-200/50 rounded-xl px-3 py-2 text-violet-900 focus:outline-none focus:border-violet-400 text-sm"
                {...register("birthplace")}
              >
                <option value="">選択しない</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-violet-700 mb-1">性別（任意）</label>
              <div className="flex gap-4 text-sm text-violet-800">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    value="female"
                    {...register("gender")}
                    className="h-3 w-3 border-violet-300 text-violet-500"
                  />
                  女性
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    value="male"
                    {...register("gender")}
                    className="h-3 w-3 border-violet-300 text-violet-500"
                  />
                  男性
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ fontFamily: "var(--font-heading)" }}
              className="w-full bg-gradient-to-r from-violet-400 to-pink-300 text-white rounded-full py-3 font-medium shadow-lg shadow-violet-200 hover:opacity-90 transition-all disabled:opacity-60"
            >
              鑑定する
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

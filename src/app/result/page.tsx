import Link from "next/link";
import { Lock } from "lucide-react";
import { calcSunSign } from "@/lib/divination/sunSign";
import { calcLifePath } from "@/lib/divination/numerology";
import { calcBazi } from "@/lib/divination/bazi";
import type { ReactNode } from "react";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type WuXing = {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
};

const LIFE_PATH_TEXT: Record<number, string> = {
  1: "ライフパス1は「はじまり」と「リーダーシップ」の数字です。自分で決めて動くときに力を発揮し、人に合わせすぎると元気を失いやすいタイプ。新しいことを切り拓く役割を担いやすく、遠慮よりも「まずやってみる」ほうが流れが開きやすい傾向があります。",
  2: "ライフパス2は「つなぐ」「支える」の数字です。人の気持ちを読む力が高く、対立をやわらげたり、場を整えたりすることで本領発揮するタイプ。自分の感情を後回しにしがちなので、「自分はどう感じているか」を丁寧に扱うほど、人間関係も仕事も楽になりやすい傾向があります。",
  3: "ライフパス3は「表現」と「楽しさ」の数字です。好奇心が強く、思いつきを形にしていくことで運が動きやすいタイプ。真面目にしようとしすぎると行き詰まりやすく、「おもしろそう」「やってみたい」という気持ちを大切にすると、自然と人とのご縁やチャンスが巡ってきやすい傾向があります。",
  4: "ライフパス4は「安定」と「土台づくり」の数字です。コツコツ積み上げる力があり、仕組みを整えたり、基盤を固めたりする役回りで信頼されやすいタイプ。スピードや変化を求められすぎると疲れやすいので、自分なりのペースとルールを大事にすると、長期的に大きな成果につながりやすい傾向があります。",
  5: "ライフパス5は「変化」と「自由」の数字です。同じ場所にとどまるより、環境や役割を変えながら経験を重ねることで成長していくタイプ。飽きっぽさは欠点ではなく、合わないものから早く離れるセンサーでもあります。制限しすぎず、適度な自由度を自分に許すほどチャンスが広がりやすい傾向があります。",
  6: "ライフパス6は「愛情」と「調和」の数字です。家族や身近な人を大切にし、人の面倒をみることで自分の存在意義を感じやすいタイプ。献身が行き過ぎると疲れやすいので、「自分を満たすこと」も同じくらい大事なテーマ。自分を大切にするほど、人にもやさしさを自然に循環させられる傾向があります。",
  7: "ライフパス7は「探求」と「本質」の数字です。一人で考える時間が必要で、物事の裏側や本質を知ろうとする研究者気質のタイプ。表面だけのつきあいや仕事に違和感を覚えやすく、自分なりの答えを見つけたときに大きく飛躍します。孤独と感じる時間も、実は深い学びのための大事なプロセスであることが多い数字です。",
  8: "ライフパス8は「パワー」と「成果」の数字です。目標を決めて結果を出すことに向いており、責任ある立場や大きなテーマを任されやすいタイプ。仕事やお金のテーマが人生に絡みやすく、「どう稼ぐか」だけでなく「どう使うか」「誰のために力を使うか」が大きな学びになります。本気を出すほど、周囲にも影響力を持ちやすい数字です。",
  9: "ライフパス9は「受容」と「統合」の数字です。どんな立場の人の気持ちも想像できてしまう、やさしい感性の持ち主。境界線がゆるくなりすぎると疲れやすいので、「ここから先は相手の課題」と切り分けることが大事なテーマ。経験したことのすべてを、いつか誰かのために役立てていく「まとめ役」の役割を担いやすい数字です。",
  11: "ライフパス11は「感受性」と「インスピレーション」の数字です。雰囲気や空気の変化に敏感で、人の言葉にならない気持ちをキャッチしやすいタイプ。周囲に合わせすぎると自分がわからなくなりやすいので、「自分の感覚」を信じて選ぶことが大事なテーマ。直感を丁寧に扱うほど、不思議なタイミングで導かれやすい数字です。",
  22: "ライフパス22は「大きな器」と「現実化」の数字です。スケールの大きなビジョンや、人の役に立つ仕組みづくりに関わることで力を発揮しやすいタイプ。プレッシャーを抱え込みすぎると苦しくなるので、「一人で背負わない」ことが重要なテーマ。コツコツ型とひらめき型の両方を持ち、長期的なプロジェクトに取り組む素質があります。",
  33: "ライフパス33は「共感」と「奉仕」の数字です。人の痛みや喜びを自分のことのように感じやすく、「みんなの幸せ」を願う気持ちが強いタイプ。期待に応えようとしすぎると疲れやすいので、まず自分の心と身体を満たすことが最優先のテーマ。自分なりのペースで動くほど、自然と人を笑顔にする力が育っていく数字です。",
};

const SUN_SIGN_TEXT: Record<string, string> = {
  みずがめ座:
    "みずがめ座のあなたは、「常識」や「ふつう」にとらわれず、自分なりの価値観で世界を更新していく人です。合わないルールに無理に合わせるよりも、同じ感覚を持つ仲間とつながることで、あなたらしい未来がひらけていきます。",
  うお座:
    "うお座のあなたは、人の感情や空気を敏感に感じ取る、やわらかな感性の持ち主です。境界があいまいになりやすいぶん、自分の心と身体を守る時間をつくることが大切。他人のために動く優しさと、自分を守る線引きの両方がテーマになります。",
  おひつじ座:
    "おひつじ座のあなたは、「まず動いてみる」ことで道を切りひらくパイオニアタイプです。慎重になりすぎると本来の良さがくもりがち。小さくても一歩を踏み出すことで、エネルギーが循環しやすくなり、あなたらしいリズムが戻ってきます。",
  おうし座:
    "おうし座のあなたは、じっくり味わいながら、安心できる土台を育てていく人です。スピードよりも「心地よさ」や「豊かさの質」を大切にすると、本来の力が発揮されます。急かされても、自分のペースを守ることが大きなテーマになります。",
  ふたご座:
    "ふたご座のあなたは、言葉や情報を通じて世界をつなぐメッセンジャーです。好奇心のままに学び、試し、シェアしていくことで、自然と人とのご縁が広がります。「飽きっぽさ」は欠点ではなく、次へ進むサインとして働きやすい星座です。",
  かに座:
    "かに座のあなたは、「守る」「育てる」ことに喜びを感じる、包容力のある人です。家族や身近な人間関係が人生の大きなテーマになりがち。外で頑張るだけでなく、自分が安心できる居場所や、心をゆるめられる相手を大切にするほど力が湧いてきます。",
  しし座:
    "しし座のあなたは、自分の存在そのものが周りを照らす、太陽のような人です。遠慮しすぎると本来の魅力が伝わりにくくなります。好きなこと・得意なことを堂々と表現し、「これが私です」と名乗ることで、自然と応援される流れが生まれていきます。",
  おとめ座:
    "おとめ座のあなたは、細やかな気づきと改善力で、物事をより良くしていく職人タイプです。「こうしたほうがよくなる」に気づきやすいぶん、自分に厳しくなりがち。完璧を目指すよりも、「いま出来ていること」を丁寧に認めることが大きなテーマです。",
  てんびん座:
    "てんびん座のあなたは、人と人、価値と価値のバランスをとる調整役です。美しさや心地よさ、フェアさに敏感で、違和感を放っておけないところがあります。どちらか一方に偏るよりも、「自分はどう感じるか」を真ん中に置くことで、関係性が整いやすくなります。",
  さそり座:
    "さそり座のあなたは、物事の表面ではなく「本音」や「本質」を求める、深堀りタイプです。浅い関係よりも、少数の深いご縁を大切にすることで、安心感と力が増していきます。心から信じられるものに出会ったとき、驚くほどの集中力と変容力を発揮する星座です。",
  いて座:
    "いて座のあなたは、「もっと先へ」「もっと広く」を求める探求者です。旅・学び・挑戦を通じて、自分の世界観を広げていきます。細かい制限に縛られるとエネルギーが落ちやすいので、大きなビジョンや理想を忘れずに持ち続けることがテーマになります。",
  やぎ座:
    "やぎ座のあなたは、時間をかけて確かな実績を積み上げていく、責任感の強い人です。すぐに結果が出なくても、粘り強く続けることで信頼が育ちます。「ちゃんとしなきゃ」と頑張りすぎる傾向があるので、自分をねぎらう時間を意識的につくることも大切なテーマです。",
};

interface ResultPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const birthdateParam = params.birthdate;
  const birthtimeParam = params.birthtime;
  const birthplaceParam = params.birthplace;
  const genderParam = params.gender;

  const birthdateValue =
    typeof birthdateParam === "string"
      ? birthdateParam
      : Array.isArray(birthdateParam)
      ? birthdateParam[0]
      : undefined;

  // searchParams になんらかの事情で birthdate が載ってこない場合のみエラー扱いにする
  if (!birthdateValue) {
    return (
      <Wrapper>
        <ErrorBlock />
      </Wrapper>
    );
  }

  const birthdate = birthdateValue;

  const birthtime =
    typeof birthtimeParam === "string" ? birthtimeParam : undefined;
  const birthplace =
    typeof birthplaceParam === "string" ? birthplaceParam : undefined;
  const gender =
    typeof genderParam === "string" &&
    (genderParam === "female" || genderParam === "male")
      ? genderParam
      : undefined;

  let wuXing: WuXing | undefined;
  let dayGan: string | undefined;
  let dayGanZhi: string | undefined;

  try {
    const baziResult = calcBazi({ birthdate, birthtime, birthplace, gender });
    wuXing = baziResult.wuXing;
    dayGan = baziResult.dayGan;
    dayGanZhi = baziResult.pillars.day.ganZhi;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("calcBazi failed", e);
    }
  }

  const lifePath = calcLifePath(birthdate);
  const sun = calcSunSign(birthdate);

  const wuXingSummary = getWuXingSummary(wuXing);

  return (
    <Wrapper>
      <div className="w-full max-w-md mx-auto">
        {/* 戻るリンク */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-violet-400 hover:underline"
          >
            ← 入力に戻る
          </Link>
        </div>

        {/* タイトル */}
        <header className="mb-6">
          <h1
            className="text-xl text-violet-800 mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            あなたの鑑定結果
          </h1>
          <p className="text-xs text-violet-400">
            生年月日: {birthdate}
            {birthplace && ` ／ 出生地: ${birthplace}`}
          </p>
        </header>

        {/* 無料鑑定カード */}
        <section className="space-y-4">
          {/* ライフパスナンバー */}
          <div className="bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6">
            <h2
              className="text-sm text-violet-700 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              数秘術 · ライフパスナンバー
            </h2>
            <p className="text-[11px] text-violet-500 mb-2">
              生年月日から導き出される、「あなたの人生のメインテーマ」をあらわす数字です。
            </p>
            <div className="mb-3">
              <div
                className="text-8xl leading-none bg-gradient-to-r from-violet-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-number)" }}
              >
                {lifePath}
              </div>
            </div>
            <p className="text-xs text-violet-600 leading-relaxed">
              {LIFE_PATH_TEXT[lifePath] ??
                `あなたのライフパスは ${lifePath} です。この数字は、あなたの人生を通して繰り返し立ち現れるテーマを示しています。`}
            </p>
          </div>

          {/* 太陽星座 */}
          <div className="bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6">
            <h2
              className="text-sm text-violet-700 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              西洋占星術 · 太陽星座
            </h2>
            <div className="mb-2">
              <div
                className="text-3xl text-violet-800"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {sun.sign}
              </div>
            </div>
            {sun.isBorderline && (
              <p className="text-[10px] text-violet-400 mb-2">
                生まれた時刻によって変わる可能性があります。
              </p>
            )}
            <p className="text-xs text-violet-600 leading-relaxed">
              {SUN_SIGN_TEXT[sun.sign] ??
                `${sun.sign}のあなたは、ここからどんな光を世界に届けていきたいかを問いかけられています。太陽星座は、表向きの顔やエネルギーの向かう方向をあらわします。`}
            </p>
          </div>

          {/* 日干 */}
          {dayGan && dayGanZhi && (
            <DayGanCard dayGan={dayGan} dayGanZhi={dayGanZhi} />
          )}

          {/* 五行バランス */}
          <div className="bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6">
            <h2
              className="text-sm text-violet-700 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              四柱推命 · 五行バランス
            </h2>
            {wuXing ? (
              <>
                <div className="space-y-1 mb-3 text-xs">
                  {renderWuXingRow("木", wuXing.木, "bg-emerald-200")}
                  {renderWuXingRow("火", wuXing.火, "bg-pink-200")}
                  {renderWuXingRow("土", wuXing.土, "bg-amber-200")}
                  {renderWuXingRow("金", wuXing.金, "bg-violet-200")}
                  {renderWuXingRow("水", wuXing.水, "bg-cyan-200")}
                </div>
                <p className="text-xs text-violet-600 leading-relaxed">
                  {wuXingSummary ??
                    "五行のそれぞれが、あなたの中でどのように働きやすいかをあらわしています。"}
                </p>
              </>
            ) : (
              <p className="text-xs text-violet-500">
                五行バランスは、出生情報がもう少し詳しいときに詳しく見ることができます。
              </p>
            )}
          </div>
        </section>

        {/* 区切り線 */}
        <div className="border-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent my-8" />

        {/* 有料コンテンツエリア */}
        <section className="mb-8">
          <h2
            className="text-base text-violet-800 mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            さらに深く知る
          </h2>
          <p className="text-sm text-violet-400 mb-4">
            5つの窓から、あなたの本質へ。
          </p>

          <div className="space-y-3">
            {THEME_CARDS.map((card) => (
              <LockedThemeCard key={card.key} {...card} />
            ))}
            <ComingSoonCard />
          </div>
        </section>
      </div>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}

function ErrorBlock() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-violet-400 hover:underline"
        >
          ← 入力に戻る
        </Link>
      </div>
      <div className="bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6">
        <p className="text-sm text-violet-700">
          鑑定できませんでした。入力に戻って、生年月日などをもう一度確認してください。
        </p>
      </div>
    </div>
  );
}

function renderWuXingRow(label: string, value: number, colorClass: string) {
  const count = Math.max(0, Math.min(8, Math.round(value ?? 0)));
  return (
    <div className="flex items-center justify-between">
      <span className="text-violet-800">{label}</span>
      <div className="flex gap-1">
        {count === 0 ? (
          <span className="text-[10px] text-violet-300">・</span>
        ) : (
          Array.from({ length: count }).map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full ${colorClass}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

const DAY_GAN_DATA: Record<
  string,
  { reading: string; element: string; keyword: string; description: string }
> = {
  甲: {
    reading: "きのえ",
    element: "木",
    keyword: "開拓・意志",
    description:
      "大木のように真っすぐ伸びる力を持ちます。曲げられても折れない芯を持ち、周りがどうであっても自分の信じる道を進もうとする人です。「はじめの一歩」を任されることが多く、新しい環境や役割でこそ本来の力が発揮されやすいタイプと言えます。",
  },
  乙: {
    reading: "きのと",
    element: "木",
    keyword: "柔軟・適応",
    description:
      "風に揺れながらも根を張る草木のように、しなやかさと粘り強さをあわせ持つ人です。周囲の状況に合わせて形を変えながらも、自分なりのペースで着実に前へ進んでいきます。派手さよりも、気づけば周りから信頼されている「縁の下の力持ち」タイプです。",
  },
  丙: {
    reading: "ひのえ",
    element: "火",
    keyword: "輝き・情熱",
    description:
      "太陽のように明るく周囲を照らす存在です。どこにいても場を温め、人を引き寄せるエネルギーと陽気さを持っています。全力で燃えるぶん、燃え尽きやすさもテーマになる星。自分の楽しさを大切にしながら、休むタイミングを決めておくと長く輝き続けられます。",
  },
  丁: {
    reading: "ひのと",
    element: "火",
    keyword: "繊細・洞察",
    description:
      "灯火のように細くも深い光を持つ人です。感受性が豊かで、人の心や物事の本質を静かに照らし出す力があります。派手さはなくても、近くにいる人にとっては大きな安心や救いとなる存在。自分のペースで穏やかに燃え続けられる環境づくりが大きなテーマです。",
  },
  戊: {
    reading: "つちのえ",
    element: "土",
    keyword: "安定・包容",
    description:
      "山のようにどっしりと構え、人の拠り所になれる存在です。多少のことでは動じず、周囲が揺れているときほど真価を発揮します。その一方で、自分の弱さや本音を見せるのが苦手な面も。「頼られること」と同じくらい「頼ること」を学ぶと、心がぐっと楽になります。",
  },
  己: {
    reading: "つちのと",
    element: "土",
    keyword: "育む・受容",
    description:
      "肥えた大地のように、受け入れ育む力が本質です。表に出るよりも、縁の下で支え、じっくり物事を熟成させることが得意なタイプ。人や仕事を時間をかけて育てていく役割を担いやすく、「急がば回れ」を体現するような歩み方をしやすい星です。",
  },
  庚: {
    reading: "かのえ",
    element: "金",
    keyword: "改革・突破",
    description:
      "鍛えられた鉄のように、鋭さと強さを兼ね備えます。古いものを断ち切り、新しい形を作り出す改革のエネルギーを持つ人です。妥協せず本質を求めるぶん、時に厳しく見られることもありますが、それは「良くしたい」という思いの裏返しでもあります。",
  },
  辛: {
    reading: "かのと",
    element: "金",
    keyword: "繊細・審美",
    description:
      "磨かれた宝石のように、細部への美意識と鋭い感性が光ります。人の何気ない言葉や空気の変化にも敏感で、繊細なバランスを感じ取ることができます。完璧を求めすぎて自分を責めがちな星でもあるので、「十分よくやっている自分」を認めることが大きなテーマです。",
  },
  壬: {
    reading: "みずのえ",
    element: "水",
    keyword: "広大・知性",
    description:
      "大海のような広さと深さを持ちます。知的好奇心が旺盛で、あらゆるものを吸収しながら、自由に広がっていく力があります。一つの場所にとどまるよりも、流れに乗りながら大きな視点で物事を見ることで、本来の可能性がどんどん開いていく星です。",
  },
  癸: {
    reading: "みずのと",
    element: "水",
    keyword: "浸透・感性",
    description:
      "雨のように静かに浸透し、命を育む力を持ちます。目立たなくとも、じわじわと周囲に影響を与える繊細な感性の持ち主です。感情を内側に溜め込みやすい星でもあるので、「感じたことを言葉にしてみること」が、自分を守りながら人とつながる大切な鍵になります。",
  },
};

function DayGanCard({
  dayGan,
  dayGanZhi,
}: {
  dayGan: string;
  dayGanZhi: string;
}) {
  const data = DAY_GAN_DATA[dayGan];
  if (!data) return null;

  return (
    <div className="bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6">
      <h2
        className="text-sm text-violet-700 mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        四柱推命 · 日干
      </h2>
      <div className="flex items-end gap-3 mb-3">
        <div
          className="text-6xl leading-none bg-gradient-to-br from-violet-400 to-pink-300 bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {dayGan}
        </div>
        <div className="pb-1">
          <p className="text-xs text-violet-400 leading-none mb-1">
            {data.reading}（{data.element}）
          </p>
          <p className="text-xs font-medium text-violet-700">{data.keyword}</p>
        </div>
        <div className="ml-auto pb-1 text-right">
          <p className="text-[10px] text-violet-400">日柱</p>
          <p className="text-sm text-violet-600">{dayGanZhi}</p>
        </div>
      </div>
      <p className="text-xs text-violet-600 leading-relaxed">{data.description}</p>
    </div>
  );
}

function getWuXingSummary(wuXing?: WuXing): string | null {
  if (!wuXing) return null;
  const entries = Object.entries(wuXing) as Array<[keyof WuXing, number]>;
  if (entries.length === 0) return null;

  const maxEntry = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const minEntry = entries.reduce((a, b) => (b[1] < a[1] ? b : a));

  if (maxEntry[1] === minEntry[1]) {
    return "五行の偏りが比較的少なく、さまざまな要素をバランスよく持っているタイプです。どれか一つを極端に伸ばすよりも、その時々で必要な性質を柔軟に使い分けることがテーマになりそうです。";
  }

  return `もっとも強いのは「${maxEntry[0]}」の性質で、弱くなりやすいのは「${minEntry[0]}」の部分です。得意な要素を活かしつつ、弱い要素を意識的にケアすることで、心身の安定と運の流れが整いやすくなっていきます。`;
}

const THEME_CARDS: Array<{
  key: string;
  title: string;
  question: string;
}> = [
  {
    key: "self",
    title: "自己の章",
    question: "自分の本質って、何だろう？",
  },
  {
    key: "society",
    title: "社会の章",
    question: "自分に向いている仕事、あるのかな？",
  },
  {
    key: "economy",
    title: "経済の章",
    question: "お金との付き合い方、どうすれば？",
  },
  {
    key: "relation",
    title: "関係の章",
    question: "なぜあの人とうまくいかないんだろう？",
  },
  {
    key: "body",
    title: "身体の章",
    question: "なんか最近、心も体も疲れてる",
  },
];

function LockedThemeCard(props: {
  title: string;
  question: string;
}) {
  const { title, question } = props;
  return (
    <div className="relative bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6 overflow-hidden">
      <div className="pointer-events-none select-none filter blur-sm text-xs text-violet-500 space-y-2">
        <p>{title}</p>
        <p>{question}</p>
        <p>
          この先には、あなたの物語をより細かく言葉にしていく深い鑑定のテキストが続きます。
        </p>
      </div>
      <div className="absolute inset-0 bg-white/75 backdrop-blur-sm rounded-[20px] flex flex-col justify-between p-6">
        <div>
          <p
            className="text-sm text-violet-800 mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </p>
          <p className="text-xs text-violet-500 mb-3">{question}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-violet-500">
            <Lock strokeWidth={1} size={20} />
            <span>有料コンテンツ</span>
          </div>
          <button
            type="button"
            className="bg-gradient-to-r from-violet-400 to-pink-300 text-white rounded-full px-4 py-2 text-xs font-medium shadow-md shadow-violet-200 hover:opacity-90 transition-all"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            もっと深く知る
          </button>
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="relative bg-white/65 backdrop-blur-md border border-violet-200/30 rounded-[20px] shadow-[0_4px_24px_rgba(167,139,250,0.1)] p-6 overflow-hidden">
      <div className="pointer-events-none select-none filter blur-sm text-xs text-violet-500 space-y-2">
        <p>西洋占星術の章</p>
        <p>惑星やハウスから見る、あなたの物語。</p>
        <p>リリース後、順次コンテンツを追加していきます。</p>
      </div>
      <div className="absolute inset-0 bg-white/75 backdrop-blur-sm rounded-[20px] flex flex-col justify-between p-6">
        <div>
          <p
            className="text-sm text-violet-800 mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            西洋占星術の章
          </p>
          <span className="inline-flex items-center border border-violet-200 text-violet-400 rounded-full px-3 py-1 text-xs">
            Coming Soon
          </span>
        </div>
        <p className="mt-4 text-xs text-violet-500">
          太陽星座の先にある、西洋占星術の世界は、少しずつ整えていきます。
          もう少しだけ、お待ちください。
        </p>
      </div>
    </div>
  );
}


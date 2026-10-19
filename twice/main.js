/* ============================================================
   TWICE — ONE IN A MILLION
   全部视觉由 canvas / CSS 生成，不依赖任何外部图片
   ============================================================ */
(function () {
  "use strict";

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ============================================================
     数据
     ============================================================ */
  var MUSES = [
    { n: "NAYEON", img: "muses/01.webp", fy: 0.533, rom: "I", role: "Lead Vocalist", c1: "#8FD0F5", c2: "#4E7FB8", c3: "#1B2740",
      meta: ["Solo · POP! (2022)", "Solo · ABCD (2024)"],
      note: "The first to step out alone — and the stage simply made room." },
    { n: "JEONGYEON", img: "muses/02.webp", fy: 0.546, rom: "II", role: "Lead Vocalist", c1: "#C6DE8E", c2: "#7E9B4E", c3: "#26301A",
      meta: ["Melody Project", "Unit · 3Mix"],
      note: "A voice like warm daylight; the calm at the centre of the storm." },
    { n: "MOMO", img: "muses/03.webp", fy: 0.673, rom: "III", role: "Main Dancer", c1: "#FF9EC0", c2: "#C25A84", c3: "#3A1A28",
      meta: ["Unit · MISAMO", "Do not touch (2023)"],
      note: "Every count she keeps is a sentence in a language only bodies speak." },
    { n: "SANA", img: "muses/04.webp", fy: 0.400, rom: "IV", role: "Sub Vocalist", c1: "#C4A8F0", c2: "#7E5CB8", c3: "#2A1F42",
      meta: ["Unit · MISAMO", "Do not touch (2023)"],
      note: "Effortless charm, engineered with terrifying precision." },
    { n: "JIHYO", img: "muses/05.webp", fy: 0.400, rom: "V", role: "Leader · Main Vocalist", c1: "#FF9A7A", c2: "#C2553C", c3: "#3C1C14",
      meta: ["Solo · Killin' Me Good (2023)", "Leader since 2015"],
      note: "Ten years of leading from the front, never once raising her voice." },
    { n: "MINA", img: "muses/06.webp", fy: 0.727, rom: "VI", role: "Main Dancer", c1: "#8FE8D0", c2: "#3F9E8A", c3: "#123029",
      meta: ["Unit · MISAMO", "Do not touch (2023)"],
      note: "Stillness, then a single line of movement that redraws the room." },
    { n: "DAHYUN", img: "muses/07.webp", fy: 0.400, rom: "VII", role: "Lead Rapper", c1: "#EDEDF2", c2: "#8E8EA0", c3: "#22222A",
      meta: ["Melody Project", "Unit · 3Mix"],
      note: "Brightness as strategy — the wit behind the smile." },
    { n: "CHAEYOUNG", img: "muses/08.webp", fy: 0.493, rom: "VIII", role: "Main Rapper", c1: "#F07A6A", c2: "#A83A2E", c3: "#33120E",
      meta: ["Melody Project", "Lyricist · in-house"],
      note: "Ink, rhythm, and a refusal to be anyone's draft." },
    { n: "TZUYU", img: "muses/09.webp", fy: 0.400, rom: "IX", role: "Lead Dancer · Visual", c1: "#7A9CFF", c2: "#3A55B8", c3: "#141C38",
      meta: ["Solo · Run Away (2024)", "Maknae"],
      note: "Poise so complete it looks like silence." }
  ];

  var ALBUMS = [
    { id: "oohahh", t: "Like OOH-AHH", al: "The Story Begins", y: 2015, c: "#F0A98C", root: 261.63 },
    { id: "cheerup", t: "CHEER UP", al: "Page Two", y: 2016, c: "#FF7BA9", root: 293.66 },
    { id: "tt", t: "TT", al: "Twicecoaster: LANE 1", y: 2016, c: "#8FB8F0", root: 329.63 },
    { id: "fancy", t: "FANCY", al: "FANCY YOU", y: 2019, c: "#FF5FA2", root: 349.23 },
    { id: "feelspecial", t: "Feel Special", al: "Feel Special", y: 2019, c: "#C9A7F5", root: 392.00 },
    { id: "cantstopme", t: "I CAN'T STOP ME", al: "Eyes wide open", y: 2020, c: "#5FD3C4", root: 440.00 },
    { id: "talkthattalk", t: "Talk that Talk", al: "BETWEEN 1&2", y: 2022, c: "#FCC89B", root: 466.16 },
    { id: "onespark", t: "ONE SPARK", al: "With YOU-th", y: 2024, c: "#FF9A5C", root: 523.25 },
    { id: "thisisfor", t: "THIS IS FOR", al: "THIS IS FOR", y: 2025, c: "#FF7AA2", root: 587.33 },
    { id: "meyou", t: "ME+YOU", al: "TEN: The Story Goes On", y: 2025, c: "#B9A0FF", root: 659.25 },
    { id: "byebye", t: "Bye Bye Inhibitions", al: "Alok × NAYEON", y: 2026, c: "#7FE0B0", root: 698.46 }
  ];

  /* 经纬度 —— THIS IS FOR 世巡全程：2025 年段 26 场 / 14 城 + 2026 年段 55 场 / 31 城 = 81 场 45 城，按时间先后 */
  var CITIES = [
    { n: "Incheon", v: "INSPIRE Arena", lat: 37.45, lon: 126.45, k: "arena", d: "Two nights opened the tour, July 2025." },
    { n: "Osaka", v: "Kyocera Dome", lat: 34.67, lon: 135.48, k: "stadium", d: "Two nights at Kyocera Dome." },
    { n: "Nagoya", v: "Vantelin Dome", lat: 35.19, lon: 136.95, k: "stadium", d: "Two nights in Aichi." },
    { n: "Fukuoka", v: "Mizuho PayPay Dome", lat: 33.60, lon: 130.36, k: "stadium", d: "Two nights in Fukuoka." },
    { n: "Tokyo", v: "Tokyo Dome", lat: 35.71, lon: 139.75, k: "stadium", d: "Two nights at Tokyo Dome." },
    { n: "Macao", v: "The Venetian Arena", lat: 22.15, lon: 113.56, k: "arena", d: "Two nights in Macao." },
    { n: "Bulacan", v: "Philippine Arena", lat: 14.79, lon: 120.95, k: "arena", d: "One night at Asia's largest indoor arena." },
    { n: "Singapore", v: "Singapore Indoor Stadium", lat: 1.30, lon: 103.87, k: "arena", d: "Two nights in the Lion City." },
    { n: "Kuala Lumpur", v: "National Hockey Stadium", lat: 3.06, lon: 101.69, k: "arena", d: "One night in Kuala Lumpur — the only Malaysian stop." },
    { n: "Sydney", v: "Qudos Bank Arena", lat: -33.85, lon: 151.06, k: "arena", d: "Two nights — the southern hemisphere debut." },
    { n: "Melbourne", v: "Rod Laver Arena", lat: -37.82, lon: 144.98, k: "arena", d: "Two nights at Rod Laver." },
    { n: "Kaohsiung", v: "Kaohsiung National Stadium", lat: 22.70, lon: 120.29, k: "stadium", d: "Two nights in Kaohsiung — TWICE's first ever show in Taiwan." },
    { n: "Hong Kong", v: "Kai Tak Stadium", lat: 22.30, lon: 114.21, k: "stadium", d: "Two nights at Kai Tak." },
    { n: "Bangkok", v: "Impact Arena", lat: 13.91, lon: 100.55, k: "arena", d: "Two nights closed 2025." },
    { n: "Vancouver", v: "Rogers Arena", lat: 49.28, lon: -123.11, k: "arena", d: "Two nights opened the year — Rogers Arena, January." },
    { n: "Seattle", v: "Climate Pledge Arena", lat: 47.62, lon: -122.35, k: "arena", d: "Two nights at Climate Pledge, the first US stop." },
    { n: "Oakland", v: "Oakland Arena", lat: 37.75, lon: -122.20, k: "arena", d: "Two nights across the bay." },
    { n: "Los Angeles", v: "Kia Forum", lat: 33.96, lon: -118.34, k: "arena", d: "Four nights at the Forum — the longest stand of the tour." },
    { n: "Phoenix", v: "Mortgage Matchup Center", lat: 33.45, lon: -112.07, k: "arena", d: "One night in the desert." },
    { n: "Dallas", v: "American Airlines Center", lat: 32.79, lon: -96.81, k: "arena", d: "Two nights in Texas, the 360° stage in the round." },
    { n: "Washington", v: "Capital One Arena", lat: 38.90, lon: -77.02, k: "arena", d: "Two nights in the capital." },
    { n: "New York", v: "UBS Arena", lat: 40.71, lon: -73.72, k: "arena", d: "Three nights on Long Island." },
    { n: "Philadelphia", v: "Xfinity Mobile Arena", lat: 39.90, lon: -75.17, k: "arena", d: "One night in Philadelphia." },
    { n: "Atlanta", v: "State Farm Arena", lat: 33.76, lon: -84.40, k: "arena", d: "One night in Georgia." },
    { n: "Montreal", v: "Bell Centre", lat: 45.50, lon: -73.57, k: "arena", d: "One night, en français." },
    { n: "Hamilton", v: "TD Coliseum", lat: 43.26, lon: -79.83, k: "arena", d: "Two nights in Ontario." },
    { n: "Taipei", v: "Taipei Dome", lat: 25.04, lon: 121.56, k: "stadium", d: "Three nights under the Taipei Dome." },
    { n: "Orlando", v: "Kia Center", lat: 28.54, lon: -81.38, k: "arena", d: "Two nights in Florida." },
    { n: "Charlotte", v: "Spectrum Center", lat: 35.23, lon: -80.84, k: "arena", d: "One night in North Carolina." },
    { n: "Boston", v: "TD Garden", lat: 42.37, lon: -71.06, k: "arena", d: "Two nights at TD Garden." },
    { n: "Chicago", v: "United Center", lat: 41.88, lon: -87.67, k: "arena", d: "Two nights in the Midwest." },
    { n: "Detroit", v: "Little Caesars Arena", lat: 42.34, lon: -83.06, k: "arena", d: "One night in Detroit." },
    { n: "Saint Paul", v: "Grand Casino Arena", lat: 44.94, lon: -93.10, k: "arena", d: "One night in Minnesota." },
    { n: "Denver", v: "Ball Arena", lat: 39.75, lon: -105.01, k: "arena", d: "One night a mile high." },
    { n: "Austin", v: "Moody Center", lat: 30.28, lon: -97.73, k: "arena", d: "Two nights in Texas's other city." },
    { n: "Tokyo", v: "Japan National Stadium", lat: 35.68, lon: 139.71, k: "stadium", d: "Three nights, 240,000 — the first foreign act to headline National Stadium." },
    { n: "Lisbon", v: "MEO Arena", lat: 38.77, lon: -9.09, k: "arena", d: "The European leg opened here." },
    { n: "Barcelona", v: "Palau Sant Jordi", lat: 41.36, lon: 2.15, k: "arena", d: "One night at Palau Sant Jordi." },
    { n: "Paris", v: "Accor Arena", lat: 48.84, lon: 2.38, k: "arena", d: "Two nights at Accor Arena." },
    { n: "Turin", v: "Inalpi Arena", lat: 45.04, lon: 7.65, k: "arena", d: "One night in Turin." },
    { n: "Berlin", v: "Uber Arena", lat: 52.51, lon: 13.44, k: "arena", d: "One night at Uber Arena." },
    { n: "Cologne", v: "LANXESS arena", lat: 50.94, lon: 6.98, k: "arena", d: "One night on the Rhine." },
    { n: "Amsterdam", v: "Ziggo Dome", lat: 52.31, lon: 4.94, k: "arena", d: "Two nights at Ziggo Dome." },
    { n: "London", v: "The O2", lat: 51.50, lon: 0.00, k: "arena", d: "Two nights closed Europe at The O2." },
    { n: "Seoul", v: "KSPO Dome", lat: 37.52, lon: 127.07, k: "arena", d: "Three nights at KSPO Dome — the 81st show, and the last." }
  ];

  /* ============================================================
     多语言
     ============================================================ */
  var I18N = {
    "nav.nine":   { en: "The Nine", cn: "九人九色", kr: "나인", jp: "ナイン" },
    "nav.disco":  { en: "Discography", cn: "音乐编年", kr: "디스코그래피", jp: "ディスコグラフィ" },
    "nav.world":  { en: "World", cn: "全球足迹", kr: "월드", jp: "ワールド" },
    "hero.kicker":{ en: "Seoul · Since 2015", cn: "首尔 · 始于 2015", kr: "서울 · 2015년부터", jp: "ソウル · 2015年から" },
    "hero.sound": { en: "Ambience", cn: "环境音", kr: "앰비언스", jp: "アンビエンス" },
    "hero.scroll":{ en: "Scroll", cn: "向下滚动", kr: "스크롤", jp: "スクロール" },
    "muses.kicker":{ en: "Chapter One", cn: "第一章", kr: "챕터 원", jp: "第一章" },
    "muses.title":{ en: "The Nine Muses", cn: "九人九色", kr: "아홉 뮤즈", jp: "ナイン・ミューズ" },
    "muses.lead": { en: "Nine silhouettes in the dark. Move across them and the room changes colour.",
                    cn: "暗处的九个剪影。鼠标划过，整个房间随之换色。",
                    kr: "어둠 속의 아홉 실루엣. 마우스를 옮기면 방의 색이 바뀝니다.",
                    jp: "暗がりに浮かぶ九つのシルエット。なぞるたび、部屋の色が変わります。" },
    "ody.kicker": { en: "Chapter Two", cn: "第二章", kr: "챕터 투", jp: "第二章" },
    "ody.title":  { en: "Sonic Odyssey", cn: "音乐编年史", kr: "소닉 오디세이", jp: "ソニック・オデッセイ" },
    "ody.lead":   { en: "Eleven records, eleven years. Pull a sleeve and let it spin.",
                    cn: "十一张唱片，十一年。抽出封套，让它转起来。",
                    kr: "열한 장의 레코드, 십일 년. 슬리브를 빼서 돌려 보세요.",
                    jp: "十一枚のレコード、十一年。スリーブを引き出して回してください。" },
    "ody.now":    { en: "scroll to travel", cn: "滚动以穿越", kr: "스크롤해서 이동", jp: "スクロールで移動" },
    "ody.play":   { en: "Preview", cn: "试听", kr: "미리듣기", jp: "試聴" },
    "fp.kicker":  { en: "Chapter Three", cn: "第三章", kr: "챕터 쓰리", jp: "第三章" },
    "fp.title":   { en: "Global Footprint", cn: "全球足迹", kr: "글로벌 풋프린트", jp: "グローバル・フットプリント" },
    "fp.lead":    { en: "Eighty-one shows, four continents — and a National Stadium first in Tokyo.",
                    cn: "八十一场，四大洲——以及在东京国立竞技场创下的第一次。",
                    kr: "81회 공연, 4개 대륙 — 그리고 도쿄 국립경기장에서의 첫 기록.",
                    jp: "81公演、4大陸——そして東京・国立競技場での史上初。" },
    "fp.s1":      { en: "Members", cn: "位成员", kr: "멤버", jp: "メンバー" },
    "fp.s2":      { en: "Shows on tour", cn: "场巡演", kr: "투어 공연", jp: "ツアー公演" },
    "fp.s3":      { en: "Cities on tour", cn: "座城市", kr: "도시", jp: "都市" },
    "fp.s4":      { en: "Continents", cn: "个大洲", kr: "대륙", jp: "大陸" },
    "fp.legend1": { en: "Stadium show", cn: "体育场演出", kr: "스타디움 공연", jp: "スタジアム公演" },
    "fp.legend2": { en: "Arena tour", cn: "体育馆巡演", kr: "아레나 투어", jp: "アリーナツアー" },
    "gc.stadium": { en: "Stadium", cn: "体育场", kr: "스타디움", jp: "スタジアム" },
    "gc.arena":   { en: "Arena", cn: "体育馆", kr: "아레나", jp: "アリーナ" },
    "foot.note":  { en: "A fan-made concept page. Not affiliated with JYP Entertainment. Tour and release data as of October 2026.",
                    cn: "粉丝自制概念页，与 JYP Entertainment 无关；巡演与发行数据截至 2026 年 10 月。",
                    kr: "팬메이드 콘셉트 페이지. JYP Entertainment와 무관하며 투어·발매 데이터는 2026년 10월 기준입니다.",
                    jp: "ファンメイドのコンセプトページ。JYP Entertainment とは無関係で、ツアー・リリース情報は2026年10月時点のものです。" }
  };

  var ROLES = {
    "Lead Vocalist":      { cn: "领唱", kr: "리드보컬", jp: "リードボーカル" },
    "Main Dancer":        { cn: "主舞", kr: "메인댄서", jp: "メインダンサー" },
    "Sub Vocalist":       { cn: "副唱", kr: "서브보컬", jp: "サブボーカル" },
    "Leader · Main Vocalist": { cn: "队长 · 主唱", kr: "리더 · 메인보컬", jp: "リーダー · メインボーカル" },
    "Lead Rapper":        { cn: "领说唱", kr: "리드래퍼", jp: "リードラッパー" },
    "Main Rapper":        { cn: "主说唱", kr: "메인래퍼", jp: "メインラッパー" },
    "Lead Dancer · Visual": { cn: "领舞 · 门面", kr: "리드댄서 · 비주얼", jp: "リードダンサー · ビジュアル" }
  };

  /* 成员小传：与 MUSES 顺序一一对应 */
  var NOTES = {
    cn: [
      "第一个独自走出来的人——舞台自己就让出了位置。",
      "像日光一样温热的嗓音，是风暴中心的那点安静。",
      "她数过的每一拍，都是身体才懂的语言里的一句话。",
      "毫不费力的可爱，是用可怕的精确度做出来的。",
      "十年站在最前面带队，从没提高过一次嗓门。",
      "先是静止，然后一条线把整个房间重画了一遍。",
      "明亮是一种策略——笑容背后那点机灵。",
      "墨水、节奏，以及拒绝成为任何人的草稿。",
      "从容得完整无缺，看上去像一段沉默。"
    ],
    kr: [
      "가장 먼저 홀로 무대에 선 사람. 무대가 스스로 자리를 비켜줬다.",
      "따뜻한 햇빛 같은 목소리. 폭풍 한가운데의 고요.",
      "그녀가 세는 모든 박자는 몸만이 말하는 언어의 한 문장.",
      "힘 들이지 않은 매력, 소름 돋게 정교하게 설계된.",
      "십 년 동안 맨 앞에서 이끌었고, 한 번도 목소리를 높이지 않았다.",
      "정지, 그리고 방을 다시 그리는 하나의 선.",
      "밝음은 전략이다. 미소 뒤에 있는 재치.",
      "잉크와 리듬, 그리고 누군가의 초안이 되기를 거부하는 마음.",
      "완벽할 만큼의 여유, 그래서 침묵처럼 보인다."
    ],
    jp: [
      "最初にひとりで舞台へ出た人。舞台のほうが場所を空けた。",
      "暖かな日差しのような声。嵐の中心にある静けさ。",
      "彼女が刻む一拍一拍は、身体だけが話す言語の一文。",
      "力を抜いた愛らしさは、恐ろしいほどの精度で設計されている。",
      "十年間、先頭で率いて、一度も声を荒らげなかった。",
      "静止、そして部屋を描き直す一本の線。",
      "明るさは戦略。笑顔の裏にある機知。",
      "インクとリズム、そして誰かの下書きになることの拒否。",
      "完璧すぎる落ち着きは、沈黙に見える。"
    ]
  };

  /* 巡演城市注解：与 CITIES 顺序一一对应（45 城） */
  var CITY_D = {
    cn: [
      "2025 年 7 月，两晚开场。", "京瓷巨蛋两晚。", "爱知两晚。",
      "福冈两晚。", "东京巨蛋两晚。", "澳门两晚。",
      "亚洲最大室内场馆的一晚。", "狮城两晚。", "吉隆坡一晚——全程唯一一场马来西亚。",
      "南半球首站，两晚。", "罗德·拉沃尔两晚。", "高雄两晚——TWICE 在台湾的第一次开唱。", "启德两晚。",
      "两晚收官 2025。",
      "两晚开场，一月的罗杰斯体育馆。", "气候宣言球馆两晚，美国段的第一站。", "海湾对岸的两晚。",
      "论坛球馆四晚，全程最长的一次驻场。", "沙漠里的一晚。", "得州两晚，360 度环台舞台。",
      "首都两晚。", "长岛三晚。", "费城一晚。",
      "佐治亚一晚。", "蒙特利尔一晚，全程法语。", "安大略两晚。",
      "台北大巨蛋三晚。", "佛州两晚。", "北卡一晚。",
      "TD 花园两晚。", "中西部两晚。", "底特律一晚。",
      "明尼苏达一晚。", "一英里高城的一晚。", "得州另一座城的两晚。",
      "三晚二十四万人——首个在国立竞技场开唱的海外艺人。", "欧洲段从这里开始。", "圣乔治宫一晚。",
      "雅高体育馆两晚。", "都灵一晚。", "优步球馆一晚。",
      "莱茵河畔一晚。", "齐戈穹顶两晚。", "O2 两晚，欧洲段收官。",
      "KSPO 穹顶三晚——第 81 场，也是最后一场。"
    ],
    kr: [
      "2025년 7월, 두 번의 밤으로 투어가 시작됐다.", "교세라 돔에서 두 번의 밤.", "아이치에서 두 번의 밤.",
      "후쿠오카에서 두 번의 밤.", "도쿄 돔에서 두 번의 밤.", "마카오에서 두 번의 밤.",
      "아시아 최대 실내 공연장에서의 하룻밤.", "싱가포르에서 두 번의 밤.", "쿠알라룸푸르에서 하룻밤 — 말레이시아 유일의 공연.",
      "남반구 첫 무대, 두 번의 밤.", "로드 레이버 아레나에서 두 번의 밤.", "가오슝에서 두 번 — 대만에서의 첫 공연.", "카이탁에서 두 번의 밤.",
      "2025년을 두 번의 밤으로 마무리.",
      "두 번의 밤으로 한 해를 열었다. 1월의 로저스 아레나.", "클라이밋 플레지 아레나에서 두 번, 미국 첫 무대.", "베이 건너편에서 두 번의 밤.",
      "포럼에서 네 번, 투어 중 가장 긴 연속 공연.", "사막에서의 하룻밤.", "텍사스에서 두 번, 360도 원형 무대.",
      "수도에서 두 번의 밤.", "롱아일랜드에서 세 번의 밤.", "필라델피아에서 하룻밤.",
      "조지아에서 하룻밤.", "몬트리올에서 하룻밤, 프랑스어로.", "온타리오에서 두 번의 밤.",
      "타이베이 돔에서 세 번의 밤.", "플로리다에서 두 번의 밤.", "노스캐롤라이나에서 하룻밤.",
      "TD 가든에서 두 번의 밤.", "중서부에서 두 번의 밤.", "디트로이트에서 하룻밤.",
      "미네소타에서 하룻밤.", "1마일 높은 도시에서의 하룻밤.", "텍사스의 또 다른 도시에서 두 번의 밤.",
      "세 번의 밤, 24만 명 — 국립경기장 헤드라이너에 오른 첫 해외 아티스트.", "유럽 레그가 여기서 시작됐다.", "팔라우 산 조르디에서 하룻밤.",
      "아코르 아레나에서 두 번의 밤.", "토리노에서 하룻밤.", "우버 아레나에서 하룻밤.",
      "라인강변에서 하룻밤.", "지고 돔에서 두 번의 밤.", "O2에서 두 번, 유럽 레그 마무리.",
      "KSPO 돔에서 세 번 — 81번째 공연이자 마지막."
    ],
    jp: [
      "2025年7月、二夜でツアーが始まった。", "京セラドームで二夜。", "愛知で二夜。",
      "福岡で二夜。", "東京ドームで二夜。", "マカオで二夜。",
      "アジア最大の屋内会場で一夜。", "シンガポールで二夜。", "クアラルンプールで一夜——マレーシア唯一の公演。",
      "南半球の初舞台、二夜。", "ロッド・レーバー・アリーナで二夜。", "高雄で二夜——台湾での初公演。", "啓徳で二夜。",
      "二夜で2025年を締めくくった。",
      "二夜で一年が始まった。一月のロジャーズ・アリーナ。", "クライメット・プレッジ・アリーナで二夜、アメリカ最初の地。", "ベイの向こう側で二夜。",
      "フォーラムで四夜、ツアー最長の連続公演。", "砂漠での一夜。", "テキサスで二夜、360度の円形ステージ。",
      "首都で二夜。", "ロングアイランドで三夜。", "フィラデルフィアで一夜。",
      "ジョージアで一夜。", "モントリオールで一夜、フランス語で。", "オンタリオで二夜。",
      "台北ドームで三夜。", "フロリダで二夜。", "ノースカロライナで一夜。",
      "TDガーデンで二夜。", "中西部で二夜。", "デトロイトで一夜。",
      "ミネソタで一夜。", "1マイル高地の街で一夜。", "テキサスのもう一つの街で二夜。",
      "三夜で24万人——国立競技場のヘッドライナーに立った初の海外アーティスト。", "ヨーロッパ公演はここから始まった。", "パラウ・サン・ジョルディで一夜。",
      "アコー・アレナで二夜。", "トリノで一夜。", "ウーバー・アレナで一夜。",
      "ライン川沿いで一夜。", "ジッゴ・ドームで二夜。", "O2で二夜、ヨーロッパ公演の締めくくり。",
      "KSPOドームで三夜——81公演目、そして最後の夜。"
    ]
  };

  var lang = "en";
  var refreshCard = null;   // 由足迹模块注入：语言切换时重绘城市卡片
  function applyLang(next) {
    lang = next;
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.setAttribute("lang", next === "cn" ? "zh-CN" : next === "kr" ? "ko" : next === "jp" ? "ja" : "en");
    $$("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = I18N[k] && I18N[k][next];
      if (v) el.textContent = v;
    });
    $$("[data-role-key]").forEach(function (el) {
      var k = el.getAttribute("data-role-key");
      var v = next === "en" ? k : (ROLES[k] && ROLES[k][next]);
      if (v) el.textContent = v;
    });
    $$("[data-muse-i]").forEach(function (el) {
      var i = +el.getAttribute("data-muse-i");
      var v = next === "en" ? null : (NOTES[next] && NOTES[next][i]);
      el.textContent = v || MUSES[i].note;
    });
    $$("[data-lang-btn]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang-btn") === next);
    });
    // 地球卡片若正开着，跟着换语言（否则会停在旧语种）
    if (refreshCard) refreshCard();
  }
  $$("[data-lang-btn]").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
  });

  /* ============================================================
     载入
     ============================================================ */
  var loader = $("#loader"), loaderBar = $("#loaderBar"), loaderNum = $("#loaderNum");
  var pct = 0;
  var tick = setInterval(function () {
    pct = Math.min(100, pct + Math.random() * 13 + 4);
    loaderBar.style.width = pct + "%";
    loaderNum.textContent = String(Math.round(pct)).padStart(2, "0");
    if (pct >= 100) {
      clearInterval(tick);
      setTimeout(function () {
        loader.classList.add("is-done");
        document.body.classList.remove("is-loading");
        setTimeout(function () { loader.remove(); }, 1000);
      }, 320);
    }
  }, reduce ? 40 : 130);

  /* ============================================================
     导航 + 视差
     ============================================================ */
  var nav = $("#nav"), heroInner = $("#heroInner");
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 40);
    if (heroInner && y < window.innerHeight * 1.2) {
      var p = clamp(y / (window.innerHeight * 0.9), 0, 1);
      heroInner.style.transform = "scale(" + (1 + p * 0.28) + ") translateY(" + (p * -40) + "px)";
      heroInner.style.opacity = String(1 - p * 1.15);
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     Candybong 光标
     ============================================================ */
  (function cursor() {
    var dot = $("#cursorDot"), cv = $("#cursorTrail");
    if (!dot || !cv || matchMedia("(hover:none)").matches) return;
    var ctx = cv.getContext("2d");
    var W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    function size() {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size(); addEventListener("resize", size);

    var mx = -100, my = -100, dx = -100, dy = -100, last = null;
    addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; });
    addEventListener("pointerdown", function () { dot.classList.add("is-down"); });
    addEventListener("pointerup", function () { dot.classList.remove("is-down"); });

    function frame() {
      dx = lerp(dx, mx, 0.22); dy = lerp(dy, my, 0.22);
      dot.style.transform = "translate(" + dx + "px," + dy + "px) translate(-50%,-50%)";
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.16)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      if (last) {
        var dist = Math.hypot(mx - last.x, my - last.y);
        if (dist > 1) {
          var g = ctx.createRadialGradient(mx, my, 0, mx, my, 22);
          g.addColorStop(0, "rgba(252,200,155,.55)");
          g.addColorStop(.45, "rgba(255,95,162,.22)");
          g.addColorStop(1, "rgba(255,95,162,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(mx, my, 22, 0, 6.2832); ctx.fill();
        }
      }
      last = { x: mx, y: my };
      requestAnimationFrame(frame);
    }
    if (!reduce) requestAnimationFrame(frame);
  })();

  /* ============================================================
     首屏：极光画布
     ============================================================ */
  (function aurora() {
    var cv = $("#heroCanvas"); if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = 460, H = 260;
    cv.width = W; cv.height = H;
    var blobs = [
      { x: .28, y: .30, r: .46, c: "252,200,155", sx: .11, sy: .07, ph: 0 },
      { x: .68, y: .62, r: .52, c: "255,95,162", sx: .09, sy: .11, ph: 2.1 },
      { x: .50, y: .20, r: .38, c: "150,190,255", sx: .07, sy: .13, ph: 4.2 },
      { x: .14, y: .78, r: .42, c: "255,150,120", sx: .13, sy: .06, ph: 1.1 },
      { x: .86, y: .24, r: .34, c: "200,170,255", sx: .06, sy: .09, ph: 3.4 }
    ];
    function draw(t) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#0B0B0E"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var x = (b.x + Math.sin(t * b.sx + b.ph) * 0.20) * W;
        var y = (b.y + Math.cos(t * b.sy + b.ph) * 0.16) * H;
        var r = b.r * W * (1 + Math.sin(t * 0.27 + b.ph) * 0.14);
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(" + b.c + ",.30)");
        g.addColorStop(0.45, "rgba(" + b.c + ",.09)");
        g.addColorStop(1, "rgba(" + b.c + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      }
    }
    if (reduce) { draw(0); return; }
    var t0 = performance.now();
    (function loop() {
      draw((performance.now() - t0) / 1000);
      requestAnimationFrame(loop);
    })();
  })();

  /* ============================================================
     九人九色
     ============================================================ */
  (function muses() {
    var track = $("#musesTrack"); if (!track) return;
    MUSES.forEach(function (m, i) {
      var el = document.createElement("article");
      el.className = "muse";
      el.tabIndex = 0;
      el.style.setProperty("--c1", m.c1);
      el.style.setProperty("--c2", m.c2);
      el.style.setProperty("--c3", m.c3);
      // 照片已统一裁成"脸在中部"的 3:4，这里只把脸换算成取景窗口的百分比
      var pct = function (win, f) {
        return Math.round(Math.max(0, Math.min(1, (m.fy - f * win) / (1 - win))) * 100) + "%";
      };
      el.style.setProperty("--pos", pct(0.642, 0.42));   // 桌面展开：可见 64.2% 高
      el.style.setProperty("--posM", pct(0.288, 0.50));  // 手机收起：可见 28.8% 高
      el.setAttribute("aria-label", m.n + " — " + m.role);
      el.dataset.initial = m.n.charAt(0);
      el.innerHTML =
        '<div class="muse-art">' +
          '<img src="' + m.img + '" alt="' + m.n + '" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="muse-index">' + m.rom + '</div>' +
        '<div class="muse-name">' + m.n + '</div>' +
        '<div class="muse-info">' +
          '<p class="role" data-role-key="' + m.role + '">' + m.role + '</p>' +
          '<h3>' + m.n + '</h3>' +
          '<p class="note" data-muse-i="' + i + '">' + m.note + '</p>' +
          '<div class="meta">' + m.meta.map(function (x) { return "<span><b>" + x + "</b></span>"; }).join("") + '</div>' +
        '</div>';
      track.appendChild(el);

      function glow(on) {
        var root = document.documentElement.style;
        if (on) {
          root.setProperty("--glow-a", m.c1);
          root.setProperty("--glow-b", m.c2);
          document.body.style.setProperty("--glow-a", m.c1);
        } else {
          root.setProperty("--glow-a", "#FCC89B");
          root.setProperty("--glow-b", "#FF5FA2");
        }
      }
      el.addEventListener("pointerenter", function () { glow(true); });
      el.addEventListener("pointerleave", function () { glow(false); });
      el.addEventListener("focus", function () { glow(true); });
      el.addEventListener("blur", function () { glow(false); });
      /* 触屏：点一下展开 */
      el.addEventListener("click", function () {
        if (matchMedia("(hover:none),(pointer:coarse)").matches) el.classList.toggle("is-open");
      });
    });
    applyLang(lang);
  })();

  /* ============================================================
     音乐编年史
     ============================================================ */
  (function odyssey() {
    var sec = $("#odyssey"), track = $("#odyTrack"), bar = $("#odyBar"), now = $("#odyNow");
    if (!sec || !track) return;

    ALBUMS.forEach(function (a, i) {
      var el = document.createElement("article");
      el.className = "album";
      el.tabIndex = 0;
      el.style.setProperty("--c", a.c);
      el.dataset.id = a.id;
      el.innerHTML =
        '<div class="sleeve">' +
          '<div class="vinyl"></div>' +
          '<div class="cover">' +
            '<span class="cn">' + String(i + 1).padStart(2, "0") + " / " + String(ALBUMS.length).padStart(2, "0") + '</span>' +
            '<span class="ct">' + a.t + '</span>' +
            '<span class="cy">' + a.y + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="album-meta">' +
          '<span class="yr">' + a.y + '</span>' +
          '<h3>' + a.al + '</h3>' +
          '<p class="pl"><i></i><span data-i18n="ody.play">Preview</span></p>' +
        '</div>';
      track.appendChild(el);

      function toggle() {
        var playing = el.classList.contains("is-playing");
        $$(".album.is-playing", track).forEach(function (x) { x.classList.remove("is-playing"); });
        if (!playing) {
          el.classList.add("is-playing");
          AUDIO.play(a);
        } else {
          AUDIO.stop();
        }
      }
      el.addEventListener("click", toggle);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });

    var lastIdx = -1;
    function update() {
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      var p = clamp(-r.top / total, 0, 1);
      var dist = track.scrollWidth - window.innerWidth;
      track.style.transform = "translate3d(" + (-p * dist) + "px,0,0)";
      if (bar) bar.style.width = (p * 100) + "%";
      var idx = Math.round(p * (ALBUMS.length - 1));
      if (idx !== lastIdx && now) { lastIdx = idx; now.textContent = ALBUMS[idx].y; }
    }
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  })();

  /* ============================================================
     声音：环境音 + 唱片试听
     ============================================================ */
  var AUDIO = (function () {
    var ctx = null, ambientGain = null, ambientOn = false, track = null, motifTimer = null;

    function ac() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }

    /* 环境垫音：四个三角波 + 缓慢扫频 */
    function startAmbient() {
      var c = ac(); if (!c) return;
      if (!ambientGain) {
        ambientGain = c.createGain();
        ambientGain.gain.value = 0;
        var filt = c.createBiquadFilter();
        filt.type = "lowpass"; filt.frequency.value = 760; filt.Q.value = .7;
        filt.connect(ambientGain);
        ambientGain.connect(c.destination);
        [196.00, 261.63, 329.63, 392.00].forEach(function (f, i) {
          var o = c.createOscillator(); o.type = "triangle"; o.frequency.value = f;
          var g = c.createGain(); g.gain.value = 0.055 - i * 0.008;
          o.connect(g); g.connect(filt); o.start();
        });
        var lfo = c.createOscillator(); lfo.frequency.value = 0.06;
        var lg = c.createGain(); lg.gain.value = 320;
        lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
      }
      ambientGain.gain.cancelScheduledValues(c.currentTime);
      ambientGain.gain.setTargetAtTime(0.11, c.currentTime, 1.2);
      ambientOn = true;
    }
    function stopAmbient() {
      var c = ac(); if (!c || !ambientGain) return;
      ambientGain.gain.cancelScheduledValues(c.currentTime);
      ambientGain.gain.setTargetAtTime(0, c.currentTime, 0.6);
      ambientOn = false;
    }

    /* 试听：优先播放 audio/<id>.mp3，没有就合成一段和弦琶音 */
    var MISSING = {};
    function play(a) {
      stop();
      var c = ac(); if (!c) return;
      if (MISSING[a.id]) { motif(a); return; }
      var el = new Audio("audio/" + a.id + ".mp3");
      el.volume = 0.5;
      var settled = false;
      var fallback = function () {
        if (settled) return;
        settled = true;
        MISSING[a.id] = true;   /* 记下来，下次直接合成，不再发一次 404 */
        motif(a);
      };
      el.addEventListener("error", fallback, { once: true });
      var pr = el.play();
      if (pr && pr.then) pr.then(function () { settled = true; track = el; }).catch(fallback);
      setTimeout(fallback, 420);
    }
    function motif(a) {
      var c = ac(); if (!c) return;
      var base = a.root;
      var steps = [0, 4, 7, 11, 7, 4];
      var out = c.createGain(); out.gain.value = 0.0; out.connect(c.destination);
      var filt = c.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 2600;
      filt.connect(out);
      steps.forEach(function (s, i) {
        var t = c.currentTime + i * 0.26;
        var o = c.createOscillator(); o.type = "triangle";
        o.frequency.value = base * Math.pow(2, s / 12);
        var g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        o.connect(g); g.connect(filt);
        o.start(t); o.stop(t + 1);
      });
      out.gain.setValueAtTime(0, c.currentTime);
      out.gain.linearRampToValueAtTime(0.9, c.currentTime + 0.08);
      out.gain.setTargetAtTime(0, c.currentTime + steps.length * 0.26, 0.5);
      motifTimer = setTimeout(function () { try { out.disconnect(); } catch (e) {} }, 4200);
    }
    function stop() {
      if (track) { try { track.pause(); } catch (e) {} track = null; }
      if (motifTimer) { clearTimeout(motifTimer); motifTimer = null; }
    }

    return {
      play: play, stop: stop,
      toggleAmbient: function () { ambientOn ? stopAmbient() : startAmbient(); return ambientOn; }
    };
  })();

  (function soundBtn() {
    var b = $("#soundBtn"); if (!b) return;
    b.addEventListener("click", function () {
      var on = AUDIO.toggleAmbient();
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  })();

  /* ============================================================
     数字滚动
     ============================================================ */
  (function counters() {
    var nodes = $$("[data-count]");
    if (!nodes.length) return;
    var done = false;
    function run() {
      if (done) return; done = true;
      nodes.forEach(function (el) {
        var to = parseFloat(el.dataset.count), suf = el.dataset.suffix || "";
        var t0 = performance.now(), dur = 1500;
        (function step(now) {
          var p = clamp((now - t0) / dur, 0, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * e) + (p >= 1 ? suf : "");
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) run(); });
    }, { threshold: 0.4 });
    io.observe($(".stats"));
  })();

  /* ============================================================
     3D 地球
     ============================================================ */
  (function globe() {
    var cv = $("#globe"), card = $("#globeCard");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(devicePixelRatio || 1, 2);
    var S = 0, R = 0, cx = 0, cy = 0;
    /* rotX 是绕 X 轴的倾角：城市的纬度大多在 20°–55°N，
       把倾角设成 +0.52rad（约 30°）才能让这一带落在球心；
       原来的负值会把北半球压到球缘，整颗球看起来是空的。 */
    var rotY = 0.6, rotX = 0.52, dragging = false, lastX = 0, lastY = 0, spin = 0.0016;
    var hits = [];

    function size() {
      S = cv.clientWidth || 520;
      cv.width = S * dpr; cv.height = S * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = S * 0.40; cx = S / 2; cy = S / 2;
    }
    size(); addEventListener("resize", size);

    function project(lat, lon) {
      var la = lat * Math.PI / 180, lo = (lon + rotY * 180 / Math.PI) * Math.PI / 180;
      var x = Math.cos(la) * Math.sin(lo);
      var y = Math.sin(la);
      var z = Math.cos(la) * Math.cos(lo);
      /* 绕 X 轴倾一点 */
      var y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
      var z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
      return { x: cx + x * R, y: cy - y2 * R, z: z2 };
    }

    function draw() {
      ctx.clearRect(0, 0, S, S);

      /* 球体：一层几乎看不见的暗面 + 边缘光，让"球"先成立 */
      var halo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.16);
      halo.addColorStop(0, "rgba(40,44,64,.30)");
      halo.addColorStop(1, "rgba(40,44,64,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.16, 0, 6.2832); ctx.fill();

      /* 球面本身（比背景略亮一点点，制造体积） */
      var disc = ctx.createRadialGradient(cx - R * .34, cy - R * .42, R * .1, cx, cy, R);
      disc.addColorStop(0, "rgba(44,48,66,.62)");
      disc.addColorStop(.62, "rgba(20,22,32,.72)");
      disc.addColorStop(1, "rgba(12,12,17,.86)");
      ctx.fillStyle = disc;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();

      /* 边缘光 */
      var rim = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rim.addColorStop(0, "rgba(252,200,155,.30)");
      rim.addColorStop(.5, "rgba(246,244,240,.10)");
      rim.addColorStop(1, "rgba(255,95,162,.26)");
      ctx.strokeStyle = rim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();

      /* 经纬点阵：越靠球心越亮，边缘自然收暗 */
      for (var lat = -82; lat <= 82; lat += 7) {
        for (var lon = 0; lon < 360; lon += 7) {
          var p = project(lat, lon);
          if (p.z < 0.05) continue;
          var a = Math.pow(p.z, 0.75);
          ctx.fillStyle = "rgba(228,230,242," + (a * 0.52).toFixed(3) + ")";
          var sz = 0.7 + a * 0.55;
          ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        }
      }

      /* 城市光点 */
      hits = [];
      CITIES.forEach(function (c) {
        var p = project(c.lat, c.lon);
        if (p.z < 0.02) return;
        var a = clamp((p.z - 0.02) / 0.6, 0, 1);
        var col = c.k === "stadium" ? "252,200,155" : "255,95,162";
        var rr = c.k === "stadium" ? 7 : 5;

        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 2.6);
        g.addColorStop(0, "rgba(" + col + "," + (0.9 * a) + ")");
        g.addColorStop(1, "rgba(" + col + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, rr * 2.6, 0, 6.2832); ctx.fill();

        ctx.fillStyle = "rgba(255,255,255," + a + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.2832); ctx.fill();

        hits.push({ x: p.x, y: p.y, city: c, a: a });
      });

      /* 悬停城市：细引线 + 名字，像图鉴上的标注 */
      if (hoverCity) {
        var hh = null;
        for (var i = 0; i < hits.length; i++) if (hits[i].city === hoverCity) { hh = hits[i]; break; }
        if (hh) {
          ctx.strokeStyle = "rgba(246,244,240,.30)"; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(hh.x + 4, hh.y - 4);
          ctx.lineTo(hh.x + 15, hh.y - 15);
          ctx.lineTo(hh.x + 15 + 58, hh.y - 15);
          ctx.stroke();
          ctx.font = '400 12px "Cormorant Garamond",Georgia,serif';
          ctx.fillStyle = "rgba(246,244,240,.92)";
          ctx.textBaseline = "bottom";
          /* 同一处压着几座城市时标出 "+N"，提示可以再点一次轮换 */
          var near = 0;
          for (var q = 0; q < hits.length; q++) {
            if (Math.hypot(hits[q].x - hh.x, hits[q].y - hh.y) < 11) near++;
          }
          var nm = hh.city.n.toUpperCase() + (near > 1 ? " +" + (near - 1) : "");
          ctx.fillText(nm, hh.x + 20, hh.y - 19);
          var nw = ctx.measureText(nm).width;
          ctx.font = '300 9.5px "Inter",system-ui,sans-serif';
          ctx.fillStyle = "rgba(246,244,240,.40)";
          ctx.fillText("· " + hh.city.v, hh.x + 26 + nw, hh.y - 19);
        }
      }

      /* 当前选中城市的脉冲环 */
      if (active) {
        var ap = project(active.lat, active.lon);
        if (ap.z > 0) {
          var t = (performance.now() % 1800) / 1800;
          ctx.strokeStyle = "rgba(252,200,155," + (0.7 * (1 - t)) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(ap.x, ap.y, 4 + t * 26, 0, 6.2832); ctx.stroke();
        }
      }
    }

    var active = null, hoverCity = null, lastPick = null;
    function loop() {
      if (!dragging) rotY += spin;
      draw();
      requestAnimationFrame(loop);
    }

    cv.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", function (e) {
      var r0 = cv.getBoundingClientRect();
      if (!dragging) {
        var mx0 = e.clientX - r0.left, my0 = e.clientY - r0.top;
        var best0 = null, bd0 = 20;
        hits.forEach(function (h) {
          var d = Math.hypot(h.x - mx0, h.y - my0);
          if (d < bd0) { bd0 = d; best0 = h; }
        });
        hoverCity = best0 ? best0.city : null;
        cv.style.cursor = best0 ? "pointer" : "";
        return;
      }
      rotY += (e.clientX - lastX) * 0.006;
      rotX = clamp(rotX + (e.clientY - lastY) * 0.004, -0.9, 0.9);
      lastX = e.clientX; lastY = e.clientY;
    });
    cv.addEventListener("pointerleave", function () { hoverCity = null; cv.style.cursor = ""; });
    addEventListener("pointerup", function () { dragging = false; });

    cv.addEventListener("click", function (e) {
      var r = cv.getBoundingClientRect();
      var mx = e.clientX - r.left, my = e.clientY - r.top;
      /* 先按宽容差抓住离光标最近的光点 */
      var best = null, bd = 20;
      hits.forEach(function (h) {
        var d = Math.hypot(h.x - mx, h.y - my);
        if (d < bd) { bd = d; best = h; }
      });
      if (!best) return;
      /* 球面上有压在一起的城市：仁川/首尔、东京巨蛋/国立竞技场、澳门/香港。
         以最近点为圆心聚成一簇，重复点击在同一簇里依次轮换，
         这样每座城市都点得到，又不用为了"看得见"去改真实坐标。 */
      var near = hits.filter(function (h) {
        return Math.hypot(h.x - best.x, h.y - best.y) < 11;
      });
      near.sort(function (a, b) {
        return Math.hypot(a.x - best.x, a.y - best.y) - Math.hypot(b.x - best.x, b.y - best.y);
      });
      var at = -1;
      for (var i = 0; i < near.length; i++) if (near[i].city === lastPick) { at = i; break; }
      var pick = near[at >= 0 ? (at + 1) % near.length : 0];
      lastPick = pick.city;
      active = pick.city;
      showCard(pick.city);
    });

    function showCard(c) {
      var ci = CITIES.indexOf(c);
      var kk = c.k === "stadium" ? "gc.stadium" : "gc.arena";
      $("#gcKicker").textContent = (I18N[kk] && I18N[kk][lang]) || (c.k === "stadium" ? "Stadium" : "Arena");
      $("#gcTitle").textContent = c.n + " — " + c.v;
      $("#gcDesc").textContent = (lang === "en" ? null : (CITY_D[lang] && CITY_D[lang][ci])) || c.d;
      card.classList.add("on");
      clearTimeout(showCard._t);
      showCard._t = setTimeout(function () { card.classList.remove("on"); active = null; }, 6000);
    }

    refreshCard = function () { if (active) showCard(active); };

    if (reduce) { draw(); return; }
    requestAnimationFrame(loop);
  })();

  /* 初始语言 */
  applyLang("en");
})();

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
    { id: "onespark", t: "ONE SPARK", al: "With YOU-th", y: 2024, c: "#FF9A5C", root: 523.25 }
  ];

  /* 经纬度 */
  var CITIES = [
    { n: "Seoul", v: "KSPO Dome · Olympic Park", lat: 37.52, lon: 126.98, k: "arena", d: "Where it began — six nights under one roof." },
    { n: "Tokyo", v: "Nissan Stadium", lat: 35.51, lon: 139.62, k: "stadium", d: "Two nights, 140,000 candy lights." },
    { n: "Osaka", v: "Kyocera Dome", lat: 34.67, lon: 135.50, k: "arena", d: "The dome that sold out in minutes." },
    { n: "Bangkok", v: "Impact Arena", lat: 13.76, lon: 100.50, k: "arena", d: "Four nights, one continuous roar." },
    { n: "Singapore", v: "National Stadium", lat: 1.30, lon: 103.87, k: "stadium", d: "A sea of apricot across the bay." },
    { n: "Manila", v: "Philippine Arena", lat: 14.79, lon: 120.95, k: "arena", d: "The loudest crowd on the tour." },
    { n: "Sydney", v: "Qudos Bank Arena", lat: -33.85, lon: 151.06, k: "arena", d: "Southern hemisphere, sold out twice." },
    { n: "Los Angeles", v: "SoFi Stadium", lat: 33.95, lon: -118.34, k: "stadium", d: "A stadium debut under California light." },
    { n: "New York", v: "MetLife Stadium", lat: 40.81, lon: -74.07, k: "stadium", d: "East coast, 80,000 strong." },
    { n: "Chicago", v: "United Center", lat: 41.88, lon: -87.67, k: "arena", d: "Midwest, midwinter, sold out." },
    { n: "Dallas", v: "Globe Life Field", lat: 32.75, lon: -97.08, k: "stadium", d: "Texas, at full volume." },
    { n: "Mexico City", v: "Foro Sol", lat: 19.40, lon: -99.09, k: "stadium", d: "Altitude, and a wall of sound." },
    { n: "Toronto", v: "Scotiabank Arena", lat: 43.64, lon: -79.38, k: "arena", d: "Two nights in the north." },
    { n: "London", v: "The O2", lat: 51.50, lon: 0.00, k: "arena", d: "The Thames, lit in magenta." },
    { n: "Paris", v: "Accor Arena", lat: 48.83, lon: 2.37, k: "arena", d: "A European first, long overdue." },
    { n: "Berlin", v: "Mercedes-Benz Arena", lat: 52.50, lon: 13.44, k: "arena", d: "Cold night, warm room." },
    { n: "Jakarta", v: "Gelora Bung Karno", lat: -6.21, lon: 106.80, k: "stadium", d: "70,000 in the rain, none of them left." }
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
    "ody.lead":   { en: "Eight records, one decade. Pull a sleeve and let it spin.",
                    cn: "八张唱片，一个十年。抽出封套，让它转起来。",
                    kr: "여덟 장의 레코드, 십 년. 슬리브를 빼서 돌려 보세요.",
                    jp: "八枚のレコード、ひとつの十年。スリーブを引き出して回してください。" },
    "ody.now":    { en: "scroll to travel", cn: "滚动以穿越", kr: "스크롤해서 이동", jp: "スクロールで移動" },
    "ody.play":   { en: "Preview", cn: "试听", kr: "미리듣기", jp: "試聴" },
    "fp.kicker":  { en: "Chapter Three", cn: "第三章", kr: "챕터 쓰리", jp: "第三章" },
    "fp.title":   { en: "Global Footprint", cn: "全球足迹", kr: "글로벌 풋프린트", jp: "グローバル・フットプリント" },
    "fp.lead":    { en: "From a Seoul showcase to the biggest stadiums on four continents.",
                    cn: "从首尔的一场 showcase，到四大洲最大的体育场。",
                    kr: "서울의 쇼케이스에서, 4개 대륙의 가장 큰 스타디움까지.",
                    jp: "ソウルのショーケースから、4大陸の最大級スタジアムへ。" },
    "fp.s1":      { en: "Members", cn: "位成员", kr: "멤버", jp: "メンバー" },
    "fp.s2":      { en: "Albums sold", cn: "专辑销量", kr: "앨범 판매량", jp: "アルバム売上" },
    "fp.s3":      { en: "Shows played", cn: "场演出", kr: "공연 횟수", jp: "公演数" },
    "fp.s4":      { en: "Continents", cn: "个大洲", kr: "대륙", jp: "大陸" },
    "fp.legend1": { en: "Stadium show", cn: "体育场演出", kr: "스타디움 공연", jp: "スタジアム公演" },
    "fp.legend2": { en: "Arena tour", cn: "体育馆巡演", kr: "아레나 투어", jp: "アリーナツアー" },
    "gc.stadium": { en: "Stadium", cn: "体育场", kr: "스타디움", jp: "スタジアム" },
    "gc.arena":   { en: "Arena", cn: "体育馆", kr: "아레나", jp: "アリーナ" },
    "foot.note":  { en: "A fan-made concept page. Not affiliated with JYP Entertainment. Figures are illustrative.",
                    cn: "粉丝自制概念页，与 JYP Entertainment 无关；数据仅作示意。",
                    kr: "팬메이드 콘셉트 페이지. JYP Entertainment와 무관하며 수치는 예시입니다.",
                    jp: "ファンメイドのコンセプトページ。JYP Entertainment とは無関係で、数値は例示です。" }
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

  /* 巡演城市注解：与 CITIES 顺序一一对应 */
  var CITY_D = {
    cn: [
      "一切开始的地方——同一个屋檐下六场。", "两晚，十四万盏糖果灯。", "几分钟就售罄的巨蛋。",
      "四晚，一片没有断过的欢呼。", "海湾对岸一片杏色的海。", "巡演中最吵的一群观众。",
      "南半球，两次售罄。", "在加州的光里完成体育场首秀。", "东海岸，八万人。",
      "中西部，隆冬，售罄。", "得州，音量拉满。", "高原，和一面声音的墙。",
      "北方的两晚。", "泰晤士河，被染成品红。", "欧洲的第一次，来得太迟。",
      "寒冷的夜，温暖的厅。", "雨中七万人，一个都没走。"
    ],
    kr: [
      "모든 것이 시작된 곳, 한 지붕 아래 여섯 번의 밤.", "두 번의 밤, 십사만 개의 캔디 라이트.", "몇 분 만에 매진된 돔.",
      "네 번의 밤, 끊이지 않은 함성.", "베이 건너편의 살구빛 물결.", "투어에서 가장 시끄러운 관객.",
      "남반구에서 두 번 매진.", "캘리포니아의 빛 아래에서 이룬 스타디움 데뷔.", "이스트코스트, 팔만 명.",
      "중서부, 한겨울, 매진.", "텍사스, 볼륨 최대.", "고도, 그리고 소리의 벽.",
      "북쪽에서의 두 밤.", "템스강, 마젠타로 물들다.", "유럽에서의 첫 공연, 너무 늦게 찾아온.",
      "추운 밤, 따뜻한 홀.", "비 속의 칠만 명, 아무도 떠나지 않았다."
    ],
    jp: [
      "すべてが始まった場所。ひとつの屋根の下で六夜。", "二夜、十四万のキャンディライト。", "数分で完売したドーム。",
      "四夜、途切れない歓声。", "ベイの向こうに広がるアプリコットの海。", "ツアーでいちばん騒がしい観客。",
      "南半球で二度の完売。", "カリフォルニアの光の下でのスタジアムデビュー。", "イーストコースト、八万人。",
      "中西部、真冬、完売。", "テキサス、音量は最大で。", "高度、そして音の壁。",
      "北の地での二夜。", "テムズ川がマゼンタに染まる。", "ヨーロッパで初めて、ずいぶん遅れて。",
      "寒い夜、暖かいホール。", "雨のなかの七万人、誰ひとり帰らなかった。"
    ]
  };

  var lang = "en";
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
    var rotY = 0.6, rotX = -0.22, dragging = false, lastX = 0, lastY = 0, spin = 0.0016;
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
          var nm = hh.city.n.toUpperCase();
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

    var active = null, hoverCity = null;
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
      var best = null, bd = 22;
      hits.forEach(function (h) {
        var d = Math.hypot(h.x - mx, h.y - my);
        if (d < bd) { bd = d; best = h; }
      });
      if (!best) return;
      active = best.city;
      showCard(best.city);
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

    if (reduce) { draw(); return; }
    requestAnimationFrame(loop);
  })();

  /* 初始语言 */
  applyLang("en");
})();

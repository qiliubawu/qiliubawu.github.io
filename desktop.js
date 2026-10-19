/* ============================================================
   ZZX Desktop — 三阶段交互状态机
   sleep（休眠）→ awake（唤醒环绕）→ open（Quick Look）
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 作品数据 ---------- */
  var PROJECTS = [
    {
      t: "智慧物业管理系统", s: "智慧物业", g: "智", c: "#0891b2", cat: "全栈项目",
      tags: ["ASP.NET", "SQL Server", "EF Core", "SignalR"],
      link: "https://qiliubawu.github.io/PropertySystem/"
    },
    {
      t: "电商平台", s: "电商平台", g: "商", c: "#f59e0b", cat: "Web 应用",
      tags: ["HTML/CSS", "JS", "Unsplash"],
      link: "/ecommerce.html"
    },
    {
      t: "粒子烟花", s: "粒子烟花", g: "烟", c: "#ef4444", cat: "Web 交互",
      tags: ["Canvas", "粒子系统"],
      link: "/fireworks.html"
    },
    {
      t: "3D 卡片翻转", s: "3D 卡片", g: "卡", c: "#8b5cf6", cat: "Web 交互",
      tags: ["CSS 3D", "Animation"],
      link: "/flipcards.html"
    },
    {
      t: "弹跳侧边栏", s: "弹跳侧栏", g: "栏", c: "#f59e0b", cat: "Web 交互",
      tags: ["侧边栏", "弹跳动画", "锚点导航"],
      link: "/sidebar.html"
    },
    {
      t: "3D 天气 UI", s: "3D 天气", g: "天", c: "#22c55e", cat: "Web 交互",
      tags: ["3D", "动画"],
      link: "/weather.html"
    },
    {
      t: "拟态旋钮", s: "拟态旋钮", g: "钮", c: "#6366f1", cat: "Web 交互",
      tags: ["拟态", "CSS 3D"],
      link: "/joystick.html"
    },
    {
      t: "椭圆无限轮播", s: "椭圆轮播", g: "轮", c: "#f59e0b", cat: "Web 交互",
      tags: ["3D", "Carousel"],
      link: "/carousel.html"
    },
    {
      t: "方向感应名片", s: "感应名片", g: "片", c: "#6366f1", cat: "Web 交互",
      tags: ["3D Tilt", "视差"],
      link: "/tiltcard.html"
    },
    {
      t: "动画登录页", s: "动画登录", g: "登", c: "#8b5cf6", cat: "Web 交互",
      tags: ["动画角色", "交互动效"],
      link: "/animatedlogin.html"
    },
    {
      t: "十二生肖非遗图鉴", s: "十二生肖", g: "肖", c: "#D4AF37", cat: "Web 交互",
      tags: ["国潮", "纯 CSS", "星象罗盘"],
      link: "/zodiac/"
    }
  ];

  /* ---------- DOM ---------- */
  var scene    = document.getElementById("scene");
  var folder   = document.getElementById("folder");
  var filesBox = document.getElementById("files");
  var face     = document.getElementById("face");
  var hint     = document.getElementById("hint");

  var ql        = document.getElementById("ql");
  var qlWindow  = document.getElementById("qlWindow");
  var qlTitle   = document.getElementById("qlTitle");
  var qlUrl     = document.getElementById("qlUrl");
  var qlFrame   = document.getElementById("qlFrame");
  var qlLoading = document.getElementById("qlLoading");
  var qlOpenBtn = document.getElementById("qlOpen");

  /* ---------- 构建文件 ---------- */
  var nodes = [];

  PROJECTS.forEach(function (p, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "file";
    b.tabIndex = -1;
    b.style.setProperty("--i", i);
    b.style.setProperty("--c", p.c);
    b.setAttribute("aria-label", "打开《" + p.t + "》，" + p.cat);
    b.innerHTML =
      '<span class="file-float">' +
        '<span class="sheet"><span class="sheet-glyph">' + p.g + "</span></span>" +
        '<span class="file-name">' + p.s + "</span>" +
      "</span>";
    filesBox.appendChild(b);

    nodes.push({
      el: b, p: p,
      x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
      delay: i * 0.028
    });

    b.addEventListener("click", function () { openProject(i); });
    b.addEventListener("mouseenter", function () { lookAtEl(b); });
    b.addEventListener("mouseleave", function () {
      if (state !== "open") face.dataset.mood = "calm";
    });
    b.addEventListener("focus", function () { lookAtEl(b); });
  });

  /* ---------- 弹簧积分器 ---------- */
  /* K/C 决定阻尼比 ≈ C / (2√K) ≈ 0.61，欠阻尼 → 一次自然回弹 */
  var K = 170, C = 16;
  var rafId = null, lastT = 0, elapsed = 0;

  function kick() {
    elapsed = 0;
    lastT = performance.now();
    if (rafId === null) rafId = requestAnimationFrame(step);
  }

  function step(now) {
    var dt = (now - lastT) / 1000;
    lastT = now;
    if (!(dt > 0)) dt = 1 / 60;
    if (dt > 0.032) dt = 0.032;   /* 切标签页回来时不要爆掉 */
    elapsed += dt;

    var moving = false;

    for (var i = 0; i < nodes.length; i++) {
      var f = nodes[i];

      if (elapsed < f.delay) { moving = true; continue; }

      var ax = -K * (f.x - f.tx) - C * f.vx;
      var ay = -K * (f.y - f.ty) - C * f.vy;
      f.vx += ax * dt;
      f.vy += ay * dt;
      f.x  += f.vx * dt;
      f.y  += f.vy * dt;

      if (Math.abs(f.vx) > 0.4 || Math.abs(f.vy) > 0.4 ||
          Math.abs(f.x - f.tx) > 0.25 || Math.abs(f.y - f.ty) > 0.25) {
        moving = true;
      }

      f.el.style.transform =
        "translate3d(" + f.x.toFixed(2) + "px," + f.y.toFixed(2) + "px,0)";
    }

    if (moving) {
      rafId = requestAnimationFrame(step);
    } else {
      rafId = null;
      nodes.forEach(function (f) {
        f.x = f.tx; f.y = f.ty; f.vx = 0; f.vy = 0;
        f.el.style.transform =
          "translate3d(" + f.tx.toFixed(2) + "px," + f.ty.toFixed(2) + "px,0)";
      });
    }
  }

  /* ---------- 环形散布目标点 ---------- */
  function computeTargets() {
    var w = scene.clientWidth;
    var h = scene.clientHeight;
    var n = nodes.length;

    var rx = Math.min(430, Math.max(190, w * 0.32));
    var ry = Math.min(288, Math.max(140, h * 0.29));

    /* 窄屏收敛，避免文件被裁到视口外 */
    if (w < 780) {
      rx = Math.min(rx, w * 0.36);
      ry = Math.min(ry, h * 0.34);
    }

    nodes.forEach(function (f, i) {
      var a = (-90 + i * (360 / n)) * Math.PI / 180;
      var jitter = 1 + ((i % 3) - 1) * 0.05;   /* 半径微扰，避免过于机械 */
      f.tx = Math.cos(a) * rx * jitter;
      f.ty = Math.sin(a) * ry * jitter;
    });
  }

  /* ---------- 状态机 ---------- */
  var state = "sleep";

  function setState(s) {
    state = s;
    scene.dataset.state = s;

    nodes.forEach(function (n) { n.el.tabIndex = (s === "sleep") ? -1 : 0; });

    if (s === "sleep") {
      nodes.forEach(function (f) { f.tx = 0; f.ty = 0; });
      kick();
      hint.textContent = "点击文件夹，唤醒 ZZX";
      folder.setAttribute("aria-label", "ZZX 作品文件夹，按下以唤醒并展开全部作品");
      face.dataset.mood = "calm";
      face.style.setProperty("--ex", "0px");
      face.style.setProperty("--ey", "0px");
    } else if (s === "awake") {
      computeTargets();
      nodes.forEach(function (f) { f.vx = 0; f.vy = 0; });
      kick();
      hint.textContent = "点击任意文件，展开预览";
      folder.setAttribute("aria-label", "ZZX 作品文件夹，按下以收起");
      face.dataset.mood = "calm";
    } else {
      hint.textContent = "";
    }
  }

  /* ---------- 瞳孔追踪 ---------- */
  var pointer = { x: 0, y: 0 };
  var pupilRaf = null;

  function updatePupils() {
    pupilRaf = null;
    if (state === "sleep") return;

    var r = face.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;

    var dx = pointer.x - cx;
    var dy = pointer.y - cy;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;

    /* 距离越远偏移越大，但有上限，避免瞳孔跑出眼眶 */
    var reach = Math.min(1, len / 150);
    var max = 5.2;

    face.style.setProperty("--ex", (dx / len * max * reach).toFixed(2) + "px");
    face.style.setProperty("--ey", (dy / len * max * reach).toFixed(2) + "px");
  }

  function queuePupils() {
    if (pupilRaf === null) pupilRaf = requestAnimationFrame(updatePupils);
  }

  /* 注视某个元素（散落文件）→ 期待/自豪 */
  function lookAtEl(el) {
    if (state !== "awake") return;
    var r = el.getBoundingClientRect();
    pointer.x = r.left + r.width / 2;
    pointer.y = r.top + r.height / 2;
    queuePupils();
    face.dataset.mood = "proud";
  }

  document.addEventListener("mousemove", function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (state === "sleep") return;
    queuePupils();
  }, { passive: true });

  /* ---------- 文件夹交互 ---------- */
  folder.addEventListener("click", function () {
    if (state === "sleep") setState("awake");
    else if (state === "awake") setState("sleep");
  });

  folder.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      folder.click();
    }
  });

  /* ---------- Quick Look ---------- */
  var current = null;
  var loadTimer = null;
  var closeTimer = null;
  var lastFileEl = null;

  function openProject(i) {
    var node = nodes[i];
    var p = node.p;
    current = p;
    lastFileEl = node.el;
    clearTimeout(closeTimer);   /* 防止上一次关闭的延时把新窗口收掉 */

    var first = node.el.getBoundingClientRect();

    /* 内容 */
    qlTitle.textContent = p.t;
    qlUrl.textContent = p.link;
    qlFrame.classList.remove("loaded");
    qlLoading.hidden = false;
    qlLoading.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>正在载入预览…</span>';
    qlFrame.src = p.link;

    /* 先显示容器才能量到最终位置 */
    ql.hidden = false;
    ql.dataset.open = "0";
    qlWindow.style.transition = "none";
    qlWindow.style.transform = "none";
    qlWindow.style.opacity = "1";

    var last = qlWindow.getBoundingClientRect();

    var tx = (first.left + first.width / 2) - (last.left + last.width / 2);
    var ty = (first.top + first.height / 2) - (last.top + last.height / 2);
    var sx = Math.max(0.08, first.width / last.width);
    var sy = Math.max(0.08, first.height / last.height);

    /* FLIP：先缩到文件位置，再弹到窗口位置 */
    qlWindow.style.transformOrigin = "center center";
    qlWindow.style.transform =
      "translate(" + tx + "px," + ty + "px) scale(" + sx + "," + sy + ")";
    qlWindow.style.opacity = "0";

    nodes.forEach(function (n) { n.el.classList.remove("is-active"); });
    node.el.classList.add("is-active");

    setState("open");
    face.dataset.mood = "focus";

    /* 眼睛看向窗口 */
    pointer.x = last.left + last.width / 2;
    pointer.y = last.top + last.height / 2;
    queuePupils();

    /* 双 rAF：确保初始 transform 已提交，过渡才会生效 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ql.dataset.open = "1";
        qlWindow.style.transition =
          "transform .62s cubic-bezier(.22,1.14,.36,1), opacity .26s ease";
        qlWindow.style.transform = "translate(0px,0px) scale(1,1)";
        qlWindow.style.opacity = "1";
        qlWindow.focus();
      });
    });

    /* 预览兜底：超时未载入则给出新标签页入口 */
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () {
      if (!qlFrame.classList.contains("loaded")) {
        qlLoading.innerHTML =
          '<span>该页面暂不支持窗口内嵌预览</span>' +
          '<button type="button" class="ql-fallback">在新标签页打开 ↗</button>';
        var fb = qlLoading.querySelector(".ql-fallback");
        if (fb) {
          fb.addEventListener("click", function () {
            window.open(p.link, "_blank", "noopener");
          });
        }
      }
    }, 9000);
  }

  function closeQL() {
    if (ql.hidden) return;

    ql.dataset.open = "0";
    qlWindow.style.transition =
      "transform .38s cubic-bezier(.4,0,.2,1), opacity .3s ease";
    qlWindow.style.transform = "translate(0px,14px) scale(.96)";
    qlWindow.style.opacity = "0";

    current = null;
    clearTimeout(loadTimer);
    nodes.forEach(function (n) { n.el.classList.remove("is-active"); });
    face.dataset.mood = "calm";
    setState("awake");

    setTimeout(function () {
      ql.hidden = true;
      qlFrame.classList.remove("loaded");
      qlFrame.src = "about:blank";
      qlWindow.style.transition = "none";
      qlWindow.style.transform = "none";
      qlWindow.style.opacity = "1";
    }, 400);

    /* 焦点还给刚才那个文件，键盘用户不会掉进虚空 */
    if (lastFileEl && document.contains(lastFileEl)) lastFileEl.focus();
  }

  qlFrame.addEventListener("load", function () {
    if (!current) return;
    if (qlFrame.getAttribute("src") === "about:blank") return;
    qlFrame.classList.add("loaded");
    qlLoading.hidden = true;
  });

  /* 三色灯 */
  document.querySelector(".lights").addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".light") : null;
    if (!btn) return;
    var act = btn.getAttribute("data-act");

    if (act === "close") {
      closeQL();
    } else if (act === "open") {
      if (current) window.open(current.link, "_blank", "noopener");
    } else if (act === "reload") {
      if (!current) return;
      qlFrame.classList.remove("loaded");
      qlLoading.hidden = false;
      qlFrame.src = current.link;
    }
  });

  qlOpenBtn.addEventListener("click", function () {
    if (current) window.open(current.link, "_blank", "noopener");
  });

  /* 点击窗口外关闭 */
  ql.addEventListener("mousedown", function (e) {
    if (e.target === ql) closeQL();
  });

  /* Esc */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!ql.hidden) closeQL();
    else if (state === "awake") setState("sleep");
  });

  /* ---------- 主题 ---------- */
  var root = document.documentElement;
  var THEME_KEY = "zzx-theme";
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(t) {
    root.dataset.theme = t;
    if (metaTheme) metaTheme.setAttribute("content", t === "dark" ? "#1D1D1F" : "#F5F5F7");
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (err) {}
  if (savedTheme !== "dark" && savedTheme !== "light") {
    savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(savedTheme);

  document.getElementById("themeSw").addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) {}
  });

  /* ---------- 时钟 ---------- */
  var clockEl = document.getElementById("clock");
  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  function tickClock() {
    var d = new Date();
    clockEl.textContent =
      (d.getMonth() + 1) + "月" + d.getDate() + "日 周" + WEEK[d.getDay()] +
      " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- 尺寸变化 ---------- */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (state === "awake" || state === "open") {
        computeTargets();
        kick();
      }
    }, 120);
  });

  /* ---------- 初始化 ---------- */
  nodes.forEach(function (f) {
    f.el.style.transform = "translate3d(0,0,0)";
  });
  setState("sleep");
})();

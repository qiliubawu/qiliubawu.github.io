/* ============================================================
   ZZX Desktop — 核心引擎
   ─ 单一 requestAnimationFrame 主循环（无零散定时器驱动动画）
   ─ 集中式 Store：state / expression / xray / spotlight / pointer
   ─ 弹簧物理 + 拖拽抛掷 + 磁吸 + 圆形碰撞
   ─ 双目 atan2 追踪 + 微表情状态机
   ─ SVG 二次贝塞尔琴弦（阻尼正弦拨弦）
   ─ X-Ray canvas + FPS 示波器 + Web Audio 程序化音效
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     0. 常量与工具
     ============================================================ */
  var SVG_NS = "http://www.w3.org/2000/svg";
  var TAU = Math.PI * 2;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* 弹簧参数：K/C 决定阻尼比 ≈ C/(2√K) ≈ 0.52，欠阻尼一次自然回弹 */
  var SPRING_K = 180;
  var SPRING_C = 14;
  var MAGNET_R = 130;        /* 磁吸作用半径 */
  var MAGNET_F = 3000;       /* 磁吸最大加速度 */
  var COLLIDE_R = 46;        /* 文件碰撞半径 */
  var PUPIL_R = 9.5;         /* 瞳孔最大位移 */
  var EYE_REACH = 180;       /* 距离归一化基准 */
  var HIT_R = 92;            /* 撞入文件夹判定半径 */
  var DIZZY_SPEED = 1900;    /* 眩晕速度阈值 px/s */

  /* 五声音阶（宫商角徵羽，高八度） */
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880.00];

  /* ============================================================
     1. 六个项目（对应六个内置微型应用）
     ============================================================ */
  var PROJECTS = [
    {
      id: "zodiac", t: "十二生肖 · 华夏瑞兽", s: "十二生肖", g: "肖",
      c: "#D4AF37", cat: "国潮 CSS 艺术",
      tags: ["CSS艺术", "国潮", "纯CSS", "3D"],
      path: "十二生肖·华夏瑞兽.html", link: "/zodiac/",
      desc: "纯 CSS 环形天干地支星盘、属相速查、3D 翻转民俗图鉴"
    },
    {
      id: "terminal", t: "zzx-terminal.sh", s: "终端", g: ">_",
      c: "#22C55E", cat: "极客交互",
      tags: ["JavaScript", "CLI", "Canvas"],
      path: "zzx-terminal.sh", link: null,
      desc: "可输入 help / skills / projects / xray / sudo hire zzx"
    },
    {
      id: "vision", t: "VisionUI-Kit.tsx", s: "VisionUI", g: "◈",
      c: "#0A84FF", cat: "空间组件沙盒",
      tags: ["TypeScript", "Glassmorphism", "3D"],
      path: "VisionUI-Kit.tsx", link: null,
      desc: "实时调节毛玻璃折射与 3D 倾角的组件沙盒"
    },
    {
      id: "fluid", t: "FluidField.glsl", s: "FluidField", g: "✦",
      c: "#00C8FF", cat: "GPU 粒子实验",
      tags: ["WebGL", "Canvas", "物理"],
      path: "FluidField.glsl", link: null,
      desc: "240 颗发光粒子的引力 / 斥力 / 星轨实验室"
    },
    {
      id: "perf", t: "PerfTelemetry.ts", s: "PerfTelemetry", g: "◎",
      c: "#0EA5A5", cat: "性能遥测",
      tags: ["Performance", "Web Vitals"],
      path: "PerfTelemetry.ts", link: null,
      desc: "Core Web Vitals 满分遥测面板"
    },
    {
      id: "about", t: "About_ZZX.md", s: "About", g: "Z",
      c: "#8B5CF6", cat: "个人名片",
      tags: ["Profile", "Contact"],
      path: "About_ZZX.md", link: null,
      desc: "Apple Passbook 风格名片，一键复制邮箱"
    }
  ];

  /* ============================================================
     2. 集中式 Store
     ============================================================ */
  var Store = {
    state: "sleeping",          /* sleeping | awakened | open */
    expression: "calm",         /* calm | blink | dizzy | pain | proud | focus */
    xray: false,
    spotlight: null,            /* 标签字符串或 null */
    pointer: { x: 0, y: 0, inside: false },
    mouseSpeed: 0,
    dragging: null,
    activeApp: null,
    w: 0, h: 0
  };

  /* ============================================================
     3. DOM
     ============================================================ */
  var scene     = document.getElementById("scene");
  var folder    = document.getElementById("folder");
  var filesBox  = document.getElementById("files");
  var face      = document.getElementById("face");
  var hint      = document.getElementById("hint");
  var svg       = document.getElementById("tetherSvg");
  var dock      = document.getElementById("dock");
  var hud       = document.getElementById("hud");
  var hudFps    = document.getElementById("hudFps");
  var hudThetaL = document.getElementById("hudThetaL");
  var hudThetaR = document.getElementById("hudThetaR");
  var hudDist   = document.getElementById("hudDist");
  var hudState  = document.getElementById("hudState");
  var fpsCanvas = document.getElementById("fpsCanvas");
  var xrayCanvas= document.getElementById("xrayCanvas");
  var spot      = document.getElementById("spotlight");
  var spotTags  = document.getElementById("spotTags");
  var winLayer  = document.getElementById("winLayer");
  var win       = document.getElementById("win");
  var winTitle  = document.getElementById("winTitle");
  var winPath   = document.getElementById("winPath");
  var winBody   = document.getElementById("winBody");
  var winOpen   = document.getElementById("winOpen");

  var xrayBtn = document.getElementById("xrayBtn");
  var spotBtn = document.getElementById("spotBtn");

  var eyes = Array.prototype.slice.call(document.querySelectorAll(".eye"));
  var xctx = xrayCanvas.getContext("2d");
  var fctx = fpsCanvas.getContext("2d");

  /* ============================================================
     4. 程序化音效（Web Audio，零依赖）
     ============================================================ */
  var AC = null;
  var audioReady = false;

  function audio() {
    if (!audioReady) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try { AC = new Ctx(); } catch (e) { return null; }
      audioReady = true;
    }
    if (AC && AC.state === "suspended") { AC.resume(); }
    return AC;
  }

  function tone(freq, dur, type, gain, delay) {
    var a = audio();
    if (!a) return;
    var t0 = a.currentTime + (delay || 0);
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.05, t0 + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  var sfx = {
    wake: function () {
      for (var i = 0; i < PENTA.length; i++) {
        tone(PENTA[i], 0.42, "sine", 0.05 - i * 0.006, i * 0.062);
      }
    },
    sleep: function () {
      for (var i = PENTA.length - 1; i >= 0; i--) {
        tone(PENTA[i] * 0.5, 0.34, "sine", 0.032, (PENTA.length - 1 - i) * 0.055);
      }
    },
    hover: function () { tone(1320, 0.06, "triangle", 0.018); },
    pluck: function (i) {
      tone(PENTA[i % PENTA.length], 0.22, "triangle", 0.03);
    },
    hit: function () {
      tone(110, 0.16, "sine", 0.07);
      tone(164, 0.1, "sine", 0.03, 0.02);
    },
    open: function () {
      tone(PENTA[2], 0.2, "sine", 0.045);
      tone(PENTA[4], 0.3, "sine", 0.035, 0.05);
    }
  };

  /* ============================================================
     5. 构建文件节点 + Dock + 琴弦 path
     ============================================================ */
  var nodes = [];

  PROJECTS.forEach(function (p, i) {
    /* --- 文件卡 --- */
    var b = document.createElement("button");
    b.type = "button";
    b.className = "file";
    b.tabIndex = -1;
    b.style.setProperty("--c", p.c);
    b.setAttribute("aria-label", "打开《" + p.t + "》，" + p.cat);
    b.setAttribute("data-xy", "x:0 y:0");
    b.innerHTML =
      '<span class="file-float">' +
        '<span class="sheet"><span class="sheet-glyph">' + p.g + "</span></span>" +
        '<span class="file-name">' + p.s + "</span>" +
      "</span>";
    filesBox.appendChild(b);

    /* --- 琴弦 --- */
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", "tether");
    svg.appendChild(path);

    var node = {
      el: b, p: p, path: path,
      x: 0, y: 0, vx: 0, vy: 0,
      tx: 0, ty: 0,
      phase: i * 1.17,
      amp: 0,             /* 拨弦振幅 */
      dragging: false,
      hover: false,
      hot: 0,             /* 连线高亮衰减 */
      lastT: 0, lastX: 0, lastY: 0
    };
    nodes.push(node);

    bindFileEvents(node, i);

    /* --- Dock --- */
    var d = document.createElement("button");
    d.type = "button";
    d.className = "dock-item";
    d.style.setProperty("--c", p.c);
    d.setAttribute("data-name", p.t);
    d.setAttribute("aria-label", "打开 " + p.t);
    d.textContent = p.g;
    d.addEventListener("click", function () { openApp(p.id, b); });
    dock.appendChild(d);
  });

  /* ============================================================
     6. 文件交互：拖拽 / 磁吸反光 / 碰撞 / 点击
     ============================================================ */
  function bindFileEvents(node, i) {
    var el = node.el;

    el.addEventListener("pointerdown", function (e) {
      if (Store.state === "sleeping") return;
      if (Store.state === "open") return;
      e.preventDefault();
      audio();

      el.setPointerCapture(e.pointerId);
      node.dragging = true;
      Store.dragging = node;
      el.classList.add("is-dragging");

      node.dragOffX = node.x - (e.clientX - Store.w / 2);
      node.dragOffY = node.y - (e.clientY - Store.h / 2);
      node.lastT = performance.now();
      node.lastX = e.clientX;
      node.lastY = e.clientY;
      node.amp = 34;

      el.addEventListener("pointermove", onDrag);
      el.addEventListener("pointerup", onDrop);
      el.addEventListener("pointercancel", onDrop);
    });

    function onDrag(e) {
      if (!node.dragging) return;
      var now = performance.now();
      var dt = (now - node.lastT) / 1000;

      node.x = (e.clientX - Store.w / 2) + node.dragOffX;
      node.y = (e.clientY - Store.h / 2) + node.dragOffY;

      if (dt > 0.008) {
        /* 记录速度（用于抛掷），做一点衰减避免过冲 */
        node.vx = (e.clientX - node.lastX) / dt * 0.62;
        node.vy = (e.clientY - node.lastY) / dt * 0.62;
        node.lastT = now;
        node.lastX = e.clientX;
        node.lastY = e.clientY;
      }

      applyGlare(node, e);
      node.amp = Math.max(node.amp, 26);

      /* 撞进文件夹半径 → 吃痛 */
      var d = Math.hypot(node.x, node.y);
      if (d < HIT_R) {
        if (performance.now() - lastHitAt > 900) {
          lastHitAt = performance.now();
          folder.classList.remove("is-hit");
          void folder.offsetWidth;
          folder.classList.add("is-hit");
          setExpression("pain", 620);
          sfx.hit();
        }
      }
    }

    function onDrop() {
      node.dragging = false;
      Store.dragging = null;
      node.el.classList.remove("is-dragging");
      node.el.removeEventListener("pointermove", onDrag);
      node.el.removeEventListener("pointerup", onDrop);
      node.el.removeEventListener("pointercancel", onDrop);
      /* 速度保留，弹簧会带着惯性把它拉回轨道 */
    }

    el.addEventListener("pointerenter", function (e) {
      if (Store.state === "sleeping") return;
      node.hover = true;
      node.amp = Math.max(node.amp, 20);
      node.hot = 1;
      node.el.style.setProperty("--glare-x", "50%");
      node.el.style.setProperty("--glare-y", "50%");
      if (Store.state === "awakened" && Store.expression !== "pain") {
        setExpression("proud");
      }
      sfx.hover();
      applyGlare(node, e);
    });

    el.addEventListener("pointermove", function (e) {
      if (!node.dragging) applyGlare(node, e);
    });

    el.addEventListener("pointerleave", function () {
      node.hover = false;
      node.el.style.setProperty("--rx", "0deg");
      node.el.style.setProperty("--ry", "0deg");
      node.el.style.setProperty("--glare-x", "50%");
      node.el.style.setProperty("--glare-y", "50%");
      if (Store.state === "awakened" && Store.expression === "proud") {
        setExpression("calm");
      }
    });

    el.addEventListener("click", function () {
      if (Store.state !== "awakened") return;
      openApp(node.p.id, node.el);
    });

    el.addEventListener("focus", function () {
      if (Store.state === "awakened") openApp(node.p.id, node.el);
    });
  }

  var lastHitAt = 0;

  function applyGlare(node, e) {
    var r = node.el.getBoundingClientRect();
    if (!r.width) return;
    var px = clamp((e.clientX - r.left) / r.width, 0, 1);
    var py = clamp((e.clientY - r.top) / r.height, 0, 1);
    node.el.style.setProperty("--glare-x", (px * 100).toFixed(1) + "%");
    node.el.style.setProperty("--glare-y", (py * 100).toFixed(1) + "%");
    node.el.style.setProperty("--rx", ((py - 0.5) * -15).toFixed(2) + "deg");
    node.el.style.setProperty("--ry", ((px - 0.5) * 15).toFixed(2) + "deg");
  }

  /* ============================================================
     7. 状态机
     ============================================================ */
  function setState(s) {
    Store.state = s;
    scene.dataset.state = s;

    nodes.forEach(function (n) { n.el.tabIndex = s === "sleeping" ? -1 : 0; });

    if (s === "sleeping") {
      nodes.forEach(function (n) {
        n.tx = 0; n.ty = 0;
        n.amp = 0; n.hot = 0;
        n.el.style.setProperty("--rx", "0deg");
        n.el.style.setProperty("--ry", "0deg");
      });
      hint.textContent = "点击文件夹，唤醒 ZZX";
      folder.setAttribute("aria-label", "ZZX 作品文件夹，按下以唤醒并展开全部作品");
      setExpression("calm");
      clearSpotlight();
    } else if (s === "awakened") {
      computeTargets();
      nodes.forEach(function (n, i) {
        /* 沿目标方向给瞬时初速度脉冲，形成扑面飞出 */
        var a = Math.atan2(n.ty, n.tx);
        n.vx = Math.cos(a) * (560 + i * 22);
        n.vy = Math.sin(a) * (560 + i * 22);
        n.amp = 42;
        n.hot = 1;
      });
      hint.textContent = "拖拽文件可抛掷 · 点击打开 · ⌘K 按技术筛选";
      folder.setAttribute("aria-label", "ZZX 作品文件夹，按下以收起");
      setExpression("calm");
      sfx.wake();
    } else {
      hint.textContent = "";
    }
    updateHudState();
  }

  function computeTargets() {
    var w = Store.w, h = Store.h;
    var n = nodes.length;

    var rx = Math.min(400, Math.max(180, w * 0.30));
    var ry = Math.min(240, Math.max(132, h * 0.31));

    if (w < 820) {
      rx = Math.min(rx, w * 0.35);
      ry = Math.min(ry, h * 0.32);
    }

    nodes.forEach(function (f, i) {
      var a = (-90 + i * (360 / n)) * Math.PI / 180;
      var jitter = 1 + ((i % 3) - 1) * 0.05;
      f.tx = Math.cos(a) * rx * jitter;
      f.ty = Math.sin(a) * ry * jitter;
    });
  }

  /* ============================================================
     8. 表情状态机
     ============================================================ */
  var exprTimer = null;
  var blinkTimer = null;
  var dizzyUntil = 0;
  var painUntil = 0;

  function setExpression(e, ms) {
    if (Store.state === "sleeping" && e !== "calm") return;
    if (e === "pain") painUntil = performance.now() + (ms || 600);
    if (e === "dizzy") dizzyUntil = performance.now() + (ms || 900);
    Store.expression = e;
    face.dataset.expression = e;

    clearTimeout(exprTimer);
    if (ms) {
      exprTimer = setTimeout(function () {
        var now = performance.now();
        if (now < painUntil) return;
        if (now < dizzyUntil) return;
        var next = Store.state === "open" ? "focus" : "calm";
        Store.expression = next;
        face.dataset.expression = next;
      }, ms);
    }
  }

  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(function () {
      if (Store.state === "awakened" && Store.expression === "calm") {
        face.dataset.expression = "blink";
        setTimeout(function () {
          if (face.dataset.expression === "blink") face.dataset.expression = "calm";
        }, 120);
      }
      scheduleBlink();
    }, 2800 + Math.random() * 4200);
  }

  /* ============================================================
     9. 双目追踪
     ============================================================ */
  var thetaL = 0, thetaR = 0, distEyes = 0;

  function updateEyes() {
    if (Store.state === "sleeping") return;
    var mx = Store.pointer.x, my = Store.pointer.y;

    for (var i = 0; i < eyes.length; i++) {
      var r = eyes[i].getBoundingClientRect();
      if (!r.width) continue;
      var ex = r.left + r.width / 2;
      var ey = r.top + r.height / 2;

      var dx = mx - ex, dy = my - ey;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var theta = Math.atan2(dy, dx);
      var d = Math.min(1, len / EYE_REACH);

      var ox = Math.cos(theta) * PUPIL_R * d;
      var oy = Math.sin(theta) * PUPIL_R * d;

      eyes[i].style.setProperty("--ex", ox.toFixed(2) + "px");
      eyes[i].style.setProperty("--ey", oy.toFixed(2) + "px");

      if (i === 0) { thetaL = theta; distEyes = len; }
      else { thetaR = theta; }
    }
  }

  /* ============================================================
     10. 主循环：物理 / 连线 / HUD / X-Ray
     ============================================================ */
  var lastT = 0;
  var t = 0;
  var frame = 0;
  var fpsHistory = [];
  var hudAcc = 0;

  function loop(now) {
    if (!lastT) lastT = now;
    var dt = (now - lastT) / 1000;
    lastT = now;
    if (!(dt > 0)) dt = 1 / 60;
    if (dt > 0.05) dt = 0.05;
    t += dt;
    frame++;

    updatePhysics(dt);
    updateEyes();
    updateTethers();
    updateXray();

    hudAcc += dt;
    if (hudAcc > 0.12) {
      updateHud(now, dt);
      hudAcc = 0;
    }

    requestAnimationFrame(loop);
  }

  function updatePhysics(dt) {
    var cx = 0, cy = 0;   /* 文件坐标原点即 scene 中心 */

    for (var i = 0; i < nodes.length; i++) {
      var f = nodes[i];

      if (!f.dragging) {
        var ax = -SPRING_K * (f.x - f.tx) - SPRING_C * f.vx;
        var ay = -SPRING_K * (f.y - f.ty) - SPRING_C * f.vy;

        /* 磁吸：指针靠近时向光标牵引 */
        if (Store.pointer.inside && Store.state !== "sleeping" && Store.state !== "open") {
          var mdx = Store.pointer.x - (Store.w / 2 + f.x);
          var mdy = Store.pointer.y - (Store.h / 2 + f.y);
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < MAGNET_R && md > 4) {
            var pull = (1 - md / MAGNET_R) * MAGNET_F;
            ax += (mdx / md) * pull;
            ay += (mdy / md) * pull;
          }
        }

        f.vx += ax * dt;
        f.vy += ay * dt;

        /* 空气阻尼，避免长时间振荡 */
        f.vx *= 0.994;
        f.vy *= 0.994;

        f.x += f.vx * dt;
        f.y += f.vy * dt;
      }

      /* 漂浮相位（只影响渲染，不参与物理） */
      f.floatY = Math.sin(t * 1.35 + f.phase) * 3.6;

      /* 拨弦振幅衰减 */
      f.amp *= Math.pow(0.935, dt * 60);
      if (f.amp < 0.05) f.amp = 0;
      f.hot *= Math.pow(0.94, dt * 60);
    }

    /* 圆形碰撞 */
    resolveCollisions();

    /* 写入 DOM */
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      n.el.style.transform =
        "translate3d(" + n.x.toFixed(2) + "px," +
        (n.y + n.floatY).toFixed(2) + "px,0)";

      if (frame % 6 === 0) {
        n.el.setAttribute("data-xy",
          "x:" + Math.round(n.x) + " y:" + Math.round(n.y));
      }
    }
  }

  function resolveCollisions() {
    var minD = COLLIDE_R * 2;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d2 = dx * dx + dy * dy;
        if (d2 >= minD * minD || d2 < 0.01) continue;

        var d = Math.sqrt(d2);
        var nx = dx / d, ny = dy / d;
        var overlap = (minD - d) * 0.5;

        if (!a.dragging) { a.x -= nx * overlap; a.y -= ny * overlap; }
        if (!b.dragging) { b.x += nx * overlap; b.y += ny * overlap; }

        /* 沿法线交换速度分量 */
        var va = a.vx * nx + a.vy * ny;
        var vb = b.vx * nx + b.vy * ny;
        if (va - vb > 0) {
          var imp = (va - vb) * 0.62;
          if (!a.dragging) { a.vx -= imp * nx; a.vy -= imp * ny; }
          if (!b.dragging) { b.vx += imp * nx; b.vy += imp * ny; }

          if (Math.abs(imp) > 240) {
            a.amp = Math.max(a.amp, 16);
            b.amp = Math.max(b.amp, 16);
            if (performance.now() - lastClackAt > 140) {
              lastClackAt = performance.now();
              tone(320 + Math.random() * 180, 0.07, "triangle", 0.022);
            }
          }
        }
      }
    }
  }

  var lastClackAt = 0;

  /* --- 琴弦：二次贝塞尔 + 法线方向阻尼正弦 --- */
  var pluckPhase = 0;

  function updateTethers() {
    pluckPhase += 0.36;

    var cx = Store.w / 2;
    var cy = Store.h / 2;
    var visible = Store.state === "awakened" || Store.state === "open";

    for (var i = 0; i < nodes.length; i++) {
      var f = nodes[i];
      if (!visible) {
        f.path.setAttribute("d", "");
        continue;
      }

      var tx = cx + f.x;
      var ty = cy + f.y + (f.floatY || 0);

      var mx = (cx + tx) / 2;
      var my = (cy + ty) / 2;

      /* 法线向量 (-dy, dx) 归一化 */
      var ndx = -(ty - cy);
      var ndy = tx - cx;
      var nl = Math.sqrt(ndx * ndx + ndy * ndy) || 1;
      ndx /= nl; ndy /= nl;

      var off = Math.sin(pluckPhase + f.phase) * f.amp;
      var ctrlX = mx + ndx * off;
      var ctrlY = my + ndy * off;

      f.path.setAttribute("d",
        "M" + cx.toFixed(1) + " " + cy.toFixed(1) +
        " Q" + ctrlX.toFixed(1) + " " + ctrlY.toFixed(1) +
        " " + tx.toFixed(1) + " " + ty.toFixed(1));

      var cls = "tether";
      if (Store.spotlight && !isMatch(f.p)) cls += " is-dim";
      else if (f.hot > 0.25) cls += " is-hot";
      if (f.path.getAttribute("class") !== cls) f.path.setAttribute("class", cls);
    }
  }

  /* ============================================================
     11. X-Ray canvas（激光向量 / 准星 / 聚光灯束）
     ============================================================ */
  var xdpr = 1;

  function resizeCanvas() {
    xdpr = Math.min(2, window.devicePixelRatio || 1);
    xrayCanvas.width = Math.floor(Store.w * xdpr);
    xrayCanvas.height = Math.floor(Store.h * xdpr);
    xctx.setTransform(xdpr, 0, 0, xdpr, 0, 0);

    var fw = fpsCanvas.width, fh = fpsCanvas.height;
    fpsCanvas.width = fw; fpsCanvas.height = fh;
  }

  function updateXray() {
    var on = Store.xray || !!Store.spotlight;
    if (!on) {
      if (frame % 30 === 0) xctx.clearRect(0, 0, Store.w, Store.h);
      return;
    }

    xctx.clearRect(0, 0, Store.w, Store.h);

    /* 聚光灯束：文件夹中心 → 匹配文件 */
    if (Store.spotlight) {
      var cx = Store.w / 2, cy = Store.h / 2;
      for (var i = 0; i < nodes.length; i++) {
        var f = nodes[i];
        if (!isMatch(f.p)) continue;
        var tx = cx + f.x, ty = cy + f.y;
        var g = xctx.createLinearGradient(cx, cy, tx, ty);
        g.addColorStop(0, "rgba(0,229,255,.34)");
        g.addColorStop(1, "rgba(0,229,255,0)");
        xctx.fillStyle = g;
        xctx.beginPath();
        xctx.moveTo(cx, cy);
        xctx.lineTo(tx - 44, ty - 30);
        xctx.lineTo(tx + 44, ty - 30);
        xctx.lineTo(tx + 44, ty + 30);
        xctx.lineTo(tx - 44, ty + 30);
        xctx.closePath();
        xctx.fill();
      }
    }

    if (!Store.xray) return;

    /* 双眼 → 光标的激光虚线 */
    var mx = Store.pointer.x, my = Store.pointer.y;
    xctx.save();
    xctx.setLineDash([5, 6]);
    xctx.lineWidth = 1;

    for (var e = 0; e < eyes.length; e++) {
      var r = eyes[e].getBoundingClientRect();
      if (!r.width) continue;
      var ex = r.left + r.width / 2;
      var ey = r.top + r.height / 2;

      xctx.strokeStyle = "rgba(0,229,255,.55)";
      xctx.beginPath();
      xctx.moveTo(ex, ey);
      xctx.lineTo(mx, my);
      xctx.stroke();

      /* 眼眶十字 */
      xctx.strokeStyle = "rgba(0,229,255,.85)";
      xctx.setLineDash([]);
      xctx.beginPath();
      xctx.moveTo(ex - 7, ey); xctx.lineTo(ex + 7, ey);
      xctx.moveTo(ex, ey - 7); xctx.lineTo(ex, ey + 7);
      xctx.stroke();
      xctx.setLineDash([5, 6]);
    }
    xctx.restore();

    /* 光标准星 */
    xctx.strokeStyle = "rgba(0,229,255,.9)";
    xctx.lineWidth = 1;
    xctx.beginPath();
    xctx.arc(mx, my, 9, 0, TAU);
    xctx.moveTo(mx - 15, my); xctx.lineTo(mx - 4, my);
    xctx.moveTo(mx + 4, my); xctx.lineTo(mx + 15, my);
    xctx.moveTo(mx, my - 15); xctx.lineTo(mx, my - 4);
    xctx.moveTo(mx, my + 4); xctx.lineTo(mx, my + 15);
    xctx.stroke();

    /* 弧度与距离标注 */
    xctx.font = "10px ui-monospace, Menlo, monospace";
    xctx.fillStyle = "rgba(0,229,255,.9)";
    xctx.fillText(
      "θL " + thetaL.toFixed(3) + "  θR " + thetaR.toFixed(3) +
      "  d " + Math.round(distEyes) + "px",
      mx + 18, my - 14
    );

    /* 文件夹坐标框 */
    var fr = folder.getBoundingClientRect();
    xctx.save();
    xctx.setLineDash([3, 5]);
    xctx.strokeStyle = "rgba(0,229,255,.42)";
    xctx.strokeRect(fr.left - 4, fr.top - 4, fr.width + 8, fr.height + 8);
    xctx.restore();
    xctx.fillStyle = "rgba(0,229,255,.62)";
    xctx.fillText(
      "folder " + Math.round(fr.left) + "," + Math.round(fr.top),
      fr.left - 4, fr.top - 10
    );
  }

  /* ============================================================
     12. HUD / FPS 示波器
     ============================================================ */
  function updateHud(now, dt) {
    var fps = dt > 0 ? 1 / dt : 0;
    fpsHistory.push(fps);
    if (fpsHistory.length > 110) fpsHistory.shift();

    if (!Store.xray) return;

    hudFps.textContent = Math.round(fps) + " FPS";
    hudThetaL.textContent = thetaL.toFixed(2);
    hudThetaR.textContent = thetaR.toFixed(2);
    hudDist.textContent = Math.round(distEyes) + "px";

    /* 波形 */
    var w = fpsCanvas.width, h = fpsCanvas.height;
    fctx.clearRect(0, 0, w, h);

    /* 60fps 基准线 */
    fctx.strokeStyle = "rgba(0,229,255,.16)";
    fctx.beginPath();
    fctx.moveTo(0, h - (60 / 130) * h);
    fctx.lineTo(w, h - (60 / 130) * h);
    fctx.stroke();

    fctx.beginPath();
    fctx.strokeStyle = "#3EF0A8";
    fctx.lineWidth = 1.4;
    for (var i = 0; i < fpsHistory.length; i++) {
      var x = (i / (fpsHistory.length - 1 || 1)) * w;
      var y = h - clamp(fpsHistory[i] / 130, 0, 1) * h;
      if (i === 0) fctx.moveTo(x, y);
      else fctx.lineTo(x, y);
    }
    fctx.stroke();
  }

  function updateHudState() {
    if (hudState) hudState.textContent = Store.state;
  }

  /* ============================================================
     13. X-Ray / Spotlight 开关
     ============================================================ */
  function toggleXray(force) {
    var next = typeof force === "boolean" ? force : !Store.xray;
    Store.xray = next;
    document.body.classList.toggle("xray-active", next);
    xrayBtn.setAttribute("aria-pressed", next ? "true" : "false");
    hud.hidden = !next;
    if (next) updateHudState();
  }

  function openSpotlight() {
    spot.hidden = false;
    spotBtn.setAttribute("aria-pressed", "true");
    renderSpotTags();
  }

  function closeSpotlight() {
    spot.hidden = true;
    spotBtn.setAttribute("aria-pressed", Store.spotlight ? "true" : "false");
  }

  function renderSpotTags() {
    var tags = {};
    PROJECTS.forEach(function (p) {
      p.tags.forEach(function (tg) { tags[tg] = (tags[tg] || 0) + 1; });
    });

    spotTags.innerHTML = "";
    var all = document.createElement("button");
    all.type = "button";
    all.className = "spot-tag";
    all.textContent = "全部项目";
    all.setAttribute("aria-pressed", Store.spotlight === null ? "true" : "false");
    all.addEventListener("click", function () { applySpotlight(null); });
    spotTags.appendChild(all);

    Object.keys(tags).sort().forEach(function (tg) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "spot-tag";
      b.textContent = "#" + tg + " · " + tags[tg];
      b.setAttribute("aria-pressed", Store.spotlight === tg ? "true" : "false");
      b.addEventListener("click", function () { applySpotlight(tg); });
      spotTags.appendChild(b);
    });
  }

  function applySpotlight(tag) {
    Store.spotlight = tag;
    document.body.classList.toggle("spot-active", !!tag);

    nodes.forEach(function (n) {
      var match = !tag || n.p.tags.indexOf(tag) !== -1;
      n.el.classList.toggle("is-match", !!tag && match);
      n.el.classList.toggle("is-dimmed", !!tag && !match);
    });

    if (tag && Store.state === "sleeping") {
      /* 筛选需要看到文件，自动唤醒 */
      setState("awakened");
    }

    renderSpotTags();
    if (tag) {
      setTimeout(closeSpotlight, 180);
    }
  }

  function clearSpotlight() {
    Store.spotlight = null;
    document.body.classList.remove("spot-active");
    nodes.forEach(function (n) {
      n.el.classList.remove("is-match", "is-dimmed");
    });
  }

  function isMatch(p) {
    if (!Store.spotlight) return false;
    return p.tags.indexOf(Store.spotlight) !== -1;
  }

  /* ============================================================
     14. 窗口管理（FLIP）
     ============================================================ */
  var closeTimer = null;
  var loadTimer = null;

  function openApp(appId, sourceEl) {
    var p = null;
    for (var i = 0; i < PROJECTS.length; i++) {
      if (PROJECTS[i].id === appId) { p = PROJECTS[i]; break; }
    }
    if (!p) return;

    Store.activeApp = p;
    clearTimeout(closeTimer);
    clearTimeout(loadTimer);

    win.setAttribute("data-app", p.id);
    winTitle.textContent = p.t;
    /* 路径与标题重复时就不再显示，避免信息冗余 */
    winPath.textContent = p.path === p.t ? "" : p.path;
    winPath.hidden = p.path === p.t;
    winOpen.hidden = !p.link;

    /* 内容渲染交给 apps.js */
    winBody.innerHTML = "";
    if (window.ZZXApps && window.ZZXApps.render) {
      window.ZZXApps.render(p.id, winBody, p);
    }

    var first = sourceEl ? sourceEl.getBoundingClientRect() : null;

    winLayer.hidden = false;
    win.style.transition = "none";
    win.style.transform = "none";
    win.style.opacity = "1";

    var last = win.getBoundingClientRect();

    if (first && first.width) {
      var tx = (first.left + first.width / 2) - (last.left + last.width / 2);
      var ty = (first.top + first.height / 2) - (last.top + last.height / 2);
      var sx = Math.max(0.08, first.width / last.width);
      var sy = Math.max(0.08, first.height / last.height);
      win.style.transformOrigin = "center center";
      win.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + sx + "," + sy + ")";
      win.style.opacity = "0";
    } else {
      win.style.transform = "translateY(14px) scale(.97)";
      win.style.opacity = "0";
    }

    setState("open");
    setExpression("focus");
    sfx.open();

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        win.style.transition =
          "transform .6s cubic-bezier(.22,1.14,.36,1), opacity .26s ease";
        win.style.transform = "translate(0,0) scale(1,1)";
        win.style.opacity = "1";
        win.focus();
      });
    });

    nodes.forEach(function (n) {
      n.el.classList.toggle("is-active", n.p.id === appId);
    });
  }

  function closeApp() {
    if (winLayer.hidden) return;

    win.style.transition =
      "transform .34s cubic-bezier(.4,0,.2,1), opacity .26s ease";
    win.style.transform = "translate(0,10px) scale(.965)";
    win.style.opacity = "0";

    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      winLayer.hidden = true;
      winBody.innerHTML = "";
      win.style.transition = "none";
      win.style.transform = "none";
      win.style.opacity = "1";
    }, 340);

    nodes.forEach(function (n) { n.el.classList.remove("is-active"); });
    Store.activeApp = null;
    setState("awakened");
    setExpression("calm");
  }

  winLayer.addEventListener("mousedown", function (e) {
    if (e.target === winLayer) closeApp();
  });

  winOpen.addEventListener("click", function () {
    if (Store.activeApp && Store.activeApp.link) {
      window.open(Store.activeApp.link, "_blank", "noopener");
    }
  });

  win.querySelector(".lights").addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".light") : null;
    if (!btn) return;
    var act = btn.getAttribute("data-act");

    if (act === "close") {
      closeApp();
    } else if (act === "open") {
      if (Store.activeApp && Store.activeApp.link) {
        window.open(Store.activeApp.link, "_blank", "noopener");
      }
    } else if (act === "reload") {
      if (!Store.activeApp) return;
      var id = Store.activeApp.id;
      winBody.innerHTML = "";
      if (window.ZZXApps && window.ZZXApps.render) {
        window.ZZXApps.render(id, winBody, Store.activeApp);
      }
    }
  });

  /* ============================================================
     15. 指针与速度
     ============================================================ */
  var pmT = 0, pmX = 0, pmY = 0;

  document.addEventListener("pointermove", function (e) {
    var now = performance.now();
    var dt = Math.max(8, now - pmT) / 1000;
    var inst = Math.sqrt(
      (e.clientX - pmX) * (e.clientX - pmX) +
      (e.clientY - pmY) * (e.clientY - pmY)
    ) / dt;

    Store.mouseSpeed = Store.mouseSpeed * 0.85 + inst * 0.15;
    Store.pointer.x = e.clientX;
    Store.pointer.y = e.clientY;
    Store.pointer.inside = true;

    pmT = now; pmX = e.clientX; pmY = e.clientY;

    /* 高速晃动 → 眩晕 */
    if (Store.state !== "sleeping" &&
        Store.mouseSpeed > DIZZY_SPEED &&
        Store.expression !== "pain") {
      setExpression("dizzy", 900);
    }
  }, { passive: true });

  document.addEventListener("pointerleave", function () {
    Store.pointer.inside = false;
  });

  /* ============================================================
     16. 文件夹交互
     ============================================================ */
  folder.addEventListener("click", function () {
    audio();
    if (Store.state === "sleeping") {
      setState("awakened");
    } else if (Store.state === "awakened") {
      setState("sleeping");
      sfx.sleep();
    }
  });

  folder.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      folder.click();
    }
  });

  /* ============================================================
     17. 菜单栏按钮 / 键盘
     ============================================================ */
  xrayBtn.addEventListener("click", function () {
    audio();
    toggleXray();
  });

  spotBtn.addEventListener("click", function () {
    audio();
    if (!spot.hidden) closeSpotlight();
    else openSpotlight();
  });

  document.getElementById("spotClose").addEventListener("click", closeSpotlight);
  spot.addEventListener("mousedown", function (e) {
    if (e.target === spot) closeSpotlight();
  });

  document.addEventListener("keydown", function (e) {
    var mod = e.metaKey || e.ctrlKey;

    if (mod && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (!spot.hidden) closeSpotlight();
      else openSpotlight();
      return;
    }
    if (mod && (e.key === "x" || e.key === "X")) {
      e.preventDefault();
      toggleXray();
      return;
    }
    if (e.key === "Escape") {
      if (!spot.hidden) { closeSpotlight(); return; }
      if (!winLayer.hidden) { closeApp(); return; }
      if (Store.spotlight) { clearSpotlight(); return; }
      if (Store.state === "awakened") setState("sleeping");
    }
  });

  /* ============================================================
     18. 主题 / 时钟 / 尺寸
     ============================================================ */
  var root = document.documentElement;
  var THEME_KEY = "zzx-theme";
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(th) {
    root.dataset.theme = th;
    if (metaTheme) metaTheme.setAttribute("content", th === "dark" ? "#1D1D1F" : "#F5F5F7");
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
  if (saved !== "dark" && saved !== "light") {
    saved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(saved);

  document.getElementById("themeSw").addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) {}
    sfx.hover();
  });

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

  function measure() {
    Store.w = scene.clientWidth;
    Store.h = scene.clientHeight;
    resizeCanvas();
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      measure();
      if (Store.state !== "sleeping") computeTargets();
    }, 120);
  });

  /* ============================================================
     19. 对外 API（给 apps.js 用）
     ============================================================ */
  window.ZZX = {
    projects: PROJECTS,
    store: Store,
    tone: tone,
    penta: PENTA,
    openApp: openApp,
    closeApp: closeApp,
    toggleXray: toggleXray,
    setExpression: setExpression,
    playNote: function (i) { sfx.pluck(i); },
    copy: function (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(function () {});
      }
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      return Promise.resolve();
    }
  };

  /* ============================================================
     20. 初始化
     ============================================================ */
  measure();
  nodes.forEach(function (n) {
    n.el.style.transform = "translate3d(0,0,0)";
  });
  setState("sleeping");
  scheduleBlink();

  requestAnimationFrame(function (now) {
    lastT = now;
    requestAnimationFrame(loop);
  });

  /* Dock 入场 */
  setTimeout(function () { document.body.classList.add("dock-ready"); }, 260);

  /* 首次交互解锁音频 */
  ["pointerdown", "keydown"].forEach(function (ev) {
    document.addEventListener(ev, function once() {
      audio();
      document.removeEventListener(ev, once);
    }, { once: true });
  });
})();

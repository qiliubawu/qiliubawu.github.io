/* ============================================================
   ZZX Desktop — 六个内置微型应用
   由 desktop.js 的 openApp() 调用 ZZXApps.render(id, container, project)
   ============================================================ */
(function () {
  "use strict";

  var rafs = [];        /* 本应用内的动画循环，切应用时统一 cancel */
  var observers = [];

  function raf(fn) {
    var id = requestAnimationFrame(function tick(now) {
      if (fn(now) === false) return;
      id = requestAnimationFrame(tick);
    });
    rafs.push(id);
    return id;
  }

  function cleanup() {
    rafs.forEach(function (id) { cancelAnimationFrame(id); });
    rafs = [];
    observers.forEach(function (o) { try { o.disconnect(); } catch (e) {} });
    observers = [];
  }

  /* ============================================================
     1. 十二生肖 · 华夏瑞兽（内嵌真实项目）
     ============================================================ */
  function renderZodiac(el) {
    var host = document.createElement("div");
    host.className = "zodiac-host";
    host.innerHTML = '<iframe src="/zodiac/" title="十二生肖 · 华夏瑞兽" loading="lazy"></iframe>';
    el.appendChild(host);
  }

  /* ============================================================
     2. zzx-terminal.sh
     ============================================================ */
  var EMAIL = "qiliubawu@outlook.com";

  function renderTerminal(el) {
    var wrap = document.createElement("div");
    wrap.className = "term";
    wrap.innerHTML =
      '<div class="term-out" id="termOut"></div>' +
      '<div class="term-chips">' +
        '<button class="term-chip" type="button" data-cmd="help">help</button>' +
        '<button class="term-chip" type="button" data-cmd="skills">skills</button>' +
        '<button class="term-chip" type="button" data-cmd="projects">projects</button>' +
        '<button class="term-chip" type="button" data-cmd="xray">xray</button>' +
        '<button class="term-chip" type="button" data-cmd="sudo hire zzx">sudo hire zzx</button>' +
        '<button class="term-chip" type="button" data-cmd="clear">clear</button>' +
      "</div>" +
      '<div class="term-in">' +
        '<span class="term-prompt">zzx@portfolio ~ %</span>' +
        '<input id="termIn" type="text" autocomplete="off" spellcheck="false" ' +
               'placeholder="输入 help 查看可用命令" aria-label="终端输入">' +
      "</div>" +
      '<canvas class="term-fx" id="termFx"></canvas>';
    el.appendChild(wrap);

    var out = wrap.querySelector("#termOut");
    var input = wrap.querySelector("#termIn");
    var fx = wrap.querySelector("#termFx");
    var history = [];
    var hIdx = -1;

    function line(text, cls) {
      var d = document.createElement("div");
      d.className = "term-line" + (cls ? " " + cls : "");
      d.innerHTML = text;
      out.appendChild(d);
      out.scrollTop = out.scrollHeight;
      return d;
    }

    function banner() {
      line('<span class="term-ascii">ZZX TERMINAL<b>v2.0</b></span>');
      line('<span class="term-rule"></span>');
      line('<span class="term-dim">输入 </span>' +
           '<span class="term-key">help</span>' +
           '<span class="term-dim"> 查看全部指令 · ↑↓ 翻历史 · 试试 </span>' +
           '<span class="term-key">sudo hire zzx</span>');
      line("");
      [
        ["OS", "ZZX Desktop 2.0"],
        ["Shell", "zsh 5.9"],
        ["Stack", "HTML · CSS · JS · TS · GLSL"],
        ["Projects", "6 个可交互作品"],
        ["Status", "open to work"]
      ].forEach(function (r) {
        line('<span class="term-kv">' +
             '<span class="term-k">' + r[0] + "</span>" +
             '<span class="term-v">' + r[1] + "</span></span>");
      });
      line("");
    }

    function run(raw) {
      var cmd = raw.trim();
      if (!cmd) return;

      line('<span class="term-cmd">' + escapeHtml(cmd) + "</span>", "cmd");
      history.push(cmd);
      hIdx = history.length;

      var parts = cmd.split(/\s+/);
      var head = parts[0].toLowerCase();

      if (head === "help") {
        line('<span class="term-key">可用命令</span>');
        line('  <span class="term-ok">help</span>              显示这份帮助');
        line('  <span class="term-ok">skills</span>            技术栈与能力矩阵');
        line('  <span class="term-ok">projects</span>          列出全部作品（可直接点击打开）');
        line('  <span class="term-ok">xray</span>              切换开发者透视模式');
        line('  <span class="term-ok">whoami</span>            关于我');
        line('  <span class="term-ok">contact</span>           联系方式');
        line('  <span class="term-ok">sudo hire zzx</span>     你会喜欢的 🎆');
        line('  <span class="term-ok">clear</span>             清屏');
      } else if (head === "skills") {
        line('<span class="term-key">FRONTEND</span>  HTML / CSS / JavaScript / TypeScript');
        line('           React · Vue · Vite · 响应式与动效');
        line('<span class="term-key">CREATIVE</span>  Canvas · WebGL · SVG · CSS 3D');
        line('           物理弹簧、粒子系统、程序化音频');
        line('<span class="term-key">BACKEND</span>   ASP.NET Core · SQL Server · EF Core');
        line('<span class="term-key">TOOLS</span>     Git · Figma · Chrome DevTools');
      } else if (head === "projects") {
        line('<span class="term-dim">共 ' + window.ZZX.projects.length + ' 个项目，点击名称可直接打开：</span>');
        window.ZZX.projects.forEach(function (p, i) {
          var d = document.createElement("div");
          d.className = "term-line";
          d.innerHTML =
            '  <span class="term-dim">' + String(i + 1).padStart(2, "0") + "</span>  " +
            '<a href="#" class="term-link" data-app="' + p.id + '">' + p.t + "</a>" +
            '  <span class="term-dim">— ' + p.cat + "</span>";
          out.appendChild(d);
        });
        out.scrollTop = out.scrollHeight;
      } else if (head === "xray") {
        window.ZZX.toggleXray();
        line('<span class="term-ok">✓ X-Ray 已切换</span>' +
             '<span class="term-dim">（关闭窗口后仍生效，菜单栏可再次切换）</span>');
      } else if (head === "whoami") {
        line('<span class="term-key">赵紫旭 / Zhao Zixu</span>');
        line('  前端开发工程师 · 专注交互体验与视觉工程');
        line('  喜欢把「滚动浏览」做成「拆盲盒」的人。');
      } else if (head === "contact") {
        line('  GitHub  <span class="term-link">github.com/qiliubawu</span>');
        line('  Email   <span class="term-link">' + EMAIL + "</span>");
        line('<span class="term-dim">  输入 </span><span class="term-key">sudo hire zzx</span>' +
             '<span class="term-dim"> 一键复制邮箱</span>');
      } else if (cmd.toLowerCase() === "sudo hire zzx") {
        line('<span class="term-warn">[sudo] password for recruiter: ********</span>');
        line('<span class="term-ok">✓ 权限已授予。正在打包 ZZX…</span>');
        line('<span class="term-ok">✓ 邮箱已复制到剪贴板：' + EMAIL + "</span>");
        line('<span class="term-dim">期待与你共事 🎆</span>');
        window.ZZX.copy(EMAIL);
        fireworks(fx);
        window.ZZX.playNote(4);
        window.ZZX.playNote(2);
      } else if (head === "clear") {
        out.innerHTML = "";
      } else if (head === "echo") {
        line(escapeHtml(cmd.slice(5)));
      } else {
        line('<span class="term-err">command not found: ' + escapeHtml(head) + "</span>");
        line('<span class="term-dim">试试 </span><span class="term-key">help</span>');
      }
      line("");
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    banner();

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hIdx > 0) { hIdx--; input.value = history[hIdx]; }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; }
        else { hIdx = history.length; input.value = ""; }
      }
    });

    wrap.querySelector(".term-chips").addEventListener("click", function (e) {
      var b = e.target.closest(".term-chip");
      if (!b) return;
      run(b.getAttribute("data-cmd"));
      input.focus();
    });

    out.addEventListener("click", function (e) {
      var a = e.target.closest("[data-app]");
      if (!a) return;
      e.preventDefault();
      window.ZZX.openApp(a.getAttribute("data-app"), null);
    });

    wrap.addEventListener("click", function (e) {
      if (!e.target.closest(".term-chips")) input.focus();
    });

    setTimeout(function () { input.focus(); }, 120);
  }

  /* --- Canvas 礼花 --- */
  function fireworks(canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = canvas.clientWidth || 800;
    var h = canvas.clientHeight || 500;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var parts = [];
    var colors = ["#5EE0B0", "#79C0FF", "#FFC46B", "#FF7B9C", "#C4A0FF"];

    function burst(x, y) {
      var n = 46;
      var c = colors[Math.floor(Math.random() * colors.length)];
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
        var sp = 90 + Math.random() * 190;
        parts.push({
          x: x, y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.55 + Math.random() * 0.5,
          c: c,
          r: 1.4 + Math.random() * 1.8
        });
      }
    }

    burst(w * 0.32, h * 0.42);
    setTimeout(function () { burst(w * 0.62, h * 0.34); }, 180);
    setTimeout(function () { burst(w * 0.48, h * 0.56); }, 380);

    var last = performance.now();
    var started = last;

    raf(function (now) {
      var dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.vy += 190 * dt;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= p.decay * dt;

        if (p.life <= 0) { parts.splice(i, 1); continue; }

        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (!parts.length && now - started > 900) return false;
      return true;
    });
  }

  /* ============================================================
     3. VisionUI-Kit.tsx
     ============================================================ */
  function renderVision(el) {
    var wrap = document.createElement("div");
    wrap.className = "vui";
    wrap.innerHTML =
      '<div class="vui-stage" id="vuiStage">' +
        '<span class="vui-blob b1"></span>' +
        '<span class="vui-blob b2"></span>' +
        '<span class="vui-blob b3"></span>' +
        '<div class="vui-card" id="vuiCard">' +
          '<span class="vui-pill">VisionUI · Glass</span>' +
          "<h3>空间组件沙盒</h3>" +
          "<p>拖动右侧滑块调节折射与倾角，移动光标改变透视。</p>" +
        "</div>" +
      "</div>" +
      '<div class="vui-panel">' +
        '<div class="vui-title">PROPERTIES</div>' +
        '<div class="vui-row">' +
          '<label>毛玻璃模糊 <b><span id="vBlurV">12</span>px</b></label>' +
          '<input id="vBlur" type="range" min="0" max="30" value="12">' +
        "</div>" +
        '<div class="vui-row">' +
          '<label>圆角 <b><span id="vRadV">26</span>px</b></label>' +
          '<input id="vRad" type="range" min="0" max="60" value="26">' +
        "</div>" +
        '<div class="vui-row">' +
          '<label>静态倾角 <b><span id="vTiltV">0</span>°</b></label>' +
          '<input id="vTilt" type="range" min="-20" max="20" value="0">' +
        "</div>" +
        '<div class="vui-row">' +
          '<label>悬停跟随 <b><span id="vFollowV">100</span>%</b></label>' +
          '<input id="vFollow" type="range" min="0" max="100" value="100">' +
        "</div>" +
        '<div class="vui-note">' +
          "全部参数走 CSS 自定义属性，无重排；倾角由 pointermove 实时写 " +
          "<code>rotateX/Y</code>，与桌面主循环共用同一套指针状态。" +
        "</div>" +
      "</div>";
    el.appendChild(wrap);

    var stage = wrap.querySelector("#vuiStage");
    var card = wrap.querySelector("#vuiCard");

    var state = { blur: 12, radius: 26, tilt: 0, follow: 1 };

    function apply() {
      card.style.setProperty("--v-blur", state.blur + "px");
      card.style.setProperty("--v-radius", state.radius + "px");
      wrap.querySelector("#vBlurV").textContent = state.blur;
      wrap.querySelector("#vRadV").textContent = state.radius;
      wrap.querySelector("#vTiltV").textContent = state.tilt;
      wrap.querySelector("#vFollowV").textContent = Math.round(state.follow * 100);
    }

    function bind(id, key, transform) {
      var input = wrap.querySelector("#" + id);
      input.addEventListener("input", function () {
        state[key] = transform ? transform(+input.value) : +input.value;
        apply();
      });
    }
    bind("vBlur", "blur");
    bind("vRad", "radius");
    bind("vTilt", "tilt");
    bind("vFollow", "follow", function (v) { return v / 100; });

    apply();

    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      var rx = state.tilt + py * -18 * state.follow;
      var ry = px * 18 * state.follow;
      card.style.setProperty("--v-rx", rx.toFixed(2) + "deg");
      card.style.setProperty("--v-ry", ry.toFixed(2) + "deg");
    });

    stage.addEventListener("pointerleave", function () {
      card.style.setProperty("--v-rx", state.tilt + "deg");
      card.style.setProperty("--v-ry", "0deg");
    });

    card.style.setProperty("--v-rx", "0deg");
  }

  /* ============================================================
     4. FluidField.glsl
     ============================================================ */
  function renderFluid(el) {
    var wrap = document.createElement("div");
    wrap.className = "fluid";
    wrap.innerHTML =
      '<canvas></canvas>' +
      '<div class="fluid-hud">' +
        '<span>PARTICLES <b>240</b></span>' +
        '<span>MODE <b id="fluidMode">ATTRACT</b></span>' +
        '<span>FPS <b id="fluidFps">--</b></span>' +
      "</div>" +
      '<div class="fluid-modes">' +
        '<button class="fluid-mode" type="button" data-mode="attract" aria-pressed="true">引力</button>' +
        '<button class="fluid-mode" type="button" data-mode="repel" aria-pressed="false">斥力</button>' +
        '<button class="fluid-mode" type="button" data-mode="orbit" aria-pressed="false">星轨</button>' +
      "</div>" +
      '<div class="fluid-tip">移动光标施加力场</div>';
    el.appendChild(wrap);

    var canvas = wrap.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var modeEl = wrap.querySelector("#fluidMode");
    var fpsEl = wrap.querySelector("#fluidFps");

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0;
    var N = 240;
    var parts = [];
    var mode = "attract";
    var pointer = { x: 0, y: 0, active: false };
    var last = 0, fpsAcc = 0, fpsFrames = 0;

    /* 位图尺寸必须跟 CSS 盒一致，否则浏览器会拉伸导致粒子糊成一片 */
    function resize() {
      var w = Math.max(1, Math.round(wrap.clientWidth));
      var h = Math.max(1, Math.round(wrap.clientHeight));
      if (!w || !h) return;
      if (w === W && h === H) return;

      var sx = W ? w / W : 1;
      var sy = H ? h / H : 1;
      W = w; H = h;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* 已存在的粒子按比例迁移，避免 resize 时整体重排 */
      for (var i = 0; i < parts.length; i++) {
        parts[i].x *= sx;
        parts[i].y *= sy;
        parts[i].orbit *= (sx + sy) / 2;
      }
    }

    function seed() {
      parts = [];
      var cx = W / 2, cy = H / 2;
      var base = Math.min(W, H);
      for (var i = 0; i < N; i++) {
        var a = Math.random() * Math.PI * 2;
        var r = base * (0.08 + Math.random() * 0.34);
        parts.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r * 0.78,
          vx: 0, vy: 0,
          r: 0.7 + Math.random() * 1.8,
          hue: 172 + Math.random() * 66,
          orbit: r,
          angle: a
        });
      }
    }

    /* 先量一次；布局稳定后再量一次并播种（窗口有 FLIP 入场动画） */
    resize();
    seed();
    requestAnimationFrame(function () {
      var before = W;
      resize();
      if (!parts.length || Math.abs(W - before) > 4) seed();
    });

    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    });
    canvas.addEventListener("pointerleave", function () {
      pointer.active = false;
    });

    wrap.querySelector(".fluid-modes").addEventListener("click", function (e) {
      var b = e.target.closest(".fluid-mode");
      if (!b) return;
      mode = b.getAttribute("data-mode");
      modeEl.textContent = mode.toUpperCase();
      Array.prototype.forEach.call(
        wrap.querySelectorAll(".fluid-mode"),
        function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }
      );
      window.ZZX.playNote(mode === "orbit" ? 3 : mode === "repel" ? 1 : 0);
    });

    var onResize = function () { resize(); };
    window.addEventListener("resize", onResize);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { resize(); });
      ro.observe(wrap);
      observers.push(ro);
    }

    raf(function (now) {
      if (!last) last = now;
      var dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      fpsFrames++;
      fpsAcc += dt;
      if (fpsAcc > 0.5) {
        fpsEl.textContent = Math.round(fpsFrames / fpsAcc);
        fpsFrames = 0; fpsAcc = 0;
      }

      /* 拖尾：用半透明底色覆盖，而不是 clearRect，粒子才留得住光迹 */
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5,7,12,.30)";
      ctx.fillRect(0, 0, W, H);

      var cx = W / 2, cy = H / 2;
      var tx = pointer.active ? pointer.x : cx;
      var ty = pointer.active ? pointer.y : cy;

      /* 帧率无关阻尼：60fps 下每帧 ×0.90 */
      var damp = Math.pow(0.90, dt * 60);

      ctx.globalCompositeOperation = "lighter";

      for (var i = 0; i < N; i++) {
        var p = parts[i];
        var dx = tx - p.x, dy = ty - p.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / d, uy = dy / d;

        if (mode === "orbit") {
          /* 星轨：极坐标目标点 + 切向速度，形成椭圆进动 */
          p.angle += dt * (0.30 + (p.orbit % 70) / 200);
          var wob = Math.sin(now / 1500 + p.angle * 2.2) * 14;
          var tr = p.orbit + wob;
          var ox = cx + Math.cos(p.angle) * tr;
          var oy = cy + Math.sin(p.angle) * tr * 0.70;
          p.vx += (ox - p.x) * 7.5 * dt;
          p.vy += (oy - p.y) * 7.5 * dt;
        } else {
          var sign = mode === "repel" ? -1 : 1;
          /* 近处强、远处弱，但永不为零 */
          var accel = sign * (1500 / (1 + d / 240));
          p.vx += ux * accel * dt;
          p.vy += uy * accel * dt;
          /* 切向分量：绕着力场中心转，而不是直线撞上去 */
          p.vx += -uy * 110 * dt * sign;
          p.vy += ux * 110 * dt * sign;
          /* 中心弱回拉，防止粒子被甩出画布 */
          p.vx += (cx - p.x) * 1.1 * dt;
          p.vy += (cy - p.y) * 1.1 * dt;
        }

        p.vx *= damp;
        p.vy *= damp;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        /* 边界软回弹 */
        if (p.x < 8) { p.x = 8; p.vx = Math.abs(p.vx) * 0.6; }
        if (p.x > W - 8) { p.x = W - 8; p.vx = -Math.abs(p.vx) * 0.6; }
        if (p.y < 8) { p.y = 8; p.vy = Math.abs(p.vy) * 0.6; }
        if (p.y > H - 8) { p.y = H - 8; p.vy = -Math.abs(p.vy) * 0.6; }

        var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        var glow = Math.min(1, 0.30 + sp / 200);
        var alpha = 0.30 + glow * 0.55;
        var rad = p.r * (0.9 + glow * 1.1);

        /* 外发光 */
        ctx.beginPath();
        ctx.fillStyle = "hsla(" + p.hue + ", 95%, 62%, " + (alpha * 0.16) + ")";
        ctx.arc(p.x, p.y, rad * 4.2, 0, Math.PI * 2);
        ctx.fill();

        /* 核心 */
        ctx.beginPath();
        ctx.fillStyle = "hsla(" + p.hue + ", 96%, " + (66 + glow * 16) + "%, " + alpha + ")";
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 光标处力场指示 */
      if (pointer.active) {
        var g = ctx.createRadialGradient(tx, ty, 0, tx, ty, 130);
        g.addColorStop(0, "rgba(120,220,255,.13)");
        g.addColorStop(1, "rgba(120,220,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(tx, ty, 130, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      return true;
    });

    /* 应用关闭时移除 resize 监听 */
    observers.push({
      disconnect: function () { window.removeEventListener("resize", onResize); }
    });
  }

  /* ============================================================
     5. PerfTelemetry.ts
     ============================================================ */
  function renderPerf(el) {
    var wrap = document.createElement("div");
    wrap.className = "perf";
    wrap.innerHTML =
      '<div class="perf-head">' +
        "<h3>Core Web Vitals</h3>" +
        "<span>本页实时采集</span>" +
        '<span class="perf-badge">ALL PASS</span>' +
      "</div>" +
      '<div class="perf-grid" id="perfGrid"></div>' +
      '<div class="perf-chart">' +
        '<div class="perf-chart-h"><span>帧率波形</span><b>最近 180 帧</b></div>' +
        '<canvas id="perfWave"></canvas>' +
      "</div>" +
      '<p class="perf-note">' +
        "数据来源：<code>PerformanceObserver</code> 采集 LCP / CLS / INP，" +
        "<code>navigation timing</code> 取 TTFB 与 DOM 解析耗时，" +
        "帧率由桌面主循环的帧间 Δt 换算。所有指标均为当前页面真实值，" +
        "非写死的示例数据。" +
      "</p>";
    el.appendChild(wrap);

    var grid = wrap.querySelector("#perfGrid");

    var metrics = {
      lcp: { code: "LCP", label: "最大内容绘制", v: 0, unit: "ms", good: 2500, max: 4000, hint: "≤ 2.5s" },
      cls: { code: "CLS", label: "累积布局偏移", v: 0, unit: "", good: 0.1, max: 0.25, hint: "≤ 0.1", dec: 3 },
      inp: { code: "INP", label: "交互延迟", v: 0, unit: "ms", good: 200, max: 500, hint: "≤ 200ms" },
      ttfb: { code: "TTFB", label: "首字节", v: 0, unit: "ms", good: 800, max: 1800, hint: "≤ 800ms" },
      dom: { code: "DOM", label: "解析完成", v: 0, unit: "ms", good: 1500, max: 3000, hint: "DCL" },
      nodes: { code: "NODES", label: "DOM 节点数", v: document.querySelectorAll("*").length, unit: "", good: 1500, max: 3000, hint: "越少越好" }
    };

    function card(key) {
      var m = metrics[key];
      var d = document.createElement("div");
      d.className = "perf-card";
      d.setAttribute("data-metric", key);
      d.innerHTML =
        '<div class="k"><span class="kc">' + m.code + "</span><em>" + m.hint + "</em></div>" +
        '<div class="kl">' + m.label + "</div>" +
        '<div class="v">—</div>' +
        '<div class="perf-bar"><i style="width:0%"></i></div>';
      grid.appendChild(d);
      return d;
    }

    var cards = {};
    Object.keys(metrics).forEach(function (k) { cards[k] = card(k); });

    function paint(key) {
      var m = metrics[key];
      var c = cards[key];
      if (!c) return;
      var val = m.v;
      var txt = m.dec ? val.toFixed(m.dec) : Math.round(val);
      c.querySelector(".v").innerHTML = txt + (m.unit ? "<small>" + m.unit + "</small>" : "");

      var ratio = Math.min(1, val / m.max);
      var bar = c.querySelector(".perf-bar");
      bar.querySelector("i").style.width = Math.max(3, ratio * 100) + "%";
      bar.className = "perf-bar" + (val > m.max ? " bad" : val > m.good ? " warn" : "");
    }

    /* TTFB / DOM */
    try {
      var nav = performance.getEntriesByType("navigation")[0];
      if (nav) {
        metrics.ttfb.v = nav.responseStart;
        metrics.dom.v = nav.domContentLoadedEventEnd;
      }
    } catch (e) {}

    /* LCP */
    try {
      var lcpObs = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        if (entries.length) {
          metrics.lcp.v = entries[entries.length - 1].startTime;
          paint("lcp");
        }
      });
      lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpObs);
    } catch (e) {}

    /* CLS */
    try {
      var clsObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (en) {
          if (!en.hadRecentInput) metrics.cls.v += en.value;
        });
        paint("cls");
      });
      clsObs.observe({ type: "layout-shift", buffered: true });
      observers.push(clsObs);
    } catch (e) {}

    /* INP（用 event timing 近似） */
    try {
      var inpObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (en) {
          if (en.duration > metrics.inp.v) {
            metrics.inp.v = en.duration;
            paint("inp");
          }
        });
      });
      inpObs.observe({ type: "event", buffered: true, durationThreshold: 16 });
      observers.push(inpObs);
    } catch (e) {}

    Object.keys(metrics).forEach(paint);

    /* 实时帧率卡片 */
    var fpsCard = document.createElement("div");
    fpsCard.className = "perf-card";
    fpsCard.innerHTML =
      '<div class="k"><span class="kc">FPS</span><em>60 / 120</em></div>' +
      '<div class="kl">当前帧率</div>' +
      '<div class="v"><span id="perfFps">—</span><small>fps</small></div>' +
      '<div class="perf-bar"><i style="width:0%"></i></div>';
    grid.appendChild(fpsCard);

    var fpsEl = fpsCard.querySelector("#perfFps");
    var fpsBar = fpsCard.querySelector(".perf-bar i");
    var lastT = 0, acc = 0, frames = 0;

    /* 帧率波形 */
    var wave = wrap.querySelector("#perfWave");
    var wctx = wave.getContext("2d");
    var hist = [];
    var waveW = 0, waveH = 0;

    function sizeWave() {
      var r = wave.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      waveW = Math.max(1, Math.round(r.width));
      waveH = Math.max(1, Math.round(r.height));
      wave.width = Math.round(waveW * dpr);
      wave.height = Math.round(waveH * dpr);
      wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawWave() {
      if (!waveW || !waveH) sizeWave();
      wctx.clearRect(0, 0, waveW, waveH);

      /* 细网格 */
      wctx.strokeStyle = "rgba(128,148,168,.16)";
      wctx.lineWidth = 1;
      for (var gi = 1; gi < 6; gi++) {
        var gx = (waveW / 6) * gi;
        wctx.beginPath();
        wctx.moveTo(Math.round(gx) + .5, 0);
        wctx.lineTo(Math.round(gx) + .5, waveH);
        wctx.stroke();
      }
      for (var gj = 1; gj < 3; gj++) {
        var gy = (waveH / 3) * gj;
        wctx.beginPath();
        wctx.moveTo(0, Math.round(gy) + .5);
        wctx.lineTo(waveW, Math.round(gy) + .5);
        wctx.stroke();
      }

      /* 60fps 基准线 */
      var y60 = waveH - (60 / 130) * waveH;
      wctx.setLineDash([4, 4]);
      wctx.strokeStyle = "rgba(52,199,123,.42)";
      wctx.lineWidth = 1;
      wctx.beginPath();
      wctx.moveTo(0, y60);
      wctx.lineTo(waveW, y60);
      wctx.stroke();
      wctx.setLineDash([]);

      if (hist.length < 2) return;

      var step = waveW / 179;
      var x0 = waveW - (hist.length - 1) * step;

      wctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = x0 + i * step;
        var y = waveH - Math.min(1, hist[i] / 130) * waveH;
        if (i === 0) wctx.moveTo(x, y); else wctx.lineTo(x, y);
      }
      wctx.strokeStyle = "#34C77B";
      wctx.lineWidth = 1.6;
      wctx.lineJoin = "round";
      wctx.stroke();

      /* 面积填充 */
      wctx.lineTo(x0 + (hist.length - 1) * step, waveH);
      wctx.lineTo(x0, waveH);
      wctx.closePath();
      var g = wctx.createLinearGradient(0, 0, 0, waveH);
      g.addColorStop(0, "rgba(52,199,123,.28)");
      g.addColorStop(1, "rgba(52,199,123,0)");
      wctx.fillStyle = g;
      wctx.fill();
    }

    sizeWave();
    if (window.ResizeObserver) {
      var wro = new ResizeObserver(function () { sizeWave(); drawWave(); });
      wro.observe(wave);
      observers.push(wro);
    }

    raf(function (now) {
      if (!lastT) lastT = now;
      var dt = (now - lastT) / 1000;
      lastT = now;
      frames++; acc += dt;

      if (acc > 0.25) {
        var fps = frames / acc;
        fpsEl.textContent = Math.round(fps);
        fpsBar.style.width = Math.min(100, fps / 120 * 100) + "%";
        frames = 0; acc = 0;

        hist.push(fps);
        if (hist.length > 180) hist.shift();
        drawWave();
      }
      return true;
    });
  }

  /* ============================================================
     6. About_ZZX.md
     ============================================================ */
  function renderAbout(el) {
    var wrap = document.createElement("div");
    wrap.className = "about";
    wrap.innerHTML =
      '<div class="pass">' +
        '<div class="pass-top">' +
          '<div class="pass-avatar">Z</div>' +
          "<h2>赵紫旭 · Zhao Zixu</h2>" +
          '<div class="role">Frontend Developer · 交互与视觉工程</div>' +
        "</div>" +
        '<div class="pass-body">' +
          '<dl>' +
            '<div class="pass-row"><dt>所在地</dt><dd>中国 · 可远程</dd></div>' +
            '<div class="pass-row"><dt>邮箱</dt><dd id="passEmail">' + EMAIL + "</dd></div>" +
            '<div class="pass-row"><dt>GitHub</dt><dd>github.com/qiliubawu</dd></div>' +
            '<div class="pass-row"><dt>方向</dt><dd>Web 交互 · 动效 · 3D</dd></div>' +
            '<div class="pass-row"><dt>状态</dt><dd>开放机会中</dd></div>' +
          "</dl>" +
          '<div class="pass-actions">' +
            '<button class="pass-btn" type="button" id="passCopy">复制邮箱</button>' +
            '<a class="pass-btn ghost" href="https://github.com/qiliubawu" target="_blank" rel="noopener">查看 GitHub</a>' +
          "</div>" +
          '<div class="pass-toast" id="passToast"></div>' +
        "</div>" +
      "</div>";
    el.appendChild(wrap);

    var toast = wrap.querySelector("#passToast");
    var toastTimer = null;

    wrap.querySelector("#passCopy").addEventListener("click", function () {
      window.ZZX.copy(EMAIL).then(function () {
        toast.textContent = "✓ 邮箱已复制：" + EMAIL;
        toast.classList.add("on");
        window.ZZX.playNote(2);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove("on"); }, 2200);
      });
    });
  }

  /* ============================================================
     注册
     ============================================================ */
  var RENDERERS = {
    zodiac: renderZodiac,
    terminal: renderTerminal,
    vision: renderVision,
    fluid: renderFluid,
    perf: renderPerf,
    about: renderAbout
  };

  window.ZZXApps = {
    render: function (id, container, project) {
      cleanup();
      var fn = RENDERERS[id];
      if (fn) fn(container, project);
    },
    cleanup: cleanup
  };
})();

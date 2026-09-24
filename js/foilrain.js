/* Фольга в разделе с пакетами: падает по краям, копится кучками внизу,
   от пальца или мыши разлетается. Центр раздела не задевает, чтобы не мешать чтению.
   При включённом «уменьшить движение» в системе не запускается. */
(function () {
  "use strict";

  var cv = document.getElementById("foilrain");
  if (!cv || !cv.getContext) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var host = cv.parentElement;
  var ctx = cv.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var W = 0, H = 0;
  var band = 0;          // ширина боковой полосы, где падает фольга
  var BIN = 13;          // ширина ячейки, в которой копится кучка
  var bins = [];
  var drifts = [];       // места, куда сыплется фольга: из них вырастают кучки
  var parts = [];
  var running = false, raf = 0, last = 0, since = 0;

  var COLORS = ["#FFCB2E", "#FF7A45", "#E4DCEF", "#9FD7FF", "#FF9CC8", "#C8B6FF", "#FFE8A3", "#B8F0D6"];
  var FLOOR = 28;        // отступ кучек от нижнего края раздела
  var STACK = 3.4;       // насколько подрастает кучка от одной чешуйки
  var STACK_MAX = 58;

  function size() {
    var r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    band = Math.max(56, Math.min(190, W * 0.15));
    drifts = [band * 0.3, band * 0.74, W - band * 0.74, W - band * 0.3];
    bins = new Array(Math.ceil(W / BIN) + 1).join(",").split(",").map(function () { return 0; });
    parts.length = 0;
  }

  function limit() {
    return W < 560 ? 84 : 170;
  }

  function born() {
    // сыплется не равномерно, а вокруг нескольких мест: так внизу вырастают кучки
    var c = drifts[(Math.random() * drifts.length) | 0];
    var spread = (Math.random() + Math.random() + Math.random() - 1.5) * 17;
    var x = Math.max(6, Math.min(W - 6, c + spread));
    return {
      x: x,
      y: -14 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.7 + Math.random() * 1.1,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 11,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.16,
      flip: Math.random() * 6.28,
      fs: 0.06 + Math.random() * 0.09,
      sway: 0.6 + Math.random() * 1.2,
      ph: Math.random() * 6.28,
      down: false,      // легла в кучку
      bin: -1,
      life: 0
    };
  }

  function settle(p) {
    var bin = Math.max(0, Math.min(bins.length - 1, Math.round(p.x / BIN)));
    var left = bin > 0 ? bins[bin - 1] : Infinity;
    var right = bin < bins.length - 1 ? bins[bin + 1] : Infinity;
    if (left < bins[bin] - STACK * 2 && left <= right) bin -= 1;
    else if (right < bins[bin] - STACK * 2) bin += 1;
    var stack = Math.min(bins[bin], STACK_MAX);
    p.down = true;
    p.bin = bin;
    p.x = bin * BIN + (Math.random() - 0.5) * BIN;
    p.y = H - FLOOR - stack - p.h * 0.3;
    p.vx = 0; p.vy = 0; p.vr = 0;
    p.rot = (Math.random() - 0.5) * 0.5;
    p.flat = 0.55 + Math.random() * 0.45;
    bins[bin] = stack + STACK;
  }

  function lift(p, vx, vy) {
    if (p.bin >= 0) bins[p.bin] = Math.max(0, bins[p.bin] - STACK);
    p.down = false;
    p.bin = -1;
    p.vx = vx;
    p.vy = vy;
    p.vr = (Math.random() - 0.5) * 0.45;
  }

  /* Разгрести кучку: чешуйки рядом с пальцем подлетают в сторону от него. */
  function sweep(cx, cy) {
    var r = 78, r2 = r * r, n = 0;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p.down) continue;
      var dx = p.x - cx, dy = p.y - cy;
      var d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      var d = Math.sqrt(d2) || 1;
      var force = (1 - d / r) * 9;
      lift(p, (dx / d) * force + (Math.random() - 0.5) * 2, -Math.abs(force) * 0.65 - Math.random() * 2.5);
      if (++n > 26) break;
    }
    if (n) start();
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    var w = p.down ? p.w * p.flat : p.w * Math.abs(Math.cos(p.flip + p.life * p.fs));
    var h = p.down ? p.h * 0.55 : p.h;
    ctx.fillStyle = p.color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(-w / 2, -h / 2, w, h * 0.3);
    ctx.restore();
  }

  function tick(now) {
    if (!running) return;
    var dt = Math.min(48, now - last || 16) / 16.67;
    last = now;
    ctx.clearRect(0, 0, W, H);

    since += dt;
    if (since > 7 && parts.length < limit()) {
      since = 0;
      parts.push(born());
    }

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life += dt;

      if (!p.down) {
        p.vy += 0.055 * dt;
        p.vx *= 0.995;
        p.x += (p.vx + Math.sin(p.life * 0.035 + p.ph) * p.sway * 0.35) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        if (p.x < -30 || p.x > W + 30) { parts.splice(i, 1); continue; }
        if (p.y >= H - FLOOR - p.h * 0.3) settle(p);
      }

      draw(p);
    }

    // лишние чешуйки внизу убираем, чтобы кучки не росли без конца
    if (parts.length > limit()) {
      for (var j = 0; j < parts.length && parts.length > limit(); j++) {
        if (parts[j].down) {
          if (parts[j].bin >= 0) bins[parts[j].bin] = Math.max(0, bins[parts[j].bin] - STACK);
          parts.splice(j, 1);
          j--;
        }
      }
    }

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function at(ev) {
    var r = cv.getBoundingClientRect();
    sweep(ev.clientX - r.left, ev.clientY - r.top);
  }

  size();

  host.addEventListener("pointermove", at);
  host.addEventListener("pointerdown", at);

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(size, 200);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) start(); else stop();
    }, { threshold: 0 }).observe(host);
  } else {
    start();
  }
})();

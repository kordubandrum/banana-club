/* Мыльные пузыри в первом экране.
   Всплывают по всей площади раздела, лопаются от щелчка или касания.
   При включённом «уменьшить движение» в системе не запускаются. */
(function () {
  "use strict";

  var cv = document.getElementById("bubbles");
  if (!cv || !cv.getContext) return;

  var slow = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (slow) return;

  var ctx = cv.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var bubbles = [];
  var pops = [];
  var running = false;
  var raf = 0;

  function size() {
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function make(atBottom) {
    // на узком экране пузыри мельче, чтобы не мешали читать заголовок
    var maxR = Math.max(20, Math.min(46, W * 0.075));
    var r = 10 + Math.random() * maxR;
    return {
      x: r + Math.random() * Math.max(1, W - r * 2),
      y: atBottom ? H + r + Math.random() * H * 0.5 : Math.random() * H,
      r: r,
      vy: 0.16 + Math.random() * 0.34 + Math.max(0, 44 - r) * 0.004,
      drift: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      wob: 0.006 + Math.random() * 0.008,
      hue: Math.random() * 360,
      a: 0.34 + Math.random() * 0.3
    };
  }

  function fill(n) {
    bubbles = [];
    for (var i = 0; i < n; i++) bubbles.push(make(false));
  }

  function count() {
    var n = Math.round((W * H) / 52000);
    return Math.max(8, Math.min(26, n));
  }

  function drawBubble(b) {
    var x = b.x + Math.sin(b.phase) * b.drift * 9;
    var y = b.y;

    // тело пузыря: почти прозрачное, с тёплым ободком
    var g = ctx.createRadialGradient(x - b.r * 0.3, y - b.r * 0.35, b.r * 0.1, x, y, b.r);
    g.addColorStop(0, "rgba(255,255,255," + (0.05 * b.a) + ")");
    g.addColorStop(0.62, "rgba(255,246,227," + (0.015 * b.a) + ")");
    g.addColorStop(0.88, "rgba(255,203,46," + (0.2 * b.a) + ")");
    g.addColorStop(0.97, "rgba(160,215,255," + (0.3 * b.a) + ")");
    g.addColorStop(1, "rgba(255,255,255," + (0.6 * b.a) + ")");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // радужная кромка
    ctx.strokeStyle = "hsla(" + ((b.hue + b.phase * 24) % 360) + ",95%,82%," + (0.75 * b.a) + ")";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // блик
    ctx.fillStyle = "rgba(255,255,255," + (0.75 * b.a) + ")";
    ctx.beginPath();
    ctx.ellipse(x - b.r * 0.34, y - b.r * 0.4, b.r * 0.17, b.r * 0.11, -0.7, 0, Math.PI * 2);
    ctx.fill();

    b.sx = x;
  }

  function drawPop(p) {
    var t = p.t / p.life;
    var r = p.r * (1 + t * 0.85);
    ctx.strokeStyle = "rgba(255,246,227," + (0.55 * (1 - t)) + ")";
    ctx.lineWidth = 2 * (1 - t) + 0.4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.stroke();

    for (var i = 0; i < 6; i++) {
      var a = p.seed + i * Math.PI / 3;
      var d = r * (0.85 + t * 0.5);
      ctx.fillStyle = "rgba(255,203,46," + (0.5 * (1 - t)) + ")";
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 1.8 * (1 - t) + 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var last = 0;
  function frame(now) {
    if (!running) return;
    var dt = Math.min(48, now - last || 16) / 16.67;
    last = now;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.y -= b.vy * dt;
      b.phase += b.wob * dt;
      if (b.y + b.r < -10) bubbles[i] = make(true);
      drawBubble(b);
    }

    for (var j = pops.length - 1; j >= 0; j--) {
      pops[j].t += dt;
      if (pops[j].t >= pops[j].life) pops.splice(j, 1);
      else drawPop(pops[j]);
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  function pop(ev) {
    var r = cv.getBoundingClientRect();
    var px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
    var py = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
    for (var i = bubbles.length - 1; i >= 0; i--) {
      var b = bubbles[i];
      var dx = px - (b.sx != null ? b.sx : b.x), dy = py - b.y;
      if (dx * dx + dy * dy <= b.r * b.r * 1.25) {
        pops.push({ x: b.sx != null ? b.sx : b.x, y: b.y, r: b.r, t: 0, life: 22, seed: Math.random() * 6.28 });
        bubbles[i] = make(true);
        return;
      }
    }
  }

  size();
  fill(count());

  var host = cv.parentElement || cv;
  host.addEventListener("pointerdown", pop);

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { size(); fill(count()); }, 180);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) start(); else stop();
    }, { threshold: 0 }).observe(cv);
  } else {
    start();
  }
})();

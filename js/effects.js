/* Эффекты выбора шоу: лопающийся мыльный пузырь и разлетающаяся фольга.
   Рисуются на одном прозрачном слое поверх страницы.
   При включённом «уменьшить движение» в системе не запускаются. */
(function () {
  "use strict";

  var slow = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cv, ctx, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var parts = [];
  var rings = [];
  var raf = 0, last = 0;

  function build() {
    cv = document.createElement("canvas");
    cv.id = "fx";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    ctx = cv.getContext("2d");
    size();
    window.addEventListener("resize", size);
  }

  function size() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function run() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    var dt = Math.min(48, now - last || 16) / 16.67;
    last = now;
    ctx.clearRect(0, 0, W, H);

    var i;
    for (i = rings.length - 1; i >= 0; i--) {
      var r = rings[i];
      r.t += dt;
      if (r.t >= r.life) { rings.splice(i, 1); continue; }
      var k = r.t / r.life;
      ctx.strokeStyle = "rgba(120,190,255," + (0.85 * (1 - k)) + ")";
      ctx.lineWidth = 3.4 * (1 - k) + 0.8;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.rx * (1 + k * 0.35), r.ry * (1 + k * 0.35), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,156,200," + (0.6 * (1 - k)) + ")";
      ctx.lineWidth = 1.8 * (1 - k);
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.rx * (1 + k * 0.5), r.ry * (1 + k * 0.5), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.t += dt;
      if (p.t >= p.life || p.y > H + 60) { parts.splice(i, 1); continue; }
      p.vy += p.g * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      var fade = p.t > p.life - 18 ? (p.life - p.t) / 18 : 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === "drop") {
        ctx.globalAlpha = 0.9 * fade;
        var g = ctx.createRadialGradient(-p.r * .3, -p.r * .35, p.r * .1, 0, 0, p.r);
        g.addColorStop(0, "rgba(255,255,255,.95)");
        g.addColorStop(.6, "rgba(168,214,255,.55)");
        g.addColorStop(1, "rgba(255,168,210,.7)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(90,160,235," + (0.75 * fade) + ")";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      } else {
        // чешуйка фольги: вращение имитируем сжатием по ширине
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        var w = p.w * Math.abs(Math.cos(p.flip + p.t * p.fs));
        ctx.fillRect(-w / 2, -p.h / 2, w, p.h);
        ctx.globalAlpha = fade * 0.5;
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.fillRect(-w / 2, -p.h / 2, w, p.h * 0.28);
      }
      ctx.restore();
    }

    if (parts.length || rings.length) {
      raf = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, W, H);
      raf = 0;
    }
  }

  var FOIL = ["#FFCB2E", "#FF7A45", "#E9E4F0", "#9FD7FF", "#FF9CC8", "#C8B6FF", "#FFE8A3"];

  var api = {
    /* Пузырь лопнул: кольцо-оболочка и разлетающиеся капли. */
    pop: function (box) {
      if (slow) return;
      var x = box.left + box.width / 2;
      var y = box.top + box.height / 2;
      var rx = box.width / 2, ry = box.height / 2;
      rings.push({ x: x, y: y, rx: rx, ry: ry, t: 0, life: 26 });
      var n = 26;
      for (var i = 0; i < n; i++) {
        var a = (Math.PI * 2 * i) / n + Math.random() * 0.25;
        var sp = 3 + Math.random() * 6;
        parts.push({
          kind: "drop",
          x: x + Math.cos(a) * rx * 0.94,
          y: y + Math.sin(a) * ry * 0.94,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1.5,
          g: 0.22, drag: 0.985,
          r: 3 + Math.random() * 6,
          rot: 0, vr: 0,
          t: 0, life: 52 + Math.random() * 26
        });
      }
      run();
    },

    /* Фольгированное шоу: чешуйки вылетают вверх и оседают. */
    foil: function (box) {
      if (slow) return;
      var x = box.left + box.width / 2;
      var y = box.top + box.height * 0.45;
      for (var i = 0; i < 90; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.5;
        var sp = 5 + Math.random() * 11;
        parts.push({
          kind: "foil",
          x: x + (Math.random() - 0.5) * box.width * 0.5,
          y: y + (Math.random() - 0.5) * box.height * 0.3,
          vx: Math.cos(a) * sp * 0.75,
          vy: Math.sin(a) * sp,
          g: 0.3, drag: 0.992,
          w: 5 + Math.random() * 8,
          h: 8 + Math.random() * 12,
          color: FOIL[(Math.random() * FOIL.length) | 0],
          rot: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.3,
          flip: Math.random() * 6.28,
          fs: 0.08 + Math.random() * 0.1,
          t: 0, life: 110 + Math.random() * 60
        });
      }
      run();
    }
  };

  if (!slow) build();
  window.BananaFX = api;
})();

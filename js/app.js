(function () {
  "use strict";

  var C = window.BANANA;
  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = "banana-cart-v1";

  var state = { pkg: null, hours: 0, chars: [], shows: [], date: null, start: null };
  var busy = {};          // { "2026-09-27": [[600, 780], ...] } минуты от полуночи
  var busyLoaded = false;

  /* ---------- помощники ---------- */

  function money(n) { return n.toLocaleString("ru-RU") + " ₽"; }
  function hoursWord(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return "час";
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "часа";
    return "часов";
  }
  function hm(min) { var h = Math.floor(min / 60), m = min % 60; return h + ":" + (m < 10 ? "0" : "") + m; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function rate(h) { return h >= C.longFrom ? C.hourPriceLong : C.hourPrice; }
  function pkg() { return state.pkg ? byId(C.packages, state.pkg) : null; }
  function totalHours() { var p = pkg(); return p ? p.hours + state.hours : state.hours; }
  function separatePrice(p) {
    var s = p.hours * rate(p.hours) + p.animators * C.animatorPrice;
    p.shows.forEach(function (id) { s += byId(C.shows, id).price; });
    return s;
  }
  function inPkgShow(id) { var p = pkg(); return !!p && p.shows.indexOf(id) >= 0; }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ pkg: state.pkg, hours: state.hours, chars: state.chars, shows: state.shows })); } catch (e) {}
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!s) return;
      state.pkg = byId(C.packages, s.pkg) ? s.pkg : null;
      state.hours = Math.max(0, Math.min(C.maxHours, s.hours | 0));
      state.chars = (s.chars || []).filter(function (id) { return byId(C.characters, id); });
      state.shows = (s.shows || []).filter(function (id) { return byId(C.shows, id); });
    } catch (e) {}
  }

  /* ---------- корзина ---------- */

  function cartLines() {
    var lines = [], p = pkg(), total = 0;
    if (p) {
      lines.push({ name: "Пакет «" + p.name + "», " + p.hours + " " + hoursWord(p.hours), price: p.price, rm: "pkg" });
      total += p.price;
      if (state.hours) {
        lines.push({ name: "Дополнительно " + state.hours + " " + hoursWord(state.hours), price: state.hours * C.hourPriceLong, rm: "hours" });
        total += state.hours * C.hourPriceLong;
      }
    } else if (state.hours) {
      var r = rate(state.hours);
      lines.push({ name: "Зал, " + state.hours + " " + hoursWord(state.hours) + " по " + money(r), price: state.hours * r, rm: "hours" });
      total += state.hours * r;
    }
    state.chars.forEach(function (id, i) {
      var c = byId(C.characters, id), included = p && i < p.animators;
      lines.push({ name: "Аниматор: " + c.name, price: included ? 0 : C.animatorPrice, from: !included, inpkg: included, rm: "char:" + id });
      if (!included) total += C.animatorPrice;
    });
    if (p && state.chars.length < p.animators) {
      lines.push({ name: "Аниматор: персонажа выберем по телефону", price: 0, inpkg: true });
    }
    state.shows.forEach(function (id) {
      if (inPkgShow(id)) return;
      var s = byId(C.shows, id);
      lines.push({ name: s.name, price: s.price, rm: "show:" + id });
      total += s.price;
    });
    return { lines: lines, total: total };
  }

  function hasAnything() { return !!state.pkg || state.hours > 0 || state.chars.length > 0 || state.shows.length > 0; }

  function removeItem(key) {
    if (key === "pkg") { state.pkg = null; state.hours = 0; }
    else if (key === "hours") state.hours = 0;
    else if (key.indexOf("char:") === 0) state.chars.splice(state.chars.indexOf(key.slice(5)), 1);
    else if (key.indexOf("show:") === 0) state.shows.splice(state.shows.indexOf(key.slice(5)), 1);
    changed();
  }

  function renderCart() {
    var box = $("cart-box"), cart = cartLines();
    box.innerHTML = "";
    if (!hasAnything()) {
      var e = el("div", "cart-empty");
      e.appendChild(el("h3", null, "Праздник пока пустой"));
      e.appendChild(el("p", null, "Выберите пакет или соберите праздник сами, и здесь появится сумма."));
      var a = el("a", "btn btn-banana", "Выбрать пакет"); a.href = "#packages"; e.appendChild(a);
      box.appendChild(e);
    } else {
      box.appendChild(el("h3", null, "Ваш праздник"));
      var ul = el("ul", "cart-lines");
      cart.lines.forEach(function (l) {
        var li = el("li");
        var left = el("span", null, esc(l.name));
        if (l.rm) {
          var x = el("button", "x", "убрать"); x.type = "button";
          x.setAttribute("aria-label", "Убрать: " + l.name);
          x.addEventListener("click", function () { removeItem(l.rm); });
          left.appendChild(document.createTextNode(" ")); left.appendChild(x);
        }
        li.appendChild(left);
        li.appendChild(l.inpkg ? el("span", "inpkg", "в пакете") : el("span", null, (l.from ? "от " : "") + money(l.price)));
        ul.appendChild(li);
      });
      box.appendChild(ul);
      var t = el("div", "cart-total");
      t.appendChild(el("span", null, "Итого"));
      t.appendChild(el("strong", null, (state.chars.length ? "от " : "") + money(cart.total)));
      box.appendChild(t);
      if (totalHours() === 0) {
        box.appendChild(el("p", "cart-warn", "Добавьте часы аренды зала или выберите пакет, чтобы выбрать время."));
      } else {
        box.appendChild(el("p", "cart-note", "Праздник идёт " + totalHours() + " " + hoursWord(totalHours()) + ". Итоговую сумму администратор подтвердит по телефону."));
      }
    }

    var bar = $("cartbar");
    var was = $("cartbar-total").textContent;
    var now = (state.chars.length ? "от " : "") + money(cart.total);
    bar.hidden = !hasAnything() || bookingInView;
    document.body.classList.toggle("has-cart", hasAnything());
    $("cartbar-total").textContent = now;
    if (was !== now && !bar.hidden) { bar.classList.remove("bump"); void bar.offsetWidth; bar.classList.add("bump"); }
  }

  /* ---------- пакеты ---------- */

  function renderPackages() {
    var wrap = $("tickets");
    wrap.innerHTML = "";
    C.packages.forEach(function (p) {
      var on = state.pkg === p.id, old = separatePrice(p);
      var items = ["Зал на " + p.hours + " " + hoursWord(p.hours), "Аниматор, персонаж на выбор"];
      p.shows.forEach(function (id) { items.push(byId(C.shows, id).name); });
      var t = el("article", "ticket" + (on ? " is-on" : ""));
      t.innerHTML =
        '<div class="ticket-main"><h3 class="ticket-name">' + esc(p.name) + '</h3><ul class="ticket-list">' +
        items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="ticket-stub"><div><span class="price">' + money(p.price) + '</span>' +
        '<span class="price-old">по отдельности <s>' + money(old) + '</s></span><span class="save">экономия ' + money(old - p.price) + "</span></div></div>";
      var b = el("button", "btn btn-banana", on ? "Убрать пакет" : "Выбрать пакет");
      b.type = "button";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.addEventListener("click", function () {
        state.pkg = on ? null : p.id;
        state.hours = 0;
        state.shows = state.shows.filter(function (id) { return !inPkgShow(id); });
        changed();
      });
      t.querySelector(".ticket-stub").appendChild(b);
      wrap.appendChild(t);
    });
  }

  /* ---------- персонажи ---------- */

  function renderChars() {
    var wrap = $("carousel"), p = pkg();
    var keep = wrap.scrollLeft;
    wrap.innerHTML = "";
    C.characters.forEach(function (c) {
      var on = state.chars.indexOf(c.id) >= 0;
      var card = el("article", "char" + (on ? " is-on" : ""));
      var pic = el("div", "char-pic");
      if (c.photo) {
        var img = el("img"); img.src = c.photo; img.alt = c.name + ", аниматор Banana Club"; img.loading = "lazy"; img.width = 360; img.height = 480;
        pic.appendChild(img);
      } else {
        var art = el("div", "char-art", esc(c.name));
        art.style.setProperty("--c", c.bg);
        pic.appendChild(art);
      }
      card.appendChild(pic);
      var body = el("div", "char-body");
      body.appendChild(el("div", "char-name", esc(c.name)));
      var b = el("button", "btn", on ? "Убрать" : "Добавить");
      b.type = "button";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("aria-label", (on ? "Убрать " : "Добавить ") + c.name);
      b.addEventListener("click", function () {
        if (on) state.chars.splice(state.chars.indexOf(c.id), 1); else state.chars.push(c.id);
        changed();
      });
      body.appendChild(b);
      card.appendChild(body);
      wrap.appendChild(card);
    });
    wrap.appendChild(el("div", "carousel-end"));
    wrap.scrollLeft = keep;
    $("chars-lead").textContent = p
      ? "Один персонаж уже входит в пакет «" + p.name + "». Каждый следующий от " + money(C.animatorPrice) + "."
      : "Программа от 1 часа, от " + money(C.animatorPrice) + ". Цену за конкретного персонажа подтвердим по телефону.";
  }

  /* ---------- собрать самому ---------- */

  function renderBuilder() {
    var p = pkg();
    var max = p ? C.maxHours - p.hours : C.maxHours;
    $("hours-title").textContent = p ? "Дополнительные часы" : "Аренда зала";
    $("hours-hint").textContent = p
      ? "Сверх " + p.hours + " часов пакета, " + money(C.hourPriceLong) + " за час"
      : "1–2 часа по " + money(C.hourPrice) + ", от " + C.longFrom + " часов по " + money(C.hourPriceLong) + " за час";
    $("hours-value").textContent = state.hours + " ч";
    $("hours-minus").disabled = state.hours <= 0;
    $("hours-plus").disabled = state.hours >= max;

    var wrap = $("shows");
    wrap.innerHTML = "";
    C.shows.forEach(function (s) {
      var inp = inPkgShow(s.id), on = inp || state.shows.indexOf(s.id) >= 0;
      var lab = el("label", "show show--" + s.id + (on ? " is-on" : "") + (inp ? " is-inpkg" : ""));
      lab.innerHTML =
        '<div class="show-pic"><img src="' + s.photo + '" alt="" loading="lazy" width="560" height="420"></div>' +
        '<div class="show-body"><h3>' + esc(s.name) + "</h3><p>" + esc(s.text) + "</p>" +
        '<div class="show-foot"><span class="show-price">' + (inp ? "в пакете" : money(s.price)) + "</span>" +
        '<span class="show-tick">' + (inp ? "Входит в пакет" : on ? "Добавлено" : "Добавить") + "</span></div></div>" +
        (s.id === "soap" ? '<span class="soap-shell" aria-hidden="true"></span>' : "") +
        (inp ? '<span class="inpkg-badge"><b>Уже в пакете</b></span>' : "");
      var cb = el("input"); cb.type = "checkbox"; cb.checked = on; cb.disabled = inp;
      cb.setAttribute("aria-label", s.name);
      cb.addEventListener("change", function () {
        if (cb.checked) state.shows.push(s.id); else state.shows.splice(state.shows.indexOf(s.id), 1);
        if (window.BananaFX) {
          var pic = lab.querySelector(".show-pic") || lab;
          var box = pic.getBoundingClientRect();
          if (s.id === "soap" && cb.checked) window.BananaFX.pop(box);
          if (s.id === "foil" && cb.checked) window.BananaFX.foil(box);
        }
        changed();
      });
      lab.insertBefore(cb, lab.firstChild);
      wrap.appendChild(lab);
    });
  }

  /* ---------- календарь ---------- */

  function nowMinutes() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

  function freeStarts(date, hours) {
    if (!hours) return [];
    var list = [], dur = hours * 60, gap = C.bufferMinutes;
    var todayIso = isoDate(new Date());
    var minStart = date === todayIso ? nowMinutes() + C.leadHours * 60 : 0;
    var taken = busy[date] || [];
    for (var s = C.openHour * 60; s + dur <= C.closeHour * 60; s += 60) {
      if (s < minStart) continue;
      var ok = taken.every(function (b) { return s >= b[1] + gap || s + dur + gap <= b[0]; });
      if (ok) list.push(s);
    }
    return list;
  }

  function renderDays() {
    var wrap = $("days"), hours = totalHours();
    wrap.innerHTML = "";
    var wd = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    var mon = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    var d = new Date(); d.setHours(12, 0, 0, 0);
    for (var i = 0; i < C.daysAhead; i++) {
      var iso = isoDate(d), wday = d.getDay();
      var b = el("button", "day" + (wday === 0 || wday === 6 ? " is-weekend" : ""));
      b.type = "button";
      b.setAttribute("role", "option");
      b.dataset.date = iso;
      b.innerHTML = "<small>" + wd[wday] + "</small><b>" + d.getDate() + "</b><small>" + mon[d.getMonth()] + "</small>";
      var full = busyLoaded && hours > 0 && freeStarts(iso, hours).length === 0;
      b.disabled = full;
      if (full) b.setAttribute("aria-label", d.getDate() + " " + mon[d.getMonth()] + ", всё занято");
      b.setAttribute("aria-selected", state.date === iso ? "true" : "false");
      b.addEventListener("click", function () { state.date = this.dataset.date; state.start = null; renderDays(); renderTimes(); });
      wrap.appendChild(b);
      d.setDate(d.getDate() + 1);
    }
  }

  function renderTimes() {
    var wrap = $("times"), hint = $("time-hint"), hours = totalHours();
    wrap.innerHTML = "";
    if (!hours) { hint.textContent = "Сначала выберите пакет или часы аренды."; return; }
    if (!state.date) { hint.textContent = "Сначала выберите день."; return; }
    if (!busyLoaded) { hint.textContent = "Загружаем свободное время…"; return; }
    var starts = freeStarts(state.date, hours);
    if (state.start != null && starts.indexOf(state.start) < 0) state.start = null;
    if (!starts.length) { hint.textContent = "В этот день всё занято. Выберите другой."; return; }
    hint.textContent = "Праздник на " + hours + " " + hoursWord(hours) + ". Показано только свободное время.";
    starts.forEach(function (s) {
      var b = el("button", "time", hm(s) + "<small>до " + hm(s + hours * 60) + "</small>");
      b.type = "button";
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", state.start === s ? "true" : "false");
      b.addEventListener("click", function () { state.start = s; renderTimes(); clearError(); });
      wrap.appendChild(b);
    });
  }

  function demoBusy() {
    // В демо-режиме занято несколько выходных, чтобы было видно, как это выглядит.
    var out = {}, d = new Date();
    for (var i = 0; i < C.daysAhead; i++) {
      var iso = isoDate(d), wd = d.getDay();
      if (wd === 6) out[iso] = [[660, 840], [960, 1140]];
      if (wd === 0) out[iso] = [[900, 1080]];
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  function loadBusy() {
    busyLoaded = false;
    if (!C.apiUrl) { busy = demoBusy(); busyLoaded = true; renderDays(); renderTimes(); return Promise.resolve(); }
    var from = isoDate(new Date()), to = new Date(); to.setDate(to.getDate() + C.daysAhead);
    return fetch(C.apiUrl + "?action=busy&from=" + from + "&to=" + isoDate(to))
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || "busy"); busy = j.busy || {}; })
      .catch(function () { busy = {}; showError("Не получилось загрузить свободное время. Выберите удобное, а мы уточним по телефону."); })
      .then(function () { busyLoaded = true; renderDays(); renderTimes(); });
  }

  /* ---------- заявка ---------- */

  function showError(t) { $("form-error").textContent = t; }
  function clearError() { $("form-error").textContent = ""; }

  function phoneDigits(v) {
    var d = v.replace(/\D/g, "");
    if (d.length === 11 && (d[0] === "8" || d[0] === "7")) d = "7" + d.slice(1);
    else if (d.length === 10) d = "7" + d;
    return d;
  }

  function phonePretty(d) {
    return "+7 " + d.slice(1, 4) + " " + d.slice(4, 7) + "-" + d.slice(7, 9) + "-" + d.slice(9, 11);
  }

  function validate(f) {
    var bad = null;
    ["name", "phone", "kids"].forEach(function (n) { f[n].removeAttribute("aria-invalid"); });
    if (totalHours() === 0) return { msg: "Выберите пакет или часы аренды зала.", focus: $("packages") };
    if (!state.date) return { msg: "Выберите день праздника.", focus: $("days") };
    if (state.start == null) return { msg: "Выберите время начала.", focus: $("times") };
    if (!f.name.value.trim()) bad = bad || { msg: "Напишите, как к вам обращаться.", focus: f.name };
    if (phoneDigits(f.phone.value).length !== 11) bad = bad || { msg: "Проверьте телефон: нужно 11 цифр, например +7 900 000-00-00.", focus: f.phone };
    var kids = parseInt(f.kids.value, 10);
    if (!(kids >= 1)) bad = bad || { msg: "Напишите, сколько будет детей.", focus: f.kids };
    if (!f.consent.checked) bad = bad || { msg: "Отметьте согласие на обработку персональных данных.", focus: f.consent };
    if (bad && bad.focus.tagName === "INPUT" && bad.focus.type !== "checkbox") bad.focus.setAttribute("aria-invalid", "true");
    return bad;
  }

  function dateText(iso) {
    var mon = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    var p = iso.split("-");
    return parseInt(p[2], 10) + " " + mon[parseInt(p[1], 10) - 1];
  }

  function submit(e) {
    e.preventDefault();
    var f = $("form");
    clearError();
    var bad = validate(f);
    if (bad) { showError(bad.msg); bad.focus.focus({ preventScroll: false }); return; }

    var cart = cartLines(), hours = totalHours();
    var data = {
      name: f.name.value.trim(),
      phone: phonePretty(phoneDigits(f.phone.value)),
      kids: parseInt(f.kids.value, 10),
      age: f.age.value ? parseInt(f.age.value, 10) : null,
      occasion: f.occasion.value,
      comment: f.comment.value.trim(),
      date: state.date,
      start: state.start,
      hours: hours,
      items: cart.lines.map(function (l) { return { name: l.name, price: l.price, from: !!l.from, inpkg: !!l.inpkg }; }),
      total: cart.total,
      totalFrom: state.chars.length > 0,
      website: f.website.value
    };

    var btn = $("submit");
    btn.disabled = true; btn.textContent = "Отправляем…";

    var send = C.apiUrl
      ? fetch(C.apiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) }).then(function (r) { return r.json(); })
      : new Promise(function (res) { setTimeout(function () { res({ ok: true, demo: true }); }, 700); });

    send.then(function (j) {
      if (j.ok) return done(data);
      if (j.error === "busy") { showError("Это время только что заняли. Выберите другое."); state.start = null; return loadBusy(); }
      showError("Заявка не отправилась. Позвоните нам: " + C.phoneText + ".");
    }).catch(function () {
      showError("Заявка не отправилась, проверьте интернет. Или позвоните: " + C.phoneText + ".");
    }).then(function () {
      btn.disabled = false; btn.textContent = "Отправить заявку";
    });
  }

  function done(data) {
    $("form").hidden = true;
    $("cart-box").hidden = true;
    $("done-text").textContent =
      "Ваш праздник: " + dateText(data.date) + ", с " + hm(data.start) + " до " + hm(data.start + data.hours * 60) +
      ", " + (data.totalFrom ? "от " : "") + money(data.total) + ". Мы перезвоним по номеру " + data.phone + ", чтобы подтвердить дату и сумму.";
    $("done").hidden = false;
    $("done").focus();
    state.pkg = null; state.hours = 0; state.chars = []; state.shows = []; state.date = null; state.start = null;
    save();
    renderCartOnly();
    if (C.apiUrl) loadBusy();
  }

  function again() {
    $("done").hidden = true;
    $("form").hidden = false;
    $("cart-box").hidden = false;
    $("form").reset();
    changed();
    location.hash = "#packages";
  }

  /* ---------- общее ---------- */

  var bookingInView = false;

  function renderCartOnly() { renderCart(); }

  /* Появление ключевых заголовков при прокрутке. */
  function reveal() {
    var items = document.querySelectorAll(".reveal");
    var i;
    if (!("IntersectionObserver" in window)) {
      for (i = 0; i < items.length; i++) items[i].classList.add("is-in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    for (i = 0; i < items.length; i++) io.observe(items[i]);
  }

  function changed() {
    save();
    renderPackages();
    renderChars();
    renderBuilder();
    renderCart();
    renderDays();
    renderTimes();
  }

  function init() {
    load();
    var rl = $("reviews-link"); if (rl) rl.href = C.reviewsUrl;
    var hr = $("hero-rating"); if (hr) hr.href = C.reviewsUrl;
    reveal();
    $("demo").hidden = !!C.apiUrl;

    $("hours-minus").addEventListener("click", function () { if (state.hours > 0) { state.hours--; changed(); } });
    $("hours-plus").addEventListener("click", function () {
      var p = pkg(), max = p ? C.maxHours - p.hours : C.maxHours;
      if (state.hours < max) { state.hours++; changed(); }
    });
    $("form").addEventListener("submit", submit);
    $("again").addEventListener("click", again);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        bookingInView = entries[0].isIntersecting;
        renderCart();
      }, { threshold: 0.05 }).observe($("booking"));
    }

    changed();
    loadBusy();
  }

  init();
})();

// Настройки сайта Banana Club.
// Цены, пакеты и персонажи меняются здесь, остальной код трогать не нужно.
window.BANANA = {
  // Адрес программы в Google-аккаунте клуба bananaclubvlg@gmail.com (Apps Script). Если пусто, сайт работает в демо-режиме.
  apiUrl: "https://script.google.com/macros/s/AKfycbyb4Hu_jXzPb5fwdXBX9nB_yOv0B3H8cJUPs_jtG9wyKeXG1BjlGyYZ4sNMgO-KDv5aOw/exec",

  phone: "+79880197859",
  phoneText: "+7 988 019-78-59",
  instagram: "https://instagram.com/bananaclub34",
  address: "Волгоград, ул. Хорошева, 99",
  addressNote: "Цокольный этаж",
  reviewsUrl: "https://yandex.ru/maps/org/42672209749/reviews/",

  // Запись: с какого часа можно начать, до какого часа праздник должен закончиться.
  openHour: 9,
  closeHour: 22,
  bufferMinutes: 60,   // перерыв на уборку между праздниками
  leadHours: 3,        // на сегодня можно записаться не раньше чем через 3 часа
  daysAhead: 60,       // на сколько дней вперёд показывать календарь

  hourPrice: 1800,     // за час при аренде 1–2 часа
  hourPriceLong: 1700, // за час при аренде от longFrom часов
  longFrom: 3,
  maxHours: 8,

  animatorPrice: 3500,

  shows: [
    { id: "soap", name: "Шоу мыльных пузырей", price: 2800,
      text: "Пузыри больше ребёнка и пузырь, внутри которого можно встать.", photo: "img/bubble-show.jpg" },
    { id: "foil", name: "Фольгированное шоу", price: 3500,
      text: "Серебряный дождь из фольги и серпантина, самые яркие фото праздника.", photo: "img/foil-show.jpg" }
  ],

  packages: [
    { id: "light", name: "Лёгкий", hours: 3, animators: 1, shows: [], price: 8200 },
    { id: "fun", name: "Весёлый", hours: 3, animators: 1, shows: ["soap"], price: 10800 },
    { id: "max", name: "Максимум", hours: 3, animators: 1, shows: ["soap", "foil"], price: 14000 }
  ],

  // Персонажи. У кого есть photo, показывается фото, у остальных цветная карточка.
  characters: [
    { id: "minion", name: "Миньон", photo: "img/chars/minion.jpg" },
    { id: "elsa", name: "Эльза", photo: "img/chars/elsa.jpg" },
    { id: "karamelka", name: "Карамелька", photo: "img/chars/karamelka.jpg" },
    { id: "spiderman", name: "Человек-паук", bg: "#C8232C", fg: "#FFFFFF" },
    { id: "sonic", name: "Соник", bg: "#1E5BD8", fg: "#FFFFFF" },
    { id: "ladybug", name: "Леди Баг", bg: "#E0262E", fg: "#1A1A1A" },
    { id: "steve", name: "Стив из Майнкрафта", bg: "#5D9C3A", fg: "#FFFFFF" },
    { id: "lalafanfan", name: "Уточка Лалафанфан", bg: "#FFE9A8", fg: "#2B2340" },
    { id: "nolik", name: "Фиксик Нолик", bg: "#F28C1F", fg: "#2B2340" },
    { id: "batman", name: "Бэтмен", bg: "#2B2340", fg: "#FFD43B" }
  ]
};

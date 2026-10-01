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

  hourPrice: 1800,     // за час при аренде от 1 до 3 часов
  hourPriceLong: 1700, // за час при аренде от longFrom часов
  longFrom: 4,
  maxHours: 8,

  animatorPrice: 4500,     // цена аниматора; за другого персонажа мама может снизить по телефону, выше не бывает

  shows: [
    { id: "soap", name: "Шоу мыльных пузырей", short: "мыльные пузыри", price: 3000,
      text: "Пузыри больше ребёнка и пузырь, внутри которого можно встать.", photo: "img/bubble-show.jpg" },
    { id: "foil", name: "Фольгированное шоу", short: "фольгированное", price: 3500,
      text: "Серебряный дождь из фольги и серпантина, самые яркие фото праздника.", photo: "img/foil-show.jpg" }
  ],

  // showChoice: шоу на выбор клиента, в пакет входит одно из списка.
  packages: [
    { id: "light", name: "Лёгкий", hours: 3, animators: 1, shows: [], price: 9000 },
    { id: "fun", name: "Весёлый", hours: 3, animators: 1, shows: [], showChoice: ["soap", "foil"], price: 12000 },
    { id: "max", name: "Максимум", hours: 3, animators: 1, shows: ["soap", "foil"], price: 15000 }
  ],

  // Персонажи для выпадающего списка. На сайте список сортируется по алфавиту,
  // в конце сам добавляется пункт «Другой персонаж» с полем для своего варианта.
  // Общее фото аниматоров: img/animators.webp (собрано 01.10.2026).
  // Отдельные фото костюмов из img/chars больше не выводятся, файлы лежат на месте.
  characters: [
    { id: "batman", name: "Бэтмен" },
    { id: "chase", name: "Гонщик (Щенячий патруль)" },
    { id: "gru", name: "Грю (Гадкий я)" },
    { id: "unicorn", name: "Единорожка" },
    { id: "karamelka", name: "Карамелька (Три кота)" },
    { id: "kompot", name: "Компот (Три кота)" },
    { id: "korzhik", name: "Коржик (Три кота)" },
    { id: "ladybug", name: "Леди Баг" },
    { id: "leonardo", name: "Леонардо (Черепашки-ниндзя)" },
    { id: "lucy", name: "Люси (Гадкий я)" },
    { id: "michelangelo", name: "Микеланджело (Черепашки-ниндзя)" },
    { id: "mickey", name: "Микки Маус" },
    { id: "minion", name: "Миньон" },
    { id: "racer", name: "Молния Маккуин (Тачки)" },
    { id: "nolik", name: "Нолик (Фиксики)" },
    { id: "penguin", name: "Пингвин" },
    { id: "peppa", name: "Свинка Пеппа" },
    { id: "simka", name: "Симка (Фиксики)" },
    { id: "supergirl", name: "Супергёрл" },
    { id: "catnoir", name: "Супер-Кот" },
    { id: "tiktoker", name: "Тик-токер" },
    { id: "spiderman", name: "Человек-паук" },
    { id: "elsa", name: "Эльза" }
  ]
};

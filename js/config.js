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
    { id: "soap", name: "Шоу мыльных пузырей", price: 2800,
      text: "Пузыри больше ребёнка и пузырь, внутри которого можно встать.", photo: "img/bubble-show.jpg" },
    { id: "foil", name: "Фольгированное шоу", price: 3500,
      text: "Серебряный дождь из фольги и серпантина, самые яркие фото праздника.", photo: "img/foil-show.jpg" }
  ],

  packages: [
    { id: "light", name: "Лёгкий", hours: 3, animators: 1, shows: [], price: 9200 },
    { id: "fun", name: "Весёлый", hours: 3, animators: 1, shows: ["soap"], price: 11800 },
    { id: "max", name: "Максимум", hours: 3, animators: 1, shows: ["soap", "foil"], price: 15000 }
  ],

  // Персонажи. У кого есть photo, показывается фото, у остальных цветная карточка.
  // credit: откуда фото (Wikimedia Commons, автор, лицензия). На сайте не выводится по решению Максима от 29.09.2026.
  // Снятые в клубе фото (Миньон, Карамелька) подписи не требуют. Свои фото костюмов лучше чужих: заменить, когда появятся.
  characters: [
    { id: "other", name: "Другой персонаж", note: "Назовите любого, обсудим по телефону", bg: "#FFD43B", other: true },
    { id: "elsa", name: "Эльза", photo: "img/chars/elsa-kostyum.jpg",
      credit: "Stefan Schubert, CC BY 2.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Frozen_cosplay,_Elsa_walking_in_the_city.jpg" },
    { id: "karamelka", name: "Карамелька", photo: "img/chars/karamelka-c.jpg" },
    { id: "ladybug", name: "Леди Баг", photo: "img/chars/ladybug.jpg",
      credit: "Nicholas Moreau, CC BY-SA 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Fan_Expo_Canada_2016_Ladybug_IMG_0114.jpg" },
    { id: "unicorn", name: "Единорожка", photo: "img/chars/unicorn.jpg",
      credit: "Miguel Discart, CC BY-SA 2.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Cosplay_of_Rarity_from_My_Little_Pony_at_Brussels_Comic_Con_2019_(40340807043).jpg" },
    { id: "minion", name: "Миньон", photo: "img/chars/minion-c.jpg" },
    { id: "spiderman", name: "Человек-паук", photo: "img/chars/spiderman.jpg",
      credit: "Miguel Discart, CC BY-SA 2.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Cosplay_of_Spider-Man_at_Brussels_Comic_Con_2019_(47248209562).jpg" },
    { id: "racer", name: "Гонщик", photo: "img/chars/racer.jpg",
      credit: "Rose Abrams, CC BY 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:HCCD25_-_Lightning_McQueen.jpg" },
    { id: "batman", name: "Бэтмен", photo: "img/chars/batman.jpg",
      credit: "William Tung, CC BY-SA 2.0", creditUrl: "https://commons.wikimedia.org/wiki/File:San_Diego_Comic-Con_2024_Masquerade_-_Cosplay_of_Batman_2.jpg" },
    { id: "tiktoker", name: "Тик-токер", bg: "#111111", fg: "#25F4EE" },
    { id: "nolik", name: "Фиксик Нолик", bg: "#F28C1F", fg: "#2B2340" }
  ]
};

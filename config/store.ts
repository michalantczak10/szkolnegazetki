export type ProductId =
  | "poster" | "poster-a4"
  | "newsletter" | "newsletter-classic"
  | "boze-narodzenie-zestaw" | "boze-narodzenie-plakaty"
  | "zima-plakaty" | "zima-szablony"
  | "walentynki-plakaty" | "walentynki-szablony"
  | "dzien-kobiet-plakaty" | "dzien-kobiet-szablony"
  | "dzien-ziemi-plakaty" | "dzien-ziemi-szablony"
  | "wielkanoc-plakaty" | "wielkanoc-szablony"
  | "pierwszy-dzien-wiosny-plakaty" | "pierwszy-dzien-wiosny-szablony"
  | "wiosna-plakaty" | "wiosna-szablony"
  | "dzien-matki-plakaty" | "dzien-matki-szablony"
  | "konstytucja-plakaty" | "konstytucja-szablony"
  | "dzien-dziecka-plakaty" | "dzien-dziecka-szablony"
  | "dzien-ojca-plakaty" | "dzien-ojca-szablony"
  | "lato-plakaty" | "lato-szablony"
  | "poczatek-roku-plakaty" | "poczatek-roku-szablony"
  | "dzien-nauczyciela-plakaty" | "dzien-nauczyciela-szablony"
  | "jesien-plakaty" | "jesien-szablony"
  | "halloween-plakaty" | "halloween-szablony"
  | "andrzejki-plakaty" | "andrzejki-szablony"
  | "mikolajki-plakaty" | "mikolajki-szablony"
  | "dzien-babci-plakaty" | "dzien-babci-szablony"
  | "niepodleglosc-plakaty" | "niepodleglosc-szablony"
  | "zakonczenie-roku-plakaty" | "zakonczenie-roku-szablony";

export type CategoryId =
  | "plakaty" | "szablony"
  | "boze-narodzenie" | "zima"
  | "walentynki" | "dzien-kobiet"
  | "dzien-ziemi" | "wielkanoc"
  | "pierwszy-dzien-wiosny" | "wiosna"
  | "dzien-matki" | "konstytucja-3-maja"
  | "dzien-dziecka" | "dzien-ojca"
  | "lato" | "poczatek-roku"
  | "dzien-nauczyciela" | "jesien"
  | "halloween" | "andrzejki"
  | "mikolajki" | "dzien-babci-dziadka"
  | "niepodleglosc" | "zakonczenie-roku";

export type StoreProduct = {
  id: ProductId;
  name: string;
  description: string;
  price: number;
  image: string;
};

export type StoreCategory = {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
  imageWebp: string;
  imageAlt: string;
  features: string[];
  products: StoreProduct[];
};

const PRODUCT_IMAGES = {
  poster: new URL("../img/products/product-posters.png", import.meta.url).href,
  posterWebp: new URL("../img/products/product-posters.webp", import.meta.url).href,
  newsletter: new URL("../img/products/product-templates.png", import.meta.url).href,
  newsletterWebp: new URL("../img/products/product-templates.webp", import.meta.url).href,
} as const;

export const STORE_CONFIG = {
  categories: [
    {
      id: "plakaty",
      name: "Plakaty szkolne",
      description: "Gotowe plakaty edukacyjne do wydruku i dekoracji szkolnej gazetki.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Plakaty szkolne PDF",
      features: ["Formaty A3 i A4", "Wysoka rozdzielczość (300 DPI)", "Estetyczne ilustracje", "Gotowy plik PDF"],
      products: [
        { id: "poster", name: "Plakaty szkolne PDF (A3)", description: "Zestaw plakatów A3 do gazetki szkolnej.", price: 45, image: PRODUCT_IMAGES.poster },
        { id: "poster-a4", name: "Plakaty szkolne PDF (A4)", description: "Zestaw plakatów A4 do gazetki szkolnej.", price: 35, image: PRODUCT_IMAGES.poster },
      ],
    },
    {
      id: "szablony",
      name: "Szablony gazetki",
      description: "Profesjonalne szablony gotowe do druku – idealne dla każdej szkolnej redakcji.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Szablony gazetki PDF",
      features: ["Wiele układów stron", "Formaty A3 i A4", "Profesjonalna typografia", "Gotowy plik PDF"],
      products: [
        { id: "newsletter", name: "Szablony gazetki PDF", description: "Gotowe szablony gazetki szkolnej PDF.", price: 52, image: PRODUCT_IMAGES.newsletter },
        { id: "newsletter-classic", name: "Szablon klasyczny PDF", description: "Klasyczny układ gazetki szkolnej.", price: 45, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "boze-narodzenie",
      name: "Boże Narodzenie",
      description: "Świąteczne plakaty i szablony gazetki z motywami bożonarodzeniowymi.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Boże Narodzenie PDF",
      features: ["Świąteczne ilustracje", "Motywy zimowe i choinkowe", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "boze-narodzenie-zestaw", name: "Zestaw świąteczny PDF", description: "Kompletny zestaw plakatów i szablonów na Boże Narodzenie.", price: 55, image: PRODUCT_IMAGES.poster },
        { id: "boze-narodzenie-plakaty", name: "Plakaty bożonarodzeniowe PDF", description: "Plakaty A3 i A4 z motywami świątecznymi.", price: 40, image: PRODUCT_IMAGES.poster },
      ],
    },
    {
      id: "zima",
      name: "Zima",
      description: "Plakaty i szablony z motywami zimowymi – śnieg, mróz i ferie.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Zima PDF",
      features: ["Zimowe ilustracje", "Motywy śniegu i mrozu", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "zima-plakaty", name: "Plakaty zimowe PDF", description: "Plakaty z zimowymi motywami do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "zima-szablony", name: "Szablony zimowe PDF", description: "Zimowe szablony gazetki szkolnej.", price: 45, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "mikolajki",
      name: "Mikołajki",
      description: "Gazetka szkolna na 6 grudnia – Mikołaj, prezenty i zimowa magia.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Mikołajki PDF",
      features: ["Motywy mikołajkowe", "Wesołe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "mikolajki-plakaty", name: "Plakaty mikołajkowe PDF", description: "Plakaty na Mikołajki do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "mikolajki-szablony", name: "Szablony mikołajkowe PDF", description: "Szablony gazetki na 6 grudnia.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "walentynki",
      name: "Walentynki",
      description: "Romantyczne i przyjaźne plakaty i szablony na 14 lutego.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Walentynki PDF",
      features: ["Serca i miłosne motywy", "Przyjazny styl", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "walentynki-plakaty", name: "Plakaty walentynkowe PDF", description: "Plakaty na Walentynki do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "walentynki-szablony", name: "Szablony walentynkowe PDF", description: "Szablony gazetki na 14 lutego.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "dzien-babci-dziadka",
      name: "Dzień Babci i Dziadka",
      description: "Ciepłe plakaty i szablony na Dzień Babci (21 stycznia) i Dzień Dziadka (22 stycznia).",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Dzień Babci i Dziadka PDF",
      features: ["Ciepłe ilustracje rodzinne", "Serdeczny styl", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-babci-plakaty", name: "Plakaty – Dzień Babci i Dziadka PDF", description: "Plakaty do gazetki szkolnej na Dzień Babci i Dziadka.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "dzien-babci-szablony", name: "Szablony – Dzień Babci i Dziadka PDF", description: "Szablony gazetki na Dzień Babci i Dziadka.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "dzien-kobiet",
      name: "Dzień Kobiet",
      description: "Eleganckie plakaty i szablony gazetki na 8 marca.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Dzień Kobiet PDF",
      features: ["Kwiaty i eleganckie motywy", "Kolorowe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-kobiet-plakaty", name: "Plakaty – Dzień Kobiet PDF", description: "Plakaty na 8 marca do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "dzien-kobiet-szablony", name: "Szablony – Dzień Kobiet PDF", description: "Szablony gazetki na Dzień Kobiet.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "pierwszy-dzien-wiosny",
      name: "Pierwszy Dzień Wiosny",
      description: "Kolorowe plakaty i szablony na pierwszy dzień wiosny – 21 marca.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Pierwszy Dzień Wiosny PDF",
      features: ["Wiosenne ilustracje", "Kwiaty i motyle", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "pierwszy-dzien-wiosny-plakaty", name: "Plakaty – Pierwszy Dzień Wiosny PDF", description: "Plakaty na 21 marca do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "pierwszy-dzien-wiosny-szablony", name: "Szablony – Pierwszy Dzień Wiosny PDF", description: "Szablony gazetki na Pierwszy Dzień Wiosny.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "wielkanoc",
      name: "Wielkanoc",
      description: "Wielkanocne plakaty i szablony – pisanki, wiosna i radość.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Wielkanoc PDF",
      features: ["Pisanki i baranki", "Wiosenne motywy", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "wielkanoc-plakaty", name: "Plakaty wielkanocne PDF", description: "Plakaty na Wielkanoc do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "wielkanoc-szablony", name: "Szablony wielkanocne PDF", description: "Szablony gazetki szkolnej na Wielkanoc.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "dzien-ziemi",
      name: "Dzień Ziemi",
      description: "Ekologiczne plakaty i szablony na Dzień Ziemi – 22 kwietnia.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Gazetka szkolna Dzień Ziemi PDF",
      features: ["Motywy ekologiczne", "Zielone ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-ziemi-plakaty", name: "Plakaty – Dzień Ziemi PDF", description: "Plakaty ekologiczne na 22 kwietnia.", price: 38, image: PRODUCT_IMAGES.newsletter },
        { id: "dzien-ziemi-szablony", name: "Szablony – Dzień Ziemi PDF", description: "Szablony gazetki na Dzień Ziemi.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "wiosna",
      name: "Wiosna",
      description: "Radosne plakaty i szablony z motywami wiosennymi.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Wiosna PDF",
      features: ["Wiosenne ilustracje", "Kwiaty i przyroda", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "wiosna-plakaty", name: "Plakaty wiosenne PDF", description: "Wiosenne plakaty do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "wiosna-szablony", name: "Szablony wiosenne PDF", description: "Wiosenne szablony gazetki szkolnej.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "konstytucja-3-maja",
      name: "Konstytucja 3 Maja",
      description: "Patriotyczne plakaty i szablony na Święto Konstytucji 3 Maja.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Gazetka szkolna Konstytucja 3 Maja PDF",
      features: ["Patriotyczne motywy", "Flagi i symbole narodowe", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "konstytucja-plakaty", name: "Plakaty – 3 Maja PDF", description: "Patriotyczne plakaty na 3 Maja.", price: 38, image: PRODUCT_IMAGES.newsletter },
        { id: "konstytucja-szablony", name: "Szablony – 3 Maja PDF", description: "Szablony gazetki na Konstytucję 3 Maja.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "dzien-matki",
      name: "Dzień Matki",
      description: "Ciepłe i piękne plakaty i szablony na Dzień Matki – 26 maja.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Dzień Matki PDF",
      features: ["Kwiaty i serca", "Ciepłe kolorowe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-matki-plakaty", name: "Plakaty – Dzień Matki PDF", description: "Plakaty na Dzień Matki do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "dzien-matki-szablony", name: "Szablony – Dzień Matki PDF", description: "Szablony gazetki na Dzień Matki.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "dzien-dziecka",
      name: "Dzień Dziecka",
      description: "Wesołe i kolorowe plakaty i szablony na Dzień Dziecka – 1 czerwca.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Dzień Dziecka PDF",
      features: ["Wesołe, kolorowe ilustracje", "Balony i confetti", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-dziecka-plakaty", name: "Plakaty – Dzień Dziecka PDF", description: "Wesołe plakaty na 1 czerwca.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "dzien-dziecka-szablony", name: "Szablony – Dzień Dziecka PDF", description: "Szablony gazetki na Dzień Dziecka.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "dzien-ojca",
      name: "Dzień Ojca",
      description: "Serdeczne plakaty i szablony na Dzień Ojca – 23 czerwca.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Dzień Ojca PDF",
      features: ["Ciepłe ilustracje rodzinne", "Serdeczny styl", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-ojca-plakaty", name: "Plakaty – Dzień Ojca PDF", description: "Plakaty na Dzień Ojca do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "dzien-ojca-szablony", name: "Szablony – Dzień Ojca PDF", description: "Szablony gazetki na Dzień Ojca.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "lato",
      name: "Lato",
      description: "Słoneczne plakaty i szablony z motywami letnimi na koniec roku.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Lato PDF",
      features: ["Słońce, morze, wakacje", "Jasne kolorowe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "lato-plakaty", name: "Plakaty letnie PDF", description: "Letnie plakaty do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "lato-szablony", name: "Szablony letnie PDF", description: "Letnie szablony gazetki szkolnej.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "zakonczenie-roku",
      name: "Zakończenie roku szkolnego",
      description: "Plakaty i szablony na zakończenie roku szkolnego – dyplomy, podsumowania.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Gazetka szkolna Zakończenie roku PDF",
      features: ["Dyplomy i podziękowania", "Wspomnienia roku", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "zakonczenie-roku-plakaty", name: "Plakaty – Zakończenie roku PDF", description: "Plakaty na zakończenie roku szkolnego.", price: 42, image: PRODUCT_IMAGES.newsletter },
        { id: "zakonczenie-roku-szablony", name: "Szablony – Zakończenie roku PDF", description: "Szablony gazetki na zakończenie roku.", price: 48, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "poczatek-roku",
      name: "Początek roku szkolnego",
      description: "Witamy nowy rok szkolny! Plakaty i szablony na wrzesień.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Gazetka szkolna Początek roku PDF",
      features: ["Motywy powrotu do szkoły", "Tornistry i książki", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "poczatek-roku-plakaty", name: "Plakaty – Początek roku PDF", description: "Plakaty powitalne na wrzesień.", price: 38, image: PRODUCT_IMAGES.newsletter },
        { id: "poczatek-roku-szablony", name: "Szablony – Początek roku PDF", description: "Szablony gazetki na początek roku szkolnego.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "jesien",
      name: "Jesień",
      description: "Plakaty i szablony z jesiennymi motywami – liście, grzyby, kolory.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Jesień PDF",
      features: ["Jesienne ilustracje", "Ciepłe, złote kolory", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "jesien-plakaty", name: "Plakaty jesienne PDF", description: "Jesienne plakaty do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "jesien-szablony", name: "Szablony jesienne PDF", description: "Jesienne szablony gazetki szkolnej.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "dzien-nauczyciela",
      name: "Dzień Nauczyciela",
      description: "Podziękowania dla nauczycieli – plakaty i szablony na 14 października.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Gazetka szkolna Dzień Nauczyciela PDF",
      features: ["Motyw szkoły i podziękowania", "Ciepłe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-nauczyciela-plakaty", name: "Plakaty – Dzień Nauczyciela PDF", description: "Plakaty na Dzień Nauczyciela.", price: 38, image: PRODUCT_IMAGES.newsletter },
        { id: "dzien-nauczyciela-szablony", name: "Szablony – Dzień Nauczyciela PDF", description: "Szablony gazetki na 14 października.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "halloween",
      name: "Halloween",
      description: "Straszne i zabawne plakaty i szablony na Halloween – 31 października.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Halloween PDF",
      features: ["Dynie, duchy i pajęczyny", "Mroczny klimat", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "halloween-plakaty", name: "Plakaty Halloween PDF", description: "Straszne plakaty na Halloween.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "halloween-szablony", name: "Szablony Halloween PDF", description: "Szablony gazetki na Halloween.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "andrzejki",
      name: "Andrzejki",
      description: "Wróżby i zabawa – plakaty i szablony na Andrzejki, 30 listopada.",
      image: PRODUCT_IMAGES.poster,
      imageWebp: PRODUCT_IMAGES.posterWebp,
      imageAlt: "Gazetka szkolna Andrzejki PDF",
      features: ["Motywy wróżbiarskie", "Gwiazdy i magiczne symbole", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "andrzejki-plakaty", name: "Plakaty andrzejkowe PDF", description: "Plakaty na Andrzejki do gazetki szkolnej.", price: 38, image: PRODUCT_IMAGES.poster },
        { id: "andrzejki-szablony", name: "Szablony andrzejkowe PDF", description: "Szablony gazetki na Andrzejki.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
    {
      id: "niepodleglosc",
      name: "Dzień Niepodległości",
      description: "Patriotyczne plakaty i szablony na 11 listopada.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Gazetka szkolna Dzień Niepodległości PDF",
      features: ["Flagi i symbole narodowe", "Patriotyczne motywy", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "niepodleglosc-plakaty", name: "Plakaty – 11 Listopada PDF", description: "Patriotyczne plakaty na Dzień Niepodległości.", price: 38, image: PRODUCT_IMAGES.newsletter },
        { id: "niepodleglosc-szablony", name: "Szablony – 11 Listopada PDF", description: "Szablony gazetki na 11 listopada.", price: 42, image: PRODUCT_IMAGES.newsletter },
      ],
    },
  ] as StoreCategory[],
  contact: {
    phoneDisplay: "794 535 366",
    phoneHref: "tel:+48794535366",
    generalEmail: "kontakt@szkolnegazetki.pl",
    complaintsEmail: "reklamacje@szkolnegazetki.pl",
    fulfillmentHours:
      "Obsługa zamówień od poniedziałku do piątku: 09:00-18:00.",
  },
  payment: {
    accountHolder: "Szkolne gazetki",
    accountNumber: "60 1140 2004 0000 3102 4831 8846",
    blikPhone: "794 535 366",
  },
} as const;

export type CategoryGroup = {
  id: string;
  label: string;
  categoryIds: CategoryId[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "caloroczne",
    label: "Całoroczne",
    categoryIds: ["plakaty", "szablony"],
  },
  {
    id: "jesien",
    label: "Jesień",
    categoryIds: ["poczatek-roku", "jesien", "dzien-nauczyciela", "halloween", "andrzejki", "niepodleglosc"],
  },
  {
    id: "zima",
    label: "Zima",
    categoryIds: ["mikolajki", "boze-narodzenie", "zima"],
  },
  {
    id: "wiosna",
    label: "Wiosna",
    categoryIds: [
      "walentynki", "dzien-babci-dziadka", "dzien-kobiet",
      "pierwszy-dzien-wiosny", "wielkanoc", "dzien-ziemi",
      "wiosna", "konstytucja-3-maja", "dzien-matki",
      "dzien-dziecka", "dzien-ojca",
    ],
  },
  {
    id: "lato",
    label: "Lato",
    categoryIds: ["lato", "zakonczenie-roku"],
  },
];

export function getProductConfig(productId: ProductId): StoreProduct | undefined {
  for (const category of STORE_CONFIG.categories) {
    const found = category.products.find((p) => p.id === productId);
    if (found) return found;
  }
  return undefined;
}

export function getCategoryConfig(categoryId: CategoryId): StoreCategory | undefined {
  return STORE_CONFIG.categories.find((c) => c.id === categoryId);
}

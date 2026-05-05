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

const CAT_IMAGES: Record<string, string> = {
  "plakaty": new URL("../img/products/cat-plakaty.svg", import.meta.url).href,
  "szablony": new URL("../img/products/cat-szablony.svg", import.meta.url).href,
  "boze-narodzenie": new URL("../img/products/cat-boze-narodzenie.svg", import.meta.url).href,
  "zima": new URL("../img/products/cat-zima.svg", import.meta.url).href,
  "walentynki": new URL("../img/products/cat-walentynki.svg", import.meta.url).href,
  "dzien-kobiet": new URL("../img/products/cat-dzien-kobiet.svg", import.meta.url).href,
  "dzien-ziemi": new URL("../img/products/cat-dzien-ziemi.svg", import.meta.url).href,
  "wielkanoc": new URL("../img/products/cat-wielkanoc.svg", import.meta.url).href,
  "pierwszy-dzien-wiosny": new URL("../img/products/cat-pierwszy-dzien-wiosny.svg", import.meta.url).href,
  "wiosna": new URL("../img/products/cat-wiosna.svg", import.meta.url).href,
  "dzien-matki": new URL("../img/products/cat-dzien-matki.svg", import.meta.url).href,
  "konstytucja-3-maja": new URL("../img/products/cat-konstytucja-3-maja.svg", import.meta.url).href,
  "dzien-dziecka": new URL("../img/products/cat-dzien-dziecka.svg", import.meta.url).href,
  "dzien-ojca": new URL("../img/products/cat-dzien-ojca.svg", import.meta.url).href,
  "lato": new URL("../img/products/cat-lato.svg", import.meta.url).href,
  "zakonczenie-roku": new URL("../img/products/cat-zakonczenie-roku.svg", import.meta.url).href,
  "poczatek-roku": new URL("../img/products/cat-poczatek-roku.svg", import.meta.url).href,
  "jesien": new URL("../img/products/cat-jesien.svg", import.meta.url).href,
  "dzien-nauczyciela": new URL("../img/products/cat-dzien-nauczyciela.svg", import.meta.url).href,
  "halloween": new URL("../img/products/cat-halloween.svg", import.meta.url).href,
  "andrzejki": new URL("../img/products/cat-andrzejki.svg", import.meta.url).href,
  "mikolajki": new URL("../img/products/cat-mikolajki.svg", import.meta.url).href,
  "dzien-babci-dziadka": new URL("../img/products/cat-dzien-babci-dziadka.svg", import.meta.url).href,
  "niepodleglosc": new URL("../img/products/cat-niepodleglosc.svg", import.meta.url).href,
};

const PROD_IMAGES: Record<string, string> = {
  "poster":                         new URL("../img/products/prod-poster.svg", import.meta.url).href,
  "poster-a4":                      new URL("../img/products/prod-poster-a4.svg", import.meta.url).href,
  "newsletter":                     new URL("../img/products/prod-newsletter.svg", import.meta.url).href,
  "newsletter-classic":             new URL("../img/products/prod-newsletter-classic.svg", import.meta.url).href,
  "boze-narodzenie-zestaw":         new URL("../img/products/prod-boze-narodzenie-zestaw.svg", import.meta.url).href,
  "boze-narodzenie-plakaty":        new URL("../img/products/prod-boze-narodzenie-plakaty.svg", import.meta.url).href,
  "zima-plakaty":                   new URL("../img/products/prod-zima-plakaty.svg", import.meta.url).href,
  "zima-szablony":                  new URL("../img/products/prod-zima-szablony.svg", import.meta.url).href,
  "walentynki-plakaty":             new URL("../img/products/prod-walentynki-plakaty.svg", import.meta.url).href,
  "walentynki-szablony":            new URL("../img/products/prod-walentynki-szablony.svg", import.meta.url).href,
  "dzien-kobiet-plakaty":           new URL("../img/products/prod-dzien-kobiet-plakaty.svg", import.meta.url).href,
  "dzien-kobiet-szablony":          new URL("../img/products/prod-dzien-kobiet-szablony.svg", import.meta.url).href,
  "dzien-ziemi-plakaty":            new URL("../img/products/prod-dzien-ziemi-plakaty.svg", import.meta.url).href,
  "dzien-ziemi-szablony":           new URL("../img/products/prod-dzien-ziemi-szablony.svg", import.meta.url).href,
  "wielkanoc-plakaty":              new URL("../img/products/prod-wielkanoc-plakaty.svg", import.meta.url).href,
  "wielkanoc-szablony":             new URL("../img/products/prod-wielkanoc-szablony.svg", import.meta.url).href,
  "pierwszy-dzien-wiosny-plakaty":  new URL("../img/products/prod-pierwszy-dzien-wiosny-plakaty.svg", import.meta.url).href,
  "pierwszy-dzien-wiosny-szablony": new URL("../img/products/prod-pierwszy-dzien-wiosny-szablony.svg", import.meta.url).href,
  "wiosna-plakaty":                 new URL("../img/products/prod-wiosna-plakaty.svg", import.meta.url).href,
  "wiosna-szablony":                new URL("../img/products/prod-wiosna-szablony.svg", import.meta.url).href,
  "dzien-matki-plakaty":            new URL("../img/products/prod-dzien-matki-plakaty.svg", import.meta.url).href,
  "dzien-matki-szablony":           new URL("../img/products/prod-dzien-matki-szablony.svg", import.meta.url).href,
  "konstytucja-plakaty":            new URL("../img/products/prod-konstytucja-plakaty.svg", import.meta.url).href,
  "konstytucja-szablony":           new URL("../img/products/prod-konstytucja-szablony.svg", import.meta.url).href,
  "dzien-dziecka-plakaty":          new URL("../img/products/prod-dzien-dziecka-plakaty.svg", import.meta.url).href,
  "dzien-dziecka-szablony":         new URL("../img/products/prod-dzien-dziecka-szablony.svg", import.meta.url).href,
  "dzien-ojca-plakaty":             new URL("../img/products/prod-dzien-ojca-plakaty.svg", import.meta.url).href,
  "dzien-ojca-szablony":            new URL("../img/products/prod-dzien-ojca-szablony.svg", import.meta.url).href,
  "lato-plakaty":                   new URL("../img/products/prod-lato-plakaty.svg", import.meta.url).href,
  "lato-szablony":                  new URL("../img/products/prod-lato-szablony.svg", import.meta.url).href,
  "zakonczenie-roku-plakaty":       new URL("../img/products/prod-zakonczenie-roku-plakaty.svg", import.meta.url).href,
  "zakonczenie-roku-szablony":      new URL("../img/products/prod-zakonczenie-roku-szablony.svg", import.meta.url).href,
  "poczatek-roku-plakaty":          new URL("../img/products/prod-poczatek-roku-plakaty.svg", import.meta.url).href,
  "poczatek-roku-szablony":         new URL("../img/products/prod-poczatek-roku-szablony.svg", import.meta.url).href,
  "jesien-plakaty":                 new URL("../img/products/prod-jesien-plakaty.svg", import.meta.url).href,
  "jesien-szablony":                new URL("../img/products/prod-jesien-szablony.svg", import.meta.url).href,
  "dzien-nauczyciela-plakaty":      new URL("../img/products/prod-dzien-nauczyciela-plakaty.svg", import.meta.url).href,
  "dzien-nauczyciela-szablony":     new URL("../img/products/prod-dzien-nauczyciela-szablony.svg", import.meta.url).href,
  "halloween-plakaty":              new URL("../img/products/prod-halloween-plakaty.svg", import.meta.url).href,
  "halloween-szablony":             new URL("../img/products/prod-halloween-szablony.svg", import.meta.url).href,
  "andrzejki-plakaty":              new URL("../img/products/prod-andrzejki-plakaty.svg", import.meta.url).href,
  "andrzejki-szablony":             new URL("../img/products/prod-andrzejki-szablony.svg", import.meta.url).href,
  "mikolajki-plakaty":              new URL("../img/products/prod-mikolajki-plakaty.svg", import.meta.url).href,
  "mikolajki-szablony":             new URL("../img/products/prod-mikolajki-szablony.svg", import.meta.url).href,
  "dzien-babci-plakaty":            new URL("../img/products/prod-dzien-babci-plakaty.svg", import.meta.url).href,
  "dzien-babci-szablony":           new URL("../img/products/prod-dzien-babci-szablony.svg", import.meta.url).href,
  "niepodleglosc-plakaty":          new URL("../img/products/prod-niepodleglosc-plakaty.svg", import.meta.url).href,
  "niepodleglosc-szablony":         new URL("../img/products/prod-niepodleglosc-szablony.svg", import.meta.url).href,
};

export const STORE_CONFIG = {
  categories: [
    {
      id: "plakaty",
      name: "Plakaty szkolne",
      description: "Kolorowe plakaty edukacyjne w wysokiej rozdzielczości – gotowe do wydruku i powieszenia na szkolnej gazetce lub tablicy.",
      image: CAT_IMAGES["plakaty"],
      imageWebp: CAT_IMAGES["plakaty"],
      imageAlt: "Plakaty szkolne PDF",
      features: ["Formaty A3 i A4", "Wysoka rozdzielczość (300 DPI)", "Estetyczne ilustracje", "Gotowy plik PDF"],
      products: [
        { id: "poster", name: "Plakaty szkolne PDF (A3)", description: "12 plakatów w formacie A3 – idealne do gazetki szkolnej i korytarza. Drukuj i wieszaj od razu.", price: 45, image: PROD_IMAGES["poster"] },
        { id: "poster-a4", name: "Plakaty szkolne PDF (A4)", description: "12 plakatów w formacie A4 – pasują do tablic ogłoszeń, zeszytów i gazetki klasowej.", price: 35, image: PROD_IMAGES["poster-a4"] },
      ],
    },
    {
      id: "szablony",
      name: "Szablony gazetki",
      description: "Profesjonalne układy redakcyjne dla szkolnej gazetki – wygodne szablony z gotowymi ramkami na tekst i zdjęcia.",
      image: CAT_IMAGES["szablony"],
      imageWebp: CAT_IMAGES["szablony"],
      imageAlt: "Szablony gazetki PDF",
      features: ["Wiele układów stron", "Formaty A3 i A4", "Profesjonalna typografia", "Gotowy plik PDF"],
      products: [
        { id: "newsletter", name: "Szablony gazetki PDF", description: "Nowoczesne szablony z wieloma wariantami układu – wystarczy wkleić tekst i drukować.", price: 52, image: PROD_IMAGES["newsletter"] },
        { id: "newsletter-classic", name: "Szablon klasyczny PDF", description: "Klasyczny dwukolumnowy układ gazetki – czytelny, elegancki i sprawdzony przez setki szkół.", price: 45, image: PROD_IMAGES["newsletter-classic"] },
      ],
    },
    {
      id: "boze-narodzenie",
      name: "Boże Narodzenie",
      description: "Wyjątkowe materiały na Boże Narodzenie – śnieżynki, choinki i ciepła atmosfera dla szkolnej gazetki.",
      image: CAT_IMAGES["boze-narodzenie"],
      imageWebp: CAT_IMAGES["boze-narodzenie"],
      imageAlt: "Gazetka szkolna Boże Narodzenie PDF",
      features: ["Świąteczne ilustracje", "Motywy zimowe i choinkowe", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "boze-narodzenie-zestaw", name: "Zestaw świąteczny PDF", description: "Kompletny pakiet: plakaty A3 + szablony gazetki z choinką, śniegiem i gwiazdami – wszystko na jeden grudzień.", price: 55, image: PROD_IMAGES["boze-narodzenie-zestaw"] },
        { id: "boze-narodzenie-plakaty", name: "Plakaty bożonarodzeniowe PDF", description: "8 plakatów A3/A4 z ciepłymi ilustracjami świątecznymi – idealne na korytarz szkolny i salę.", price: 40, image: PROD_IMAGES["boze-narodzenie-plakaty"] },
      ],
    },
    {
      id: "zima",
      name: "Zima",
      description: "Mroźna zima w szkolnej gazetce – bałwany, płatki śniegu i ferie w kolorowych ilustracjach.",
      image: CAT_IMAGES["zima"],
      imageWebp: CAT_IMAGES["zima"],
      imageAlt: "Gazetka szkolna Zima PDF",
      features: ["Zimowe ilustracje", "Motywy śniegu i mrozu", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "zima-plakaty", name: "Plakaty zimowe PDF", description: "8 plakatów z mrozem, śniegiem i bałwanem – dekoracja szkolnego korytarza na zimę i ferie.", price: 38, image: PROD_IMAGES["zima-plakaty"] },
        { id: "zima-szablony", name: "Szablony zimowe PDF", description: "Układ gazetki z zimowym klimatem – gotowe ramki, nagłówki i tła dla redakcji szkolnej.", price: 45, image: PROD_IMAGES["zima-szablony"] },
      ],
    },
    {
      id: "mikolajki",
      name: "Mikołajki",
      description: "Gazetka szkolna na 6 grudnia – Mikołaj puka do drzwi, a w tle śnieg i prezenty pod choinką.",
      image: CAT_IMAGES["mikolajki"],
      imageWebp: CAT_IMAGES["mikolajki"],
      imageAlt: "Gazetka szkolna Mikołajki PDF",
      features: ["Motywy mikołajkowe", "Wesołe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "mikolajki-plakaty", name: "Plakaty mikołajkowe PDF", description: "8 radosnych plakatów z Mikołajem i prezentami – świetna dekoracja na szkolny korytarz 6 grudnia.", price: 38, image: PROD_IMAGES["mikolajki-plakaty"] },
        { id: "mikolajki-szablony", name: "Szablony mikołajkowe PDF", description: "Gotowy układ gazetki z mikołajkowym klimatem – nagłówki, obramowania i tła w zimowych kolorach.", price: 42, image: PROD_IMAGES["mikolajki-szablony"] },
      ],
    },
    {
      id: "walentynki",
      name: "Walentynki",
      description: "Miłość jest w szkole! Serca, listki i różowe kolory – gazetka na Walentynki z przyjaznym klimatem.",
      image: CAT_IMAGES["walentynki"],
      imageWebp: CAT_IMAGES["walentynki"],
      imageAlt: "Gazetka szkolna Walentynki PDF",
      features: ["Serca i miłosne motywy", "Przyjazny styl", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "walentynki-plakaty", name: "Plakaty walentynkowe PDF", description: "8 plakatów z sercami i różowymi akcentami – dla klasy i korytarza na 14 lutego.", price: 38, image: PROD_IMAGES["walentynki-plakaty"] },
        { id: "walentynki-szablony", name: "Szablony walentynkowe PDF", description: "Romantyczny układ gazetki szkolnej na Walentynki – gotowe obramowania, wzory tła i kształty.", price: 42, image: PROD_IMAGES["walentynki-szablony"] },
      ],
    },
    {
      id: "dzien-babci-dziadka",
      name: "Dzień Babci i Dziadka",
      description: "Serdeczne podziękowania dla babci i dziadka – ciepłe ilustracje i rodzinne motywy do szkolnej gazetki.",
      image: CAT_IMAGES["dzien-babci-dziadka"],
      imageWebp: CAT_IMAGES["dzien-babci-dziadka"],
      imageAlt: "Gazetka szkolna Dzień Babci i Dziadka PDF",
      features: ["Ciepłe ilustracje rodzinne", "Serdeczny styl", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-babci-plakaty", name: "Plakaty – Dzień Babci i Dziadka PDF", description: "8 ciepłych plakatów z różami i sercami – idealne do wydruku na 21 i 22 stycznia.", price: 38, image: PROD_IMAGES["dzien-babci-plakaty"] },
        { id: "dzien-babci-szablony", name: "Szablony – Dzień Babci i Dziadka PDF", description: "Serdeczny układ gazetki z dekoracjami kwiatowymi – gotowe do wypełnienia życzeniami.", price: 42, image: PROD_IMAGES["dzien-babci-szablony"] },
      ],
    },
    {
      id: "dzien-kobiet",
      name: "Dzień Kobiet",
      description: "Kwiaty, pastelowe kolory i celebracja kobiecości – eleganckie materiały na Dzień Kobiet dla szkolnej gazetki.",
      image: CAT_IMAGES["dzien-kobiet"],
      imageWebp: CAT_IMAGES["dzien-kobiet"],
      imageAlt: "Gazetka szkolna Dzień Kobiet PDF",
      features: ["Kwiaty i eleganckie motywy", "Kolorowe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-kobiet-plakaty", name: "Plakaty – Dzień Kobiet PDF", description: "8 kwiatowych plakatów z tulipanami i różami – piękna dekoracja szkoły na 8 marca.", price: 38, image: PROD_IMAGES["dzien-kobiet-plakaty"] },
        { id: "dzien-kobiet-szablony", name: "Szablony – Dzień Kobiet PDF", description: "Elegancki układ gazetki z kwiatowymi obramowaniami i pastelowym tłem na Dzień Kobiet.", price: 42, image: PROD_IMAGES["dzien-kobiet-szablony"] },
      ],
    },
    {
      id: "pierwszy-dzien-wiosny",
      name: "Pierwszy Dzień Wiosny",
      description: "Zima odpuszcza, wiosna wchodzi! Tulipany, motyle i soczyta zieleń na gazetce szkolnej 21 marca.",
      image: CAT_IMAGES["pierwszy-dzien-wiosny"],
      imageWebp: CAT_IMAGES["pierwszy-dzien-wiosny"],
      imageAlt: "Gazetka szkolna Pierwszy Dzień Wiosny PDF",
      features: ["Wiosenne ilustracje", "Kwiaty i motyle", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "pierwszy-dzien-wiosny-plakaty", name: "Plakaty – Pierwszy Dzień Wiosny PDF", description: "8 świeżych plakatów z kwiatami i motylami – kolorowa dekoracja klasy na powitanie wiosny.", price: 38, image: PROD_IMAGES["pierwszy-dzien-wiosny-plakaty"] },
        { id: "pierwszy-dzien-wiosny-szablony", name: "Szablony – Pierwszy Dzień Wiosny PDF", description: "Wiosenny układ gazetki z zielonymi akcentami i kwiatowymi ramkami na 21 marca.", price: 42, image: PROD_IMAGES["pierwszy-dzien-wiosny-szablony"] },
      ],
    },
    {
      id: "wielkanoc",
      name: "Wielkanoc",
      description: "Pisanki, bazie i wielkanocne baranki – wiosenna gazetka pełna radości i kolorów dla całej szkoły.",
      image: CAT_IMAGES["wielkanoc"],
      imageWebp: CAT_IMAGES["wielkanoc"],
      imageAlt: "Gazetka szkolna Wielkanoc PDF",
      features: ["Pisanki i baranki", "Wiosenne motywy", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "wielkanoc-plakaty", name: "Plakaty wielkanocne PDF", description: "8 wielkanocnych plakatów z pisankami i kurczakami – radosna dekoracja szkoły przed Wielkanocą.", price: 38, image: PROD_IMAGES["wielkanoc-plakaty"] },
        { id: "wielkanoc-szablony", name: "Szablony wielkanocne PDF", description: "Wielkanocny układ gazetki z kolorowymi pisankami w tle – gotowy do druku i wypełnienia.", price: 42, image: PROD_IMAGES["wielkanoc-szablony"] },
      ],
    },
    {
      id: "dzien-ziemi",
      name: "Dzień Ziemi",
      description: "Dbamy o planetę! Ekologiczne ilustracje, zielona przyroda i napis Chroń Ziemię – gazetka na 22 kwietnia.",
      image: CAT_IMAGES["dzien-ziemi"],
      imageWebp: CAT_IMAGES["dzien-ziemi"],
      imageAlt: "Gazetka szkolna Dzień Ziemi PDF",
      features: ["Motywy ekologiczne", "Zielone ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-ziemi-plakaty", name: "Plakaty – Dzień Ziemi PDF", description: "8 ekologicznych plakatów z motywem Ziemi i natury – świetna dekoracja szkoły na 22 kwietnia.", price: 38, image: PROD_IMAGES["dzien-ziemi-plakaty"] },
        { id: "dzien-ziemi-szablony", name: "Szablony – Dzień Ziemi PDF", description: "Zielony układ gazetki z liśćmi i globusem – gotowy szablon na Dzień Ziemi.", price: 42, image: PROD_IMAGES["dzien-ziemi-szablony"] },
      ],
    },
    {
      id: "wiosna",
      name: "Wiosna",
      description: "Kwiaty, motyle i śpiew ptaków – wiosenna gazetka szkolna pełna zieleni, kolorów i radości.",
      image: CAT_IMAGES["wiosna"],
      imageWebp: CAT_IMAGES["wiosna"],
      imageAlt: "Gazetka szkolna Wiosna PDF",
      features: ["Wiosenne ilustracje", "Kwiaty i przyroda", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "wiosna-plakaty", name: "Plakaty wiosenne PDF", description: "8 wiosennych plakatów z kwiatami i motylami – kolorowa dekoracja klasy na całą wiosnę.", price: 38, image: PROD_IMAGES["wiosna-plakaty"] },
        { id: "wiosna-szablony", name: "Szablony wiosenne PDF", description: "Wiosenny układ gazetki z zielonymi i żółtymi akcentami – gotowe ramki i tła.", price: 42, image: PROD_IMAGES["wiosna-szablony"] },
      ],
    },
    {
      id: "konstytucja-3-maja",
      name: "Konstytucja 3 Maja",
      description: "Biało-czerwone barwy i godło Polski – patriotyczna gazetka szkolna na Święto Konstytucji 3 Maja.",
      image: CAT_IMAGES["konstytucja-3-maja"],
      imageWebp: CAT_IMAGES["konstytucja-3-maja"],
      imageAlt: "Gazetka szkolna Konstytucja 3 Maja PDF",
      features: ["Patriotyczne motywy", "Flagi i symbole narodowe", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "konstytucja-plakaty", name: "Plakaty – 3 Maja PDF", description: "8 patriotycznych plakatów z flagą, orłem i datą – uroczysta dekoracja szkoły na 3 Maja.", price: 38, image: PROD_IMAGES["konstytucja-plakaty"] },
        { id: "konstytucja-szablony", name: "Szablony – 3 Maja PDF", description: "Patriotyczny układ gazetki z biało-czerwonymi akcentami i miejscem na tekst historyczny.", price: 42, image: PROD_IMAGES["konstytucja-szablony"] },
      ],
    },
    {
      id: "dzien-matki",
      name: "Dzień Matki",
      description: "Dla mamy z miłością – kwiaty, serca i życzenia w kolorowej szkolnej gazetce na 26 maja.",
      image: CAT_IMAGES["dzien-matki"],
      imageWebp: CAT_IMAGES["dzien-matki"],
      imageAlt: "Gazetka szkolna Dzień Matki PDF",
      features: ["Kwiaty i serca", "Ciepłe kolorowe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-matki-plakaty", name: "Plakaty – Dzień Matki PDF", description: "8 ciepłych plakatów z bukietami i sercami – wyjątkowa dekoracja klasy na Dzień Matki.", price: 38, image: PROD_IMAGES["dzien-matki-plakaty"] },
        { id: "dzien-matki-szablony", name: "Szablony – Dzień Matki PDF", description: "Kwiatowy układ gazetki z miejscem na życzenia i wierszyk – gotowy do druku na 26 maja.", price: 42, image: PROD_IMAGES["dzien-matki-szablony"] },
      ],
    },
    {
      id: "dzien-dziecka",
      name: "Dzień Dziecka",
      description: "Balony, kolorowe confetti i wielki uśmiech – radosna gazetka szkolna świętuje Dzień Dziecka 1 czerwca!",
      image: CAT_IMAGES["dzien-dziecka"],
      imageWebp: CAT_IMAGES["dzien-dziecka"],
      imageAlt: "Gazetka szkolna Dzień Dziecka PDF",
      features: ["Wesołe, kolorowe ilustracje", "Balony i confetti", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-dziecka-plakaty", name: "Plakaty – Dzień Dziecka PDF", description: "8 kolorowych plakatów z balonami i gwiazdkami – idealne do dekoracji szkoły na 1 czerwca.", price: 38, image: PROD_IMAGES["dzien-dziecka-plakaty"] },
        { id: "dzien-dziecka-szablony", name: "Szablony – Dzień Dziecka PDF", description: "Radosny układ gazetki z confetti i balonami w tle – gotowy szablon na Dzień Dziecka.", price: 42, image: PROD_IMAGES["dzien-dziecka-szablony"] },
      ],
    },
    {
      id: "dzien-ojca",
      name: "Dzień Ojca",
      description: "Tata to superbohater! Ciepłe i serdeczne materiały dla szkolnej gazetki na Dzień Ojca 23 czerwca.",
      image: CAT_IMAGES["dzien-ojca"],
      imageWebp: CAT_IMAGES["dzien-ojca"],
      imageAlt: "Gazetka szkolna Dzień Ojca PDF",
      features: ["Ciepłe ilustracje rodzinne", "Serdeczny styl", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-ojca-plakaty", name: "Plakaty – Dzień Ojca PDF", description: "8 serdecznych plakatów dla taty – dekoracja klasy i korytarza na Dzień Ojca.", price: 38, image: PROD_IMAGES["dzien-ojca-plakaty"] },
        { id: "dzien-ojca-szablony", name: "Szablony – Dzień Ojca PDF", description: "Elegancki układ gazetki z miejscem na życzenia dla taty – gotowy do druku na 23 czerwca.", price: 42, image: PROD_IMAGES["dzien-ojca-szablony"] },
      ],
    },
    {
      id: "lato",
      name: "Lato",
      description: "Słońce, morze i wakacje tuż za rogiem – letnia gazetka szkolna na pożegnanie roku z uśmiechem.",
      image: CAT_IMAGES["lato"],
      imageWebp: CAT_IMAGES["lato"],
      imageAlt: "Gazetka szkolna Lato PDF",
      features: ["Słońce, morze, wakacje", "Jasne kolorowe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "lato-plakaty", name: "Plakaty letnie PDF", description: "8 słonecznych plakatów z plażą i wakacjami – kolorowa dekoracja szkoły na koniec roku.", price: 38, image: PROD_IMAGES["lato-plakaty"] },
        { id: "lato-szablony", name: "Szablony letnie PDF", description: "Letni układ gazetki z falami i słońcem – idealny na czerwiec i zakończenie roku.", price: 42, image: PROD_IMAGES["lato-szablony"] },
      ],
    },
    {
      id: "zakonczenie-roku",
      name: "Zakończenie roku szkolnego",
      description: "Czas na podsumowanie – dyplomy, wspomnienia i pożegnanie klasy w wyjątkowej gazetce szkolnej.",
      image: CAT_IMAGES["zakonczenie-roku"],
      imageWebp: CAT_IMAGES["zakonczenie-roku"],
      imageAlt: "Gazetka szkolna Zakończenie roku PDF",
      features: ["Dyplomy i podziękowania", "Wspomnienia roku", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "zakonczenie-roku-plakaty", name: "Plakaty – Zakończenie roku PDF", description: "8 uroczystych plakatów z biretami i dyplomami – piękna dekoracja na zakończenie roku szkolnego.", price: 42, image: PROD_IMAGES["zakonczenie-roku-plakaty"] },
        { id: "zakonczenie-roku-szablony", name: "Szablony – Zakończenie roku PDF", description: "Uroczysty układ gazetki z miejscem na wspomnienia, ranking i życzenia na wakacje.", price: 48, image: PROD_IMAGES["zakonczenie-roku-szablony"] },
      ],
    },
    {
      id: "poczatek-roku",
      name: "Początek roku szkolnego",
      description: "Nowy rok, nowe wyzwania – tornistry spakowane, gazetka gotowa! Przywitaj wrzesień z kolorowymi plakatami.",
      image: CAT_IMAGES["poczatek-roku"],
      imageWebp: CAT_IMAGES["poczatek-roku"],
      imageAlt: "Gazetka szkolna Początek roku PDF",
      features: ["Motywy powrotu do szkoły", "Tornistry i książki", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "poczatek-roku-plakaty", name: "Plakaty – Początek roku PDF", description: "8 plakatów powitalnych z tornistrem i książkami – kolorowa dekoracja szkoły na 1 września.", price: 38, image: PROD_IMAGES["poczatek-roku-plakaty"] },
        { id: "poczatek-roku-szablony", name: "Szablony – Początek roku PDF", description: "Szkolny układ gazetki na nowy rok – plan lekcji, przedstawienie redakcji i miejsce na newsy.", price: 42, image: PROD_IMAGES["poczatek-roku-szablony"] },
      ],
    },
    {
      id: "jesien",
      name: "Jesień",
      description: "Złote liście, grzyby i jesienna mgła – ciepłe kolory i klimatyczne ilustracje dla szkolnej gazetki.",
      image: CAT_IMAGES["jesien"],
      imageWebp: CAT_IMAGES["jesien"],
      imageAlt: "Gazetka szkolna Jesień PDF",
      features: ["Jesienne ilustracje", "Ciepłe, złote kolory", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "jesien-plakaty", name: "Plakaty jesienne PDF", description: "8 jesiennych plakatów z liśćmi i grzybami – złota dekoracja klasy na wrzesień i październik.", price: 38, image: PROD_IMAGES["jesien-plakaty"] },
        { id: "jesien-szablony", name: "Szablony jesienne PDF", description: "Jesienny układ gazetki z ciepłą kolorystyką – gotowe obramowania w odcieniach złota i brązu.", price: 42, image: PROD_IMAGES["jesien-szablony"] },
      ],
    },
    {
      id: "dzien-nauczyciela",
      name: "Dzień Nauczyciela",
      description: "Dziękujemy nauczycielom! Ciepłe i eleganckie materiały na gazetę szkolną z okazji Dnia Nauczyciela.",
      image: CAT_IMAGES["dzien-nauczyciela"],
      imageWebp: CAT_IMAGES["dzien-nauczyciela"],
      imageAlt: "Gazetka szkolna Dzień Nauczyciela PDF",
      features: ["Motyw szkoły i podziękowania", "Ciepłe ilustracje", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "dzien-nauczyciela-plakaty", name: "Plakaty – Dzień Nauczyciela PDF", description: "8 eleganckich plakatów z jabłkiem i książką – wyjątkowa dekoracja szkoły na 14 października.", price: 38, image: PROD_IMAGES["dzien-nauczyciela-plakaty"] },
        { id: "dzien-nauczyciela-szablony", name: "Szablony – Dzień Nauczyciela PDF", description: "Układ gazetki z miejscem na podziękowania i sylwetki nauczycielskie – ciepły styl edukacyjny.", price: 42, image: PROD_IMAGES["dzien-nauczyciela-szablony"] },
      ],
    },
    {
      id: "halloween",
      name: "Halloween",
      description: "Boo! Dynie, duchy i pajęczyny – mroczny i zabawny klimat na szkolną gazetkę przed 31 października.",
      image: CAT_IMAGES["halloween"],
      imageWebp: CAT_IMAGES["halloween"],
      imageAlt: "Gazetka szkolna Halloween PDF",
      features: ["Dynie, duchy i pajęczyny", "Mroczny klimat", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "halloween-plakaty", name: "Plakaty Halloween PDF", description: "8 strasznych plakatów z dynią i duchem – halloweenowa dekoracja szkoły na 31 października.", price: 38, image: PROD_IMAGES["halloween-plakaty"] },
        { id: "halloween-szablony", name: "Szablony Halloween PDF", description: "Mroczny układ gazetki z pajęczynami i duchem w tle – gotowy do zastraszania czytelników.", price: 42, image: PROD_IMAGES["halloween-szablony"] },
      ],
    },
    {
      id: "andrzejki",
      name: "Andrzejki",
      description: "Wróżby, kula i magiczne gwiazdy – tajemnicza noc andrzejkowa ożywa na szkolnej gazetce!",
      image: CAT_IMAGES["andrzejki"],
      imageWebp: CAT_IMAGES["andrzejki"],
      imageAlt: "Gazetka szkolna Andrzejki PDF",
      features: ["Motywy wróżbiarskie", "Gwiazdy i magiczne symbole", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "andrzejki-plakaty", name: "Plakaty andrzejkowe PDF", description: "8 tajemniczych plakatów z kulą, gwiazdami i wróżbami – klimatyczna dekoracja na 30 listopada.", price: 38, image: PROD_IMAGES["andrzejki-plakaty"] },
        { id: "andrzejki-szablony", name: "Szablony andrzejkowe PDF", description: "Mistyczny układ gazetki z miejscem na wróżby i zdjęcia z andrzejkowej zabawy szkolnej.", price: 42, image: PROD_IMAGES["andrzejki-szablony"] },
      ],
    },
    {
      id: "niepodleglosc",
      name: "Dzień Niepodległości",
      description: "Polska walczy, Polska zwycięża – patriotyczna gazetka szkolna na 11 listopada z orłem i biało-czerwonymi.",
      image: CAT_IMAGES["niepodleglosc"],
      imageWebp: CAT_IMAGES["niepodleglosc"],
      imageAlt: "Gazetka szkolna Dzień Niepodległości PDF",
      features: ["Flagi i symbole narodowe", "Patriotyczne motywy", "Formaty A3 i A4", "Gotowy plik PDF"],
      products: [
        { id: "niepodleglosc-plakaty", name: "Plakaty – 11 Listopada PDF", description: "8 patriotycznych plakatów z orłem i flagą – uroczysta dekoracja szkoły na Dzień Niepodległości.", price: 38, image: PROD_IMAGES["niepodleglosc-plakaty"] },
        { id: "niepodleglosc-szablony", name: "Szablony – 11 Listopada PDF", description: "Patriotyczny układ gazetki z biało-czerwonymi akcentami i miejscem na historyczne treści.", price: 42, image: PROD_IMAGES["niepodleglosc-szablony"] },
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

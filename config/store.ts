export type ProductId = "poster" | "poster-a4" | "newsletter" | "newsletter-classic";
export type CategoryId = "plakaty" | "szablony";

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
      features: [
        "Formaty A3 i A4",
        "Wysoka rozdzielczość do druku (300 DPI)",
        "Estetyczne ilustracje szkolne",
        "Gotowy plik PDF – bez edycji",
      ],
      products: [
        {
          id: "poster",
          name: "Plakaty szkolne PDF",
          description: "Zestaw plakatów A3 do gazetki szkolnej.",
          price: 45,
          image: PRODUCT_IMAGES.poster,
        },
        {
          id: "poster-a4",
          name: "Plakaty szkolne PDF (A4)",
          description: "Zestaw plakatów A4 do gazetki szkolnej.",
          price: 35,
          image: PRODUCT_IMAGES.poster,
        },
      ],
    },
    {
      id: "szablony",
      name: "Szablony gazetki",
      description: "Profesjonalne szablony gotowe do druku – idealne dla każdej szkolnej redakcji.",
      image: PRODUCT_IMAGES.newsletter,
      imageWebp: PRODUCT_IMAGES.newsletterWebp,
      imageAlt: "Szablony gazetki PDF",
      features: [
        "Wiele układów stron do wyboru",
        "Formaty A3 i A4",
        "Profesjonalna typografia i kolory",
        "Gotowy plik PDF – bez edycji",
      ],
      products: [
        {
          id: "newsletter",
          name: "Szablony gazetki PDF",
          description: "Gotowe szablony gazetki szkolnej PDF do szybkiego druku.",
          price: 52,
          image: PRODUCT_IMAGES.newsletter,
        },
        {
          id: "newsletter-classic",
          name: "Szablon klasyczny PDF",
          description: "Klasyczny układ gazetki szkolnej w formacie PDF.",
          price: 45,
          image: PRODUCT_IMAGES.newsletter,
        },
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

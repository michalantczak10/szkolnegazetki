// @ts-ignore
import { renderCartList, showCartError } from "./modules/cart.js";
import { setupParcelAutocomplete } from "./modules/autocomplete.js";
import { initCookieConsentBanner } from "./modules/cookie-consent.js";
import { STORE_CONFIG, getProductConfig } from "./config/store.js";
// Renderuje podsumowanie zamówienia w sekcji checkout-summary (analogicznie do modala i mini-koszyka)

// Deklaracja checkoutFormEl na poziomie modułu, przed pierwszym użyciem
const checkoutFormEl = document.getElementById("checkoutForm") as HTMLFormElement | null;

const API_BASE_URL = (() => {
  const host = window.location.hostname.toLowerCase();
  if (host === "galaretkarnia.pl" || host === "www.galaretkarnia.pl") {
    return "https://galaretkarnia.onrender.com";
  }
  return "";
})();

function buildApiUrl(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

function renderCheckoutSummary() {
  const summaryEl = document.getElementById("checkoutSummary");
  if (!summaryEl) return;
  summaryEl.innerHTML = "";

  // Jeśli zamówienie jest puste, pokaż tylko komunikat i ukryj przycisk "Wyczyść koszyk"
  if (cart.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "checkout-summary-empty";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.padding = "40px 0 32px 0";
    emptyMsg.style.color = "#b30000";
    emptyMsg.style.fontWeight = "bold";
    emptyMsg.style.fontSize = "1.2em";
    // Większa ikona zamówienia i zachęta
    emptyMsg.innerHTML = `
      <span style="font-size:4em;display:block;margin-bottom:12px;">🛒</span>
      <div style="font-size:1.3em;margin-bottom:8px;">Zamówienie nie zawiera wybranego produktu.</div>
      <div style="font-size:1.05em;color:#444;margin-bottom:18px;font-weight:400;">Dodaj produkty przed złożeniem zamówienia.</div>
    `;
    // Przycisk "Przeglądaj produkty"
    const browseBtn = document.createElement("button");
    browseBtn.type = "button";
    browseBtn.textContent = "Przeglądaj produkty";
    browseBtn.className = "browse-products-btn";
    browseBtn.setAttribute("data-testid", "btn-browse-offer");
    // Scroll do sekcji z produktami (id="products" lub class="products-section")
    browseBtn.onclick = () => {
      const productsSection = document.getElementById("products") || document.querySelector(".products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    };
    emptyMsg.appendChild(browseBtn);
    summaryEl.appendChild(emptyMsg);
    // Ukryj przycisk "Wyczyść koszyk" jeśli istnieje
    const clearBtn = document.getElementById("clearCartBtn") as HTMLButtonElement | null;
    if (clearBtn) clearBtn.style.display = "none";
    return;
  }

  // Obliczenia tylko jeśli koszyk nie jest pusty
  const productsTotal = getCartTotalPrice();
  const deliveryInfo = getDeliveryInfo(productsTotal);
  const totalWithDelivery = productsTotal + deliveryInfo.finalCost;
  const itemsCount = getTotalItemsCount();
  const parcelInfo = deliveryInfo.numberOfParcels > 1 ? `${deliveryInfo.numberOfParcels} paczki` : `1 paczka`;

  // Przywróć renderowanie listy produktów
  const productsList = document.createElement("div");
  productsList.className = "checkout-summary-products";
  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "checkout-summary-product-row";
    // Wybierz odpowiedni opis ilości
    let qtyLabel = "sztuk";
    if (item.qty === 1) qtyLabel = "sztuka";
    else if (item.qty >= 2 && item.qty <= 4) qtyLabel = "sztuki";
    // Dodaj ikonkę produktu jeśli jest
    let imgHtml = "";
    if (item.image) {
      imgHtml = `<img src="${item.image}" alt="${item.name}" class="checkout-summary-product-img" style="width:32px;height:32px;object-fit:cover;margin-right:8px;vertical-align:middle;">`;
    }
    // Przyciski: - ilość + x (w jednej linii, jak dawniej)
    const btnsHtml = `
      <div class="checkout-summary-product-actions" style="display:flex;align-items:center;gap:2px;">
        <button class="cart-btn cart-btn-decrease" title="Zmniejsz ilość" onclick="window.decreaseQty('${item.name.replace(/'/g, "\\'")}')" style="min-width:32px;height:40px;background:#b30000;color:#fff;font-size:1.2em;border-radius:8px;">-</button>
        <span class="checkout-summary-product-qty" style="min-width:24px;text-align:center;display:inline-block;font-size:1.1em;">${item.qty}</span>
        <button class="cart-btn cart-btn-increase" title="Zwiększ ilość" onclick="window.increaseQty('${item.name.replace(/'/g, "\\'")}')" style="min-width:32px;height:40px;background:#b30000;color:#fff;font-size:1.2em;border-radius:8px;">+</button>
        <button class="cart-btn cart-btn-remove" title="Usuń produkt" onclick="window.removeItem('${item.name.replace(/'/g, "\\'")}')" style="min-width:32px;height:40px;background:#e74c3c;color:#fff;font-size:1.2em;border-radius:8px;margin-left:8px;">×</button>
      </div>
    `;
    // Układ 2-wierszowy: nazwa/szczegóły + akcje, a pod spodem stabilna linia "Razem"
    row.innerHTML = `
      <div class="checkout-summary-product-main">
        ${imgHtml}
        <div class="checkout-summary-product-meta">
          <span class="checkout-summary-product-name" style="font-weight:600;font-size:1.1em;">${item.name}</span>
          <span class="checkout-summary-product-unit" style="color:#444;font-size:1em;">${item.qty} ${qtyLabel}. × ${item.price} zł</span>
        </div>
        ${btnsHtml}
      </div>
      <div class="checkout-summary-product-total">Razem: ${item.qty * item.price} zł</div>
    `;
    row.style.textAlign = "left";
    productsList.appendChild(row);
  });
  summaryEl.appendChild(productsList);

  // Upewnij się, że przycisk "Wyczyść koszyk" jest widoczny
  const clearBtnShow = document.getElementById("clearCartBtn") as HTMLButtonElement | null;
  if (clearBtnShow) clearBtnShow.style.display = "";

function scrollToCheckout() {
  checkoutFormEl?.scrollIntoView({ behavior: "smooth" });
}
window.scrollToCheckout = scrollToCheckout;

  // Linia oddzielająca
  const hr1 = document.createElement("hr");
  hr1.className = "checkout-summary-hr";
  summaryEl.appendChild(hr1);

  // Suma produktów
  const productsLine = document.createElement("div");
  productsLine.innerHTML = `<strong>Produkty w koszyku:</strong> ${productsTotal} zł`;
  productsLine.className = "checkout-summary-total-line";
  summaryEl.appendChild(productsLine);

  // Dostawa (koszt)
  const deliveryCostLine = document.createElement("div");
  deliveryCostLine.className = "checkout-summary-delivery-cost-line";
  if (deliveryInfo.finalCost === 0) {
    deliveryCostLine.innerHTML = `<span class="checkout-summary-gratis-label"><strong>Dostawa:</strong> <span class="checkout-summary-gratis">GRATIS!</span></span>`;
  } else {
    deliveryCostLine.innerHTML = `<span><strong>Dostawa:</strong> <span class="checkout-summary-delivery-cost">${deliveryInfo.finalCost} zł</span></span>`;
  }
  summaryEl.appendChild(deliveryCostLine);

  // Szczegóły dostawy
  const deliveryLine = document.createElement("div");
  deliveryLine.innerHTML = `<strong>Szczegóły dostawy:</strong> ${parcelInfo}, ${itemsCount} szt.`;
  deliveryLine.className = "checkout-summary-delivery-line";
  summaryEl.appendChild(deliveryLine);

  // Linia oddzielająca
  const hr2 = document.createElement("hr");
  hr2.className = "checkout-summary-hr";
  summaryEl.appendChild(hr2);

  // Suma do zapłaty
  const totalLine = document.createElement("div");
  totalLine.innerHTML = `<span class="checkout-summary-final-label">Do zapłaty:</span> <span class="checkout-summary-final">${totalWithDelivery} zł</span>`;
  totalLine.className = "checkout-summary-final-line";
  summaryEl.appendChild(totalLine);

  // Przycisk Wyczyść koszyk (dynamicznie stylowany i aktywowany)
  const clearBtnEl = document.getElementById("clearCartBtn") as HTMLButtonElement | null;
  if (!clearBtnEl) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "clearCartBtn";
    btn.className = "cart-checkout-btn clear-cart-btn";
    btn.setAttribute("data-testid", "btn-clear-cart");
    btn.textContent = "Wyczyść koszyk";
    btn.addEventListener("mouseenter", () => {
      if (!btn.disabled) {
        btn.style.background = "linear-gradient(90deg,#b30000 0%,#e74c3c 100%)";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (!btn.disabled) {
        btn.style.background = "linear-gradient(90deg,#e74c3c 0%,#b30000 100%)";
      }
    });
    btn.addEventListener("click", () => {
      if (!btn.disabled) window.clearCart();
    });
    const actionsRow = document.createElement("div");
    actionsRow.className = "checkout-actions-row";
    actionsRow.appendChild(btn);
    summaryEl.appendChild(actionsRow);
    setClearBtnState(btn);
  } else {
    setClearBtnState(clearBtnEl);
  }

  function setClearBtnState(btn: HTMLButtonElement) {
    if (cart.length === 0) {
      btn.disabled = true;
      btn.style.opacity = "0.7";
      btn.style.cursor = "not-allowed";
      btn.style.background = "#f2f2f2";
      btn.style.color = "#aaa";
      btn.title = "Koszyk jest pusty";
    } else {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
      btn.style.background = "linear-gradient(90deg,#e74c3c 0%,#b30000 100%)";
      btn.style.color = "#fff";
      btn.title = "Usuń wszystkie produkty z koszyka";
    }
  }
}
// Modal potwierdzenia zamówienia
// Globalna deklaracja koszyka (naprawa błędu 'Cannot find name cart')
var cart: { name: string; price: number; qty: number; image?: string }[] = [];

// Funkcje pomocnicze używane w showOrderConfirmationModal
function getCartTotalPrice(): number {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}
function getDeliveryInfo(totalPrice: number): any {
  // Przyjmujemy, że do jednej paczki mieści się skonfigurowana liczba sztuk
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const numberOfParcels = Math.ceil(totalItems / STORE_CONFIG.delivery.itemsPerParcel);
  return {
    finalCost: totalPrice > STORE_CONFIG.delivery.freeThreshold ? 0 : STORE_CONFIG.delivery.baseCost,
    numberOfParcels,
  };
}
function getTotalItemsCount(): number {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

type OrderConfirmationData = {
  orderRef?: string;
  orderId?: string;
  status?: string;
  orderTotal?: string;
  total?: string;
  transferTitle?: string;
  paymentTarget?: string;
};

function showOrderConfirmationModal(data: OrderConfirmationData) {
  // Usuń istniejący modal jeśli jest
  const existing = document.getElementById('order-confirm-modal');
  if (existing) existing.remove();

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'order-confirm-modal';
  overlay.className = 'order-confirm-modal-overlay';

  // Modal
  const modal = document.createElement('div');
  modal.className = 'order-confirm-modal';

  // Usunięto przycisk zamykania (X)

  // Body
  const body = document.createElement('div');
  body.className = 'order-confirm-modal-body';
  // Wyciągnij numer zamówienia po myślniku lub cały jeśli nie ma myślnika
  let orderNum = (data.orderRef || data.orderId || '').toString();
  if (orderNum.includes('-')) orderNum = orderNum.split('-').pop();
  // Oblicz faktyczną kwotę do zapłaty (łącznie z dostawą)
  const productsTotal = getCartTotalPrice();
  const deliveryInfo = getDeliveryInfo(productsTotal);
  const totalWithDelivery = productsTotal + deliveryInfo.finalCost;
  // Formatuj dane płatności w zależności od metody
  let paymentDetailsHTML = '';
  if (data.paymentTarget) {
    if (data.paymentTarget.includes('BLIK')) {
      const blikPhone = data.paymentTarget.replace(/^BLIK na telefon:\s*/i, '').trim();
      paymentDetailsHTML = `
        <div class="order-confirm-modal-summary-row"><b>Odbiorca:</b><br><span class="order-confirm-modal-payment">Galaretkarnia</span></div>
        <div class="order-confirm-modal-summary-row"><b>Numer telefonu:</b><br><span class="order-confirm-modal-payment">${blikPhone}</span></div>
      `;
    } else if (data.paymentTarget.includes('Galaretkarnia')) {
      const accountNum = data.paymentTarget.replace(/ \(Galaretkarnia\)/, '').trim();
      paymentDetailsHTML = `
        <div class="order-confirm-modal-summary-row"><b>Odbiorca:</b><br><span class="order-confirm-modal-payment">Galaretkarnia</span></div>
        <div class="order-confirm-modal-summary-row"><b>Numer konta:</b><br><span class="order-confirm-modal-payment">${accountNum}</span></div>
      `;
    } else {
      paymentDetailsHTML = `<div class="order-confirm-modal-summary-row"><b>Dane do płatności:</b><br><span class="order-confirm-modal-payment">${data.paymentTarget}</span></div>`;
    }
  }

  body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:18px;">
      <span style="font-size:2.7em;line-height:1;">🎉</span>
      <div class="order-confirm-modal-thankyou" style="margin:0;font-size:1.22em;">Zamówienie przyjęte!</div>
      <div style="font-size:1.13em;color:#b30000;font-weight:700;">Dziękujemy za zakupy w <b>Galaretkarnia.pl</b></div>
    </div>
    <div class="order-confirm-modal-summary-row"><b>Numer zamówienia:</b><br><span class="order-confirm-modal-ref">${orderNum}</span></div>
    <div class="order-confirm-modal-summary-row"><b>Do zapłaty:</b><br><span class="order-confirm-modal-total">${totalWithDelivery} zł</span></div>
    <div class="order-confirm-modal-summary-row"><b>Tytuł przelewu:</b><br><span class="order-confirm-modal-transfer">Zamówienie ${orderNum}</span></div>
    ${paymentDetailsHTML}
    <div class="order-confirm-modal-info" style="text-align:center;margin-top:10px;">Zamówienie zostanie zrealizowane po zaksięgowaniu wpłaty.</div>
  `;
  modal.appendChild(body);

  // Sekcja podsumowania zamówienia
  // Lista produktów z ikoną jak w podsumowaniu zamówienia
  const productsList = document.createElement('div');
  productsList.className = 'checkout-summary-products checkout-summary-products-nodots';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'checkout-summary-product-row';
    let qtyLabel = "sztuk";
    if (item.qty === 1) qtyLabel = "sztuka";
    else if (item.qty >= 2 && item.qty <= 4) qtyLabel = "sztuki";
    let imgHtml = "";
    if (item.image) {
      imgHtml = `<img src="${item.image}" alt="${item.name}" class="checkout-summary-product-img" style="width:32px;height:32px;object-fit:cover;margin-right:8px;vertical-align:middle;">`;
    }
    row.innerHTML = `${imgHtml}<span class="checkout-summary-product-name">${item.name}</span> — <span class="checkout-summary-product-qty">${item.qty} ${qtyLabel}</span> × <span class="checkout-summary-product-price">${item.price} zł</span>`;
    productsList.appendChild(row);
  });
  modal.appendChild(productsList);

  // Actions (OK button)
  const actions = document.createElement('div');
  actions.className = 'order-confirm-modal-actions';
  const okBtn = document.createElement('button');
  okBtn.className = 'browse-products-btn clear-cart-btn';
  okBtn.textContent = 'OK';
  okBtn.style.margin = '0 auto';
  const closeModal = () => {
    overlay.remove();
    document.removeEventListener('keydown', escHandler);
    // Wyczyść dane formularza zamówienia
    const form = document.getElementById('checkoutForm') as HTMLFormElement | null;
    if (form) form.reset();
    // Wyczyść komunikaty walidacyjne, jeśli są
    const msg = document.getElementById('checkoutMessage');
    if (msg) msg.innerHTML = '';
  };
  function escHandler(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      closeModal();
    }
  }
  okBtn.addEventListener('click', () => {
    closeModal();
  });
  actions.appendChild(okBtn);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Nie zamykamy modala po kliknięciu w tło, żeby użytkownik nie stracił danych płatności.
  // Zamknięcie tylko przez OK lub ESC.
  document.addEventListener('keydown', escHandler);
}
// Globalna deklaracja miniCart (tylko jedna w całym pliku!)
var miniCart: HTMLElement | null = null;
// Wymuś globalność także dla JS
(window as any).miniCart = null;

declare global {
  interface Window {
    showToast: (msg: string) => void;
    decreaseQty: (name: string) => void;
    increaseQty: (name: string) => void;
    removeItem: (name: string) => void;
    getTotalItemsCount: () => number;
    clearCart: () => Promise<void>;
    scrollToCheckout: () => void;
  }
}


window.addEventListener("DOMContentLoaded", () => {
  initCookieConsentBanner();

    function applyPublicStoreConfig() {
      document.querySelectorAll("[data-store-general-email]").forEach((node) => {
        if (!(node instanceof HTMLAnchorElement)) return;
        node.href = `mailto:${STORE_CONFIG.contact.generalEmail}`;
        node.textContent = STORE_CONFIG.contact.generalEmail;
      });

      document.querySelectorAll("[data-store-complaints-email]").forEach((node) => {
        if (!(node instanceof HTMLAnchorElement)) return;
        node.href = `mailto:${STORE_CONFIG.contact.complaintsEmail}`;
        node.textContent = STORE_CONFIG.contact.complaintsEmail;
      });

      document.querySelectorAll("[data-store-phone]").forEach((node) => {
        if (!(node instanceof HTMLAnchorElement)) return;
        node.href = STORE_CONFIG.contact.phoneHref;
        node.textContent = STORE_CONFIG.contact.phoneDisplay;
      });

      document.querySelectorAll("[data-store-fulfillment-hours]").forEach((node) => {
        node.textContent = STORE_CONFIG.contact.fulfillmentHours;
      });

      document.querySelectorAll(".product-card[data-product-id]").forEach((cardNode) => {
        if (!(cardNode instanceof HTMLElement)) return;
        const productId = cardNode.dataset.productId || "";
        const product = getProductConfig(productId);
        if (!product) return;

        const imageEl = cardNode.querySelector("[data-product-image]") as HTMLImageElement | null;
        const nameEl = cardNode.querySelector("[data-product-name]") as HTMLElement | null;
        const descriptionEl = cardNode.querySelector("[data-product-description]") as HTMLElement | null;
        const priceEl = cardNode.querySelector("[data-product-price]") as HTMLElement | null;
        const buttonEl = cardNode.querySelector(".addToCartBtn") as HTMLButtonElement | null;

        if (imageEl) {
          imageEl.src = product.image;
          imageEl.alt = product.name;
        }
        if (nameEl) nameEl.textContent = product.name;
        if (descriptionEl) descriptionEl.textContent = product.description;
        if (priceEl) priceEl.textContent = `${product.price} zł`;
        if (buttonEl) {
          buttonEl.dataset.productId = product.id;
          buttonEl.dataset.product = product.name;
          buttonEl.dataset.price = String(product.price);
          buttonEl.dataset.image = product.image;
          buttonEl.setAttribute("aria-label", `Dodaj ${product.name} do zamówienia`);
        }
      });
    }

    applyPublicStoreConfig();

    const legalTocLinks = document.querySelectorAll('nav[aria-label="Spis treści"] a[href^="#"]') as NodeListOf<HTMLAnchorElement>;
    const LEGAL_SCROLL_OFFSET = 24;

    const scrollToLegalHash = (hash: string, pushHash = false) => {
      if (!hash || !hash.startsWith("#")) return;
      const target = document.querySelector(hash) as HTMLElement | null;
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - LEGAL_SCROLL_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      if (pushHash) {
        history.replaceState(null, "", hash);
      }
    };

    if (legalTocLinks.length > 0) {
      legalTocLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          const hash = link.getAttribute("href") || "";
          if (!hash.startsWith("#")) return;
          event.preventDefault();
          scrollToLegalHash(hash, true);
        });
      });

      if (window.location.hash) {
        setTimeout(() => scrollToLegalHash(window.location.hash), 0);
      } else {
        // Jeśli brak hasha, scroll do górnych strony (do hero)
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    // Konfiguracja płatności (możesz rozbudować o pobieranie z backendu)
    const paymentConfig = STORE_CONFIG.payment;

    function renderPaymentInstructions() {
      if (!paymentInstructions || !paymentMethod) return;
      if (paymentMethod.value === "blik") {
        paymentInstructions.innerHTML = `
          <p><strong>Odbiorca:</strong> ${paymentConfig.accountHolder}</p>
          <p><strong>Numer telefonu:</strong> ${paymentConfig.blikPhone}</p>
          <p><small>W tytule wpisz numer zamówienia po jego utworzeniu.</small></p>
        `;
        return;
      }
      paymentInstructions.innerHTML = `
        <p><strong>Odbiorca:</strong> ${paymentConfig.accountHolder}</p>
        <p><strong>Numer konta:</strong> ${paymentConfig.accountNumber}</p>
        <p><small>W tytule wpisz numer zamówienia po jego utworzeniu.</small></p>
      `;
    }
  // Automatyczne ładowanie koszyka z localStorage
  const STORAGE_KEY = "cartStorage";
  const savedCart = localStorage.getItem(STORAGE_KEY);
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      const productImageByName = new Map(
        STORE_CONFIG.products.map((product) => [product.name, product.image]),
      );
      if (Array.isArray(parsedCart)) {
        cart = parsedCart
          .filter((item): item is { name: string; price: number; qty: number; image?: string } => {
            return !!item && typeof item.name === "string" && typeof item.price === "number" && typeof item.qty === "number";
          })
          .map((item) => {
            const fallbackImage = productImageByName.get(item.name);
            const hasLegacyImagePath = typeof item.image === "string" && item.image.startsWith("img/products/");
            return {
              ...item,
              image: !item.image || hasLegacyImagePath ? fallbackImage : item.image,
            };
          });
      } else {
        cart = [];
      }
    } catch {
      cart = [];
    }
  }

  const parcelSearchInput = document.getElementById("parcelSearchQuery") as HTMLInputElement | null;
  // Dodaj margines pod etykietą 'Wyszukaj paczkomat', jeśli istnieje
  const parcelSearchLabel = document.querySelector("label[for='parcelSearchQuery']") as HTMLElement | null;
  if (parcelSearchLabel) {
    parcelSearchLabel.style.marginBottom = "12px";
    parcelSearchLabel.style.display = "block";
  }

  const parcelLockerCodeInput = document.getElementById("parcelLockerCode") as HTMLInputElement | null;
  if (!parcelSearchInput || !parcelLockerCodeInput) return;
  const searchWrapper = parcelSearchInput.parentElement as HTMLElement;
  searchWrapper.style.position = "relative";
  const searchAutocompleteBox = document.createElement("div");
  searchAutocompleteBox.className = "autocomplete-box";
  searchAutocompleteBox.style.display = "none";
  searchAutocompleteBox.style.width = parcelSearchInput.offsetWidth + "px";
  searchWrapper.appendChild(searchAutocompleteBox);

  let parcelLockers: any[] = [];
  let parcelLockersPromise: Promise<void> | null = null;
  let autocompleteInitialized = false;
  const loadParcelLockers = () => {
    if (parcelLockersPromise) return parcelLockersPromise;

    parcelLockersPromise = fetch("parcelLockers.json")
      .then((res) => res.json())
      .then((data) => {
        // Mapuj dane z JSON-a na oczekiwane przez autocomplete pola.
        parcelLockers = data.map((locker: any) => ({
          code: locker.n,
          name: `${locker.c}${locker.e ? ", " + locker.e : ""}${locker.b ? " " + locker.b : ""}`.trim(),
          address: locker.d || ""
        }));

        if (!autocompleteInitialized) {
          setupParcelAutocomplete(parcelLockers, parcelSearchInput, parcelLockerCodeInput, searchAutocompleteBox);
          autocompleteInitialized = true;
        }
      })
      .catch((error) => {
        parcelLockers = [];
        showCartError("Nie udało się pobrać listy paczkomatów.", searchAutocompleteBox);
        console.warn("Nie udało się pobrać listy paczkomatów.", error);
      });

    return parcelLockersPromise;
  };

  // Odłóż pobranie dużego JSON-a do pierwszej interakcji użytkownika z polami paczkomatu.
  parcelSearchInput.addEventListener("focus", () => {
    void loadParcelLockers();
  }, { once: true });
  parcelSearchInput.addEventListener("input", () => {
    void loadParcelLockers();
  }, { once: true });
  parcelLockerCodeInput.addEventListener("focus", () => {
    void loadParcelLockers();
  }, { once: true });

  // localStorage.removeItem(STORAGE_KEY); // Usunięto czyszczenie koszyka przy starcie strony (UX)

  // Usunięto renderowanie mini-koszyka (cartList)


  // ...existing code...
  const addButtons = document.querySelectorAll(".addToCartBtn") as NodeListOf<HTMLButtonElement>;
  const checkoutFormEl = document.getElementById("checkoutForm") as HTMLFormElement | null;
  const checkoutMessage = document.getElementById("checkoutMessage") as HTMLElement | null;
  const paymentMethod = document.getElementById("paymentMethod") as HTMLSelectElement | null;
  const paymentInstructions = document.getElementById("paymentInstructions") as HTMLElement | null;
  const parcelSearchQuery = document.getElementById("parcelSearchQuery") as HTMLInputElement | null;
  const customerPhone = document.getElementById("customerPhone") as HTMLInputElement | null;
  const customerNotes = document.getElementById("customerNotes") as HTMLTextAreaElement | null;
  const openParcelSearchBtn = document.getElementById("openParcelSearchBtn") as HTMLButtonElement | null;
  let validatePhone = (_showMsg = true) => true;
  let validateParcelLockerCode = (_showMsg = true) => true;
  let validateOrderNotes = (_showMsg = true) => true;
  const CART_SCROLL_OFFSET = 20;

  // MASKA I WALIDACJA NA NUMER TELEFONU (format 000 000 000)
  if (customerPhone !== null) {
    const phoneError = document.getElementById("phoneError");
    validatePhone = (showMsg = true) => {
      if (!customerPhone) return false;
      const raw = customerPhone.value.replace(/\D/g, "");
      let msg = "";
      if (raw.length === 0) {
        msg = "Podaj numer telefonu.";
      } else if (raw.length < 9) {
        msg = "Numer telefonu musi mieć 9 cyfr.";
      } else if (!/^[5-8]/.test(raw)) {
        msg = "Numer powinien zaczynać się od 5, 6, 7 lub 8.";
      }
      if (phoneError && showMsg) phoneError.textContent = msg;
      return msg === "";
    };
    customerPhone.addEventListener("input", () => {
      if (!customerPhone) return;
      let value = customerPhone.value.replace(/\D/g, "");
      if (value.length > 9) value = value.slice(0, 9);
      let formatted = value;
      if (value.length > 6) {
        formatted = value.slice(0, 3) + " " + value.slice(3, 6) + " " + value.slice(6);
      } else if (value.length > 3) {
        formatted = value.slice(0, 3) + " " + value.slice(3);
      }
      customerPhone.value = formatted;
      validatePhone();
    });
    customerPhone.addEventListener("blur", () => {
      if (!customerPhone) return;
      validatePhone();
    });
  }

  // WALIDACJA KODU PACZKOMATU (na żywo, analogicznie do telefonu)
  if (parcelLockerCodeInput) {
    const lockerError = document.getElementById("lockerError");
    validateParcelLockerCode = (showMsg = true) => {
      const value = parcelLockerCodeInput.value.trim().toUpperCase();
      let msg = "";
      if (value.length === 0) {
        msg = "Podaj kod paczkomatu.";
      } else if (!/^[A-Z0-9]{6,}$/.test(value)) {
        msg = "Kod paczkomatu musi mieć min. 6 znaków (litery i cyfry).";
      } else if (parcelLockers.length > 0 && !parcelLockers.some(locker => locker.code === value)) {
        msg = "Podany kod paczkomatu nie istnieje. Wybierz poprawny paczkomat z listy.";
      }
      if (showMsg && lockerError) lockerError.textContent = msg;
      return msg === "";
    };

    parcelLockerCodeInput.addEventListener("input", () => {
      parcelLockerCodeInput.value = parcelLockerCodeInput.value.toUpperCase().replace(/\s+/g, "");
      validateParcelLockerCode();
    });

    parcelLockerCodeInput.addEventListener("blur", () => {
      validateParcelLockerCode();
    });
  }

  // WALIDACJA UWAG DO ZAMÓWIENIA
  if (customerNotes) {
    const notesError = document.getElementById("notesError");
    const notesCounter = document.getElementById("notesCounter");
    const NOTES_MAX_LENGTH = 300;
    const NOTES_WARNING_THRESHOLD = 260;
    const updateNotesCounter = () => {
      if (!notesCounter) return;
      const currentLength = customerNotes.value.length;
      notesCounter.textContent = `${currentLength} / ${NOTES_MAX_LENGTH}`;
      notesCounter.classList.toggle("is-warning", currentLength >= NOTES_WARNING_THRESHOLD && currentLength < NOTES_MAX_LENGTH);
      notesCounter.classList.toggle("is-limit", currentLength >= NOTES_MAX_LENGTH);
    };
    validateOrderNotes = (showMsg = true) => {
      const value = customerNotes.value;
      let msg = "";
      if (value.length > NOTES_MAX_LENGTH) {
        msg = `Uwagi mogą mieć maksymalnie ${NOTES_MAX_LENGTH} znaków.`;
      } else if (/[<>]/.test(value)) {
        msg = "Uwagi nie mogą zawierać znaków < ani >.";
      } else if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
        msg = "Uwagi zawierają niedozwolone znaki.";
      }
      if (showMsg && notesError) notesError.textContent = msg;
      return msg === "";
    };

    customerNotes.addEventListener("input", () => {
      if (customerNotes.value.length > NOTES_MAX_LENGTH) {
        customerNotes.value = customerNotes.value.slice(0, NOTES_MAX_LENGTH);
      }
      updateNotesCounter();
      validateOrderNotes();
    });

    customerNotes.addEventListener("blur", () => {
      validateOrderNotes();
    });

    updateNotesCounter();
  }

  // Przypisz miniCart po wszystkich deklaracjach (do globalnej zmiennej!)
  // miniCart = document.querySelector(".mini-cart") as HTMLElement | null;
  // (window as any).miniCart = miniCart;

  // Usunięto obsługę cartList (mini-koszyk)
  // if (!miniCart) console.warn("Brak elementu miniCart");
  if (!checkoutFormEl) console.warn("Brak elementu checkoutFormEl");
  if (!paymentMethod) console.warn("Brak elementu paymentMethod");
  if (!parcelSearchQuery) console.warn("Brak elementu parcelSearchQuery");
  if (!openParcelSearchBtn) console.warn("Brak elementu openParcelSearchBtn");
  if (!customerPhone) console.warn("Brak elementu customerPhone");
  if (!customerNotes) console.warn("Brak elementu customerNotes");

  // Obsługa przycisku "Wyczyść koszyk" tylko w podsumowaniu
  const clearCartBtn = document.querySelector(".checkout-summary .browse-products-btn.clear-cart-btn") as HTMLButtonElement | null;
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      window.clearCart();
    });
  }

  // Obsługa przycisku "Zamawiam teraz" tylko w formularzu (submit obsługiwany przez event na formie)

  // ...pozostała logika bez zmian...

function showToast(message: string) {
  const TOAST_DURATION_MS = 3000;
  const TOAST_ANIMATION_MS = 180;
  const getToastVariant = (text: string) => {
    if (/dodano|zapisano|wysłano|gotowe|udane/i.test(text)) return 'success';
    if (/usun|wyczyść|wyczyszcz|brak|popraw|błąd|nie udało|nieprawidł/i.test(text)) return 'warning';
    return 'info';
  };
  const getToastIcon = (text: string, variant: string) => {
    if (/usun|wyczyść|wyczyszcz/i.test(text)) return '🗑️';
    if (variant === 'success') return '✅';
    if (variant === 'warning') return '⚠️';
    return 'ℹ️';
  };

  let toast = document.getElementById('toastMessage');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastMessage';
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true"></span>
      <span class="toast-text"></span>
    `;
    document.body.appendChild(toast);
  }

  const variant = getToastVariant(message);
  const icon = getToastIcon(message, variant);
  const iconEl = toast.querySelector('.toast-icon') as HTMLElement | null;
  const textEl = toast.querySelector('.toast-text') as HTMLElement | null;

  if (iconEl) iconEl.textContent = icon;
  if (textEl) textEl.textContent = message;

  toast.classList.remove('toast-success', 'toast-warning', 'toast-info');
  toast.classList.add(`toast-${variant}`);

  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      toast?.classList.remove('toast-hide');
      toast?.classList.add('toast-show');
    });
  });

  const previousTimer = Number(toast.dataset.hideTimer || '0');
  if (previousTimer) window.clearTimeout(previousTimer);
  const previousFinalizeTimer = Number(toast.dataset.finalizeTimer || '0');
  if (previousFinalizeTimer) window.clearTimeout(previousFinalizeTimer);

  const hideTimer = window.setTimeout(() => {
    toast?.classList.remove('toast-show');
    toast?.classList.add('toast-hide');

    const finalizeTimer = window.setTimeout(() => {
      toast?.classList.remove('toast-hide');
      if (toast) toast.dataset.finalizeTimer = '0';
    }, TOAST_ANIMATION_MS);

    if (toast) toast.dataset.finalizeTimer = String(finalizeTimer);
  }, TOAST_DURATION_MS);
  toast.dataset.hideTimer = String(hideTimer);
}

// Udostępnij showToast globalnie
(window as any).showToast = showToast;
    function setCheckoutMessage(msg: string) {
      if (checkoutMessage) checkoutMessage.innerText = msg;
    }
    function decreaseQty(name: string) {
      const item = cart.find(i => i.name === name);
      if (item && item.qty > 1) {
        item.qty--;
        showToast(`Usunięto 1 szt. produktu ${name}.`);
      }
      renderCart();
    }
    function increaseQty(name: string) {
      const item = cart.find(i => i.name === name);
      if (item) {
        item.qty++;
        showToast(`Dodano 1 szt. produktu ${name}.`);
      }
      renderCart();
    }
    function removeItem(name: string) {
      const before = cart.length;
      cart = cart.filter(i => i.name !== name);
      if (cart.length < before) {
        showToast(`Usunięto produkt ${name} z koszyka.`);
      }
      renderCart();
    }

    // Expose cart item functions globally for use in HTML event handlers
    window.decreaseQty = decreaseQty;
    window.increaseQty = increaseQty;
    window.removeItem = removeItem;
    function getCartTotalPrice(): number {
      return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
    function getDeliveryInfo(totalPrice: number): any {
      // Przyjmujemy, że do jednej paczki mieści się skonfigurowana liczba sztuk
      const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
      const numberOfParcels = Math.ceil(totalItems / STORE_CONFIG.delivery.itemsPerParcel);
      return {
        finalCost: totalPrice > STORE_CONFIG.delivery.freeThreshold ? 0 : STORE_CONFIG.delivery.baseCost,
        numberOfParcels,
      };
    }

    function getTotalItemsCount(): number {
      return cart.reduce((sum, item) => sum + item.qty, 0);
    }
    window.getTotalItemsCount = getTotalItemsCount;

    // Confirmation modal (ported from app.js)
    function showConfirmModal(title: string, message: string, singleButton = false): Promise<boolean> {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-modal-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'confirm-modal';

        const h = document.createElement('h3');
        h.textContent = title;
        h.style.color = '#b30000';
        h.style.marginBottom = '8px';
        const p = document.createElement('p');
        p.textContent = message;
        p.style.marginBottom = '12px';

        const actions = document.createElement('div');
        actions.className = 'confirm-actions';

        if (singleButton) {
          const btnOk = document.createElement('button');
          btnOk.className = 'btn btn-confirm';
          btnOk.textContent = 'OK';
          btnOk.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
          });
          actions.appendChild(btnOk);
        } else {
          const btnCancel = document.createElement('button');
          btnCancel.className = 'browse-products-btn btn-cancel';
          btnCancel.textContent = 'Anuluj';
          btnCancel.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
          });
          const btnConfirm = document.createElement('button');
          btnConfirm.className = 'browse-products-btn';
          btnConfirm.textContent = 'Tak, wyczyść';
          btnConfirm.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
          });
          actions.appendChild(btnCancel);
          actions.appendChild(btnConfirm);
        }

        dialog.appendChild(h);
        dialog.appendChild(p);
        dialog.appendChild(actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
      });
    }

    // Async clearCart with confirmation
    async function clearCart() {
      if (cart.length === 0) return;
      const confirmed = await showConfirmModal("Wyczyść koszyk", "Na pewno chcesz wyczyścić cały koszyk?");
      if (!confirmed) return;
      cart = [];
      renderCart();
      showToast("Koszyk został wyczyszczony.");
    }
    window.clearCart = clearCart;
    // ...existing code...
    // ...existing code...

    
    const saveCart = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    };

    

    


  // Przeliczanie koszyka
  function renderCart() {
    renderCheckoutSummary();
    saveCart();
  }

  // Obsługa kliknięcia "Dodaj do koszyka"
  addButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.product;
      const priceStr = btn.dataset.price;
      const image = btn.dataset.image;

      if (!name || !priceStr || !image) {
        console.error("Brak danych produktu w przycisku");
        return;
      }

      const price = Number(priceStr);
      
      if (isNaN(price) || price <= 0) {
        console.error("Nieprawidłowa cena produktu");
        return;
      }

      // Szukamy produktu w koszyku
      const existing = cart.find(item => item.name === name);

      if (existing) {
        existing.qty++;
        // Uzupełnij brakujący obrazek w starszych wpisach koszyka z localStorage.
        if (!existing.image) existing.image = image;
      } else {
        cart.push({ name, price, qty: 1, image });
      }

      renderCart();
      // Scroll do podsumowania zamówienia po dodaniu produktu
      const checkoutSummary = document.getElementById("checkoutSummary");
      if (checkoutSummary) {
        checkoutSummary.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      const cartDock = document.querySelector('.cart-dock') as HTMLElement | null;
      if (cartDock) {
        const top = cartDock.getBoundingClientRect().top + window.scrollY - CART_SCROLL_OFFSET;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else if (window.innerWidth <= 767 && miniCart) {
        miniCart.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast(`Dodano 1 szt. produktu ${name}.`);
    });
  });

  if (openParcelSearchBtn && parcelSearchQuery) {
    openParcelSearchBtn.addEventListener("click", () => {
      const query = parcelSearchQuery.value.trim();
      const targetUrl = query
        ? `https://www.google.com/maps/search/paczkomat+${encodeURIComponent(query)}`
        : "https://inpost.pl/znajdz-paczkomat";

      window.open(targetUrl, "_blank", "noopener,noreferrer");
      // ...existing code...
    });
  }

  // ...

  // Przycisk zamówienia i obsługa walidacji UX
  const checkoutSubmitBtn = document.getElementById('submitOrderBtn') as HTMLButtonElement | null;
  const submitBtnDefaultText = checkoutSubmitBtn?.textContent || 'Zamawiam teraz';
  const setSubmitLoading = (isLoading: boolean) => {
    if (!checkoutSubmitBtn) return;
    checkoutSubmitBtn.disabled = isLoading;
    checkoutSubmitBtn.textContent = isLoading ? 'Wysyłanie zamówienia...' : submitBtnDefaultText;
    checkoutSubmitBtn.style.opacity = isLoading ? '0.7' : '1';
    checkoutSubmitBtn.style.cursor = isLoading ? 'wait' : 'pointer';
  };
  if (checkoutSubmitBtn) {
    checkoutSubmitBtn.classList.add('cart-checkout-btn');
  }

  // Obsługa submit formularza zamówienia
  if (checkoutFormEl) {
    checkoutFormEl.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Walidacja zamówienia
      if (cart.length === 0) {
        showToast("Zamówienie nie zawiera wybranego produktu. Dodaj produkty przed złożeniem zamówienia.");
        // Przewiń do sekcji podsumowania zamówienia
        const summarySection = document.getElementById("checkoutSummary") || document.getElementById("checkout");
        if (summarySection) {
          summarySection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
        if (!customerPhone) {
          setCheckoutMessage("Brak pola na numer telefonu w formularzu.");
          showToast("Brak pola na numer telefonu w formularzu.");
          return;
        }

        let firstInvalidField: HTMLElement | null = null;
        const phoneValid = validatePhone(true);
        if (!phoneValid) {
          firstInvalidField = customerPhone;
        }

        let parcelCode = "";
        if (parcelLockerCodeInput) {
          parcelCode = parcelLockerCodeInput.value.trim().toUpperCase();
          const parcelValid = validateParcelLockerCode(true);
          if (!parcelValid && !firstInvalidField) {
            firstInvalidField = parcelLockerCodeInput;
          }
        }

        const notesValue = customerNotes?.value.trim() || "";
        const notesValid = validateOrderNotes(true);
        if (!notesValid && !firstInvalidField) {
          firstInvalidField = customerNotes;
        }

        if (firstInvalidField) {
          setCheckoutMessage("Popraw zaznaczone pola formularza.");
          showToast("Popraw zaznaczone pola formularza.");
          firstInvalidField.focus();
          return;
        }

      // Pobierz metodę płatności
      let payment = paymentMethod ? paymentMethod.value : "przelew";
      const phoneVal = customerPhone.value.replace(/\D/g, "");
      // Przygotuj dane zamówienia
      const orderData = {
        items: cart.map(item => ({ name: item.name, price: item.price, qty: item.qty })),
        phone: phoneVal,
        parcelLockerCode: parcelCode,
        paymentMethod: payment,
        productsTotal: getCartTotalPrice(),
        deliveryCost: getDeliveryInfo(getCartTotalPrice()).finalCost,
        total: getCartTotalPrice() + getDeliveryInfo(getCartTotalPrice()).finalCost,
        notes: notesValue,
        createOptionalAccount: false, // jeśli masz checkbox, wstaw wartość
        optionalAccountEmail: "" // jeśli masz pole na e-mail, wstaw wartość
      };
      setSubmitLoading(true);
      setCheckoutMessage("Wysyłanie zamówienia...");
      const requestStart = Date.now();
      try {
        const response = await fetch(buildApiUrl("/api/orders"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        if (response.ok) {
          const data = await response.json();
          const minMessageMs = 700;
          const elapsed = Date.now() - requestStart;
          if (elapsed < minMessageMs) {
            await new Promise((resolve) => setTimeout(resolve, minMessageMs - elapsed));
          }
          // Wyczyść komunikat wysyłania przed pokazaniem modala
          setCheckoutMessage("");
          // Stwórz modal potwierdzenia zamówienia
          showOrderConfirmationModal(data);
          cart = [];
          saveCart();
          renderCart();
        } else {
          const err = await response.text();
          setCheckoutMessage("Błąd podczas wysyłania zamówienia: " + err);
        }
      } catch (e) {
        showToast("Błąd sieci podczas wysyłania zamówienia.");
        setCheckoutMessage("Błąd sieci podczas wysyłania zamówienia.");
      } finally {
        setSubmitLoading(false);
      }
    });
  }

  if (paymentMethod) {
    paymentMethod.addEventListener("change", () => {
      renderPaymentInstructions();
    });
    // Wywołaj na starcie, by ustawić komunikat domyślny
    renderPaymentInstructions();
  }

  renderCheckoutSummary();
});

// Defensywna ochrona: NIE wywołuj renderCart ani renderMiniCartList poza DOMContentLoaded!
// Jeśli masz wywołania renderCart() lub renderMiniCartList() poza tym blokiem, USUŃ je lub przenieś do środka powyższego eventu.
// Jeśli chcesz wywołać renderCart z innych plików, eksportuj funkcję, ale nie wywołuj jej automatycznie przed DOMContentLoaded.


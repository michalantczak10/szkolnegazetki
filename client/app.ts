// @ts-ignore
import { renderCartList, showCartError } from "./modules/cart.js";
import { setupParcelAutocomplete } from "./modules/autocomplete.js";
// Renderuje podsumowanie zamówienia w sekcji checkout-summary (analogicznie do modala i mini-koszyka)

// Deklaracja checkoutFormEl na poziomie modułu, przed pierwszym użyciem
const checkoutFormEl = document.getElementById("checkoutForm") as HTMLFormElement | null;

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
    browseBtn.setAttribute("data-test-id", "btn-browse-offer");
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
    // Layout jak na screenie: obrazek | info (nazwa, 1 szt. × 19 zł) | przyciski
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;">
        ${imgHtml}
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;">
          <span class="checkout-summary-product-name" style="font-weight:600;font-size:1.1em;">${item.name}</span>
          <span style="color:#444;font-size:1em;">${item.qty} ${qtyLabel}. × ${item.price} zł</span>
        </div>
        ${btnsHtml}
      </div>
      <div style="margin-left:56px;margin-top:2px;color:#b30000;font-weight:600;font-size:1.05em;">Razem: ${item.qty * item.price} zł</div>
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
    btn.setAttribute("data-test-id", "btn-clear-cart");
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
    btn.addEventListener("mouseleave", () => {
      if (!btn.disabled) {
        btn.style.background = "linear-gradient(90deg,#e74c3c 0%,#b30000 100%)";
      }
    });
    btn.addEventListener("focus", () => {
      btn.style.boxShadow = "none";
      btn.style.border = "none";
    });
    btn.addEventListener("blur", () => {
      btn.style.boxShadow = "none";
      btn.style.border = "none";
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
  // Przyjmujemy, że do jednej paczki mieści się 4 sztuki
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const numberOfParcels = Math.ceil(totalItems / 4);
  return { finalCost: totalPrice > 100 ? 0 : 15, numberOfParcels };
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
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:18px;">
      <span style="font-size:2.7em;line-height:1;">🎉</span>
      <div class="order-confirm-modal-thankyou" style="margin:0;font-size:1.22em;">Zamówienie przyjęte!</div>
      <div style="font-size:1.13em;color:#b30000;font-weight:700;">Dziękujemy za zakupy w <b>Galaretkarnia.pl</b></div>
    </div>
    <div class="order-confirm-modal-summary-row"><b>Numer zamówienia:</b><br><span class="order-confirm-modal-ref">${orderNum}</span></div>
    <div class="order-confirm-modal-summary-row"><b>Do zapłaty:</b><br><span class="order-confirm-modal-total">${totalWithDelivery} zł</span></div>
    <div class="order-confirm-modal-summary-row"><b>Tytuł przelewu:</b><br><span class="order-confirm-modal-transfer">Zamówienie ${orderNum}</span></div>
    <div class="order-confirm-modal-summary-row"><b>Dane do płatności:</b><br><span class="order-confirm-modal-payment">${data.paymentTarget || ''}</span></div>
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
  okBtn.addEventListener('click', () => {
    overlay.remove();
    // Wyczyść dane formularza zamówienia
    const form = document.getElementById('checkoutForm') as HTMLFormElement | null;
    if (form) form.reset();
    // Wyczyść komunikaty walidacyjne, jeśli są
    const msg = document.getElementById('checkoutMessage');
    if (msg) msg.innerHTML = '';
  });
  actions.appendChild(okBtn);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Zamknięcie modala po kliknięciu poza modalem
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  // Zamknięcie ESC
  document.addEventListener('keydown', function escHandler(ev) {
    if (ev.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });
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
    // Konfiguracja płatności (możesz rozbudować o pobieranie z backendu)
    const paymentConfig = {
      accountHolder: "Galaretkarnia",
      accountNumber: "60 1140 2004 0000 3102 4831 8846",
      blikPhone: "794 535 366" // Twój numer BLIK
    };

    function renderPaymentInstructions() {
      if (!paymentInstructions || !paymentMethod) return;
      if (paymentMethod.value === "blik") {
        paymentInstructions.innerHTML = `
          <p><strong>Płatność BLIK:</strong> wykonaj przelew na telefon.</p>
          <p><strong>Numer telefonu BLIK:</strong> ${paymentConfig.blikPhone}</p>
          <p><small>W tytule wpisz numer zamówienia po jego utworzeniu.</small></p>
        `;
        return;
      }
      paymentInstructions.innerHTML = `
        <p><strong>Płatność przelewem tradycyjnym:</strong></p>
        <p><strong>Odbiorca:</strong> ${paymentConfig.accountHolder}</p>
        <p><strong>Numer konta:</strong> ${paymentConfig.accountNumber}</p>
        <p><small>Tytuł przelewu otrzymasz po złożeniu zamówienia.</small></p>
      `;
    }
  // Automatyczne ładowanie koszyka z localStorage
  const STORAGE_KEY = "cartStorage";
  const savedCart = localStorage.getItem(STORAGE_KEY);
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch {
      cart = [];
    }
  }

  const parcelSearchInput = document.getElementById("parcelSearchQuery") as HTMLInputElement;
  // Dodaj margines pod etykietą 'Wyszukaj paczkomat', jeśli istnieje
  const parcelSearchLabel = document.querySelector("label[for='parcelSearchQuery']") as HTMLElement | null;
  if (parcelSearchLabel) {
    parcelSearchLabel.style.marginBottom = "12px";
    parcelSearchLabel.style.display = "block";
  }

  const parcelLockerCodeInput = document.getElementById("parcelLockerCode") as HTMLInputElement;
  const searchWrapper = parcelSearchInput.parentElement as HTMLElement;
  searchWrapper.style.position = "relative";
  const searchAutocompleteBox = document.createElement("div");
  searchAutocompleteBox.className = "autocomplete-box";
  searchAutocompleteBox.style.display = "none";
  searchAutocompleteBox.style.width = parcelSearchInput.offsetWidth + "px";
  searchWrapper.appendChild(searchAutocompleteBox);

  let parcelLockers: any[] = [];
  fetch("parcelLockers.json")
    .then(res => res.json())
    .then(data => {
      // Mapuj dane z JSON-a na oczekiwane przez autocomplete pola
      parcelLockers = data.map((locker: any) => ({
        code: locker.n,
        name: `${locker.c}${locker.e ? ", " + locker.e : ""}${locker.b ? " " + locker.b : ""}`.trim(),
        address: locker.d || ""
      }));
      // Wywołanie funkcji importowanej na górze pliku
      setupParcelAutocomplete(parcelLockers, parcelSearchInput, parcelLockerCodeInput, searchAutocompleteBox);
    })
    .catch((error) => {
      parcelLockers = [];
      showCartError("Nie udało się pobrać listy paczkomatów.", searchAutocompleteBox);
      console.warn("Nie udało się pobrać listy paczkomatów.", error);
    });

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
  const openParcelSearchBtn = document.getElementById("openParcelSearchBtn") as HTMLButtonElement | null;
  const CART_SCROLL_OFFSET = 20;

  // MASKA I WALIDACJA NA NUMER TELEFONU (format 000 000 000)
  if (customerPhone !== null) {
    const phoneError = document.getElementById("phoneError");
    function validatePhone(showMsg = true) {
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
    }
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
    customerPhone.addEventListener("focus", () => {
      if (phoneError) phoneError.textContent = "";
    });
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
  let toast = document.getElementById('toastMessage');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastMessage';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#b30000';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '1rem';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Udostępnij showToast globalnie
(window as any).showToast = showToast;
    function setCheckoutMessage(msg: string) {
      if (checkoutMessage) checkoutMessage.innerText = msg;
    }
    function decreaseQty(name: string) {
      const item = cart.find(i => i.name === name);
      if (item && item.qty > 1) item.qty--;
      renderCart();
    }
    function increaseQty(name: string) {
      const item = cart.find(i => i.name === name);
      if (item) item.qty++;
      renderCart();
    }
    function removeItem(name: string) {
      cart = cart.filter(i => i.name !== name);
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
      // Przyjmujemy, że do jednej paczki mieści się 4 sztuki
      const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
      const numberOfParcels = Math.ceil(totalItems / 4);
      return { finalCost: totalPrice > 100 ? 0 : 15, numberOfParcels };
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
      setCheckoutMessage("Koszyk został wyczyszczony.");
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
      // If a 'cart cleared' message/toast is present, dismiss it when adding a new item
      // dismissToastContaining("Koszyk został wyczyszczony"); // funkcja niezaimplementowana
      if (checkoutMessage && checkoutMessage.innerHTML.includes("Koszyk został wyczyszczony")) {
        setCheckoutMessage("");
      }
      showToast(`${name} dodana do koszyka!`);
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
  if (checkoutSubmitBtn) {
    checkoutSubmitBtn.classList.add('cart-checkout-btn');
  }

  // Obsługa submit formularza zamówienia
  if (checkoutFormEl) {
    checkoutFormEl.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Walidacja zamówienia
      if (cart.length === 0) {
        setCheckoutMessage("Zamówienie nie zawiera wybranego produktu. Dodaj produkty przed złożeniem zamówienia.");
        showToast("Zamówienie nie zawiera wybranego produktu. Dodaj produkty przed złożeniem zamówienia.");
        // Przewiń do sekcji podsumowania zamówienia
        const summarySection = document.getElementById("checkoutSummary") || document.getElementById("checkout");
        if (summarySection) {
          summarySection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      // Walidacja telefonu
      let phoneVal = "";
      if (!customerPhone) {
        setCheckoutMessage("Brak pola na numer telefonu w formularzu.");
        showToast("Brak pola na numer telefonu w formularzu.");
        return;
      }
      phoneVal = customerPhone.value.replace(/\D/g, "");
      if (!(phoneVal.length === 9 && /^[5-8]/.test(phoneVal))) {
        setCheckoutMessage("Podaj poprawny polski numer telefonu (9 cyfr, zaczynający się od 5, 6, 7 lub 8).");
        showToast("Podaj poprawny polski numer telefonu (9 cyfr, zaczynający się od 5, 6, 7 lub 8).");
        customerPhone.focus();
        return;
      }
      // Walidacja kodu paczkomatu (musi być wybrany i niepusty)
      let parcelCode = "";
      if (parcelLockerCodeInput) {
        parcelCode = parcelLockerCodeInput.value.trim().toUpperCase();
        if (!parcelCode || !parcelCode.match(/^[A-Z0-9]{6,}$/)) {
          setCheckoutMessage("Wybierz paczkomat przed złożeniem zamówienia. Kod paczkomatu jest wymagany i musi być poprawny (np. WAW01A).");
          showToast("Wybierz paczkomat przed złożeniem zamówienia. Kod paczkomatu jest wymagany i musi być poprawny (np. WAW01A).");
          parcelLockerCodeInput.focus();
          return;
        }
        // Sprawdź, czy kod istnieje w liście paczkomatów
        if (!parcelLockers.some(locker => locker.code === parcelCode)) {
          setCheckoutMessage("Podany kod paczkomatu nie istnieje. Wybierz poprawny paczkomat z listy.");
          showToast("Podany kod paczkomatu nie istnieje. Wybierz poprawny paczkomat z listy.");
          parcelLockerCodeInput.focus();
          return;
        }
      }
      // Pobierz metodę płatności
      let payment = paymentMethod ? paymentMethod.value : "przelew";
      // Przygotuj dane zamówienia
      const orderData = {
        items: cart.map(item => ({ name: item.name, price: item.price, qty: item.qty })),
        phone: phoneVal,
        parcelLockerCode: parcelCode,
        paymentMethod: payment,
        productsTotal: getCartTotalPrice(),
        deliveryCost: getDeliveryInfo(getCartTotalPrice()).finalCost,
        total: getCartTotalPrice() + getDeliveryInfo(getCartTotalPrice()).finalCost,
        notes: "", // jeśli masz pole na uwagi, wstaw tutaj
        createOptionalAccount: false, // jeśli masz checkbox, wstaw wartość
        optionalAccountEmail: "" // jeśli masz pole na e-mail, wstaw wartość
      };
      setCheckoutMessage("");
      showToast("Wysyłanie zamówienia...");
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        if (response.ok) {
          const data = await response.json();
          // Stwórz modal potwierdzenia zamówienia
          showOrderConfirmationModal(data);
          cart = [];
          saveCart();
          renderCart();
        } else {
          const err = await response.text();
          showToast("Błąd podczas wysyłania zamówienia: " + err);
          setCheckoutMessage("Błąd podczas wysyłania zamówienia: " + err);
        }
      } catch (e) {
        showToast("Błąd sieci podczas wysyłania zamówienia.");
        setCheckoutMessage("Błąd sieci podczas wysyłania zamówienia.");
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


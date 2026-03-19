
// ...existing code...
declare global {
  interface Window {
    showToast: (msg: string) => void;
  }
}

import { renderCartList, showCartError } from "./modules/cart";
import { setupParcelAutocomplete } from "./modules/autocomplete";

window.addEventListener("DOMContentLoaded", () => {
  const parcelSearchInput = document.getElementById("parcelSearchQuery") as HTMLInputElement;
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
      parcelLockers = data;
      setupParcelAutocomplete(parcelLockers, parcelSearchInput, parcelLockerCodeInput, searchAutocompleteBox);
    })
    .catch((error) => {
      parcelLockers = [];
      showCartError("Nie udało się pobrać listy paczkomatów.", searchAutocompleteBox);
      console.warn("Nie udało się pobrać listy paczkomatów.", error);
    });

  const STORAGE_KEY = "cartStorage";
  let cart: any[] = [];
  localStorage.removeItem(STORAGE_KEY);
  let freeDeliveryThreshold = 100;
  const cartList = document.getElementById("cartList") as HTMLElement | null;

  // Przykład użycia renderCart i showCartError
  if (cartList) {
    renderCartList(cart, cartList);
  }

  // ...existing code...
          const addButtons = document.querySelectorAll(".addToCartBtn") as NodeListOf<HTMLButtonElement>;
          const miniCart = document.querySelector(".mini-cart") as HTMLElement | null;
          const checkoutFormEl = document.getElementById("checkoutForm") as HTMLFormElement | null;
          const checkoutMessage = document.getElementById("checkoutMessage") as HTMLElement | null;
          const paymentMethod = document.getElementById("paymentMethod") as HTMLSelectElement | null;
          const createOptionalAccount = document.getElementById("createOptionalAccount") as HTMLInputElement | null;
          const optionalAccountFields = document.getElementById("optionalAccountFields") as HTMLElement | null;
          const optionalAccountEmail = document.getElementById("optionalAccountEmail") as HTMLInputElement | null;
          const parcelSearchQuery = document.getElementById("parcelSearchQuery") as HTMLInputElement | null;
          const openParcelSearchBtn = document.getElementById("openParcelSearchBtn") as HTMLButtonElement | null;
          const customerPhone = document.getElementById("customerPhone") as HTMLInputElement | null;
          const CART_SCROLL_OFFSET = 20;

          
          if (!cartList) console.warn("Brak elementu cartList");
          if (!miniCart) console.warn("Brak elementu miniCart");
          if (!checkoutFormEl) console.warn("Brak elementu checkoutFormEl");
          if (!paymentMethod) console.warn("Brak elementu paymentMethod");
          if (!createOptionalAccount) console.warn("Brak elementu createOptionalAccount");
          if (!optionalAccountFields) console.warn("Brak elementu optionalAccountFields");
          if (!optionalAccountEmail) console.warn("Brak elementu optionalAccountEmail");
          if (!parcelSearchQuery) console.warn("Brak elementu parcelSearchQuery");
          if (!openParcelSearchBtn) console.warn("Brak elementu openParcelSearchBtn");
          if (!customerPhone) console.warn("Brak elementu customerPhone");

          
          if (customerPhone) {
            customerPhone.addEventListener("input", () => {
              let val = customerPhone.value.replace(/\D/g, "");
              if (val.length > 9) val = val.slice(0, 9);
              let masked = val;
              if (val.length > 3 && val.length <= 6) {
                masked = val.slice(0, 3) + " " + val.slice(3);
              } else if (val.length > 6) {
                masked = val.slice(0, 3) + " " + val.slice(3, 6) + " " + val.slice(6);
              }
              customerPhone.value = masked;
            });
          }

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

    // ...existing code...
    function setCheckoutMessage(msg: string) {
      if (checkoutMessage) checkoutMessage.innerText = msg;
    }
    function decreaseQty(name: string) {
      const item = cart.find(i => i.name === name);
      if (item && item.qty > 1) item.qty--;
      renderMiniCartList();
    }
    function increaseQty(name: string) {
      const item = cart.find(i => i.name === name);
      if (item) item.qty++;
      renderMiniCartList();
    }
    function removeItem(name: string) {
      cart = cart.filter(i => i.name !== name);
      renderMiniCartList();
    }
    function getCartTotalPrice(): number {
      return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
    function getDeliveryInfo(totalPrice: number): any {
      return { finalCost: totalPrice > 100 ? 0 : 15, numberOfParcels: 1 };
    }
    function getTotalItemsCount(): number {
      return cart.reduce((sum, item) => sum + item.qty, 0);
    }
    function clearCart() {
      cart = [];
      renderMiniCartList();
      setCheckoutMessage("Koszyk został wyczyszczony.");
    }
    function scrollToCheckout() {
      checkoutFormEl?.scrollIntoView({ behavior: "smooth" });
    }
    function animate(el: HTMLElement, cls: string) {
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), 500);
    }

    
    const saveCart = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    };

    

    
    function renderMiniCartList() {
      if (!cartList) return;
      cartList.innerHTML = "";
      const totalPrice = getCartTotalPrice();

      if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Koszyk jest pusty — dodaj pierwszą galaretkę 😊";
        empty.classList.add("fade-in", "cart-empty-state");
        cartList.appendChild(empty);
  // ...existing code...
        return;
      }

      cart.forEach((item: any) => {
        const row = document.createElement("div");
        row.classList.add("cart-item", "fade-in");

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.onerror = () => {
          img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Crect fill='%23ddd' width='55' height='55'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3E?%3C/text%3E%3C/svg%3E";
        };

        const info = document.createElement("div");
        info.classList.add("cart-item-info");

        const name = document.createElement("div");
        name.classList.add("cart-item-name");
        name.textContent = item.name;

        const details = document.createElement("div");
        details.classList.add("cart-item-details");

        const unitLine = document.createElement("span");
        unitLine.className = "cart-item-unit";
        unitLine.textContent = `${item.qty} szt. × ${item.price} zł`;

        const subtotalLine = document.createElement("span");
        subtotalLine.className = "cart-item-subtotal";
        subtotalLine.textContent = `Razem: ${item.qty * item.price} zł`;

        details.appendChild(unitLine);
        details.appendChild(subtotalLine);

        const controls = document.createElement("div");
        controls.classList.add("cart-item-controls");

        // Przycisk minus
        const btnMinus = document.createElement("button");
        btnMinus.className = "cart-btn cart-btn-minus";
        btnMinus.textContent = "−";
        btnMinus.addEventListener("click", () => decreaseQty(item.name));

        // Ilość
        const qtySpan = document.createElement("span");
        qtySpan.className = "cart-item-qty";
        qtySpan.textContent = item.qty.toString();

        // Przycisk plus
        const btnPlus = document.createElement("button");
        btnPlus.className = "cart-btn cart-btn-plus";
        btnPlus.textContent = "+";
        btnPlus.addEventListener("click", () => increaseQty(item.name));

        // Przycisk usuń
        const btnRemove = document.createElement("button");
        btnRemove.className = "cart-btn cart-btn-remove";
        btnRemove.textContent = "✕";
        btnRemove.addEventListener("click", () => removeItem(item.name));

        controls.appendChild(btnMinus);
        controls.appendChild(qtySpan);
        controls.appendChild(btnPlus);
        controls.appendChild(btnRemove);

        info.appendChild(name);
        info.appendChild(details);

        row.appendChild(img);
        row.appendChild(info);
        row.appendChild(controls);

        cartList.appendChild(row);
      });

      const remainingToTarget = Math.max(0, freeDeliveryThreshold - totalPrice);
      const progressPercent = Math.min(100, Math.round((totalPrice / freeDeliveryThreshold) * 100));

      const progressBox = document.createElement("div");
      progressBox.className = "cart-progress";

      const progressLabel = document.createElement("p");
      progressLabel.className = "cart-progress-label";
      progressLabel.textContent =
        remainingToTarget > 0
          ? `Do darmowej dostawy (${freeDeliveryThreshold} zł) brakuje ${remainingToTarget} zł.`
          : `Super! Masz już darmową dostawę od ${freeDeliveryThreshold} zł.`;

      const progressTrack = document.createElement("div");
      progressTrack.className = "cart-progress-track";

      const progressBar = document.createElement("div");
      progressBar.className = "cart-progress-bar";
      progressBar.style.width = `${progressPercent}%`;

      progressTrack.appendChild(progressBar);
      progressBox.appendChild(progressLabel);
      progressBox.appendChild(progressTrack);
      cartList.appendChild(progressBox);

      // Breakdown: produkty + dostawa + razem
      const deliveryInfo = getDeliveryInfo(totalPrice);
      const totalWithDelivery = totalPrice + deliveryInfo.finalCost;
      const itemsCount = getTotalItemsCount();

      const cartSummary = document.createElement("div");
      cartSummary.className = "cart-summary";

      const productsLine = document.createElement("div");
      productsLine.className = "cart-summary-line";
      productsLine.innerHTML = `<span>Produkty (galaretki):</span><span>${totalPrice} zł</span>`;

      const deliveryLine = document.createElement("div");
      deliveryLine.className = "cart-summary-line";
      const deliveryText = deliveryInfo.finalCost === 0 ? "<strong>Gratis!</strong>" : `${deliveryInfo.finalCost} zł`;
      const parcelInfo = deliveryInfo.numberOfParcels > 1 
        ? `${deliveryInfo.numberOfParcels} paczki` 
        : `1 paczka`;
      deliveryLine.innerHTML = `<span>Dostawa (${parcelInfo}, ${itemsCount} szt.):</span><span>${deliveryText}</span>`;

      const totalLine = document.createElement("div");
      totalLine.className = "cart-summary-total";
      totalLine.innerHTML = `<span>Razem do zapłaty:</span><span>${totalWithDelivery} zł</span>`;

      cartSummary.appendChild(productsLine);
      cartSummary.appendChild(deliveryLine);
      cartSummary.appendChild(totalLine);
      cartList.appendChild(cartSummary);

      // Przycisk wyczyść koszyk
      const clearBtn = document.createElement("button");
      clearBtn.className = "cart-clear-btn";
      clearBtn.textContent = "Wyczyść koszyk";
      clearBtn.addEventListener("click", clearCart);
      cartList.appendChild(clearBtn);

      const checkoutBtn = document.createElement("button");
      checkoutBtn.className = "cart-checkout-btn";
      checkoutBtn.textContent = "Zamawiam teraz";
      checkoutBtn.addEventListener("click", scrollToCheckout);
      cartList.appendChild(checkoutBtn);
    }

  // Przeliczanie koszyka
  function renderCart() {
    // Animacje mini‑koszyka
    if (miniCart) {
      animate(miniCart, "mini-cart-shake");
      animate(miniCart, "mini-cart-pulse");
    }

    renderMiniCartList();
    // renderCheckoutSummary(); // funkcja niezaimplementowana
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
      showToast(`${name} dodany do koszyka!`);
    });
  });

  if (openParcelSearchBtn && parcelSearchQuery) {
    openParcelSearchBtn.addEventListener("click", () => {
      const query = parcelSearchQuery.value.trim();
      const targetUrl = query
        ? `https://www.google.com/maps/search/paczkomat+${encodeURIComponent(query)}`
        : "https://inpost.pl/znajdz-paczkomat";

      window.open(targetUrl, "_blank", "noopener,noreferrer");
    });
  }

  // ...

  // Przycisk zamówienia i wyczyszczenia koszyka
  const checkoutSubmitBtn = document.getElementById('submitOrderBtn') as HTMLButtonElement | null;
  if (checkoutSubmitBtn) {
    checkoutSubmitBtn.classList.add('cart-checkout-btn');
  }
  const checkoutClearBtn = document.getElementById('clearCartBtn') as HTMLButtonElement | null;
  if (checkoutClearBtn) {
    checkoutClearBtn.addEventListener('click', clearCart);
  }

  if (paymentMethod) {
    paymentMethod.addEventListener("change", () => {
      // renderPaymentInstructions();
    });
  }

  if (createOptionalAccount && optionalAccountFields && optionalAccountEmail) {
    createOptionalAccount.addEventListener("change", () => {
      optionalAccountFields.hidden = !createOptionalAccount.checked;
      if (!createOptionalAccount.checked) {
        optionalAccountEmail.value = "";
      }
    });
  }

  renderMiniCartList();
});


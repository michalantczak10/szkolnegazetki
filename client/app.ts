// Typy, stałe i funkcje globalne (nie korzystające z DOM)
// Brak globalnych deklaracji — cała logika i deklaracje wewnątrz DOMContentLoaded

window.addEventListener("DOMContentLoaded", () => {
      // Usuwanie koszyka przy każdym wejściu na stronę
      localStorage.removeItem(STORAGE_KEY);
    // Deklaracje zmiennych i funkcji
    let freeDeliveryThreshold = 100;
    let cart: any[] = [];
    const STORAGE_KEY = "cartStorage";
    const cartList = document.getElementById("cartList") as HTMLElement;
    const addButtons = document.querySelectorAll(".addToCartBtn") as NodeListOf<HTMLButtonElement>;
    const miniCart = document.querySelector(".mini-cart") as HTMLElement;
    const checkoutFormEl = document.getElementById("checkoutForm") as HTMLFormElement | null;
    const checkoutMessage = document.getElementById("checkoutMessage") as HTMLElement;
    const paymentMethod = document.getElementById("paymentMethod") as HTMLSelectElement;
    const createOptionalAccount = document.getElementById("createOptionalAccount") as HTMLInputElement;
    const optionalAccountFields = document.getElementById("optionalAccountFields") as HTMLElement;
    const optionalAccountEmail = document.getElementById("optionalAccountEmail") as HTMLInputElement;
    const parcelSearchQuery = document.getElementById("parcelSearchQuery") as HTMLInputElement;
    const openParcelSearchBtn = document.getElementById("openParcelSearchBtn") as HTMLButtonElement;
    const CART_SCROLL_OFFSET = 20;

    function showToast(message: string) {
      alert(message);
    }
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

    // Funkcja zapisu koszyka do localStorage
    const saveCart = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    };

    // Funkcja załadowania koszyka z localStorage
    const loadCart = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          cart = JSON.parse(saved);
        } catch (e) {
          console.error("Błąd przy ładowaniu koszyka", e);
          cart = [];
        }
      }
    };

    // Wyświetlanie listy produktów
    function renderMiniCartList() {
      cartList.innerHTML = "";
      const totalPrice = getCartTotalPrice();

      if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Koszyk jest pusty — dodaj pierwszą galaretkę 😊";
        empty.classList.add("fade-in", "cart-empty-state");
        cartList.appendChild(empty);
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
    animate(miniCart, "mini-cart-shake");
    animate(miniCart, "mini-cart-pulse");

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
      } else if (window.innerWidth <= 767) {
        miniCart.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // If a 'cart cleared' message/toast is present, dismiss it when adding a new item
      // dismissToastContaining("Koszyk został wyczyszczony"); // funkcja niezaimplementowana
      if (checkoutMessage.innerHTML.includes("Koszyk został wyczyszczony")) {
        setCheckoutMessage("");
      }
      showToast(`${name} dodany do koszyka!`);
    });
  });

  openParcelSearchBtn.addEventListener("click", () => {
    const query = parcelSearchQuery.value.trim();
    const targetUrl = query
      ? `https://www.google.com/maps/search/paczkomat+${encodeURIComponent(query)}`
      : "https://inpost.pl/znajdz-paczkomat";

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  });

  // copyTransferTitleBtn.addEventListener("click", async () => {
  //   // const lastOrder = loadLastOrderReference(); // funkcja niezaimplementowana
  //   // const isBlikPayment = lastOrder?.paymentMethod === "blik"; // lastOrder niezaimplementowane
  //   // const value = isBlikPayment
  //   //   ? lastOrderPaymentTarget.textContent?.trim()
  //   //   : lastOrderTransferTitle.textContent?.trim();
  //   // if (!value || value === "-") {
  //   //   showToast(isBlikPayment ? "Brak numeru BLIK do skopiowania" : "Brak tytułu płatności do skopiowania");
  //   //   return;
  //   // }
  //   // try {
  //   //   await navigator.clipboard.writeText(value);
  //   //   showToast(isBlikPayment ? "Skopiowano numer BLIK" : "Skopiowano tytuł płatności");
  //   // } catch (error) {
  //   //   console.error("Nie udało się skopiować danych płatności", error);
  //   //   showToast("Nie udało się skopiować danych");
  //   // }
  // });

  // Static checkout buttons: apply cart button styles and wire the clear action
  const checkoutSubmitBtn = document.getElementById('submitOrderBtn') as HTMLButtonElement | null;
  if (checkoutSubmitBtn) {
    checkoutSubmitBtn.classList.add('cart-checkout-btn');
  }
  const checkoutClearBtn = document.getElementById('clearCartBtn') as HTMLButtonElement | null;
  if (checkoutClearBtn) {
    checkoutClearBtn.addEventListener('click', clearCart);
  }

  paymentMethod.addEventListener("change", () => {
    // renderPaymentInstructions();
  });

  createOptionalAccount.addEventListener("change", () => {
    optionalAccountFields.hidden = !createOptionalAccount.checked;
    if (!createOptionalAccount.checked) {
      optionalAccountEmail.value = "";
    }
  });

  // Załaduj koszyk z localStorage przy starcie
  // checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  loadCart();
  renderMiniCartList();
  // renderPaymentInstructions();
  // void loadPaymentConfig();
  // renderLastOrderReference();
});


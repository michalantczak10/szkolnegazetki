// Tablica koszyka
let cart = [];
// Pobranie elementów z HTML z bezpieczną obsługą null
const addButtons = document.querySelectorAll(".addToCartBtn");
const miniCartElement = document.querySelector(".mini-cart");
const cartListElement = document.getElementById("cartList");
const checkoutFormElement = document.getElementById("checkoutForm");
const checkoutSummaryListElement = document.getElementById("checkoutSummaryList");
const checkoutTotalElement = document.getElementById("checkoutTotal");
const checkoutMessageElement = document.getElementById("checkoutMessage");
const paymentMethodElement = document.getElementById("paymentMethod");
const paymentInstructionsElement = document.getElementById("paymentInstructions");
const customerPhoneElement = document.getElementById("customerPhone");
const parcelLockerCodeElement = document.getElementById("parcelLockerCode");
const parcelSearchQueryElement = document.getElementById("parcelSearchQuery");
const openParcelSearchBtnElement = document.getElementById("openParcelSearchBtn");
const createOptionalAccountElement = document.getElementById("createOptionalAccount");
const optionalAccountFieldsElement = document.getElementById("optionalAccountFields");
const optionalAccountEmailElement = document.getElementById("optionalAccountEmail");
const customerNotesElement = document.getElementById("customerNotes");
const lastOrderCardElement = document.getElementById("lastOrderCard");
const lastOrderIdElement = document.getElementById("lastOrderId");
const lastOrderPaymentMethodElement = document.getElementById("lastOrderPaymentMethod");
const lastOrderTransferTitleElement = document.getElementById("lastOrderTransferTitle");
const lastOrderPaymentTargetLabelElement = document.getElementById("lastOrderPaymentTargetLabel");
const lastOrderPaymentTargetElement = document.getElementById("lastOrderPaymentTarget");
const lastOrderPhoneSuffixElement = document.getElementById("lastOrderPhoneSuffix");
const lastOrderLockerElement = document.getElementById("lastOrderLocker");
const copyTransferTitleBtnElement = document.getElementById("copyTransferTitleBtn");
// Sprawdzenie czy wszystkie elementy istnieją
if (!miniCartElement ||
    !cartListElement ||
    !checkoutFormElement ||
    !checkoutSummaryListElement ||
    !checkoutTotalElement ||
    !checkoutMessageElement ||
    !paymentMethodElement ||
    !paymentInstructionsElement ||
    !customerPhoneElement ||
    !parcelLockerCodeElement ||
    !parcelSearchQueryElement ||
    !openParcelSearchBtnElement ||
    !createOptionalAccountElement ||
    !optionalAccountFieldsElement ||
    !optionalAccountEmailElement ||
    !customerNotesElement ||
    !lastOrderCardElement ||
    !lastOrderIdElement ||
    !lastOrderPaymentMethodElement ||
    !lastOrderTransferTitleElement ||
    !lastOrderPaymentTargetLabelElement ||
    !lastOrderPaymentTargetElement ||
    !lastOrderPhoneSuffixElement ||
    !lastOrderLockerElement ||
    !copyTransferTitleBtnElement) {
    console.error("Nie znaleziono wymaganych elementów DOM");
    throw new Error("Brak wymaganych elementów na stronie");
}
// Przypisanie do zmiennych z pewnymi typami
const miniCart = miniCartElement;
const cartList = cartListElement;
const checkoutForm = checkoutFormElement;
const checkoutSummaryList = checkoutSummaryListElement;
const checkoutTotal = checkoutTotalElement;
const checkoutMessage = checkoutMessageElement;
const paymentMethod = paymentMethodElement;
const paymentInstructions = paymentInstructionsElement;
const customerPhone = customerPhoneElement;
const parcelLockerCode = parcelLockerCodeElement;
const parcelSearchQuery = parcelSearchQueryElement;
const openParcelSearchBtn = openParcelSearchBtnElement;
const createOptionalAccount = createOptionalAccountElement;
const optionalAccountFields = optionalAccountFieldsElement;
const optionalAccountEmail = optionalAccountEmailElement;
const customerNotes = customerNotesElement;
const lastOrderCard = lastOrderCardElement;
const lastOrderId = lastOrderIdElement;
const lastOrderPaymentMethod = lastOrderPaymentMethodElement;
const lastOrderTransferTitle = lastOrderTransferTitleElement;
const lastOrderPaymentTargetLabel = lastOrderPaymentTargetLabelElement;
const lastOrderPaymentTarget = lastOrderPaymentTargetElement;
const lastOrderPhoneSuffix = lastOrderPhoneSuffixElement;
const lastOrderLocker = lastOrderLockerElement;
const copyTransferTitleBtn = copyTransferTitleBtnElement;
// Stałe konfiguracyjne
const STORAGE_KEY = "galaretkarnia_cart";
const ORDER_REF_STORAGE_KEY = "galaretkarnia_last_order_ref";
const TOAST_DURATION = 2000;
let freeDeliveryThreshold = 50;
let parcelSizes = [
    { name: "A", label: "Paczkomat A (mały)", maxItems: 3, cost: 13 },
    { name: "B", label: "Paczkomat B (średni)", maxItems: 8, cost: 15 },
    { name: "C", label: "Paczkomat C (duży)", maxItems: 15, cost: 17 }
];
let paymentConfig = {
    accountNumber: "60 1140 2004 0000 3102 4831 8846",
    accountHolder: "Galaretkarnia",
    blikPhone: "+48 794 535 366",
};
// Auto-detect API URL based on environment
const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE_URL = isDevelopment
    ? "http://localhost:3001"
    : "https://galaretkarnia.onrender.com";
const API_URL = `${API_BASE_URL}/api/orders`;
const PAYMENT_CONFIG_URL = `${API_BASE_URL}/api/payment-config`;
// Funkcja animacji - usuwa klasę, wymusza reflow i dodaje ponownie
const animate = (el, cls) => {
    el.classList.remove(cls);
    void el.offsetWidth; // Wymusza reflow
    el.classList.add(cls);
    // Usunięcie klasy po zakończeniu animacji
    const animationDuration = 500; // 500ms - najdłuższa animacja
    setTimeout(() => {
        el.classList.remove(cls);
    }, animationDuration);
};
// Funkcja wyświetlania toast notyfikacji
const showToast = (message, type = "default") => {
    const toast = document.createElement("div");
    toast.className = `toast toast-show ${type === "success" ? "toast-success" : ""}`.trim();
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("toast-show");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, TOAST_DURATION);
};
const setCheckoutMessage = (message, isError) => {
    checkoutMessage.innerHTML = message;
    checkoutMessage.classList.remove("is-error", "is-success");
    checkoutMessage.classList.add(isError ? "is-error" : "is-success");
};
const scrollToCheckout = () => {
    const checkoutSection = document.getElementById("checkout");
    checkoutSection?.scrollIntoView({ behavior: "smooth", block: "start" });
};
const getCartTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
const getTotalItemsCount = () => cart.reduce((sum, item) => sum + item.qty, 0);
const calculateDeliveryCost = (itemsCount) => {
    // Obliczamy ile paczek potrzebne
    const parcels = [];
    let remainingItems = itemsCount;
    // Ensure parcelSizes is initialized
    if (parcelSizes.length < 3) {
        parcelSizes = [
            { name: "A", label: "Paczkomat A (mały)", maxItems: 3, cost: 13 },
            { name: "B", label: "Paczkomat B (średni)", maxItems: 8, cost: 15 },
            { name: "C", label: "Paczkomat C (duży)", maxItems: 15, cost: 17 }
        ];
    }
    const parcelA = parcelSizes[0];
    const parcelB = parcelSizes[1];
    const parcelC = parcelSizes[2];
    // Najpierw próbujemy paczkami A
    while (remainingItems > 0 && remainingItems <= parcelA.maxItems) {
        parcels.push(parcelA);
        remainingItems = 0;
        break;
    }
    // Jeśli więcej niż A, próbujemy B
    if (remainingItems > parcelA.maxItems && remainingItems <= parcelB.maxItems) {
        parcels.push(parcelB);
        remainingItems = 0;
    }
    // Jeśli więcej niż B, używamy C (może być wiele)
    if (remainingItems > parcelB.maxItems) {
        const maxC = parcelC.maxItems;
        const parcelCount = Math.ceil(remainingItems / maxC);
        for (let i = 0; i < parcelCount; i++) {
            parcels.push(parcelC);
        }
    }
    // Fallback
    if (parcels.length === 0) {
        parcels.push(parcelB);
    }
    const totalCost = parcels.reduce((sum, p) => sum + p.cost, 0);
    const parcelLabel = parcels.length === 1
        ? parcels[0].label
        : `${parcels.length} paczki (${parcels.map(p => p.name).join('+')})`;
    return {
        cost: totalCost,
        parcelSize: parcels.map(p => p.name).join('+'),
        parcelLabel: parcelLabel,
        numberOfParcels: parcels.length
    };
};
const getDeliveryInfo = (productsTotal) => {
    const itemsCount = getTotalItemsCount();
    const deliveryInfo = calculateDeliveryCost(itemsCount);
    return {
        ...deliveryInfo,
        finalCost: productsTotal >= freeDeliveryThreshold ? 0 : deliveryInfo.cost
    };
};
const formatOrderRef = (orderId) => orderId.slice(-8).toUpperCase();
const createTransferTitle = (orderRef) => `Opłata za zamówienie nr: ${orderRef}`;
const getPaymentMethodLabel = (method) => {
    if (method === "blik")
        return "BLIK na telefon";
    if (method === "stripe_online")
        return "Karta płatnicza / BLIK online (Stripe)";
    return "Przelew tradycyjny";
};
const getPaymentTargetText = (method) => {
    if (method === "blik")
        return `Telefon BLIK: ${paymentConfig.blikPhone}`;
    if (method === "stripe_online")
        return "Płatność została przetworzona online";
    return `${paymentConfig.accountHolder}, konto: ${paymentConfig.accountNumber}`;
};
const renderPaymentInstructions = () => {
    const method = paymentMethod.value;
    if (method === "stripe_online") {
        paymentInstructions.innerHTML = `
      <p><strong>Płatność online:</strong> Zostaniesz przekierowany do bezpiecznej bramki Stripe.</p>
      <p><small>⚡ Akceptujemy karty płatnicze, BLIK online, Przelewy24 i więcej.</small></p>
    `;
        return;
    }
    if (method === "blik") {
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
};
const loadPaymentConfig = async () => {
    try {
        const response = await fetch(PAYMENT_CONFIG_URL);
        if (!response.ok)
            return;
        const data = await response.json();
        if (data?.payment) {
            paymentConfig = {
                accountNumber: data.payment.accountNumber || paymentConfig.accountNumber,
                accountHolder: data.payment.accountHolder || paymentConfig.accountHolder,
                blikPhone: data.payment.blikPhone || paymentConfig.blikPhone,
            };
            renderPaymentInstructions();
        }
        if (data?.cart?.freeDeliveryThreshold) {
            const candidate = Number(data.cart.freeDeliveryThreshold);
            if (Number.isFinite(candidate) && candidate > 0) {
                freeDeliveryThreshold = candidate;
            }
        }
        if (data?.cart?.parcelSizes && Array.isArray(data.cart.parcelSizes)) {
            parcelSizes = data.cart.parcelSizes;
        }
        renderCart();
    }
    catch (error) {
        console.error("Nie udało się pobrać danych płatności", error);
    }
};
const normalizePhone = (phone) => phone.replace(/\D/g, "");
const getPhoneSuffix = (phone) => {
    const digits = normalizePhone(phone);
    return digits.slice(-4);
};
const isPhoneValid = (phone) => normalizePhone(phone).length === 9;
const isParcelLockerCodeValid = (code) => /^[A-Z]{3}\d{2}[A-Z0-9]?$/.test(code.toUpperCase());
const saveLastOrderReference = (data) => {
    localStorage.setItem(ORDER_REF_STORAGE_KEY, JSON.stringify(data));
};
const loadLastOrderReference = () => {
    const saved = localStorage.getItem(ORDER_REF_STORAGE_KEY);
    if (!saved)
        return null;
    try {
        return JSON.parse(saved);
    }
    catch (error) {
        console.error("Błąd przy ładowaniu numeru ostatniego zamówienia", error);
        return null;
    }
};
const renderLastOrderReference = () => {
    const lastOrder = loadLastOrderReference();
    if (!lastOrder) {
        lastOrderCard.hidden = true;
        return;
    }
    const savedPaymentMethod = lastOrder.paymentMethod === "blik" ? "blik" : "bank_transfer";
    const isBlikPayment = savedPaymentMethod === "blik";
    const transferTitleRow = lastOrderTransferTitle.closest("p");
    lastOrderId.textContent = lastOrder.orderRef;
    lastOrderPaymentMethod.textContent = getPaymentMethodLabel(savedPaymentMethod);
    lastOrderTransferTitle.textContent = lastOrder.transferTitle;
    lastOrderPaymentTargetLabel.textContent = isBlikPayment ? "Numer BLIK:" : "Dane płatności:";
    lastOrderPaymentTarget.textContent = lastOrder.paymentTarget || getPaymentTargetText(savedPaymentMethod);
    lastOrderPhoneSuffix.textContent = lastOrder.phoneSuffix;
    lastOrderLocker.textContent = lastOrder.parcelLockerCode;
    if (transferTitleRow) {
        transferTitleRow.hidden = isBlikPayment;
    }
    copyTransferTitleBtn.textContent = isBlikPayment ? "Kopiuj numer BLIK" : "Kopiuj tytuł płatności";
    lastOrderCard.hidden = false;
};
const renderCheckoutSummary = () => {
    checkoutSummaryList.innerHTML = "";
    if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Koszyk jest pusty. Dodaj produkty, aby złożyć zamówienie.";
        checkoutSummaryList.appendChild(empty);
        checkoutTotal.textContent = "0";
        return;
    }
    cart.forEach(item => {
        const row = document.createElement("p");
        row.className = "checkout-summary-row";
        row.textContent = `${item.name} — ${item.qty} słoik(ów) × ${item.price} zł`;
        checkoutSummaryList.appendChild(row);
    });
    const productsTotal = getCartTotalPrice();
    const deliveryInfo = getDeliveryInfo(productsTotal);
    const totalWithDelivery = productsTotal + deliveryInfo.finalCost;
    const itemsCount = getTotalItemsCount();
    // Dodaj podsumowanie kosztów
    const summaryBreakdown = document.createElement("div");
    summaryBreakdown.className = "checkout-cost-breakdown";
    const parcelInfo = deliveryInfo.numberOfParcels > 1
        ? `${deliveryInfo.numberOfParcels} paczki`
        : `1 paczka`;
    summaryBreakdown.innerHTML = `
    <p class="checkout-summary-row"><strong>Produkty (galaretki):</strong> ${productsTotal} zł</p>
    <p class="checkout-summary-row"><strong>Dostawa (${parcelInfo}, ${itemsCount} szt.):</strong> ${deliveryInfo.finalCost === 0 ? '<strong>Gratis!</strong>' : `${deliveryInfo.finalCost} zł`}</p>
  `;
    checkoutSummaryList.appendChild(summaryBreakdown);
    checkoutTotal.textContent = totalWithDelivery.toString();
};
const handleCheckoutSubmit = async (event) => {
    event.preventDefault();
    if (cart.length === 0) {
        setCheckoutMessage("Koszyk jest pusty. Dodaj produkty przed złożeniem zamówienia.", true);
        return;
    }
    const phone = customerPhone.value.trim();
    const phoneSuffix = getPhoneSuffix(phone);
    const parcelLocker = parcelLockerCode.value.trim().toUpperCase();
    const selectedPaymentMethod = paymentMethod.value;
    const wantsOptionalAccount = createOptionalAccount.checked;
    const optionalEmail = optionalAccountEmail.value.trim();
    const notes = customerNotes.value.trim();
    if (!isPhoneValid(phone)) {
        setCheckoutMessage("Podaj poprawny numer telefonu (9 cyfr).", true);
        customerPhone.focus();
        return;
    }
    if (!isParcelLockerCodeValid(parcelLocker)) {
        setCheckoutMessage("Podaj poprawny kod paczkomatu (np. WAW01A).", true);
        parcelLockerCode.focus();
        return;
    }
    if (wantsOptionalAccount && optionalEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(optionalEmail)) {
        setCheckoutMessage("Podaj poprawny adres e-mail do konta lub zostaw pole puste.", true);
        optionalAccountEmail.focus();
        return;
    }
    // Show loading state
    setCheckoutMessage("⏳ Wysyłanie zamówienia...", false);
    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    if (submitBtn)
        submitBtn.disabled = true;
    const productsTotal = getCartTotalPrice();
    const deliveryInfo = getDeliveryInfo(productsTotal);
    const totalWithDelivery = productsTotal + deliveryInfo.finalCost;
    // Handle Stripe online payment
    if (selectedPaymentMethod === 'stripe_online') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: cart,
                    productsTotal,
                    deliveryCost: deliveryInfo.finalCost,
                    total: totalWithDelivery,
                    orderData: {
                        phone,
                        phoneSuffix,
                        parcelLockerCode: parcelLocker,
                        notes: notes || undefined,
                        parcelLabel: deliveryInfo.parcelLabel,
                        createOptionalAccount: wantsOptionalAccount,
                        optionalAccountEmail: wantsOptionalAccount ? optionalEmail || undefined : undefined,
                    }
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Błąd przy tworzeniu sesji płatności");
            }
            // Save cart data temporarily for restoration after payment
            sessionStorage.setItem('pendingOrderData', JSON.stringify({
                phone,
                parcelLocker,
                notes,
                wantsOptionalAccount,
                optionalEmail
            }));
            // Redirect to Stripe Checkout
            window.location.href = data.url;
            return;
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Nieznany błąd";
            setCheckoutMessage(`❌ ${errorMsg}`, true);
            showToast("Błąd przy inicjalizacji płatności");
            if (submitBtn)
                submitBtn.disabled = false;
            return;
        }
    }
    // Handle traditional payment methods (bank transfer, BLIK)
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone,
                phoneSuffix,
                parcelLockerCode: parcelLocker,
                notes: notes || undefined,
                items: cart,
                productsTotal,
                deliveryCost: deliveryInfo.finalCost,
                total: totalWithDelivery,
                paymentMethod: selectedPaymentMethod,
                createOptionalAccount: wantsOptionalAccount,
                optionalAccountEmail: wantsOptionalAccount ? optionalEmail || undefined : undefined,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Błąd przy wysyłaniu zamówienia");
        }
        // Success!
        const orderRef = data.orderRef || formatOrderRef(data.orderId);
        const transferTitle = data.transferTitle || createTransferTitle(orderRef);
        const paymentTarget = data.paymentTarget || getPaymentTargetText(selectedPaymentMethod);
        const paymentMethodLabel = getPaymentMethodLabel(selectedPaymentMethod);
        const paymentMessage = selectedPaymentMethod === "blik"
            ? `✅ Zamówienie zapisane.<br><strong style="font-size: 1.2em;">Numer: ${orderRef}</strong><br><small>Metoda: ${paymentMethodLabel}. Realizacja po zaksięgowaniu wpłaty. Numer BLIK: ${paymentConfig.blikPhone}</small>`
            : `✅ Zamówienie zapisane.<br><strong style="font-size: 1.2em;">Numer: ${orderRef}</strong><br><small>Metoda: ${paymentMethodLabel}. Realizacja po zaksięgowaniu wpłaty. Tytuł płatności: ${transferTitle}</small>`;
        setCheckoutMessage(paymentMessage, false);
        showToast("Zamówienie przyjęte!");
        saveLastOrderReference({
            orderRef,
            paymentMethod: selectedPaymentMethod,
            transferTitle,
            paymentTarget,
            phoneSuffix,
            parcelLockerCode: parcelLocker,
        });
        renderLastOrderReference();
        // Clear form
        customerPhone.value = "";
        parcelLockerCode.value = "";
        parcelSearchQuery.value = "";
        createOptionalAccount.checked = false;
        optionalAccountFields.hidden = true;
        optionalAccountEmail.value = "";
        customerNotes.value = "";
        // Clear cart
        cart = [];
        renderCart();
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Nieznany błąd";
        setCheckoutMessage(`❌ ${errorMsg}`, true);
        showToast("Błąd przy wysyłaniu zamówienia");
    }
    finally {
        if (submitBtn)
            submitBtn.disabled = false;
    }
};
// Funkcja usunięcia produktu z koszyka
const removeItem = (name) => {
    cart = cart.filter(item => item.name !== name);
    renderCart();
    showToast(`${name} usunięty z koszyka`);
};
// Funkcja zmniejszenia ilości
const decreaseQty = (name) => {
    const item = cart.find(i => i.name === name);
    if (item) {
        if (item.qty > 1) {
            item.qty--;
            renderCart();
        }
        else {
            removeItem(name);
        }
    }
};
// Funkcja zwiększenia ilości
const increaseQty = (name) => {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.qty++;
        renderCart();
    }
};
// Funkcja wyczyszczenia koszyka
const clearCart = () => {
    if (cart.length === 0)
        return;
    if (confirm("Na pewno chcesz wyczyścić cały koszyk?")) {
        cart = [];
        renderCart();
        showToast("✨ Koszyk został wyczyszczony", "success");
        setCheckoutMessage("🧺 Koszyk został wyczyszczony. Możesz dodać produkty ponownie.", false);
    }
};
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
        }
        catch (e) {
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
    cart.forEach(item => {
        const row = document.createElement("div");
        row.classList.add("cart-item", "fade-in");
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.onerror = () => {
            // Fallback gdy obrazek nie istnieje
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
        }
        else {
            cart.push({ name, price, qty: 1, image });
        }
        renderCart();
        if (window.innerWidth <= 767) {
            miniCart.scrollIntoView({ behavior: "smooth", block: "center" });
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
copyTransferTitleBtn.addEventListener("click", async () => {
    const lastOrder = loadLastOrderReference();
    const isBlikPayment = lastOrder?.paymentMethod === "blik";
    const value = isBlikPayment
        ? lastOrderPaymentTarget.textContent?.trim()
        : lastOrderTransferTitle.textContent?.trim();
    if (!value || value === "-") {
        showToast(isBlikPayment ? "Brak numeru BLIK do skopiowania" : "Brak tytułu płatności do skopiowania");
        return;
    }
    try {
        await navigator.clipboard.writeText(value);
        showToast(isBlikPayment ? "Skopiowano numer BLIK" : "Skopiowano tytuł płatności");
    }
    catch (error) {
        console.error("Nie udało się skopiować danych płatności", error);
        showToast("Nie udało się skopiować danych");
    }
});
paymentMethod.addEventListener("change", () => {
    renderPaymentInstructions();
});
createOptionalAccount.addEventListener("change", () => {
    optionalAccountFields.hidden = !createOptionalAccount.checked;
    if (!createOptionalAccount.checked) {
        optionalAccountEmail.value = "";
    }
});
// Załaduj koszyk z localStorage przy starcie
checkoutForm.addEventListener("submit", handleCheckoutSubmit);
loadCart();
renderCart();
renderPaymentInstructions();
void loadPaymentConfig();
renderLastOrderReference();
export {};
//# sourceMappingURL=app.js.map
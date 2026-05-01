import { CartManager } from "./cart-manager.js";
import { renderCheckoutSummary } from "./checkout-summary.js";
import { showToast } from "./utils.js";
import { STORE_CONFIG, getProductConfig } from "../config/store.js";

/**
 * Apply product configuration to product cards in DOM
 */
export function applyProductConfiguration(): void {
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

/**
 * Setup add to cart button handlers
 */
export function setupAddToCartButtons(cartManager: CartManager): void {
  const addButtons = document.querySelectorAll(".addToCartBtn") as NodeListOf<HTMLButtonElement>;

  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.product;
      const priceStr = btn.dataset.price;
      const image = btn.dataset.image;

      if (!name || !priceStr || !image) {
        console.error("Missing product data on button:", btn);
        return;
      }

      const price = Number(priceStr);
      if (isNaN(price) || price <= 0) {
        console.error("Invalid product price:", priceStr);
        return;
      }

      // Add to cart
      cartManager.add(name, price, image);
      renderCheckoutSummary(cartManager);

      // Scroll to summary
      const checkoutSummary = document.getElementById("checkoutSummary");
      if (checkoutSummary) {
        checkoutSummary.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Animacja podskoku i pulsującej obwódki
      btn.classList.remove("animated");
      // Trigger reflow to restart animation if clicked rapidly
      void btn.offsetWidth;
      btn.classList.add("animated");
      btn.addEventListener(
        "animationend",
        () => btn.classList.remove("animated"),
        { once: true }
      );

      showToast(`Dodano 1 szt. produktu ${name}.`);
    });
  });
}

/**
 * Setup cart item action handlers (increase, decrease, remove)
 */
export function setupCartItemHandlers(cartManager: CartManager): void {
  // Event delegation for checkout summary
  const summaryEl = document.getElementById("checkoutSummary");
  if (!summaryEl) return;

  summaryEl.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const productName = target.dataset.productName;

    if (!productName) return;

    if (target.classList.contains("cart-btn-decrease")) {
      cartManager.decreaseQty(productName);
    } else if (target.classList.contains("cart-btn-increase")) {
      cartManager.increaseQty(productName);
    } else if (target.classList.contains("cart-btn-remove")) {
      cartManager.remove(productName);
    } else {
      return;
    }

    // Re-render after any cart change
    renderCheckoutSummary(cartManager);
    cartManager.saveToStorage();
  });
}

/**
 * Apply store configuration (emails, phone, hours) to DOM
 */
export function applyStoreConfiguration(): void {
  // Apply emails
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

  // Apply phone
  document.querySelectorAll("[data-store-phone]").forEach((node) => {
    if (!(node instanceof HTMLAnchorElement)) return;
    node.href = STORE_CONFIG.contact.phoneHref;
    node.textContent = STORE_CONFIG.contact.phoneDisplay;
  });

  // Apply fulfillment hours
  document.querySelectorAll("[data-store-fulfillment-hours]").forEach((node) => {
    node.textContent = STORE_CONFIG.contact.fulfillmentHours;
  });
}

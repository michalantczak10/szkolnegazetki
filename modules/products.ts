import { CartManager } from "./cart-manager.js";
import { renderCheckoutSummary } from "./checkout-summary.js";
import { showToast } from "./utils.js";
import { STORE_CONFIG, getCategoryConfig, type CategoryId, type StoreProduct } from "../config/store.js";

/**
 * Apply category configuration to category cards in DOM
 */
export function applyCategoryConfiguration(): void {
  document.querySelectorAll(".product-card[data-category-id]").forEach((cardNode) => {
    if (!(cardNode instanceof HTMLElement)) return;

    const categoryId = cardNode.dataset.categoryId as CategoryId;
    const category = getCategoryConfig(categoryId);
    if (!category) return;

    const imageEl = cardNode.querySelector("[data-category-image]") as HTMLImageElement | null;
    const nameEl = cardNode.querySelector("[data-category-name]") as HTMLElement | null;
    const descriptionEl = cardNode.querySelector("[data-category-description]") as HTMLElement | null;

    if (imageEl) {
      imageEl.src = category.image;
      imageEl.alt = category.imageAlt;
    }
    if (nameEl) nameEl.textContent = category.name;
    if (descriptionEl) descriptionEl.textContent = category.description;
  });
}

/**
 * Render product items inside a category panel
 */
function renderCategoryProducts(
  container: Element,
  products: readonly StoreProduct[],
  cartManager: CartManager
): void {
  container.innerHTML = "";
  const list = document.createElement("ul");
  list.className = "category-products-list";

  products.forEach((product) => {
    const li = document.createElement("li");
    li.className = "category-product-item";

    const info = document.createElement("div");
    info.className = "category-product-info";

    const name = document.createElement("span");
    name.className = "category-product-name";
    name.textContent = product.name;

    const desc = document.createElement("span");
    desc.className = "category-product-desc";
    desc.textContent = product.description;

    info.appendChild(name);
    info.appendChild(desc);

    const action = document.createElement("div");
    action.className = "category-product-action";

    const priceEl = document.createElement("span");
    priceEl.className = "category-product-price";
    priceEl.textContent = `${product.price} zł`;

    const btn = document.createElement("button");
    btn.className = "addToCartBtn";
    btn.dataset.productId = product.id;
    btn.dataset.product = product.name;
    btn.dataset.price = String(product.price);
    btn.dataset.image = product.image;
    btn.setAttribute("aria-label", `Dodaj ${product.name} do zamówienia`);
    btn.setAttribute("data-testid", "btn-add-to-cart");
    btn.textContent = "Dodaj do zamówienia";

    btn.addEventListener("click", () => {
      cartManager.add(product.name, product.price, product.image);
      renderCheckoutSummary(cartManager);

      const checkoutSummary = document.getElementById("checkoutSummary");
      if (checkoutSummary) {
        checkoutSummary.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      btn.classList.remove("animated");
      void btn.offsetWidth;
      btn.classList.add("animated");
      btn.addEventListener("animationend", () => btn.classList.remove("animated"), { once: true });

      showToast(`Dodano 1 szt. produktu ${product.name}.`);
    });

    action.appendChild(priceEl);
    action.appendChild(btn);
    li.appendChild(info);
    li.appendChild(action);
    list.appendChild(li);
  });

  container.appendChild(list);
}

/**
 * Setup category card expand/collapse toggles
 */
export function setupCategoryCardToggles(cartManager: CartManager): void {
  const allCards = document.querySelectorAll(".product-card[data-category-id]");

  allCards.forEach((cardNode) => {
    if (!(cardNode instanceof HTMLElement)) return;

    const expandBtn = cardNode.querySelector(".category-expand-btn") as HTMLButtonElement | null;
    const panelId = expandBtn?.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    const categoryId = cardNode.dataset.categoryId as CategoryId;
    const category = getCategoryConfig(categoryId);

    if (!expandBtn || !panel || !category) return;

    expandBtn.addEventListener("click", () => {
      const isOpen = expandBtn.getAttribute("aria-expanded") === "true";

      // Close all other panels
      allCards.forEach((otherCard) => {
        if (otherCard === cardNode || !(otherCard instanceof HTMLElement)) return;
        const otherBtn = otherCard.querySelector(".category-expand-btn") as HTMLButtonElement | null;
        const otherPanelId = otherBtn?.getAttribute("aria-controls");
        const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        if (otherPanel) {
          otherPanel.setAttribute("aria-hidden", "true");
          otherPanel.classList.remove("open");
          const otherInner = otherPanel.querySelector(".category-products-panel-inner");
          if (otherInner) otherInner.innerHTML = "";
        }
        otherCard.classList.remove("expanded");
      });

      if (isOpen) {
        expandBtn.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
        panel.classList.remove("open");
        const inner = panel.querySelector(".category-products-panel-inner");
        if (inner) inner.innerHTML = "";
        cardNode.classList.remove("expanded");
      } else {
        const inner = panel.querySelector(".category-products-panel-inner");
        if (inner) renderCategoryProducts(inner, category.products, cartManager);
        expandBtn.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
        panel.classList.add("open");
        cardNode.classList.add("expanded");
      }
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

import { CartManager } from "./cart-manager.js";
import { renderCheckoutSummary } from "./checkout-summary.js";
import { showToast } from "./utils.js";
import { STORE_CONFIG, CATEGORY_GROUPS, getCategoryConfig, type CategoryId, type StoreProduct, type StoreCategory } from "../config/store.js";

const CHEVRON_SVG = `<svg class="expand-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"/></svg>`;

/**
 * Create a category card element from config
 */
function createCategoryCard(category: StoreCategory): HTMLElement {
  const panelId = `category-panel-${category.id}`;
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.categoryId = category.id;

  const featuresHtml = category.features
    .map((f) => `<li>${f}</li>`)
    .join("");

  card.innerHTML = `
    <picture>
      <source srcset="${category.imageWebp}" type="image/webp" />
      <img src="${category.image}" alt="${category.imageAlt}" loading="lazy" decoding="async" data-category-image />
    </picture>
    <div class="product-card-body">
      <h3 data-category-name>${category.name}</h3>
      <p class="product-card-desc" data-category-description>${category.description}</p>
      <ul class="product-features" aria-label="Co zawiera kategorię" data-category-features>
        ${featuresHtml}
      </ul>
      <div class="product-card-footer">
        <button class="category-expand-btn" aria-expanded="false" aria-controls="${panelId}" data-testid="btn-expand-category">
          Wybierz produkt
          ${CHEVRON_SVG}
        </button>
      </div>
    </div>
    <div class="category-products-panel" id="${panelId}" aria-hidden="true">
      <div class="category-products-panel-inner"></div>
    </div>
  `;

  return card;
}

/**
 * Generate and insert all category cards grouped by season into #product-grid
 */
export function applyCategoryConfiguration(): void {
  const container = document.getElementById("product-grid");
  if (!container) return;

  container.innerHTML = "";

  for (const group of CATEGORY_GROUPS) {
    const section = document.createElement("section");
    section.className = "category-group";
    section.dataset.groupId = group.id;

    const heading = document.createElement("h3");
    heading.className = "category-group-heading";
    heading.textContent = group.label;

    const grid = document.createElement("div");
    grid.className = "product-grid";

    for (const categoryId of group.categoryIds) {
      const category = getCategoryConfig(categoryId);
      if (category) grid.appendChild(createCategoryCard(category));
    }

    section.appendChild(heading);
    section.appendChild(grid);
    container.appendChild(section);
  }
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

function closePanel(panel: HTMLElement, card: HTMLElement, btn: HTMLButtonElement, animated = false): void {
  btn.setAttribute("aria-expanded", "false");
  panel.setAttribute("aria-hidden", "true");
  panel.classList.remove("open");
  card.classList.remove("expanded");
  if (animated) {
    panel.addEventListener(
      "transitionend",
      () => {
        const inner = panel.querySelector(".category-products-panel-inner");
        if (inner) inner.innerHTML = "";
      },
      { once: true }
    );
  } else {
    const inner = panel.querySelector(".category-products-panel-inner");
    if (inner) inner.innerHTML = "";
  }
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
        if (otherBtn && otherPanel) closePanel(otherPanel, otherCard, otherBtn, false);
      });

      if (isOpen) {
        closePanel(panel, cardNode, expandBtn, true);
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

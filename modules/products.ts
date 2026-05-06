import { CartManager } from "./cart-manager.js";
import { renderCheckoutSummary } from "./checkout-summary.js";
import { showToast } from "./utils.js";
import { STORE_CONFIG, CATEGORY_GROUPS, getCategoryConfig, type CategoryId, type StoreProduct, type StoreCategory } from "../config/store.js";

const CHEVRON_SVG = `<svg class="expand-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"/></svg>`;

type ProductPreview = {
  id: string;
  title: string;
  caption: string;
  fileWebp: string;
  fileJpg: string;
  svgThumb: string;
};

type PreviewToken = { token: string; exp: number };

let _cachedToken: PreviewToken | null = null;

async function ensurePreviewToken(): Promise<PreviewToken> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (_cachedToken && _cachedToken.exp > nowSeconds + 30) return _cachedToken;
  try {
    const res = await fetch("/api/preview-token");
    if (!res.ok) throw new Error("token fetch failed");
    const data = (await res.json()) as PreviewToken;
    _cachedToken = data;
    return data;
  } catch {
    return { token: "dev", exp: nowSeconds + 300 };
  }
}

function previewApiUrl(file: string, tok: PreviewToken): string {
  return `/api/preview-img?file=${encodeURIComponent(file)}&token=${tok.token}&exp=${tok.exp}`;
}

function buildEnhancedDescription(product: StoreProduct): string {
  const base = product.description.replace(/\.$/, "");
  const isTemplate = product.name.toLowerCase().includes("szablon");
  const formatHint = isTemplate ? "Gotowy układ redakcyjny" : "Gotowy materiał do wydruku";
  return `${base}. ${formatHint}, 3 wersje podglądu do wyboru przed zakupem.`;
}

function variantSvgUrl(productId: string, v: number): string {
  return new URL(`../img/products/prod-${productId}-v${v}.svg`, import.meta.url).href;
}

// ─── Dynamic preview map built from previews/ folder structure ───────────────
// Glob discovers all SVGs at build time: previews/{catId}/wariant-{N}/grafika-{M}.svg
const RAW_PREVIEWS = import.meta.glob(
  "../previews/**/*.svg",
  { query: "?url", import: "default", eager: true }
) as Record<string, string>;

// Map: catId → variantIdx(0-based) → sorted URL[]
const PREVIEW_MAP = new Map<string, Map<number, string[]>>();
for (const [rawPath, url] of Object.entries(RAW_PREVIEWS)) {
  // rawPath like: "../previews/poster/wariant-1/grafika-1.svg"
  const segments = rawPath.split("/");
  const catId      = segments[2];
  const variantDir = segments[3]; // "wariant-1", "wariant-2", ...
  const variantNum = parseInt(variantDir?.replace("wariant-", "") ?? "", 10);
  if (!Number.isFinite(variantNum) || Number.isNaN(variantNum)) continue;
  const variantIdx = variantNum - 1;
  if (!PREVIEW_MAP.has(catId)) PREVIEW_MAP.set(catId, new Map());
  const catMap = PREVIEW_MAP.get(catId)!;
  if (!catMap.has(variantIdx)) catMap.set(variantIdx, []);
  catMap.get(variantIdx)!.push(url);
}
// Sort URLs within each variant so grafika-1, grafika-2, ... are in order
for (const catMap of PREVIEW_MAP.values()) {
  for (const [idx, urls] of catMap) catMap.set(idx, [...urls].sort());
}
// ─────────────────────────────────────────────────────────────────────────────

function createProductPreviews(
  product: StoreProduct,
  catId: string,
  variantIdx: number
): ProductPreview[] {
  const urls = PREVIEW_MAP.get(catId)?.get(variantIdx) ?? [];
  const sources = urls.length > 0
    ? urls
    : [0, 1, 2, 3, 4, 5].map((i) => variantSvgUrl(product.id, i + 1));
  return sources.map((url, i) => ({
    id: `${product.id}-v${i + 1}`,
    title: `${product.name} – Grafika ${i + 1}`,
    caption: `Grafika ${i + 1}`,
    fileWebp: `${product.id}-v${i + 1}.webp`,
    fileJpg: `${product.id}-v${i + 1}.jpg`,
    svgThumb: url,
  }));
}

async function applyCanvasWatermark(src: string): Promise<string> {
  const emailEl = document.getElementById("customerEmail") as HTMLInputElement | null;
  const email = emailEl?.value?.trim() ?? "";
  const label = email || "szkolnegazetki.pl";

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(src); return; }

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(14, Math.round(canvas.width * 0.042));
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lineH = fontSize * 2.6;
      for (let y = -canvas.height * 1.2; y < canvas.height * 1.2; y += lineH * 2) {
        ctx.fillText(label, 0, y);
        ctx.fillText("PODGLĄD – szkolnegazetki.pl", 0, y + lineH);
      }
      ctx.restore();

      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

function ensurePreviewModal(): HTMLElement {
  const existing = document.getElementById("preview-modal");
  if (existing) return existing;

  const modal = document.createElement("div");
  modal.id = "preview-modal";
  modal.className = "preview-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("data-testid", "preview-modal");
  modal.innerHTML = `
    <div class="preview-modal-backdrop" data-preview-close="true"></div>
    <div class="preview-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
      <button class="preview-modal-close" type="button" aria-label="Zamknij podglad" data-preview-close="true">Zamknij</button>
      <h4 id="preview-modal-title" class="preview-modal-title"></h4>
      <p class="preview-modal-note">Podglad o obnizonej jakosci z watermarkiem. Pelna wersja po oplaceniu.</p>
      <img class="preview-modal-image" alt="Powiekszony podglad produktu" />
    </div>
  `;

  const closeModal = (): void => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("preview-modal-open");
  };

  modal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-preview-close='true']")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  const image = modal.querySelector(".preview-modal-image") as HTMLImageElement | null;
  if (image) {
    image.draggable = false;
    image.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  document.body.appendChild(modal);
  return modal;
}

async function openPreviewModal(preview: ProductPreview, tok: PreviewToken): Promise<void> {
  const modal = ensurePreviewModal();
  const title = modal.querySelector(".preview-modal-title") as HTMLElement | null;
  const image = modal.querySelector(".preview-modal-image") as HTMLImageElement | null;
  if (!title || !image) return;

  title.textContent = preview.title;
  image.src = "";
  modal.classList.add("open", "preview-loading");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("preview-modal-open");

  const rawUrl = previewApiUrl(preview.fileWebp, tok);
  const watermarked = await applyCanvasWatermark(rawUrl);
  image.src = watermarked;
  image.alt = preview.title;
  modal.classList.remove("preview-loading");
}

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
      ${category.imageWebp !== category.image ? `<source srcset="${category.imageWebp}" type="image/webp" />` : ""}
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
    heading.dataset.testid = "category-group-heading";
    heading.dataset.groupId = group.id;

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
async function renderCategoryProducts(
  container: Element,
  categoryId: string,
  products: readonly StoreProduct[],
  cartManager: CartManager
): Promise<void> {
  container.innerHTML = "";
  const list = document.createElement("ul");
  list.className = "category-products-list";

  const tok = await ensurePreviewToken();

  // Determine how many variants to show: filesystem variant count takes precedence
  const catPreviewMap = PREVIEW_MAP.get(categoryId);
  const effectiveCount = catPreviewMap && catPreviewMap.size > 0
    ? Math.min(catPreviewMap.size, products.length)
    : products.length;
  const visibleProducts = products.slice(0, effectiveCount);

  visibleProducts.forEach((product, variantIdx) => {
    const previews = createProductPreviews(product, categoryId, variantIdx);
    const variantImage = previews[0]?.svgThumb ?? product.image;
    const li = document.createElement("li");
    li.className = "category-product-item";

    const productImg = document.createElement("img");
    productImg.src = variantImage;
    productImg.alt = product.name;
    productImg.className = "category-product-image";
    productImg.loading = "lazy";
    productImg.decoding = "async";
    productImg.draggable = false;

    const info = document.createElement("div");
    info.className = "category-product-info";

    const name = document.createElement("span");
    name.className = "category-product-name";
    name.textContent = product.name;

    const desc = document.createElement("span");
    desc.className = "category-product-desc";
    desc.textContent = buildEnhancedDescription(product);

    info.appendChild(name);
    info.appendChild(desc);

    const previewGallery = document.createElement("div");
    previewGallery.className = "category-preview-gallery";
    previewGallery.setAttribute("aria-label", `Wersje podgladu dla ${product.name}`);

    previews.forEach((preview) => {
      const thumbButton = document.createElement("button");
      thumbButton.className = "category-preview-thumb";
      thumbButton.type = "button";
      thumbButton.setAttribute("aria-label", `Powieksz ${preview.title}`);
      thumbButton.setAttribute("data-testid", "btn-preview-thumb");

      const thumbImage = document.createElement("img");
      thumbImage.src = preview.svgThumb;
      thumbImage.alt = preview.title;
      thumbImage.loading = "lazy";
      thumbImage.decoding = "async";
      thumbImage.draggable = false;
      thumbImage.addEventListener("contextmenu", (event) => event.preventDefault());

      const thumbLabel = document.createElement("span");
      thumbLabel.className = "category-preview-label";
      thumbLabel.textContent = preview.caption;

      thumbButton.appendChild(thumbImage);
      thumbButton.appendChild(thumbLabel);
      thumbButton.addEventListener("click", () => { void openPreviewModal(preview, tok); });
      previewGallery.appendChild(thumbButton);
    });

    const action = document.createElement("div");
    action.className = "category-product-action";

    const priceEl = document.createElement("span");
    priceEl.className = "category-product-price";
    priceEl.textContent = `${product.price} zł`;

    const btn = document.createElement("button");
    btn.className = "addToCartBtn";
    btn.dataset.productId = product.id;
    btn.dataset.productKey = product.id;
    btn.dataset.product = product.name;
    btn.dataset.price = String(product.price);
    btn.dataset.image = variantImage;
    btn.setAttribute("aria-label", `Dodaj ${product.name} do zamówienia`);
    btn.setAttribute("data-testid", "btn-add-to-cart");
    btn.textContent = "Dodaj do zamówienia";

    btn.addEventListener("click", () => {
      cartManager.add(product.id, product.name, product.price, variantImage);
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
    li.appendChild(productImg);
    li.appendChild(info);
    li.appendChild(previewGallery);
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
      void (async () => {
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
        expandBtn.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
        panel.classList.add("open");
        cardNode.classList.add("expanded");
        const inner = panel.querySelector(".category-products-panel-inner");
        if (inner) await renderCategoryProducts(inner, categoryId, category.products, cartManager);
      }
      })();
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
    const productKey = target.dataset.productKey;

    if (!productKey) return;

    if (target.classList.contains("cart-btn-decrease")) {
      cartManager.decreaseQty(productKey);
    } else if (target.classList.contains("cart-btn-increase")) {
      cartManager.increaseQty(productKey);
    } else if (target.classList.contains("cart-btn-remove")) {
      cartManager.remove(productKey);
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

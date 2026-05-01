import type { CartItem } from "../types.js";

/**
 * Render cart list in UI
 */
export function renderCartList(
  cart: CartItem[],
  cartList: HTMLElement
): void {
  cartList.innerHTML = "";
  if (!cart || cart.length === 0) {
    cartList.innerHTML = "<p>Twoje zamówienie jest puste.</p>";
    return;
  }
  cart.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span class="cart-item-name"><strong>${item.name}</strong></span>
      <div class="cart-item-controls">
        <button class="cart-btn cart-btn-decrease" data-action="decrease" data-product-name="${item.name}" aria-label="Zmniejsz ilość">-</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button class="cart-btn cart-btn-increase" data-action="increase" data-product-name="${item.name}" aria-label="Zwiększ ilość">+</button>
        <button class="cart-btn cart-btn-remove" data-action="remove" data-product-name="${item.name}" aria-label="Usuń z zamówienia">×</button>
        <span class="cart-item-subtotal">= ${item.price * item.qty} zł</span>
      </div>
    `;
    cartList.appendChild(div);
  });
}

/**
 * Show an error message in a container
 */
export function showCartError(message: string, container: HTMLElement): void {
  container.innerHTML = `<div class="cart-error">${message}</div>`;
}
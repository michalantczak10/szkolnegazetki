import type { OrderData, OrderConfirmationData } from "../types.js";
import { CartManager } from "./cart-manager.js";
import { apiFetch } from "../config/api.js";
import { showToast } from "./utils.js";

export interface FormElements {
  checkoutForm: HTMLFormElement | null;
  submitButton: HTMLButtonElement | null;
  checkoutMessage: HTMLElement | null;
  paymentMethod: HTMLSelectElement | null;
  paymentInstructions: HTMLElement | null;
  customerName: HTMLInputElement | null;
  customerEmail: HTMLInputElement | null;
  customerPhone: HTMLInputElement | null;
  customerNotes: HTMLTextAreaElement | null;
}

/**
 * Get all required form elements
 */
export function getFormElements(): FormElements {
  return {
    checkoutForm: document.getElementById("checkoutForm") as HTMLFormElement | null,
    submitButton: document.getElementById("submitOrderBtn") as HTMLButtonElement | null,
    checkoutMessage: document.getElementById("checkoutMessage") as HTMLElement | null,
    paymentMethod: document.getElementById("paymentMethod") as HTMLSelectElement | null,
    paymentInstructions: document.getElementById("paymentInstructions") as HTMLElement | null,
    customerName: document.getElementById("customerName") as HTMLInputElement | null,
    customerEmail: document.getElementById("customerEmail") as HTMLInputElement | null,
    customerPhone: document.getElementById("customerPhone") as HTMLInputElement | null,
    customerNotes: document.getElementById("customerNotes") as HTMLTextAreaElement | null,
  };
}

/**
 * Build order data for submission
 */
export function buildOrderData(
  cartManager: CartManager,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  paymentMethod: string,
  notes: string
): OrderData {
  return {
    items: cartManager.getAll().map((item) => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
    })),
    customerName,
    customerEmail,
    customerPhone: customerPhone.replace(/\D/g, ""),
    paymentMethod,
    productsTotal: cartManager.getTotalPrice(),
    total: cartManager.getTotalPrice(),
    notes,
  };
}

/**
 * Submit order to backend
 */
export async function submitOrder(
  orderData: OrderData
): Promise<OrderConfirmationData | null> {
  try {
    const result = await apiFetch<OrderConfirmationData>(
      "/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      },
      10000
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showToast(`Błąd podczas wysyłania zamówienia: ${message}`);
    return null;
  }
}

/**
 * Update submit button state
 */
export function setSubmitButtonLoading(
  btn: HTMLButtonElement | null,
  isLoading: boolean,
  defaultText: string = "Zamawiam teraz"
): void {
  if (!btn) return;

  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Wysyłanie zamówienia..." : defaultText;

  if (isLoading) {
    btn.classList.add("btn-loading");
  } else {
    btn.classList.remove("btn-loading");
  }
}

/**
 * Set checkout message
 */
export function setCheckoutMessage(
  container: HTMLElement | null,
  message: string
): void {
  if (container) {
    container.innerText = message;
  }
}

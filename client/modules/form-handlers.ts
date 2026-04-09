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
  customerPhone: HTMLInputElement | null;
  parcelLockerCode: HTMLInputElement | null;
  customerNotes: HTMLTextAreaElement | null;
  createOptionalAccount: HTMLInputElement | null;
  optionalAccountEmail: HTMLInputElement | null;
  optionalAccountPassword: HTMLInputElement | null;
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
    customerPhone: document.getElementById("customerPhone") as HTMLInputElement | null,
    parcelLockerCode: document.getElementById("parcelLockerCode") as HTMLInputElement | null,
    customerNotes: document.getElementById("customerNotes") as HTMLTextAreaElement | null,
    createOptionalAccount: document.getElementById("createOptionalAccount") as HTMLInputElement | null,
    optionalAccountEmail: document.getElementById("optionalAccountEmail") as HTMLInputElement | null,
    optionalAccountPassword: document.getElementById("optionalAccountPassword") as HTMLInputElement | null,
  };
}

/**
 * Build order data for submission
 */
export function buildOrderData(
  cartManager: CartManager,
  phone: string,
  parcelCode: string,
  paymentMethod: string,
  notes: string,
  createOptionalAccount: boolean,
  optionalAccountEmail: string,
  optionalAccountPassword: string
): OrderData {
  return {
    items: cartManager.getAll().map((item) => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
    })),
    phone: phone.replace(/\D/g, ""),
    parcelLockerCode: parcelCode,
    paymentMethod,
    productsTotal: cartManager.getTotalPrice(),
    deliveryCost: cartManager.getDeliveryInfo().finalCost,
    total:
      cartManager.getTotalPrice() +
      cartManager.getDeliveryInfo().finalCost,
    notes,
    createOptionalAccount,
    optionalAccountEmail,
    optionalAccountPassword,
  };
}

/**
 * Submit order to backend
 */
export async function submitOrder(
  orderData: OrderData
): Promise<OrderConfirmationData | null> {
  try {
    const authToken = localStorage.getItem("galaretkarnia_auth_token");
    const result = await apiFetch<OrderConfirmationData>(
      "/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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

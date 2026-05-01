import type { ToastVariant } from "../types.js";

const TOAST_DURATION_MS = 3000;
const TOAST_ANIMATION_MS = 180;

function getToastVariant(text: string): ToastVariant {
  if (/dodano|zapisano|wysłano|gotowe|udane/i.test(text)) return "success";
  if (/usun|wyczyść|wyczyszcz|brak|popraw|błąd|nie udało|nieprawidł/i.test(text))
    return "warning";
  return "info";
}

function getToastIcon(text: string, variant: ToastVariant): string {
  if (/usun|wyczyść|wyczyszcz/i.test(text)) return "🗑️";
  if (variant === "success") return "✅";
  if (variant === "warning") return "⚠️";
  return "ℹ️";
}

/**
 * Show a toast notification
 */
export function showToast(message: string): void {
  let toast = document.getElementById("toastMessage");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMessage";
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true"></span>
      <span class="toast-text"></span>
    `;
    document.body.appendChild(toast);
  }

  const variant = getToastVariant(message);
  const icon = getToastIcon(message, variant);
  const iconEl = toast.querySelector(".toast-icon") as HTMLElement | null;
  const textEl = toast.querySelector(".toast-text") as HTMLElement | null;

  if (iconEl) iconEl.textContent = icon;
  if (textEl) textEl.textContent = message;

  toast.classList.remove("toast-success", "toast-warning", "toast-info");
  toast.classList.add(`toast-${variant}`);

  toast.classList.remove("toast-show");
  toast.classList.add("toast-hide");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      toast?.classList.remove("toast-hide");
      toast?.classList.add("toast-show");
    });
  });

  const previousTimer = Number(toast.dataset.hideTimer || "0");
  if (previousTimer) window.clearTimeout(previousTimer);
  const previousFinalizeTimer = Number(toast.dataset.finalizeTimer || "0");
  if (previousFinalizeTimer) window.clearTimeout(previousFinalizeTimer);

  const hideTimer = window.setTimeout(() => {
    toast?.classList.remove("toast-show");
    toast?.classList.add("toast-hide");

    const finalizeTimer = window.setTimeout(() => {
      toast?.classList.remove("toast-hide");
      if (toast) toast.dataset.finalizeTimer = "0";
    }, TOAST_ANIMATION_MS);

    if (toast) toast.dataset.finalizeTimer = String(finalizeTimer);
  }, TOAST_DURATION_MS);
  toast.dataset.hideTimer = String(hideTimer);
}

/**
 * Show a confirmation modal and return user's choice
 */
export function showConfirmModal(
  title: string,
  message: string,
  singleButton = false
): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-modal-overlay";

    const dialog = document.createElement("div");
    dialog.className = "confirm-modal";

    const h = document.createElement("h3");
    h.textContent = title;
    h.className = "confirm-modal-title";
    const p = document.createElement("p");
    p.textContent = message;
    p.className = "confirm-modal-message";

    const actions = document.createElement("div");
    actions.className = "confirm-actions";

    if (singleButton) {
      const btnOk = document.createElement("button");
      btnOk.className = "btn btn-confirm";
      btnOk.textContent = "OK";
      btnOk.addEventListener("click", () => {
        document.body.removeChild(overlay);
        resolve(true);
      });
      actions.appendChild(btnOk);
    } else {
      const btnCancel = document.createElement("button");
      btnCancel.className = "browse-products-btn btn-cancel";
      btnCancel.textContent = "Anuluj";
      btnCancel.addEventListener("click", () => {
        document.body.removeChild(overlay);
        resolve(false);
      });
      const btnConfirm = document.createElement("button");
      btnConfirm.className = "browse-products-btn btn-confirm";
      btnConfirm.textContent = "Tak, wyczyść";
      btnConfirm.addEventListener("click", () => {
        document.body.removeChild(overlay);
        resolve(true);
      });
      actions.appendChild(btnCancel);
      actions.appendChild(btnConfirm);
    }

    dialog.appendChild(h);
    dialog.appendChild(p);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}

import type { AuthResponse, AuthUser, UserOrdersResponse } from "../types.js";
import { apiFetch } from "../config/api.js";
import { showToast } from "./utils.js";

const AUTH_TOKEN_KEY = "szkolnegazetki_auth_token";

interface AccountElements {
  section: HTMLElement | null;
  guestView: HTMLElement | null;
  loggedInView: HTMLElement | null;
  loginForm: HTMLFormElement | null;
  registerForm: HTMLFormElement | null;
  loginEmail: HTMLInputElement | null;
  loginPassword: HTMLInputElement | null;
  registerEmail: HTMLInputElement | null;
  registerPassword: HTMLInputElement | null;
  requestResetForm: HTMLFormElement | null;
  confirmResetForm: HTMLFormElement | null;
  resetEmail: HTMLInputElement | null;
  resetToken: HTMLInputElement | null;
  resetNewPassword: HTMLInputElement | null;
  accountEmail: HTMLElement | null;
  logoutBtn: HTMLButtonElement | null;
  refreshOrdersBtn: HTMLButtonElement | null;
  ordersList: HTMLElement | null;
  accountStatus: HTMLElement | null;
}

function getElements(): AccountElements {
  return {
    section: document.getElementById("accountSection"),
    guestView: document.getElementById("accountGuestView"),
    loggedInView: document.getElementById("accountLoggedInView"),
    loginForm: document.getElementById("loginForm") as HTMLFormElement | null,
    registerForm: document.getElementById("registerForm") as HTMLFormElement | null,
    loginEmail: document.getElementById("loginEmail") as HTMLInputElement | null,
    loginPassword: document.getElementById("loginPassword") as HTMLInputElement | null,
    registerEmail: document.getElementById("registerEmail") as HTMLInputElement | null,
    registerPassword: document.getElementById("registerPassword") as HTMLInputElement | null,
    requestResetForm: document.getElementById("requestResetForm") as HTMLFormElement | null,
    confirmResetForm: document.getElementById("confirmResetForm") as HTMLFormElement | null,
    resetEmail: document.getElementById("resetEmail") as HTMLInputElement | null,
    resetToken: document.getElementById("resetToken") as HTMLInputElement | null,
    resetNewPassword: document.getElementById("resetNewPassword") as HTMLInputElement | null,
    accountEmail: document.getElementById("accountEmail"),
    logoutBtn: document.getElementById("logoutBtn") as HTMLButtonElement | null,
    refreshOrdersBtn: document.getElementById("refreshOrdersBtn") as HTMLButtonElement | null,
    ordersList: document.getElementById("accountOrdersList"),
    accountStatus: document.getElementById("accountStatus"),
  };
}

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function prefillResetTokenFromUrl(resetTokenInput: HTMLInputElement | null): void {
  if (!resetTokenInput) return;
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("resetToken");
  if (!tokenFromUrl) return;

  resetTokenInput.value = tokenFromUrl;
  const cleanedUrl = new URL(window.location.href);
  cleanedUrl.searchParams.delete("resetToken");
  window.history.replaceState({}, "", cleanedUrl.toString());
}

function formatOrderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pl-PL");
}

function renderOrders(ordersList: HTMLElement, orders: UserOrdersResponse["orders"]): void {
  if (!orders.length) {
    ordersList.innerHTML = '<p class="account-orders-empty">Brak zamówień przypisanych do tego konta.</p>';
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => {
      const itemsCount = order.items.reduce((sum, item) => sum + item.qty, 0);
      return `
        <article class="account-order-item">
          <h4>${order.orderRef}</h4>
          <p><strong>Data:</strong> ${formatOrderDate(order.createdAt)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Płatność:</strong> ${order.paymentStatus}</p>
          <p><strong>Pozycje:</strong> ${itemsCount} szt.</p>
          <p><strong>Kwota:</strong> ${order.total} zł</p>
        </article>
      `;
    })
    .join("");
}

async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const response = await apiFetch<{ success: boolean; user: AuthUser }>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.user;
  } catch {
    return null;
  }
}

async function fetchOrders(elements: AccountElements, token: string): Promise<void> {
  if (!elements.ordersList) return;

  elements.ordersList.innerHTML = '<p class="account-orders-empty">Ładowanie zamówień...</p>';
  try {
    const response = await apiFetch<UserOrdersResponse>("/api/auth/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    renderOrders(elements.ordersList, response.orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    elements.ordersList.innerHTML = '<p class="account-orders-empty">Nie udało się pobrać zamówień.</p>';
    showToast(`Błąd pobierania historii zamówień: ${message}`);
  }
}

function showGuestView(elements: AccountElements): void {
  if (elements.guestView) elements.guestView.hidden = false;
  if (elements.loggedInView) elements.loggedInView.hidden = true;
  if (elements.accountStatus) {
    elements.accountStatus.textContent = "Nie jesteś zalogowany.";
  }
}

async function showLoggedInView(elements: AccountElements, user: AuthUser, token: string): Promise<void> {
  if (elements.guestView) elements.guestView.hidden = true;
  if (elements.loggedInView) elements.loggedInView.hidden = false;
  if (elements.accountEmail) elements.accountEmail.textContent = user.email;
  if (elements.accountStatus) {
    elements.accountStatus.textContent = "Zalogowano. Historia zamówień została przypisana do konta.";
  }

  await fetchOrders(elements, token);
}

async function handleAuthSuccess(elements: AccountElements, response: AuthResponse): Promise<void> {
  setToken(response.token);
  await showLoggedInView(elements, response.user, response.token);
}

export async function setupAccountPanel(): Promise<void> {
  const elements = getElements();
  if (!elements.section) {
    return;
  }

  prefillResetTokenFromUrl(elements.resetToken);

  const existingToken = getToken();
  if (existingToken) {
    const currentUser = await fetchCurrentUser(existingToken);
    if (currentUser) {
      await showLoggedInView(elements, currentUser, existingToken);
    } else {
      clearToken();
      showGuestView(elements);
    }
  } else {
    showGuestView(elements);
  }

  elements.loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = elements.loginEmail?.value.trim() ?? "";
    const password = elements.loginPassword?.value ?? "";

    if (!email || !password) {
      showToast("Podaj e-mail i hasło.");
      return;
    }

    try {
      const response = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      await handleAuthSuccess(elements, response);
      elements.loginForm?.reset();
      showToast("Zalogowano pomyślnie.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showToast(`Błąd logowania: ${message}`);
    }
  });

  elements.registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = elements.registerEmail?.value.trim() ?? "";
    const password = elements.registerPassword?.value ?? "";

    if (!email || !password) {
      showToast("Podaj e-mail i hasło.");
      return;
    }

    try {
      const response = await apiFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      await handleAuthSuccess(elements, response);
      elements.registerForm?.reset();
      showToast("Konto utworzone i zalogowane.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showToast(`Błąd rejestracji: ${message}`);
    }
  });

  elements.requestResetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = elements.resetEmail?.value.trim() ?? "";

    if (!email) {
      showToast("Podaj adres e-mail do resetu hasła.");
      return;
    }

    try {
      await apiFetch<{ success: boolean; message: string }>("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      elements.requestResetForm?.reset();
      showToast("Jeśli konto istnieje, wysłaliśmy link resetujący hasło.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showToast(`Błąd resetu hasła: ${message}`);
    }
  });

  elements.confirmResetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = elements.resetToken?.value.trim() ?? "";
    const newPassword = elements.resetNewPassword?.value ?? "";

    if (!token || !newPassword) {
      showToast("Podaj token oraz nowe hasło.");
      return;
    }

    try {
      await apiFetch<{ success: boolean; message: string }>("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      elements.confirmResetForm?.reset();
      showToast("Hasło zmienione. Możesz się teraz zalogować.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showToast(`Nie udało się zmienić hasła: ${message}`);
    }
  });

  elements.logoutBtn?.addEventListener("click", () => {
    clearToken();
    showGuestView(elements);
    if (elements.ordersList) {
      elements.ordersList.innerHTML = "";
    }
    showToast("Wylogowano.");
  });

  elements.refreshOrdersBtn?.addEventListener("click", async () => {
    const token = getToken();
    if (!token) {
      showGuestView(elements);
      return;
    }
    await fetchOrders(elements, token);
  });
}

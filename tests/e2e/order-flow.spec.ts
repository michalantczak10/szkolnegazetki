import { test, expect } from '@playwright/test';

test('Pełny flow zamówienia: dodanie produktu, przejście do zamówienia, wysłanie formularza', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Dodaj produkt do koszyka
  const addButton = await page.locator('button', { hasText: /dodaj/i }).first();
  await addButton.click();

  // Przejdź do zamówienia
  const checkoutBtn = await page.locator('button', { hasText: /zamawiam/i }).first();
  await checkoutBtn.click();

  // Wypełnij formularz zamówienia
  await page.fill('input[name="customerPhone"]', '+48 500 600 700');
  await page.fill('input[name="parcelLockerCode"]', 'WAW01A');
  await page.fill('textarea[name="customerNotes"]', 'Proszę o szybką wysyłkę');
  // Opcjonalnie: załóż konto klienta
  await page.check('input[name="createOptionalAccount"]');
  await page.fill('input[name="optionalAccountEmail"]', 'test@example.com');

  // Wyślij formularz
  const submitBtn = await page.locator('button[type="submit"]');
  await submitBtn.click();

  // Sprawdź, czy pojawił się box z ostatnim zamówieniem
  const lastOrderCard = page.locator('#lastOrderCard');
  await expect(lastOrderCard).toBeVisible();
  // Sprawdź, czy numer zamówienia został nadany
  const lastOrderId = lastOrderCard.locator('[data-test-id="last-order-id"]');
  await expect(lastOrderId).not.toHaveText('-');
});

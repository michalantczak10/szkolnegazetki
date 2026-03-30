import { test, expect } from '@playwright/test';

test('Dodanie produktu do koszyka i wyświetlenie w mini-koszyku', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Kliknij pierwszy przycisk "Dodaj do koszyka" po data-test-id
  const addButton = await page.locator('[data-test-id="btn-add-to-cart"]').first();
  await addButton.click();

  // Sprawdź, czy mini-koszyk wyświetla produkt po data-test-id
  const cartList = await page.locator('[data-test-id="cart-list"]');
  await expect(cartList).toContainText(/galaretka|produkt/i);
});

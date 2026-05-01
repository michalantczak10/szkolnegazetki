import { expect, test } from '@playwright/test';

test.describe('Szkolne gazetki smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const rejectCookiesBtn = page.getByRole('button', { name: 'Odrzuć opcjonalne' });
    if (await rejectCookiesBtn.isVisible()) {
      await rejectCookiesBtn.click();
    }
  });

  test('home page loads with key sections', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Gotowe grafiki PDF');
    await expect(page.getByTestId('section-products')).toBeVisible();
    await expect(page.getByTestId('order-form')).toBeVisible();
    await expect(page.getByTestId('select-payment-method')).toBeVisible();
  });

  test('can add product to cart summary', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    const summary = page.getByTestId('checkout-summary-list');

    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Plakaty szkolne PDF');
    await expect(summary).toContainText('Wyczyść koszyk');
  });

  test('shows warning when submitting empty cart', async ({ page }) => {
    await page.getByTestId('btn-submit-order').click();

    const toast = page.locator('#toastMessage');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Zamówienie nie zawiera wybranego produktu.');
    await expect(page.locator('#order-confirm-modal')).toHaveCount(0);
  });

  test('updates payment instructions when method changes', async ({ page }) => {
    const paymentSelect = page.getByTestId('select-payment-method');
    const paymentInstructions = page.getByTestId('msg-payment-instructions');

    await expect(paymentInstructions).toContainText('Numer konta:');
    await paymentSelect.selectOption('blik');
    await expect(paymentInstructions).toContainText('Numer telefonu:');
    await paymentSelect.selectOption('bank_transfer');
    await expect(paymentInstructions).toContainText('Numer konta:');
  });

  test('keeps cart items after page reload', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    await expect(page.getByTestId('checkout-summary-list')).toContainText('Plakaty szkolne PDF');

    await page.reload();
    await expect(page.getByTestId('checkout-summary-list')).toContainText('Plakaty szkolne PDF');
  });

  test('validates phone field', async ({ page }) => {
    const phoneInput = page.getByTestId('input-customer-phone');
    const phoneError = page.getByTestId('msg-phone-error');

    await phoneInput.fill('123');
    await phoneInput.blur();
    await expect(phoneError).toContainText('Numer telefonu musi mieć 9 cyfr.');

    await phoneInput.fill('123456789');
    await phoneInput.blur();
    await expect(phoneError).toContainText('Numer powinien zaczynać się od 5, 6, 7 lub 8.');
  });

  test('formats phone input and limits to 9 digits', async ({ page }) => {
    const phoneInput = page.getByTestId('input-customer-phone');

    await phoneInput.fill('5a1 2-3x4_56789');
    await expect(phoneInput).toHaveValue('512 345 678');
  });

  test('validates notes restrictions and counter', async ({ page }) => {
    const notesInput = page.getByTestId('input-customer-notes');
    const notesError = page.getByTestId('msg-notes-error');
    const notesCounter = page.getByTestId('msg-notes-counter');

    await notesInput.fill('abcde');
    await expect(notesCounter).toHaveText('5 / 300');

    await notesInput.fill('<test>');
    await notesInput.blur();
    await expect(notesError).toContainText('Uwagi nie mogą zawierać znaków < ani >.');
  });

  test('legal pages are reachable', async ({ page }) => {
    await page.goto('/terms.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Regulamin');

    await page.goto('/privacy.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Polityka prywatności');
  });
});

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

  test('keeps cart items after page reload', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    await expect(page.getByTestId('checkout-summary-list')).toContainText('Plakaty szkolne PDF');

    await page.reload();
    await expect(page.getByTestId('checkout-summary-list')).toContainText('Plakaty szkolne PDF');
  });

  test('validates phone field', async ({ page }) => {
    const phoneInput = page.getByTestId('input-customer-phone');
    const phoneError = page.locator('#phoneError');

    await phoneInput.fill('123');
    await phoneInput.blur();
    await expect(phoneError).toContainText('Numer telefonu musi mieć min. 9 cyfr.');

    await phoneInput.fill('123456789');
    await phoneInput.blur();
    await expect(phoneError).toHaveText('');
  });

  test('formats phone input and limits to 9 digits', async ({ page }) => {
    const phoneInput = page.getByTestId('input-customer-phone');

    await phoneInput.fill('5a1 2-3x4_56789');
    await expect(phoneInput).toHaveValue('512 345 678');
  });

  test('validates notes restrictions and counter', async ({ page }) => {
    const notesInput = page.getByTestId('input-customer-notes');
    const notesError = page.locator('#notesError');
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

  test('can add both products to cart', async ({ page }) => {
    const btns = page.getByTestId('btn-add-to-cart');
    await btns.nth(0).click();
    await btns.nth(1).click();

    const summary = page.getByTestId('checkout-summary-list');
    await expect(summary).toContainText('Plakaty szkolne PDF');
    await expect(summary).toContainText('Szablony gazetki PDF');
  });

  test('can remove product from cart', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    const summary = page.getByTestId('checkout-summary-list');
    await expect(summary).toContainText('Plakaty szkolne PDF');

    await page.getByTestId('btn-remove-from-cart').first().click();
    await expect(summary).not.toContainText('Plakaty szkolne PDF');
  });

  test('can clear cart', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    const summary = page.getByTestId('checkout-summary-list');
    await expect(summary).toContainText('Plakaty szkolne PDF');

    await page.getByTestId('btn-clear-cart').click();
    await page.getByRole('button', { name: 'Tak, wyczyść' }).click();
    await expect(summary).not.toContainText('Plakaty szkolne PDF');
  });

  test('validates name field - required', async ({ page }) => {
    const nameInput = page.getByTestId('input-customer-name');
    const nameError = page.locator('#nameError');

    // Empty name should trigger error
    await nameInput.focus();
    await nameInput.blur();
    await expect(nameError).not.toHaveText('');

    // Valid name should clear error
    await nameInput.fill('Jan Kowalski');
    await nameInput.blur();
    await expect(nameError).toHaveText('');
  });

  test('validates email field', async ({ page }) => {
    const emailInput = page.getByTestId('input-customer-email');
    const emailError = page.locator('#emailError');

    await emailInput.fill('niepoprawny');
    await emailInput.blur();
    await expect(emailError).not.toHaveText('');

    await emailInput.fill('test@example.com');
    await emailInput.blur();
    await expect(emailError).toHaveText('');
  });

  test('submit with empty fields shows validation errors', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    await page.getByTestId('btn-submit-order').click();

    // Name error should appear
    const nameError = page.locator('#nameError');
    await expect(nameError).not.toHaveText('');
  });

  test('empty cart shows browse offer button', async ({ page }) => {
    // Cart is empty on fresh page — browse button should be visible
    const browseBtn = page.getByTestId('btn-browse-offer');
    await expect(browseBtn).toBeVisible();
    await expect(browseBtn).toContainText('Przeglądaj ofertę');
  });

  test('cart quantity buttons change product count', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    const summary = page.getByTestId('checkout-summary-list');

    // Default qty is 1
    await expect(summary.locator('.checkout-summary-product-qty').first()).toHaveText('1');

    // Click increase (+)
    await summary.locator('.cart-btn-increase').first().click();
    await expect(summary.locator('.checkout-summary-product-qty').first()).toHaveText('2');

    // Click decrease (-)
    await summary.locator('.cart-btn-decrease').first().click();
    await expect(summary.locator('.checkout-summary-product-qty').first()).toHaveText('1');
  });

  test('cart total updates when adding products', async ({ page }) => {
    await page.getByTestId('btn-add-to-cart').first().click();
    const summary = page.getByTestId('checkout-summary-list');

    // First product costs 45 zł — total should reflect it
    await expect(summary).toContainText('45 zł');

    // Add second product (52 zł)
    await page.getByTestId('btn-add-to-cart').nth(1).click();
    await expect(summary).toContainText('97 zł');
  });

  test('hero image is visible and loaded', async ({ page }) => {
    const heroImg = page.locator('.hero-image');
    await expect(heroImg).toBeVisible();

    const naturalWidth = await heroImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('cookie banner appears and can be rejected', async ({ page }) => {
    // Open a fresh page without clearing cookies first
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('cookieConsent_v1'));
    await page.reload();

    const banner = page.locator('.cookie-consent');
    await expect(banner).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Odrzuć opcjonalne' }).click();
    await expect(banner).not.toBeVisible();
  });

  test('cookie banner can be accepted', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('cookieConsent_v1'));
    await page.reload();

    const banner = page.locator('.cookie-consent');
    await expect(banner).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Akceptuj wszystkie' }).click();
    await expect(banner).not.toBeVisible();
  });
});

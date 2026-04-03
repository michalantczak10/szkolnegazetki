import { expect, test } from '@playwright/test';

test.describe('Galaretkarnia checkout live', () => {
  async function getRealLockerCode(page: import('@playwright/test').Page): Promise<string> {
    const parcelResponse = await page.request.get('/parcelLockers.json');
    expect(parcelResponse.ok()).toBeTruthy();
    const parcelLockers = (await parcelResponse.json()) as Array<{ n?: string }>;
    const lockerCode = parcelLockers.find((locker) => typeof locker.n === 'string' && locker.n.trim().length >= 6)?.n;
    expect(lockerCode).toBeTruthy();
    return String(lockerCode);
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const rejectCookiesBtn = page.getByRole('button', { name: 'Odrzuć opcjonalne' });
    if (await rejectCookiesBtn.isVisible()) {
      await rejectCookiesBtn.click();
    }
  });

  test('submits real order end-to-end without mocks', async ({ page }) => {
    const lockerCode = await getRealLockerCode(page);

    await page.getByTestId('btn-add-to-cart').first().click();
    await page.getByTestId('input-customer-phone').fill('512345678');
    await page.getByTestId('input-parcel-locker-code').fill(String(lockerCode));
    await page.getByTestId('input-customer-notes').fill(`E2E real order ${Date.now()}`);

    await page.getByTestId('btn-submit-order').click();

    await expect(page.locator('#order-confirm-modal')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.order-confirm-modal-thankyou')).toContainText('Zamówienie przyjęte!');
    await expect(page.locator('#order-confirm-modal')).toContainText('Numer zamówienia:');
    await expect(page.locator('#order-confirm-modal')).toContainText('Do zapłaty:');
  });

  test('resets form and cart after closing order confirmation modal', async ({ page }) => {
    const lockerCode = await getRealLockerCode(page);

    await page.getByTestId('btn-add-to-cart').first().click();
    await page.getByTestId('input-customer-phone').fill('512345678');
    await page.getByTestId('input-parcel-locker-code').fill(lockerCode);
    await page.getByTestId('input-customer-notes').fill(`E2E reset check ${Date.now()}`);
    await page.getByTestId('btn-submit-order').click();

    const modal = page.locator('#order-confirm-modal');
    await expect(modal).toBeVisible({ timeout: 15000 });
    await modal.getByRole('button', { name: 'OK' }).click();
    await expect(modal).toHaveCount(0);

    await expect(page.getByTestId('input-customer-phone')).toHaveValue('');
    await expect(page.getByTestId('input-parcel-locker-code')).toHaveValue('');
    await expect(page.getByTestId('input-customer-notes')).toHaveValue('');
    await expect(page.getByTestId('checkout-summary-list')).toContainText('Zamówienie nie zawiera wybranego produktu.');
  });
});

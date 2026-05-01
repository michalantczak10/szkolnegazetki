import { chromium } from 'playwright';

const baseUrl = process.env.PROD_BASE_URL || 'https://szkolnegazetki.pl';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const results = [];

  const step = async (name, fn) => {
    try {
      await fn();
      results.push({ name, status: 'PASS' });
    } catch (error) {
      results.push({ name, status: 'FAIL', message: error?.message || String(error) });
      throw error;
    }
  };

  try {
    await step('Home page loads', async () => {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      const rejectCookiesBtn = page.getByRole('button', { name: 'Odrzuć opcjonalne' });
      if (await rejectCookiesBtn.isVisible().catch(() => false)) {
        await rejectCookiesBtn.click();
      }
      await page.getByRole('heading', { level: 1, name: /Gotowe grafiki PDF/i }).waitFor();
      await page.getByTestId('section-products').waitFor();
      await page.getByTestId('order-form').waitFor();
    });

    await step('Add to cart works', async () => {
      await page.getByTestId('btn-add-to-cart').first().click();
      const summary = page.getByTestId('checkout-summary-list');
      await summary.waitFor();
      const text = await summary.textContent();
      if (!text || !text.includes('Plakaty szkolne PDF')) {
        throw new Error('Cart summary missing product text');
      }
    });

    await step('Cart persists after reload', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      const text = await page.getByTestId('checkout-summary-list').textContent();
      if (!text || !text.includes('Plakaty szkolne PDF')) {
        throw new Error('Cart did not persist after reload');
      }
    });

    await step('Payment method toggle works', async () => {
      const paymentSelect = page.getByTestId('select-payment-method');
      const instructions = page.getByTestId('msg-payment-instructions');
      await paymentSelect.selectOption('blik');
      const blikText = await instructions.textContent();
      if (!blikText || !blikText.includes('Numer telefonu:')) {
        throw new Error('BLIK instructions missing');
      }
      await paymentSelect.selectOption('bank_transfer');
      const bankText = await instructions.textContent();
      if (!bankText || !bankText.includes('Numer konta:')) {
        throw new Error('Bank transfer instructions missing');
      }
    });

    await step('Field validation works', async () => {
      const phoneInput = page.getByTestId('input-customer-phone');
      const phoneError = page.getByTestId('msg-phone-error');

      await phoneInput.fill('123');
      await phoneInput.blur();
      const phoneText = await phoneError.textContent();
      if (!phoneText || !phoneText.includes('9 cyfr')) {
        throw new Error('Phone length validation missing');
      }
    });

    await step('Legal pages load', async () => {
      await page.goto(`${baseUrl}/terms.html`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { level: 1, name: /Regulamin/i }).waitFor();
      await page.goto(`${baseUrl}/privacy.html`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { level: 1, name: /Polityka prywatności/i }).waitFor();
    });
  } finally {
    console.log('\nProduction smoke results:');
    for (const result of results) {
      const suffix = result.message ? ` -> ${result.message}` : '';
      console.log(`- ${result.status}: ${result.name}${suffix}`);
    }
    await browser.close();
  }
}

run().catch(() => {
  process.exit(1);
});

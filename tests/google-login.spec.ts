import { expect, Page } from '@playwright/test';
import { test } from './playwright-fixtures';

const GOOGLE_ACCOUNT_EMAIL = process.env.TEST_USER_EMAIL || 'linh.ptm@haposoft.com';
const GOOGLE_ACCOUNT_PASSWORD = process.env.TEST_USER_PASSWORD || '';

test('login with Google redirects to attendance page', async ({ page, context, loginPage }) => {
  // --- Arrange ---
  // Increase test timeout to 5 minutes to allow for manual 2FA confirmation
  test.setTimeout(300000);
  await loginPage.goto();

  // --- Act ---
  // 1. Click Login with Google and handle popup/redirect
  const popupPromise = context.waitForEvent('page').catch(() => null);
  await loginPage.loginWithGoogle();

  let googlePopup: Page | null = null;
  try {
    const result = await Promise.race([
      popupPromise,
      page.waitForURL(/accounts\.google/, { timeout: 10000 }).then(() => 'REDIRECT')
    ]);
    if (result !== 'REDIRECT') {
      googlePopup = result as Page | null;
    }
  } catch {
    // Ignore wait timeout
  }

  const targetPage = googlePopup || page;

  // 2. Identify and handle Google Login interaction
  const emailInput = targetPage.locator('input[type="email"]');
  const accountOption = targetPage.getByText(GOOGLE_ACCOUNT_EMAIL);

  try {
    // Wait up to 15s for the initial login screen
    await emailInput.or(accountOption.first()).waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    console.log('Timeout waiting for Google login elements');
  }

  if (await emailInput.isVisible()) {
    // Fill credentials flow
    await emailInput.fill(GOOGLE_ACCOUNT_EMAIL);
    await targetPage.locator('#identifierNext button').click();

    const passwordInput = targetPage.locator('input[name="Passwd"]');
    try {
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      if (GOOGLE_ACCOUNT_PASSWORD) {
        await passwordInput.fill(GOOGLE_ACCOUNT_PASSWORD);
        await targetPage.locator('#passwordNext button').click();

        // Background check for 2FA prompt
        targetPage.locator('text=/2-Step Verification|Xác minh 2 bước/i').first()
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => console.log('📱 Vui lòng kiểm tra điện thoại để xác thực 2 bước (2FA)...'))
          .catch(() => { });
      } else {
        console.warn('⚠️ Google requires a password but GOOGLE_ACCOUNT_PASSWORD is not provided!');
      }
    } catch (e: unknown) {
      console.log('Password input did not appear or was skipped');
    }
  } else if (await accountOption.isVisible()) {
    // Use existing account flow
    await accountOption.first().click();
  }

  // --- Assert ---
  // Final verification with extended timeout for manual 2FA
  await expect(page).toHaveURL(/\/attendance(?:\/)?(?:\?.*)?$/, { timeout: 240000 });
});

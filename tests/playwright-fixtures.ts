import { test as base } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { ApiClient } from '../src/api/ApiClient';
import { translations, Locale, TranslationKeys } from '../src/utils/i18n/translations';

type TestFixtures = {
  loginPage: LoginPage;
  apiClient: ApiClient;
  t: TranslationKeys;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  t: async ({ }, use) => {
    const locale = (process.env.LOCALE || process.env.NEXT_LOCALE || 'en') as Locale;
    await use(translations[locale] as TranslationKeys || translations.en);
  },
});

export { expect } from '@playwright/test';

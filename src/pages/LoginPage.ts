import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput = 'input[name="email"]';
  readonly passwordInput = 'input[name="password"]';
  readonly submitButton = 'button[type="submit"]';
  readonly googleSignInButtonText = 'Sign in with Google';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/login');
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
    await this.page.locator(this.submitButton).click();
  }

  async loginWithGoogle() {
    await this.page.getByText(this.googleSignInButtonText, { exact: true }).click();
  }
}

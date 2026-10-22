export class LoginPage {
  constructor(page) {
    this.page = page;
    this.signInButton = page.getByTestId('login-open');
    this.dialog = page.locator('#login-dialog');
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = this.dialog.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.locator('#login-error');
    this.sessionLabel = page.locator('#session-label');
    this.toast = page.locator('#toast');
  }

  async goto() {
    await this.page.goto('/');
  }

  async openLogin() {
    await this.signInButton.click();
  }

  async login(email, password) {
    await this.openLogin();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  // The app keeps the demo session in localStorage under 'flowlab-session'
  async getStoredSession() {
    return this.page.evaluate(() => JSON.parse(localStorage.getItem('flowlab-session') || 'null'));
  }
}

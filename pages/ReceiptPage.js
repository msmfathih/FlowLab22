// pages/ReceiptPage.js — the receipt preview that opens in a new tab
const { expect } = require('@playwright/test');

class ReceiptPage {
  /** @param {import('@playwright/test').Page} page  the NEW tab */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Receipt preview', level: 1 });
    this.receiptReference = page.getByText(/Receipt reference:/);
    this.printButton = page.getByRole('button', { name: 'Print receipt' });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/receipt\.html/);
    await expect(this.page).toHaveTitle('FlowLab receipt preview');
    await expect(this.heading).toBeVisible();
  }

  async expectReference(reference) {
    await expect(this.receiptReference).toHaveText(`Receipt reference: ${reference}`);
  }

  async close() {
    await this.page.close();
  }
}

module.exports = { ReceiptPage };
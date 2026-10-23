// pages/FramesPage.js
const { expect } = require('@playwright/test');
const { ReceiptPage } = require('./ReceiptPage');
 
class FramesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Frames & windows', level: 1 });
 
    // Frame 1: shipping address (inside the main page)
    this.shippingFrame = page.locator('[data-testid="shipping-frame"]').contentFrame();
    this.cityInput = this.shippingFrame.getByTestId('frame-city');
    this.postalInput = this.shippingFrame.getByTestId('frame-postal');
    this.saveAddressButton = this.shippingFrame.getByRole('button', { name: 'Save address' });
 
    // Frame 2: delivery preferences (nested inside frame 1)
    this.deliveryFrame = this.shippingFrame
      .locator('iframe[title="Delivery preferences"]')
      .contentFrame();
    this.deliveryWindowSelect = this.deliveryFrame.getByTestId('delivery-window');
    this.confirmDeliveryButton = this.deliveryFrame.getByRole('button', { name: 'Confirm delivery' });
 
    // Native dialogs section
    this.alertButton = page.getByRole('button', { name: 'Show alert' });
    this.confirmButton = page.getByRole('button', { name: 'Show confirm' });
    this.promptButton = page.getByRole('button', { name: 'Show prompt' });
    this.dialogStatus = page
      .getByRole('heading', { name: 'Native dialogs' })
      .locator('..')
      .getByRole('status');
 
    // New tab
    this.receiptLink = page.getByTestId('receipt-link');
  }
 
  async goto() {
    await this.page.goto('/#frames');
    await expect(this.heading).toBeVisible();
  }
 
  // ---------- Frames ----------
 
  async saveAddress(city, postalCode) {
    await this.cityInput.fill(city);
    await this.postalInput.fill(postalCode);
    await this.saveAddressButton.click();
  }
 
  async expectAddressSaved(city, postalCode) {
    // Message inside frame 1
    await expect(this.shippingFrame.getByText(`Address saved: ${city} / ${postalCode}`)).toBeVisible();
    // Message the frame sends back to the main page
    await expect(this.page.getByText(`Address received from frame: ${city}`)).toBeVisible();
  }
 
  async confirmDelivery(window) {
    await this.deliveryWindowSelect.selectOption(window);
    await this.confirmDeliveryButton.click();
  }
 
  async expectDeliveryConfirmed(window) {
    await expect(this.deliveryFrame.getByText(`Confirmed: ${window}`)).toBeVisible();
  }
 
  // ---------- Native dialogs ----------
  // The listener must be registered BEFORE the click, otherwise the dialog
  // blocks the page. Each method returns the dialog's message for asserting.
 
  async acceptAlert() {
    let message = '';
    this.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      message = dialog.message();
      await dialog.accept();
    });
    await this.alertButton.click();
    await expect(this.dialogStatus).toHaveText('Alert dismissed');
    return message;
  }
 
  async acceptConfirm() {
    let message = '';
    this.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      message = dialog.message();
      await dialog.accept();
    });
    await this.confirmButton.click();
    await expect(this.dialogStatus).toHaveText('Request approved');
    return message;
  }
 
  async answerPrompt(text) {
    let message = '';
    this.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      message = dialog.message();
      await dialog.accept(text);
    });
    await this.promptButton.click();
    await expect(this.dialogStatus).toHaveText(`Reference: ${text}`);
    return message;
  }
 
  // ---------- New tab ----------
 
  /** Clicks the receipt link and returns the new tab wrapped in a ReceiptPage. */
  async openReceipt() {
    const newPagePromise = this.page.context().waitForEvent('page');
    await this.receiptLink.click();
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();
    return new ReceiptPage(newPage);
  }
}
 
module.exports = { FramesPage };
 
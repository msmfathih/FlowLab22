// tests/frames-windows.spec.js
// @ts-check
const { test, expect } = require('@playwright/test');
const { FramesPage } = require('../pages/FramesPage');

test.describe('Frames & windows', () => {
  /** @type {FramesPage} */
  let framesPage;

  test.beforeEach(async ({ page }) => {
    framesPage = new FramesPage(page);
    await framesPage.goto();
  });

  test('saves an address in a frame and confirms delivery in a nested frame', async () => {
    await framesPage.saveAddress('Abu Dhabi', '12345');
    await framesPage.expectAddressSaved('Abu Dhabi', '12345');

    await framesPage.confirmDelivery('Evening');
    await framesPage.expectDeliveryConfirmed('Evening');
  });

  test('handles alert, confirm and prompt dialogs', async () => {
    expect(await framesPage.acceptAlert()).toBe('FlowLab alert: validation ready');
    expect(await framesPage.acceptConfirm()).toBe('Approve the demo request?');
    expect(await framesPage.answerPrompt('AGENT-007')).toBe('Enter an agent reference');
  });

  test('opens the receipt preview in a new tab', async ({ page }) => {
    const receiptPage = await framesPage.openReceipt();
    await receiptPage.expectLoaded();
    await receiptPage.expectReference('DEMO-RECEIPT-001');

    await receiptPage.close();
    await expect(page).toHaveURL(/#frames/); // original tab is still there
  });
});
// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OverviewPage } from '../pages/OverviewPage';
import { OrderPage } from '../pages/OrderPage';
import { users, messages, orders, uniqueCustomerName } from '../test-data/testData';

test('signed-in user can create a discounted Laptop Dock order', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const overviewPage = new OverviewPage(page);
  const orderPage = new OrderPage(page);
  const user = users.demo;
  const order = { ...orders.laptopDockWithDiscount, customerName: uniqueCustomerName() };
  console.log(`Customer name: ${order.customerName}`);

  // 1. Open the app as a guest
  await loginPage.goto();
  await expect(overviewPage.heading).toBeVisible();
  await expect(loginPage.sessionLabel).toHaveText(messages.guestSession);
  await expect(loginPage.signInButton).toHaveText('Sign in');
  expect(await loginPage.getStoredSession()).toBeNull();

  // 2. Sign in with the demo account
  await loginPage.openLogin();
  await expect(loginPage.dialog).toBeVisible();
  await loginPage.emailInput.fill(user.email);
  await loginPage.passwordInput.fill(user.password);
  await loginPage.submitButton.click();

  await expect(loginPage.dialog).toBeHidden();
  await expect(loginPage.errorMessage).toBeEmpty();
  await expect(loginPage.toast).toHaveText(messages.loginSuccessToast);
  await expect(loginPage.sessionLabel).toHaveText(`Signed in as ${user.email}`);
  await expect(loginPage.signInButton).toHaveText('Sign out');
  expect(await loginPage.getStoredSession()).toEqual({ email: user.email });

  // 3. Go to Orders & checkout
  await overviewPage.goToOrders();
  await expect(page).toHaveURL(/#orders/);
  await expect(orderPage.heading).toBeVisible();
  await expect(orderPage.placeOrderButton).toBeDisabled(); // nothing selected yet

  // 4. Search for the product and pick it from the suggestions
  await orderPage.selectProduct(order.searchText, order.productOption);
  await expect(orderPage.productSearch).toHaveValue(order.productName);
  await expect(orderPage.selectedProduct).toHaveText(order.productName);
  await expect(orderPage.unitPrice).toHaveText(order.unitPrice);

  // 5. Quantity, discount code, customer name
  await orderPage.fillOrderDetails(order);
  await expect(orderPage.quantityInput).toHaveValue(String(order.quantity));
  await expect(orderPage.couponInput).toHaveValue(order.coupon);
  await expect(orderPage.customerNameInput).toHaveValue(order.customerName);

  await orderPage.applyDiscount();
  await expect(orderPage.couponStatus).toHaveText(order.discountMessage);
  await expect(orderPage.subtotal).toHaveText(order.expectedSubtotal);
  await expect(orderPage.discount).toHaveText(order.expectedDiscount);
  await expect(orderPage.tax).toHaveText(order.expectedTax);
  await expect(orderPage.total).toHaveText(order.expectedTotal);
  await expect(orderPage.placeOrderButton).toBeEnabled();

  // 6. Place the order and capture the generated order ID
  const orderId = await orderPage.placeOrder();
  console.log(`Created order: ${orderId}`);
  expect(orderId).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]{4}$/);
  await expect(orderPage.successMessage).toHaveText(`Order created: ${orderId}`);
  await expect(orderPage.toast).toHaveText(messages.orderSuccessToast);

  // 7. Verify the new order's row in the register
  const orderRow = orderPage.orderRow(orderId);
  await expect(orderRow).toHaveCount(1);
  await expect(orderRow).toContainText(order.customerName);
  await expect(orderRow).toContainText(order.productName);
  await expect(orderRow).toContainText(order.expectedTotal);
  await expect(orderPage.orderStatusCell(orderId, order.expectedStatus)).toBeVisible();

  // ...and that it was saved for this browser session
  expect(await orderPage.getStoredOrder(orderId)).toEqual({
    id: orderId,
    customer: order.customerName,
    product: order.productName,
    amount: order.expectedTotalAmount,
    status: order.expectedStatus,
  });

  // 8. Back to the Overview page, still signed in
  await overviewPage.open();
  await expect(page).toHaveURL(/#overview/);
  await expect(overviewPage.heading).toBeVisible();
  await expect(loginPage.sessionLabel).toHaveText(`Signed in as ${user.email}`);
});

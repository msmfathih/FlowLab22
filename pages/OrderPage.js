export class OrderPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Orders & checkout', level: 1 });
    this.productSearch = page.getByTestId('product-search');
    this.selectedProduct = page.getByTestId('selected-product');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantityInput = page.getByTestId('quantity');
    this.couponInput = page.getByTestId('coupon');
    this.customerNameInput = page.getByTestId('customer-name');
    this.applyDiscountButton = page.getByRole('button', { name: 'Apply discount' });
    this.couponStatus = page.locator('#coupon-status');
    this.subtotal = page.getByTestId('order-subtotal');
    this.discount = page.getByTestId('order-discount');
    this.tax = page.getByTestId('order-tax');
    this.total = page.getByTestId('order-total');
    this.placeOrderButton = page.getByTestId('place-order');
    this.successMessage = page.getByText(/Order created: ORD-/);
    this.createdOrderId = page.getByTestId('created-order-id');
    this.toast = page.locator('#toast');
  }

  // Suggestions appear after ~600 ms, so type character by character and wait for the option
  async selectProduct(searchText, optionName) {
    await this.productSearch.pressSequentially(searchText);
    await this.page.getByRole('option', { name: optionName }).click();
  }

  async fillOrderDetails({ quantity, coupon, customerName }) {
    await this.quantityInput.fill(String(quantity));
    await this.couponInput.fill(coupon);
    await this.customerNameInput.fill(customerName);
  }

  async applyDiscount() {
    await this.applyDiscountButton.click();
  }

  // Places the order and returns the generated order ID (it changes every run)
  async placeOrder() {
    await this.placeOrderButton.click();
    await this.createdOrderId.waitFor();
    return (await this.createdOrderId.textContent()).trim();
  }

  orderRow(orderId) {
    return this.page.getByRole('row').filter({ hasText: orderId });
  }

  orderStatusCell(orderId, status) {
    return this.orderRow(orderId).getByRole('cell', { name: status });
  }

  // The app keeps orders in localStorage under 'flowlab-orders'
  async getStoredOrder(orderId) {
    return this.page.evaluate(
      (id) => JSON.parse(localStorage.getItem('flowlab-orders') || '[]').find((o) => o.id === id),
      orderId,
    );
  }
}

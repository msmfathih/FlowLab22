export const users = {
  demo: {
    email: 'qa@example.com',
    password: 'FlowLab123!',
  },
};

export const messages = {
  guestSession: 'Guest session',
  loginSuccessToast: 'Welcome back. Demo session started.',
  orderSuccessToast: 'Order created successfully',
};

export const interactionLab = {
  loadingText: 'Loading…',
  delayedContentPattern: /^Content ready: REF-[A-Z0-9]+$/,
  actionCompletedText: 'Action completed',
  initialRunId: 'RUN-1000',
  replacedRunIdPattern: /^RUN-\d{13}$/, // RUN- followed by a millisecond timestamp
  detailsText: 'Product details: Precision Laptop',
  historyText: 'History: product added, price verified, checkout ready',
  qualityRequirementsText: 'Validate visibility, state, and content after interaction.',
  priorities: ['Medium', 'High'],
  progressPercentPattern: /^[1-9]0%$/, // 10% ... 90%
  progressCompleteText: 'Processing complete',
  optionalReference: 'test 123',
  tooltipText: 'Capture this tooltip with Playwright.',
  taskName: 'Validate checkout totals',
  taskCompletedText: 'Task completed',
};

// Returns a new customer name on every call, e.g. "QA Customer MVJQ2K8A-X7FD"
export function uniqueCustomerName() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QA Customer ${timestamp}-${random}`;
}

export const orders = {
  laptopDockWithDiscount: {
    searchText: 'lap',
    productOption: /Laptop Dock · AED 420\.00/,
    productName: 'Laptop Dock',
    unitPrice: 'AED 420.00',
    quantity: 2,
    coupon: 'QA10',
    discountMessage: '10% discount applied',
    expectedSubtotal: 'AED 840.00', // 420 x 2
    expectedDiscount: 'AED 84.00', // 10% of subtotal
    expectedTax: 'AED 37.80', // 5% of (840 - 84)
    expectedTotal: 'AED 793.80', // 840 - 84 + 37.80
    expectedTotalAmount: 793.8,
    expectedStatus: 'Confirmed',
  },
};

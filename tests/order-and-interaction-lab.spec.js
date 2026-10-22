// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OverviewPage } from '../pages/OverviewPage';
import { OrderPage } from '../pages/OrderPage';
import { InteractionLabPage } from '../pages/InteractionLabPage';
import { users, orders, interactionLab, uniqueCustomerName } from '../test-data/testData';

test('signed-in user creates an order, then works through the Interaction lab in a second tab', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  const overviewPage = new OverviewPage(page);
  const orderPage = new OrderPage(page);
  const user = users.demo;
  const order = { ...orders.laptopDockWithDiscount, customerName: uniqueCustomerName() };
  const lab = interactionLab;

  await test.step('Sign in with the demo account', async () => {
    await loginPage.goto();
    await expect(overviewPage.heading).toBeVisible();
    await loginPage.login(user.email, user.password);
    await expect(loginPage.dialog).toBeHidden();
    await expect(loginPage.sessionLabel).toHaveText(`Signed in as ${user.email}`);
  });

  await test.step('Create a discounted order', async () => {
    await overviewPage.goToOrders();
    await expect(orderPage.heading).toBeVisible();

    await orderPage.selectProduct(order.searchText, order.productOption);
    await expect(orderPage.selectedProduct).toHaveText(order.productName);

    await orderPage.fillOrderDetails(order);
    await orderPage.applyDiscount();
    await expect(orderPage.couponStatus).toHaveText(order.discountMessage);
    await expect(orderPage.total).toHaveText(order.expectedTotal);

    const orderId = await orderPage.placeOrder();
    console.log(`Created order: ${orderId} for ${order.customerName}`);
    const orderRow = orderPage.orderRow(orderId);
    await expect(orderRow).toContainText(order.customerName);
    await expect(orderPage.orderStatusCell(orderId, order.expectedStatus)).toBeVisible();
  });

  // Second tab in the same browser context, so the signed-in session carries over
  const labTab = await context.newPage();
  const labLoginPage = new LoginPage(labTab);
  const labPage = new InteractionLabPage(labTab);

  await test.step('Open the Interaction lab in a second tab', async () => {
    await labPage.goto();
    await expect(labPage.heading).toBeVisible();
    await expect(labLoginPage.sessionLabel).toHaveText(`Signed in as ${user.email}`);
    expect(context.pages()).toHaveLength(2);
  });

  await test.step('Delayed content generates new text on every load', async () => {
    await expect(labPage.delayedResult).toHaveText('Not loaded');

    await labPage.loadContentButton.click();
    await expect(labPage.delayedResult).toHaveText(lab.loadingText);
    await expect(labPage.delayedResult).toHaveText(lab.delayedContentPattern);
    const firstContent = (await labPage.delayedResult.textContent()).trim();

    const secondContent = await labPage.loadDelayedContent();
    expect(secondContent).toMatch(lab.delayedContentPattern);
    expect(secondContent).not.toBe(firstContent);
    console.log(`Delayed content: ${firstContent} -> ${secondContent}`);
  });

  await test.step('Enable action after 2 seconds, then complete it', async () => {
    await expect(labPage.completeActionButton).toBeDisabled();
    await labPage.enableActionButton.click();
    await expect(labPage.completeActionButton).toBeDisabled();
    await expect(labPage.completeActionButton).toBeEnabled({ timeout: 5000 });

    await labPage.completeActionButton.click();
    await expect(labPage.actionResult).toHaveText(lab.actionCompletedText);
  });

  await test.step('Replace element generates a new run number', async () => {
    await expect(labPage.dynamicValue).toHaveText(lab.initialRunId);

    await labPage.replaceElement();
    await expect(labPage.dynamicValue).toHaveText(lab.replacedRunIdPattern);
    const firstRunId = (await labPage.dynamicValue.textContent()).trim();
    expect(firstRunId).not.toBe(lab.initialRunId);

    await labPage.replaceElement();
    await expect(labPage.dynamicValue).not.toHaveText(firstRunId);
    await expect(labPage.dynamicValue).toHaveText(lab.replacedRunIdPattern);
    console.log(`Run number: ${lab.initialRunId} -> ${firstRunId} -> ${(await labPage.dynamicValue.textContent()).trim()}`);
  });

  await test.step('Tabs & accordion: details, quality requirements, priority, history', async () => {
    await labPage.detailsTab.click();
    await expect(labPage.detailsTab).toHaveAttribute('aria-selected', 'true');
    await expect(labPage.tabPanel).toHaveText(lab.detailsText);

    await expect(labPage.qualityAccordionContent).toBeHidden();
    await labPage.expandQualityRequirements();
    await expect(labPage.qualityAccordion).toHaveAttribute('open', '');
    await expect(labPage.qualityAccordionContent).toBeVisible();
    await expect(labPage.qualityAccordionContent).toHaveText(lab.qualityRequirementsText);

    await labPage.selectPriorities(lab.priorities);
    await expect(labPage.prioritySelect).toHaveValues(lab.priorities);

    await labPage.historyTab.click();
    await expect(labPage.historyTab).toHaveAttribute('aria-selected', 'true');
    await expect(labPage.detailsTab).toHaveAttribute('aria-selected', 'false');
    await expect(labPage.tabPanel).toHaveText(lab.historyText);
  });

  await test.step('Progress & visibility: processing, optional reference, tooltip', async () => {
    await expect(labPage.progressLabel).toHaveText('0%');
    await labPage.startProcessing();
    await expect(labPage.startProcessingButton).toBeDisabled();
    await expect(labPage.progressLabel).toHaveText(lab.progressPercentPattern);
    await expect(labPage.progressLabel).toHaveText(lab.progressCompleteText);
    await expect(labPage.progressBar).toHaveJSProperty('value', 100);
    await expect(labPage.startProcessingButton).toBeEnabled();

    // App bug: the CSS rule `label { display: block }` overrides the `hidden` attribute, so the
    // field is always on screen. Assert the attribute the checkbox toggles instead of visibility.
    await expect(labPage.optionalReferenceLabel).toHaveAttribute('hidden', '');
    await labPage.showOptionalReference(lab.optionalReference);
    await expect(labPage.showOptionalReferenceCheckbox).toBeChecked();
    await expect(labPage.optionalReferenceLabel).not.toHaveAttribute('hidden');
    await expect(labPage.optionalReferenceInput).toBeVisible();
    await expect(labPage.optionalReferenceInput).toHaveValue(lab.optionalReference);

    await expect(labPage.tooltip).toBeHidden();
    await labPage.helpButton.hover();
    await expect(labPage.tooltip).toBeVisible();
    await expect(labPage.tooltip).toHaveText(lab.tooltipText);
    const tooltipText = (await labPage.tooltip.textContent()).trim();
    console.log(`Tooltip: ${tooltipText}`);
  });

  await test.step('Drag & drop the task into Completed', async () => {
    await expect(labPage.task).toHaveText(lab.taskName);
    await expect(labPage.dropTarget.getByTestId('draggable-task')).toHaveCount(0);

    await labPage.dragTaskToCompleted();
    await expect(labPage.dropTarget.getByTestId('draggable-task')).toHaveText(lab.taskName);
    await expect(labPage.dragResult).toHaveText(lab.taskCompletedText);

    // The click alternative keeps the task in Completed
    await labPage.moveTaskButton.click();
    await expect(labPage.dropTarget.getByTestId('draggable-task')).toHaveCount(1);
    await expect(labPage.dragResult).toHaveText(lab.taskCompletedText);
  });
});

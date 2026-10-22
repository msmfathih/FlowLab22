export class InteractionLabPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Interaction lab', level: 1 });

    // Delayed & changing elements
    this.loadContentButton = page.getByRole('button', { name: 'Load delayed content' });
    this.delayedResult = page.locator('#delayed-result');
    this.enableActionButton = page.getByRole('button', { name: 'Enable action after 2 seconds' });
    this.completeActionButton = page.getByRole('button', { name: 'Complete action' });
    this.actionResult = page.locator('#action-result');
    this.replaceElementButton = page.getByRole('button', { name: 'Replace element' });
    this.dynamicValue = page.getByTestId('dynamic-value');

    // Tabs & accordion
    this.detailsTab = page.getByRole('tab', { name: 'Details' });
    this.historyTab = page.getByRole('tab', { name: 'History' });
    this.tabPanel = page.getByRole('tabpanel');
    this.qualityAccordion = page.locator('details').filter({ hasText: 'Expand quality requirements' });
    this.qualityAccordionSummary = page.getByText('Expand quality requirements');
    this.qualityAccordionContent = this.qualityAccordion.locator('p');
    this.prioritySelect = page.getByLabel('Priority');

    // Progress & visibility
    this.startProcessingButton = page.getByRole('button', { name: 'Start processing' });
    this.progressBar = page.locator('#progress');
    this.progressLabel = page.locator('#progress-label');
    this.showOptionalReferenceCheckbox = page.getByLabel('Show optional reference');
    this.optionalReferenceLabel = page.locator('#optional-label');
    this.optionalReferenceInput = page.getByLabel('Optional reference', { exact: true });
    this.helpButton = page.getByRole('button', { name: 'Hover or focus for help' });
    this.tooltip = page.getByRole('tooltip');

    // Drag & drop
    this.task = page.getByTestId('draggable-task');
    this.dropTarget = page.getByTestId('drop-target');
    this.moveTaskButton = page.getByRole('button', { name: 'Move task to Completed' });
    this.dragResult = page.locator('#drag-result');
  }

  async goto() {
    await this.page.goto('/#interactions');
  }

  // Content appears ~1.6 s after the click; returns the generated text
  async loadDelayedContent() {
    await this.loadContentButton.click();
    await this.delayedResult.filter({ hasText: /^Content ready: REF-/ }).waitFor();
    return (await this.delayedResult.textContent()).trim();
  }

  async replaceElement() {
    await this.replaceElementButton.click();
  }

  async expandQualityRequirements() {
    await this.qualityAccordionSummary.click();
  }

  async selectPriorities(priorities) {
    await this.prioritySelect.selectOption(priorities);
  }

  async startProcessing() {
    await this.startProcessingButton.click();
  }

  async showOptionalReference(reference) {
    await this.showOptionalReferenceCheckbox.check();
    await this.optionalReferenceInput.fill(reference);
  }

  async dragTaskToCompleted() {
    await this.task.dragTo(this.dropTarget);
  }
}

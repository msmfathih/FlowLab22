export class OverviewPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Build confidence. Break assumptions.' });
    this.navLink = page.getByRole('link', { name: 'Overview', exact: true });
    this.exploreOrdersLink = page.getByRole('link', { name: 'Explore orders →' });
  }

  async open() {
    await this.navLink.click();
  }

  async goToOrders() {
    await this.exploreOrdersLink.click();
  }
}

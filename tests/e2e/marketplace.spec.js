describe('AI Marketplace E2E Flow', () => {
  it('should allow a user to subscribe to the starter plan', () => {
    cy.visit('/');
    cy.get('[data-cy=subscribe-starter]').click();
    cy.url().should('include', '/checkout');
    cy.get('[data-cy=stripe-element]').should('be.visible');
  });

  it('should display generated AI services', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy=service-list]').should('have.length.at.least', 1);
  });
});
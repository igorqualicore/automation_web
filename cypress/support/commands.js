Cypress.Commands.add('getById', (id, options = {}) => {
  return cy.get(`#${id}`, options);
});
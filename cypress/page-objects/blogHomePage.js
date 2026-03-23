class BlogHomePage {
  selectors = {
    searchToggleButton: '.ast-search-icon',
    searchField: 'search-field',
    searchForm: 'form.search-form',
    searchSubmitButton: 'button.search-submit',
  };

  open() {
    cy.visit('/');
  }

  openSearch() {
    cy.get(this.selectors.searchToggleButton)
      .should('exist')
      .click({ force: true });
  }

  getSearchField() {
    return cy.getById(this.selectors.searchField)
      .should('exist')
      .then(($inputs) => {
        const visibleInput = [...$inputs].find((input) => Cypress.$(input).is(':visible'));

        return cy.wrap(visibleInput || $inputs[0]);
      });
  }

  fillSearchField(term) {
    this.getSearchField()
      .then(($input) => {
        const inputElement = $input[0];
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set;

        nativeInputValueSetter.call(inputElement, '');
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));

        nativeInputValueSetter.call(inputElement, term);
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      });
  }

  submitSearch() {
    this.getSearchField()
      .then(($input) => {
        const formElement = $input[0].form;

        expect(formElement, 'Formulario da busca').to.exist;

        cy.wrap(formElement)
          .should('have.attr', 'method', 'get')
          .find(this.selectors.searchSubmitButton)
          .click({ force: true });
      });
  }

  searchFor(term) {
    this.openSearch();
    this.fillSearchField(term);
    this.submitSearch();
  }
}

module.exports = new BlogHomePage();
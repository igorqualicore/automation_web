class BlogHomePage {
  selectors = {
    searchToggleButton: '.ast-search-icon',
    searchField: 'search-field',
  };

  open() {
    cy.visit('/');
  }

  openSearch() {
    cy.get(this.selectors.searchToggleButton)
      .should('exist')
      .click({ force: true });
  }

  fillSearchField(term) {
    cy.getById(this.selectors.searchField)
      .should('exist')
      .then(($input) => {
        const inputElement = $input[0];

        inputElement.value = '';
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));

        inputElement.value = term;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      });
  }

  submitSearch() {
    cy.getById(this.selectors.searchField)
      .should('exist')
      .then(($input) => {
        const formElement = $input[0].form;

        expect(formElement, 'Formulario da busca').to.exist;

        if (typeof formElement.requestSubmit === 'function') {
          formElement.requestSubmit();
          return;
        }

        formElement.submit();
      });
  }

  searchFor(term) {
    this.openSearch();
    this.fillSearchField(term);
    this.submitSearch();
  }
}

module.exports = new BlogHomePage();
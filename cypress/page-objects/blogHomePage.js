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
      .clear({ force: true });

    cy.getById(this.selectors.searchField)
      .should('exist')
      .type(term, {
        force: true,
        delay: 0,
        parseSpecialCharSequences: false,
      });
  }

  submitSearch() {
    cy.getById(this.selectors.searchField)
      .should('exist')
      .parents('form')
      .first()
      .should('exist')
      .submit();
  }

  searchFor(term) {
    this.openSearch();
    this.fillSearchField(term);
    this.submitSearch();
  }
}

module.exports = new BlogHomePage();
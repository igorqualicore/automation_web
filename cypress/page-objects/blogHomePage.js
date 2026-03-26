class BlogHomePage {
  selectors = {
    searchField: '#search-field',
    searchForm: 'form.search-form',
  };

  open() {
    cy.visit('/');
  }

  getSearchForm() {
    return cy.get(this.selectors.searchForm)
      .first()
      .should('have.attr', 'method', 'get');
  }

  getSearchField() {
    return this.getSearchForm()
      .find(this.selectors.searchField)
      .first()
      .should('have.attr', 'name', 's');
  }

  fillSearchField(term) {
    return this.getSearchField().then(($field) => {
      $field.val(term);

      return cy.wrap($field).should('have.value', term);
    });
  }

  submitSearch() {
    return this.getSearchForm().submit();
  }

  searchFor(term) {
    this.fillSearchField(term);
    return this.submitSearch();
  }
}

module.exports = new BlogHomePage();
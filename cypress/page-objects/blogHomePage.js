class BlogHomePage {
  open() {
    cy.visit('/');
  }

  buildSearchPath(term) {
    return `/?s=${encodeURIComponent(term)}`;
  }

  searchFor(term) {
    return cy.visit(this.buildSearchPath(term));
  }
}

module.exports = new BlogHomePage();
const { normalizeText } = require('../support/utils/text');

class SearchResultsPage {
  selectors = {
    mainContent: '#main',
    pageTitle: '.page-title.ast-archive-title',
    resultArticles: '#main article',
    resultTitleLinks: '#main .entry-title a',
  };

  messages = {
    emptyStateTitle: /Lamentamos, mas nada foi encontrado para sua pesquisa/i,
    emptyStateDescription: /tente novamente com outras palavras/i,
  };

  assertSearchUrl(term) {
    cy.location().should((location) => {
      const searchParams = new URLSearchParams(location.search);

      expect(searchParams.get('s')).to.equal(term);
    });
  }

  assertHeadingContainsTerm(term) {
    cy.get(this.selectors.pageTitle).should(($heading) => {
      expect(normalizeText($heading.text())).to.include(normalizeText(term));
    });
  }

  assertResultsListIsDisplayed() {
    cy.get(this.selectors.mainContent).should('be.visible');
    cy.get(this.selectors.resultArticles).should('have.length.greaterThan', 0);
  }

  assertAtLeastOneTitleContains(term) {
    cy.get(this.selectors.resultTitleLinks).then(($titles) => {
      const titles = [...$titles].map((titleElement) =>
        normalizeText(titleElement.innerText),
      );

      expect(
        titles.some((title) => title.includes(normalizeText(term))),
        `Ao menos um titulo deve conter o termo ${term}`,
      ).to.equal(true);
    });
  }

  assertHasResultsRelatedTo(term) {
    this.assertSearchUrl(term);
    this.assertHeadingContainsTerm(term);
    cy.contains(this.messages.emptyStateTitle).should('not.exist');
    this.assertResultsListIsDisplayed();
    this.assertAtLeastOneTitleContains(term);
  }

  assertEmptyState(term) {
    this.assertSearchUrl(term);
    this.assertHeadingContainsTerm(term);
    cy.contains(this.messages.emptyStateTitle).should('be.visible');
    cy.contains(this.messages.emptyStateDescription).should('be.visible');
  }
}

module.exports = new SearchResultsPage();
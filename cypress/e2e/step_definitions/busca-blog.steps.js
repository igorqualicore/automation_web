const {
  Given,
  When,
  Then,
} = require('@badeball/cypress-cucumber-preprocessor');

const blogHomePage = require('../../page-objects/blogHomePage');
const searchResultsPage = require('../../page-objects/searchResultsPage');
const searchData = require('../../fixtures/searchTerms.json');

Given('que acesso a pagina inicial do Blog do Agi', () => {
  blogHomePage.open();
});

When('pesquiso por um termo existente', () => {
  blogHomePage.searchFor(searchData.successfulSearch.term);
});

When('pesquiso por um termo inexistente', () => {
  blogHomePage.searchFor(searchData.unsuccessfulSearch.term);
});

Then('devo visualizar artigos relacionados ao termo pesquisado', () => {
  searchResultsPage.assertHasResultsRelatedTo(searchData.successfulSearch.term);
});

Then('devo visualizar a mensagem de nenhum resultado encontrado', () => {
  searchResultsPage.assertEmptyState(searchData.unsuccessfulSearch.term);
});
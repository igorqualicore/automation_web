require('./commands');
require('cypress-mochawesome-reporter/register');

Cypress.on('uncaught:exception', (error) => {
	const ignoredErrors = [
		'astra is not defined',
		'$scope.imagesLoaded is not a function',
		'jetpackCarouselStrings is not defined',
		"Cannot read properties of undefined (reading 'publicPath')",
		'astraNavMenuToggle is not defined',
	];

	if (ignoredErrors.some((message) => error.message.includes(message))) {
		return false;
	}

	return true;
});
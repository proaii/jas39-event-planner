describe('Login Test', () => {
  it('should log in a user successfully', () => {
    // 1. Visit the login page
    cy.visit('http://localhost:3000/auth/login');

    // 2. Check for the "Welcome back" text
    cy.contains('Welcome Back');

    // 3. Find the username field, then type in it
    cy.get('#email').type(Cypress.env('CYPRESS_USERNAME'));

    // 4. Find the password field, then type in it
    cy.get('#password').type(Cypress.env('CYPRESS_PASSWORD'));

    // 5. Find the login button and click it
    cy.get('button[type="submit"]').click();

    // 6. Assert that login was successful
    // This checks that the URL is EXACTLY 'http://localhost:3000/dashboard'
    cy.url().should('eq', 'http://localhost:3000/dashboard');
  });
});
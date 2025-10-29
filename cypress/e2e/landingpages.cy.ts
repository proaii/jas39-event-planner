describe('Landing Page', () => {
  it('should display the get started message', () => {
    cy.visit('http://localhost:3000/')

    // This is the assertion:
    cy.contains('Get Started')
  })
})
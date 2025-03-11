describe('Signup Page', () => {
    beforeEach(() => {
      cy.visit('/signup'); // 회원가입 페이지 방문
      cy.wait(1000); // 🛠️ Next.js hydration 오류 방지 (완전한 렌더링 대기)
    });
  
    it('회원가입 페이지가 정상적으로 렌더링 되어야 한다.', () => {
      cy.get('[data-testid="signup-title"]').should('exist');
    });
  
    it('이메일, 비밀번호, 비밀번호 확인 입력 필드가 있어야 한다.', () => {
      cy.get('[data-testid="email-input"]').should('exist');
      cy.get('[data-testid="password-input"]').should('exist');
      cy.get('[data-testid="password-confirm-input"]').should('exist');
    });
  
    it('회원가입 버튼이 존재하며, 비활성화 되어 있어야 한다.', () => {
      cy.get('[data-testid="signup-button"]').should('exist').and('be.disabled');
    });
  
    it('올바른 이메일과 비밀번호를 입력하면 버튼이 활성화 되어야 한다.', () => {
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('Password@123');
      cy.get('[data-testid="password-confirm-input"]').type('Password@123');
  
      cy.get('[data-testid="signup-button"]').should('not.be.disabled');
    });
  
    it('비밀번호 확인이 일치하지 않으면 버튼이 비활성화 되어야 한다.', () => {
      cy.get('[data-testid="password-input"]').type('Password@123');
      cy.get('[data-testid="password-confirm-input"]').type('WrongPass123');
  
      cy.get('[data-testid="signup-button"]').should('be.disabled');
    });
  });
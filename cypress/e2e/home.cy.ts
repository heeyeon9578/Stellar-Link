describe("홈 페이지 테스트", () => {
    beforeEach(() => {
        cy.visit("/");
        // i18n이 초기화될 때까지 기다린 후 테스트 실행
        cy.get("[data-testid='loading-state']", { timeout: 5000 }).should("not.exist");

        // 주요 섹션이 로드될 때까지 기다린 후 스크롤 실행
        cy.get("[data-testid='section-2']", { timeout: 5000 }).should("exist");
        cy.scrollTo("bottom");
    });
  
    it("홈 화면이 정상적으로 로드되는지 확인", () => {
      cy.get("[data-testid='section-2']").should("be.visible");
      cy.get("[data-testid='section-3']").should("be.visible");
      cy.get("[data-testid='section-5']").should("be.visible");
      cy.get("[data-testid='section-6']").should("be.visible");
      cy.get("[data-testid='section-7']").should("be.visible");
    });

    it("비디오 요소가 정상적으로 표시되는지 확인", () => {
      cy.get("[data-testid='intro-video-0']").should("be.visible");
      cy.get("[data-testid='intro-video-1']").should("be.visible");
      cy.get("[data-testid='intro-video-2']").should("be.visible");
      cy.get("[data-testid='intro-video-3']").should("be.visible");
      cy.get("[data-testid='intro-video-4']").should("be.visible");
    });

    it("스크롤 시 특정 섹션이 표시되는지 확인", () => {
      cy.scrollTo("bottom");
      cy.get("[data-testid='section-2']").should("be.visible");
      cy.get("[data-testid='section-3']").should("be.visible");
      cy.get("[data-testid='section-5']").should("be.visible");
      cy.get("[data-testid='section-6']").should("be.visible");
      cy.get("[data-testid='section-7']").should("be.visible");
    });

    it("로고가 정상적으로 렌더링되는지 확인", () => {
      cy.get("[data-testid='site-logo']")
        .should("have.attr", "src")
        .and("include", "/SVG/Logo.svg");
    });
});
/// <reference types="cypress"/>

import PrintOptions from "../../src/components/PrintOptions";

describe("Print options", () => {
  it("prints A4 version", () => {
    const callback = cy.stub();

    cy.mount(<PrintOptions printCallback={callback} />);

    cy.contains("Tisk");
    cy.contains("A4").click();

    expect(callback).to.have.been.calledOnceWith("a4");
  });
});

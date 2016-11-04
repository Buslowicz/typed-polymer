import { importHTML, TypedPolymer } from "../src/typed-polymer";

describe("TypedPolymer", function() {
  describe("#importHTML()", function() {
    it("should import a component imperatively and return a promise", function() {
      importHTML("loading-test-component.html").then(() => {
        let loadingTestComponent: TypedPolymer = <any> document.createElement("loading-test-component");
        loadingTestComponent.is.should.equal("loading-test-component");
      });
    });
  });
});

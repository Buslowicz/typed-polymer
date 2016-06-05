import {TypedPolymer} from "../src/TSComponent";

chai.should();
const expect = chai.expect;

describe("TypedPolymer", function() {
  describe("#register()", function() {
    class TestComponentRegister extends TypedPolymer {}
    TestComponentRegister.register();
    var element: TestComponentRegister = <any>document.createElement("test-component-register");

    class TestComponentRegisterNamed extends TypedPolymer {}
    TestComponentRegisterNamed.register("test-component-named");
    var namedElement: TestComponentRegisterNamed = <any>document.createElement("test-component-named");


    it("should register the component under the class name (converted to kebab-case)", function() {
      expect(element).to.exist;
      element.is.should.equal("test-component-register");
      element["__isPolymerInstance__"].should.be.true;
    });
    it("should register the component under given name if provided", function () {
      expect(namedElement).to.exist;
      namedElement.is.should.equal("test-component-named");
      namedElement["__isPolymerInstance__"].should.be.true;
    });
  });
});

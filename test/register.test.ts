import {TypedPolymer, register} from "../src/typed-polymer";
const expect = chai.expect;

describe("TypedPolymer", function() {
  function isValidComponent(element, name) {
    return function () {
      expect(element).to.exist;
      element.is.should.equal(name);
      element["__isPolymerInstance__"].should.equal(true);
    };
  }

  describe("#register()", function() {
    class TestComponentRegister extends TypedPolymer {}
    TestComponentRegister.register();
    const element: TypedPolymer = <any>document.createElement(TestComponentRegister.moduleID);

    class TestComponentRegisterNamed extends TypedPolymer {}
    TestComponentRegisterNamed.register("test-component-named");
    const namedElement: TypedPolymer = <any>document.createElement(TestComponentRegisterNamed.moduleID);

    @register class TestComponentRegisterDecorator extends TypedPolymer {}
    const elementDecorator: TypedPolymer = <any>document.createElement(TestComponentRegisterDecorator.moduleID);

    @register("test-component-register-named-decor")
    class TestComponentRegisterDecoratorNamed extends TypedPolymer {}
    const elementDecoratorNamed: TypedPolymer =
      <any>document.createElement(TestComponentRegisterDecoratorNamed.moduleID);

    it("should register the component under the class name (converted to kebab-case)", isValidComponent(
      element, "test-component-register"
    ));
    it("should register the component under given name if provided", isValidComponent(
      namedElement, "test-component-named"
    ));
    it("should hold component name (dash-cased) in moduleID static property of a class object", function() {
      element.is.should.equal(TestComponentRegister.moduleID);
    });
    it("should create a valid object using a factory", function() {
      Object.keys(TestComponentRegister.create()).should.contain("root").and.contain("customStyle");
    });
    it("should register the component using `register` decorator", isValidComponent(
      elementDecorator, "test-component-register-decorator"
    ));
    it("should register the component using `register` decorator with a proper name when given", isValidComponent(
      elementDecoratorNamed, "test-component-register-named-decor"
    ));
  });
});

import {TypedPolymer, set, readOnly, notify, reflectToAttribute} from "../src/typed-polymer";

class TestComponentPropertyOptions extends TypedPolymer {
  @set(Number) @readOnly readOnlyProp: number;
  @readOnly @set(Number) readOnlyProp2: number;
  @set(Number) @notify notifyProp: number;
  @notify @set(Number) notifyProp2: number;
  @set(Number) @reflectToAttribute reflectToAttributeProp: number;
  @reflectToAttribute @set(Number) reflectToAttributeProp2: number;
}

TestComponentPropertyOptions.register();

const element: TestComponentPropertyOptions = <any>document.createElement(TestComponentPropertyOptions.moduleID);

describe("Decorator@readOnly", function () {
  var properties: any = element.properties;

  it("should set the readOnly flag for property", function () {
    properties.readOnlyProp.readOnly.should.equal(true);
  });

  it("should set the readOnly flag for property when decorators are called in reversed order", function () {
    properties.readOnlyProp2.readOnly.should.equal(true);
  });
});

describe("Decorator@notify", function () {
  var properties: any = element.properties;

  it("should set the notify flag for property", function () {
    properties.notifyProp.notify.should.equal(true);
  });

  it("should set the notify flag for property when decorators are called in reversed order", function () {
    properties.notifyProp2.notify.should.equal(true);
  });
});

describe("Decorator@reflectToAttribute", function () {
  var properties: any = element.properties;

  it("should set the reflectToAttribute flag for property", function () {
    properties.reflectToAttributeProp.reflectToAttribute.should.equal(true);
  });

  it("should set the reflectToAttribute flag for property when decorators are called in reversed order", function () {
    properties.reflectToAttributeProp2.reflectToAttribute.should.equal(true);
  });
});

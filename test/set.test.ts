import {TypedPolymer, set} from "../src/TSComponent";

chai.should();

class TestComponentSet extends TypedPolymer {
  @set(true) booleanValue: boolean;
  @set(50) numberValue: number;
  @set("string") stringValue: string;
  @set(() => true, {type: Boolean}) functionValue: any;
  @set({}) objectValue: any;
  @set([]) arrayValue: any[];

  @set(Boolean) booleanType: boolean;
  @set(Number) numberType: number;
  @set(String) stringType: string;
  @set(Object) objectType: any;
  @set(Array) arrayType: any[];

  @set(null, {
    type: String,
    value: null,
    reflectToAttribute: true,
    readOnly: true,
    notify: true
  })
  passingOptions: string;
}

TestComponentSet.register();

const element: TestComponentSet = <any>document.createElement("test-component-set");

describe("Decorator@set", function () {
  var properties: any = element.properties;

  it("should set a proper type and a value", function () {
    properties.booleanValue.type.should.equal(Boolean);
    properties.booleanValue.value.should.equal(true);

    properties.numberValue.type.should.equal(Number);
    properties.numberValue.value.should.equal(50);

    properties.stringValue.type.should.equal(String);
    properties.stringValue.value.should.equal("string");

    properties.functionValue.type.should.equal(Boolean);
    properties.functionValue.value().should.equal(true);

    properties.objectValue.type.should.equal(Object);
    JSON.stringify(properties.objectValue.value).should.equal("{}");

    properties.arrayValue.type.should.equal(Array);
    JSON.stringify(properties.arrayValue.value).should.equal("[]");
  });

  it("should set a proper type for passing type instead of value", function () {
    properties.booleanType.type.should.equal(Boolean);

    properties.numberType.type.should.equal(Number);

    properties.stringType.type.should.equal(String);

    properties.objectType.type.should.equal(Object);

    properties.arrayType.type.should.equal(Array);
  });

  it("should set options to the field", function () {
    properties.passingOptions.should.deep.equal({
      type: String,
      value: null,
      reflectToAttribute: true,
      readOnly: true,
      notify: true,
      defined: true
    });
  });
});

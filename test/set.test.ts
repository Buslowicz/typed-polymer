import {TypedPolymer, set} from "../src/typed-polymer";

/* tslint:disable:member-ordering */
class TestComponentSet extends TypedPolymer {
  @set(true) booleanValue: boolean;
  @set(50) numberValue: number;
  @set("string") stringValue: string;
  @set(() => true, Boolean) functionValue: any;
  @set({}) objectValue: any;
  @set([]) arrayValue: any[];

  @set(Boolean) booleanType: boolean;
  @set(Number) numberType: number;
  @set(String) stringType: string;
  @set(Object) objectType: any;
  @set(Array) arrayType: any[];

  @set(1) n1: number;
  @set(2) n2: number;
  @set(Number) computed1(n1: number, n2: number): number {
    return n1 + n2;
  }

  @set(() => ({a: 1, b: 2})) o1: any;
  @set("o1.a, o1.b", Number) computed2(a: number, b: number): number {
    return a + b;
  }
}

TestComponentSet.register();

const element: TestComponentSet = <any>document.createElement(TestComponentSet.moduleID);

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

  it("should create a computed property taking arguments from the method", function () {
    element.computed1.should.equal(3);
    element.n1 = 10;
    element.n2 = 15;
    element.computed1.should.equal(25);
  });

  it("should create a computed property with provided properties/paths to observe", function () {
    element.computed2.should.equal(3);
    element.set("o1.a", 10);
    element.set("o1.b", 15);
    element.computed2.should.equal(25);
    element.o1 = {a: 5, b: 10};
    element.computed2.should.equal(15);
  });
});

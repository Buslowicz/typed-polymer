import {TypedPolymer, set, observe} from "../src/typed-polymer";

chai.should();

class TestComponentObserve extends TypedPolymer {
  @set(10) x: number;
  @set(20) y: number;
  @set(30) z: number;
  @set({a: 1, b: 1, c: 1})  v: any;
  
  @observe("x")
  singleProp(): void {
    this.singleProp["n"]++;
  }

  @observe("y,z")
  multiProp(): void {
    this.multiProp["n"]++;
  }

  @observe("v.a")
  singlePath(): void {
    this.singlePath["n"]++;
  }

  @observe("v.b,v.c")
  multiPath(): void {
    this.multiPath["n"]++;
  }
}

TestComponentObserve.register();

const element: TestComponentObserve = <any>document.createElement(TestComponentObserve.moduleID);

describe("Decorator@observe", function () {
  it("should fire single property observer if the property value changes", function () {
    element.singleProp["n"] = 0;
    element.x++;
    element.singleProp["n"].should.equal(1);
  });
  it("should fire multi property observer if any observed property value changes", function () {
    element.multiProp["n"] = 0;
    element.y++;
    element.z++;
    element.multiProp["n"].should.equal(2);
  });
  it("should fire single path observer if observed path value changes", function () {
    element.singlePath["n"] = 0;
    element.set("v.a", element.v.a + 1);
    element.singlePath["n"].should.equal(1);
  });
  it("should fire multi path observer if any observed path value changes", function () {
    element.multiPath["n"] = 0;
    element.set("v.b", element.v.b + 1);
    element.set("v.c", element.v.c + 1);
    element.multiPath["n"].should.equal(2);
  });
});

import {TypedPolymer, template, once} from "../src/TSComponent";
import DomApi = polymer.DomApi;

chai.should();

@template(`<h1 id="h1">Hello World!</h1>`)
class TestComponentOnce extends TypedPolymer {
  @once("test")
  testEvent(): void {
    this.testEvent["n"]++;
  }

  @once("test2", "h1")
  test2Event(): void {
    this.test2Event["n"]++;
  }
}

TestComponentOnce.register();

const element: TestComponentOnce = <any>document.createElement("test-component-once");

describe("Decorator@once", function () {
  it("should fire event marked as `once` only once", function () {
    element.testEvent["n"] = 0;
    element.$.h1.dispatchEvent(new CustomEvent("test", {bubbles: true}))
    element.$.h1.dispatchEvent(new CustomEvent("test", {bubbles: true}))
    element.$.h1.dispatchEvent(new CustomEvent("test", {bubbles: true}))
    element.testEvent["n"].should.equal(1);
  });
  it("should fire targeted event marked as `once` only once", function () {
    element.test2Event["n"] = 0;
    element.$.h1.dispatchEvent(new CustomEvent("test2", {bubbles: true}))
    element.$.h1.dispatchEvent(new CustomEvent("test2", {bubbles: true}))
    element.$.h1.dispatchEvent(new CustomEvent("test2", {bubbles: true}))
    element.test2Event["n"].should.equal(1);
  });
});

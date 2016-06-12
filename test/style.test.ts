import {TypedPolymer, template, styles} from "../src/typed-polymer";
import DomApi = polymer.DomApi;

chai.should();

@template(`<h1 id="h1">Hello World!</h1>`)
@styles([`:host {display: none} h1 {display: flex}`])
class TestComponentStyles extends TypedPolymer {}

TestComponentStyles.register();

const element: TestComponentStyles = <any>document.createElement("test-component-styles");

describe("Decorator@styles", function () {
  beforeEach(function () {
    document.body.appendChild(<any>element);
  });
  it("should apply styles to component instance", function () {
    getComputedStyle(<any>element).display.should.equal("none");
    getComputedStyle(element.$.h1).display.should.equal("flex");
  });
});

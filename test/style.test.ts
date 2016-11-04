import {TypedPolymer, template, styles} from "../src/typed-polymer";

@styles([":host {position: absolute}"])
class TestSampleSharedStyle extends TypedPolymer {
}
TestSampleSharedStyle.register();

@template(`<h1 id="h1">Hello World!</h1>`)
@styles([`:host {display: none} h1 {display: flex}`])
class TestComponentStyles extends TypedPolymer {
}
TestComponentStyles.register();

@styles([`test-sample-shared-style`])
class TestComponentCustomStyles extends TypedPolymer {
}
TestComponentCustomStyles.register();

@styles([`test-sample-shared-style`, `:host {display: none}`])
class TestComponentMixedStyles extends TypedPolymer {
}
TestComponentMixedStyles.register();

const elements: TypedPolymer[] = [
  <any>document.createElement(TestComponentStyles.moduleID),
  <any>document.createElement(TestComponentCustomStyles.moduleID),
  <any>document.createElement(TestComponentMixedStyles.moduleID)
];

describe("Decorator@styles", function () {
  before(function () {
    elements.forEach(function (element) {
      document.body.appendChild(<any>element);
    });
  });
  it("should apply styles to component instance", function () {
    getComputedStyle(<any>elements[0]).display.should.equal("none");
    getComputedStyle(elements[0].$.h1).display.should.equal("flex");
  });

  it("should apply a shared style if provided a name", function () {
    getComputedStyle(<any>elements[1]).position.should.equal("absolute");
  });

  it("should apply both shared and own styles when mixed", function () {
    getComputedStyle(<any>elements[2]).display.should.equal("none");
    getComputedStyle(<any>elements[2]).position.should.equal("absolute");
  });
});

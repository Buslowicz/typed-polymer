import {TypedPolymer, set, template} from "../src/typed-polymer";
import DomApi = polymer.DomApi;

chai.should();
const expect = chai.expect;

@template(`
<h1>Hello World!</h1>
<div id="math1">{{{n1+n2}}}</div>
<div id="math2">{{{n1*n2}}}</div>
<div id="math3">{{{n1-n2}}}</div>
<div id="math4">{{{n1/n2}}}</div>

<div id="non-model1">{{{n1+10}}}</div>
<div id="non-model2">{{{screen.width - n1}}}</div>

<div id="global1">{{{Math.ceil(n2/n1)}}}</div>
<div id="global2">{{{screen.width / screen.height}}}</div>
`)
class TestComponentTemplate extends TypedPolymer {
  @set(40)  n1: number;
  @set(20)  n2: number;
}
TestComponentTemplate.register();

const element: TestComponentTemplate = <any>document.createElement(TestComponentTemplate.moduleID);
const elementDom: DomApi = Polymer.dom(element["root"]);

describe("Decorator@template", function() {
  it("should contain the `H1` tag", function() {
    //noinspection BadExpressionStatementJS
    expect(elementDom.querySelector("h1")).to.not.be.null;
  });

  describe("expression binding", function() {
    it("should be able to do simple math on properties", function() {
        element.$["math1"].textContent.trim().should.equal("60");
        element.$["math2"].textContent.trim().should.equal("800");
        element.$["math3"].textContent.trim().should.equal("20");
        element.$["math4"].textContent.trim().should.equal("2");
    });

    it("should be able to do operation on properties and non-model values", function() {
      element.$["non-model1"].textContent.trim().should.equal("50");
      element.$["non-model2"].textContent.trim().should.equal(`${screen.width - 40}`);
    });

    it("should be able to execute global methods", function() {
      element.$["global1"].textContent.trim().should.equal("1");
      element.$["global2"].textContent.trim().should.equal(`${screen.width / screen.height}`);
    });
  });
});

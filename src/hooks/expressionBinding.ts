import {TypedPolymer} from "../typed-polymer";
const NAMES = {};
const CACHE = {};

function generateFunctionName(name: string): string {
  var idx = ++NAMES[name];
  if (!idx) {
    idx = NAMES[name] = 1;
  }
  return `_${name}_${idx}`;
}

// expressions are declared with triple mustache
export var pattern = "\{\{\{(.*)}}}";
export var callback = function expressionBinding(match: string, p: string): string {
  var f: any, args = [null], t = <TypedPolymer>this;
  // TODO: improve cache to omit below regexp
  var attrs = p
    .replace(/'[^']+'/, "") // remove single quoted strings
    .replace(/"[^"]+"/, "") // remove double quoted strings
    .match(/([a-z_$][\w_$]*)/ig);  // get all words starting from a letter, _ or $

  // create (or get from cache) a function with provided body and found arguments
  if (!(f = CACHE[p])) {
    Object.getOwnPropertyNames(t.properties || {}).forEach(property => ~attrs.indexOf(property) && args.push(property));
    f = CACHE[p] = new (Function.prototype.bind.apply(Function, args.concat(`return ${p}`)));
  }

  // create a unique name for the expression handler function
  var functionName = generateFunctionName(t.constructorName);
  t[functionName] = f;

  // return a proper binding for the template
  return `[[${functionName}(${args.slice(1).join(",")})]]`;
};

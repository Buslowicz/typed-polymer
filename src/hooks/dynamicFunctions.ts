var dynamicFunctionsNames = {};
var cached = {};

export var pattern = "\{\{\{(.*)}}}";
export var callback = function dynamicFunctions(match: string, p: string): string {
  var f: any;
  var t = <any>this;
  var constructorName = t.prototype.constructor.name;
  var [...attrs] = p.match(/([a-z_$][\w_$]*)/ig);
  attrs.some(attr => {
    if (!(attr in t.prototype.properties)) {
      throw new SyntaxError(`Property ${attr} does not exist on the prototype of ${t.prototype.is}`);
    }
    return false;
  });

  if (!(f = cached[p])) {
    f = cached[p] = new (Function.prototype.bind.apply(Function, [null].concat(attrs).concat(`return ${p}`)));
  }

  var dynamicFunctionNameIndex = ++dynamicFunctionsNames[constructorName];
  if (!dynamicFunctionNameIndex) {
    dynamicFunctionNameIndex = dynamicFunctionsNames[constructorName] = 1;
  }
  var functionName = `${constructorName}_${dynamicFunctionNameIndex}`;
  t.prototype[functionName] = f;
  return `[[${functionName}(${attrs.join(",")})]]`;
};

interface ComponentOptions {
  template?: string;
  extends?: string;
  styles?: string[];
  tagName?: string;
}

export function Component(opts: ComponentOptions|string): any {
  var {template, tagName, styles, "extends": xtends} = <ComponentOptions>opts;

  console.warn("TODO: implement styles" || styles);

  if (typeof opts === "string") {
    template = opts;
  }

  if (typeof template !== "string") {
    throw new TypeError("Template has to be a string!");
  }

  return (t: Function) => {
    if (!tagName) {
      // If no tag name was provided, convert a class name to kebab-case and use it as a tag name
      tagName = t.prototype.constructor.name.replace(/([A-Z])/g, (_, c, i) => `${i ? "-" : ""}${c.toLowerCase()}`);
    }

    t.prototype["is"] = tagName;
    if (xtends !== undefined) {
      t.prototype["extends"] = xtends;
    }

    var tpl: Element = document.createElement("template");
    tpl.innerHTML = template;

    var module: Element = document.createElement("dom-module");
    module.id = tagName;

    // TODO: handle adding styles

    module.appendChild(tpl);

    module["register"]();
  };
}

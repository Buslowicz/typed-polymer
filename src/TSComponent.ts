import {templateHooks} from "./templateHooks";

interface ComponentOptions {
  template?: string;
  extends?: string;
  styles?: string[];
  tagName?: string;
}

function configureComponent(t: Function, tagName: string, xtends: string): void {
  t.prototype["is"] = tagName;
  if (xtends !== undefined) {
    t.prototype["extends"] = xtends;
  }
}

function setTemplate(t: Function, template: string, module: Element): void {
  var tpl: Element = document.createElement("template");

  templateHooks.forEach(hook => template = template.replace(new RegExp(hook.pattern, "g"), hook.callback.bind(t)));

  tpl.innerHTML = template;

  module.appendChild(tpl);
}

function setStyles(t: Function, styles: string[], module: Element): void {
  // TODO
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
    configureComponent(t, tagName, xtends);

    var module: Element = document.createElement("dom-module");
    module.id = tagName;
    setStyles(t, styles, module);
    setTemplate(t, template, module);
    module["register"]();
  };
}

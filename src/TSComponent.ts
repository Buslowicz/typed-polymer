import {templateHooks} from "./hooks";

export interface TypedPolymer extends polymer.Base {
  template?: string;
  styles?: string[];
  constructorName: string;
}

interface ClassDecorator {
  (target: {prototype: TypedPolymer}): any;
}

interface PropertyDecorator {
  (target: TypedPolymer, key: string): any;
}

interface DomModule extends HTMLElement {
  register: () => void;
}

function setTemplate(proto: TypedPolymer, module: DomModule): void {
  let templateElement: Element = document.createElement("template");
  let template = proto.template;

  templateHooks.forEach(hook => template = template.replace(new RegExp(hook.pattern, "g"), hook.callback.bind(proto)));
  templateElement.innerHTML = template;

  module.appendChild(templateElement);
}

function setStyles(prototype: TypedPolymer, module: DomModule): void {
  // TODO
  console.warn("TODO: implement setStyles");
}

function createDomModule() {
  let module: DomModule = <DomModule>document.createElement("dom-module");
  let proto = this.prototype;

  module.id = proto.is;
  setStyles(proto, module);
  setTemplate(proto, module);
  module.register();
}

export class TypedPolymer {
  is: string = "typed-polymer";

  public static register(): void {
    let proto = this.prototype;

    let name = proto.constructor.toString().match(/(?:function )?([a-z_$][\w_$]+)/i);
    if (!name || name[0] === name[1]) {
      throw new TypeError("Class has no name");
    }

    proto.constructorName = name[1];
    proto.is = name[1].replace(/([A-Z])/g, (_, char, i) => `${i ? "-" : ""}${char.toLowerCase()}`);

    if (proto.template || proto.styles) {
      createDomModule.call(this);
    }

    Polymer(proto);
  }
}

// TypedPolymer decorators
export function template(template: string): ClassDecorator {
  return target => {target.prototype.template = template};
}

export function styles(styles: string[]): ClassDecorator {
  return target => {target.prototype.styles = styles};
}

// Polymer Element decorators
export function extend(baseElement: string): ClassDecorator {
  return target => {target.prototype.extends = baseElement};
}

export function hostAttributes(map: {[name: string]: any}): ClassDecorator {
  return target => {target.prototype.hostAttributes = map};
}

export function behaviors(behaviors: Object[]): ClassDecorator {
  return target => {target.prototype.behaviors = behaviors};
}

function setTypeValue(options: polymer.PropObjectType, value: any) {
  let types: Function[] = [String, Boolean, Number, Date, Array];
  if (!value) {
    options.value = null;
    return;
  }
  if (~types.indexOf(value)) {
    options.type = value;
  } else if (~types.indexOf(value.constructor)) {
    options.type = value.constructor;
    options.value = value;
  } else {
    options.type = Object;
    if (value !== Object) {
      options.value = value;
    }
  }
}

export function prop(value: any, options: polymer.PropObjectType = <polymer.PropObjectType>{}): PropertyDecorator {
  return (target, key) => {
    let propValue: any = target[key];
    // is it computed value?
    if (typeof propValue === "function") {
      let fName = `__$${key}`;
      options.computed = fName + (options.computed || propValue.toString()).match(/(\(.+?\))/);
      target[fName] = propValue;
    }
    setTypeValue(options, value);
    var props = target.properties || (target.properties = {});
    props[key] = options;
  }
}

// Polymer properties decorators
export module prop {
  function forceType(options: polymer.PropObjectType, type: polymer.PropConstructorType): polymer.PropObjectType {
    if (!options) {
      return {type: type}
    }
    options.type = type;
    return options
  }

  function propertyDecorator(target: TypedPolymer, key: string): any {
    let options: polymer.PropObjectType = this;
    let value: any = target[key];
    // is it computed value?
    if (typeof value === "function") {
      let fName = `__$${key}`;
      options.computed = fName + (options.computed || value.toString()).match(/(\(.+?\))/);
      target[fName] = value;
    } else if (value !== undefined) {
      options.value = value;

      // prevent additional initialization
      target[key] = undefined;
    }
    var props = target.properties || (target.properties = {});
    props[key] = options;
  }

  export function boolean(options?: polymer.PropObjectType): PropertyDecorator {
    return propertyDecorator.bind(forceType(options, Boolean));
  }

  export function date(options?: polymer.PropObjectType): PropertyDecorator {
    return propertyDecorator.bind(forceType(options, Date));
  }

  export function number(options?: polymer.PropObjectType): PropertyDecorator {
    return propertyDecorator.bind(forceType(options, Number));
  }

  export function string(options?: polymer.PropObjectType): PropertyDecorator {
    return propertyDecorator.bind(forceType(options, String));
  }

  export function array(options?: polymer.PropObjectType): PropertyDecorator {
    return propertyDecorator.bind(forceType(options, Array));
  }

  export function object(options?: polymer.PropObjectType): PropertyDecorator {
    return propertyDecorator.bind(forceType(options, Object));
  }
}

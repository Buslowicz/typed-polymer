import {templateHooks} from "./hooks";

export interface TypedPolymer extends polymer.Base {
  template?: string;
  styles?: string[];
  constructorName: string;

  targetListeners: {[eventName: string]: {[selector: string]: string}};
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

function setTemplate(proto: TypedPolymer, module: DomModule) {
  if (!(typeof proto.template === "string")) {
    return;
  }

  let templateElement: Element = document.createElement("template");
  let template: string = proto.template;

  templateHooks.forEach(hook => template = template.replace(new RegExp(hook.pattern, "g"), hook.callback.bind(proto)));
  templateElement.innerHTML = template;

  module.appendChild(templateElement);
}

function setStyles(proto: TypedPolymer, module: DomModule) {
  if (!Array.isArray(proto.styles)) {
    return;
  }
  proto.styles.forEach(style => {
    let styleElement: HTMLStyleElement = document.createElement("style");
    styleElement.innerHTML = style;
    module.appendChild(styleElement);
  });
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

  public static register() {
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
  return target => {
    target.prototype.template = template;
  };
}

export function styles(styles: string[]): ClassDecorator {
  return target => {
    target.prototype.styles = styles;
  };
}

// Polymer Element decorators
export function extend(baseElement: string): ClassDecorator {
  return target => {
    target.prototype.extends = baseElement;
  };
}

export function hostAttributes(map: {[name: string]: any}): ClassDecorator {
  return target => {
    target.prototype.hostAttributes = map;
  };
}

export function behaviors(behaviors: Object[]): ClassDecorator {
  return target => {
    target.prototype.behaviors = behaviors;
  };
}

function setTypeValue(options: polymer.PropObjectType, value: any) {
  let types: Function[] = [String, Boolean, Number, Date, Array];
  if (!value) {
    return options.value = null;
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

// Polymer properties decorators
export function set(value: any, options: polymer.PropObjectType = <polymer.PropObjectType>{}): PropertyDecorator {
  return (target, key) => {
    let propValue: any = target[key];

    // is it computed value?
    if (typeof propValue === "function") {
      let fName = `__$${key}`;
      options.computed = fName + (options.computed || propValue.toString()).match(/(\(.+?\))/)[1];
      target[fName] = propValue;
    }

    setTypeValue(options, value);

    target.properties = target.properties || {};
    target.properties[key] = options;
  };
}

export function once(eventName: string, selector: string = "*"): PropertyDecorator {
  return on(eventName, selector, true);
}

export function on(eventName: string, selector?: string, once: boolean = false): PropertyDecorator {
  if (/[^\.]+\.[^\.]+/.test(eventName)) {
    selector = null;
  }
  // TODO: handle adding target listener to existing event (with registered callback)
  // TODO: make "stopPropagation" function cancel the forEach loop

  return !selector ?
    (instance, propName) => {
      instance.listeners = instance.listeners || {};
      instance.listeners[eventName] = propName;
    }
    :
    (instance, propName) => {
      instance.targetListeners = instance.targetListeners || {};

      if (!instance.targetListeners[eventName]) {
        instance.targetListeners[eventName] = {};
        instance[`__on_${eventName}`] = (evt: Event) => {
          let el: HTMLElement = <HTMLElement>evt.target;
          let listeners: any = instance.targetListeners[eventName];

          Object
            .keys(listeners)
            .filter(s => el.matches(s))
            .forEach((key) => {
              instance[listeners[key]](evt);
              if (once) {
                delete listeners[key];
              }
            });
        };

        instance.listeners = instance.listeners || {};
        instance.listeners[eventName] = `__on_${eventName}`;
      }

      let trimmedSelector: string = selector.replace(/ /g, "");
      let eventListeners: any = instance.targetListeners[eventName];

      if (eventListeners[trimmedSelector]) {
        console.warn(`Method '${propName}' overrides '${eventListeners[selector]}'` +
          `which also listens to '${eventName}' on '${selector}'`);
      } else {
        eventListeners[trimmedSelector] = propName;
      }

      return instance[propName];
    };
}

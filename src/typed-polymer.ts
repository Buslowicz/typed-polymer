import {templateHooks} from "./hooks";

export interface TypedPolymer extends polymer.Base {
  template?: string;
  styles?: string[];
  constructorName: string;

  tpListeners: {[eventName: string]: {[selector: string]: string}};
}

interface ClassDecorator {
  (instance: {prototype: TypedPolymer}): any;
}

interface PropertyDecorator {
  (instance: TypedPolymer, propName: string): any;
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
  let proto: TypedPolymer = this.prototype;

  module.id = proto.is;
  setStyles(proto, module);
  setTemplate(proto, module);
  module.register();
}

function ifMatches(selector: string, callback: EventListener): EventListener {
  return <EventListener>function (ev, detail) {
    if (!(<HTMLElement>ev.target).matches(selector)) {
      return;
    }
    if (callback.call(this.host || this, ev, detail) === false) {
      ev.stopImmediatePropagation();
    }
  };
}

function initializeListeners(): void {
  let proto: TypedPolymer = this.prototype;
  var ready: Function = proto.ready;

  proto.ready = function () {
    Object
      .keys(proto.tpListeners)
      .forEach(eventName =>
        Object
          .keys(proto.tpListeners[eventName])
          .forEach(selector => {
            (Polymer.Settings.useShadow ? this.root : this)
              .addEventListener(
                eventName,
                ifMatches(selector, this[proto.tpListeners[eventName][selector]])
              );
          })
      );
    if (ready) {
      ready.call(this);
    }
  };
}

export class TypedPolymer {
  is: string = "typed-polymer";

  public static register(name?: string) {
    let proto: TypedPolymer = this.prototype;

    if (!name) {
      let className = proto.constructor.toString().match(/(?:function )?([a-z_$][\w_$]+)/i);
      if (!className || className[0] === className[1]) {
        throw new TypeError("Class has no name");
      }
      name = className[1];
    }

    proto.constructorName = name;
    proto.is = name.replace(/([A-Z])/g, (_, char, i) => `${i ? "-" : ""}${char.toLowerCase()}`);

    if (proto.template || proto.styles) {
      createDomModule.call(this);
    }
    if (proto.tpListeners) {
      initializeListeners.call(this);
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
  // TODO: handle shared styles
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

export function behavior(behavior: Function|Object): ClassDecorator {
  if (!behavior) {
    throw new ReferenceError("Behavior decorator has to be given a behavior (Function/Class or Object)");
  }
  return target => {
    let prototype: TypedPolymer = target.prototype;
    prototype.behaviors = prototype.behaviors || [];
    prototype.behaviors.push((<Function>behavior).prototype || behavior);
  };
}

function setTypeValue(options: polymer.PropObjectType, value: any) {
  // TODO: handle non-primitive values (not to be shared across multiple instances)
  // TODO: add option for the value to be shared
  let types: Function[] = [String, Boolean, Number, Date, Array];
  if (!value) {
    return;
  }
  if (~types.indexOf(value)) {
    options.type = options.type || value;
  } else if (~types.indexOf(value.constructor)) {
    options.type = options.type || value.constructor;
    options.value = value;
  } else {
    options.type = options.type || Object;
    if (value !== Object) {
      options.value = value;
    }
  }
}

// Polymer properties decorators
export function set(value: any, options: polymer.PropObjectType = <polymer.PropObjectType>{}): PropertyDecorator {
  return (instance, propName) => {
    let propValue: any = instance[propName];

    // is it computed value?
    if (typeof propValue === "function") {
      let fName = `__$${propName}`;
      options.computed = fName + (options.computed || propValue.toString()).match(/(\(.+?\))/)[1];
      instance[fName] = propValue;
    }

    setTypeValue(options, value);

    instance.properties = instance.properties || {};
    let opts: polymer.PropObjectType = <polymer.PropObjectType>instance.properties[propName];
    if (typeof opts === "object") {
      Object.keys(opts).forEach(opt => options[opt] = opts[opt]);
    }
    instance.properties[propName] = options;
  };
}

function setOption(instance, propName, option): void {
  instance.properties = instance.properties || {};
  instance.properties[propName] = instance.properties[propName] || {};
  instance.properties[propName][option] = true;
}

export function reflectToAttribute (instance, propName) {
  setOption(instance, propName, "reflectToAttribute");
}

export function readOnly (instance, propName) {
  setOption(instance, propName, "readOnly");
}

export function notify (instance, propName) {
  setOption(instance, propName, "notify");
}

export function once(eventName: string): PropertyDecorator {
  return (instance, propName) => {
    instance.listeners = instance.listeners || {};
    instance[`__once_${propName}`] = function (...args) {
      let [target, event]: string[] = eventName.split(".");
      this[propName].apply(this, args);
      this.unlisten(event ? this.$[target] : this, event || eventName, `__once_${propName}`);
    };
    instance.listeners[eventName] = `__once_${propName}`;
  };
}

export function on(eventName: string, selector: string = "*"): PropertyDecorator {
  // We don't use the Polymer native `listeners`. This is due to problems with different event callbacks order,
  // depending on whether using shady dom, or a shadow dom
  if (/[^\.]+\.[^\.]+/.test(eventName)) {
    let eventData: string[] = eventName.split(".");
    selector = `#${eventData[0]}`;
    eventName = eventData[1];
  }
  return (instance, propName) => {
    instance.tpListeners = instance.tpListeners || {};
    instance.tpListeners[eventName] = instance.tpListeners[eventName] || {};
    if (instance.tpListeners[eventName][selector]) {
      console.warn(`${propName} overrides ${instance.tpListeners[eventName][selector]}`);
    }
    instance.tpListeners[eventName][selector] = propName;
  };
}

export function observe(observed: string): PropertyDecorator {
  return ~observed.indexOf(",") || ~observed.indexOf(".") ?
    // observing multiple properties or path
    (instance, propName) => {
      instance.observers = instance.observers || [];
      instance.observers.push(propName + "(" + observed + ")");
    }
    :
    // observing single property
    (instance, propName) => {
      instance.properties = instance.properties || {};
      instance.properties[observed] = instance.properties[observed] || <ObjectConstructor>{};
      (<polymer.PropObjectType>instance.properties[observed]).observer = propName;
    };
}

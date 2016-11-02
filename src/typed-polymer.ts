import templateHooks from "./hooks/index";
import PropConstructorType = polymer.PropConstructorType;
import CustomElementConstructor = webcomponents.CustomElementConstructor;

/**
 * TypedPolymer interface that extends polymer.Base interface. It is mandatory, to make TypeScript believe
 * that TypedPolymer extends polymer.Base. In practice, it is all done by Polymer factory so no need to do anything.
 * We also declare additional properties to make TypedPolymer features work.
 */
export interface TypedPolymer extends polymer.Base {
  template?: string;          // template string for the component
  styles?: string[];          // list of styles to apply
  constructorName: string;    // a helper function holding

  // map of function names assigned to selector per event name
  tpListeners: {[eventName: string]: {[selector: string]: string}};
}

/**
 * Static members of TypedPolymer interface
 */
export interface TypedPolymerStatic {
  prototype: TypedPolymer;
  moduleID: string;
  polymerConstructor: CustomElementConstructor;
}

/**
 * Class decorator interface
 */
export interface ClassDecorator {
  (instance: TypedPolymerStatic): any;
}

/**
 * Property decorator interface
 */
export interface PropertyDecorator {
  (instance: TypedPolymer, propName: string): any;
}

/**
 * DomModule interface
 */
interface DomModule extends HTMLElement {
  register: () => void;
}

/**
 * Creates the template element and adds the template to it (uses template hooks)
 */
function setTemplate(proto: TypedPolymer, module: DomModule) {
  if (!(typeof proto.template === "string")) {
    return;
  }

  let templateElement: Element = document.createElement("template");
  let template: string = proto.template;

  // use every declared template hook
  templateHooks.forEach(hook => template = template.replace(new RegExp(hook.pattern, "g"), hook.callback.bind(proto)));
  templateElement.innerHTML = template;

  module.appendChild(templateElement);
}

/**
 * Creates style elements with either a css content, or if it's a shared style name, add it
 */
function setStyles(proto: TypedPolymer, module: DomModule) {
  if (!Array.isArray(proto.styles)) {
    return;
  }

  const isCustomStyle = /[\w]+(-[\w]+)+/;

  // we need to add styles inside a template tag, so if it doesn't exist, we need to create it
  let templateElement: Element = module.firstElementChild;
  if (!templateElement) {
    templateElement = document.createElement("template");
    module.appendChild(templateElement);
  }

  let firstChild: Element = templateElement.firstElementChild;

  // iterate over provided styles
  proto.styles.forEach(style => {
    let styleElement: HTMLStyleElement = document.createElement("style");
    if (isCustomStyle.test(style)) {
      styleElement.setAttribute("include", style);
    } else {
      styleElement.innerHTML = style;
    }

    templateElement.insertBefore(styleElement, firstChild);
  });
}

/**
 * Create a DomModule element, add template and styles and register it
 */
function createDomModule() {
  let module: DomModule = <DomModule>document.createElement("dom-module");
  let proto: TypedPolymer = this.prototype;

  module.id = proto.is;
  setTemplate(proto, module);
  setStyles(proto, module);
  module.register();
}

/**
 * Generates a handler function that filters targets by selector
 */
function ifMatches(selector: string, callback: EventListener): EventListener {
  return <EventListener>function (ev, detail) {
    if (!(<HTMLElement>ev.target).matches(selector)) {
      return;
    }

    // if a callback returns false, prevent other callbacks from being called
    if (callback.call(this.host || this, ev, detail) === false) {
      ev.stopImmediatePropagation();
    }
  };
}

/**
 * Initialize event listeners
 */
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

/**
 * A function to register an element within a browser (and Polymer)
 */
function registerComponent(name: string, target: TypedPolymerStatic): void {
  let proto: TypedPolymer = target.prototype;
  proto.factoryImpl = <(...args: any[]) => void>proto.constructor;  // we use a constructor as factoryImpl

  // try to guess the name if it was not provided
  if (!name) {
    var constructor = proto.constructor;
    name = constructor["name"];
    if (!name) {
      let className = constructor.toString().match(/(?:function )?([a-z_$][\w_$]+)/i);
      if (!className || className[0] === className[1]) {
        throw new TypeError("Class has no name");
      }
      name = className[1];
    }
  }

  // CamelCased name
  proto.constructorName = name.replace(/-(\w)|^(\w)/g, (_, w1, w2) => (w1 || w2).toUpperCase());

  // kebab-cased name
  target.moduleID = proto.is = name.replace(/([A-Z])/g, (_, char, i) => `${i ? "-" : ""}${char.toLowerCase()}`);

  // create a DomModule if template or styles were provided
  if (proto.template || proto.styles) {
    createDomModule.call(target);
  }

  // attach event listeners if they were declared
  if (proto.tpListeners) {
    initializeListeners.call(target);
  }

  // saving the imperative constructor
  target.polymerConstructor = Polymer(proto);
}

/**
 * The heart of TypedPolymer
 */
export class TypedPolymer {
  public static moduleID: string;     // holds the kebab-cased name of the component (like `my-element`)
  public static polymerConstructor: CustomElementConstructor;  // the constructor used to create the element using `new` keyword
  public is: string = "typed-polymer";

  /**
   * Factory to create instances imperatively
   */
  static create(...args) {
    return new (Function.prototype.bind.apply(this.polymerConstructor, [null].concat(args)));
  }

  /**
   * A function to register an element within a browser (and Polymer)
   */
  public static register(name?: string) {
    // this method is static and the `this` object will contain a static props/methods
    // TypeScript is not really aware of that so we have to cast it. TypedPolymer however, is not assignable
    // to TypedPolymerStatic, so we have to cast it to `any` first
    registerComponent(name, <TypedPolymerStatic><any> this);
  }
}

// ------------ TypedPolymer decorators ------------ //
export function register(target: TypedPolymerStatic): void;
export function register(name?: string): ClassDecorator;
export function register(arg) {
  if (typeof arg === "string") {
    return registerComponent.bind(null, arg);
  } else {
    registerComponent(null, arg);
  }
}

/**
 * Provide a template to the element
 */
export function template(template: string): ClassDecorator {
  return target => {
    target.prototype.template = template;
  };
}

/**
 * Provide list of styles to the element
 */
export function styles(styles: string[]): ClassDecorator {
  return target => {
    target.prototype.styles = styles;
  };
}

/**
 * Declare which element we extend
 */
export function extend(baseElement: string): ClassDecorator {
  return target => {
    target.prototype.extends = baseElement;
  };
}

/**
 * Set host attributes for the element
 */
export function hostAttributes(map: {[name: string]: any}): ClassDecorator {
  return target => {
    target.prototype.hostAttributes = map;
  };
}

/**
 * Add a behavior to the element
 */
export function behavior(behavior: Function & Object): ClassDecorator {
  if (!behavior) {
    throw new ReferenceError("Behavior decorator has to be given a behavior (Function/Class or Object)");
  }
  return target => {
    let prototype: TypedPolymer = target.prototype;
    prototype.behaviors = prototype.behaviors || [];
    prototype.behaviors.push(behavior.prototype || behavior);
  };
}

/**
 * Function to set the type and value for the property
 */
function setTypeValue(options: polymer.PropObjectType, value: any, forceType: polymer.PropConstructorType) {
  let types: Function[] = [String, Boolean, Number, Date, Array];

  if (~types.indexOf(value)) {
    // Passing the constructor (excluding Object and Function) will only set the type, and leave a value as undefined
    options.type = value;
  } else if (value && ~types.indexOf(value.constructor)) {
    // Passing a value, which constructor is of the supported type
    options.type = value.constructor;
    options.value = value;
  } else {
    // If the value is an Object or a Function, set the type to Object
    options.type = Object;
    if (value !== Object) {
      // if value is not an Object constructor, assign it as a default
      options.value = value;
    }
  }

  // Override the type if needed
  if (forceType) {
    options.type = forceType;
  }
}

/**
 * Set the property default value (type can be forced or taken from the value)
 */
export function set(value: any, forceType?: polymer.PropConstructorType): PropertyDecorator {
  let options: polymer.PropObjectType = <polymer.PropObjectType>{};
  return (instance, propName) => {
    let propValue: any = instance[propName];

    // is it computed value?
    if (typeof propValue === "function") {
      let fName: string = `__$${propName}`;
      if (typeof value === "string" && typeof forceType === "function") {
        options.computed = `${fName}(${value})`;
        options.type = forceType;
      } else if (typeof value === "function") {
        options.type = <PropConstructorType>value;
      } else {
        throw new SyntaxError("`@set` for a computed property (method) needs a type");
      }

      if (!options.computed) {
        options.computed = fName + propValue.toString().match(/(\(.+?\))/)[1];
      }

      instance[fName] = propValue;
    } else {
      setTypeValue(options, value, forceType);
    }

    instance.properties = instance.properties || {};
    let opts: polymer.PropObjectType = <polymer.PropObjectType>instance.properties[propName];
    if (typeof opts === "object") {
      Object.keys(opts).forEach(opt => options[opt] = opts[opt]);
    }
    instance.properties[propName] = options;
  };
}

/**
 * Set a desired boolean flag (option)
 */
function setOption(instance, propName, option): void {
  instance.properties = instance.properties || {};
  instance.properties[propName] = instance.properties[propName] || {};
  instance.properties[propName][option] = true;
}

/**
 * Set `reflectToAttribute` flag
 */
export function reflectToAttribute(instance, propName) {
  setOption(instance, propName, "reflectToAttribute");
}

/**
 * Set `readOnly` flag
 */
export function readOnly(instance, propName) {
  setOption(instance, propName, "readOnly");
}

/**
 * Set `notify` flag
 */
export function notify(instance, propName) {
  setOption(instance, propName, "notify");
}

/**
 * Declare an event that will trigger only once
 */
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

/**
 * Declare an event listener with a selector filter
 */
export function on(eventName: string, selector: string = "*"): PropertyDecorator {
  // We don't use the Polymer native `listeners`. This is due to problems with different event callbacks order,
  // depending on whether using shady dom, or a shadow dom
  if (/[^.]+\.[^.]+/.test(eventName)) {
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

/**
 * Observe a single or multiple property/path
 */
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

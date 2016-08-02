# Typed Polymer
The TypeScript based Polymer components (Work in Progress)

## The Concept
Typed Polymer was inspired by [PolymerTS](https://github.com/nippur72/PolymerTS),
the concept was a bit different though. Instead of only using Polymer features and base it on HTML5 imports,
my concept was to create a JS/TS import structure and add features I've personally been missing in Polymer.

This is how the Typed Polymer was born. It is still in alpha stage and is definitely **NOT** production ready.
I will, however, invest some time in building it to perfection and killing any bugs that arise.

**Note:** Typed Polymer embraces the power of [Decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md)
in order to work. If you cannot use them by any reason, please do not use this library.

**Note2:** Typed Polymer does **NOT** support legacy browsers, and will never ever do (unless I get paid millions).

## Features
Besides of default Polymer features, Typed Polymer introduces:

* Component name (tag name) is by default taken from a class name (can be overridden)
* **JS expressions** in template bindings
* **targeted events** with a css selector filter (just like _.on()_ in jQuery)
* **once** events
* styles and template provided in decorators (which is also available in PolymerTS)

## Available decorators
### Class decorators
* @template(template: string) - add a template to the component
* @styles(styles: string[]) - add styles to the template
* @extend(baseElement: string) - provide the tag to extend
* @hostAttributes(map: {[name: string]: any}) - map of attributes to set on the host
* @behavior(behavior: Function|Object) - add a behavior (as a class or a simple object)

### Property decorators
* @set(value: any, forceType?: polymer.PropConstructorType) - set a default `value` (this also sets a `type`)
* @reflectToAttribute - set `reflectToAttribute` to true
* @readOnly - set `readOnly` to true
* @notify - set `notify` to true

### Method decorator
* @set(observed: string, type: polymer.PropConstructorType) - create a computed property (observed properties may be omitted, will then be taken from method arguments)
* @once(eventName: string) - triggers a decorated function when the provided event is received and removes the listener
* @on(eventName: string, selector: string = "*") - add an event listener with optional selector filter
* @observe(observed: string) - observe a property/properties or a path/paths and run decorated function once they change

## Examples
### Registration
To register a component, you need to create a class which extends `TypedPolymer`, and after declaration, call the `.register()` method on it.

Components by default take the name from the class name, so a class `MyComponent` will create a component with a name `my-component`.
```TypeScript
class MyComponent extends TypedPolymer {}
MyComponent.register(); // will register `my-component`
```

If you are not satisfied with automatic naming, you can always pass the name to the `.register` function.
```TypeScript
class MyComponent extends TypedPolymer {}
MyComponent.register("my-new-name"); // will register `my-new-name`
```

### @template
Provide an HTML template, as a string. Currently templates have to be inline, but will be possible to provide a path to a template
```TypeScript
@template(`<h1>Hello World!</h1>`)
class MyComponent extends TypedPolymer
{
  // ...
}
MyComponent.register();
```

### @styles
Provide a list of styles (contents for the `<style>` tags)
```TypeScript
@styles([`:host {display: none} h1 {display: flex}`])
class MyComponent extends TypedPolymer
{
  // ...
}
MyComponent.register();
```

### @extend
Extend native HTML elements
```TypeScript
@extend("button")
class MyComponent extends TypedPolymer
{
  // ...
}
MyComponent.register();
```

### @hostAttributes
Static attributes on host
```TypeScript
@hostAttributes({ contenteditable: true })
class MyComponent extends TypedPolymer
{
  // ...
}
```

### @behavior
Add a behavior to the component
```TypeScript
@behavior(MyBehavior)
class MyComponent extends TypedPolymer
{
  // ...
}
```

### @set
`@set` decorator is used to create a property (or a computed property)
It has the total of 5 interfaces:
* `@set(DefaultValue) property` - set the default value and guess the type
* `@set(Type) property` - set the type only (default value will be undefined)
* `@set(DefaultValue, Type) property` - set the default value and set the type
* `@set(Type) method(a, b) {}` - creates a computed property, sets type and observes properties listed as arguments
* `@set("o.a, o.b", Type) method(a, b) {}` - creates a computed property, sets type and observes properties or paths provided in first argument

```TypeScript
class MyComponent extends TypedPolymer {
  @set(Boolean) booleanType: boolean;
  @set(5) numberValue: number;
  @set(() => ({testing: true})) objectValue: any;
  @set(null, String) stringValue: string;

  @set(Boolean) computed1(numberValue): boolean { return numberValue > 5 }
  @set("objectValue.testing", Boolean) computed2(isTesting: boolean): boolean { return isTesting }
}
MyComponent.register();
```

### @reflectToAttribute
Causes the corresponding attribute to be set on the host node when the property value changes

```TypeScript
class MyComponent extends TypedPolymer {
  @set(Boolean) @reflectToAttribute booleanType: boolean;
}
MyComponent.register();
```

### @readOnly
Makes it impossible to set the property directly by assignment or data binding

```TypeScript
class MyComponent extends TypedPolymer {
  @set(Boolean) @readOnly booleanType: boolean;
}
MyComponent.register();
```

### @notify
Makes the property available for two-way data binding

```TypeScript
class MyComponent extends TypedPolymer {
  @set(Boolean) @notify booleanType: boolean;
}
MyComponent.register();
```

### @once
Registers a handler to the event, that will unregister once fired

```TypeScript
class MyComponent extends TypedPolymer {
  @once("some-event")
  handler(): void {}
}
```

### @on
Registers a handler to the event

```TypeScript
class MyComponent extends TypedPolymer {
  @on("some-event")
  someEventHandler(): void {}

  @on("my-element.some-event")  // will listen to `some-event` on element with an id `my-element`
  someEventHandlerWithId(): void {}

  @on("some-event", "button")  // will listen to `some-event` on a button
  someEventHandlerWithSelector(): void {}
}
```

### @observe
Sets an observer function for a single property/path or a list of properties/paths

```TypeScript
class MyComponent extends TypedPolymer {
  @set(Number) num: number;
  @set(String) str: string;

  @observe("number")
  numChanged(newValue: number, oldValue: number): void {}

  @observe("num, str")
  numOrStrChanged(num: number, str: string): void {}
}
```

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
* @reflectToAttribute - set `reflectToAttribute` to false
* @readOnly - set `readOnly` to false
* @notify - set `notify` to false

### Method decorator
* @once(eventName: string) - triggers a decorated function when the provided event is received and removes the listener
* @on(eventName: string, selector: string = "*") - add an event listener with optional selector filter
* @observe(observed: string) - observe a property/properties or a path/paths and run decorated function once they change

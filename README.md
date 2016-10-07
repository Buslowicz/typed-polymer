# Typed Polymer
TypedPolymer is a TypeScript based Polymer components framework. It was inspired by [PolymerTS](https://github.com/nippur72/PolymerTS), the concept was a bit different though. Instead of only using Polymer features and base it on HTML5 imports, my concept was to create a JS/TS import structure and add features I've personally been missing in Polymer.

This is how the Typed Polymer was born. It is still in alpha stage and is definitely **NOT** production ready. I will, however, invest some time in building it to perfection and killing any bugs that arise.

**Note:** Typed Polymer embraces the power of [Decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md) in order to work. If you cannot use them by any reason, please do not use this library.

**Note2:** Typed Polymer does **NOT** support legacy browsers, and will never ever do (unless I get paid millions).

## Features
Besides of default Polymer features, Typed Polymer introduces:

* Component name (tag name) is by default taken from a class name (can be overridden)
* [**JS expressions**](https://github.com/Draccoz/typed-polymer/wiki/expression-binding) in template bindings
* [**targeted events**](https://github.com/Draccoz/typed-polymer/wiki/targeted-events) with a css selector filter (just like _.on()_ in jQuery)
* [**once**](https://github.com/Draccoz/typed-polymer/wiki/once-events) events
* [styles and template](https://github.com/Draccoz/typed-polymer/wiki/decorators) provided in decorators (which is also available in PolymerTS)

## Docs
* [Creating an element](https://github.com/Draccoz/typed-polymer/wiki/creating-elements)
* [Decorators](https://github.com/Draccoz/typed-polymer/wiki/decorators)
* [Examples](https://github.com/Draccoz/typed-polymer/wiki/examples)

# Javascript-Serializer

This is a javascript serializer. The `serialize` function can convert almost any variable into a string representation of itself. It's **useful for logs** and debugging.

## Usage

```javascript
var obj = {
  callMe: "function ishmael() { return 'whale'; }",
  arrayStorage: [
    "Infinity",
    -Infinity,
    [ /regexp/g, new Date(), () => { return 0; }, [1,"2",3e4] ]
  ],
  mapStorage: new Map([ 
    [ () => { return 'mapper'; }, NaN ],
  ])
};

// returns string representation of object
var seralizedObj = serialize(obj); 

// it can be deserialized back to an object
var deserializedObj = deserialized(seralizedObj);
```

## Supported Types
Type | Examples
| --- | --- |
null | `null`
undefined | `undefined`
number | `Infinity, -Infinity, NaN, 123.456, 789, 1e4, 1.2e+5`
string | `'hello world', "hello world", hello ${world}`
boolean | `true, false`
symbol | `Symbol("hello world")`
regexp literal | `/hello.*world/g`
date | `new Date()`
error | `new Error()`
array | `['hello','world']`
iterable | `Map, Set`
named function | `function hello() { return 'world'; }`
anonymous function | `function() { return 'goodbye world'; }`
arrow function | `(result) => { return result; }`
native function on the `window` | `Boolean, Date, Map, Number, Object, etc.`
native object on the `window` | `Math, JSON, etc.`
object that has `Object` prototype | `{ key: 123 }`. If you amended its prototype, those edits will be lost
object that has `Node` in its prototype chain | `document, document.createElement('div')`

## Possibly Supported Types
Type | Explanation
| --- | --- |
object with unique `toString()` | If an object's toString method returns a unique string (in that it doesn't print `[object Object]`), serialize() attempts to give you a string that will eval back to the object using that unique string.

## Unsupported Types:
Type | Explanation
| --- | --- |
objects with a common `toString()` method, a prototype different from `Object`, that don't have `Node` in its prototype chain, and that are not iterable | Since it's not possible to get something that will deserialize back into the original value, you'll get something that deserializes into a string that has the constructor name and any exposed properties, like: `Example, {key: 123}` ...here is a list of some example objects in this category: `Promise, WeakMap, WeakSet, ArrayBuffer, DataView, etc.`
native functions that are nested properties of the `window` |  In theory, they could be serialized, if I chose to recursively search the `window` for them, but that's sounds crazy... the `window` can get massive. I might later add an option to turn a recursive search on for those who are daring ...here is a list of some example functions in this cateogry: `Math.abs, JSON.stringify`
  
## Other Notes
- `errors`: If you eval the serialized error, it will be thrown.
- `numbers`: There is no way to keep a number in scientific notation because they're always turned into fixed notation. `(1e4 -> 1000)`
- `Proxy`: For some reason, a Proxy object's `__proto__.constructor.name` is equal to `Object`, so proxies become empty objects `{}`, instead of the string: `[object Proxy]`

## Deserialize/Unserialize

The `deserialize` and `unserialize` functions are exactly the same. All they do, is wrap your serialized variable in parentheses and pass them to javascript's `eval` function. I think it goes without saying that you should not run `eval` on any serialized object that may have been modified by a user if you don't understand the risks.

## Runtime Considerations
Obviously, your object must exist before you can serialize it, so any resolving functions and variables will have their resolutions serialized.

##### Examples:
- `any_var`: you get whatever `any_var` is equal to
- `(function(){ return true; })()` : you get `true`
- `some_function()` : you get whatever is returned from this
- `new Date()` : you get the date object returned
  
## Scoping Considerations
Functions don't resolve variables until they're called, so if your object has functions that use externally declared variables, you'll have to redeclare them after unserializing to properly use those functions.

##### Examples:

```javascript
var myVar = "myStr";
var toast = {
   print: () => { console.log(myVar); }
   iAm: toast
}
```
If you unserialize `toast` somewhere else and try to use it,  make sure `myVar` is declared in scope if you want the `print` function to work.

Also keep in mind, that technically the variable name `toast` is also external to the object itself, so if you unserialize an object into a different variable name like `var newObj = toast`, `toast` still needs to be defined for `newObj`'s `iAm` method to work.

## License

MIT License, use however you like.


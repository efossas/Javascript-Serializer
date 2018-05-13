function serialize(value) {
  switch(typeof value) {
    case "function":
      var func = value.toString();
      if (func.search(/\{[^'"`]+\[native code\][^'"`]+\}/g) > -1) {
        if (window[value.name] === value) {
          // native function on window
          return value.name; 
        } else {
          // native function not on window, 
          // check up one level for object, if available
          return undefined; 
        }
      } else {
        // non-native function
        return func;
      }
    case "object":
      // null
      if (value === null) return null;
      // iterable objects: Array, Map, Set
      if (typeof value[Symbol.iterator] === "function") {
        let cstr = '[';
        for (index of value) {
          let result = serialize(index);
          cstr += result + ',';
        }
        if (cstr.length === 1) {
          cstr = cstr + ']' ; // empty object
        } else {
          cstr = cstr.substr(0,cstr.length-1) + ']';
        }
        // use array literals for array
        if (value.__proto__.constructor.name === "Array") return cstr;
        // use constructors for everything else, maps and sets
        return 'new ' + value.__proto__.constructor.name + '(' + cstr + ')';
      }
      // RegExp literal
      if (value instanceof RegExp) return String(value);
      // if the string version of the object is unique (as in it doesn't print [object Object]),
      // we're going to give the user a string that can evaluate to the object, hopefully
      var valString = value.toString();
      if (valString.search(/\[.*\]/g) === -1) {
        var arg;
        if (valString.search(/^[\w]*Error:/g) > -1) {
          // Error
          arg = valString.substr(valString.indexOf(':')+2,valString.length);
        } else {
          // Date
          arg = String(value);
        }
        return 'new ' + value.__proto__.constructor.name + "('" + arg + "')";
      }
      // some non-iterable object with prototype that is not from Object
      // unfortuntaely, we just return '[object Object]' here
      if (value.__proto__.constructor.name !== "Object") return "'" + value.toString() + "'";
      // Object
      var cstr = '{';
      var success = true;
      var properties = Object.getOwnPropertyNames(value)
                         .concat(Object.getOwnPropertySymbols(value));
      for (let i = 0; i < properties.length; i++) {
        let key = properties[i];
        let val = value[key];
        let result = serialize(val);
        // if undefined, an object with a native function was found,
        // but it hasn't been found on the window yet, 
        // check its parent object in the next for loop below
        if (result === undefined) {
          success = false;
          break;
        }
        cstr += key + ':' + result + ',';
      }
      if (success) {
        if (cstr.length === 1) {
          return cstr + '}' ; // empty object
        } else {
          return cstr.substr(0,cstr.length-1) + '}';
        }
      }
      // object with property set to non-window native function found
      var windowProps = Object.getOwnPropertyNames(window);
      for (let i = 0; i <  windowProps.length; i++) {
        let prop = windowProps[i];
        if (window[prop] === value) {
          // object with native function found on window
          return prop; 
        }
      }
      // object with native function not found on window, 
      // will have to check up one level for object
      return undefined; 
    case "number":
      // Infinity, -Infinity, NaN, 1e4, 1.2e+4
      let numString = String(value);
      if (numString.search(/[a-zA-Z\+]+/g) > -1) return numString;
      // floats, integers
      return value;
    case "symbol":
      // symbol (have to add quotes back in to description)
      let ss = value.toString();
      return ss.slice(0,ss.indexOf('(')) + 
        "('" + ss.slice(ss.indexOf('(')+1,ss.lastIndexOf(')')) + "')" +
        ss.slice(ss.lastIndexOf(')')+1,ss.length);
    case "boolean":
      // boolean
      return value;
    default:
      // undefined
      if (value === undefined) return "undefined";
      // strings
      return "'" + value.replace(/'/g,"\\'") + "'";
  }
};

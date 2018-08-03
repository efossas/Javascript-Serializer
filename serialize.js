/*
  value - the variable to serialize
  LIMIT - (optional) number of chars to limit nested variables to, obviously breaks deserialize
*/
function serialize(value,LIMIT) {
  switch(typeof value) {
    case "function":
      var func = value.toString();
      if (func.search(/\[[^,'"`]+\]/g) > -1) {
	      var ROOT;
	      if(window && typeof window === "object" && Object.getPrototypeOf(window).constructor.name === "Window") {
		      ROOT = window;
	      } else if (global && typeof global === "object") {
		      ROOT = global;
	      } else {
		      // huh? someone messed with either 'window' or 'global'
		      return undefined;
	      }
        if (ROOT[value.name] === value) {
          // native function on ROOT
          return value.name; 
        } else {
          // native function not on ROOT, 
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
      // html node
      if (typeof value.nodeType === "number" && value.nodeType > 0 && value.nodeType < 13) {
        try {
          // we don't want to serialize if element has errors (it won't deserialize)
          let xml = (new XMLSerializer).serializeToString(value);
          let xmlErr = ((new DOMParser()).parseFromString(xml,'application/xml')).getElementsByTagName('parsererror');
          
          if (xmlErr.lenght < 1) {
            // parsing always wraps element in #document, which we don't want if it's not a document node, so use children[0] to extract from #document
            if (value.nodeType === 9) {
              return ("(new DOMParser()).parseFromString(`" + xml + "`,'application/xml')");
            } else {
              return ("(new DOMParser()).parseFromString(`" + xml + "`,'application/xml').children[0]");
            }
          } else {
            return "'" + (Object.getPrototypeOf(value).constructor.name + ", " + xml).replace(/\n/g,"").replace(/'/g,"\\\'") + "'";
          }
        } catch(err) {
          // do nothing, it's not an html node
        }
      }
      // iterable objects: Array, Map, Set
      if (typeof value[Symbol.iterator] === "function") {
        let cstr = '[';
        for (index of value) {
          let result = serialize(index,LIMIT);
          if (typeof LIMIT === "number" && typeof result === "string" && result.length > LIMIT) {
	          result = result.slice(0,LIMIT) + "...";
          }
          cstr += result + ',';
        }
        if (cstr.length === 1) {
          cstr = cstr + ']' ; // empty object
        } else {
          cstr = cstr.substr(0,cstr.length-1) + ']';
        }
        // use array literals for array
        if (Object.getPrototypeOf(value).constructor.name === "Array") return cstr;
        // use constructors for everything else, maps and sets
        return 'new ' + Object.getPrototypeOf(value).constructor.name + '(' + cstr + ')';
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
          // Date, ???
          arg = String(value);
        }
        return 'new ' + Object.getPrototypeOf(value).constructor.name + "('" + arg + "')";
      }

      var constructorName;
      if (Object.getPrototypeOf(value).constructor.name !== "Object") {
        // some non-iterable object with prototype that is not Object
        // technically, we can't deserialize this, so instead, we'll capture constructor name and any exposed properties
        // we'll save that in a string, so [object Example] -> "Example, { key: value }"
        constructorName = Object.getPrototypeOf(value).constructor.name;
      } else if (typeof Symbol.toStringTag !== "undefined" && typeof value[Symbol.toStringTag] === "string") {
        // native object (potentially breakable if user uses Symbol.toStringTag on non-native object)
        return value[Symbol.toStringTag];
      }   
      
      // Object
      var cstr = '{';
      var success = true;
      var properties = Object.getOwnPropertyNames(value).concat(Object.getOwnPropertySymbols(value));
      for (let i = 0; i < properties.length; i++) {
        let key = properties[i];
        let val = value[key];
        let result = serialize(val,LIMIT);
        if (typeof LIMIT === "number" && typeof result === "string" && result.length > LIMIT) {
          result = result.slice(0,LIMIT) + "...";
        }
        if (typeof key === "symbol") {
          cstr += key.toString() + ':' + result + ',';
        } else {
          cstr += key + ':' + result + ',';
        }
      }
      if (cstr.length === 1) {
        cstr = cstr + '}' ; // empty object
      } else {
        cstr = cstr.substr(0,cstr.length-1) + '}';
      }
      if (constructorName) {
        return "'" + constructorName + ", " + cstr + "'";
      } else {
        return cstr;
      }
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

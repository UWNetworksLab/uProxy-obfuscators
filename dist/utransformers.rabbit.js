
if(typeof exports == 'undefined'){
    var exports = {};
}

var rabbit = {};
rabbit.Module = function() {
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  Module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 14288;

var _stdout;
var _stdout=_stdout=allocate(1, "i32*", ALLOC_STATIC);
var _stdin;
var _stdin=_stdin=allocate(1, "i32*", ALLOC_STATIC);
var _stderr;
var _stderr=_stderr=allocate(1, "i32*", ALLOC_STATIC);

/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } });































































































































































































































var ___dso_handle;
var ___dso_handle=___dso_handle=allocate(1, "i32*", ALLOC_STATIC);








































































































































var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,64,38,0,0,246,0,0,0,146,0,0,0,64,0,0,0,150,0,0,0,8,0,0,0,10,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,80,38,0,0,246,0,0,0,240,0,0,0,64,0,0,0,150,0,0,0,8,0,0,0,26,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;






































































































































































var __ZTISt9exception;
var __ZTISt9exception=__ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);






































































































































































































































































































var __ZNSt13runtime_errorC1EPKc;
var __ZNSt13runtime_errorD1Ev;
var __ZNSt12length_errorD1Ev;
var __ZNSt3__16localeC1Ev;
var __ZNSt3__16localeC1ERKS0_;
var __ZNSt3__16localeD1Ev;
var __ZNSt8bad_castC1Ev;
var __ZNSt8bad_castD1Ev;
/* memory initializer */ allocate([32,0,0,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,116,114,117,101,0,0,0,0,58,32,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,67,0,0,0,0,0,0,0,110,97,110,0,0,0,0,0,118,101,99,116,111,114,0,0,37,46,48,76,102,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,88,32,0,0,34,0,0,0,116,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,32,0,0,194,0,0,0,160,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,32,0,0,70,0,0,0,2,1,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,32,0,0,94,0,0,0,8,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,32,0,0,94,0,0,0,22,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,32,0,0,164,0,0,0,82,0,0,0,52,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,32,0,0,250,0,0,0,186,0,0,0,52,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,32,0,0,158,0,0,0,188,0,0,0,52,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,33,0,0,252,0,0,0,136,0,0,0,52,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,33,0,0,248,0,0,0,92,0,0,0,52,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,33,0,0,156,0,0,0,108,0,0,0,52,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,33,0,0,42,0,0,0,110,0,0,0,52,0,0,0,118,0,0,0,4,0,0,0,32,0,0,0,6,0,0,0,20,0,0,0,56,0,0,0,2,0,0,0,248,255,255,255,240,33,0,0,20,0,0,0,10,0,0,0,32,0,0,0,14,0,0,0,2,0,0,0,30,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,34,0,0,238,0,0,0,222,0,0,0,52,0,0,0,18,0,0,0,16,0,0,0,60,0,0,0,26,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,24,34,0,0,62,0,0,0,100,0,0,0,112,0,0,0,120,0,0,0,88,0,0,0,42,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,34,0,0,76,0,0,0,190,0,0,0,52,0,0,0,44,0,0,0,38,0,0,0,8,0,0,0,44,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,34,0,0,62,0,0,0,66,0,0,0,52,0,0,0,40,0,0,0,76,0,0,0,12,0,0,0,56,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,34,0,0,242,0,0,0,2,0,0,0,52,0,0,0,26,0,0,0,30,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,34,0,0,50,0,0,0,208,0,0,0,52,0,0,0,42,0,0,0,14,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,34,0,0,210,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,34,0,0,32,0,0,0,134,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,34,0,0,6,0,0,0,170,0,0,0,52,0,0,0,8,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,34,0,0,98,0,0,0,20,0,0,0,52,0,0,0,20,0,0,0,24,0,0,0,34,0,0,0,22,0,0,0,22,0,0,0,8,0,0,0,6,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,34,0,0,44,0,0,0,28,0,0,0,52,0,0,0,48,0,0,0,46,0,0,0,38,0,0,0,40,0,0,0,30,0,0,0,44,0,0,0,36,0,0,0,54,0,0,0,52,0,0,0,50,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,35,0,0,56,0,0,0,4,0,0,0,52,0,0,0,76,0,0,0,70,0,0,0,64,0,0,0,66,0,0,0,58,0,0,0,68,0,0,0,62,0,0,0,28,0,0,0,74,0,0,0,72,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,35,0,0,72,0,0,0,90,0,0,0,52,0,0,0,6,0,0,0,10,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,35,0,0,30,0,0,0,172,0,0,0,52,0,0,0,16,0,0,0,14,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,35,0,0,12,0,0,0,184,0,0,0,52,0,0,0,2,0,0,0,10,0,0,0,14,0,0,0,116,0,0,0,94,0,0,0,24,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,35,0,0,176,0,0,0,128,0,0,0,52,0,0,0,14,0,0,0,16,0,0,0,18,0,0,0,48,0,0,0,8,0,0,0,20,0,0,0,84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,35,0,0,176,0,0,0,24,0,0,0,52,0,0,0,6,0,0,0,4,0,0,0,4,0,0,0,92,0,0,0,58,0,0,0,10,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,35,0,0,176,0,0,0,100,0,0,0,52,0,0,0,12,0,0,0,8,0,0,0,22,0,0,0,28,0,0,0,66,0,0,0,8,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,35,0,0,176,0,0,0,38,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,35,0,0,60,0,0,0,154,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,35,0,0,176,0,0,0,78,0,0,0,52,0,0,0,22,0,0,0,2,0,0,0,4,0,0,0,12,0,0,0,16,0,0,0,30,0,0,0,26,0,0,0,6,0,0,0,4,0,0,0,10,0,0,0,12,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,36,0,0,0,1,0,0,40,0,0,0,52,0,0,0,10,0,0,0,4,0,0,0,20,0,0,0,38,0,0,0,8,0,0,0,6,0,0,0,28,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,36,0,0,68,0,0,0,218,0,0,0,70,0,0,0,2,0,0,0,16,0,0,0,34,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,36,0,0,176,0,0,0,84,0,0,0,52,0,0,0,12,0,0,0,8,0,0,0,22,0,0,0,28,0,0,0,66,0,0,0,8,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,36,0,0,176,0,0,0,234,0,0,0,52,0,0,0,12,0,0,0,8,0,0,0,22,0,0,0,28,0,0,0,66,0,0,0,8,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,36,0,0,126,0,0,0,230,0,0,0,20,0,0,0,24,0,0,0,16,0,0,0,12,0,0,0,80,0,0,0,96,0,0,0,36,0,0,0,26,0,0,0,24,0,0,0,6,0,0,0,50,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,36,0,0,10,0,0,0,118,0,0,0,60,0,0,0,44,0,0,0,28,0,0,0,8,0,0,0,46,0,0,0,78,0,0,0,20,0,0,0,6,0,0,0,12,0,0,0,30,0,0,0,18,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,176,36,0,0,48,0,0,0,206,0,0,0,252,255,255,255,252,255,255,255,176,36,0,0,142,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,200,36,0,0,212,0,0,0,232,0,0,0,252,255,255,255,252,255,255,255,200,36,0,0,106,0,0,0,200,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,224,36,0,0,86,0,0,0,4,1,0,0,248,255,255,255,248,255,255,255,224,36,0,0,178,0,0,0,228,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,248,36,0,0,104,0,0,0,204,0,0,0,248,255,255,255,248,255,255,255,248,36,0,0,132,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,37,0,0,202,0,0,0,180,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,37,0,0,244,0,0,0,226,0,0,0,16,0,0,0,24,0,0,0,16,0,0,0,12,0,0,0,54,0,0,0,96,0,0,0,36,0,0,0,26,0,0,0,24,0,0,0,6,0,0,0,32,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,37,0,0,152,0,0,0,174,0,0,0,38,0,0,0,44,0,0,0,28,0,0,0,8,0,0,0,82,0,0,0,78,0,0,0,20,0,0,0,6,0,0,0,12,0,0,0,30,0,0,0,46,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,37,0,0,220,0,0,0,140,0,0,0,52,0,0,0,60,0,0,0,114,0,0,0,30,0,0,0,78,0,0,0,4,0,0,0,34,0,0,0,50,0,0,0,24,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,37,0,0,102,0,0,0,58,0,0,0,52,0,0,0,106,0,0,0,4,0,0,0,66,0,0,0,74,0,0,0,76,0,0,0,26,0,0,0,110,0,0,0,52,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,37,0,0,224,0,0,0,114,0,0,0,52,0,0,0,16,0,0,0,56,0,0,0,6,0,0,0,46,0,0,0,80,0,0,0,54,0,0,0,86,0,0,0,58,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,37,0,0,74,0,0,0,168,0,0,0,52,0,0,0,98,0,0,0,102,0,0,0,32,0,0,0,72,0,0,0,28,0,0,0,22,0,0,0,72,0,0,0,70,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,38,0,0,88,0,0,0,18,0,0,0,40,0,0,0,24,0,0,0,16,0,0,0,12,0,0,0,80,0,0,0,96,0,0,0,36,0,0,0,64,0,0,0,74,0,0,0,12,0,0,0,50,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,38,0,0,16,0,0,0,214,0,0,0,62,0,0,0,44,0,0,0,28,0,0,0,8,0,0,0,46,0,0,0,78,0,0,0,20,0,0,0,90,0,0,0,22,0,0,0,2,0,0,0,18,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,38,0,0,246,0,0,0,196,0,0,0,64,0,0,0,150,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,38,0,0,198,0,0,0,182,0,0,0,40,0,0,0,48,0,0,0,10,0,0,0,14,0,0,0,28,0,0,0,8,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,49,55,82,97,98,98,105,116,84,114,97,110,115,102,111,114,109,101,114,0,0,0,0,0,49,49,84,114,97,110,115,102,111,114,109,101,114,0,0,0,0,0,0,0,144,20,0,0,0,0,0,0,160,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,20,0,0,152,32,0,0,0,0,0,0,0,0,0,0,240,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,48,20,0,0,24,21,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,88,37,0,0,0,0,0,0,48,20,0,0,96,21,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,96,37,0,0,0,0,0,0,48,20,0,0,168,21,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,104,37,0,0,0,0,0,0,48,20,0,0,240,21,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,112,37,0,0,0,0,0,0,0,0,0,0,56,22,0,0,160,34,0,0,0,0,0,0,0,0,0,0,104,22,0,0,160,34,0,0,0,0,0,0,48,20,0,0,152,22,0,0,0,0,0,0,1,0,0,0,152,36,0,0,0,0,0,0,48,20,0,0,176,22,0,0,0,0,0,0,1,0,0,0,152,36,0,0,0,0,0,0,48,20,0,0,200,22,0,0,0,0,0,0,1,0,0,0,160,36,0,0,0,0,0,0,48,20,0,0,224,22,0,0,0,0,0,0,1,0,0,0,160,36,0,0,0,0,0,0,48,20,0,0,248,22,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,8,38,0,0,0,8,0,0,48,20,0,0,64,23,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,8,38,0,0,0,8,0,0,48,20,0,0,136,23,0,0,0,0,0,0,3,0,0,0,216,35,0,0,2,0,0,0,168,32,0,0,2,0,0,0,56,36,0,0,0,8,0,0,48,20,0,0,208,23,0,0,0,0,0,0,3,0,0,0,216,35,0,0,2,0,0,0,168,32,0,0,2,0,0,0,64,36,0,0,0,8,0,0,0,0,0,0,24,24,0,0,216,35,0,0,0,0,0,0,0,0,0,0,48,24,0,0,216,35,0,0,0,0,0,0,48,20,0,0,72,24,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,168,36,0,0,2,0,0,0,48,20,0,0,96,24,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,168,36,0,0,2,0,0,0,0,0,0,0,120,24,0,0,0,0,0,0,144,24,0,0,16,37,0,0,0,0,0,0,48,20,0,0,176,24,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,80,33,0,0,0,0,0,0,48,20,0,0,248,24,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,104,33,0,0,0,0,0,0,48,20,0,0,64,25,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,128,33,0,0,0,0,0,0,48,20,0,0,136,25,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,152,33,0,0,0,0,0,0,0,0,0,0,208,25,0,0,216,35,0,0,0,0,0,0,0,0,0,0,232,25,0,0,216,35,0,0,0,0,0,0,48,20,0,0,0,26,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,32,37,0,0,2,0,0,0,48,20,0,0,40,26,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,32,37,0,0,2,0,0,0,48,20,0,0,80,26,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,32,37,0,0,2,0,0,0,48,20,0,0,120,26,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,32,37,0,0,2,0,0,0,0,0,0,0,160,26,0,0,144,36,0,0,0,0,0,0,0,0,0,0,184,26,0,0,216,35,0,0,0,0,0,0,48,20,0,0,208,26,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,0,38,0,0,2,0,0,0,48,20,0,0,232,26,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,0,38,0,0,2,0,0,0,0,0,0,0,0,27,0,0,0,0,0,0,40,27,0,0,0,0,0,0,80,27,0,0,40,37,0,0,0,0,0,0,0,0,0,0,112,27,0,0,184,35,0,0,0,0,0,0,0,0,0,0,152,27,0,0,184,35,0,0,0,0,0,0,0,0,0,0,192,27,0,0,0,0,0,0,248,27,0,0,0,0,0,0,48,28,0,0,0,0,0,0,80,28,0,0,0,0,0,0,112,28,0,0,0,0,0,0,144,28,0,0,0,0,0,0,176,28,0,0,48,20,0,0,200,28,0,0,0,0,0,0,1,0,0,0,48,33,0,0,3,244,255,255,48,20,0,0,248,28,0,0,0,0,0,0,1,0,0,0,64,33,0,0,3,244,255,255,48,20,0,0,40,29,0,0,0,0,0,0,1,0,0,0,48,33,0,0,3,244,255,255,48,20,0,0,88,29,0,0,0,0,0,0,1,0,0,0,64,33,0,0,3,244,255,255,0,0,0,0,136,29,0,0,120,32,0,0,0,0,0,0,0,0,0,0,160,29,0,0,0,0,0,0,184,29,0,0,136,36,0,0,0,0,0,0,0,0,0,0,208,29,0,0,120,36,0,0,0,0,0,0,0,0,0,0,240,29,0,0,128,36,0,0,0,0,0,0,0,0,0,0,16,30,0,0,0,0,0,0,48,30,0,0,0,0,0,0,80,30,0,0,0,0,0,0,112,30,0,0,48,20,0,0,144,30,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,248,37,0,0,2,0,0,0,48,20,0,0,176,30,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,248,37,0,0,2,0,0,0,48,20,0,0,208,30,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,248,37,0,0,2,0,0,0,48,20,0,0,240,30,0,0,0,0,0,0,2,0,0,0,216,35,0,0,2,0,0,0,248,37,0,0,2,0,0,0,0,0,0,0,16,31,0,0,0,0,0,0,40,31,0,0,0,0,0,0,64,31,0,0,0,0,0,0,88,31,0,0,120,36,0,0,0,0,0,0,0,0,0,0,112,31,0,0,128,36,0,0,0,0,0,0,0,0,0,0,136,31,0,0,80,38,0,0,0,0,0,0,0,0,0,0,176,31,0,0,80,38,0,0,0,0,0,0,0,0,0,0,216,31,0,0,96,38,0,0,0,0,0,0,0,0,0,0,0,32,0,0,80,32,0,0,0,0,0,0,0,0,0,0,40,32,0,0,128,38,0,0,0,0,0,0,0,0,0,0,64,32,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___gxx_personality_v0() {
    }

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr - ___cxa_exception_header_size);
      } catch(e) { // XXX FIXME
      }
    }

  function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

  
   
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;

  var _llvm_memset_p0i8_i64=_memset;

  function _abort() {
      Module['abort']();
    }

  var _llvm_va_start=undefined;

  function _llvm_va_end() {}

   
  Module["_strlen"] = _strlen;

  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;

  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }

  
  
  function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }

  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }

  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
                if (next === 0) return i > 0 ? fields : fields-1; // we failed to read the full length of this field
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }

  function _pthread_mutex_lock() {}

  function _pthread_mutex_unlock() {}

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }

  function ___cxa_guard_release() {}

  function _pthread_cond_broadcast() {
      return 0;
    }

  function _pthread_cond_wait() {
      return 0;
    }

  
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;

  function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Call destructor if one is registered then clear it.
      var ptr = ___cxa_caught_exceptions.pop();
      if (ptr) {
        header = ptr - ___cxa_exception_header_size;
        var destructor = HEAP32[(((header)+(4))>>2)];
        if (destructor) {
          Runtime.dynCall('vi', destructor, [ptr]);
          HEAP32[(((header)+(4))>>2)]=0;
        }
        ___cxa_free_exception(ptr);
        ___cxa_last_thrown_exception = 0;
      }
    }



  function __ZNSt9exceptionD2Ev() {}

  function ___errno_location() {
      return ___errno_state;
    }

  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }

  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      var ptr = ___cxa_caught_exceptions.pop();
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function ___cxa_guard_abort() {}

  
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }function _isxdigit_l(chr) {
      return _isxdigit(chr); // no locale support yet
    }

  
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }function _isdigit_l(chr) {
      return _isdigit(chr); // no locale support yet
    }

  function _catopen(name, oflag) {
      // nl_catd catopen (const char *name, int oflag)
      return -1;
    }

  function _catgets(catd, set_id, msg_id, s) {
      // char *catgets (nl_catd catd, int set_id, int msg_id, const char *s)
      return s;
    }

  function _catclose(catd) {
      // int catclose (nl_catd catd)
      return 0;
    }

  function _newlocale(mask, locale, base) {
      return _malloc(4);
    }

  function _freelocale(locale) {
      _free(locale);
    }

  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i];
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  
  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  
  
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
  
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
  
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
  
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }function _strtoull_l(str, endptr, base) {
      return _strtoull(str, endptr, base); // no locale support yet
    }

  
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }function _strtoll_l(str, endptr, base) {
      return _strtoll(str, endptr, base); // no locale support yet
    }

  function _uselocale(locale) {
      return 0;
    }

  
  
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }

  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }

  var _fabs=Math_abs;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }

  
  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }var _copysignl=_copysign;

  
  function _fmod(x, y) {
      return x % y;
    }var _fmodl=_fmod;






  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env._stdout|0;var t=env.__ZTISt9exception|0;var u=env.___dso_handle|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ba=global.Math.atan;var ca=global.Math.atan2;var da=global.Math.exp;var ea=global.Math.log;var fa=global.Math.ceil;var ga=global.Math.imul;var ha=env.abort;var ia=env.assert;var ja=env.asmPrintInt;var ka=env.asmPrintFloat;var la=env.min;var ma=env.invoke_viiiii;var na=env.invoke_viiiiiii;var oa=env.invoke_vi;var pa=env.invoke_vii;var qa=env.invoke_iii;var ra=env.invoke_iiii;var sa=env.invoke_viiiiiid;var ta=env.invoke_ii;var ua=env.invoke_viii;var va=env.invoke_viiiiid;var wa=env.invoke_v;var xa=env.invoke_iiiiiiiii;var ya=env.invoke_viiiiiiiii;var za=env.invoke_viiiiiiii;var Aa=env.invoke_viiiiii;var Ba=env.invoke_iiiii;var Ca=env.invoke_iiiiii;var Da=env.invoke_viiii;var Ea=env._llvm_lifetime_end;var Fa=env.__scanString;var Ga=env._pthread_mutex_lock;var Ha=env.___cxa_end_catch;var Ia=env._strtoull;var Ja=env._fflush;var Ka=env.__isLeapYear;var La=env._fwrite;var Ma=env._send;var Na=env._isspace;var Oa=env._read;var Pa=env._isxdigit_l;var Qa=env._fileno;var Ra=env.___cxa_guard_abort;var Sa=env._newlocale;var Ta=env.___gxx_personality_v0;var Ua=env._pthread_cond_wait;var Va=env.___cxa_rethrow;var Wa=env._fmod;var Xa=env.___resumeException;var Ya=env._llvm_va_end;var Za=env._vsscanf;var _a=env._snprintf;var $a=env._fgetc;var ab=env.__getFloat;var bb=env._atexit;var cb=env.___cxa_free_exception;var db=env._isdigit_l;var eb=env.___setErrNo;var fb=env._isxdigit;var gb=env._exit;var hb=env._sprintf;var ib=env.___ctype_b_loc;var jb=env._freelocale;var kb=env._catgets;var lb=env._asprintf;var mb=env.___cxa_is_number_type;var nb=env.___cxa_does_inherit;var ob=env.___cxa_guard_acquire;var pb=env.___cxa_begin_catch;var qb=env._emscripten_memcpy_big;var rb=env._recv;var sb=env.__parseInt64;var tb=env.__ZSt18uncaught_exceptionv;var ub=env.__ZNSt9exceptionD2Ev;var vb=env._mkport;var wb=env._copysign;var xb=env.__exit;var yb=env._strftime;var zb=env.___cxa_throw;var Ab=env._pread;var Bb=env._strtoull_l;var Cb=env.__arraySum;var Db=env._strtoll_l;var Eb=env.___cxa_find_matching_catch;var Fb=env.__formatString;var Gb=env._pthread_cond_broadcast;var Hb=env.__ZSt9terminatev;var Ib=env._pthread_mutex_unlock;var Jb=env.___cxa_call_unexpected;var Kb=env._sbrk;var Lb=env.___errno_location;var Mb=env._strerror;var Nb=env._catclose;var Ob=env._llvm_lifetime_start;var Pb=env.___cxa_guard_release;var Qb=env._ungetc;var Rb=env._uselocale;var Sb=env._vsnprintf;var Tb=env._sscanf;var Ub=env._sysconf;var Vb=env._fread;var Wb=env._strftime_l;var Xb=env._abort;var Yb=env._isdigit;var Zb=env._strtoll;var _b=env.__addDays;var $b=env._fabs;var ac=env.__reallyNegative;var bc=env._write;var cc=env.___cxa_allocate_exception;var dc=env._vasprintf;var ec=env._catopen;var fc=env.___ctype_toupper_loc;var gc=env.___ctype_tolower_loc;var hc=env._pwrite;var ic=env._strerror_r;var jc=env._time;var kc=0.0;
// EMSCRIPTEN_START_FUNCS
function Dc(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Ec(){return i|0}function Fc(a){a=a|0;i=a}function Gc(a,b){a=a|0;b=b|0;if((x|0)==0){x=a;y=b}}function Hc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Ic(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Jc(a){a=a|0;K=a}function Kc(a){a=a|0;L=a}function Lc(a){a=a|0;M=a}function Mc(a){a=a|0;N=a}function Nc(a){a=a|0;O=a}function Oc(a){a=a|0;P=a}function Pc(a){a=a|0;Q=a}function Qc(a){a=a|0;R=a}function Rc(a){a=a|0;S=a}function Sc(a){a=a|0;T=a}function Tc(){c[2068]=p+8;c[2070]=q+8;c[2072]=t;c[2074]=q+8;c[2076]=t;c[2078]=q+8;c[2080]=t;c[2082]=q+8;c[2086]=q+8;c[2088]=t;c[2090]=p+8;c[2124]=q+8;c[2128]=q+8;c[2192]=q+8;c[2196]=q+8;c[2216]=p+8;c[2218]=q+8;c[2254]=q+8;c[2258]=q+8;c[2294]=q+8;c[2298]=q+8;c[2318]=p+8;c[2320]=p+8;c[2322]=q+8;c[2326]=q+8;c[2330]=q+8;c[2334]=p+8;c[2336]=p+8;c[2338]=p+8;c[2340]=p+8;c[2342]=p+8;c[2344]=p+8;c[2346]=p+8;c[2372]=q+8;c[2376]=p+8;c[2378]=q+8;c[2382]=q+8;c[2386]=q+8;c[2390]=p+8;c[2392]=p+8;c[2394]=p+8;c[2396]=p+8;c[2430]=p+8;c[2432]=p+8;c[2434]=p+8;c[2436]=q+8;c[2440]=q+8;c[2444]=q+8;c[2448]=q+8;c[2452]=q+8;c[2456]=q+8;c[2460]=q+8;c[2464]=p+8}function Uc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((e|0)!=16){i=0;return i|0}e=b+152|0;g=e;i=a[g]|0;do{if((i&1)==0){if((i&1)==0){h=10;f=13}else{h=10;f=12}}else{f=c[e>>2]|0;h=(f&-2)-1|0;f=f&255;i=(f&1)==0;if(h>>>0<16>>>0){if(i){i=f;f=13;break}else{f=12;break}}if(i){f=e+1|0}else{f=c[b+160>>2]|0}en(f|0,d|0,16)|0;a[f+16|0]=0;d=a[g]|0;if((d&1)==0){a[g]=32;d=32;g=b+4|0;f=17;break}else{c[b+156>>2]=16;f=15;break}}}while(0);if((f|0)==12){i=c[b+156>>2]|0;f=14}else if((f|0)==13){i=(i&255)>>>1;f=14}if((f|0)==14){Ae(e,h,16-h|0,i,0,i,16,d);d=a[g]|0;f=15}if((f|0)==15){g=b+4|0;if((d&1)==0){f=17}else{d=c[b+156>>2]|0;e=c[b+160>>2]|0}}if((f|0)==17){d=(d&255)>>>1;e=e+1|0}ed(g,e,d,8);i=1;return i|0}function Vc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;if((f|0)!=8){k=0;return k|0}g=b+140|0;f=g;h=a[f]|0;do{if((h&1)==0){if((h&1)==0){h=7}else{h=6}}else{j=c[g>>2]|0;i=j&-2;h=i-1|0;k=(j&1|0)==0;if(!(h>>>0<8>>>0)){if(k){h=7;break}else{h=6;break}}if(k){b=j>>>1&127}else{b=c[b+144>>2]|0}Ae(g,h,9-i|0,b,0,b,8,e);k=1;return k|0}}while(0);if((h|0)==6){g=c[b+148>>2]|0}else if((h|0)==7){g=g+1|0}j=e;k=g;h=j|0;j=j+4|0;j=d[j]|d[j+1|0]<<8|d[j+2|0]<<16|d[j+3|0]<<24|0;i=k|0;C=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;a[i]=C;C=C>>8;a[i+1|0]=C;C=C>>8;a[i+2|0]=C;C=C>>8;a[i+3|0]=C;k=k+4|0;C=j;a[k]=C;C=C>>8;a[k+1|0]=C;C=C>>8;a[k+2|0]=C;C=C>>8;a[k+3|0]=C;a[g+8|0]=0;if((a[f]&1)==0){a[f]=16;k=1;return k|0}else{c[b+144>>2]=8;k=1;return k|0}return 0}function Wc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+16|0;h=j|0;k=b+140|0;g=k;l=a[g]|0;if((l&1)==0){l=(l&255)>>>1;m=k+1|0}else{l=c[b+144>>2]|0;m=c[b+148>>2]|0}if((l|0)==8){gd(b+4|0,m);n=8}else{n=0}o=n+e|0;l=h;dn(l|0,0,12)|0;if((o|0)==0){a[h+1+o|0]=0;a[l]=o<<1}else{we(h,o,0)|0}if((a[l]&1)==0){o=h+1|0}else{o=c[h+8>>2]|0}if((n|0)!=0){cn(o|0,m|0,n)|0;o=o+n|0}hd(b+4|0,0,d,o,e);d=c[f>>2]|0;e=f+4|0;m=c[e>>2]|0;if((m|0)!=(d|0)){do{n=m-12|0;c[e>>2]=n;if((a[n]&1)==0){m=n}else{Pm(c[m-12+8>>2]|0);m=c[e>>2]|0}}while((m|0)!=(d|0))}if((d|0)==(c[f+8>>2]|0)){cd(f,h)}else{do{if((d|0)!=0){if((a[l]&1)==0){o=d;c[o>>2]=c[l>>2];c[o+4>>2]=c[l+4>>2];c[o+8>>2]=c[l+8>>2];break}m=c[h+8>>2]|0;f=c[h+4>>2]|0;if(f>>>0>4294967279>>>0){pe(0);return 0}if(f>>>0<11>>>0){a[d]=f<<1;d=d+1|0}else{n=f+16&-16;o=Nm(n)|0;c[d+8>>2]=o;c[d>>2]=n|1;c[d+4>>2]=f;d=o}cn(d|0,m|0,f)|0;a[d+f|0]=0}}while(0);c[e>>2]=(c[e>>2]|0)+12}if((a[g]&1)==0){a[k+1|0]=0;a[g]=0}else{a[c[b+148>>2]|0]=0;c[b+144>>2]=0}if((a[l]&1)==0){i=j;return 1}Pm(c[h+8>>2]|0);i=j;return 1}function Xc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=c[d>>2]|0;d=d+4|0;g=c[d>>2]|0;if((g|0)!=(e|0)){while(1){f=g-12|0;c[d>>2]=f;if(!((a[f]&1)==0)){Pm(c[g-12+8>>2]|0);f=c[d>>2]|0}if((f|0)==(e|0)){break}else{g=f}}}e=b+4|0;d=b+152|0;f=a[d]|0;if((f&1)==0){g=(f&255)>>>1;f=d+1|0;ed(e,f,g,8);return 1}else{g=c[b+156>>2]|0;f=c[b+160>>2]|0;ed(e,f,g,8);return 1}return 0}function Yc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;b=b+4|0;gd(b,d);g=e-8|0;e=f;i=a[e]|0;h=(i&1)==0;if(h){i=(i&255)>>>1}else{i=c[f+4>>2]|0}do{if(!(i>>>0<g>>>0)){if(h){a[f+1+g|0]=0;a[e]=g<<1;break}else{a[(c[f+8>>2]|0)+g|0]=0;c[f+4>>2]=g;break}}else{we(f,g-i|0,0)|0}}while(0);if((a[e]&1)==0){i=f+1|0;h=d+8|0;hd(b,1,h,i,g);return 1}else{i=c[f+8>>2]|0;h=d+8|0;hd(b,1,h,i,g);return 1}return 0}function Zc(){var a=0,b=0,d=0,e=0,f=0;b=c[2]|0;if((b|0)>0){d=0}else{f=-1;return f|0}while(1){e=9904+(d<<2)|0;f=d+1|0;if((c[e>>2]|0)==0){break}if((f|0)<(b|0)){d=f}else{b=-1;a=5;break}}if((a|0)==5){return b|0}f=Nm(164)|0;c[f>>2]=5216;dn(f+140|0,0,24)|0;c[e>>2]=f;f=d;return f|0}function _c(b){b=b|0;c[b>>2]=5216;if(!((a[b+152|0]&1)==0)){Pm(c[b+160>>2]|0)}if((a[b+140|0]&1)==0){return}Pm(c[b+148>>2]|0);return}function $c(b){b=b|0;c[b>>2]=5216;if(!((a[b+152|0]&1)==0)){Pm(c[b+160>>2]|0)}if((a[b+140|0]&1)==0){Pm(b);return}Pm(c[b+148>>2]|0);Pm(b);return}function ad(a,b,c){a=a|0;b=b|0;c=c|0;return 1}function bd(a,b){a=a|0;b=b|0;return 0}function cd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+24|0;f=e|0;j=b+8|0;l=c[b>>2]|0;g=((c[b+4>>2]|0)-l|0)/12|0;k=g+1|0;if(k>>>0>357913941>>>0){Pj(0)}l=((c[b+8>>2]|0)-l|0)/12|0;if(l>>>0<178956970>>>0){l=l<<1;n=l>>>0<k>>>0?k:l;o=f+12|0;c[o>>2]=0;c[f+16>>2]=j;if((n|0)==0){k=0;n=0}else{h=6}}else{o=f+12|0;c[o>>2]=0;c[f+16>>2]=j;n=357913941;h=6}if((h|0)==6){k=Nm(n*12|0)|0}j=f|0;c[j>>2]=k;m=k+(g*12|0)|0;h=f+8|0;c[h>>2]=m;l=f+4|0;c[l>>2]=m;c[o>>2]=k+(n*12|0);do{if((m|0)==0){m=0}else{n=d;if((a[n]&1)==0){o=m;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2];break}n=c[d+8>>2]|0;d=c[d+4>>2]|0;if(d>>>0>4294967279>>>0){pe(0)}if(d>>>0<11>>>0){a[m]=d<<1;g=m+1|0}else{p=d+16&-16;o=Nm(p)|0;c[k+(g*12|0)+8>>2]=o;c[m>>2]=p|1;c[k+(g*12|0)+4>>2]=d;g=o}cn(g|0,n|0,d)|0;a[g+d|0]=0;m=c[h>>2]|0}}while(0);c[h>>2]=m+12;dd(b,f);b=c[l>>2]|0;f=c[h>>2]|0;if((f|0)!=(b|0)){while(1){g=f-12|0;c[h>>2]=g;if(!((a[g]&1)==0)){Pm(c[f-12+8>>2]|0)}if((g|0)==(b|0)){break}else{f=g}}}b=c[j>>2]|0;if((b|0)==0){i=e;return}Pm(b);i=e;return}function dd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=b|0;j=c[f>>2]|0;g=b+4|0;l=c[g>>2]|0;i=d+4|0;m=c[i>>2]|0;do{if((l|0)!=(j|0)){while(1){o=m-12|0;k=l-12|0;n=k;if((a[n]&1)==0){c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2]}else{n=c[l-12+8>>2]|0;l=c[l-12+4>>2]|0;if(l>>>0>4294967279>>>0){j=5;break}if(l>>>0<11>>>0){a[o]=l<<1;m=o+1|0}else{q=l+16&-16;p=Nm(q)|0;c[m-12+8>>2]=p;c[o>>2]=q|1;c[m-12+4>>2]=l;m=p}cn(m|0,n|0,l)|0;a[m+l|0]=0}m=(c[i>>2]|0)-12|0;c[i>>2]=m;if((k|0)==(j|0)){j=11;break}else{l=k}}if((j|0)==5){pe(0)}else if((j|0)==11){h=c[f>>2]|0;e=m;break}}else{h=j;e=m}}while(0);c[f>>2]=e;c[i>>2]=h;o=d+8|0;q=c[g>>2]|0;c[g>>2]=c[o>>2];c[o>>2]=q;o=b+8|0;q=d+12|0;p=c[o>>2]|0;c[o>>2]=c[q>>2];c[q>>2]=p;c[d>>2]=c[i>>2];return}function ed(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+16|0;w=e|0;cn(w|0,b|0,d)|0;b=c[c[w>>2]>>2]|0;g=c[c[w+4>>2]>>2]|0;v=c[c[w+8>>2]>>2]|0;w=c[c[w+12>>2]>>2]|0;t=a|0;u=a|0;c[u>>2]=b;q=a+8|0;c[q>>2]=g;m=a+16|0;c[m>>2]=v;h=a+24|0;c[h>>2]=w;y=w<<16;n=v>>>16;s=a+4|0;c[s>>2]=y|n;x=b<<16;j=w>>>16;o=a+12|0;c[o>>2]=j|x;l=g<<16;d=b>>>16;k=a+20|0;c[k>>2]=l|d;z=v<<16;p=g>>>16;f=a+28|0;c[f>>2]=z|p;r=a+32|0;c[r>>2]=z|n;n=a+40|0;c[n>>2]=y|j;j=a+48|0;c[j>>2]=x|d;d=a+56|0;c[d>>2]=l|p;p=a+36|0;c[p>>2]=g&65535|b&-65536;l=a+44|0;c[l>>2]=v&65535|g&-65536;g=a+52|0;c[g>>2]=w&65535|v&-65536;v=a+60|0;c[v>>2]=w&-65536|b&65535;b=a+64|0;c[b>>2]=0;fd(t);fd(t);fd(t);fd(t);m=c[m>>2]|0;t=c[r>>2]^m;c[r>>2]=t;k=c[k>>2]|0;r=c[p>>2]^k;c[p>>2]=r;h=c[h>>2]|0;p=c[n>>2]^h;c[n>>2]=p;f=c[f>>2]|0;n=c[l>>2]^f;c[l>>2]=n;u=c[u>>2]|0;l=c[j>>2]^u;c[j>>2]=l;s=c[s>>2]|0;j=c[g>>2]^s;c[g>>2]=j;q=c[q>>2]|0;g=c[d>>2]^q;c[d>>2]=g;o=c[o>>2]|0;d=c[v>>2]^o;c[v>>2]=d;c[a+68>>2]=u;c[a+100>>2]=t;c[a+72>>2]=s;c[a+104>>2]=r;c[a+76>>2]=q;c[a+108>>2]=p;c[a+80>>2]=o;c[a+112>>2]=n;c[a+84>>2]=m;c[a+116>>2]=l;c[a+88>>2]=k;c[a+120>>2]=j;c[a+92>>2]=h;c[a+124>>2]=g;c[a+96>>2]=f;c[a+128>>2]=d;c[a+132>>2]=c[b>>2];i=e;return}function fd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+64|0;b=d|0;g=d+32|0;j=a+32|0;cn(g|0,j|0,32)|0;e=a+64|0;f=(c[j>>2]|0)+1295307597+(c[e>>2]|0)|0;c[j>>2]=f;j=a+36|0;h=(c[j>>2]|0)-749914925+(f>>>0<(c[g>>2]|0)>>>0)|0;c[j>>2]=h;j=a+40|0;h=(c[j>>2]|0)+886263092+(h>>>0<(c[g+4>>2]|0)>>>0)|0;c[j>>2]=h;j=a+44|0;h=(c[j>>2]|0)+1295307597+(h>>>0<(c[g+8>>2]|0)>>>0)|0;c[j>>2]=h;j=a+48|0;h=(c[j>>2]|0)-749914925+(h>>>0<(c[g+12>>2]|0)>>>0)|0;c[j>>2]=h;j=a+52|0;h=(c[j>>2]|0)+886263092+(h>>>0<(c[g+16>>2]|0)>>>0)|0;c[j>>2]=h;j=a+56|0;h=(c[j>>2]|0)+1295307597+(h>>>0<(c[g+20>>2]|0)>>>0)|0;c[j>>2]=h;j=a+60|0;h=(c[j>>2]|0)-749914925+(h>>>0<(c[g+24>>2]|0)>>>0)|0;c[j>>2]=h;c[e>>2]=h>>>0<(c[g+28>>2]|0)>>>0;e=0;while(1){f=f+(c[a+(e<<2)>>2]|0)|0;h=f&65535;j=f>>>16;c[b+(e<<2)>>2]=((((ga(h,h)|0)>>>17)+(ga(h,j)|0)|0)>>>15)+(ga(j,j)|0)^(ga(f,f)|0);f=e+1|0;if(!(f>>>0<8>>>0)){break}e=f;f=c[a+32+(f<<2)>>2]|0}e=c[b>>2]|0;h=c[b+28>>2]|0;j=c[b+24>>2]|0;c[a>>2]=(h<<16|h>>>16)+e+(j<<16|j>>>16);f=c[b+4>>2]|0;c[a+4>>2]=h+f+(e<<8|e>>>24);g=c[b+8>>2]|0;c[a+8>>2]=(f<<16|f>>>16)+g+(e<<16|e>>>16);e=c[b+12>>2]|0;c[a+12>>2]=f+e+(g<<8|g>>>24);f=c[b+16>>2]|0;c[a+16>>2]=(e<<16|e>>>16)+f+(g<<16|g>>>16);g=c[b+20>>2]|0;c[a+20>>2]=e+g+(f<<8|f>>>24);c[a+24>>2]=(g<<16|g>>>16)+j+(f<<16|f>>>16);c[a+28>>2]=g+h+(j<<8|j>>>24);i=d;return}function gd(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;g=b;e=b+4|0;g=c[(d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24)>>2]|0;e=c[(d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24)>>2]|0;f=e&-65536|g>>>16;b=e<<16|g&65535;c[a+100>>2]=c[a+32>>2]^g;c[a+104>>2]=c[a+36>>2]^f;c[a+108>>2]=c[a+40>>2]^e;c[a+112>>2]=c[a+44>>2]^b;c[a+116>>2]=c[a+48>>2]^g;c[a+120>>2]=c[a+52>>2]^f;c[a+124>>2]=c[a+56>>2]^e;c[a+128>>2]=c[a+60>>2]^b;c[a+68>>2]=c[a>>2];c[a+72>>2]=c[a+4>>2];c[a+76>>2]=c[a+8>>2];c[a+80>>2]=c[a+12>>2];c[a+84>>2]=c[a+16>>2];c[a+88>>2]=c[a+20>>2];c[a+92>>2]=c[a+24>>2];c[a+96>>2]=c[a+28>>2];b=a+68|0;c[a+132>>2]=c[a+64>>2];fd(b);fd(b);fd(b);fd(b);return}function hd(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=i;i=i+16|0;d=h|0;if(g>>>0>15>>>0){n=b+68|0;o=n|0;p=b+88|0;q=b+80|0;r=b+76|0;m=b+96|0;l=b+84|0;k=b+72|0;j=b+92|0;do{fd(n);c[f>>2]=c[o>>2]^c[e>>2]^(c[p>>2]|0)>>>16^c[q>>2]<<16;c[f+4>>2]=c[r>>2]^c[e+4>>2]^(c[m>>2]|0)>>>16^c[p>>2]<<16;c[f+8>>2]=c[l>>2]^c[e+8>>2]^(c[k>>2]|0)>>>16^c[m>>2]<<16;c[f+12>>2]=c[j>>2]^c[e+12>>2]^(c[q>>2]|0)>>>16^c[k>>2]<<16;e=e+16|0;f=f+16|0;g=g-16|0}while(g>>>0>15>>>0)}if((g|0)==0){i=h;return}p=b+68|0;fd(p);r=c[b+88>>2]|0;q=c[b+80>>2]|0;c[d>>2]=r>>>16^c[p>>2]^q<<16;p=c[b+96>>2]|0;c[d+4>>2]=p>>>16^c[b+76>>2]^r<<16;r=c[b+72>>2]|0;c[d+8>>2]=r>>>16^c[b+84>>2]^p<<16;c[d+12>>2]=q>>>16^c[b+92>>2]^r<<16;b=0;do{a[f+b|0]=a[d+b|0]^a[e+b|0];b=b+1|0}while(b>>>0<g>>>0);i=h;return}function id(a){a=a|0;var b=0;if(a>>>0>31>>>0){b=-1;return b|0}a=9904+(a<<2)|0;b=c[a>>2]|0;if((b|0)!=0){nc[c[(c[b>>2]|0)+4>>2]&511](b)}c[a>>2]=0;b=0;return b|0}function jd(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;k=h|0;if(b>>>0>31>>>0){m=-1;i=h;return m|0}l=c[9904+(b<<2)>>2]|0;if((l|0)==0){m=-1;i=h;return m|0}j=k|0;c[j>>2]=0;b=k+4|0;c[b>>2]=0;c[k+8>>2]=0;do{if(Ac[c[(c[l>>2]|0)+20>>2]&15](l,d,e,k)|0){d=c[j>>2]|0;e=d;k=a[e]|0;l=(k&1)==0;if(l){m=(k&255)>>>1}else{m=c[d+4>>2]|0}if(m>>>0>(c[g>>2]|0)>>>0){if(l){f=(k&255)>>>1}else{f=c[d+4>>2]|0}c[g>>2]=f;g=-1;break}if(l){k=(k&255)>>>1;l=d+1|0}else{k=c[d+4>>2]|0;l=c[d+8>>2]|0}cn(f|0,l|0,k)|0;f=a[e]|0;if((f&1)==0){f=(f&255)>>>1}else{f=c[d+4>>2]|0}c[g>>2]=f;g=0}else{c[g>>2]=0;g=-1;d=c[j>>2]|0}}while(0);if((d|0)==0){m=g;i=h;return m|0}e=c[b>>2]|0;if((e|0)!=(d|0)){while(1){f=e-12|0;c[b>>2]=f;if(!((a[f]&1)==0)){Pm(c[e-12+8>>2]|0);f=c[b>>2]|0}if((f|0)==(d|0)){break}else{e=f}}d=c[j>>2]|0}Pm(d);m=g;i=h;return m|0}function kd(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;j=i;i=i+16|0;h=j|0;if(b>>>0>31>>>0){k=-1;i=j;return k|0}k=c[9904+(b<<2)>>2]|0;if((k|0)==0){k=-1;i=j;return k|0}b=h;dn(b|0,0,12)|0;do{if(Ac[c[(c[k>>2]|0)+28>>2]&15](k,d,e,h)|0){d=a[b]|0;e=(d&1)==0;if(e){b=(d&255)>>>1}else{b=c[h+4>>2]|0}if(b>>>0>(c[g>>2]|0)>>>0){if(e){g=(d&255)>>>1;break}else{g=c[h+4>>2]|0;break}}if(e){cn(f|0,h+1|0,(d&255)>>>1)|0;f=(d&255)>>>1}else{cn(f|0,c[h+8>>2]|0,c[h+4>>2]|0)|0;f=c[h+4>>2]|0}c[g>>2]=f;g=0}else{c[g>>2]=0;g=-1;d=a[b]|0}}while(0);if((d&1)==0){k=g;i=j;return k|0}Pm(c[h+8>>2]|0);k=g;i=j;return k|0}function ld(a,b,d){a=a|0;b=b|0;d=d|0;if(a>>>0>31>>>0){a=-1;return a|0}a=c[9904+(a<<2)>>2]|0;if((a|0)==0){a=-1;return a|0}a=((qc[c[(c[a>>2]|0)+8>>2]&63](a,b,d)|0)^1)<<31>>31;return a|0}function md(a,b,d){a=a|0;b=b|0;d=d|0;if(a>>>0>31>>>0){a=-1;return a|0}a=c[9904+(a<<2)>>2]|0;if((a|0)==0){a=-1;return a|0}a=((qc[c[(c[a>>2]|0)+12>>2]&63](a,b,d)|0)^1)<<31>>31;return a|0}function nd(a,b,d){a=a|0;b=b|0;d=d|0;if(a>>>0>31>>>0){a=-1;return a|0}a=c[9904+(a<<2)>>2]|0;if((a|0)==0){a=-1;return a|0}a=((qc[c[(c[a>>2]|0)+16>>2]&63](a,b,d)|0)^1)<<31>>31;return a|0}function od(a){a=a|0;pb(a|0)|0;Hb()}function pd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;f=b|0;h=b+8|0;l=b+16|0;j=b+24|0;d=c[o>>2]|0;Ld(12976,d,13104);c[3492]=4548;c[3494]=4568;c[3493]=0;Oe(13976,12976);c[3512]=0;c[3513]=-1;g=c[s>>2]|0;c[3220]=4328;Vj(12884);dn(12888,0,24)|0;c[3220]=4696;c[3228]=g;Wj(j,12884);k=Yj(j,13304)|0;e=k;Xj(j);c[3229]=e;c[3230]=13112;a[12924]=(sc[c[(c[k>>2]|0)+28>>2]&127](e)|0)&1;c[3426]=4452;c[3427]=4472;Oe(13708,12880);c[3445]=0;c[3446]=-1;e=c[r>>2]|0;c[3232]=4328;Vj(12932);dn(12936,0,24)|0;c[3232]=4696;c[3240]=e;Wj(l,12932);k=Yj(l,13304)|0;j=k;Xj(l);c[3241]=j;c[3242]=13120;a[12972]=(sc[c[(c[k>>2]|0)+28>>2]&127](j)|0)&1;c[3470]=4452;c[3471]=4472;Oe(13884,12928);c[3489]=0;c[3490]=-1;j=c[(c[(c[3470]|0)-12>>2]|0)+13904>>2]|0;c[3448]=4452;c[3449]=4472;Oe(13796,j);c[3467]=0;c[3468]=-1;c[(c[(c[3492]|0)-12>>2]|0)+14040>>2]=13704;j=(c[(c[3470]|0)-12>>2]|0)+13884|0;c[j>>2]=c[j>>2]|8192;c[(c[(c[3470]|0)-12>>2]|0)+13952>>2]=13704;xd(12824,d,13128);c[3404]=4500;c[3406]=4520;c[3405]=0;Oe(13624,12824);c[3424]=0;c[3425]=-1;c[3182]=4256;Vj(12732);dn(12736,0,24)|0;c[3182]=4624;c[3190]=g;Wj(h,12732);g=Yj(h,13296)|0;d=g;Xj(h);c[3191]=d;c[3192]=13136;a[12772]=(sc[c[(c[g>>2]|0)+28>>2]&127](d)|0)&1;c[3334]=4404;c[3335]=4424;Oe(13340,12728);c[3353]=0;c[3354]=-1;c[3194]=4256;Vj(12780);dn(12784,0,24)|0;c[3194]=4624;c[3202]=e;Wj(f,12780);e=Yj(f,13296)|0;d=e;Xj(f);c[3203]=d;c[3204]=13144;a[12820]=(sc[c[(c[e>>2]|0)+28>>2]&127](d)|0)&1;c[3378]=4404;c[3379]=4424;Oe(13516,12776);c[3397]=0;c[3398]=-1;d=c[(c[(c[3378]|0)-12>>2]|0)+13536>>2]|0;c[3356]=4404;c[3357]=4424;Oe(13428,d);c[3375]=0;c[3376]=-1;c[(c[(c[3404]|0)-12>>2]|0)+13688>>2]=13336;d=(c[(c[3378]|0)-12>>2]|0)+13516|0;c[d>>2]=c[d>>2]|8192;c[(c[(c[3378]|0)-12>>2]|0)+13584>>2]=13336;i=b;return}function qd(a){a=a|0;uf(13704)|0;uf(13792)|0;zf(13336)|0;zf(13424)|0;return}function rd(a){a=a|0;c[a>>2]=4256;Xj(a+4|0);return}function sd(a){a=a|0;c[a>>2]=4256;Xj(a+4|0);Pm(a);return}function td(b,d){b=b|0;d=d|0;var e=0;sc[c[(c[b>>2]|0)+24>>2]&127](b)|0;e=Yj(d,13296)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(sc[c[(c[e>>2]|0)+28>>2]&127](d)|0)&1;return}function ud(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+16|0;j=b|0;d=b+8|0;e=a+36|0;f=a+40|0;g=j|0;h=j+8|0;a=a+32|0;while(1){k=c[e>>2]|0;k=Bc[c[(c[k>>2]|0)+20>>2]&31](k,c[f>>2]|0,g,h,d)|0;l=(c[d>>2]|0)-j|0;if((La(g|0,1,l|0,c[a>>2]|0)|0)!=(l|0)){e=-1;d=5;break}if((k|0)==2){e=-1;d=5;break}else if((k|0)!=1){d=4;break}}if((d|0)==4){l=((Ja(c[a>>2]|0)|0)!=0)<<31>>31;i=b;return l|0}else if((d|0)==5){i=b;return e|0}return 0}function vd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if((a[b+44|0]|0)!=0){g=La(d|0,4,e|0,c[b+32>>2]|0)|0;return g|0}f=b;if((e|0)>0){g=0}else{g=0;return g|0}while(1){if((pc[c[(c[f>>2]|0)+52>>2]&63](b,c[d>>2]|0)|0)==-1){b=6;break}g=g+1|0;if((g|0)<(e|0)){d=d+4|0}else{b=6;break}}if((b|0)==6){return g|0}return 0}function wd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;o=e|0;p=e+8|0;h=e+16|0;j=e+24|0;f=(d|0)==-1;a:do{if(!f){c[p>>2]=d;if((a[b+44|0]|0)!=0){if((La(p|0,4,1,c[b+32>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}m=o|0;c[h>>2]=m;k=p+4|0;n=b+36|0;l=b+40|0;g=o+8|0;b=b+32|0;while(1){q=c[n>>2]|0;q=wc[c[(c[q>>2]|0)+12>>2]&31](q,c[l>>2]|0,p,k,j,m,g,h)|0;if((c[j>>2]|0)==(p|0)){d=-1;g=12;break}if((q|0)==3){g=7;break}r=(q|0)==1;if(!(q>>>0<2>>>0)){d=-1;g=12;break}q=(c[h>>2]|0)-o|0;if((La(m|0,1,q|0,c[b>>2]|0)|0)!=(q|0)){d=-1;g=12;break}if(r){p=r?c[j>>2]|0:p}else{break a}}if((g|0)==7){if((La(p|0,1,1,c[b>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}else if((g|0)==12){i=e;return d|0}}}while(0);r=f?0:d;i=e;return r|0}function xd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=4256;j=b+4|0;Vj(j);dn(b+8|0,0,24)|0;c[h>>2]=5024;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Wj(g,j);j=Yj(g,13296)|0;h=j;e=b+36|0;c[e>>2]=h;d=b+44|0;c[d>>2]=sc[c[(c[j>>2]|0)+24>>2]&127](h)|0;e=c[e>>2]|0;a[b+53|0]=(sc[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;if((c[d>>2]|0)<=8){Xj(g);i=f;return}fj(120);Xj(g);i=f;return}function yd(a){a=a|0;c[a>>2]=4256;Xj(a+4|0);return}function zd(a){a=a|0;c[a>>2]=4256;Xj(a+4|0);Pm(a);return}function Ad(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;g=Yj(d,13296)|0;f=g;e=b+36|0;c[e>>2]=f;d=b+44|0;c[d>>2]=sc[c[(c[g>>2]|0)+24>>2]&127](f)|0;e=c[e>>2]|0;a[b+53|0]=(sc[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;if((c[d>>2]|0)<=8){return}fj(120);return}function Bd(a){a=a|0;return Ed(a,0)|0}function Cd(a){a=a|0;return Ed(a,1)|0}function Dd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;k=e|0;f=e+8|0;m=e+16|0;l=e+24|0;g=b+52|0;j=(a[g]|0)!=0;if((d|0)==-1){if(j){m=-1;i=e;return m|0}m=c[b+48>>2]|0;a[g]=(m|0)!=-1|0;i=e;return m|0}h=b+48|0;a:do{if(j){c[m>>2]=c[h>>2];n=c[b+36>>2]|0;j=k|0;l=wc[c[(c[n>>2]|0)+12>>2]&31](n,c[b+40>>2]|0,m,m+4|0,l,j,k+8|0,f)|0;if((l|0)==3){a[j]=c[h>>2];c[f>>2]=k+1}else if((l|0)==2|(l|0)==1){n=-1;i=e;return n|0}b=b+32|0;while(1){k=c[f>>2]|0;if(!(k>>>0>j>>>0)){break a}n=k-1|0;c[f>>2]=n;if((Qb(a[n]|0,c[b>>2]|0)|0)==-1){f=-1;break}}i=e;return f|0}}while(0);c[h>>2]=d;a[g]=1;n=d;i=e;return n|0}function Ed(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=i;i=i+32|0;f=e|0;h=e+8|0;m=e+16|0;l=e+24|0;n=b+52|0;if((a[n]|0)!=0){f=b+48|0;g=c[f>>2]|0;if(!d){w=g;i=e;return w|0}c[f>>2]=-1;a[n]=0;w=g;i=e;return w|0}n=c[b+44>>2]|0;t=(n|0)>1?n:1;a:do{if((t|0)>0){p=b+32|0;n=0;while(1){o=$a(c[p>>2]|0)|0;if((o|0)==-1){g=-1;break}a[f+n|0]=o;n=n+1|0;if((n|0)>=(t|0)){break a}}i=e;return g|0}}while(0);b:do{if((a[b+53|0]|0)==0){o=b+40|0;n=b+36|0;r=f|0;q=h+4|0;p=b+32|0;while(1){v=c[o>>2]|0;w=v;u=c[w>>2]|0;w=c[w+4>>2]|0;x=c[n>>2]|0;s=f+t|0;v=wc[c[(c[x>>2]|0)+16>>2]&31](x,v,r,s,m,h,q,l)|0;if((v|0)==3){j=14;break}else if((v|0)==2){g=-1;j=22;break}else if((v|0)!=1){k=t;break b}x=c[o>>2]|0;c[x>>2]=u;c[x+4>>2]=w;if((t|0)==8){g=-1;j=22;break}u=$a(c[p>>2]|0)|0;if((u|0)==-1){g=-1;j=22;break}a[s]=u;t=t+1|0}if((j|0)==14){c[h>>2]=a[r]|0;k=t;break}else if((j|0)==22){i=e;return g|0}}else{c[h>>2]=a[f|0]|0;k=t}}while(0);if(d){x=c[h>>2]|0;c[b+48>>2]=x;i=e;return x|0}d=b+32|0;while(1){if((k|0)<=0){break}k=k-1|0;if((Qb(a[f+k|0]|0,c[d>>2]|0)|0)==-1){g=-1;j=22;break}}if((j|0)==22){i=e;return g|0}x=c[h>>2]|0;i=e;return x|0}function Fd(a){a=a|0;c[a>>2]=4328;Xj(a+4|0);return}function Gd(a){a=a|0;c[a>>2]=4328;Xj(a+4|0);Pm(a);return}function Hd(b,d){b=b|0;d=d|0;var e=0;sc[c[(c[b>>2]|0)+24>>2]&127](b)|0;e=Yj(d,13304)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(sc[c[(c[e>>2]|0)+28>>2]&127](d)|0)&1;return}function Id(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+16|0;j=b|0;d=b+8|0;e=a+36|0;f=a+40|0;g=j|0;h=j+8|0;a=a+32|0;while(1){k=c[e>>2]|0;k=Bc[c[(c[k>>2]|0)+20>>2]&31](k,c[f>>2]|0,g,h,d)|0;l=(c[d>>2]|0)-j|0;if((La(g|0,1,l|0,c[a>>2]|0)|0)!=(l|0)){e=-1;d=5;break}if((k|0)==2){e=-1;d=5;break}else if((k|0)!=1){d=4;break}}if((d|0)==4){l=((Ja(c[a>>2]|0)|0)!=0)<<31>>31;i=b;return l|0}else if((d|0)==5){i=b;return e|0}return 0}function Jd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;if((a[b+44|0]|0)!=0){h=La(e|0,1,f|0,c[b+32>>2]|0)|0;return h|0}g=b;if((f|0)>0){h=0}else{h=0;return h|0}while(1){if((pc[c[(c[g>>2]|0)+52>>2]&63](b,d[e]|0)|0)==-1){b=6;break}h=h+1|0;if((h|0)<(f|0)){e=e+1|0}else{b=6;break}}if((b|0)==6){return h|0}return 0}function Kd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;o=e|0;p=e+8|0;h=e+16|0;j=e+24|0;f=(d|0)==-1;a:do{if(!f){a[p]=d;if((a[b+44|0]|0)!=0){if((La(p|0,1,1,c[b+32>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}m=o|0;c[h>>2]=m;k=p+1|0;n=b+36|0;l=b+40|0;g=o+8|0;b=b+32|0;while(1){q=c[n>>2]|0;q=wc[c[(c[q>>2]|0)+12>>2]&31](q,c[l>>2]|0,p,k,j,m,g,h)|0;if((c[j>>2]|0)==(p|0)){d=-1;g=12;break}if((q|0)==3){g=7;break}r=(q|0)==1;if(!(q>>>0<2>>>0)){d=-1;g=12;break}q=(c[h>>2]|0)-o|0;if((La(m|0,1,q|0,c[b>>2]|0)|0)!=(q|0)){d=-1;g=12;break}if(r){p=r?c[j>>2]|0:p}else{break a}}if((g|0)==7){if((La(p|0,1,1,c[b>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}else if((g|0)==12){i=e;return d|0}}}while(0);r=f?0:d;i=e;return r|0}function Ld(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=4328;j=b+4|0;Vj(j);dn(b+8|0,0,24)|0;c[h>>2]=5096;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Wj(g,j);j=Yj(g,13304)|0;h=j;e=b+36|0;c[e>>2]=h;d=b+44|0;c[d>>2]=sc[c[(c[j>>2]|0)+24>>2]&127](h)|0;e=c[e>>2]|0;a[b+53|0]=(sc[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;if((c[d>>2]|0)<=8){Xj(g);i=f;return}fj(120);Xj(g);i=f;return}function Md(a){a=a|0;c[a>>2]=4328;Xj(a+4|0);return}function Nd(a){a=a|0;c[a>>2]=4328;Xj(a+4|0);Pm(a);return}function Od(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;g=Yj(d,13304)|0;f=g;e=b+36|0;c[e>>2]=f;d=b+44|0;c[d>>2]=sc[c[(c[g>>2]|0)+24>>2]&127](f)|0;e=c[e>>2]|0;a[b+53|0]=(sc[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;if((c[d>>2]|0)<=8){return}fj(120);return}function Pd(a){a=a|0;return Sd(a,0)|0}function Qd(a){a=a|0;return Sd(a,1)|0}function Rd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;k=e|0;f=e+8|0;m=e+16|0;l=e+24|0;g=b+52|0;j=(a[g]|0)!=0;if((d|0)==-1){if(j){m=-1;i=e;return m|0}m=c[b+48>>2]|0;a[g]=(m|0)!=-1|0;i=e;return m|0}h=b+48|0;a:do{if(j){a[m]=c[h>>2];n=c[b+36>>2]|0;j=k|0;l=wc[c[(c[n>>2]|0)+12>>2]&31](n,c[b+40>>2]|0,m,m+1|0,l,j,k+8|0,f)|0;if((l|0)==3){a[j]=c[h>>2];c[f>>2]=k+1}else if((l|0)==2|(l|0)==1){n=-1;i=e;return n|0}b=b+32|0;while(1){k=c[f>>2]|0;if(!(k>>>0>j>>>0)){break a}n=k-1|0;c[f>>2]=n;if((Qb(a[n]|0,c[b>>2]|0)|0)==-1){f=-1;break}}i=e;return f|0}}while(0);c[h>>2]=d;a[g]=1;n=d;i=e;return n|0}function Sd(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+32|0;h=f|0;j=f+8|0;n=f+16|0;m=f+24|0;o=b+52|0;if((a[o]|0)!=0){g=b+48|0;h=c[g>>2]|0;if(!e){x=h;i=f;return x|0}c[g>>2]=-1;a[o]=0;x=h;i=f;return x|0}o=c[b+44>>2]|0;t=(o|0)>1?o:1;a:do{if((t|0)>0){q=b+32|0;o=0;while(1){p=$a(c[q>>2]|0)|0;if((p|0)==-1){k=-1;break}a[h+o|0]=p;o=o+1|0;if((o|0)>=(t|0)){break a}}i=f;return k|0}}while(0);b:do{if((a[b+53|0]|0)==0){r=b+40|0;q=b+36|0;o=h|0;p=j+1|0;s=b+32|0;while(1){w=c[r>>2]|0;x=w;v=c[x>>2]|0;x=c[x+4>>2]|0;y=c[q>>2]|0;u=h+t|0;w=wc[c[(c[y>>2]|0)+16>>2]&31](y,w,o,u,n,j,p,m)|0;if((w|0)==3){m=14;break}else if((w|0)==2){k=-1;m=23;break}else if((w|0)!=1){l=t;break b}y=c[r>>2]|0;c[y>>2]=v;c[y+4>>2]=x;if((t|0)==8){k=-1;m=23;break}v=$a(c[s>>2]|0)|0;if((v|0)==-1){k=-1;m=23;break}a[u]=v;t=t+1|0}if((m|0)==14){a[j]=a[o]|0;l=t;break}else if((m|0)==23){i=f;return k|0}}else{a[j]=a[h|0]|0;l=t}}while(0);do{if(!e){e=b+32|0;while(1){if((l|0)<=0){m=21;break}l=l-1|0;if((Qb(d[h+l|0]|0,c[e>>2]|0)|0)==-1){k=-1;m=23;break}}if((m|0)==21){g=a[j]|0;break}else if((m|0)==23){i=f;return k|0}}else{g=a[j]|0;c[b+48>>2]=g&255}}while(0);y=g&255;i=f;return y|0}function Td(){pd(0);bb(138,14056,u|0)|0;return}function Ud(a){a=a|0;return}function Vd(a){a=a|0;a=a+4|0;I=c[a>>2]|0,c[a>>2]=I+1,I;return}function Wd(a){a=a|0;var b=0;b=a+4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){b=0;return b|0}nc[c[(c[a>>2]|0)+8>>2]&511](a);b=1;return b|0}function Xd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=2632;d=fn(b|0)|0;f=Om(d+13|0)|0;c[f+4>>2]=d;c[f>>2]=d;e=f+12|0;c[a+4>>2]=e;c[f+8>>2]=0;cn(e|0,b|0,d+1|0)|0;return}function Yd(a){a=a|0;var b=0,d=0;c[a>>2]=2632;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){d=a;Pm(d);return}Qm((c[b>>2]|0)-12|0);d=a;Pm(d);return}function Zd(a){a=a|0;var b=0;c[a>>2]=2632;a=a+4|0;b=(c[a>>2]|0)-4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)-1|0)>=0){return}Qm((c[a>>2]|0)-12|0);return}function _d(a){a=a|0;return c[a+4>>2]|0}function $d(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;c[b>>2]=2568;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=fn(d|0)|0;g=Om(e+13|0)|0;c[g+4>>2]=e;c[g>>2]=e;f=g+12|0;c[b+4>>2]=f;c[g+8>>2]=0;cn(f|0,d|0,e+1|0)|0;return}function ae(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=2568;d=fn(b|0)|0;f=Om(d+13|0)|0;c[f+4>>2]=d;c[f>>2]=d;e=f+12|0;c[a+4>>2]=e;c[f+8>>2]=0;cn(e|0,b|0,d+1|0)|0;return}function be(a){a=a|0;var b=0,d=0;c[a>>2]=2568;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){d=a;Pm(d);return}Qm((c[b>>2]|0)-12|0);d=a;Pm(d);return}function ce(a){a=a|0;var b=0;c[a>>2]=2568;a=a+4|0;b=(c[a>>2]|0)-4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)-1|0)>=0){return}Qm((c[a>>2]|0)-12|0);return}function de(a){a=a|0;return c[a+4>>2]|0}function ee(a){a=a|0;var b=0,d=0;c[a>>2]=2632;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){d=a;Pm(d);return}Qm((c[b>>2]|0)-12|0);d=a;Pm(d);return}function fe(a){a=a|0;return}function ge(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function he(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+8|0;f=e|0;tc[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){a=0;i=e;return a|0}a=(c[f>>2]|0)==(c[d>>2]|0);i=e;return a|0}function ie(a,b,d){a=a|0;b=b|0;d=d|0;if((c[b+4>>2]|0)!=(a|0)){a=0;return a|0}a=(c[b>>2]|0)==(d|0);return a|0}function je(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;d=Mb(e|0)|0;e=fn(d|0)|0;if(e>>>0>4294967279>>>0){pe(0)}if(e>>>0<11>>>0){a[b]=e<<1;b=b+1|0;cn(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}else{g=e+16&-16;f=Nm(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=e;b=f;cn(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}}function ke(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+16|0;g=f|0;j=d|0;k=c[j>>2]|0;h=e;if((k|0)!=0){l=a[h]|0;if((l&1)==0){l=(l&255)>>>1}else{l=c[e+4>>2]|0}if((l|0)!=0){ze(e,1312,2)|0;k=c[j>>2]|0}d=c[d+4>>2]|0;tc[c[(c[d>>2]|0)+24>>2]&7](g,d,k);d=g;j=a[d]|0;if((j&1)==0){j=(j&255)>>>1;k=g+1|0}else{j=c[g+4>>2]|0;k=c[g+8>>2]|0}ze(e,k,j)|0;if(!((a[d]&1)==0)){Pm(c[g+8>>2]|0)}}l=b;c[l>>2]=c[h>>2];c[l+4>>2]=c[h+4>>2];c[l+8>>2]=c[h+8>>2];dn(h|0,0,12)|0;i=f;return}function le(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+32|0;h=d;d=i;i=i+8|0;c[d>>2]=c[h>>2];c[d+4>>2]=c[h+4>>2];h=f|0;g=f+16|0;j=fn(e|0)|0;if(j>>>0>4294967279>>>0){pe(0)}if(j>>>0<11>>>0){a[g]=j<<1;k=g+1|0}else{l=j+16&-16;k=Nm(l)|0;c[g+8>>2]=k;c[g>>2]=l|1;c[g+4>>2]=j}cn(k|0,e|0,j)|0;a[k+j|0]=0;ke(h,d,g);$d(b|0,h);if(!((a[h]&1)==0)){Pm(c[h+8>>2]|0)}if(!((a[g]&1)==0)){Pm(c[g+8>>2]|0)}c[b>>2]=4592;l=b+8|0;k=c[d+4>>2]|0;c[l>>2]=c[d>>2];c[l+4>>2]=k;i=f;return}function me(a){a=a|0;ce(a|0);Pm(a);return}function ne(a){a=a|0;ce(a|0);return}function oe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;i;if((c[a>>2]|0)==1){do{Ua(13056,13032)|0}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){e;return}c[a>>2]=1;f;nc[d&511](b);g;c[a>>2]=-1;h;Gb(13056)|0;return}function pe(a){a=a|0;a=cc(8)|0;Xd(a,264);c[a>>2]=2600;zb(a|0,8328,36)}function qe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=d;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;d=c[d+4>>2]|0;if(d>>>0>4294967279>>>0){pe(0)}if(d>>>0<11>>>0){a[b]=d<<1;b=b+1|0}else{g=d+16&-16;f=Nm(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=d;b=f}cn(b|0,e|0,d)|0;a[b+d|0]=0;return}function re(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(e>>>0>4294967279>>>0){pe(0)}if(e>>>0<11>>>0){a[b]=e<<1;b=b+1|0;cn(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}else{g=e+16&-16;f=Nm(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=e;b=f;cn(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}}function se(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(d>>>0>4294967279>>>0){pe(0)}if(d>>>0<11>>>0){a[b]=d<<1;b=b+1|0}else{g=d+16&-16;f=Nm(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=d;b=f}dn(b|0,e|0,d|0)|0;a[b+d|0]=0;return}function te(b){b=b|0;if((a[b]&1)==0){return}Pm(c[b+8>>2]|0);return}function ue(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=fn(d|0)|0;f=b;h=a[f]|0;if((h&1)==0){g=10}else{h=c[b>>2]|0;g=(h&-2)-1|0;h=h&255}i=(h&1)==0;if(g>>>0<e>>>0){if(i){f=(h&255)>>>1}else{f=c[b+4>>2]|0}Ae(b,g,e-g|0,f,0,f,e,d);return b|0}if(i){g=b+1|0}else{g=c[b+8>>2]|0}en(g|0,d|0,e|0)|0;a[g+e|0]=0;if((a[f]&1)==0){a[f]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function ve(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b;h=a[f]|0;g=(h&1)==0;if(g){h=(h&255)>>>1}else{h=c[b+4>>2]|0}if(h>>>0<d>>>0){we(b,d-h|0,e)|0;return}if(g){a[b+1+d|0]=0;a[f]=d<<1;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function we(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((d|0)==0){return b|0}f=b;i=a[f]|0;if((i&1)==0){h=10}else{i=c[b>>2]|0;h=(i&-2)-1|0;i=i&255}if((i&1)==0){g=(i&255)>>>1}else{g=c[b+4>>2]|0}if((h-g|0)>>>0<d>>>0){Be(b,h,d-h+g|0,g,g,0,0);i=a[f]|0}if((i&1)==0){h=b+1|0}else{h=c[b+8>>2]|0}dn(h+g|0,e|0,d|0)|0;d=g+d|0;if((a[f]&1)==0){a[f]=d<<1}else{c[b+4>>2]=d}a[h+d|0]=0;return b|0}function xe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if(d>>>0>4294967279>>>0){pe(0)}e=b;g=a[e]|0;if((g&1)==0){h=10}else{g=c[b>>2]|0;h=(g&-2)-1|0;g=g&255}if((g&1)==0){f=(g&255)>>>1}else{f=c[b+4>>2]|0}d=f>>>0>d>>>0?f:d;if(d>>>0<11>>>0){d=10}else{d=(d+16&-16)-1|0}if((d|0)==(h|0)){return}do{if((d|0)!=10){i=d+1|0;if(d>>>0>h>>>0){j=Nm(i)|0}else{j=Nm(i)|0}if((g&1)==0){i=b+1|0;h=0;k=1;break}else{i=c[b+8>>2]|0;h=1;k=1;break}}else{j=b+1|0;i=c[b+8>>2]|0;h=1;k=0}}while(0);if((g&1)==0){g=(g&255)>>>1}else{g=c[b+4>>2]|0}cn(j|0,i|0,g+1|0)|0;if(h){Pm(i)}if(k){c[b>>2]=d+1|1;c[b+4>>2]=f;c[b+8>>2]=j;return}else{a[e]=f<<1;return}}function ye(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=b;g=a[e]|0;f=(g&1)!=0;if(f){g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}else{g=(g&255)>>>1;h=10}if((g|0)==(h|0)){Be(b,h,1,h,h,0,0);if((a[e]&1)==0){f=7}else{f=8}}else{if(f){f=8}else{f=7}}if((f|0)==7){a[e]=(g<<1)+2;f=b+1|0;h=g+1|0;g=f+g|0;a[g]=d;h=f+h|0;a[h]=0;return}else if((f|0)==8){f=c[b+8>>2]|0;h=g+1|0;c[b+4>>2]=h;g=f+g|0;a[g]=d;h=f+h|0;a[h]=0;return}}function ze(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;i=a[f]|0;if((i&1)==0){g=10}else{i=c[b>>2]|0;g=(i&-2)-1|0;i=i&255}if((i&1)==0){h=(i&255)>>>1}else{h=c[b+4>>2]|0}if((g-h|0)>>>0<e>>>0){Ae(b,g,e-g+h|0,h,h,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){g=b+1|0}else{g=c[b+8>>2]|0}cn(g+h|0,d|0,e)|0;e=h+e|0;if((a[f]&1)==0){a[f]=e<<1}else{c[b+4>>2]=e}a[g+e|0]=0;return b|0}function Ae(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0;if((-18-d|0)>>>0<e>>>0){pe(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}if(d>>>0<2147483623>>>0){l=e+d|0;e=d<<1;e=l>>>0<e>>>0?e:l;if(e>>>0<11>>>0){e=11}else{e=e+16&-16}}else{e=-17}l=Nm(e)|0;if((g|0)!=0){cn(l|0,k|0,g)|0}if((i|0)!=0){cn(l+g|0,j|0,i)|0}f=f-h|0;if((f|0)!=(g|0)){cn(l+(i+g)|0,k+(h+g)|0,f-g|0)|0}if((d|0)==10){j=b+8|0;c[j>>2]=l;j=e|1;e=b|0;c[e>>2]=j;e=f+i|0;j=b+4|0;c[j>>2]=e;l=l+e|0;a[l]=0;return}Pm(k);j=b+8|0;c[j>>2]=l;j=e|1;e=b|0;c[e>>2]=j;e=f+i|0;j=b+4|0;c[j>>2]=e;l=l+e|0;a[l]=0;return}function Be(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0;if((-17-d|0)>>>0<e>>>0){pe(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}if(d>>>0<2147483623>>>0){k=e+d|0;e=d<<1;e=k>>>0<e>>>0?e:k;if(e>>>0<11>>>0){e=11}else{e=e+16&-16}}else{e=-17}k=Nm(e)|0;if((g|0)!=0){cn(k|0,j|0,g)|0}f=f-h|0;if((f|0)!=(g|0)){cn(k+(i+g)|0,j+(h+g)|0,f-g|0)|0}if((d|0)==10){f=b+8|0;c[f>>2]=k;e=e|1;k=b|0;c[k>>2]=e;return}Pm(j);f=b+8|0;c[f>>2]=k;e=e|1;k=b|0;c[k>>2]=e;return}function Ce(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(e>>>0>1073741807>>>0){pe(0)}if(e>>>0<2>>>0){a[b]=e<<1;b=b+4|0;jm(b,d,e)|0;d=b+(e<<2)|0;c[d>>2]=0;return}else{g=e+4&-4;f=Nm(g<<2)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=e;b=f;jm(b,d,e)|0;d=b+(e<<2)|0;c[d>>2]=0;return}}function De(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(d>>>0>1073741807>>>0){pe(0)}if(d>>>0<2>>>0){a[b]=d<<1;b=b+4|0;lm(b,e,d)|0;e=b+(d<<2)|0;c[e>>2]=0;return}else{g=d+4&-4;f=Nm(g<<2)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=d;b=f;lm(b,e,d)|0;e=b+(d<<2)|0;c[e>>2]=0;return}}function Ee(b){b=b|0;if((a[b]&1)==0){return}Pm(c[b+8>>2]|0);return}function Fe(a,b){a=a|0;b=b|0;return Ge(a,b,im(b)|0)|0}function Ge(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;h=a[f]|0;if((h&1)==0){g=1}else{h=c[b>>2]|0;g=(h&-2)-1|0;h=h&255}i=(h&1)==0;if(g>>>0<e>>>0){if(i){f=(h&255)>>>1}else{f=c[b+4>>2]|0}Je(b,g,e-g|0,f,0,f,e,d);return b|0}if(i){g=b+4|0}else{g=c[b+8>>2]|0}km(g,d,e)|0;c[g+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function He(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if(d>>>0>1073741807>>>0){pe(0)}e=b;g=a[e]|0;if((g&1)==0){h=1}else{g=c[b>>2]|0;h=(g&-2)-1|0;g=g&255}if((g&1)==0){f=(g&255)>>>1}else{f=c[b+4>>2]|0}d=f>>>0>d>>>0?f:d;if(d>>>0<2>>>0){d=1}else{d=(d+4&-4)-1|0}if((d|0)==(h|0)){return}do{if((d|0)!=1){i=(d<<2)+4|0;if(d>>>0>h>>>0){j=Nm(i)|0}else{j=Nm(i)|0}if((g&1)==0){i=b+4|0;h=0;k=1;break}else{i=c[b+8>>2]|0;h=1;k=1;break}}else{j=b+4|0;i=c[b+8>>2]|0;h=1;k=0}}while(0);if((g&1)==0){g=(g&255)>>>1}else{g=c[b+4>>2]|0}jm(j,i,g+1|0)|0;if(h){Pm(i)}if(k){c[b>>2]=d+1|1;c[b+4>>2]=f;c[b+8>>2]=j;return}else{a[e]=f<<1;return}}function Ie(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=b;g=a[e]|0;f=(g&1)!=0;if(f){g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}else{g=(g&255)>>>1;h=1}if((g|0)==(h|0)){Ke(b,h,1,h,h,0,0);if((a[e]&1)==0){f=7}else{f=8}}else{if(f){f=8}else{f=7}}if((f|0)==7){a[e]=(g<<1)+2;f=b+4|0;h=g+1|0;g=f+(g<<2)|0;c[g>>2]=d;h=f+(h<<2)|0;c[h>>2]=0;return}else if((f|0)==8){f=c[b+8>>2]|0;h=g+1|0;c[b+4>>2]=h;g=f+(g<<2)|0;c[g>>2]=d;h=f+(h<<2)|0;c[h>>2]=0;return}}function Je(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0;if((1073741806-d|0)>>>0<e>>>0){pe(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}if(d>>>0<536870887>>>0){l=e+d|0;e=d<<1;e=l>>>0<e>>>0?e:l;if(e>>>0<2>>>0){e=2}else{e=e+4&-4}}else{e=1073741807}l=Nm(e<<2)|0;if((g|0)!=0){jm(l,k,g)|0}if((i|0)!=0){jm(l+(g<<2)|0,j,i)|0}f=f-h|0;if((f|0)!=(g|0)){jm(l+(i+g<<2)|0,k+(h+g<<2)|0,f-g|0)|0}if((d|0)==1){j=b+8|0;c[j>>2]=l;j=e|1;e=b|0;c[e>>2]=j;e=f+i|0;j=b+4|0;c[j>>2]=e;l=l+(e<<2)|0;c[l>>2]=0;return}Pm(k);j=b+8|0;c[j>>2]=l;j=e|1;e=b|0;c[e>>2]=j;e=f+i|0;j=b+4|0;c[j>>2]=e;l=l+(e<<2)|0;c[l>>2]=0;return}function Ke(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0;if((1073741807-d|0)>>>0<e>>>0){pe(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}if(d>>>0<536870887>>>0){k=e+d|0;e=d<<1;e=k>>>0<e>>>0?e:k;if(e>>>0<2>>>0){e=2}else{e=e+4&-4}}else{e=1073741807}k=Nm(e<<2)|0;if((g|0)!=0){jm(k,j,g)|0}f=f-h|0;if((f|0)!=(g|0)){jm(k+(i+g<<2)|0,j+(h+g<<2)|0,f-g|0)|0}if((d|0)==1){f=b+8|0;c[f>>2]=k;e=e|1;k=b|0;c[k>>2]=e;return}Pm(j);f=b+8|0;c[f>>2]=k;e=e|1;k=b|0;c[k>>2]=e;return}function Le(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;f=i;i=i+8|0;e=f|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=f;return}d=cc(16)|0;if((a[14176]|0)==0?(ob(14176)|0)!=0:0){c[3018]=4096;bb(68,12072,u|0)|0}b=jn(12072,0,32)|0;c[e>>2]=b|1;c[e+4>>2]=K;le(d,e,1320);c[d>>2]=3280;zb(d|0,8872,32)}function Me(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=3256;e=c[a+40>>2]|0;b=a+32|0;d=a+36|0;if((e|0)!=0){do{e=e-1|0;tc[c[(c[b>>2]|0)+(e<<2)>>2]&7](0,a,c[(c[d>>2]|0)+(e<<2)>>2]|0)}while((e|0)!=0)}Xj(a+28|0);Jm(c[b>>2]|0);Jm(c[d>>2]|0);Jm(c[a+48>>2]|0);Jm(c[a+60>>2]|0);return}function Ne(a,b){a=a|0;b=b|0;Wj(a,b+28|0);return}function Oe(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;dn(a+32|0,0,40)|0;Vj(a+28|0);return}function Pe(a){a=a|0;c[a>>2]=4328;Xj(a+4|0);Pm(a);return}function Qe(a){a=a|0;c[a>>2]=4328;Xj(a+4|0);return}function Re(a,b){a=a|0;b=b|0;return}function Se(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Te(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Ue(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;e=i;f=d;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function Ve(a){a=a|0;return 0}function We(a){a=a|0;return 0}function Xe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=b;if((e|0)<=0){j=0;return j|0}g=b+12|0;h=b+16|0;i=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+1;j=a[j]|0}else{j=sc[c[(c[f>>2]|0)+40>>2]&127](b)|0;if((j|0)==-1){e=8;break}j=j&255}a[d]=j;i=i+1|0;if((i|0)<(e|0)){d=d+1|0}else{e=8;break}}if((e|0)==8){return i|0}return 0}function Ye(a){a=a|0;return-1|0}function Ze(a){a=a|0;var b=0;if((sc[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){a=-1;return a|0}b=a+12|0;a=c[b>>2]|0;c[b>>2]=a+1;a=d[a]|0;return a|0}function _e(a,b){a=a|0;b=b|0;return-1|0}function $e(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;h=b;if((f|0)<=0){k=0;return k|0}i=b+24|0;g=b+28|0;j=0;while(1){k=c[i>>2]|0;if(!(k>>>0<(c[g>>2]|0)>>>0)){if((pc[c[(c[h>>2]|0)+52>>2]&63](b,d[e]|0)|0)==-1){g=7;break}}else{l=a[e]|0;c[i>>2]=k+1;a[k]=l}j=j+1|0;if((j|0)<(f|0)){e=e+1|0}else{g=7;break}}if((g|0)==7){return j|0}return 0}function af(a,b){a=a|0;b=b|0;return-1|0}function bf(a){a=a|0;c[a>>2]=4256;Xj(a+4|0);Pm(a);return}function cf(a){a=a|0;c[a>>2]=4256;Xj(a+4|0);return}function df(a,b){a=a|0;b=b|0;return}function ef(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function ff(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function gf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;e=i;f=d;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function hf(a){a=a|0;return 0}function jf(a){a=a|0;return 0}function kf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=a;if((d|0)<=0){i=0;return i|0}g=a+12|0;f=a+16|0;h=0;while(1){i=c[g>>2]|0;if(!(i>>>0<(c[f>>2]|0)>>>0)){i=sc[c[(c[e>>2]|0)+40>>2]&127](a)|0;if((i|0)==-1){a=8;break}}else{c[g>>2]=i+4;i=c[i>>2]|0}c[b>>2]=i;h=h+1|0;if((h|0)>=(d|0)){a=8;break}b=b+4|0}if((a|0)==8){return h|0}return 0}function lf(a){a=a|0;return-1|0}function mf(a){a=a|0;var b=0;if((sc[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){a=-1;return a|0}b=a+12|0;a=c[b>>2]|0;c[b>>2]=a+4;a=c[a>>2]|0;return a|0}function nf(a,b){a=a|0;b=b|0;return-1|0}function of(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;f=a;if((d|0)<=0){i=0;return i|0}g=a+24|0;e=a+28|0;h=0;while(1){i=c[g>>2]|0;if(!(i>>>0<(c[e>>2]|0)>>>0)){if((pc[c[(c[f>>2]|0)+52>>2]&63](a,c[b>>2]|0)|0)==-1){e=8;break}}else{j=c[b>>2]|0;c[g>>2]=i+4;c[i>>2]=j}h=h+1|0;if((h|0)>=(d|0)){e=8;break}b=b+4|0}if((e|0)==8){return h|0}return 0}function pf(a,b){a=a|0;b=b|0;return-1|0}function qf(a){a=a|0;Me(a+8|0);Pm(a);return}function rf(a){a=a|0;Me(a+8|0);return}function sf(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;Me(b+(a+8)|0);Pm(b+a|0);return}function tf(a){a=a|0;Me(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function uf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;g=d|0;f=b;j=c[(c[f>>2]|0)-12>>2]|0;e=b;if((c[e+(j+24)>>2]|0)==0){i=d;return b|0}h=g|0;a[h]=0;c[g+4>>2]=b;if((c[e+(j+16)>>2]|0)==0){k=c[e+(j+72)>>2]|0;if((k|0)!=0){uf(k)|0;j=c[(c[f>>2]|0)-12>>2]|0}a[h]=1;k=c[e+(j+24)>>2]|0;if((sc[c[(c[k>>2]|0)+24>>2]&127](k)|0)==-1){k=c[(c[f>>2]|0)-12>>2]|0;Le(e+k|0,c[e+(k+16)>>2]|1)}}Ef(g);i=d;return b|0}function vf(a){a=a|0;Me(a+8|0);Pm(a);return}function wf(a){a=a|0;Me(a+8|0);return}function xf(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;Me(b+(a+8)|0);Pm(b+a|0);return}function yf(a){a=a|0;Me(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function zf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;g=d|0;f=b;j=c[(c[f>>2]|0)-12>>2]|0;e=b;if((c[e+(j+24)>>2]|0)==0){i=d;return b|0}h=g|0;a[h]=0;c[g+4>>2]=b;if((c[e+(j+16)>>2]|0)==0){k=c[e+(j+72)>>2]|0;if((k|0)!=0){zf(k)|0;j=c[(c[f>>2]|0)-12>>2]|0}a[h]=1;k=c[e+(j+24)>>2]|0;if((sc[c[(c[k>>2]|0)+24>>2]&127](k)|0)==-1){k=c[(c[f>>2]|0)-12>>2]|0;Le(e+k|0,c[e+(k+16)>>2]|1)}}Jf(g);i=d;return b|0}function Af(a){a=a|0;Me(a+4|0);Pm(a);return}function Bf(a){a=a|0;Me(a+4|0);return}function Cf(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;Me(b+(a+4)|0);Pm(b+a|0);return}function Df(a){a=a|0;Me(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function Ef(a){a=a|0;var b=0,d=0;a=a+4|0;b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;if((c[b+(d+24)>>2]|0)==0){return}if((c[b+(d+16)>>2]|0)!=0){return}if((c[b+(d+4)>>2]&8192|0)==0){return}if(tb()|0){return}d=c[a>>2]|0;d=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if(!((sc[c[(c[d>>2]|0)+24>>2]&127](d)|0)==-1)){return}b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;Le(b+d|0,c[b+(d+16)>>2]|1);return}function Ff(a){a=a|0;Me(a+4|0);Pm(a);return}function Gf(a){a=a|0;Me(a+4|0);return}function Hf(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;Me(b+(a+4)|0);Pm(b+a|0);return}function If(a){a=a|0;Me(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function Jf(a){a=a|0;var b=0,d=0;a=a+4|0;b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;if((c[b+(d+24)>>2]|0)==0){return}if((c[b+(d+16)>>2]|0)!=0){return}if((c[b+(d+4)>>2]&8192|0)==0){return}if(tb()|0){return}d=c[a>>2]|0;d=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if(!((sc[c[(c[d>>2]|0)+24>>2]&127](d)|0)==-1)){return}b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;Le(b+d|0,c[b+(d+16)>>2]|1);return}function Kf(a){a=a|0;return 1384}function Lf(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){re(a,1640,35);return}else{je(a,b|0,c);return}}function Mf(a){a=a|0;fe(a|0);return}function Nf(a){a=a|0;ne(a|0);Pm(a);return}function Of(a){a=a|0;ne(a|0);return}function Pf(a){a=a|0;Me(a);Pm(a);return}function Qf(a){a=a|0;fe(a|0);Pm(a);return}function Rf(a){a=a|0;Ud(a|0);Pm(a);return}function Sf(a){a=a|0;Ud(a|0);return}function Tf(a){a=a|0;Ud(a|0);return}function Uf(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0;a:do{if((e|0)!=(f|0)){while(1){if((c|0)==(d|0)){d=-1;f=7;break}g=a[c]|0;b=a[e]|0;if(g<<24>>24<b<<24>>24){d=-1;f=7;break}if(b<<24>>24<g<<24>>24){d=1;f=7;break}c=c+1|0;e=e+1|0;if((e|0)==(f|0)){break a}}if((f|0)==7){return d|0}}}while(0);g=(c|0)!=(d|0)|0;return g|0}function Vf(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;d=e;g=f-d|0;if(g>>>0>4294967279>>>0){pe(b)}if(g>>>0<11>>>0){a[b]=g<<1;b=b+1|0}else{i=g+16&-16;h=Nm(i)|0;c[b+8>>2]=h;c[b>>2]=i|1;c[b+4>>2]=g;b=h}if((e|0)==(f|0)){i=b;a[i]=0;return}else{g=b}while(1){a[g]=a[e]|0;e=e+1|0;if((e|0)==(f|0)){break}else{g=g+1|0}}i=b+(f+(-d|0))|0;a[i]=0;return}function Wf(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)==(d|0)){b=0;return b|0}else{b=0}do{b=(a[c]|0)+(b<<4)|0;e=b&-268435456;b=(e>>>24|e)^b;c=c+1|0}while((c|0)!=(d|0));return b|0}function Xf(a){a=a|0;Ud(a|0);Pm(a);return}function Yf(a){a=a|0;Ud(a|0);return}function Zf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a:do{if((e|0)==(f|0)){g=6}else{while(1){if((b|0)==(d|0)){d=-1;break a}h=c[b>>2]|0;a=c[e>>2]|0;if((h|0)<(a|0)){d=-1;break a}if((a|0)<(h|0)){d=1;break a}b=b+4|0;e=e+4|0;if((e|0)==(f|0)){g=6;break}}}}while(0);if((g|0)==6){d=(b|0)!=(d|0)|0}return d|0}function _f(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;d=e;h=f-d|0;g=h>>2;if(g>>>0>1073741807>>>0){pe(b)}if(g>>>0<2>>>0){a[b]=h>>>1;b=b+4|0}else{i=g+4&-4;h=Nm(i<<2)|0;c[b+8>>2]=h;c[b>>2]=i|1;c[b+4>>2]=g;b=h}if((e|0)==(f|0)){i=b;c[i>>2]=0;return}d=f-4+(-d|0)|0;g=b;while(1){c[g>>2]=c[e>>2];e=e+4|0;if((e|0)==(f|0)){break}else{g=g+4|0}}i=b+((d>>>2)+1<<2)|0;c[i>>2]=0;return}function $f(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((b|0)==(d|0)){a=0;return a|0}else{a=0}do{a=(c[b>>2]|0)+(a<<4)|0;e=a&-268435456;a=(e>>>24|e)^a;b=b+4|0}while((b|0)!=(d|0));return a|0}function ag(a){a=a|0;Ud(a|0);Pm(a);return}function bg(a){a=a|0;Ud(a|0);return}function cg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;k=i;i=i+112|0;o=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[o>>2];o=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[o>>2];o=k|0;r=k+16|0;s=k+32|0;v=k+40|0;w=k+48|0;t=k+56|0;u=k+64|0;p=k+72|0;m=k+80|0;n=k+104|0;if((c[g+4>>2]&1|0)==0){c[s>>2]=-1;r=c[(c[d>>2]|0)+16>>2]|0;u=e|0;c[w>>2]=c[u>>2];c[t>>2]=c[f>>2];mc[r&127](v,d,w,t,g,h,s);e=c[v>>2]|0;c[u>>2]=e;f=c[s>>2]|0;if((f|0)==1){a[j]=1}else if((f|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=e;i=k;return}Ne(u,g);s=u|0;t=c[s>>2]|0;if(!((c[3402]|0)==-1)){c[r>>2]=13608;c[r+4>>2]=14;c[r+8>>2]=0;oe(13608,r,96)}r=(c[3403]|0)-1|0;u=c[t+8>>2]|0;if((c[t+12>>2]|0)-u>>2>>>0>r>>>0?(q=c[u+(r<<2)>>2]|0,(q|0)!=0):0){Wd(c[s>>2]|0)|0;Ne(p,g);g=p|0;p=c[g>>2]|0;if(!((c[3306]|0)==-1)){c[o>>2]=13224;c[o+4>>2]=14;c[o+8>>2]=0;oe(13224,o,96)}r=(c[3307]|0)-1|0;o=c[p+8>>2]|0;if((c[p+12>>2]|0)-o>>2>>>0>r>>>0?(l=c[o+(r<<2)>>2]|0,(l|0)!=0):0){w=l;Wd(c[g>>2]|0)|0;d=m|0;v=l;oc[c[(c[v>>2]|0)+24>>2]&127](d,w);oc[c[(c[v>>2]|0)+28>>2]&127](m+12|0,w);c[n>>2]=c[f>>2];a[j]=(dg(e,n,d,m+24|0,q,h,1)|0)==(d|0)|0;c[b>>2]=c[e>>2];te(m+12|0);te(m|0);i=k;return}d=cc(4)|0;nm(d);zb(d|0,8296,130)}d=cc(4)|0;nm(d);zb(d|0,8296,130)}function dg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+104|0;v=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[v>>2];v=(f-e|0)/12|0;n=k|0;if(v>>>0>100>>>0){m=Im(v)|0;if((m|0)==0){Um();n=0;m=0}else{n=m}}else{m=0}o=(e|0)==(f|0);if(o){t=0}else{t=0;p=n;q=e;while(1){r=a[q]|0;if((r&1)==0){r=(r&255)>>>1}else{r=c[q+4>>2]|0}if((r|0)==0){a[p]=2;t=t+1|0;v=v-1|0}else{a[p]=1}q=q+12|0;if((q|0)==(f|0)){break}else{p=p+1|0}}}b=b|0;d=d|0;p=g;q=0;a:while(1){r=c[b>>2]|0;do{if((r|0)!=0){if((c[r+12>>2]|0)==(c[r+16>>2]|0)){if((sc[c[(c[r>>2]|0)+36>>2]&127](r)|0)==-1){c[b>>2]=0;r=0;break}else{r=c[b>>2]|0;break}}}else{r=0}}while(0);u=(r|0)==0;s=c[d>>2]|0;if((s|0)!=0){if((c[s+12>>2]|0)==(c[s+16>>2]|0)?(sc[c[(c[s>>2]|0)+36>>2]&127](s)|0)==-1:0){c[d>>2]=0;s=0}}else{s=0}r=(s|0)==0;w=c[b>>2]|0;if(!((u^r)&(v|0)!=0)){break}r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){s=(sc[c[(c[w>>2]|0)+36>>2]&127](w)|0)&255}else{s=a[r]|0}if(!j){s=pc[c[(c[p>>2]|0)+12>>2]&63](g,s)|0}r=q+1|0;if(o){q=r;continue}b:do{if(j){u=n;x=0;w=e;while(1){do{if((a[u]|0)==1){y=a[w]|0;A=(y&1)==0;if(A){z=w+1|0}else{z=c[w+8>>2]|0}if(!(s<<24>>24==(a[z+q|0]|0))){a[u]=0;v=v-1|0;break}if(A){x=(y&255)>>>1}else{x=c[w+4>>2]|0}if((x|0)==(r|0)){a[u]=2;x=1;t=t+1|0;v=v-1|0}else{x=1}}}while(0);w=w+12|0;if((w|0)==(f|0)){s=v;break b}u=u+1|0}}else{u=n;x=0;w=e;while(1){do{if((a[u]|0)==1){z=w;if((a[z]&1)==0){y=w+1|0}else{y=c[w+8>>2]|0}if(!(s<<24>>24==(pc[c[(c[p>>2]|0)+12>>2]&63](g,a[y+q|0]|0)|0)<<24>>24)){a[u]=0;v=v-1|0;break}x=a[z]|0;if((x&1)==0){x=(x&255)>>>1}else{x=c[w+4>>2]|0}if((x|0)==(r|0)){a[u]=2;x=1;t=t+1|0;v=v-1|0}else{x=1}}}while(0);w=w+12|0;if((w|0)==(f|0)){s=v;break b}u=u+1|0}}}while(0);if(!x){q=r;v=s;continue}u=c[b>>2]|0;q=u+12|0;v=c[q>>2]|0;if((v|0)==(c[u+16>>2]|0)){sc[c[(c[u>>2]|0)+40>>2]&127](u)|0}else{c[q>>2]=v+1}if((s+t|0)>>>0<2>>>0){q=r;v=s;continue}else{q=n;u=e}while(1){if((a[q]|0)==2){v=a[u]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[u+4>>2]|0}if((v|0)!=(r|0)){a[q]=0;t=t-1|0}}u=u+12|0;if((u|0)==(f|0)){q=r;v=s;continue a}else{q=q+1|0}}}do{if((w|0)!=0){if((c[w+12>>2]|0)==(c[w+16>>2]|0)){if((sc[c[(c[w>>2]|0)+36>>2]&127](w)|0)==-1){c[b>>2]=0;w=0;break}else{w=c[b>>2]|0;break}}}else{w=0}}while(0);j=(w|0)==0;do{if(!r){if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(j){break}else{l=94;break}}if(!((sc[c[(c[s>>2]|0)+36>>2]&127](s)|0)==-1)){if(j){break}else{l=94;break}}else{c[d>>2]=0;l=92;break}}else{l=92}}while(0);if((l|0)==92?j:0){l=94}if((l|0)==94){c[h>>2]=c[h>>2]|2}c:do{if(!o){if((a[n]|0)==2){f=e}else{while(1){e=e+12|0;n=n+1|0;if((e|0)==(f|0)){l=99;break c}if((a[n]|0)==2){f=e;break}}}}else{l=99}}while(0);if((l|0)==99){c[h>>2]=c[h>>2]|4}if((m|0)==0){i=k;return f|0}Jm(m);i=k;return f|0}function eg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];fg(a,0,e,d,f,g,h);i=b;return}function fg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+256|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;x=m+32|0;l=m+40|0;d=m+56|0;o=m+72|0;q=m+80|0;r=m+240|0;p=m+248|0;s=c[g+4>>2]&74;if((s|0)==0){s=0}else if((s|0)==64){s=8}else if((s|0)==8){s=16}else{s=10}t=t|0;Xg(l,g,t,x);u=d;dn(u|0,0,12)|0;ve(d,10,0);if((a[u]&1)==0){v=d+1|0;C=v;w=d+8|0}else{w=d+8|0;C=c[w>>2]|0;v=d+1|0}c[o>>2]=C;g=q|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=d|0;z=d+4|0;A=a[x]|0;x=c[e>>2]|0;a:while(1){if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}D=(x|0)==0;B=c[f>>2]|0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{break a}}if(!((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=21;break}}else{k=21}}while(0);if((k|0)==21){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[o>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(d,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(d,C,0);if((a[u]&1)==0){C=v}else{C=c[w>>2]|0}c[o>>2]=C+D}D=x+12|0;F=c[D>>2]|0;E=x+16|0;if((F|0)==(c[E>>2]|0)){F=(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)&255}else{F=a[F]|0}if((xg(F,s,C,o,p,A,l,g,r,t)|0)!=0){break}B=c[D>>2]|0;if((B|0)==(c[E>>2]|0)){sc[c[(c[x>>2]|0)+40>>2]&127](x)|0;continue}else{c[D>>2]=B+1;continue}}t=a[l]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[l+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-q|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}c[j>>2]=Tl(C,c[o>>2]|0,h,s)|0;jj(l,g,c[r>>2]|0,h);if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}n=(x|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(!n){break}F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}if((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1){c[f>>2]=0;k=66;break}if(n^(B|0)==0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}}else{k=66}}while(0);if((k|0)==66?!n:0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}function gg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];hg(a,0,e,d,f,g,h);i=b;return}function hg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+256|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;x=m+32|0;l=m+40|0;d=m+56|0;o=m+72|0;q=m+80|0;r=m+240|0;p=m+248|0;s=c[g+4>>2]&74;if((s|0)==64){s=8}else if((s|0)==0){s=0}else if((s|0)==8){s=16}else{s=10}t=t|0;Xg(l,g,t,x);u=d;dn(u|0,0,12)|0;ve(d,10,0);if((a[u]&1)==0){v=d+1|0;C=v;w=d+8|0}else{w=d+8|0;C=c[w>>2]|0;v=d+1|0}c[o>>2]=C;g=q|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=d|0;z=d+4|0;A=a[x]|0;x=c[e>>2]|0;a:while(1){if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}D=(x|0)==0;B=c[f>>2]|0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{break a}}if(!((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=21;break}}else{k=21}}while(0);if((k|0)==21){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[o>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(d,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(d,C,0);if((a[u]&1)==0){C=v}else{C=c[w>>2]|0}c[o>>2]=C+D}D=x+12|0;F=c[D>>2]|0;E=x+16|0;if((F|0)==(c[E>>2]|0)){F=(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)&255}else{F=a[F]|0}if((xg(F,s,C,o,p,A,l,g,r,t)|0)!=0){break}B=c[D>>2]|0;if((B|0)==(c[E>>2]|0)){sc[c[(c[x>>2]|0)+40>>2]&127](x)|0;continue}else{c[D>>2]=B+1;continue}}t=a[l]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[l+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-q|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}F=Sl(C,c[o>>2]|0,h,s)|0;c[j>>2]=F;c[j+4>>2]=K;jj(l,g,c[r>>2]|0,h);if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}n=(x|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(!n){break}F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}if((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1){c[f>>2]=0;k=66;break}if(n^(B|0)==0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}}else{k=66}}while(0);if((k|0)==66?!n:0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}function ig(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];jg(a,0,e,d,f,g,h);i=b;return}function jg(d,e,f,g,h,j,k){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;n=i;i=i+256|0;u=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[u>>2];u=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[u>>2];u=n|0;y=n+32|0;m=n+40|0;e=n+56|0;p=n+72|0;r=n+80|0;s=n+240|0;q=n+248|0;t=c[h+4>>2]&74;if((t|0)==0){t=0}else if((t|0)==8){t=16}else if((t|0)==64){t=8}else{t=10}u=u|0;Xg(m,h,u,y);v=e;dn(v|0,0,12)|0;ve(e,10,0);if((a[v]&1)==0){w=e+1|0;D=w;x=e+8|0}else{x=e+8|0;D=c[x>>2]|0;w=e+1|0}c[p>>2]=D;h=r|0;c[s>>2]=h;c[q>>2]=0;f=f|0;g=g|0;z=e|0;A=e+4|0;B=a[y]|0;y=c[f>>2]|0;a:while(1){if((y|0)!=0){if((c[y+12>>2]|0)==(c[y+16>>2]|0)?(sc[c[(c[y>>2]|0)+36>>2]&127](y)|0)==-1:0){c[f>>2]=0;y=0}}else{y=0}E=(y|0)==0;C=c[g>>2]|0;do{if((C|0)!=0){if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(E){break}else{break a}}if(!((sc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1)){if(E){break}else{break a}}else{c[g>>2]=0;l=21;break}}else{l=21}}while(0);if((l|0)==21){l=0;if(E){C=0;break}else{C=0}}E=a[v]|0;G=(E&1)==0;if(G){F=(E&255)>>>1}else{F=c[A>>2]|0}if(((c[p>>2]|0)-D|0)==(F|0)){if(G){D=(E&255)>>>1;E=(E&255)>>>1}else{E=c[A>>2]|0;D=E}ve(e,D<<1,0);if((a[v]&1)==0){D=10}else{D=(c[z>>2]&-2)-1|0}ve(e,D,0);if((a[v]&1)==0){D=w}else{D=c[x>>2]|0}c[p>>2]=D+E}E=y+12|0;G=c[E>>2]|0;F=y+16|0;if((G|0)==(c[F>>2]|0)){G=(sc[c[(c[y>>2]|0)+36>>2]&127](y)|0)&255}else{G=a[G]|0}if((xg(G,t,D,p,q,B,m,h,s,u)|0)!=0){break}C=c[E>>2]|0;if((C|0)==(c[F>>2]|0)){sc[c[(c[y>>2]|0)+40>>2]&127](y)|0;continue}else{c[E>>2]=C+1;continue}}u=a[m]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[m+4>>2]|0}if((u|0)!=0?(o=c[s>>2]|0,(o-r|0)<160):0){G=c[q>>2]|0;c[s>>2]=o+4;c[o>>2]=G}b[k>>1]=Rl(D,c[p>>2]|0,j,t)|0;jj(m,h,c[s>>2]|0,j);if((y|0)!=0){if((c[y+12>>2]|0)==(c[y+16>>2]|0)?(sc[c[(c[y>>2]|0)+36>>2]&127](y)|0)==-1:0){c[f>>2]=0;y=0}}else{y=0}o=(y|0)==0;do{if((C|0)!=0){if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(!o){break}G=d|0;c[G>>2]=y;te(e);te(m);i=n;return}if((sc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1){c[g>>2]=0;l=66;break}if(o^(C|0)==0){G=d|0;c[G>>2]=y;te(e);te(m);i=n;return}}else{l=66}}while(0);if((l|0)==66?!o:0){G=d|0;c[G>>2]=y;te(e);te(m);i=n;return}c[j>>2]=c[j>>2]|2;G=d|0;c[G>>2]=y;te(e);te(m);i=n;return}function kg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];lg(a,0,e,d,f,g,h);i=b;return}function lg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+256|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;x=m+32|0;l=m+40|0;d=m+56|0;o=m+72|0;q=m+80|0;r=m+240|0;p=m+248|0;s=c[g+4>>2]&74;if((s|0)==64){s=8}else if((s|0)==0){s=0}else if((s|0)==8){s=16}else{s=10}t=t|0;Xg(l,g,t,x);u=d;dn(u|0,0,12)|0;ve(d,10,0);if((a[u]&1)==0){v=d+1|0;C=v;w=d+8|0}else{w=d+8|0;C=c[w>>2]|0;v=d+1|0}c[o>>2]=C;g=q|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=d|0;z=d+4|0;A=a[x]|0;x=c[e>>2]|0;a:while(1){if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}D=(x|0)==0;B=c[f>>2]|0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{break a}}if(!((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=21;break}}else{k=21}}while(0);if((k|0)==21){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[o>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(d,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(d,C,0);if((a[u]&1)==0){C=v}else{C=c[w>>2]|0}c[o>>2]=C+D}D=x+12|0;F=c[D>>2]|0;E=x+16|0;if((F|0)==(c[E>>2]|0)){F=(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)&255}else{F=a[F]|0}if((xg(F,s,C,o,p,A,l,g,r,t)|0)!=0){break}B=c[D>>2]|0;if((B|0)==(c[E>>2]|0)){sc[c[(c[x>>2]|0)+40>>2]&127](x)|0;continue}else{c[D>>2]=B+1;continue}}t=a[l]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[l+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-q|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}c[j>>2]=Ql(C,c[o>>2]|0,h,s)|0;jj(l,g,c[r>>2]|0,h);if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}n=(x|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(!n){break}F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}if((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1){c[f>>2]=0;k=66;break}if(n^(B|0)==0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}}else{k=66}}while(0);if((k|0)==66?!n:0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}function mg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];ng(a,0,e,d,f,g,h);i=b;return}function ng(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+256|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;x=m+32|0;l=m+40|0;d=m+56|0;o=m+72|0;q=m+80|0;r=m+240|0;p=m+248|0;s=c[g+4>>2]&74;if((s|0)==0){s=0}else if((s|0)==64){s=8}else if((s|0)==8){s=16}else{s=10}t=t|0;Xg(l,g,t,x);u=d;dn(u|0,0,12)|0;ve(d,10,0);if((a[u]&1)==0){v=d+1|0;C=v;w=d+8|0}else{w=d+8|0;C=c[w>>2]|0;v=d+1|0}c[o>>2]=C;g=q|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=d|0;z=d+4|0;A=a[x]|0;x=c[e>>2]|0;a:while(1){if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}D=(x|0)==0;B=c[f>>2]|0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{break a}}if(!((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=21;break}}else{k=21}}while(0);if((k|0)==21){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[o>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(d,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(d,C,0);if((a[u]&1)==0){C=v}else{C=c[w>>2]|0}c[o>>2]=C+D}D=x+12|0;F=c[D>>2]|0;E=x+16|0;if((F|0)==(c[E>>2]|0)){F=(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)&255}else{F=a[F]|0}if((xg(F,s,C,o,p,A,l,g,r,t)|0)!=0){break}B=c[D>>2]|0;if((B|0)==(c[E>>2]|0)){sc[c[(c[x>>2]|0)+40>>2]&127](x)|0;continue}else{c[D>>2]=B+1;continue}}t=a[l]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[l+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-q|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}c[j>>2]=Pl(C,c[o>>2]|0,h,s)|0;jj(l,g,c[r>>2]|0,h);if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}n=(x|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(!n){break}F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}if((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1){c[f>>2]=0;k=66;break}if(n^(B|0)==0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}}else{k=66}}while(0);if((k|0)==66?!n:0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}function og(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];pg(a,0,e,d,f,g,h);i=b;return}function pg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+256|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;x=m+32|0;l=m+40|0;d=m+56|0;o=m+72|0;q=m+80|0;r=m+240|0;p=m+248|0;s=c[g+4>>2]&74;if((s|0)==64){s=8}else if((s|0)==0){s=0}else if((s|0)==8){s=16}else{s=10}t=t|0;Xg(l,g,t,x);u=d;dn(u|0,0,12)|0;ve(d,10,0);if((a[u]&1)==0){v=d+1|0;C=v;w=d+8|0}else{w=d+8|0;C=c[w>>2]|0;v=d+1|0}c[o>>2]=C;g=q|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=d|0;z=d+4|0;A=a[x]|0;x=c[e>>2]|0;a:while(1){if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}D=(x|0)==0;B=c[f>>2]|0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(D){break}else{break a}}if(!((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=21;break}}else{k=21}}while(0);if((k|0)==21){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[o>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(d,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(d,C,0);if((a[u]&1)==0){C=v}else{C=c[w>>2]|0}c[o>>2]=C+D}D=x+12|0;F=c[D>>2]|0;E=x+16|0;if((F|0)==(c[E>>2]|0)){F=(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)&255}else{F=a[F]|0}if((xg(F,s,C,o,p,A,l,g,r,t)|0)!=0){break}B=c[D>>2]|0;if((B|0)==(c[E>>2]|0)){sc[c[(c[x>>2]|0)+40>>2]&127](x)|0;continue}else{c[D>>2]=B+1;continue}}t=a[l]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[l+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-q|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}F=Ol(C,c[o>>2]|0,h,s)|0;c[j>>2]=F;c[j+4>>2]=K;jj(l,g,c[r>>2]|0,h);if((x|0)!=0){if((c[x+12>>2]|0)==(c[x+16>>2]|0)?(sc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1:0){c[e>>2]=0;x=0}}else{x=0}n=(x|0)==0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(!n){break}F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}if((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1){c[f>>2]=0;k=66;break}if(n^(B|0)==0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}}else{k=66}}while(0);if((k|0)==66?!n:0){F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=x;te(d);te(l);i=m;return}function qg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];rg(a,0,e,d,f,g,h);i=b;return}function rg(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;n=i;i=i+280|0;C=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[C>>2];C=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[C>>2];C=n+32|0;z=n+40|0;d=n+48|0;m=n+64|0;r=n+80|0;q=n+88|0;s=n+248|0;t=n+256|0;p=n+264|0;v=n+272|0;u=n|0;Yg(d,h,u,C,z);w=m;dn(w|0,0,12)|0;ve(m,10,0);if((a[w]&1)==0){x=m+1|0;F=x;y=m+8|0}else{y=m+8|0;F=c[y>>2]|0;x=m+1|0}c[r>>2]=F;h=q|0;c[s>>2]=h;c[t>>2]=0;a[p]=1;a[v]=69;e=e|0;f=f|0;B=m|0;A=m+4|0;C=a[C]|0;D=a[z]|0;z=c[e>>2]|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1:0){c[e>>2]=0;z=0}}else{z=0}G=(z|0)==0;E=c[f>>2]|0;do{if((E|0)!=0){if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(G){break}else{break a}}if(!((sc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1)){if(G){break}else{break a}}else{c[f>>2]=0;l=17;break}}else{l=17}}while(0);if((l|0)==17){l=0;if(G){E=0;break}else{E=0}}G=a[w]|0;I=(G&1)==0;if(I){H=(G&255)>>>1}else{H=c[A>>2]|0}if(((c[r>>2]|0)-F|0)==(H|0)){if(I){F=(G&255)>>>1;G=(G&255)>>>1}else{G=c[A>>2]|0;F=G}ve(m,F<<1,0);if((a[w]&1)==0){F=10}else{F=(c[B>>2]&-2)-1|0}ve(m,F,0);if((a[w]&1)==0){F=x}else{F=c[y>>2]|0}c[r>>2]=F+G}H=z+12|0;I=c[H>>2]|0;G=z+16|0;if((I|0)==(c[G>>2]|0)){I=(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)&255}else{I=a[I]|0}if((Zg(I,p,v,F,r,C,D,d,h,s,t,u)|0)!=0){break}E=c[H>>2]|0;if((E|0)==(c[G>>2]|0)){sc[c[(c[z>>2]|0)+40>>2]&127](z)|0;continue}else{c[H>>2]=E+1;continue}}u=a[d]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[d+4>>2]|0}if(((u|0)!=0?(a[p]|0)!=0:0)?(o=c[s>>2]|0,(o-q|0)<160):0){I=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=I}g[k>>2]=+Nl(F,c[r>>2]|0,j);jj(d,h,c[s>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1:0){c[e>>2]=0;z=0}}else{z=0}k=(z|0)==0;do{if((E|0)!=0){if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(!k){break}I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}if((sc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1){c[f>>2]=0;l=63;break}if(k^(E|0)==0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}}else{l=63}}while(0);if((l|0)==63?!k:0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}function sg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];tg(a,0,e,d,f,g,h);i=b;return}function tg(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;n=i;i=i+280|0;C=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[C>>2];C=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[C>>2];C=n+32|0;z=n+40|0;d=n+48|0;m=n+64|0;r=n+80|0;q=n+88|0;s=n+248|0;t=n+256|0;p=n+264|0;v=n+272|0;u=n|0;Yg(d,g,u,C,z);w=m;dn(w|0,0,12)|0;ve(m,10,0);if((a[w]&1)==0){x=m+1|0;F=x;y=m+8|0}else{y=m+8|0;F=c[y>>2]|0;x=m+1|0}c[r>>2]=F;g=q|0;c[s>>2]=g;c[t>>2]=0;a[p]=1;a[v]=69;e=e|0;f=f|0;B=m|0;A=m+4|0;C=a[C]|0;D=a[z]|0;z=c[e>>2]|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1:0){c[e>>2]=0;z=0}}else{z=0}G=(z|0)==0;E=c[f>>2]|0;do{if((E|0)!=0){if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(G){break}else{break a}}if(!((sc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1)){if(G){break}else{break a}}else{c[f>>2]=0;l=17;break}}else{l=17}}while(0);if((l|0)==17){l=0;if(G){E=0;break}else{E=0}}G=a[w]|0;I=(G&1)==0;if(I){H=(G&255)>>>1}else{H=c[A>>2]|0}if(((c[r>>2]|0)-F|0)==(H|0)){if(I){F=(G&255)>>>1;G=(G&255)>>>1}else{G=c[A>>2]|0;F=G}ve(m,F<<1,0);if((a[w]&1)==0){F=10}else{F=(c[B>>2]&-2)-1|0}ve(m,F,0);if((a[w]&1)==0){F=x}else{F=c[y>>2]|0}c[r>>2]=F+G}H=z+12|0;I=c[H>>2]|0;G=z+16|0;if((I|0)==(c[G>>2]|0)){I=(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)&255}else{I=a[I]|0}if((Zg(I,p,v,F,r,C,D,d,g,s,t,u)|0)!=0){break}E=c[H>>2]|0;if((E|0)==(c[G>>2]|0)){sc[c[(c[z>>2]|0)+40>>2]&127](z)|0;continue}else{c[H>>2]=E+1;continue}}u=a[d]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[d+4>>2]|0}if(((u|0)!=0?(a[p]|0)!=0:0)?(o=c[s>>2]|0,(o-q|0)<160):0){I=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=I}h[k>>3]=+Ml(F,c[r>>2]|0,j);jj(d,g,c[s>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1:0){c[e>>2]=0;z=0}}else{z=0}k=(z|0)==0;do{if((E|0)!=0){if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(!k){break}I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}if((sc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1){c[f>>2]=0;l=63;break}if(k^(E|0)==0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}}else{l=63}}while(0);if((l|0)==63?!k:0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}function ug(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];vg(a,0,e,d,f,g,h);i=b;return}function vg(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;n=i;i=i+280|0;C=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[C>>2];C=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[C>>2];C=n+32|0;z=n+40|0;d=n+48|0;m=n+64|0;r=n+80|0;q=n+88|0;s=n+248|0;t=n+256|0;p=n+264|0;v=n+272|0;u=n|0;Yg(d,g,u,C,z);w=m;dn(w|0,0,12)|0;ve(m,10,0);if((a[w]&1)==0){x=m+1|0;F=x;y=m+8|0}else{y=m+8|0;F=c[y>>2]|0;x=m+1|0}c[r>>2]=F;g=q|0;c[s>>2]=g;c[t>>2]=0;a[p]=1;a[v]=69;e=e|0;f=f|0;B=m|0;A=m+4|0;C=a[C]|0;D=a[z]|0;z=c[e>>2]|0;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1:0){c[e>>2]=0;z=0}}else{z=0}G=(z|0)==0;E=c[f>>2]|0;do{if((E|0)!=0){if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(G){break}else{break a}}if(!((sc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1)){if(G){break}else{break a}}else{c[f>>2]=0;l=17;break}}else{l=17}}while(0);if((l|0)==17){l=0;if(G){E=0;break}else{E=0}}G=a[w]|0;I=(G&1)==0;if(I){H=(G&255)>>>1}else{H=c[A>>2]|0}if(((c[r>>2]|0)-F|0)==(H|0)){if(I){F=(G&255)>>>1;G=(G&255)>>>1}else{G=c[A>>2]|0;F=G}ve(m,F<<1,0);if((a[w]&1)==0){F=10}else{F=(c[B>>2]&-2)-1|0}ve(m,F,0);if((a[w]&1)==0){F=x}else{F=c[y>>2]|0}c[r>>2]=F+G}H=z+12|0;I=c[H>>2]|0;G=z+16|0;if((I|0)==(c[G>>2]|0)){I=(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)&255}else{I=a[I]|0}if((Zg(I,p,v,F,r,C,D,d,g,s,t,u)|0)!=0){break}E=c[H>>2]|0;if((E|0)==(c[G>>2]|0)){sc[c[(c[z>>2]|0)+40>>2]&127](z)|0;continue}else{c[H>>2]=E+1;continue}}u=a[d]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[d+4>>2]|0}if(((u|0)!=0?(a[p]|0)!=0:0)?(o=c[s>>2]|0,(o-q|0)<160):0){I=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=I}h[k>>3]=+Ll(F,c[r>>2]|0,j);jj(d,g,c[s>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1:0){c[e>>2]=0;z=0}}else{z=0}k=(z|0)==0;do{if((E|0)!=0){if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(!k){break}I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}if((sc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1){c[f>>2]=0;l=63;break}if(k^(E|0)==0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}}else{l=63}}while(0);if((l|0)==63?!k:0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}function wg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;m=i;i=i+272|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[u>>2];u=m|0;q=m+16|0;l=m+48|0;s=m+64|0;d=m+72|0;n=m+88|0;t=m+96|0;o=m+256|0;p=m+264|0;dn(l|0,0,12)|0;Ne(s,g);g=s|0;s=c[g>>2]|0;if(!((c[3402]|0)==-1)){c[u>>2]=13608;c[u+4>>2]=14;c[u+8>>2]=0;oe(13608,u,96)}u=(c[3403]|0)-1|0;v=c[s+8>>2]|0;if((c[s+12>>2]|0)-v>>2>>>0>u>>>0?(r=c[v+(u<<2)>>2]|0,(r|0)!=0):0){q=q|0;Ac[c[(c[r>>2]|0)+32>>2]&15](r,9864,9890,q)|0;Wd(c[g>>2]|0)|0;r=d;dn(r|0,0,12)|0;ve(d,10,0);if((a[r]&1)==0){g=d+1|0;x=g;s=d+8|0}else{s=d+8|0;x=c[s>>2]|0;g=d+1|0}c[n>>2]=x;t=t|0;c[o>>2]=t;c[p>>2]=0;e=e|0;f=f|0;v=d|0;u=d+4|0;w=c[e>>2]|0;a:while(1){if((w|0)!=0){if((c[w+12>>2]|0)==(c[w+16>>2]|0)?(sc[c[(c[w>>2]|0)+36>>2]&127](w)|0)==-1:0){c[e>>2]=0;w=0}}else{w=0}y=(w|0)==0;z=c[f>>2]|0;do{if((z|0)!=0){if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(y){break}else{break a}}if(!((sc[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1)){if(y){break}else{break a}}else{c[f>>2]=0;k=25;break}}else{k=25}}while(0);if((k|0)==25?(k=0,y):0){break}y=a[r]|0;A=(y&1)==0;if(A){z=(y&255)>>>1}else{z=c[u>>2]|0}if(((c[n>>2]|0)-x|0)==(z|0)){if(A){x=(y&255)>>>1;y=(y&255)>>>1}else{y=c[u>>2]|0;x=y}ve(d,x<<1,0);if((a[r]&1)==0){x=10}else{x=(c[v>>2]&-2)-1|0}ve(d,x,0);if((a[r]&1)==0){x=g}else{x=c[s>>2]|0}c[n>>2]=x+y}y=w+12|0;A=c[y>>2]|0;z=w+16|0;if((A|0)==(c[z>>2]|0)){A=(sc[c[(c[w>>2]|0)+36>>2]&127](w)|0)&255}else{A=a[A]|0}if((xg(A,16,x,n,p,0,l,t,o,q)|0)!=0){break}A=c[y>>2]|0;if((A|0)==(c[z>>2]|0)){sc[c[(c[w>>2]|0)+40>>2]&127](w)|0;continue}else{c[y>>2]=A+1;continue}}a[x+3|0]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}A=yg(x,c[3016]|0,1248,(z=i,i=i+8|0,c[z>>2]=j,z)|0)|0;i=z;if((A|0)!=1){c[h>>2]=4}j=c[e>>2]|0;if((j|0)!=0){if((c[j+12>>2]|0)==(c[j+16>>2]|0)?(sc[c[(c[j>>2]|0)+36>>2]&127](j)|0)==-1:0){c[e>>2]=0;j=0}}else{j=0}n=(j|0)==0;o=c[f>>2]|0;do{if((o|0)!=0){if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){if(!n){break}A=b|0;c[A>>2]=j;te(d);te(l);i=m;return}if((sc[c[(c[o>>2]|0)+36>>2]&127](o)|0)==-1){c[f>>2]=0;k=73;break}if(n^(o|0)==0){A=b|0;c[A>>2]=j;te(d);te(l);i=m;return}}else{k=73}}while(0);if((k|0)==73?!n:0){A=b|0;c[A>>2]=j;te(d);te(l);i=m;return}c[h>>2]=c[h>>2]|2;A=b|0;c[A>>2]=j;te(d);te(l);i=m;return}A=cc(4)|0;nm(A);zb(A|0,8296,130)}function xg(b,d,e,f,g,h,i,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0;n=c[f>>2]|0;m=(n|0)==(e|0);do{if(m){o=(a[l+24|0]|0)==b<<24>>24;if(!o?!((a[l+25|0]|0)==b<<24>>24):0){break}c[f>>2]=e+1;a[e]=o?43:45;c[g>>2]=0;o=0;return o|0}}while(0);o=a[i]|0;if((o&1)==0){i=(o&255)>>>1}else{i=c[i+4>>2]|0}if((i|0)!=0&b<<24>>24==h<<24>>24){e=c[k>>2]|0;if((e-j|0)>=160){o=0;return o|0}o=c[g>>2]|0;c[k>>2]=e+4;c[e>>2]=o;c[g>>2]=0;o=0;return o|0}k=l+26|0;j=l;while(1){h=j+1|0;if((a[j]|0)==b<<24>>24){break}if((h|0)==(k|0)){j=k;break}else{j=h}}l=j-l|0;if((l|0)>23){o=-1;return o|0}if((d|0)==16){if((l|0)>=22){if(m){o=-1;return o|0}if((n-e|0)>=3){o=-1;return o|0}if((a[n-1|0]|0)!=48){o=-1;return o|0}c[g>>2]=0;o=a[9864+l|0]|0;c[f>>2]=n+1;a[n]=o;o=0;return o|0}}else if((d|0)==8|(d|0)==10?(l|0)>=(d|0):0){o=-1;return o|0}o=a[9864+l|0]|0;c[f>>2]=n+1;a[n]=o;c[g>>2]=(c[g>>2]|0)+1;o=0;return o|0}function yg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;b=Rb(b|0)|0;d=Za(a|0,d|0,g|0)|0;if((b|0)==0){i=f;return d|0}Rb(b|0)|0;i=f;return d|0}function zg(a){a=a|0;Ud(a|0);Pm(a);return}function Ag(a){a=a|0;Ud(a|0);return}function Bg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;k=i;i=i+112|0;o=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[o>>2];o=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[o>>2];o=k|0;r=k+16|0;s=k+32|0;v=k+40|0;w=k+48|0;t=k+56|0;u=k+64|0;p=k+72|0;m=k+80|0;n=k+104|0;if((c[g+4>>2]&1|0)==0){c[s>>2]=-1;r=c[(c[d>>2]|0)+16>>2]|0;u=e|0;c[w>>2]=c[u>>2];c[t>>2]=c[f>>2];mc[r&127](v,d,w,t,g,h,s);e=c[v>>2]|0;c[u>>2]=e;f=c[s>>2]|0;if((f|0)==1){a[j]=1}else if((f|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=e;i=k;return}Ne(u,g);s=u|0;t=c[s>>2]|0;if(!((c[3400]|0)==-1)){c[r>>2]=13600;c[r+4>>2]=14;c[r+8>>2]=0;oe(13600,r,96)}r=(c[3401]|0)-1|0;u=c[t+8>>2]|0;if((c[t+12>>2]|0)-u>>2>>>0>r>>>0?(q=c[u+(r<<2)>>2]|0,(q|0)!=0):0){Wd(c[s>>2]|0)|0;Ne(p,g);g=p|0;p=c[g>>2]|0;if(!((c[3304]|0)==-1)){c[o>>2]=13216;c[o+4>>2]=14;c[o+8>>2]=0;oe(13216,o,96)}r=(c[3305]|0)-1|0;o=c[p+8>>2]|0;if((c[p+12>>2]|0)-o>>2>>>0>r>>>0?(l=c[o+(r<<2)>>2]|0,(l|0)!=0):0){w=l;Wd(c[g>>2]|0)|0;d=m|0;v=l;oc[c[(c[v>>2]|0)+24>>2]&127](d,w);oc[c[(c[v>>2]|0)+28>>2]&127](m+12|0,w);c[n>>2]=c[f>>2];a[j]=(Cg(e,n,d,m+24|0,q,h,1)|0)==(d|0)|0;c[b>>2]=c[e>>2];Ee(m+12|0);Ee(m|0);i=k;return}d=cc(4)|0;nm(d);zb(d|0,8296,130)}d=cc(4)|0;nm(d);zb(d|0,8296,130)}function Cg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;l=i;i=i+104|0;u=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[u>>2];u=(f-e|0)/12|0;n=l|0;if(u>>>0>100>>>0){m=Im(u)|0;if((m|0)==0){Um();n=0;m=0}else{n=m}}else{m=0}o=(e|0)==(f|0);if(o){t=0}else{t=0;p=n;q=e;while(1){r=a[q]|0;if((r&1)==0){r=(r&255)>>>1}else{r=c[q+4>>2]|0}if((r|0)==0){a[p]=2;t=t+1|0;u=u-1|0}else{a[p]=1}q=q+12|0;if((q|0)==(f|0)){break}else{p=p+1|0}}}b=b|0;d=d|0;p=g;q=0;a:while(1){r=c[b>>2]|0;do{if((r|0)!=0){s=c[r+12>>2]|0;if((s|0)==(c[r+16>>2]|0)){r=sc[c[(c[r>>2]|0)+36>>2]&127](r)|0}else{r=c[s>>2]|0}if((r|0)==-1){c[b>>2]=0;s=1;break}else{s=(c[b>>2]|0)==0;break}}else{s=1}}while(0);r=c[d>>2]|0;if((r|0)!=0){v=c[r+12>>2]|0;if((v|0)==(c[r+16>>2]|0)){v=sc[c[(c[r>>2]|0)+36>>2]&127](r)|0}else{v=c[v>>2]|0}if((v|0)==-1){c[d>>2]=0;w=1;r=0}else{w=0}}else{w=1;r=0}v=c[b>>2]|0;if(!((s^w)&(u|0)!=0)){break}r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){s=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{s=c[r>>2]|0}if(!j){s=pc[c[(c[p>>2]|0)+28>>2]&63](g,s)|0}r=q+1|0;if(o){q=r;continue}b:do{if(j){v=n;x=0;w=e;while(1){do{if((a[v]|0)==1){z=a[w]|0;A=(z&1)==0;if(A){y=w+4|0}else{y=c[w+8>>2]|0}if((s|0)!=(c[y+(q<<2)>>2]|0)){a[v]=0;u=u-1|0;break}if(A){x=(z&255)>>>1}else{x=c[w+4>>2]|0}if((x|0)==(r|0)){a[v]=2;x=1;t=t+1|0;u=u-1|0}else{x=1}}}while(0);w=w+12|0;if((w|0)==(f|0)){s=u;break b}v=v+1|0}}else{v=n;x=0;w=e;while(1){do{if((a[v]|0)==1){y=w;if((a[y]&1)==0){z=w+4|0}else{z=c[w+8>>2]|0}if((s|0)!=(pc[c[(c[p>>2]|0)+28>>2]&63](g,c[z+(q<<2)>>2]|0)|0)){a[v]=0;u=u-1|0;break}x=a[y]|0;if((x&1)==0){x=(x&255)>>>1}else{x=c[w+4>>2]|0}if((x|0)==(r|0)){a[v]=2;x=1;t=t+1|0;u=u-1|0}else{x=1}}}while(0);w=w+12|0;if((w|0)==(f|0)){s=u;break b}v=v+1|0}}}while(0);if(!x){q=r;u=s;continue}v=c[b>>2]|0;u=v+12|0;q=c[u>>2]|0;if((q|0)==(c[v+16>>2]|0)){sc[c[(c[v>>2]|0)+40>>2]&127](v)|0}else{c[u>>2]=q+4}if((s+t|0)>>>0<2>>>0){q=r;u=s;continue}else{q=n;u=e}while(1){if((a[q]|0)==2){v=a[u]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[u+4>>2]|0}if((v|0)!=(r|0)){a[q]=0;t=t-1|0}}u=u+12|0;if((u|0)==(f|0)){q=r;u=s;continue a}else{q=q+1|0}}}do{if((v|0)!=0){g=c[v+12>>2]|0;if((g|0)==(c[v+16>>2]|0)){g=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{g=c[g>>2]|0}if((g|0)==-1){c[b>>2]=0;g=1;break}else{g=(c[b>>2]|0)==0;break}}else{g=1}}while(0);do{if((r|0)!=0){j=c[r+12>>2]|0;if((j|0)==(c[r+16>>2]|0)){j=sc[c[(c[r>>2]|0)+36>>2]&127](r)|0}else{j=c[j>>2]|0}if(!((j|0)==-1)){if(g){break}else{k=96;break}}else{c[d>>2]=0;k=94;break}}else{k=94}}while(0);if((k|0)==94?g:0){k=96}if((k|0)==96){c[h>>2]=c[h>>2]|2}c:do{if(!o){if((a[n]|0)==2){f=e}else{while(1){e=e+12|0;n=n+1|0;if((e|0)==(f|0)){k=101;break c}if((a[n]|0)==2){f=e;break}}}}else{k=101}}while(0);if((k|0)==101){c[h>>2]=c[h>>2]|4}if((m|0)==0){i=l;return f|0}Jm(m);i=l;return f|0}function Dg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Eg(a,0,e,d,f,g,h);i=b;return}function Eg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+328|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;v=m+104|0;d=m+112|0;l=m+128|0;q=m+144|0;o=m+152|0;r=m+312|0;p=m+320|0;s=c[g+4>>2]&74;if((s|0)==8){s=16}else if((s|0)==64){s=8}else if((s|0)==0){s=0}else{s=10}t=t|0;_g(d,g,t,v);u=l;dn(u|0,0,12)|0;ve(l,10,0);if((a[u]&1)==0){w=l+1|0;C=w;x=l+8|0}else{x=l+8|0;C=c[x>>2]|0;w=l+1|0}c[q>>2]=C;g=o|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=l|0;z=l+4|0;A=c[v>>2]|0;v=c[e>>2]|0;a:while(1){if((v|0)!=0){B=c[v+12>>2]|0;if((B|0)==(c[v+16>>2]|0)){B=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{B=c[B>>2]|0}if((B|0)==-1){c[e>>2]=0;D=1;v=0}else{D=0}}else{D=1;v=0}B=c[f>>2]|0;do{if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=22;break}}else{k=22}}while(0);if((k|0)==22){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[q>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(l,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(l,C,0);if((a[u]&1)==0){C=w}else{C=c[x>>2]|0}c[q>>2]=C+D}E=v+12|0;F=c[E>>2]|0;D=v+16|0;if((F|0)==(c[D>>2]|0)){F=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{F=c[F>>2]|0}if((Wg(F,s,C,q,p,A,d,g,r,t)|0)!=0){break}B=c[E>>2]|0;if((B|0)==(c[D>>2]|0)){sc[c[(c[v>>2]|0)+40>>2]&127](v)|0;continue}else{c[E>>2]=B+4;continue}}t=a[d]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[d+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-o|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}c[j>>2]=Tl(C,c[q>>2]|0,h,s)|0;jj(d,g,c[r>>2]|0,h);if((v|0)!=0){n=c[v+12>>2]|0;if((n|0)==(c[v+16>>2]|0)){n=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{n=c[n>>2]|0}if((n|0)==-1){c[e>>2]=0;n=1;v=0}else{n=0}}else{n=1;v=0}do{if((B|0)!=0){j=c[B+12>>2]|0;if((j|0)==(c[B+16>>2]|0)){j=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[f>>2]=0;k=67;break}if(n){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}}else{k=67}}while(0);if((k|0)==67?!n:0){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}function Fg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Gg(a,0,e,d,f,g,h);i=b;return}function Gg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+328|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;v=m+104|0;d=m+112|0;l=m+128|0;q=m+144|0;o=m+152|0;r=m+312|0;p=m+320|0;s=c[g+4>>2]&74;if((s|0)==8){s=16}else if((s|0)==0){s=0}else if((s|0)==64){s=8}else{s=10}t=t|0;_g(d,g,t,v);u=l;dn(u|0,0,12)|0;ve(l,10,0);if((a[u]&1)==0){w=l+1|0;C=w;x=l+8|0}else{x=l+8|0;C=c[x>>2]|0;w=l+1|0}c[q>>2]=C;g=o|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=l|0;z=l+4|0;A=c[v>>2]|0;v=c[e>>2]|0;a:while(1){if((v|0)!=0){B=c[v+12>>2]|0;if((B|0)==(c[v+16>>2]|0)){B=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{B=c[B>>2]|0}if((B|0)==-1){c[e>>2]=0;D=1;v=0}else{D=0}}else{D=1;v=0}B=c[f>>2]|0;do{if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=22;break}}else{k=22}}while(0);if((k|0)==22){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[q>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(l,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(l,C,0);if((a[u]&1)==0){C=w}else{C=c[x>>2]|0}c[q>>2]=C+D}E=v+12|0;F=c[E>>2]|0;D=v+16|0;if((F|0)==(c[D>>2]|0)){F=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{F=c[F>>2]|0}if((Wg(F,s,C,q,p,A,d,g,r,t)|0)!=0){break}B=c[E>>2]|0;if((B|0)==(c[D>>2]|0)){sc[c[(c[v>>2]|0)+40>>2]&127](v)|0;continue}else{c[E>>2]=B+4;continue}}t=a[d]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[d+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-o|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}F=Sl(C,c[q>>2]|0,h,s)|0;c[j>>2]=F;c[j+4>>2]=K;jj(d,g,c[r>>2]|0,h);if((v|0)!=0){n=c[v+12>>2]|0;if((n|0)==(c[v+16>>2]|0)){n=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{n=c[n>>2]|0}if((n|0)==-1){c[e>>2]=0;n=1;v=0}else{n=0}}else{n=1;v=0}do{if((B|0)!=0){j=c[B+12>>2]|0;if((j|0)==(c[B+16>>2]|0)){j=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[f>>2]=0;k=67;break}if(n){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}}else{k=67}}while(0);if((k|0)==67?!n:0){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}function Hg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Ig(a,0,e,d,f,g,h);i=b;return}function Ig(d,e,f,g,h,j,k){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;n=i;i=i+328|0;u=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[u>>2];u=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[u>>2];u=n|0;w=n+104|0;e=n+112|0;m=n+128|0;r=n+144|0;p=n+152|0;s=n+312|0;q=n+320|0;t=c[h+4>>2]&74;if((t|0)==8){t=16}else if((t|0)==64){t=8}else if((t|0)==0){t=0}else{t=10}u=u|0;_g(e,h,u,w);v=m;dn(v|0,0,12)|0;ve(m,10,0);if((a[v]&1)==0){x=m+1|0;D=x;y=m+8|0}else{y=m+8|0;D=c[y>>2]|0;x=m+1|0}c[r>>2]=D;h=p|0;c[s>>2]=h;c[q>>2]=0;f=f|0;g=g|0;z=m|0;A=m+4|0;B=c[w>>2]|0;w=c[f>>2]|0;a:while(1){if((w|0)!=0){C=c[w+12>>2]|0;if((C|0)==(c[w+16>>2]|0)){C=sc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{C=c[C>>2]|0}if((C|0)==-1){c[f>>2]=0;E=1;w=0}else{E=0}}else{E=1;w=0}C=c[g>>2]|0;do{if((C|0)!=0){F=c[C+12>>2]|0;if((F|0)==(c[C+16>>2]|0)){F=sc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{F=c[F>>2]|0}if(!((F|0)==-1)){if(E){break}else{break a}}else{c[g>>2]=0;l=22;break}}else{l=22}}while(0);if((l|0)==22){l=0;if(E){C=0;break}else{C=0}}E=a[v]|0;G=(E&1)==0;if(G){F=(E&255)>>>1}else{F=c[A>>2]|0}if(((c[r>>2]|0)-D|0)==(F|0)){if(G){D=(E&255)>>>1;E=(E&255)>>>1}else{E=c[A>>2]|0;D=E}ve(m,D<<1,0);if((a[v]&1)==0){D=10}else{D=(c[z>>2]&-2)-1|0}ve(m,D,0);if((a[v]&1)==0){D=x}else{D=c[y>>2]|0}c[r>>2]=D+E}F=w+12|0;G=c[F>>2]|0;E=w+16|0;if((G|0)==(c[E>>2]|0)){G=sc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{G=c[G>>2]|0}if((Wg(G,t,D,r,q,B,e,h,s,u)|0)!=0){break}C=c[F>>2]|0;if((C|0)==(c[E>>2]|0)){sc[c[(c[w>>2]|0)+40>>2]&127](w)|0;continue}else{c[F>>2]=C+4;continue}}u=a[e]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[e+4>>2]|0}if((u|0)!=0?(o=c[s>>2]|0,(o-p|0)<160):0){G=c[q>>2]|0;c[s>>2]=o+4;c[o>>2]=G}b[k>>1]=Rl(D,c[r>>2]|0,j,t)|0;jj(e,h,c[s>>2]|0,j);if((w|0)!=0){o=c[w+12>>2]|0;if((o|0)==(c[w+16>>2]|0)){o=sc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{o=c[o>>2]|0}if((o|0)==-1){c[f>>2]=0;o=1;w=0}else{o=0}}else{o=1;w=0}do{if((C|0)!=0){k=c[C+12>>2]|0;if((k|0)==(c[C+16>>2]|0)){k=sc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{k=c[k>>2]|0}if((k|0)==-1){c[g>>2]=0;l=67;break}if(o){G=d|0;c[G>>2]=w;te(m);te(e);i=n;return}}else{l=67}}while(0);if((l|0)==67?!o:0){G=d|0;c[G>>2]=w;te(m);te(e);i=n;return}c[j>>2]=c[j>>2]|2;G=d|0;c[G>>2]=w;te(m);te(e);i=n;return}function Jg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Kg(a,0,e,d,f,g,h);i=b;return}function Kg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+328|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;v=m+104|0;d=m+112|0;l=m+128|0;q=m+144|0;o=m+152|0;r=m+312|0;p=m+320|0;s=c[g+4>>2]&74;if((s|0)==8){s=16}else if((s|0)==64){s=8}else if((s|0)==0){s=0}else{s=10}t=t|0;_g(d,g,t,v);u=l;dn(u|0,0,12)|0;ve(l,10,0);if((a[u]&1)==0){w=l+1|0;C=w;x=l+8|0}else{x=l+8|0;C=c[x>>2]|0;w=l+1|0}c[q>>2]=C;g=o|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=l|0;z=l+4|0;A=c[v>>2]|0;v=c[e>>2]|0;a:while(1){if((v|0)!=0){B=c[v+12>>2]|0;if((B|0)==(c[v+16>>2]|0)){B=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{B=c[B>>2]|0}if((B|0)==-1){c[e>>2]=0;D=1;v=0}else{D=0}}else{D=1;v=0}B=c[f>>2]|0;do{if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=22;break}}else{k=22}}while(0);if((k|0)==22){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[q>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(l,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(l,C,0);if((a[u]&1)==0){C=w}else{C=c[x>>2]|0}c[q>>2]=C+D}E=v+12|0;F=c[E>>2]|0;D=v+16|0;if((F|0)==(c[D>>2]|0)){F=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{F=c[F>>2]|0}if((Wg(F,s,C,q,p,A,d,g,r,t)|0)!=0){break}B=c[E>>2]|0;if((B|0)==(c[D>>2]|0)){sc[c[(c[v>>2]|0)+40>>2]&127](v)|0;continue}else{c[E>>2]=B+4;continue}}t=a[d]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[d+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-o|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}c[j>>2]=Ql(C,c[q>>2]|0,h,s)|0;jj(d,g,c[r>>2]|0,h);if((v|0)!=0){n=c[v+12>>2]|0;if((n|0)==(c[v+16>>2]|0)){n=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{n=c[n>>2]|0}if((n|0)==-1){c[e>>2]=0;n=1;v=0}else{n=0}}else{n=1;v=0}do{if((B|0)!=0){j=c[B+12>>2]|0;if((j|0)==(c[B+16>>2]|0)){j=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[f>>2]=0;k=67;break}if(n){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}}else{k=67}}while(0);if((k|0)==67?!n:0){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}function Lg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Mg(a,0,e,d,f,g,h);i=b;return}function Mg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+328|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;v=m+104|0;d=m+112|0;l=m+128|0;q=m+144|0;o=m+152|0;r=m+312|0;p=m+320|0;s=c[g+4>>2]&74;if((s|0)==8){s=16}else if((s|0)==0){s=0}else if((s|0)==64){s=8}else{s=10}t=t|0;_g(d,g,t,v);u=l;dn(u|0,0,12)|0;ve(l,10,0);if((a[u]&1)==0){w=l+1|0;C=w;x=l+8|0}else{x=l+8|0;C=c[x>>2]|0;w=l+1|0}c[q>>2]=C;g=o|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=l|0;z=l+4|0;A=c[v>>2]|0;v=c[e>>2]|0;a:while(1){if((v|0)!=0){B=c[v+12>>2]|0;if((B|0)==(c[v+16>>2]|0)){B=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{B=c[B>>2]|0}if((B|0)==-1){c[e>>2]=0;D=1;v=0}else{D=0}}else{D=1;v=0}B=c[f>>2]|0;do{if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=22;break}}else{k=22}}while(0);if((k|0)==22){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[q>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(l,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(l,C,0);if((a[u]&1)==0){C=w}else{C=c[x>>2]|0}c[q>>2]=C+D}E=v+12|0;F=c[E>>2]|0;D=v+16|0;if((F|0)==(c[D>>2]|0)){F=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{F=c[F>>2]|0}if((Wg(F,s,C,q,p,A,d,g,r,t)|0)!=0){break}B=c[E>>2]|0;if((B|0)==(c[D>>2]|0)){sc[c[(c[v>>2]|0)+40>>2]&127](v)|0;continue}else{c[E>>2]=B+4;continue}}t=a[d]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[d+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-o|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}c[j>>2]=Pl(C,c[q>>2]|0,h,s)|0;jj(d,g,c[r>>2]|0,h);if((v|0)!=0){n=c[v+12>>2]|0;if((n|0)==(c[v+16>>2]|0)){n=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{n=c[n>>2]|0}if((n|0)==-1){c[e>>2]=0;n=1;v=0}else{n=0}}else{n=1;v=0}do{if((B|0)!=0){j=c[B+12>>2]|0;if((j|0)==(c[B+16>>2]|0)){j=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[f>>2]=0;k=67;break}if(n){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}}else{k=67}}while(0);if((k|0)==67?!n:0){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}function Ng(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Og(a,0,e,d,f,g,h);i=b;return}function Og(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+328|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=m|0;v=m+104|0;d=m+112|0;l=m+128|0;q=m+144|0;o=m+152|0;r=m+312|0;p=m+320|0;s=c[g+4>>2]&74;if((s|0)==8){s=16}else if((s|0)==0){s=0}else if((s|0)==64){s=8}else{s=10}t=t|0;_g(d,g,t,v);u=l;dn(u|0,0,12)|0;ve(l,10,0);if((a[u]&1)==0){w=l+1|0;C=w;x=l+8|0}else{x=l+8|0;C=c[x>>2]|0;w=l+1|0}c[q>>2]=C;g=o|0;c[r>>2]=g;c[p>>2]=0;e=e|0;f=f|0;y=l|0;z=l+4|0;A=c[v>>2]|0;v=c[e>>2]|0;a:while(1){if((v|0)!=0){B=c[v+12>>2]|0;if((B|0)==(c[v+16>>2]|0)){B=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{B=c[B>>2]|0}if((B|0)==-1){c[e>>2]=0;D=1;v=0}else{D=0}}else{D=1;v=0}B=c[f>>2]|0;do{if((B|0)!=0){E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){E=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{E=c[E>>2]|0}if(!((E|0)==-1)){if(D){break}else{break a}}else{c[f>>2]=0;k=22;break}}else{k=22}}while(0);if((k|0)==22){k=0;if(D){B=0;break}else{B=0}}D=a[u]|0;F=(D&1)==0;if(F){E=(D&255)>>>1}else{E=c[z>>2]|0}if(((c[q>>2]|0)-C|0)==(E|0)){if(F){C=(D&255)>>>1;D=(D&255)>>>1}else{D=c[z>>2]|0;C=D}ve(l,C<<1,0);if((a[u]&1)==0){C=10}else{C=(c[y>>2]&-2)-1|0}ve(l,C,0);if((a[u]&1)==0){C=w}else{C=c[x>>2]|0}c[q>>2]=C+D}E=v+12|0;F=c[E>>2]|0;D=v+16|0;if((F|0)==(c[D>>2]|0)){F=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{F=c[F>>2]|0}if((Wg(F,s,C,q,p,A,d,g,r,t)|0)!=0){break}B=c[E>>2]|0;if((B|0)==(c[D>>2]|0)){sc[c[(c[v>>2]|0)+40>>2]&127](v)|0;continue}else{c[E>>2]=B+4;continue}}t=a[d]|0;if((t&1)==0){t=(t&255)>>>1}else{t=c[d+4>>2]|0}if((t|0)!=0?(n=c[r>>2]|0,(n-o|0)<160):0){F=c[p>>2]|0;c[r>>2]=n+4;c[n>>2]=F}F=Ol(C,c[q>>2]|0,h,s)|0;c[j>>2]=F;c[j+4>>2]=K;jj(d,g,c[r>>2]|0,h);if((v|0)!=0){n=c[v+12>>2]|0;if((n|0)==(c[v+16>>2]|0)){n=sc[c[(c[v>>2]|0)+36>>2]&127](v)|0}else{n=c[n>>2]|0}if((n|0)==-1){c[e>>2]=0;n=1;v=0}else{n=0}}else{n=1;v=0}do{if((B|0)!=0){j=c[B+12>>2]|0;if((j|0)==(c[B+16>>2]|0)){j=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[f>>2]=0;k=67;break}if(n){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}}else{k=67}}while(0);if((k|0)==67?!n:0){F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}c[h>>2]=c[h>>2]|2;F=b|0;c[F>>2]=v;te(l);te(d);i=m;return}function Pg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Qg(a,0,e,d,f,g,h);i=b;return}function Qg(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;n=i;i=i+376|0;C=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[C>>2];C=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[C>>2];C=n+128|0;z=n+136|0;d=n+144|0;m=n+160|0;s=n+176|0;q=n+184|0;r=n+344|0;p=n+352|0;t=n+360|0;u=n+368|0;v=n|0;$g(d,h,v,C,z);w=m;dn(w|0,0,12)|0;ve(m,10,0);if((a[w]&1)==0){x=m+1|0;F=x;y=m+8|0}else{y=m+8|0;F=c[y>>2]|0;x=m+1|0}c[s>>2]=F;h=q|0;c[r>>2]=h;c[p>>2]=0;a[t]=1;a[u]=69;e=e|0;f=f|0;B=m|0;A=m+4|0;C=c[C>>2]|0;D=c[z>>2]|0;z=c[e>>2]|0;a:while(1){if((z|0)!=0){E=c[z+12>>2]|0;if((E|0)==(c[z+16>>2]|0)){E=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{E=c[E>>2]|0}if((E|0)==-1){c[e>>2]=0;G=1;z=0}else{G=0}}else{G=1;z=0}E=c[f>>2]|0;do{if((E|0)!=0){H=c[E+12>>2]|0;if((H|0)==(c[E+16>>2]|0)){H=sc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{H=c[H>>2]|0}if(!((H|0)==-1)){if(G){break}else{break a}}else{c[f>>2]=0;l=18;break}}else{l=18}}while(0);if((l|0)==18){l=0;if(G){E=0;break}else{E=0}}G=a[w]|0;I=(G&1)==0;if(I){H=(G&255)>>>1}else{H=c[A>>2]|0}if(((c[s>>2]|0)-F|0)==(H|0)){if(I){F=(G&255)>>>1;G=(G&255)>>>1}else{G=c[A>>2]|0;F=G}ve(m,F<<1,0);if((a[w]&1)==0){F=10}else{F=(c[B>>2]&-2)-1|0}ve(m,F,0);if((a[w]&1)==0){F=x}else{F=c[y>>2]|0}c[s>>2]=F+G}G=z+12|0;I=c[G>>2]|0;H=z+16|0;if((I|0)==(c[H>>2]|0)){I=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{I=c[I>>2]|0}if((ah(I,t,u,F,s,C,D,d,h,r,p,v)|0)!=0){break}E=c[G>>2]|0;if((E|0)==(c[H>>2]|0)){sc[c[(c[z>>2]|0)+40>>2]&127](z)|0;continue}else{c[G>>2]=E+4;continue}}u=a[d]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[d+4>>2]|0}if(((u|0)!=0?(a[t]|0)!=0:0)?(o=c[r>>2]|0,(o-q|0)<160):0){I=c[p>>2]|0;c[r>>2]=o+4;c[o>>2]=I}g[k>>2]=+Nl(F,c[s>>2]|0,j);jj(d,h,c[r>>2]|0,j);if((z|0)!=0){k=c[z+12>>2]|0;if((k|0)==(c[z+16>>2]|0)){k=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{k=c[k>>2]|0}if((k|0)==-1){c[e>>2]=0;k=1;z=0}else{k=0}}else{k=1;z=0}do{if((E|0)!=0){o=c[E+12>>2]|0;if((o|0)==(c[E+16>>2]|0)){o=sc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{o=c[o>>2]|0}if((o|0)==-1){c[f>>2]=0;l=64;break}if(k){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}}else{l=64}}while(0);if((l|0)==64?!k:0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}function Rg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Sg(a,0,e,d,f,g,h);i=b;return}function Sg(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;n=i;i=i+376|0;C=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[C>>2];C=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[C>>2];C=n+128|0;z=n+136|0;d=n+144|0;m=n+160|0;s=n+176|0;q=n+184|0;r=n+344|0;p=n+352|0;t=n+360|0;u=n+368|0;v=n|0;$g(d,g,v,C,z);w=m;dn(w|0,0,12)|0;ve(m,10,0);if((a[w]&1)==0){x=m+1|0;F=x;y=m+8|0}else{y=m+8|0;F=c[y>>2]|0;x=m+1|0}c[s>>2]=F;g=q|0;c[r>>2]=g;c[p>>2]=0;a[t]=1;a[u]=69;e=e|0;f=f|0;B=m|0;A=m+4|0;C=c[C>>2]|0;D=c[z>>2]|0;z=c[e>>2]|0;a:while(1){if((z|0)!=0){E=c[z+12>>2]|0;if((E|0)==(c[z+16>>2]|0)){E=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{E=c[E>>2]|0}if((E|0)==-1){c[e>>2]=0;G=1;z=0}else{G=0}}else{G=1;z=0}E=c[f>>2]|0;do{if((E|0)!=0){H=c[E+12>>2]|0;if((H|0)==(c[E+16>>2]|0)){H=sc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{H=c[H>>2]|0}if(!((H|0)==-1)){if(G){break}else{break a}}else{c[f>>2]=0;l=18;break}}else{l=18}}while(0);if((l|0)==18){l=0;if(G){E=0;break}else{E=0}}G=a[w]|0;I=(G&1)==0;if(I){H=(G&255)>>>1}else{H=c[A>>2]|0}if(((c[s>>2]|0)-F|0)==(H|0)){if(I){F=(G&255)>>>1;G=(G&255)>>>1}else{G=c[A>>2]|0;F=G}ve(m,F<<1,0);if((a[w]&1)==0){F=10}else{F=(c[B>>2]&-2)-1|0}ve(m,F,0);if((a[w]&1)==0){F=x}else{F=c[y>>2]|0}c[s>>2]=F+G}G=z+12|0;I=c[G>>2]|0;H=z+16|0;if((I|0)==(c[H>>2]|0)){I=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{I=c[I>>2]|0}if((ah(I,t,u,F,s,C,D,d,g,r,p,v)|0)!=0){break}E=c[G>>2]|0;if((E|0)==(c[H>>2]|0)){sc[c[(c[z>>2]|0)+40>>2]&127](z)|0;continue}else{c[G>>2]=E+4;continue}}u=a[d]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[d+4>>2]|0}if(((u|0)!=0?(a[t]|0)!=0:0)?(o=c[r>>2]|0,(o-q|0)<160):0){I=c[p>>2]|0;c[r>>2]=o+4;c[o>>2]=I}h[k>>3]=+Ml(F,c[s>>2]|0,j);jj(d,g,c[r>>2]|0,j);if((z|0)!=0){k=c[z+12>>2]|0;if((k|0)==(c[z+16>>2]|0)){k=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{k=c[k>>2]|0}if((k|0)==-1){c[e>>2]=0;k=1;z=0}else{k=0}}else{k=1;z=0}do{if((E|0)!=0){o=c[E+12>>2]|0;if((o|0)==(c[E+16>>2]|0)){o=sc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{o=c[o>>2]|0}if((o|0)==-1){c[f>>2]=0;l=64;break}if(k){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}}else{l=64}}while(0);if((l|0)==64?!k:0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}function Tg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Ug(a,0,e,d,f,g,h);i=b;return}function Ug(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;n=i;i=i+376|0;C=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[C>>2];C=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[C>>2];C=n+128|0;z=n+136|0;d=n+144|0;m=n+160|0;s=n+176|0;q=n+184|0;r=n+344|0;p=n+352|0;t=n+360|0;u=n+368|0;v=n|0;$g(d,g,v,C,z);w=m;dn(w|0,0,12)|0;ve(m,10,0);if((a[w]&1)==0){x=m+1|0;F=x;y=m+8|0}else{y=m+8|0;F=c[y>>2]|0;x=m+1|0}c[s>>2]=F;g=q|0;c[r>>2]=g;c[p>>2]=0;a[t]=1;a[u]=69;e=e|0;f=f|0;B=m|0;A=m+4|0;C=c[C>>2]|0;D=c[z>>2]|0;z=c[e>>2]|0;a:while(1){if((z|0)!=0){E=c[z+12>>2]|0;if((E|0)==(c[z+16>>2]|0)){E=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{E=c[E>>2]|0}if((E|0)==-1){c[e>>2]=0;G=1;z=0}else{G=0}}else{G=1;z=0}E=c[f>>2]|0;do{if((E|0)!=0){H=c[E+12>>2]|0;if((H|0)==(c[E+16>>2]|0)){H=sc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{H=c[H>>2]|0}if(!((H|0)==-1)){if(G){break}else{break a}}else{c[f>>2]=0;l=18;break}}else{l=18}}while(0);if((l|0)==18){l=0;if(G){E=0;break}else{E=0}}G=a[w]|0;I=(G&1)==0;if(I){H=(G&255)>>>1}else{H=c[A>>2]|0}if(((c[s>>2]|0)-F|0)==(H|0)){if(I){F=(G&255)>>>1;G=(G&255)>>>1}else{G=c[A>>2]|0;F=G}ve(m,F<<1,0);if((a[w]&1)==0){F=10}else{F=(c[B>>2]&-2)-1|0}ve(m,F,0);if((a[w]&1)==0){F=x}else{F=c[y>>2]|0}c[s>>2]=F+G}G=z+12|0;I=c[G>>2]|0;H=z+16|0;if((I|0)==(c[H>>2]|0)){I=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{I=c[I>>2]|0}if((ah(I,t,u,F,s,C,D,d,g,r,p,v)|0)!=0){break}E=c[G>>2]|0;if((E|0)==(c[H>>2]|0)){sc[c[(c[z>>2]|0)+40>>2]&127](z)|0;continue}else{c[G>>2]=E+4;continue}}u=a[d]|0;if((u&1)==0){u=(u&255)>>>1}else{u=c[d+4>>2]|0}if(((u|0)!=0?(a[t]|0)!=0:0)?(o=c[r>>2]|0,(o-q|0)<160):0){I=c[p>>2]|0;c[r>>2]=o+4;c[o>>2]=I}h[k>>3]=+Ll(F,c[s>>2]|0,j);jj(d,g,c[r>>2]|0,j);if((z|0)!=0){k=c[z+12>>2]|0;if((k|0)==(c[z+16>>2]|0)){k=sc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{k=c[k>>2]|0}if((k|0)==-1){c[e>>2]=0;k=1;z=0}else{k=0}}else{k=1;z=0}do{if((E|0)!=0){o=c[E+12>>2]|0;if((o|0)==(c[E+16>>2]|0)){o=sc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{o=c[o>>2]|0}if((o|0)==-1){c[f>>2]=0;l=64;break}if(k){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}}else{l=64}}while(0);if((l|0)==64?!k:0){I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=z;te(m);te(d);i=n;return}function Vg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+344|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[u>>2];u=d|0;q=d+16|0;m=d+120|0;s=d+136|0;l=d+144|0;n=d+160|0;t=d+168|0;p=d+328|0;o=d+336|0;dn(m|0,0,12)|0;Ne(s,g);g=s|0;s=c[g>>2]|0;if(!((c[3400]|0)==-1)){c[u>>2]=13600;c[u+4>>2]=14;c[u+8>>2]=0;oe(13600,u,96)}u=(c[3401]|0)-1|0;v=c[s+8>>2]|0;if((c[s+12>>2]|0)-v>>2>>>0>u>>>0?(r=c[v+(u<<2)>>2]|0,(r|0)!=0):0){q=q|0;Ac[c[(c[r>>2]|0)+48>>2]&15](r,9864,9890,q)|0;Wd(c[g>>2]|0)|0;s=l;dn(s|0,0,12)|0;ve(l,10,0);if((a[s]&1)==0){g=l+1|0;x=g;r=l+8|0}else{r=l+8|0;x=c[r>>2]|0;g=l+1|0}c[n>>2]=x;t=t|0;c[p>>2]=t;c[o>>2]=0;e=e|0;f=f|0;v=l|0;u=l+4|0;w=c[e>>2]|0;a:while(1){if((w|0)!=0){y=c[w+12>>2]|0;if((y|0)==(c[w+16>>2]|0)){y=sc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{y=c[y>>2]|0}if((y|0)==-1){c[e>>2]=0;y=1;w=0}else{y=0}}else{y=1;w=0}A=c[f>>2]|0;do{if((A|0)!=0){z=c[A+12>>2]|0;if((z|0)==(c[A+16>>2]|0)){z=sc[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{z=c[z>>2]|0}if(!((z|0)==-1)){if(y){break}else{break a}}else{c[f>>2]=0;k=26;break}}else{k=26}}while(0);if((k|0)==26?(k=0,y):0){break}y=a[s]|0;A=(y&1)==0;if(A){z=(y&255)>>>1}else{z=c[u>>2]|0}if(((c[n>>2]|0)-x|0)==(z|0)){if(A){x=(y&255)>>>1;y=(y&255)>>>1}else{y=c[u>>2]|0;x=y}ve(l,x<<1,0);if((a[s]&1)==0){x=10}else{x=(c[v>>2]&-2)-1|0}ve(l,x,0);if((a[s]&1)==0){x=g}else{x=c[r>>2]|0}c[n>>2]=x+y}y=w+12|0;A=c[y>>2]|0;z=w+16|0;if((A|0)==(c[z>>2]|0)){A=sc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{A=c[A>>2]|0}if((Wg(A,16,x,n,o,0,m,t,p,q)|0)!=0){break}A=c[y>>2]|0;if((A|0)==(c[z>>2]|0)){sc[c[(c[w>>2]|0)+40>>2]&127](w)|0;continue}else{c[y>>2]=A+4;continue}}a[x+3|0]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}A=yg(x,c[3016]|0,1248,(z=i,i=i+8|0,c[z>>2]=j,z)|0)|0;i=z;if((A|0)!=1){c[h>>2]=4}n=c[e>>2]|0;if((n|0)!=0){j=c[n+12>>2]|0;if((j|0)==(c[n+16>>2]|0)){j=sc[c[(c[n>>2]|0)+36>>2]&127](n)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[e>>2]=0;j=1;n=0}else{j=0}}else{j=1;n=0}p=c[f>>2]|0;do{if((p|0)!=0){o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){o=sc[c[(c[p>>2]|0)+36>>2]&127](p)|0}else{o=c[o>>2]|0}if((o|0)==-1){c[f>>2]=0;k=74;break}if(j){A=b|0;c[A>>2]=n;te(l);te(m);i=d;return}}else{k=74}}while(0);if((k|0)==74?!j:0){A=b|0;c[A>>2]=n;te(l);te(m);i=d;return}c[h>>2]=c[h>>2]|2;A=b|0;c[A>>2]=n;te(l);te(m);i=d;return}A=cc(4)|0;nm(A);zb(A|0,8296,130)}function Wg(b,d,e,f,g,h,i,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0;n=c[f>>2]|0;m=(n|0)==(e|0);do{if(m){o=(c[l+96>>2]|0)==(b|0);if(!o?(c[l+100>>2]|0)!=(b|0):0){break}c[f>>2]=e+1;a[e]=o?43:45;c[g>>2]=0;o=0;return o|0}}while(0);o=a[i]|0;if((o&1)==0){i=(o&255)>>>1}else{i=c[i+4>>2]|0}if((i|0)!=0&(b|0)==(h|0)){e=c[k>>2]|0;if((e-j|0)>=160){o=0;return o|0}o=c[g>>2]|0;c[k>>2]=e+4;c[e>>2]=o;c[g>>2]=0;o=0;return o|0}k=l+104|0;j=l;while(1){h=j+4|0;if((c[j>>2]|0)==(b|0)){break}if((h|0)==(k|0)){j=k;break}else{j=h}}b=j-l|0;l=b>>2;if((b|0)>92){o=-1;return o|0}if((d|0)==8|(d|0)==10){if((l|0)>=(d|0)){o=-1;return o|0}}else if((d|0)==16?(b|0)>=88:0){if(m){o=-1;return o|0}if((n-e|0)>=3){o=-1;return o|0}if((a[n-1|0]|0)!=48){o=-1;return o|0}c[g>>2]=0;o=a[9864+l|0]|0;c[f>>2]=n+1;a[n]=o;o=0;return o|0}o=a[9864+l|0]|0;c[f>>2]=n+1;a[n]=o;c[g>>2]=(c[g>>2]|0)+1;o=0;return o|0}function Xg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+40|0;j=g|0;m=g+16|0;l=g+32|0;Ne(l,d);d=l|0;l=c[d>>2]|0;if(!((c[3402]|0)==-1)){c[m>>2]=13608;c[m+4>>2]=14;c[m+8>>2]=0;oe(13608,m,96)}m=(c[3403]|0)-1|0;n=c[l+8>>2]|0;if((c[l+12>>2]|0)-n>>2>>>0>m>>>0?(k=c[n+(m<<2)>>2]|0,(k|0)!=0):0){Ac[c[(c[k>>2]|0)+32>>2]&15](k,9864,9890,e)|0;k=c[d>>2]|0;if(!((c[3306]|0)==-1)){c[j>>2]=13224;c[j+4>>2]=14;c[j+8>>2]=0;oe(13224,j,96)}j=(c[3307]|0)-1|0;e=c[k+8>>2]|0;if((c[k+12>>2]|0)-e>>2>>>0>j>>>0?(h=c[e+(j<<2)>>2]|0,(h|0)!=0):0){n=h;a[f]=sc[c[(c[h>>2]|0)+16>>2]&127](n)|0;oc[c[(c[h>>2]|0)+20>>2]&127](b,n);Wd(c[d>>2]|0)|0;i=g;return}n=cc(4)|0;nm(n);zb(n|0,8296,130)}n=cc(4)|0;nm(n);zb(n|0,8296,130)}function Yg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+40|0;k=j|0;n=j+16|0;m=j+32|0;Ne(m,d);d=m|0;m=c[d>>2]|0;if(!((c[3402]|0)==-1)){c[n>>2]=13608;c[n+4>>2]=14;c[n+8>>2]=0;oe(13608,n,96)}n=(c[3403]|0)-1|0;o=c[m+8>>2]|0;if((c[m+12>>2]|0)-o>>2>>>0>n>>>0?(l=c[o+(n<<2)>>2]|0,(l|0)!=0):0){Ac[c[(c[l>>2]|0)+32>>2]&15](l,9864,9896,e)|0;e=c[d>>2]|0;if(!((c[3306]|0)==-1)){c[k>>2]=13224;c[k+4>>2]=14;c[k+8>>2]=0;oe(13224,k,96)}k=(c[3307]|0)-1|0;l=c[e+8>>2]|0;if((c[e+12>>2]|0)-l>>2>>>0>k>>>0?(h=c[l+(k<<2)>>2]|0,(h|0)!=0):0){o=h;n=h;a[f]=sc[c[(c[n>>2]|0)+12>>2]&127](o)|0;a[g]=sc[c[(c[n>>2]|0)+16>>2]&127](o)|0;oc[c[(c[h>>2]|0)+20>>2]&127](b,o);Wd(c[d>>2]|0)|0;i=j;return}o=cc(4)|0;nm(o);zb(o|0,8296,130)}o=cc(4)|0;nm(o);zb(o|0,8296,130)}function Zg(b,d,e,f,g,h,i,j,k,l,m,n){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;var o=0,p=0;if(b<<24>>24==h<<24>>24){if((a[d]|0)==0){p=-1;return p|0}a[d]=0;p=c[g>>2]|0;c[g>>2]=p+1;a[p]=46;g=a[j]|0;if((g&1)==0){g=(g&255)>>>1}else{g=c[j+4>>2]|0}if((g|0)==0){p=0;return p|0}g=c[l>>2]|0;if((g-k|0)>=160){p=0;return p|0}p=c[m>>2]|0;c[l>>2]=g+4;c[g>>2]=p;p=0;return p|0}if(b<<24>>24==i<<24>>24){i=a[j]|0;if((i&1)==0){i=(i&255)>>>1}else{i=c[j+4>>2]|0}if((i|0)!=0){if((a[d]|0)==0){p=-1;return p|0}g=c[l>>2]|0;if((g-k|0)>=160){p=0;return p|0}p=c[m>>2]|0;c[l>>2]=g+4;c[g>>2]=p;c[m>>2]=0;p=0;return p|0}}p=n+32|0;h=n;while(1){i=h+1|0;if((a[h]|0)==b<<24>>24){break}if((i|0)==(p|0)){h=p;break}else{h=i}}b=h-n|0;if((b|0)>31){p=-1;return p|0}n=a[9864+b|0]|0;if((b|0)==25|(b|0)==24){m=c[g>>2]|0;if((m|0)!=(f|0)?(a[m-1|0]&95|0)!=(a[e]&127|0):0){p=-1;return p|0}c[g>>2]=m+1;a[m]=n;p=0;return p|0}else if((b|0)==22|(b|0)==23){a[e]=80;p=c[g>>2]|0;c[g>>2]=p+1;a[p]=n;p=0;return p|0}else{f=a[e]|0;if((n&95|0)==(f<<24>>24|0)?(a[e]=f|-128,(a[d]|0)!=0):0){a[d]=0;e=a[j]|0;if((e&1)==0){j=(e&255)>>>1}else{j=c[j+4>>2]|0}if((j|0)!=0?(o=c[l>>2]|0,(o-k|0)<160):0){p=c[m>>2]|0;c[l>>2]=o+4;c[o>>2]=p}}p=c[g>>2]|0;c[g>>2]=p+1;a[p]=n;if((b|0)>21){p=0;return p|0}c[m>>2]=(c[m>>2]|0)+1;p=0;return p|0}return 0}function _g(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+40|0;h=f|0;l=f+16|0;k=f+32|0;Ne(k,b);b=k|0;k=c[b>>2]|0;if(!((c[3400]|0)==-1)){c[l>>2]=13600;c[l+4>>2]=14;c[l+8>>2]=0;oe(13600,l,96)}l=(c[3401]|0)-1|0;m=c[k+8>>2]|0;if((c[k+12>>2]|0)-m>>2>>>0>l>>>0?(j=c[m+(l<<2)>>2]|0,(j|0)!=0):0){Ac[c[(c[j>>2]|0)+48>>2]&15](j,9864,9890,d)|0;j=c[b>>2]|0;if(!((c[3304]|0)==-1)){c[h>>2]=13216;c[h+4>>2]=14;c[h+8>>2]=0;oe(13216,h,96)}h=(c[3305]|0)-1|0;d=c[j+8>>2]|0;if((c[j+12>>2]|0)-d>>2>>>0>h>>>0?(g=c[d+(h<<2)>>2]|0,(g|0)!=0):0){m=g;c[e>>2]=sc[c[(c[g>>2]|0)+16>>2]&127](m)|0;oc[c[(c[g>>2]|0)+20>>2]&127](a,m);Wd(c[b>>2]|0)|0;i=f;return}m=cc(4)|0;nm(m);zb(m|0,8296,130)}m=cc(4)|0;nm(m);zb(m|0,8296,130)}function $g(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+40|0;j=h|0;m=h+16|0;l=h+32|0;Ne(l,b);b=l|0;l=c[b>>2]|0;if(!((c[3400]|0)==-1)){c[m>>2]=13600;c[m+4>>2]=14;c[m+8>>2]=0;oe(13600,m,96)}m=(c[3401]|0)-1|0;n=c[l+8>>2]|0;if((c[l+12>>2]|0)-n>>2>>>0>m>>>0?(k=c[n+(m<<2)>>2]|0,(k|0)!=0):0){Ac[c[(c[k>>2]|0)+48>>2]&15](k,9864,9896,d)|0;d=c[b>>2]|0;if(!((c[3304]|0)==-1)){c[j>>2]=13216;c[j+4>>2]=14;c[j+8>>2]=0;oe(13216,j,96)}j=(c[3305]|0)-1|0;k=c[d+8>>2]|0;if((c[d+12>>2]|0)-k>>2>>>0>j>>>0?(g=c[k+(j<<2)>>2]|0,(g|0)!=0):0){n=g;m=g;c[e>>2]=sc[c[(c[m>>2]|0)+12>>2]&127](n)|0;c[f>>2]=sc[c[(c[m>>2]|0)+16>>2]&127](n)|0;oc[c[(c[g>>2]|0)+20>>2]&127](a,n);Wd(c[b>>2]|0)|0;i=h;return}n=cc(4)|0;nm(n);zb(n|0,8296,130)}n=cc(4)|0;nm(n);zb(n|0,8296,130)}function ah(b,d,e,f,g,h,i,j,k,l,m,n){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;var o=0,p=0;if((b|0)==(h|0)){if((a[d]|0)==0){p=-1;return p|0}a[d]=0;p=c[g>>2]|0;c[g>>2]=p+1;a[p]=46;g=a[j]|0;if((g&1)==0){g=(g&255)>>>1}else{g=c[j+4>>2]|0}if((g|0)==0){p=0;return p|0}g=c[l>>2]|0;if((g-k|0)>=160){p=0;return p|0}p=c[m>>2]|0;c[l>>2]=g+4;c[g>>2]=p;p=0;return p|0}if((b|0)==(i|0)){h=a[j]|0;if((h&1)==0){h=(h&255)>>>1}else{h=c[j+4>>2]|0}if((h|0)!=0){if((a[d]|0)==0){p=-1;return p|0}g=c[l>>2]|0;if((g-k|0)>=160){p=0;return p|0}p=c[m>>2]|0;c[l>>2]=g+4;c[g>>2]=p;c[m>>2]=0;p=0;return p|0}}i=n+128|0;h=n;while(1){p=h+4|0;if((c[h>>2]|0)==(b|0)){break}if((p|0)==(i|0)){h=i;break}else{h=p}}b=h-n|0;h=b>>2;if((b|0)>124){p=-1;return p|0}n=a[9864+h|0]|0;if((h|0)==25|(h|0)==24){m=c[g>>2]|0;if((m|0)!=(f|0)?(a[m-1|0]&95|0)!=(a[e]&127|0):0){p=-1;return p|0}c[g>>2]=m+1;a[m]=n;p=0;return p|0}else if(!((h|0)==22|(h|0)==23)){f=a[e]|0;if((n&95|0)==(f<<24>>24|0)?(a[e]=f|-128,(a[d]|0)!=0):0){a[d]=0;e=a[j]|0;if((e&1)==0){j=(e&255)>>>1}else{j=c[j+4>>2]|0}if((j|0)!=0?(o=c[l>>2]|0,(o-k|0)<160):0){p=c[m>>2]|0;c[l>>2]=o+4;c[o>>2]=p}}}else{a[e]=80}p=c[g>>2]|0;c[g>>2]=p+1;a[p]=n;if((b|0)>84){p=0;return p|0}c[m>>2]=(c[m>>2]|0)+1;p=0;return p|0}function bh(a){a=a|0;Ud(a|0);Pm(a);return}function ch(a){a=a|0;Ud(a|0);return}function dh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+48|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=j|0;n=j+16|0;o=j+24|0;k=j+32|0;if((c[f+4>>2]&1|0)==0){p=c[(c[d>>2]|0)+24>>2]|0;c[n>>2]=c[e>>2];zc[p&31](b,d,n,f,g,h&1);i=j;return}Ne(o,f);f=o|0;n=c[f>>2]|0;if(!((c[3306]|0)==-1)){c[m>>2]=13224;c[m+4>>2]=14;c[m+8>>2]=0;oe(13224,m,96)}m=(c[3307]|0)-1|0;o=c[n+8>>2]|0;if((c[n+12>>2]|0)-o>>2>>>0>m>>>0?(l=c[o+(m<<2)>>2]|0,(l|0)!=0):0){m=l;Wd(c[f>>2]|0)|0;l=c[l>>2]|0;if(h){oc[c[l+24>>2]&127](k,m)}else{oc[c[l+28>>2]&127](k,m)}h=k;o=a[h]|0;if((o&1)==0){l=k+1|0;n=l;m=k+8|0}else{m=k+8|0;n=c[m>>2]|0;l=k+1|0}e=e|0;f=k+4|0;while(1){if((o&1)==0){o=(o&255)>>>1;g=l}else{o=c[f>>2]|0;g=c[m>>2]|0}if((n|0)==(g+o|0)){break}g=a[n]|0;o=c[e>>2]|0;do{if((o|0)!=0){d=o+24|0;p=c[d>>2]|0;if((p|0)!=(c[o+28>>2]|0)){c[d>>2]=p+1;a[p]=g;break}if((pc[c[(c[o>>2]|0)+52>>2]&63](o,g&255)|0)==-1){c[e>>2]=0}}}while(0);n=n+1|0;o=a[h]|0}c[b>>2]=c[e>>2];te(k);i=j;return}p=cc(4)|0;nm(p);zb(p|0,8296,130)}function eh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;l=i;i=i+80|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=l|0;p=l+8|0;n=l+24|0;m=l+48|0;o=l+56|0;d=l+64|0;k=l+72|0;r=t|0;a[r]=a[2480]|0;a[r+1|0]=a[2481]|0;a[r+2|0]=a[2482]|0;a[r+3|0]=a[2483]|0;a[r+4|0]=a[2484]|0;a[r+5|0]=a[2485]|0;u=t+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[u]=43;u=t+2|0}if((s&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;t=u+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=100}}while(0);s=p|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}r=fh(s,12,c[3016]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==32){p=h}else if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if((r|0)>1&q<<24>>24==48?(u=a[p+1|0]|0,(u<<24>>24|0)==120|(u<<24>>24|0)==88):0){p=p+2|0}else{j=22}}else{j=22}}while(0);if((j|0)==22){p=s}u=n|0;Ne(d,f);gh(s,p,h,u,m,o,d);Wd(c[d>>2]|0)|0;c[k>>2]=c[e>>2];hh(b,k,u,c[m>>2]|0,c[o>>2]|0,f,g);i=l;return}function fh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;d=Rb(d|0)|0;e=Sb(a|0,b|0,e|0,h|0)|0;if((d|0)==0){i=g;return e|0}Rb(d|0)|0;i=g;return e|0}function gh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;l=i;i=i+48|0;n=l|0;r=l+16|0;k=l+32|0;p=j|0;j=c[p>>2]|0;if(!((c[3402]|0)==-1)){c[r>>2]=13608;c[r+4>>2]=14;c[r+8>>2]=0;oe(13608,r,96)}r=(c[3403]|0)-1|0;s=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-s>>2>>>0>r>>>0)){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}r=c[s+(r<<2)>>2]|0;if((r|0)==0){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}j=r;p=c[p>>2]|0;if(!((c[3306]|0)==-1)){c[n>>2]=13224;c[n+4>>2]=14;c[n+8>>2]=0;oe(13224,n,96)}n=(c[3307]|0)-1|0;s=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-s>>2>>>0>n>>>0)){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}t=c[s+(n<<2)>>2]|0;if((t|0)==0){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}s=t;oc[c[(c[t>>2]|0)+20>>2]&127](k,s);n=k;p=a[n]|0;if((p&1)==0){p=(p&255)>>>1}else{p=c[k+4>>2]|0}if((p|0)!=0){c[h>>2]=f;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){x=pc[c[(c[r>>2]|0)+28>>2]&63](j,p)|0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=x;p=b+1|0}else{p=b}if(((e-p|0)>1?(a[p]|0)==48:0)?(q=p+1|0,x=a[q]|0,(x<<24>>24|0)==120|(x<<24>>24|0)==88):0){w=r;v=pc[c[(c[w>>2]|0)+28>>2]&63](j,48)|0;x=c[h>>2]|0;c[h>>2]=x+1;a[x]=v;w=pc[c[(c[w>>2]|0)+28>>2]&63](j,a[q]|0)|0;x=c[h>>2]|0;c[h>>2]=x+1;a[x]=w;p=p+2|0}if((p|0)!=(e|0)?(o=e-1|0,o>>>0>p>>>0):0){q=p;do{x=a[q]|0;a[q]=a[o]|0;a[o]=x;q=q+1|0;o=o-1|0}while(q>>>0<o>>>0)}q=sc[c[(c[t>>2]|0)+16>>2]&127](s)|0;if(p>>>0<e>>>0){o=k+1|0;s=k+4|0;t=k+8|0;w=0;v=0;u=p;while(1){x=(a[n]&1)==0;if((a[(x?o:c[t>>2]|0)+v|0]|0)!=0?(w|0)==(a[(x?o:c[t>>2]|0)+v|0]|0):0){w=c[h>>2]|0;c[h>>2]=w+1;a[w]=q;w=a[n]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[s>>2]|0}v=(v>>>0<(w-1|0)>>>0)+v|0;w=0}y=pc[c[(c[r>>2]|0)+28>>2]&63](j,a[u]|0)|0;x=c[h>>2]|0;c[h>>2]=x+1;a[x]=y;u=u+1|0;if(!(u>>>0<e>>>0)){break}else{w=w+1|0}}}n=f+(p-b)|0;j=c[h>>2]|0;if((n|0)!=(j|0)?(m=j-1|0,m>>>0>n>>>0):0){do{y=a[n]|0;a[n]=a[m]|0;a[m]=y;n=n+1|0;m=m-1|0}while(n>>>0<m>>>0)}}else{Ac[c[(c[r>>2]|0)+32>>2]&15](j,b,e,f)|0;c[h>>2]=f+(e-b)}if((d|0)==(e|0)){y=c[h>>2]|0;c[g>>2]=y;te(k);i=l;return}else{y=f+(d-b)|0;c[g>>2]=y;te(k);i=l;return}}function hh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0;k=i;i=i+16|0;m=d;l=i;i=i+4|0;i=i+7&-8;c[l>>2]=c[m>>2];m=k|0;l=l|0;d=c[l>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=e;o=g-n|0;h=h+12|0;p=c[h>>2]|0;p=(p|0)>(o|0)?p-o|0:0;o=f;n=o-n|0;if((n|0)>0?(qc[c[(c[d>>2]|0)+48>>2]&63](d,e,n)|0)!=(n|0):0){c[l>>2]=0;c[b>>2]=0;i=k;return}do{if((p|0)>0){se(m,p,j);if((a[m]&1)==0){e=m+1|0}else{e=c[m+8>>2]|0}if((qc[c[(c[d>>2]|0)+48>>2]&63](d,e,p)|0)==(p|0)){te(m);break}c[l>>2]=0;c[b>>2]=0;te(m);i=k;return}}while(0);m=g-o|0;if((m|0)>0?(qc[c[(c[d>>2]|0)+48>>2]&63](d,f,m)|0)!=(m|0):0){c[l>>2]=0;c[b>>2]=0;i=k;return}c[h>>2]=0;c[b>>2]=d;i=k;return}function ih(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;m=i;i=i+112|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=m|0;q=m+8|0;n=m+32|0;o=m+80|0;p=m+88|0;d=m+96|0;l=m+104|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;u=u+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);t=q|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}j=fh(t,22,c[3016]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==32){q=h}else if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if((j|0)>1&r<<24>>24==48?(v=a[q+1|0]|0,(v<<24>>24|0)==120|(v<<24>>24|0)==88):0){q=q+2|0}else{k=22}}else{k=22}}while(0);if((k|0)==22){q=t}v=n|0;Ne(d,f);gh(t,q,h,v,o,p,d);Wd(c[d>>2]|0)|0;c[l>>2]=c[e>>2];hh(b,l,v,c[o>>2]|0,c[p>>2]|0,f,g);i=m;return}



function Aj(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=+k;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+544|0;z=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[z>>2];z=d|0;F=d+120|0;D=d+528|0;E=d+536|0;p=E;m=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;r=i;i=i+12|0;i=i+7&-8;n=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;B=i;i=i+4|0;i=i+7&-8;C=i;i=i+400|0;s=i;i=i+4|0;i=i+7&-8;l=i;i=i+4|0;i=i+7&-8;o=i;i=i+4|0;i=i+7&-8;H=d+16|0;c[F>>2]=H;u=d+128|0;v=_a(H|0,100,1360,(H=i,i=i+8|0,h[H>>3]=k,H)|0)|0;i=H;if(v>>>0>99>>>0){if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}v=mh(F,c[3016]|0,1360,(y=i,i=i+8|0,h[y>>3]=k,y)|0)|0;i=y;y=c[F>>2]|0;if((y|0)==0){Um();y=c[F>>2]|0}H=Im(v<<2)|0;w=H;if((H|0)==0){Um();u=0;w=0}else{u=w}}else{w=0;y=0}Ne(D,g);x=D|0;G=c[x>>2]|0;if(!((c[3400]|0)==-1)){c[z>>2]=13600;c[z+4>>2]=14;c[z+8>>2]=0;oe(13600,z,96)}z=(c[3401]|0)-1|0;H=c[G+8>>2]|0;if((c[G+12>>2]|0)-H>>2>>>0>z>>>0?(A=c[H+(z<<2)>>2]|0,(A|0)!=0):0){z=A;H=c[F>>2]|0;Ac[c[(c[A>>2]|0)+48>>2]&15](z,H,H+v|0,u)|0;if((v|0)==0){A=0}else{A=(a[c[F>>2]|0]|0)==45}c[E>>2]=0;dn(r|0,0,12)|0;E=n;dn(E|0,0,12)|0;F=q;dn(F|0,0,12)|0;Bj(f,A,D,p,m,t,r,n,q,B);f=C|0;B=c[B>>2]|0;if((v|0)>(B|0)){C=a[F]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[q+4>>2]|0}D=a[E]|0;if((D&1)==0){D=(D&255)>>>1}else{D=c[n+4>>2]|0}C=C+(v-B<<1|1)+D|0}else{C=a[F]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[q+4>>2]|0}D=a[E]|0;if((D&1)==0){D=(D&255)>>>1}else{D=c[n+4>>2]|0}C=C+2+D|0}C=C+B|0;if(C>>>0>100>>>0){H=Im(C<<2)|0;C=H;if((H|0)==0){Um();f=0;C=0}else{f=C}}else{C=0}Cj(f,s,l,c[g+4>>2]|0,u,u+(v<<2)|0,z,A,p,c[m>>2]|0,c[t>>2]|0,r,n,q,B);c[o>>2]=c[e>>2];vh(b,o,f,c[s>>2]|0,c[l>>2]|0,g,j);if((C|0)!=0){Jm(C)}Ee(q);Ee(n);te(r);Wd(c[x>>2]|0)|0;if((w|0)!=0){Jm(w)}if((y|0)==0){i=d;return}Jm(y);i=d;return}H=cc(4)|0;nm(H);zb(H|0,8296,130)}function Bj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0;n=i;i=i+40|0;G=n|0;F=n+16|0;z=n+32|0;B=z;s=i;i=i+12|0;i=i+7&-8;E=i;i=i+4|0;i=i+7&-8;y=E;t=i;i=i+12|0;i=i+7&-8;r=i;i=i+12|0;i=i+7&-8;o=i;i=i+12|0;i=i+7&-8;A=i;i=i+4|0;i=i+7&-8;D=A;v=i;i=i+12|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;x=w;u=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;e=c[e>>2]|0;if(b){if(!((c[3516]|0)==-1)){c[F>>2]=14064;c[F+4>>2]=14;c[F+8>>2]=0;oe(14064,F,96)}q=(c[3517]|0)-1|0;p=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-p>>2>>>0>q>>>0)){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}q=c[p+(q<<2)>>2]|0;if((q|0)==0){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}p=q;u=c[q>>2]|0;if(d){oc[c[u+44>>2]&127](B,p);C=c[z>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[q>>2]|0)+32>>2]&127](s,p);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}He(l,0);G=s;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;Ee(s)}else{oc[c[u+40>>2]&127](y,p);C=c[E>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[q>>2]|0)+28>>2]&127](t,p);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}He(l,0);G=t;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;Ee(t)}l=q;c[g>>2]=sc[c[(c[l>>2]|0)+12>>2]&127](p)|0;c[h>>2]=sc[c[(c[l>>2]|0)+16>>2]&127](p)|0;oc[c[(c[q>>2]|0)+20>>2]&127](r,p);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xe(j,0);j=r;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];dn(j|0,0,12)|0;te(r);oc[c[(c[q>>2]|0)+24>>2]&127](o,p);j=k;if((a[j]&1)==0){c[k+4>>2]=0;a[j]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}He(k,0);G=o;c[j>>2]=c[G>>2];c[j+4>>2]=c[G+4>>2];c[j+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;Ee(o);G=sc[c[(c[l>>2]|0)+36>>2]&127](p)|0;c[m>>2]=G;i=n;return}else{if(!((c[3518]|0)==-1)){c[G>>2]=14072;c[G+4>>2]=14;c[G+8>>2]=0;oe(14072,G,96)}o=(c[3519]|0)-1|0;r=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-r>>2>>>0>o>>>0)){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}r=c[r+(o<<2)>>2]|0;if((r|0)==0){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}o=r;s=c[r>>2]|0;if(d){oc[c[s+44>>2]&127](D,o);C=c[A>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[r>>2]|0)+32>>2]&127](v,o);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}He(l,0);G=v;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;Ee(v)}else{oc[c[s+40>>2]&127](x,o);C=c[w>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[r>>2]|0)+28>>2]&127](u,o);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}He(l,0);G=u;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;Ee(u)}l=r;c[g>>2]=sc[c[(c[l>>2]|0)+12>>2]&127](o)|0;c[h>>2]=sc[c[(c[l>>2]|0)+16>>2]&127](o)|0;oc[c[(c[r>>2]|0)+20>>2]&127](q,o);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xe(j,0);j=q;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];dn(j|0,0,12)|0;te(q);oc[c[(c[r>>2]|0)+24>>2]&127](p,o);j=k;if((a[j]&1)==0){c[k+4>>2]=0;a[j]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}He(k,0);G=p;c[j>>2]=c[G>>2];c[j+4>>2]=c[G+4>>2];c[j+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;Ee(p);G=sc[c[(c[l>>2]|0)+36>>2]&127](o)|0;c[m>>2]=G;i=n;return}}function Cj(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;c[e>>2]=b;t=i;u=p;r=p+4|0;p=p+8|0;x=o;y=(f&512|0)==0;w=o+4|0;z=o+8|0;B=(q|0)>0;A=n;o=n+1|0;C=n+8|0;D=n+4|0;n=i;E=0;do{switch(a[k+E|0]|0){case 0:{c[d>>2]=c[e>>2];break};case 1:{c[d>>2]=c[e>>2];L=pc[c[(c[t>>2]|0)+44>>2]&63](i,32)|0;M=c[e>>2]|0;c[e>>2]=M+4;c[M>>2]=L;break};case 3:{G=a[u]|0;F=(G&1)==0;if(F){G=(G&255)>>>1}else{G=c[r>>2]|0}if((G|0)!=0){if(F){F=r}else{F=c[p>>2]|0}L=c[F>>2]|0;M=c[e>>2]|0;c[e>>2]=M+4;c[M>>2]=L}break};case 2:{G=a[x]|0;H=(G&1)==0;if(H){F=(G&255)>>>1}else{F=c[w>>2]|0}if(!((F|0)==0|y)){if(H){H=(G&255)>>>1;I=w;J=w}else{J=c[z>>2]|0;H=c[w>>2]|0;I=J}F=I+(H<<2)|0;G=c[e>>2]|0;if((J|0)!=(F|0)){H=(I+(H-1<<2)+(-J|0)|0)>>>2;I=G;while(1){c[I>>2]=c[J>>2];J=J+4|0;if((J|0)==(F|0)){break}I=I+4|0}G=G+(H+1<<2)|0}c[e>>2]=G}break};case 4:{F=c[e>>2]|0;g=j?g+4|0:g;a:do{if(g>>>0<h>>>0){G=g;while(1){H=G+4|0;if(!(qc[c[(c[n>>2]|0)+12>>2]&63](i,2048,c[G>>2]|0)|0)){break a}if(H>>>0<h>>>0){G=H}else{G=H;break}}}else{G=g}}while(0);if(B){if(G>>>0>g>>>0){H=q;J=c[e>>2]|0;while(1){G=G-4|0;I=J+4|0;c[J>>2]=c[G>>2];H=H-1|0;J=(H|0)>0;if(G>>>0>g>>>0&J){J=I}else{break}}c[e>>2]=I;if(J){v=34}else{K=c[e>>2]|0;c[e>>2]=K+4}}else{H=q;v=34}if((v|0)==34){v=0;J=pc[c[(c[t>>2]|0)+44>>2]&63](i,48)|0;K=c[e>>2]|0;M=K+4|0;c[e>>2]=M;if((H|0)>0){I=H;L=K;while(1){c[L>>2]=J;I=I-1|0;if((I|0)<=0){break}else{L=M;M=M+4|0}}c[e>>2]=K+(H+1<<2);K=K+(H<<2)|0}}c[K>>2]=l}if((G|0)==(g|0)){K=pc[c[(c[t>>2]|0)+44>>2]&63](i,48)|0;M=c[e>>2]|0;L=M+4|0;c[e>>2]=L;c[M>>2]=K}else{I=a[A]|0;H=(I&1)==0;if(H){I=(I&255)>>>1}else{I=c[D>>2]|0}if((I|0)==0){K=0;J=0;I=-1}else{if(H){H=o}else{H=c[C>>2]|0}K=0;J=0;I=a[H]|0}while(1){L=c[e>>2]|0;if((K|0)==(I|0)){H=L+4|0;c[e>>2]=H;c[L>>2]=m;J=J+1|0;L=a[A]|0;K=(L&1)==0;if(K){L=(L&255)>>>1}else{L=c[D>>2]|0}if(J>>>0<L>>>0){if(K){I=o}else{I=c[C>>2]|0}if((a[I+J|0]|0)==127){I=-1;K=0}else{if(K){I=o}else{I=c[C>>2]|0}I=a[I+J|0]|0;K=0}}else{K=0}}else{H=L}G=G-4|0;M=c[G>>2]|0;L=H+4|0;c[e>>2]=L;c[H>>2]=M;if((G|0)==(g|0)){break}else{K=K+1|0}}}if((F|0)!=(L|0)?(s=L-4|0,s>>>0>F>>>0):0){G=s;do{M=c[F>>2]|0;c[F>>2]=c[G>>2];c[G>>2]=M;F=F+4|0;G=G-4|0}while(F>>>0<G>>>0)}break};default:{}}E=E+1|0}while(E>>>0<4>>>0);k=a[u]|0;j=(k&1)==0;if(j){s=(k&255)>>>1}else{s=c[r>>2]|0}if(s>>>0>1>>>0){if(j){k=(k&255)>>>1;s=r}else{M=c[p>>2]|0;k=c[r>>2]|0;s=M;r=M}j=r+4|0;r=s+(k<<2)|0;p=c[e>>2]|0;if((j|0)!=(r|0)){k=(s+(k-1<<2)+(-j|0)|0)>>>2;s=p;while(1){c[s>>2]=c[j>>2];j=j+4|0;if((j|0)==(r|0)){break}else{s=s+4|0}}p=p+(k+1<<2)|0}c[e>>2]=p}f=f&176;if((f|0)==32){c[d>>2]=c[e>>2];return}else if((f|0)==16){return}else{c[d>>2]=b;return}}function Dj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;p=i;i=i+32|0;v=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[v>>2];v=p|0;z=p+16|0;A=p+24|0;r=A;s=i;i=i+4|0;i=i+7&-8;d=i;i=i+4|0;i=i+7&-8;k=i;i=i+12|0;i=i+7&-8;l=i;i=i+12|0;i=i+7&-8;m=i;i=i+12|0;i=i+7&-8;x=i;i=i+4|0;i=i+7&-8;y=i;i=i+400|0;q=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;n=i;i=i+4|0;i=i+7&-8;Ne(z,g);o=z|0;u=c[o>>2]|0;if(!((c[3400]|0)==-1)){c[v>>2]=13600;c[v+4>>2]=14;c[v+8>>2]=0;oe(13600,v,96)}B=(c[3401]|0)-1|0;v=c[u+8>>2]|0;if((c[u+12>>2]|0)-v>>2>>>0>B>>>0?(w=c[v+(B<<2)>>2]|0,(w|0)!=0):0){u=w;v=j;C=a[v]|0;B=(C&1)==0;if(B){C=(C&255)>>>1}else{C=c[j+4>>2]|0}if((C|0)==0){w=0}else{if(B){B=j+4|0}else{B=c[j+8>>2]|0}C=c[B>>2]|0;w=(C|0)==(pc[c[(c[w>>2]|0)+44>>2]&63](u,45)|0)}c[A>>2]=0;dn(k|0,0,12)|0;A=l;dn(A|0,0,12)|0;B=m;dn(B|0,0,12)|0;Bj(f,w,z,r,s,d,k,l,m,x);y=y|0;f=a[v]|0;C=(f&1)==0;if(C){z=(f&255)>>>1}else{z=c[j+4>>2]|0}x=c[x>>2]|0;if((z|0)>(x|0)){if(C){z=(f&255)>>>1}else{z=c[j+4>>2]|0}B=a[B]|0;if((B&1)==0){B=(B&255)>>>1}else{B=c[m+4>>2]|0}A=a[A]|0;if((A&1)==0){A=(A&255)>>>1}else{A=c[l+4>>2]|0}z=B+(z-x<<1|1)+A|0}else{z=a[B]|0;if((z&1)==0){z=(z&255)>>>1}else{z=c[m+4>>2]|0}A=a[A]|0;if((A&1)==0){A=(A&255)>>>1}else{A=c[l+4>>2]|0}z=z+2+A|0}z=z+x|0;if(z>>>0>100>>>0){C=Im(z<<2)|0;z=C;if((C|0)==0){Um();y=0;z=0;f=a[v]|0}else{y=z}}else{z=0}if((f&1)==0){v=(f&255)>>>1;j=j+4|0}else{v=c[j+4>>2]|0;j=c[j+8>>2]|0}Cj(y,q,t,c[g+4>>2]|0,j,j+(v<<2)|0,u,w,r,c[s>>2]|0,c[d>>2]|0,k,l,m,x);c[n>>2]=c[e>>2];vh(b,n,y,c[q>>2]|0,c[t>>2]|0,g,h);if((z|0)==0){Ee(m);Ee(l);te(k);C=c[o>>2]|0;C=C|0;Wd(C)|0;i=p;return}Jm(z);Ee(m);Ee(l);te(k);C=c[o>>2]|0;C=C|0;Wd(C)|0;i=p;return}C=cc(4)|0;nm(C);zb(C|0,8296,130)}function Ej(a){a=a|0;Ud(a|0);Pm(a);return}function Fj(a){a=a|0;Ud(a|0);return}function Gj(b,d,e){b=b|0;d=d|0;e=e|0;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=ec(d|0,1)|0;return e>>>(((e|0)!=-1|0)>>>0)|0}function Hj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;d=i;i=i+16|0;j=d|0;l=j;dn(l|0,0,12)|0;m=a[h]|0;if((m&1)==0){n=(m&255)>>>1;m=h+1|0;h=h+1|0}else{o=c[h+8>>2]|0;n=c[h+4>>2]|0;m=o;h=o}h=h+n|0;if(m>>>0<h>>>0){do{ye(j,a[m]|0);m=m+1|0}while(m>>>0<h>>>0);e=(e|0)==-1?-1:e<<1;if((a[l]&1)==0){k=10}else{l=c[j+8>>2]|0}}else{e=(e|0)==-1?-1:e<<1;k=10}if((k|0)==10){l=j+1|0}g=kb(e|0,f|0,g|0,l|0)|0;dn(b|0,0,12)|0;o=fn(g|0)|0;f=g+o|0;if((o|0)<=0){te(j);i=d;return}do{ye(b,a[g]|0);g=g+1|0}while(g>>>0<f>>>0);te(j);i=d;return}function Ij(a,b){a=a|0;b=b|0;Nb(((b|0)==-1?-1:b<<1)|0)|0;return}function Jj(a){a=a|0;Ud(a|0);Pm(a);return}function Kj(a){a=a|0;Ud(a|0);return}function Lj(b,d,e){b=b|0;d=d|0;e=e|0;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=ec(d|0,1)|0;return e>>>(((e|0)!=-1|0)>>>0)|0}function Mj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;d=i;i=i+240|0;w=d|0;z=d+8|0;q=d+40|0;r=d+48|0;p=d+56|0;o=d+64|0;l=d+192|0;k=d+200|0;m=d+208|0;s=d+224|0;n=d+232|0;t=m;dn(t|0,0,12)|0;c[s+4>>2]=0;c[s>>2]=4200;u=a[h]|0;if((u&1)==0){u=(u&255)>>>1;y=h+4|0;h=h+4|0}else{A=c[h+8>>2]|0;u=c[h+4>>2]|0;y=A;h=A}u=h+(u<<2)|0;h=z|0;v=w;c[w>>2]=0;c[w+4>>2]=0;a:do{if(y>>>0<u>>>0){w=s|0;x=s;z=z+32|0;A=4200;while(1){c[r>>2]=y;B=(wc[c[A+12>>2]&31](w,v,y,u,r,h,z,q)|0)==2;A=c[r>>2]|0;if(B|(A|0)==(y|0)){break}if(h>>>0<(c[q>>2]|0)>>>0){y=h;do{ye(m,a[y]|0);y=y+1|0}while(y>>>0<(c[q>>2]|0)>>>0);y=c[r>>2]|0}else{y=A}if(!(y>>>0<u>>>0)){break a}A=c[x>>2]|0}fj(896)}}while(0);Ud(s|0);if((a[t]&1)==0){q=m+1|0}else{q=c[m+8>>2]|0}s=kb(((e|0)==-1?-1:e<<1)|0,f|0,g|0,q|0)|0;dn(b|0,0,12)|0;c[n+4>>2]=0;c[n>>2]=4144;B=fn(s|0)|0;e=s+B|0;g=p;c[p>>2]=0;c[p+4>>2]=0;if((B|0)<=0){B=n|0;Ud(B);te(m);i=d;return}q=n|0;p=n;f=e;r=o|0;o=o+128|0;t=4144;while(1){c[k>>2]=s;B=(wc[c[t+16>>2]&31](q,g,s,(f-s|0)>32?s+32|0:e,k,r,o,l)|0)==2;t=c[k>>2]|0;if(B|(t|0)==(s|0)){break}if(r>>>0<(c[l>>2]|0)>>>0){s=r;do{Ie(b,c[s>>2]|0);s=s+4|0}while(s>>>0<(c[l>>2]|0)>>>0);s=c[k>>2]|0}else{s=t}if(!(s>>>0<e>>>0)){j=37;break}t=c[p>>2]|0}if((j|0)==37){B=n|0;Ud(B);te(m);i=d;return}fj(896)}function Nj(a,b){a=a|0;b=b|0;Nb(((b|0)==-1?-1:b<<1)|0)|0;return}function Oj(b){b=b|0;var d=0,e=0;c[b>>2]=3664;d=b+8|0;e=c[d>>2]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}if((e|0)==(c[3016]|0)){e=b|0;Ud(e);return}jb(c[d>>2]|0);e=b|0;Ud(e);return}function Pj(a){a=a|0;a=cc(8)|0;Xd(a,1352);c[a>>2]=2600;zb(a|0,8328,36)}function Qj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;x=i;i=i+448|0;g=x|0;h=x+16|0;j=x+32|0;k=x+48|0;l=x+64|0;m=x+80|0;n=x+96|0;o=x+112|0;p=x+128|0;q=x+144|0;r=x+160|0;s=x+176|0;t=x+192|0;u=x+208|0;v=x+224|0;w=x+240|0;e=x+256|0;y=x+272|0;z=x+288|0;A=x+304|0;B=x+320|0;C=x+336|0;D=x+352|0;E=x+368|0;F=x+384|0;G=x+400|0;H=x+416|0;f=x+432|0;c[b+4>>2]=d-1;c[b>>2]=3920;I=b+8|0;d=b+12|0;J=b+136|0;a[J]=1;K=b+24|0;c[d>>2]=K;c[I>>2]=K;c[b+16>>2]=J;J=28;do{if((K|0)==0){K=0}else{c[K>>2]=0;K=c[d>>2]|0}K=K+4|0;c[d>>2]=K;J=J-1|0}while((J|0)!=0);re(b+144|0,1336,1);I=c[I>>2]|0;J=c[d>>2]|0;if((J|0)!=(I|0)){c[d>>2]=J+(~((J-4+(-I|0)|0)>>>2)<<2)}c[3073]=0;c[3072]=3624;if(!((c[3322]|0)==-1)){c[H>>2]=13288;c[H+4>>2]=14;c[H+8>>2]=0;oe(13288,H,96)}Rj(b,12288,(c[3323]|0)-1|0);c[3071]=0;c[3070]=3584;if(!((c[3320]|0)==-1)){c[G>>2]=13280;c[G+4>>2]=14;c[G+8>>2]=0;oe(13280,G,96)}Rj(b,12280,(c[3321]|0)-1|0);c[3127]=0;c[3126]=4032;c[3128]=0;a[12516]=0;c[3128]=c[(ib()|0)>>2];if(!((c[3402]|0)==-1)){c[F>>2]=13608;c[F+4>>2]=14;c[F+8>>2]=0;oe(13608,F,96)}Rj(b,12504,(c[3403]|0)-1|0);c[3125]=0;c[3124]=3952;if(!((c[3400]|0)==-1)){c[E>>2]=13600;c[E+4>>2]=14;c[E+8>>2]=0;oe(13600,E,96)}Rj(b,12496,(c[3401]|0)-1|0);c[3079]=0;c[3078]=3720;if(!((c[3326]|0)==-1)){c[D>>2]=13304;c[D+4>>2]=14;c[D+8>>2]=0;oe(13304,D,96)}Rj(b,12312,(c[3327]|0)-1|0);c[3075]=0;c[3074]=3664;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}c[3076]=c[3016];if(!((c[3324]|0)==-1)){c[C>>2]=13296;c[C+4>>2]=14;c[C+8>>2]=0;oe(13296,C,96)}Rj(b,12296,(c[3325]|0)-1|0);c[3081]=0;c[3080]=3776;if(!((c[3328]|0)==-1)){c[B>>2]=13312;c[B+4>>2]=14;c[B+8>>2]=0;oe(13312,B,96)}Rj(b,12320,(c[3329]|0)-1|0);c[3083]=0;c[3082]=3832;if(!((c[3330]|0)==-1)){c[A>>2]=13320;c[A+4>>2]=14;c[A+8>>2]=0;oe(13320,A,96)}Rj(b,12328,(c[3331]|0)-1|0);c[3053]=0;c[3052]=3128;a[12216]=46;a[12217]=44;dn(12220,0,12)|0;if(!((c[3306]|0)==-1)){c[z>>2]=13224;c[z+4>>2]=14;c[z+8>>2]=0;oe(13224,z,96)}Rj(b,12208,(c[3307]|0)-1|0);c[3045]=0;c[3044]=3080;c[3046]=46;c[3047]=44;dn(12192,0,12)|0;if(!((c[3304]|0)==-1)){c[y>>2]=13216;c[y+4>>2]=14;c[y+8>>2]=0;oe(13216,y,96)}Rj(b,12176,(c[3305]|0)-1|0);c[3069]=0;c[3068]=3512;if(!((c[3318]|0)==-1)){c[e>>2]=13272;c[e+4>>2]=14;c[e+8>>2]=0;oe(13272,e,96)}Rj(b,12272,(c[3319]|0)-1|0);c[3067]=0;c[3066]=3440;if(!((c[3316]|0)==-1)){c[w>>2]=13264;c[w+4>>2]=14;c[w+8>>2]=0;oe(13264,w,96)}Rj(b,12264,(c[3317]|0)-1|0);c[3065]=0;c[3064]=3376;if(!((c[3314]|0)==-1)){c[v>>2]=13256;c[v+4>>2]=14;c[v+8>>2]=0;oe(13256,v,96)}Rj(b,12256,(c[3315]|0)-1|0);c[3063]=0;c[3062]=3312;if(!((c[3312]|0)==-1)){c[u>>2]=13248;c[u+4>>2]=14;c[u+8>>2]=0;oe(13248,u,96)}Rj(b,12248,(c[3313]|0)-1|0);c[3137]=0;c[3136]=4960;if(!((c[3522]|0)==-1)){c[t>>2]=14088;c[t+4>>2]=14;c[t+8>>2]=0;oe(14088,t,96)}Rj(b,12544,(c[3523]|0)-1|0);c[3135]=0;c[3134]=4896;if(!((c[3520]|0)==-1)){c[s>>2]=14080;c[s+4>>2]=14;c[s+8>>2]=0;oe(14080,s,96)}Rj(b,12536,(c[3521]|0)-1|0);c[3133]=0;c[3132]=4832;if(!((c[3518]|0)==-1)){c[r>>2]=14072;c[r+4>>2]=14;c[r+8>>2]=0;oe(14072,r,96)}Rj(b,12528,(c[3519]|0)-1|0);c[3131]=0;c[3130]=4768;if(!((c[3516]|0)==-1)){c[q>>2]=14064;c[q+4>>2]=14;c[q+8>>2]=0;oe(14064,q,96)}Rj(b,12520,(c[3517]|0)-1|0);c[3027]=0;c[3026]=2784;if(!((c[3294]|0)==-1)){c[p>>2]=13176;c[p+4>>2]=14;c[p+8>>2]=0;oe(13176,p,96)}Rj(b,12104,(c[3295]|0)-1|0);c[3025]=0;c[3024]=2744;if(!((c[3292]|0)==-1)){c[o>>2]=13168;c[o+4>>2]=14;c[o+8>>2]=0;oe(13168,o,96)}Rj(b,12096,(c[3293]|0)-1|0);c[3023]=0;c[3022]=2704;if(!((c[3290]|0)==-1)){c[n>>2]=13160;c[n+4>>2]=14;c[n+8>>2]=0;oe(13160,n,96)}Rj(b,12088,(c[3291]|0)-1|0);c[3021]=0;c[3020]=2664;if(!((c[3288]|0)==-1)){c[m>>2]=13152;c[m+4>>2]=14;c[m+8>>2]=0;oe(13152,m,96)}Rj(b,12080,(c[3289]|0)-1|0);c[3041]=0;c[3040]=2984;c[3042]=3032;if(!((c[3302]|0)==-1)){c[l>>2]=13208;c[l+4>>2]=14;c[l+8>>2]=0;oe(13208,l,96)}Rj(b,12160,(c[3303]|0)-1|0);c[3037]=0;c[3036]=2888;c[3038]=2936;if(!((c[3300]|0)==-1)){c[k>>2]=13200;c[k+4>>2]=14;c[k+8>>2]=0;oe(13200,k,96)}Rj(b,12144,(c[3301]|0)-1|0);c[3033]=0;c[3032]=3888;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}c[3034]=c[3016];c[3032]=2856;if(!((c[3298]|0)==-1)){c[j>>2]=13192;c[j+4>>2]=14;c[j+8>>2]=0;oe(13192,j,96)}Rj(b,12128,(c[3299]|0)-1|0);c[3029]=0;c[3028]=3888;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}c[3030]=c[3016];c[3028]=2824;if(!((c[3296]|0)==-1)){c[h>>2]=13184;c[h+4>>2]=14;c[h+8>>2]=0;oe(13184,h,96)}Rj(b,12112,(c[3297]|0)-1|0);c[3061]=0;c[3060]=3216;if(!((c[3310]|0)==-1)){c[g>>2]=13240;c[g+4>>2]=14;c[g+8>>2]=0;oe(13240,g,96)}Rj(b,12240,(c[3311]|0)-1|0);c[3059]=0;c[3058]=3176;if(!((c[3308]|0)==-1)){c[f>>2]=13232;c[f+4>>2]=14;c[f+8>>2]=0;oe(13232,f,96)}Rj(b,12232,(c[3309]|0)-1|0);i=x;return}function Rj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;Vd(b|0);e=a+8|0;g=a+12|0;j=c[g>>2]|0;a=e|0;k=c[a>>2]|0;h=j-k>>2;do{if(!(h>>>0>d>>>0)){i=d+1|0;if(h>>>0<i>>>0){Vl(e,i-h|0);k=c[a>>2]|0;break}if(h>>>0>i>>>0?(f=k+(i<<2)|0,(j|0)!=(f|0)):0){c[g>>2]=j+(~((j-4+(-f|0)|0)>>>2)<<2)}}}while(0);e=c[k+(d<<2)>>2]|0;if((e|0)==0){k=k+(d<<2)|0;c[k>>2]=b;return}Wd(e|0)|0;k=c[a>>2]|0;k=k+(d<<2)|0;c[k>>2]=b;return}function Sj(a){a=a|0;Tj(a);Pm(a);return}function Tj(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;c[b>>2]=3920;d=b+12|0;h=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;if((h|0)!=(g|0)){e=0;do{i=c[g+(e<<2)>>2]|0;if((i|0)!=0){Wd(i|0)|0;h=c[d>>2]|0;g=c[f>>2]|0}e=e+1|0}while(e>>>0<h-g>>2>>>0)}te(b+144|0);e=c[f>>2]|0;if((e|0)==0){i=b|0;Ud(i);return}f=c[d>>2]|0;if((f|0)!=(e|0)){c[d>>2]=f+(~((f-4+(-e|0)|0)>>>2)<<2)}if((b+24|0)==(e|0)){a[b+136|0]=0;i=b|0;Ud(i);return}else{Pm(e);i=b|0;Ud(i);return}}function Uj(){var b=0;if((a[14152]|0)!=0){b=c[3008]|0;return b|0}if((ob(14152)|0)==0){b=c[3008]|0;return b|0}if((a[14160]|0)==0?(ob(14160)|0)!=0:0){Qj(12336,1);c[3012]=12336;c[3010]=12048}b=c[c[3010]>>2]|0;c[3014]=b;Vd(b|0);c[3008]=12056;b=c[3008]|0;return b|0}function Vj(a){a=a|0;var b=0;b=c[(Uj()|0)>>2]|0;c[a>>2]=b;Vd(b|0);return}function Wj(a,b){a=a|0;b=b|0;b=c[b>>2]|0;c[a>>2]=b;Vd(b|0);return}function Xj(a){a=a|0;Wd(c[a>>2]|0)|0;return}function Yj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d|0;a=c[a>>2]|0;f=b|0;if(!((c[f>>2]|0)==-1)){c[e>>2]=b;c[e+4>>2]=14;c[e+8>>2]=0;oe(f,e,96)}e=(c[b+4>>2]|0)-1|0;b=c[a+8>>2]|0;if(!((c[a+12>>2]|0)-b>>2>>>0>e>>>0)){f=cc(4)|0;e=f;nm(e);zb(f|0,8296,130)}a=c[b+(e<<2)>>2]|0;if((a|0)==0){f=cc(4)|0;e=f;nm(e);zb(f|0,8296,130)}else{i=d;return a|0}return 0}function Zj(a){a=a|0;Ud(a|0);Pm(a);return}function _j(a){a=a|0;if((a|0)==0){return}nc[c[(c[a>>2]|0)+4>>2]&511](a);return}function $j(a){a=a|0;c[a+4>>2]=(I=c[3332]|0,c[3332]=I+1,I)+1;return}function ak(a){a=a|0;Ud(a|0);Pm(a);return}function bk(a,d,e){a=a|0;d=d|0;e=e|0;if(!(e>>>0<128>>>0)){a=0;return a|0}a=(b[(c[(ib()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return a|0}function ck(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;if((d|0)==(e|0)){a=d;return a|0}while(1){a=c[d>>2]|0;if(a>>>0<128>>>0){a=b[(c[(ib()|0)>>2]|0)+(a<<1)>>1]|0}else{a=0}b[f>>1]=a;d=d+4|0;if((d|0)==(e|0)){break}else{f=f+2|0}}return e|0}function dk(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;if((e|0)==(f|0)){a=e;return a|0}while(1){a=c[e>>2]|0;if(a>>>0<128>>>0?!((b[(c[(ib()|0)>>2]|0)+(a<<1)>>1]&d)<<16>>16==0):0){f=e;d=7;break}e=e+4|0;if((e|0)==(f|0)){d=7;break}}if((d|0)==7){return f|0}return 0}function ek(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0;a:do{if((e|0)==(f|0)){f=e}else{while(1){a=c[e>>2]|0;if(!(a>>>0<128>>>0)){f=e;break a}g=e+4|0;if((b[(c[(ib()|0)>>2]|0)+(a<<1)>>1]&d)<<16>>16==0){f=e;break a}if((g|0)==(f|0)){break}else{e=g}}}}while(0);return f|0}function fk(a,b){a=a|0;b=b|0;if(!(b>>>0<128>>>0)){a=b;return a|0}a=c[(c[(fc()|0)>>2]|0)+(b<<2)>>2]|0;return a|0}function gk(a,b,d){a=a|0;b=b|0;d=d|0;if((b|0)==(d|0)){a=b;return a|0}do{a=c[b>>2]|0;if(a>>>0<128>>>0){a=c[(c[(fc()|0)>>2]|0)+(a<<2)>>2]|0}c[b>>2]=a;b=b+4|0}while((b|0)!=(d|0));return d|0}function hk(a,b){a=a|0;b=b|0;if(!(b>>>0<128>>>0)){a=b;return a|0}a=c[(c[(gc()|0)>>2]|0)+(b<<2)>>2]|0;return a|0}function ik(a,b,d){a=a|0;b=b|0;d=d|0;if((b|0)==(d|0)){a=b;return a|0}do{a=c[b>>2]|0;if(a>>>0<128>>>0){a=c[(c[(gc()|0)>>2]|0)+(a<<2)>>2]|0}c[b>>2]=a;b=b+4|0}while((b|0)!=(d|0));return d|0}function jk(a,b){a=a|0;b=b|0;return b<<24>>24|0}function kk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;if((d|0)==(e|0)){b=d;return b|0}while(1){c[f>>2]=a[d]|0;d=d+1|0;if((d|0)==(e|0)){break}else{f=f+4|0}}return e|0}function lk(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128>>>0?b&255:c)|0}function mk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;if((d|0)==(e|0)){i=d;return i|0}b=((e-4+(-d|0)|0)>>>2)+1|0;h=d;while(1){i=c[h>>2]|0;a[g]=i>>>0<128>>>0?i&255:f;h=h+4|0;if((h|0)==(e|0)){break}else{g=g+1|0}}i=d+(b<<2)|0;return i|0}function nk(b){b=b|0;var d=0;c[b>>2]=4032;d=c[b+8>>2]|0;if((d|0)!=0?(a[b+12|0]|0)!=0:0){Qm(d)}Ud(b|0);Pm(b);return}function ok(b){b=b|0;var d=0;c[b>>2]=4032;d=c[b+8>>2]|0;if((d|0)!=0?(a[b+12|0]|0)!=0:0){Qm(d)}Ud(b|0);return}function pk(a,b){a=a|0;b=b|0;if(!(b<<24>>24>-1)){a=b;return a|0}a=c[(c[(fc()|0)>>2]|0)+((b&255)<<2)>>2]&255;return a|0}function qk(b,d,e){b=b|0;d=d|0;e=e|0;if((d|0)==(e|0)){b=d;return b|0}do{b=a[d]|0;if(b<<24>>24>-1){b=c[(c[(fc()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255}a[d]=b;d=d+1|0}while((d|0)!=(e|0));return e|0}function rk(a,b){a=a|0;b=b|0;if(!(b<<24>>24>-1)){a=b;return a|0}a=c[(c[(gc()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return a|0}function sk(b,d,e){b=b|0;d=d|0;e=e|0;if((d|0)==(e|0)){b=d;return b|0}do{b=a[d]|0;if(b<<24>>24>-1){b=c[(c[(gc()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255}a[d]=b;d=d+1|0}while((d|0)!=(e|0));return e|0}function tk(a,b){a=a|0;b=b|0;return b|0}function uk(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;if((c|0)==(d|0)){b=c;return b|0}while(1){a[e]=a[c]|0;c=c+1|0;if((c|0)==(d|0)){break}else{e=e+1|0}}return d|0}function vk(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function wk(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;if((c|0)==(d|0)){b=c;return b|0}while(1){b=a[c]|0;a[f]=b<<24>>24>-1?b:e;c=c+1|0;if((c|0)==(d|0)){break}else{f=f+1|0}}return d|0}function xk(a){a=a|0;Ud(a|0);Pm(a);return}function yk(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function zk(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function Ak(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Bk(a){a=a|0;return 1}function Ck(a){a=a|0;return 1}function Dk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;c=d-c|0;return(c>>>0<e>>>0?c:e)|0}function Ek(a){a=a|0;return 1}function Fk(a){a=a|0;Oj(a);Pm(a);return}function Gk(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;l=i;i=i+8|0;n=l|0;m=n;q=i;i=i+4|0;i=i+7&-8;o=(e|0)==(f|0);a:do{if(!o){r=e;while(1){p=r+4|0;if((c[r>>2]|0)==0){break}if((p|0)==(f|0)){r=f;break}else{r=p}}c[k>>2]=h;c[g>>2]=e;if(!(o|(h|0)==(j|0))){p=d;o=j;b=b+8|0;q=q|0;while(1){s=c[p+4>>2]|0;c[n>>2]=c[p>>2];c[n+4>>2]=s;s=Rb(c[b>>2]|0)|0;t=gm(h,g,r-e>>2,o-h|0,d)|0;if((s|0)!=0){Rb(s|0)|0}if((t|0)==(-1|0)){d=16;break}else if((t|0)==0){g=1;d=51;break}h=(c[k>>2]|0)+t|0;c[k>>2]=h;if((h|0)==(j|0)){d=49;break}if((r|0)==(f|0)){r=f;e=c[g>>2]|0}else{h=Rb(c[b>>2]|0)|0;e=fm(q,0,d)|0;if((h|0)!=0){Rb(h|0)|0}if((e|0)==-1){g=2;d=51;break}r=c[k>>2]|0;if(e>>>0>(o-r|0)>>>0){g=1;d=51;break}b:do{if((e|0)!=0){h=q;while(1){t=a[h]|0;c[k>>2]=r+1;a[r]=t;e=e-1|0;if((e|0)==0){break b}h=h+1|0;r=c[k>>2]|0}}}while(0);e=(c[g>>2]|0)+4|0;c[g>>2]=e;c:do{if((e|0)==(f|0)){r=f}else{r=e;while(1){h=r+4|0;if((c[r>>2]|0)==0){break c}if((h|0)==(f|0)){r=f;break}else{r=h}}}}while(0);h=c[k>>2]|0}if((e|0)==(f|0)|(h|0)==(j|0)){break a}}if((d|0)==16){c[k>>2]=h;d:do{if((e|0)!=(c[g>>2]|0)){do{d=c[e>>2]|0;f=Rb(c[b>>2]|0)|0;d=fm(h,d,m)|0;if((f|0)!=0){Rb(f|0)|0}if((d|0)==-1){break d}h=(c[k>>2]|0)+d|0;c[k>>2]=h;e=e+4|0}while((e|0)!=(c[g>>2]|0))}}while(0);c[g>>2]=e;t=2;i=l;return t|0}else if((d|0)==49){e=c[g>>2]|0;break}else if((d|0)==51){i=l;return g|0}}}else{c[k>>2]=h;c[g>>2]=e}}while(0);t=(e|0)!=(f|0)|0;i=l;return t|0}function Hk(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;l=i;i=i+8|0;n=l|0;m=n;o=(e|0)==(f|0);a:do{if(!o){r=e;while(1){p=r+1|0;if((a[r]|0)==0){break}if((p|0)==(f|0)){r=f;break}else{r=p}}c[k>>2]=h;c[g>>2]=e;if(!(o|(h|0)==(j|0))){p=d;o=j;b=b+8|0;while(1){q=c[p+4>>2]|0;c[n>>2]=c[p>>2];c[n+4>>2]=q;q=r;t=Rb(c[b>>2]|0)|0;s=cm(h,g,q-e|0,o-h>>2,d)|0;if((t|0)!=0){Rb(t|0)|0}if((s|0)==(-1|0)){n=16;break}else if((s|0)==0){f=2;n=50;break}h=(c[k>>2]|0)+(s<<2)|0;c[k>>2]=h;if((h|0)==(j|0)){n=48;break}e=c[g>>2]|0;if((r|0)==(f|0)){r=f}else{q=Rb(c[b>>2]|0)|0;h=bm(h,e,1,d)|0;if((q|0)!=0){Rb(q|0)|0}if((h|0)!=0){f=2;n=50;break}c[k>>2]=(c[k>>2]|0)+4;e=(c[g>>2]|0)+1|0;c[g>>2]=e;b:do{if((e|0)==(f|0)){r=f}else{r=e;while(1){q=r+1|0;if((a[r]|0)==0){break b}if((q|0)==(f|0)){r=f;break}else{r=q}}}}while(0);h=c[k>>2]|0}if((e|0)==(f|0)|(h|0)==(j|0)){break a}}if((n|0)==16){c[k>>2]=h;c:do{if((e|0)!=(c[g>>2]|0)){while(1){n=Rb(c[b>>2]|0)|0;j=bm(h,e,q-e|0,m)|0;if((n|0)!=0){Rb(n|0)|0}if((j|0)==0){e=e+1|0}else if((j|0)==(-1|0)){n=27;break}else if((j|0)==(-2|0)){n=28;break}else{e=e+j|0}h=(c[k>>2]|0)+4|0;c[k>>2]=h;if((e|0)==(c[g>>2]|0)){break c}}if((n|0)==27){c[g>>2]=e;t=2;i=l;return t|0}else if((n|0)==28){c[g>>2]=e;t=1;i=l;return t|0}}}while(0);c[g>>2]=e;t=(e|0)!=(f|0)|0;i=l;return t|0}else if((n|0)==48){e=c[g>>2]|0;break}else if((n|0)==50){i=l;return f|0}}}else{c[k>>2]=h;c[g>>2]=e}}while(0);t=(e|0)!=(f|0)|0;i=l;return t|0}function Ik(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;h=i;i=i+8|0;c[g>>2]=e;e=h|0;b=Rb(c[b+8>>2]|0)|0;d=fm(e,0,d)|0;if((b|0)!=0){Rb(b|0)|0}if((d|0)==(-1|0)|(d|0)==0){b=2;i=h;return b|0}b=d-1|0;d=c[g>>2]|0;if(b>>>0>(f-d|0)>>>0){b=1;i=h;return b|0}if((b|0)==0){b=0;i=h;return b|0}else{f=b}while(1){b=a[e]|0;c[g>>2]=d+1;a[d]=b;f=f-1|0;if((f|0)==0){g=0;break}e=e+1|0;d=c[g>>2]|0}i=h;return g|0}function Jk(a){a=a|0;var b=0,d=0;a=a+8|0;d=Rb(c[a>>2]|0)|0;b=em(0,0,4)|0;if((d|0)!=0){Rb(d|0)|0}if((b|0)!=0){d=-1;return d|0}a=c[a>>2]|0;if((a|0)==0){d=1;return d|0}a=Rb(a|0)|0;if((a|0)==0){d=0;return d|0}Rb(a|0)|0;d=0;return d|0}function Kk(a){a=a|0;return 0}function Lk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;if((f|0)==0|(d|0)==(e|0)){k=0;return k|0}g=e;a=a+8|0;i=0;h=0;while(1){k=Rb(c[a>>2]|0)|0;j=am(d,g-d|0,b)|0;if((k|0)!=0){Rb(k|0)|0}if((j|0)==0){k=1;d=d+1|0}else if((j|0)==(-1|0)|(j|0)==(-2|0)){f=15;break}else{k=j;d=d+j|0}i=k+i|0;h=h+1|0;if(h>>>0>=f>>>0|(d|0)==(e|0)){f=15;break}}if((f|0)==15){return i|0}return 0}function Mk(a){a=a|0;a=c[a+8>>2]|0;if((a|0)!=0){a=Rb(a|0)|0;if((a|0)==0){a=4}else{Rb(a|0)|0;a=4}}else{a=1}return a|0}function Nk(a){a=a|0;Ud(a|0);Pm(a);return}function Ok(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=Pk(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=a;return b|0}function Pk(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){n=1;return n|0}else{c[j>>2]=h+1;a[h]=-17;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=-69;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=-65;break}}}while(0);h=f;m=c[g>>2]|0;if(!(m>>>0<f>>>0)){n=0;return n|0}a:while(1){d=b[m>>1]|0;l=d&65535;if(l>>>0>k>>>0){f=2;k=26;break}do{if((d&65535)>>>0<128>>>0){l=c[j>>2]|0;if((i-l|0)<1){f=1;k=26;break a}c[j>>2]=l+1;a[l]=d}else{if((d&65535)>>>0<2048>>>0){d=c[j>>2]|0;if((i-d|0)<2){f=1;k=26;break a}c[j>>2]=d+1;a[d]=l>>>6|192;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l&63|128;break}if((d&65535)>>>0<55296>>>0){d=c[j>>2]|0;if((i-d|0)<3){f=1;k=26;break a}c[j>>2]=d+1;a[d]=l>>>12|224;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l>>>6&63|128;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l&63|128;break}if(!((d&65535)>>>0<56320>>>0)){if((d&65535)>>>0<57344>>>0){f=2;k=26;break a}d=c[j>>2]|0;if((i-d|0)<3){f=1;k=26;break a}c[j>>2]=d+1;a[d]=l>>>12|224;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l>>>6&63|128;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l&63|128;break}if((h-m|0)<4){f=1;k=26;break a}d=m+2|0;n=e[d>>1]|0;if((n&64512|0)!=56320){f=2;k=26;break a}if((i-(c[j>>2]|0)|0)<4){f=1;k=26;break a}m=l&960;if(((m<<10)+65536|l<<10&64512|n&1023)>>>0>k>>>0){f=2;k=26;break a}c[g>>2]=d;d=(m>>>6)+1|0;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=d>>>2|240;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=l>>>2&15|d<<4&48|128;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=l<<4&48|n>>>6&15|128;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=n&63|128}}while(0);m=(c[g>>2]|0)+2|0;c[g>>2]=m;if(!(m>>>0<f>>>0)){f=0;k=26;break}}if((k|0)==26){return f|0}return 0}function Qk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=Rk(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=a;return b|0}function Rk(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0;c[g>>2]=e;c[j>>2]=h;n=c[g>>2]|0;if(((((l&4|0)!=0?(f-n|0)>2:0)?(a[n]|0)==-17:0)?(a[n+1|0]|0)==-69:0)?(a[n+2|0]|0)==-65:0){n=n+3|0;c[g>>2]=n}a:do{if(n>>>0<f>>>0){e=f;l=i;h=c[j>>2]|0;b:while(1){if(!(h>>>0<i>>>0)){break a}o=a[n]|0;m=o&255;if(m>>>0>k>>>0){f=2;i=41;break}do{if(o<<24>>24>-1){b[h>>1]=o&255;c[g>>2]=n+1}else{if((o&255)>>>0<194>>>0){f=2;i=41;break b}if((o&255)>>>0<224>>>0){if((e-n|0)<2){f=1;i=41;break b}o=d[n+1|0]|0;if((o&192|0)!=128){f=2;i=41;break b}m=o&63|m<<6&1984;if(m>>>0>k>>>0){f=2;i=41;break b}b[h>>1]=m;c[g>>2]=n+2;break}if((o&255)>>>0<240>>>0){if((e-n|0)<3){f=1;i=41;break b}o=a[n+1|0]|0;p=a[n+2|0]|0;if((m|0)==237){if(!((o&-32)<<24>>24==-128)){f=2;i=41;break b}}else if((m|0)==224){if(!((o&-32)<<24>>24==-96)){f=2;i=41;break b}}else{if(!((o&-64)<<24>>24==-128)){f=2;i=41;break b}}p=p&255;if((p&192|0)!=128){f=2;i=41;break b}m=(o&255)<<6&4032|m<<12|p&63;if((m&65535)>>>0>k>>>0){f=2;i=41;break b}b[h>>1]=m;c[g>>2]=n+3;break}if(!((o&255)>>>0<245>>>0)){f=2;i=41;break b}if((e-n|0)<4){f=1;i=41;break b}o=a[n+1|0]|0;p=a[n+2|0]|0;q=a[n+3|0]|0;if((m|0)==244){if(!((o&-16)<<24>>24==-128)){f=2;i=41;break b}}else if((m|0)==240){if(!((o+112&255)>>>0<48>>>0)){f=2;i=41;break b}}else{if(!((o&-64)<<24>>24==-128)){f=2;i=41;break b}}n=p&255;if((n&192|0)!=128){f=2;i=41;break b}p=q&255;if((p&192|0)!=128){f=2;i=41;break b}if((l-h|0)<4){f=1;i=41;break b}m=m&7;q=o&255;o=n<<6;p=p&63;if((q<<12&258048|m<<18|o&4032|p)>>>0>k>>>0){f=2;i=41;break b}b[h>>1]=q<<2&60|n>>>4&3|((q>>>4&3|m<<2)<<6)+16320|55296;q=h+2|0;c[j>>2]=q;b[q>>1]=p|o&960|56320;c[g>>2]=(c[g>>2]|0)+4}}while(0);h=(c[j>>2]|0)+2|0;c[j>>2]=h;n=c[g>>2]|0;if(!(n>>>0<f>>>0)){break a}}if((i|0)==41){return f|0}}}while(0);q=n>>>0<f>>>0|0;return q|0}function Sk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Tk(a){a=a|0;return 0}function Uk(a){a=a|0;return 0}function Vk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Wk(c,d,e,1114111,0)|0}function Wk(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((((g&4|0)!=0?(c-b|0)>2:0)?(a[b]|0)==-17:0)?(a[b+1|0]|0)==-69:0){i=(a[b+2|0]|0)==-65?b+3|0:b}else{i=b}a:do{if(i>>>0<c>>>0&(e|0)!=0){g=c;h=0;b:while(1){k=a[i]|0;j=k&255;if(j>>>0>f>>>0){break a}do{if(k<<24>>24>-1){i=i+1|0}else{if((k&255)>>>0<194>>>0){break a}if((k&255)>>>0<224>>>0){if((g-i|0)<2){break a}k=d[i+1|0]|0;if((k&192|0)!=128){break a}if((k&63|j<<6&1984)>>>0>f>>>0){break a}i=i+2|0;break}if((k&255)>>>0<240>>>0){l=i;if((g-l|0)<3){break a}k=a[i+1|0]|0;m=a[i+2|0]|0;if((j|0)==224){if(!((k&-32)<<24>>24==-96)){c=21;break b}}else if((j|0)==237){if(!((k&-32)<<24>>24==-128)){c=23;break b}}else{if(!((k&-64)<<24>>24==-128)){c=25;break b}}l=m&255;if((l&192|0)!=128){break a}if(((k&255)<<6&4032|j<<12&61440|l&63)>>>0>f>>>0){break a}i=i+3|0;break}if(!((k&255)>>>0<245>>>0)){break a}m=i;if((g-m|0)<4){break a}if((e-h|0)>>>0<2>>>0){break a}k=a[i+1|0]|0;n=a[i+2|0]|0;l=a[i+3|0]|0;if((j|0)==244){if(!((k&-16)<<24>>24==-128)){c=36;break b}}else if((j|0)==240){if(!((k+112&255)>>>0<48>>>0)){c=34;break b}}else{if(!((k&-64)<<24>>24==-128)){c=38;break b}}m=n&255;if((m&192|0)!=128){break a}l=l&255;if((l&192|0)!=128){break a}if(((k&255)<<12&258048|j<<18&1835008|m<<6&4032|l&63)>>>0>f>>>0){break a}i=i+4|0;h=h+1|0}}while(0);h=h+1|0;if(!(i>>>0<c>>>0&h>>>0<e>>>0)){break a}}if((c|0)==21){n=l-b|0;return n|0}else if((c|0)==23){n=l-b|0;return n|0}else if((c|0)==25){n=l-b|0;return n|0}else if((c|0)==34){n=m-b|0;return n|0}else if((c|0)==36){n=m-b|0;return n|0}else if((c|0)==38){n=m-b|0;return n|0}}}while(0);n=i-b|0;return n|0}function Xk(a){a=a|0;return 4}function Yk(a){a=a|0;Ud(a|0);Pm(a);return}function Zk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=_k(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=a;return b|0}function _k(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){b=1;return b|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);j=c[e>>2]|0;if(!(j>>>0<d>>>0)){b=0;return b|0}a:while(1){j=c[j>>2]|0;if((j&-2048|0)==55296|j>>>0>i>>>0){i=2;e=19;break}do{if(!(j>>>0<128>>>0)){if(j>>>0<2048>>>0){f=c[h>>2]|0;if((g-f|0)<2){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j>>>6|192;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j&63|128;break}f=c[h>>2]|0;b=g-f|0;if(j>>>0<65536>>>0){if((b|0)<3){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j>>>12|224;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j>>>6&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j&63|128;break}else{if((b|0)<4){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j>>>18|240;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j>>>12&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j>>>6&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j&63|128;break}}else{f=c[h>>2]|0;if((g-f|0)<1){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j}}while(0);j=(c[e>>2]|0)+4|0;c[e>>2]=j;if(!(j>>>0<d>>>0)){i=0;e=19;break}}if((e|0)==19){return i|0}return 0}function $k(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=al(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=a;return b|0}function al(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;if(((((k&4|0)!=0?(e-g|0)>2:0)?(a[g]|0)==-17:0)?(a[g+1|0]|0)==-69:0)?(a[g+2|0]|0)==-65:0){g=g+3|0;c[f>>2]=g}a:do{if(g>>>0<e>>>0){k=e;b=c[i>>2]|0;b:while(1){if(!(b>>>0<h>>>0)){break a}m=a[g]|0;l=m&255;do{if(m<<24>>24>-1){if(l>>>0>j>>>0){e=2;h=40;break b}c[b>>2]=l;c[f>>2]=g+1}else{if((m&255)>>>0<194>>>0){e=2;h=40;break b}if((m&255)>>>0<224>>>0){if((k-g|0)<2){e=1;h=40;break b}m=d[g+1|0]|0;if((m&192|0)!=128){e=2;h=40;break b}l=m&63|l<<6&1984;if(l>>>0>j>>>0){e=2;h=40;break b}c[b>>2]=l;c[f>>2]=g+2;break}if((m&255)>>>0<240>>>0){if((k-g|0)<3){e=1;h=40;break b}m=a[g+1|0]|0;n=a[g+2|0]|0;if((l|0)==224){if(!((m&-32)<<24>>24==-96)){e=2;h=40;break b}}else if((l|0)==237){if(!((m&-32)<<24>>24==-128)){e=2;h=40;break b}}else{if(!((m&-64)<<24>>24==-128)){e=2;h=40;break b}}n=n&255;if((n&192|0)!=128){e=2;h=40;break b}l=(m&255)<<6&4032|l<<12&61440|n&63;if(l>>>0>j>>>0){e=2;h=40;break b}c[b>>2]=l;c[f>>2]=g+3;break}if(!((m&255)>>>0<245>>>0)){e=2;h=40;break b}if((k-g|0)<4){e=1;h=40;break b}m=a[g+1|0]|0;n=a[g+2|0]|0;o=a[g+3|0]|0;if((l|0)==244){if(!((m&-16)<<24>>24==-128)){e=2;h=40;break b}}else if((l|0)==240){if(!((m+112&255)>>>0<48>>>0)){e=2;h=40;break b}}else{if(!((m&-64)<<24>>24==-128)){e=2;h=40;break b}}n=n&255;if((n&192|0)!=128){e=2;h=40;break b}o=o&255;if((o&192|0)!=128){e=2;h=40;break b}l=(m&255)<<12&258048|l<<18&1835008|n<<6&4032|o&63;if(l>>>0>j>>>0){e=2;h=40;break b}c[b>>2]=l;c[f>>2]=g+4}}while(0);b=(c[i>>2]|0)+4|0;c[i>>2]=b;g=c[f>>2]|0;if(!(g>>>0<e>>>0)){break a}}if((h|0)==40){return e|0}}}while(0);o=g>>>0<e>>>0|0;return o|0}function bl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function cl(a){a=a|0;return 0}function dl(a){a=a|0;return 0}function el(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return fl(c,d,e,1114111,0)|0}function fl(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((((g&4|0)!=0?(c-b|0)>2:0)?(a[b]|0)==-17:0)?(a[b+1|0]|0)==-69:0){i=(a[b+2|0]|0)==-65?b+3|0:b}else{i=b}a:do{if(i>>>0<c>>>0&(e|0)!=0){h=c;g=1;b:while(1){k=a[i]|0;j=k&255;do{if(k<<24>>24>-1){if(j>>>0>f>>>0){break a}i=i+1|0}else{if((k&255)>>>0<194>>>0){break a}if((k&255)>>>0<224>>>0){if((h-i|0)<2){break a}k=d[i+1|0]|0;if((k&192|0)!=128){break a}if((k&63|j<<6&1984)>>>0>f>>>0){break a}i=i+2|0;break}if((k&255)>>>0<240>>>0){k=i;if((h-k|0)<3){break a}l=a[i+1|0]|0;m=a[i+2|0]|0;if((j|0)==224){if(!((l&-32)<<24>>24==-96)){c=21;break b}}else if((j|0)==237){if(!((l&-32)<<24>>24==-128)){c=23;break b}}else{if(!((l&-64)<<24>>24==-128)){c=25;break b}}k=m&255;if((k&192|0)!=128){break a}if(((l&255)<<6&4032|j<<12&61440|k&63)>>>0>f>>>0){break a}i=i+3|0;break}if(!((k&255)>>>0<245>>>0)){break a}m=i;if((h-m|0)<4){break a}k=a[i+1|0]|0;n=a[i+2|0]|0;l=a[i+3|0]|0;if((j|0)==240){if(!((k+112&255)>>>0<48>>>0)){c=33;break b}}else if((j|0)==244){if(!((k&-16)<<24>>24==-128)){c=35;break b}}else{if(!((k&-64)<<24>>24==-128)){c=37;break b}}m=n&255;if((m&192|0)!=128){break a}l=l&255;if((l&192|0)!=128){break a}if(((k&255)<<12&258048|j<<18&1835008|m<<6&4032|l&63)>>>0>f>>>0){break a}i=i+4|0}}while(0);if(!(i>>>0<c>>>0&g>>>0<e>>>0)){break a}g=g+1|0}if((c|0)==21){n=k-b|0;return n|0}else if((c|0)==23){n=k-b|0;return n|0}else if((c|0)==25){n=k-b|0;return n|0}else if((c|0)==33){n=m-b|0;return n|0}else if((c|0)==35){n=m-b|0;return n|0}else if((c|0)==37){n=m-b|0;return n|0}}}while(0);n=i-b|0;return n|0}function gl(a){a=a|0;return 4}function hl(a){a=a|0;Ud(a|0);Pm(a);return}function il(a){a=a|0;Ud(a|0);Pm(a);return}function jl(a){a=a|0;c[a>>2]=3128;te(a+12|0);Ud(a|0);Pm(a);return}function kl(a){a=a|0;c[a>>2]=3128;te(a+12|0);Ud(a|0);return}function ll(a){a=a|0;c[a>>2]=3080;te(a+16|0);Ud(a|0);Pm(a);return}function ml(a){a=a|0;c[a>>2]=3080;te(a+16|0);Ud(a|0);return}function nl(b){b=b|0;return a[b+8|0]|0}function ol(a){a=a|0;return c[a+8>>2]|0}function pl(b){b=b|0;return a[b+9|0]|0}function ql(a){a=a|0;return c[a+12>>2]|0}function rl(a,b){a=a|0;b=b|0;qe(a,b+12|0);return}function sl(a,b){a=a|0;b=b|0;qe(a,b+16|0);return}function tl(a,b){a=a|0;b=b|0;re(a,1304,4);return}function ul(a,b){a=a|0;b=b|0;Ce(a,1264,im(1264)|0);return}function vl(a,b){a=a|0;b=b|0;re(a,1256,5);return}function wl(a,b){a=a|0;b=b|0;Ce(a,1224,im(1224)|0);return}function xl(b){b=b|0;if((a[14248]|0)!=0){b=c[3162]|0;return b|0}if((ob(14248)|0)==0){b=c[3162]|0;return b|0}if((a[14136]|0)==0?(ob(14136)|0)!=0:0){dn(11576,0,168)|0;bb(262,0,u|0)|0}ue(11576,1536)|0;ue(11588,1528)|0;ue(11600,1520)|0;ue(11612,1504)|0;ue(11624,1488)|0;ue(11636,1480)|0;ue(11648,1464)|0;ue(11660,1456)|0;ue(11672,1448)|0;ue(11684,1440)|0;ue(11696,1432)|0;ue(11708,1424)|0;ue(11720,1408)|0;ue(11732,1400)|0;c[3162]=11576;b=c[3162]|0;return b|0}function yl(b){b=b|0;if((a[14192]|0)!=0){b=c[3140]|0;return b|0}if((ob(14192)|0)==0){b=c[3140]|0;return b|0}if((a[14112]|0)==0?(ob(14112)|0)!=0:0){dn(10832,0,168)|0;bb(148,0,u|0)|0}Fe(10832,1912)|0;Fe(10844,1880)|0;Fe(10856,1848)|0;Fe(10868,1808)|0;Fe(10880,1768)|0;Fe(10892,1736)|0;Fe(10904,1696)|0;Fe(10916,1680)|0;Fe(10928,1624)|0;Fe(10940,1608)|0;Fe(10952,1592)|0;Fe(10964,1576)|0;Fe(10976,1560)|0;Fe(10988,1544)|0;c[3140]=10832;b=c[3140]|0;return b|0}function zl(b){b=b|0;if((a[14240]|0)!=0){b=c[3160]|0;return b|0}if((ob(14240)|0)==0){b=c[3160]|0;return b|0}if((a[14128]|0)==0?(ob(14128)|0)!=0:0){dn(11288,0,288)|0;bb(166,0,u|0)|0}ue(11288,280)|0;ue(11300,248)|0;ue(11312,240)|0;ue(11324,232)|0;ue(11336,224)|0;ue(11348,216)|0;ue(11360,208)|0;ue(11372,200)|0;ue(11384,184)|0;ue(11396,176)|0;ue(11408,160)|0;ue(11420,104)|0;ue(11432,96)|0;ue(11444,88)|0;ue(11456,80)|0;ue(11468,72)|0;ue(11480,224)|0;ue(11492,64)|0;ue(11504,56)|0;ue(11516,1976)|0;ue(11528,1968)|0;ue(11540,1960)|0;ue(11552,1952)|0;ue(11564,1944)|0;c[3160]=11288;b=c[3160]|0;return b|0}function Al(b){b=b|0;if((a[14184]|0)!=0){b=c[3138]|0;return b|0}if((ob(14184)|0)==0){b=c[3138]|0;return b|0}if((a[14104]|0)==0?(ob(14104)|0)!=0:0){dn(10544,0,288)|0;bb(122,0,u|0)|0}Fe(10544,816)|0;Fe(10556,776)|0;Fe(10568,752)|0;Fe(10580,728)|0;Fe(10592,400)|0;Fe(10604,704)|0;Fe(10616,664)|0;Fe(10628,632)|0;Fe(10640,592)|0;Fe(10652,560)|0;Fe(10664,520)|0;Fe(10676,480)|0;Fe(10688,464)|0;Fe(10700,448)|0;Fe(10712,432)|0;Fe(10724,416)|0;Fe(10736,400)|0;Fe(10748,384)|0;Fe(10760,368)|0;Fe(10772,352)|0;Fe(10784,336)|0;Fe(10796,320)|0;Fe(10808,304)|0;Fe(10820,288)|0;c[3138]=10544;b=c[3138]|0;return b|0}function Bl(b){b=b|0;if((a[14256]|0)!=0){b=c[3164]|0;return b|0}if((ob(14256)|0)==0){b=c[3164]|0;return b|0}if((a[14144]|0)==0?(ob(14144)|0)!=0:0){dn(11744,0,288)|0;bb(120,0,u|0)|0}ue(11744,856)|0;ue(11756,848)|0;c[3164]=11744;b=c[3164]|0;return b|0}function Cl(b){b=b|0;if((a[14200]|0)!=0){b=c[3142]|0;return b|0}if((ob(14200)|0)==0){b=c[3142]|0;return b|0}if((a[14120]|0)==0?(ob(14120)|0)!=0:0){dn(11e3,0,288)|0;bb(236,0,u|0)|0}Fe(11e3,880)|0;Fe(11012,864)|0;c[3142]=11e3;b=c[3142]|0;return b|0}function Dl(b){b=b|0;if((a[14264]|0)!=0){return 12664}if((ob(14264)|0)==0){return 12664}re(12664,1208,8);bb(254,12664,u|0)|0;return 12664}function El(b){b=b|0;if((a[14208]|0)!=0){return 12576}if((ob(14208)|0)==0){return 12576}Ce(12576,1168,im(1168)|0);bb(192,12576,u|0)|0;return 12576}function Fl(b){b=b|0;if((a[14288]|0)!=0){return 12712}if((ob(14288)|0)==0){return 12712}re(12712,1152,8);bb(254,12712,u|0)|0;return 12712}function Gl(b){b=b|0;if((a[14232]|0)!=0){return 12624}if((ob(14232)|0)==0){return 12624}Ce(12624,1096,im(1096)|0);bb(192,12624,u|0)|0;return 12624}function Hl(b){b=b|0;if((a[14280]|0)!=0){return 12696}if((ob(14280)|0)==0){return 12696}re(12696,1072,20);bb(254,12696,u|0)|0;return 12696}function Il(b){b=b|0;if((a[14224]|0)!=0){return 12608}if((ob(14224)|0)==0){return 12608}Ce(12608,984,im(984)|0);bb(192,12608,u|0)|0;return 12608}function Jl(b){b=b|0;if((a[14272]|0)!=0){return 12680}if((ob(14272)|0)==0){return 12680}re(12680,968,11);bb(254,12680,u|0)|0;return 12680}function Kl(b){b=b|0;if((a[14216]|0)!=0){return 12592}if((ob(14216)|0)==0){return 12592}Ce(12592,920,im(920)|0);bb(192,12592,u|0)|0;return 12592}function Ll(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0.0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}j=Lb()|0;h=c[j>>2]|0;c[j>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}k=+bn(b,g,c[3016]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=h}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}if((b|0)!=34){i=f;return+k}c[e>>2]=4;i=f;return+k}function Ml(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0.0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}j=Lb()|0;h=c[j>>2]|0;c[j>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}k=+bn(b,g,c[3016]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=h}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}if((b|0)!=34){i=f;return+k}c[e>>2]=4;i=f;return+k}function Nl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0.0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}j=Lb()|0;h=c[j>>2]|0;c[j>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}k=+bn(b,g,c[3016]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=h}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}if((b|0)==34){c[e>>2]=4}i=f;return+k}function Ol(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;i=i+8|0;h=g|0;do{if((b|0)!=(d|0)){if((a[b]|0)==45){c[e>>2]=4;e=0;b=0;break}k=Lb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}b=Bb(b|0,h|0,f|0,c[3016]|0)|0;f=c[k>>2]|0;if((f|0)==0){c[k>>2]=j}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;e=0;b=0;break}if((f|0)==34){c[e>>2]=4;e=-1;b=-1}else{e=K}}else{c[e>>2]=4;e=0;b=0}}while(0);i=g;return(K=e,b)|0}function Pl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+8|0;g=h|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=h;return l|0}k=Lb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}f=Bb(b|0,g|0,f|0,c[3016]|0)|0;b=K;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}k=0;if((l|0)==34|(b>>>0>k>>>0|b>>>0==k>>>0&f>>>0>-1>>>0)){c[e>>2]=4;l=-1;i=h;return l|0}else{l=f;i=h;return l|0}return 0}function Ql(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+8|0;g=h|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=h;return l|0}k=Lb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}f=Bb(b|0,g|0,f|0,c[3016]|0)|0;b=K;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}k=0;if((l|0)==34|(b>>>0>k>>>0|b>>>0==k>>>0&f>>>0>-1>>>0)){c[e>>2]=4;l=-1;i=h;return l|0}else{l=f;i=h;return l|0}return 0}function Rl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+8|0;g=h|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=h;return l|0}k=Lb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}f=Bb(b|0,g|0,f|0,c[3016]|0)|0;b=K;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}k=0;if((l|0)==34|(b>>>0>k>>>0|b>>>0==k>>>0&f>>>0>65535>>>0)){c[e>>2]=4;l=-1;i=h;return l|0}else{l=f&65535;i=h;return l|0}return 0}function Sl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;j=g|0;if((b|0)==(d|0)){c[e>>2]=4;b=0;l=0;i=g;return(K=b,l)|0}k=Lb()|0;h=c[k>>2]|0;c[k>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}b=Db(b|0,j|0,f|0,c[3016]|0)|0;f=K;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=h}if((c[j>>2]|0)!=(d|0)){c[e>>2]=4;b=0;l=0;i=g;return(K=b,l)|0}if((l|0)==34){c[e>>2]=4;h=0;h=(f|0)>(h|0)|(f|0)==(h|0)&b>>>0>0>>>0;i=g;return(K=h?2147483647:-2147483648,h?-1:0)|0}else{l=b;i=g;return(K=f,l)|0}return 0}function Tl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;h=i;i=i+8|0;g=h|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=h;return l|0}k=Lb()|0;j=c[k>>2]|0;c[k>>2]=0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}b=Db(b|0,g|0,f|0,c[3016]|0)|0;l=K;f=c[k>>2]|0;if((f|0)==0){c[k>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=h;return l|0}do{if((f|0)==34){c[e>>2]=4;f=0;if((l|0)>(f|0)|(l|0)==(f|0)&b>>>0>0>>>0){l=2147483647;i=h;return l|0}}else{f=-1;if((l|0)<(f|0)|(l|0)==(f|0)&b>>>0<-2147483648>>>0){c[e>>2]=4;break}f=0;if((l|0)>(f|0)|(l|0)==(f|0)&b>>>0>2147483647>>>0){c[e>>2]=4;l=2147483647;i=h;return l|0}else{l=b;i=h;return l|0}}}while(0);l=-2147483648;i=h;return l|0}function Ul(a){a=a|0;var b=0,d=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;b=c[b>>2]|0;if((b&1|0)==0){d=b;nc[d&511](a);return}else{d=c[(c[d>>2]|0)+(b-1)>>2]|0;nc[d&511](a);return}}function Vl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b+8|0;e=b+4|0;g=c[e>>2]|0;k=c[f>>2]|0;i=g;if(!(k-i>>2>>>0<d>>>0)){do{if((g|0)==0){b=0}else{c[g>>2]=0;b=c[e>>2]|0}g=b+4|0;c[e>>2]=g;d=d-1|0}while((d|0)!=0);return}h=b+16|0;g=b|0;m=c[g>>2]|0;i=i-m>>2;l=i+d|0;if(l>>>0>1073741823>>>0){Pj(0)}k=k-m|0;if(k>>2>>>0<536870911>>>0){k=k>>1;l=k>>>0<l>>>0?l:k;if((l|0)!=0){k=b+128|0;if((a[k]|0)==0&l>>>0<29>>>0){a[k]=1;k=h}else{j=11}}else{k=0;l=0}}else{l=1073741823;j=11}if((j|0)==11){k=Nm(l<<2)|0}j=k+(i<<2)|0;do{if((j|0)==0){j=0}else{c[j>>2]=0}j=j+4|0;d=d-1|0}while((d|0)!=0);d=c[g>>2]|0;n=(c[e>>2]|0)-d|0;m=k+(i-(n>>2)<<2)|0;i=d;cn(m|0,i|0,n)|0;c[g>>2]=m;c[e>>2]=j;c[f>>2]=k+(l<<2);if((d|0)==0){return}if((h|0)==(d|0)){a[b+128|0]=0;return}else{Pm(i);return}}function Wl(a){a=a|0;Ee(11276);Ee(11264);Ee(11252);Ee(11240);Ee(11228);Ee(11216);Ee(11204);Ee(11192);Ee(11180);Ee(11168);Ee(11156);Ee(11144);Ee(11132);Ee(11120);Ee(11108);Ee(11096);Ee(11084);Ee(11072);Ee(11060);Ee(11048);Ee(11036);Ee(11024);Ee(11012);Ee(11e3);return}function Xl(a){a=a|0;te(12020);te(12008);te(11996);te(11984);te(11972);te(11960);te(11948);te(11936);te(11924);te(11912);te(11900);te(11888);te(11876);te(11864);te(11852);te(11840);te(11828);te(11816);te(11804);te(11792);te(11780);te(11768);te(11756);te(11744);return}function Yl(a){a=a|0;Ee(10820);Ee(10808);Ee(10796);Ee(10784);Ee(10772);Ee(10760);Ee(10748);Ee(10736);Ee(10724);Ee(10712);Ee(10700);Ee(10688);Ee(10676);Ee(10664);Ee(10652);Ee(10640);Ee(10628);Ee(10616);Ee(10604);Ee(10592);Ee(10580);Ee(10568);Ee(10556);Ee(10544);return}function Zl(a){a=a|0;te(11564);te(11552);te(11540);te(11528);te(11516);te(11504);te(11492);te(11480);te(11468);te(11456);te(11444);te(11432);te(11420);te(11408);te(11396);te(11384);te(11372);te(11360);te(11348);te(11336);te(11324);te(11312);te(11300);te(11288);return}function _l(a){a=a|0;Ee(10988);Ee(10976);Ee(10964);Ee(10952);Ee(10940);Ee(10928);Ee(10916);Ee(10904);Ee(10892);Ee(10880);Ee(10868);Ee(10856);Ee(10844);Ee(10832);return}function $l(a){a=a|0;te(11732);te(11720);te(11708);te(11696);te(11684);te(11672);te(11660);te(11648);te(11636);te(11624);te(11612);te(11600);te(11588);te(11576);return}function am(a,b,c){a=a|0;b=b|0;c=c|0;return bm(0,a,b,(c|0)!=0?c:10064)|0}function bm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;f=((f|0)==0?10056:f)|0;k=c[f>>2]|0;a:do{if((d|0)==0){if((k|0)==0){k=0;i=g;return k|0}}else{if((b|0)==0){j=h;c[h>>2]=j;h=j}else{h=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((k|0)==0){j=a[d]|0;b=j&255;if(j<<24>>24>-1){c[h>>2]=b;k=j<<24>>24!=0|0;i=g;return k|0}else{b=b-194|0;if(b>>>0>50>>>0){break a}d=d+1|0;k=c[1984+(b<<2)>>2]|0;j=e-1|0;break}}else{j=e}}while(0);b:do{if((j|0)!=0){b=a[d]|0;l=(b&255)>>>3;if((l-16|l+(k>>26))>>>0>7>>>0){break a}while(1){d=d+1|0;k=(b&255)-128|k<<6;j=j-1|0;if((k|0)>=0){break}if((j|0)==0){break b}b=a[d]|0;if(((b&255)-128|0)>>>0>63>>>0){break a}}c[f>>2]=0;c[h>>2]=k;l=e-j|0;i=g;return l|0}}while(0);c[f>>2]=k;l=-2;i=g;return l|0}}while(0);c[f>>2]=0;c[(Lb()|0)>>2]=84;l=-1;i=g;return l|0}function cm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+1032|0;h=j+1024|0;m=c[b>>2]|0;c[h>>2]=m;g=(a|0)!=0;k=j|0;e=g?e:256;l=g?a:k;a:do{if((m|0)==0|(e|0)==0){k=d;a=0}else{a=0;while(1){o=d>>>2;n=o>>>0>=e>>>0;if(!(n|d>>>0>131>>>0)){k=d;break a}m=n?e:o;d=d-m|0;m=dm(l,h,m,f)|0;if((m|0)==-1){break}if((l|0)==(k|0)){l=k}else{l=l+(m<<2)|0;e=e-m|0}a=m+a|0;m=c[h>>2]|0;if((m|0)==0|(e|0)==0){k=d;break a}}k=d;a=-1;e=0;m=c[h>>2]|0}}while(0);b:do{if((m|0)!=0?!((e|0)==0|(k|0)==0):0){while(1){d=bm(l,m,k,f)|0;if((d+2|0)>>>0<3>>>0){break}m=(c[h>>2]|0)+d|0;c[h>>2]=m;e=e-1|0;a=a+1|0;if((e|0)==0|(k|0)==(d|0)){break b}else{l=l+4|0;k=k-d|0}}if((d|0)==0){c[h>>2]=0;break}else if((d|0)==(-1|0)){a=-1;break}else{c[f>>2]=0;break}}}while(0);if(!g){i=j;return a|0}c[b>>2]=c[h>>2];i=j;return a|0}function dm(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;i=c[e>>2]|0;if((g|0)!=0?(h=g|0,j=c[h>>2]|0,(j|0)!=0):0){if((b|0)==0){g=f;h=16}else{c[h>>2]=0;g=f;h=36}}else{if((b|0)==0){g=f;h=7}else{g=f;h=6}}a:while(1){if((h|0)==6){if((g|0)==0){h=53;break}while(1){h=a[i]|0;do{if(((h&255)-1|0)>>>0<127>>>0?(i&3|0)==0&g>>>0>3>>>0:0){while(1){j=c[i>>2]|0;if(((j-16843009|j)&-2139062144|0)!=0){h=30;break}c[b>>2]=j&255;c[b+4>>2]=d[i+1|0]|0;c[b+8>>2]=d[i+2|0]|0;j=i+4|0;k=b+16|0;c[b+12>>2]=d[i+3|0]|0;g=g-4|0;if(g>>>0>3>>>0){b=k;i=j}else{h=31;break}}if((h|0)==30){j=j&255;break}else if((h|0)==31){i=j;b=k;j=a[j]|0;break}}else{j=h}}while(0);h=j&255;if(!((h-1|0)>>>0<127>>>0)){break}c[b>>2]=h;g=g-1|0;if((g|0)==0){h=53;break a}else{b=b+4|0;i=i+1|0}}h=h-194|0;if(h>>>0>50>>>0){h=47;break}j=c[1984+(h<<2)>>2]|0;i=i+1|0;h=36;continue}else if((h|0)==7){h=a[i]|0;if(((h&255)-1|0)>>>0<127>>>0?(i&3|0)==0:0){k=c[i>>2]|0;h=k&255;if(((k-16843009|k)&-2139062144|0)==0){do{i=i+4|0;g=g-4|0;h=c[i>>2]|0}while(((h-16843009|h)&-2139062144|0)==0);h=h&255}}h=h&255;if((h-1|0)>>>0<127>>>0){i=i+1|0;g=g-1|0;h=7;continue}h=h-194|0;if(h>>>0>50>>>0){h=47;break}j=c[1984+(h<<2)>>2]|0;i=i+1|0;h=16;continue}else if((h|0)==16){k=(d[i]|0)>>>3;if((k-16|k+(j>>26))>>>0>7>>>0){h=17;break}h=i+1|0;if((j&33554432|0)!=0){if(((d[h]|0)-128|0)>>>0>63>>>0){h=20;break}h=i+2|0;if((j&524288|0)==0){i=h}else{if(((d[h]|0)-128|0)>>>0>63>>>0){h=23;break}i=i+3|0}}else{i=h}g=g-1|0;h=7;continue}else if((h|0)==36){k=d[i]|0;h=k>>>3;if((h-16|h+(j>>26))>>>0>7>>>0){h=37;break}h=i+1|0;j=k-128|j<<6;if((j|0)<0){k=(d[h]|0)-128|0;if(k>>>0>63>>>0){h=40;break}h=i+2|0;j=k|j<<6;if((j|0)<0){h=(d[h]|0)-128|0;if(h>>>0>63>>>0){h=43;break}j=h|j<<6;i=i+3|0}else{i=h}}else{i=h}c[b>>2]=j;b=b+4|0;g=g-1|0;h=6;continue}}if((h|0)==17){i=i-1|0;h=46}else if((h|0)==20){i=i-1|0;h=46}else if((h|0)==23){i=i-1|0;h=46}else if((h|0)==37){i=i-1|0;h=46}else if((h|0)==40){i=i-1|0;h=46}else if((h|0)==43){i=i-1|0;h=46}else if((h|0)==53){return f|0}if((h|0)==46){if((j|0)==0){h=47}}if((h|0)==47){if((a[i]|0)==0){if((b|0)!=0){c[b>>2]=0;c[e>>2]=0}k=f-g|0;return k|0}}c[(Lb()|0)>>2]=84;if((b|0)==0){k=-1;return k|0}c[e>>2]=i;k=-1;return k|0}function em(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){j=h;c[h>>2]=j;h=j}else{h=b}b=a[e]|0;j=b&255;if(b<<24>>24>-1){c[h>>2]=j;j=b<<24>>24!=0|0;i=g;return j|0}j=j-194|0;if(!(j>>>0>50>>>0)){b=e+1|0;j=c[1984+(j<<2)>>2]|0;if(f>>>0<4>>>0?(j&-2147483648>>>(((f*6|0)-6|0)>>>0)|0)!=0:0){break}f=d[b]|0;b=f>>>3;if(!((b-16|b+(j>>26))>>>0>7>>>0)){f=f-128|j<<6;if((f|0)>=0){c[h>>2]=f;j=2;i=g;return j|0}b=(d[e+2|0]|0)-128|0;if(!(b>>>0>63>>>0)){f=b|f<<6;if((f|0)>=0){c[h>>2]=f;j=3;i=g;return j|0}e=(d[e+3|0]|0)-128|0;if(!(e>>>0>63>>>0)){c[h>>2]=e|f<<6;j=4;i=g;return j|0}}}}}}while(0);c[(Lb()|0)>>2]=84;j=-1;i=g;return j|0}function fm(b,d,e){b=b|0;d=d|0;e=e|0;if((b|0)==0){e=1;return e|0}if(d>>>0<128>>>0){a[b]=d;e=1;return e|0}if(d>>>0<2048>>>0){a[b]=d>>>6|192;a[b+1|0]=d&63|128;e=2;return e|0}if(d>>>0<55296>>>0|(d-57344|0)>>>0<8192>>>0){a[b]=d>>>12|224;a[b+1|0]=d>>>6&63|128;a[b+2|0]=d&63|128;e=3;return e|0}if((d-65536|0)>>>0<1048576>>>0){a[b]=d>>>18|240;a[b+1|0]=d>>>12&63|128;a[b+2|0]=d>>>6&63|128;a[b+3|0]=d&63|128;e=4;return e|0}else{c[(Lb()|0)>>2]=84;e=-1;return e|0}return 0}function gm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;h=i;i=i+264|0;g=h+256|0;j=h|0;l=c[b>>2]|0;c[g>>2]=l;f=(a|0)!=0;e=f?e:256;k=f?a:j;a:do{if((l|0)==0|(e|0)==0){j=d;a=0}else{a=0;while(1){m=d>>>0>=e>>>0;if(!(m|d>>>0>32>>>0)){j=d;break a}l=m?e:d;d=d-l|0;l=hm(k,g,l,0)|0;if((l|0)==-1){break}if((k|0)==(j|0)){k=j}else{k=k+l|0;e=e-l|0}a=l+a|0;l=c[g>>2]|0;if((l|0)==0|(e|0)==0){j=d;break a}}j=d;a=-1;e=0;l=c[g>>2]|0}}while(0);b:do{if((l|0)!=0?!((e|0)==0|(j|0)==0):0){while(1){d=fm(k,c[l>>2]|0,0)|0;if((d+1|0)>>>0<2>>>0){break}l=(c[g>>2]|0)+4|0;c[g>>2]=l;j=j-1|0;a=a+1|0;if((e|0)==(d|0)|(j|0)==0){break b}else{e=e-d|0;k=k+d|0}}if((d|0)==0){c[g>>2]=0}else{a=-1}}}while(0);if(!f){i=h;return a|0}c[b>>2]=c[g>>2];i=h;return a|0}function hm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;j=f|0;if((b|0)==0){l=c[d>>2]|0;k=j|0;m=c[l>>2]|0;if((m|0)==0){m=0;i=f;return m|0}else{h=0}while(1){if(m>>>0>127>>>0){m=fm(k,m,0)|0;if((m|0)==-1){h=-1;l=26;break}}else{m=1}h=m+h|0;l=l+4|0;m=c[l>>2]|0;if((m|0)==0){l=26;break}}if((l|0)==26){i=f;return h|0}}a:do{if(e>>>0>3>>>0){k=e;l=c[d>>2]|0;while(1){m=c[l>>2]|0;if((m|0)==0){break a}if(m>>>0>127>>>0){m=fm(b,m,0)|0;if((m|0)==-1){h=-1;break}b=b+m|0;k=k-m|0}else{a[b]=m;b=b+1|0;k=k-1|0;l=c[d>>2]|0}l=l+4|0;c[d>>2]=l;if(!(k>>>0>3>>>0)){break a}}i=f;return h|0}else{k=e}}while(0);b:do{if((k|0)!=0){j=j|0;l=c[d>>2]|0;while(1){m=c[l>>2]|0;if((m|0)==0){l=24;break}if(m>>>0>127>>>0){m=fm(j,m,0)|0;if((m|0)==-1){h=-1;l=26;break}if(m>>>0>k>>>0){l=20;break}fm(b,c[l>>2]|0,0)|0;b=b+m|0;k=k-m|0}else{a[b]=m;b=b+1|0;k=k-1|0;l=c[d>>2]|0}l=l+4|0;c[d>>2]=l;if((k|0)==0){g=0;break b}}if((l|0)==20){m=e-k|0;i=f;return m|0}else if((l|0)==24){a[b]=0;g=k;break}else if((l|0)==26){i=f;return h|0}}else{g=0}}while(0);c[d>>2]=0;m=e-g|0;i=f;return m|0}function im(a){a=a|0;var b=0;b=a;while(1){if((c[b>>2]|0)==0){break}else{b=b+4|0}}return b-a>>2|0}function jm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((d|0)==0){return a|0}else{e=a}while(1){d=d-1|0;c[e>>2]=c[b>>2];if((d|0)==0){break}else{b=b+4|0;e=e+4|0}}return a|0}function km(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e){return a|0}do{d=d-1|0;c[a+(d<<2)>>2]=c[b+(d<<2)>>2]}while((d|0)!=0);return a|0}else{if(e){return a|0}else{e=a}while(1){d=d-1|0;c[e>>2]=c[b>>2];if((d|0)==0){break}else{b=b+4|0;e=e+4|0}}return a|0}return 0}function lm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((d|0)==0){return a|0}else{e=a}while(1){d=d-1|0;c[e>>2]=b;if((d|0)==0){break}else{e=e+4|0}}return a|0}function mm(a){a=a|0;return}function nm(a){a=a|0;c[a>>2]=2536;return}function om(a){a=a|0;Pm(a);return}function pm(a){a=a|0;return}function qm(a){a=a|0;return 1288}function rm(a){a=a|0;mm(a|0);return}function sm(a){a=a|0;return}function tm(a){a=a|0;return}function um(a){a=a|0;mm(a|0);Pm(a);return}function vm(a){a=a|0;mm(a|0);Pm(a);return}function wm(a){a=a|0;mm(a|0);Pm(a);return}function xm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}g=Bm(b,9824,9808,0)|0;b=g;if((g|0)==0){g=0;i=e;return g|0}dn(f|0,0,56)|0;c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;Cc[c[(c[g>>2]|0)+28>>2]&15](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function ym(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function zm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;Cc[c[(c[g>>2]|0)+28>>2]&15](g,d,e,f);return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function Am(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(c[d+8>>2]|0)){h=d+16|0;g=c[h>>2]|0;if((g|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){k=d+36|0;c[k>>2]=(c[k>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)!=0){j=c[(c[e>>2]|0)+j>>2]|0}k=c[b+16>>2]|0;Cc[c[(c[k>>2]|0)+28>>2]&15](k,d,e+j|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}i=d+54|0;h=e;b=b+24|0;while(1){j=c[b+4>>2]|0;k=j>>8;if((j&1|0)!=0){k=c[(c[h>>2]|0)+k>>2]|0}l=c[b>>2]|0;Cc[c[(c[l>>2]|0)+28>>2]&15](l,d,e+k|0,(j&2|0)!=0?f:2);if((a[i]|0)!=0){f=16;break}b=b+8|0;if(!(b>>>0<g>>>0)){f=16;break}}if((f|0)==16){return}}function Bm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+56|0;h=f|0;k=c[a>>2]|0;g=a+(c[k-8>>2]|0)|0;k=c[k-4>>2]|0;j=k;c[h>>2]=d;c[h+4>>2]=a;c[h+8>>2]=b;c[h+12>>2]=e;n=h+16|0;b=h+20|0;a=h+24|0;l=h+28|0;e=h+32|0;m=h+40|0;dn(n|0,0,39)|0;do{if((k|0)==(d|0)){c[h+48>>2]=1;zc[c[(c[k>>2]|0)+20>>2]&31](j,h,g,g,1,0);d=(c[a>>2]|0)==1?g:0}else{lc[c[(c[k>>2]|0)+24>>2]&7](j,h,g,1,0);d=c[h+36>>2]|0;if((d|0)==0){if((c[m>>2]|0)!=1){d=0;break}if((c[l>>2]|0)!=1){d=0;break}d=(c[e>>2]|0)==1?c[b>>2]|0:0;break}else if((d|0)!=1){d=0;break}if((c[a>>2]|0)!=1){if((c[m>>2]|0)!=0){d=0;break}if((c[l>>2]|0)!=1){d=0;break}if((c[e>>2]|0)!=1){d=0;break}}d=c[n>>2]|0}}while(0);i=f;return d|0}function Cm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;l=b|0;if((l|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}e=d+28|0;if((c[e>>2]|0)==1){return}c[e>>2]=f;return}if((l|0)==(c[d>>2]|0)){if((c[d+16>>2]|0)!=(e|0)?(j=d+20|0,(c[j>>2]|0)!=(e|0)):0){c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}v=c[b+12>>2]|0;l=b+16+(v<<3)|0;a:do{if((v|0)>0){q=d+52|0;r=d+53|0;s=d+54|0;o=b+8|0;p=d+24|0;m=e;n=0;b=b+16|0;u=0;b:do{a[q]=0;a[r]=0;t=c[b+4>>2]|0;v=t>>8;if((t&1|0)!=0){v=c[(c[m>>2]|0)+v>>2]|0}w=c[b>>2]|0;zc[c[(c[w>>2]|0)+20>>2]&31](w,d,e,e+v|0,2-(t>>>1&1)|0,g);if((a[s]|0)!=0){break}do{if((a[r]|0)!=0){if((a[q]|0)==0){if((c[o>>2]&1|0)==0){u=1;break b}else{u=1;break}}if((c[p>>2]|0)==1){l=27;break a}if((c[o>>2]&2|0)==0){l=27;break a}else{u=1;n=1}}}while(0);b=b+8|0}while(b>>>0<l>>>0);if(n){h=u;l=26}else{k=u;l=23}}else{k=0;l=23}}while(0);if((l|0)==23){c[j>>2]=e;w=d+40|0;c[w>>2]=(c[w>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1;if(k){l=27}else{l=28}}else{h=k;l=26}}if((l|0)==26){if(h){l=27}else{l=28}}if((l|0)==27){c[i>>2]=3;return}else if((l|0)==28){c[i>>2]=4;return}}if((f|0)!=1){return}c[d+32>>2]=1;return}k=c[b+12>>2]|0;h=b+16+(k<<3)|0;j=c[b+20>>2]|0;l=j>>8;if((j&1|0)!=0){l=c[(c[e>>2]|0)+l>>2]|0}w=c[b+16>>2]|0;lc[c[(c[w>>2]|0)+24>>2]&7](w,d,e+l|0,(j&2|0)!=0?f:2,g);j=b+24|0;if((k|0)<=1){return}k=c[b+8>>2]|0;if((k&2|0)==0?(i=d+36|0,(c[i>>2]|0)!=1):0){if((k&1|0)==0){k=d+54|0;l=e;b=j;while(1){if((a[k]|0)!=0){l=53;break}if((c[i>>2]|0)==1){l=53;break}m=c[b+4>>2]|0;n=m>>8;if((m&1|0)!=0){n=c[(c[l>>2]|0)+n>>2]|0}w=c[b>>2]|0;lc[c[(c[w>>2]|0)+24>>2]&7](w,d,e+n|0,(m&2|0)!=0?f:2,g);b=b+8|0;if(!(b>>>0<h>>>0)){l=53;break}}if((l|0)==53){return}}l=d+24|0;b=d+54|0;k=e;m=j;while(1){if((a[b]|0)!=0){l=53;break}if((c[i>>2]|0)==1?(c[l>>2]|0)==1:0){l=53;break}n=c[m+4>>2]|0;o=n>>8;if((n&1|0)!=0){o=c[(c[k>>2]|0)+o>>2]|0}w=c[m>>2]|0;lc[c[(c[w>>2]|0)+24>>2]&7](w,d,e+o|0,(n&2|0)!=0?f:2,g);m=m+8|0;if(!(m>>>0<h>>>0)){l=53;break}}if((l|0)==53){return}}i=d+54|0;k=e;while(1){if((a[i]|0)!=0){l=53;break}l=c[j+4>>2]|0;b=l>>8;if((l&1|0)!=0){b=c[(c[k>>2]|0)+b>>2]|0}w=c[j>>2]|0;lc[c[(c[w>>2]|0)+24>>2]&7](w,d,e+b|0,(l&2|0)!=0?f:2,g);j=j+8|0;if(!(j>>>0<h>>>0)){l=53;break}}if((l|0)==53){return}}function Dm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;j=b|0;if((j|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}h=d+28|0;if((c[h>>2]|0)==1){return}c[h>>2]=f;return}if((j|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;lc[c[(c[j>>2]|0)+24>>2]&7](j,d,e,f,g);return}if((c[d+16>>2]|0)!=(e|0)?(i=d+20|0,(c[i>>2]|0)!=(e|0)):0){c[d+32>>2]=f;f=d+44|0;if((c[f>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;b=c[b+8>>2]|0;zc[c[(c[b>>2]|0)+20>>2]&31](b,d,e,e,1,g);if((a[k]|0)!=0){if((a[j]|0)==0){b=1;h=13}}else{b=0;h=13}do{if((h|0)==13){c[i>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1;if(b){break}}else{h=16}if((h|0)==16?b:0){break}c[f>>2]=4;return}}while(0);c[f>>2]=3;return}if((f|0)!=1){return}c[d+32>>2]=1;return}function Em(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}d=d+28|0;if((c[d>>2]|0)==1){return}c[d>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}if((c[d+16>>2]|0)!=(e|0)?(h=d+20|0,(c[h>>2]|0)!=(e|0)):0){c[d+32>>2]=f;c[h>>2]=e;g=d+40|0;c[g>>2]=(c[g>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1}c[d+44>>2]=4;return}if((f|0)!=1){return}c[d+32>>2]=1;return}function Fm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;if((b|0)!=(c[d+8>>2]|0)){k=d+52|0;j=a[k]|0;m=d+53|0;l=a[m]|0;o=c[b+12>>2]|0;i=b+16+(o<<3)|0;a[k]=0;a[m]=0;n=c[b+20>>2]|0;p=n>>8;if((n&1|0)!=0){p=c[(c[f>>2]|0)+p>>2]|0}s=c[b+16>>2]|0;zc[c[(c[s>>2]|0)+20>>2]&31](s,d,e,f+p|0,(n&2|0)!=0?g:2,h);a:do{if((o|0)>1){p=d+24|0;o=b+8|0;q=d+54|0;n=f;b=b+24|0;do{if((a[q]|0)!=0){break a}if((a[k]|0)==0){if((a[m]|0)!=0?(c[o>>2]&1|0)==0:0){break a}}else{if((c[p>>2]|0)==1){break a}if((c[o>>2]&2|0)==0){break a}}a[k]=0;a[m]=0;r=c[b+4>>2]|0;s=r>>8;if((r&1|0)!=0){s=c[(c[n>>2]|0)+s>>2]|0}t=c[b>>2]|0;zc[c[(c[t>>2]|0)+20>>2]&31](t,d,e,f+s|0,(r&2|0)!=0?g:2,h);b=b+8|0}while(b>>>0<i>>>0)}}while(0);a[k]=j;a[m]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;i=d+16|0;j=c[i>>2]|0;if((j|0)==0){c[i>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((j|0)!=(e|0)){t=d+36|0;c[t>>2]=(c[t>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;i=c[e>>2]|0;if((i|0)==2){c[e>>2]=g}else{g=i}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}function Gm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;if((b|0)!=(c[d+8>>2]|0)){b=c[b+8>>2]|0;zc[c[(c[b>>2]|0)+20>>2]&31](b,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;b=d+16|0;f=c[b>>2]|0;if((f|0)==0){c[b>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((f|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g}else{g=b}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}function Hm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;f=c[e>>2]|0;if((f|0)==2){c[e>>2]=g}else{g=f}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}function Im(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){a=16}else{a=a+11&-8}n=a>>>3;m=c[2518]|0;o=m>>>(n>>>0);if((o&3|0)!=0){a=(o&1^1)+n|0;b=a<<1;e=10112+(b<<2)|0;b=10112+(b+2<<2)|0;g=c[b>>2]|0;f=g+8|0;d=c[f>>2]|0;do{if((e|0)!=(d|0)){if(d>>>0<(c[2522]|0)>>>0){Xb();return 0}h=d+12|0;if((c[h>>2]|0)==(g|0)){c[h>>2]=e;c[b>>2]=d;break}else{Xb();return 0}}else{c[2518]=m&~(1<<a)}}while(0);u=a<<3;c[g+4>>2]=u|3;u=g+(u|4)|0;c[u>>2]=c[u>>2]|1;u=f;return u|0}if(a>>>0>(c[2520]|0)>>>0){if((o|0)!=0){f=2<<n;f=o<<n&(f|-f);f=(f&-f)-1|0;b=f>>>12&16;f=f>>>(b>>>0);d=f>>>5&8;f=f>>>(d>>>0);e=f>>>2&4;f=f>>>(e>>>0);h=f>>>1&2;f=f>>>(h>>>0);g=f>>>1&1;g=(d|b|e|h|g)+(f>>>(g>>>0))|0;f=g<<1;h=10112+(f<<2)|0;f=10112+(f+2<<2)|0;e=c[f>>2]|0;b=e+8|0;d=c[b>>2]|0;do{if((h|0)!=(d|0)){if(d>>>0<(c[2522]|0)>>>0){Xb();return 0}i=d+12|0;if((c[i>>2]|0)==(e|0)){c[i>>2]=h;c[f>>2]=d;break}else{Xb();return 0}}else{c[2518]=m&~(1<<g)}}while(0);f=g<<3;d=f-a|0;c[e+4>>2]=a|3;u=e;e=u+a|0;c[u+(a|4)>>2]=d|1;c[u+f>>2]=d;f=c[2520]|0;if((f|0)!=0){a=c[2523]|0;i=f>>>3;h=i<<1;f=10112+(h<<2)|0;g=c[2518]|0;i=1<<i;if((g&i|0)!=0){h=10112+(h+2<<2)|0;g=c[h>>2]|0;if(g>>>0<(c[2522]|0)>>>0){Xb();return 0}}else{c[2518]=g|i;g=f;h=10112+(h+2<<2)|0}c[h>>2]=a;c[g+12>>2]=a;c[a+8>>2]=g;c[a+12>>2]=f}c[2520]=d;c[2523]=e;u=b;return u|0}m=c[2519]|0;if((m|0)!=0){e=(m&-m)-1|0;t=e>>>12&16;e=e>>>(t>>>0);s=e>>>5&8;e=e>>>(s>>>0);u=e>>>2&4;e=e>>>(u>>>0);d=e>>>1&2;e=e>>>(d>>>0);b=e>>>1&1;b=c[10376+((s|t|u|d|b)+(e>>>(b>>>0))<<2)>>2]|0;e=b;d=b;b=(c[b+4>>2]&-8)-a|0;while(1){h=c[e+16>>2]|0;if((h|0)==0){h=c[e+20>>2]|0;if((h|0)==0){break}}g=(c[h+4>>2]&-8)-a|0;f=g>>>0<b>>>0;e=h;d=f?h:d;b=f?g:b}f=d;h=c[2522]|0;if(f>>>0<h>>>0){Xb();return 0}u=f+a|0;e=u;if(!(f>>>0<u>>>0)){Xb();return 0}g=c[d+24>>2]|0;i=c[d+12>>2]|0;do{if((i|0)==(d|0)){j=d+20|0;i=c[j>>2]|0;if((i|0)==0){j=d+16|0;i=c[j>>2]|0;if((i|0)==0){i=0;break}}while(1){l=i+20|0;k=c[l>>2]|0;if((k|0)!=0){i=k;j=l;continue}l=i+16|0;k=c[l>>2]|0;if((k|0)==0){break}else{i=k;j=l}}if(j>>>0<h>>>0){Xb();return 0}else{c[j>>2]=0;break}}else{j=c[d+8>>2]|0;if(j>>>0<h>>>0){Xb();return 0}k=j+12|0;if((c[k>>2]|0)!=(d|0)){Xb();return 0}h=i+8|0;if((c[h>>2]|0)==(d|0)){c[k>>2]=i;c[h>>2]=j;break}else{Xb();return 0}}}while(0);do{if((g|0)!=0){h=c[d+28>>2]|0;j=10376+(h<<2)|0;if((d|0)==(c[j>>2]|0)){c[j>>2]=i;if((i|0)==0){c[2519]=c[2519]&~(1<<h);break}}else{if(g>>>0<(c[2522]|0)>>>0){Xb();return 0}h=g+16|0;if((c[h>>2]|0)==(d|0)){c[h>>2]=i}else{c[g+20>>2]=i}if((i|0)==0){break}}if(i>>>0<(c[2522]|0)>>>0){Xb();return 0}c[i+24>>2]=g;g=c[d+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[i+16>>2]=g;c[g+24>>2]=i;break}}}while(0);g=c[d+20>>2]|0;if((g|0)!=0){if(g>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[i+20>>2]=g;c[g+24>>2]=i;break}}}}while(0);if(b>>>0<16>>>0){u=b+a|0;c[d+4>>2]=u|3;u=f+(u+4)|0;c[u>>2]=c[u>>2]|1}else{c[d+4>>2]=a|3;c[f+(a|4)>>2]=b|1;c[f+(b+a)>>2]=b;f=c[2520]|0;if((f|0)!=0){a=c[2523]|0;i=f>>>3;g=i<<1;f=10112+(g<<2)|0;h=c[2518]|0;i=1<<i;if((h&i|0)!=0){g=10112+(g+2<<2)|0;h=c[g>>2]|0;if(h>>>0<(c[2522]|0)>>>0){Xb();return 0}}else{c[2518]=h|i;h=f;g=10112+(g+2<<2)|0}c[g>>2]=a;c[h+12>>2]=a;c[a+8>>2]=h;c[a+12>>2]=f}c[2520]=b;c[2523]=e}u=d+8|0;return u|0}}}else{if(!(a>>>0>4294967231>>>0)){m=a+11|0;a=m&-8;o=c[2519]|0;if((o|0)!=0){n=-a|0;m=m>>>8;if((m|0)!=0){if(a>>>0>16777215>>>0){p=31}else{t=(m+1048320|0)>>>16&8;u=m<<t;s=(u+520192|0)>>>16&4;u=u<<s;p=(u+245760|0)>>>16&2;p=14-(s|t|p)+(u<<p>>>15)|0;p=a>>>((p+7|0)>>>0)&1|p<<1}}else{p=0}q=c[10376+(p<<2)>>2]|0;a:do{if((q|0)==0){m=0;s=0}else{if((p|0)==31){r=0}else{r=25-(p>>>1)|0}m=0;r=a<<r;s=0;while(1){u=c[q+4>>2]&-8;t=u-a|0;if(t>>>0<n>>>0){if((u|0)==(a|0)){m=q;n=t;s=q;break a}else{m=q;n=t}}t=c[q+20>>2]|0;q=c[q+16+(r>>>31<<2)>>2]|0;s=(t|0)==0|(t|0)==(q|0)?s:t;if((q|0)==0){break}else{r=r<<1}}}}while(0);if((s|0)==0&(m|0)==0){u=2<<p;o=o&(u|-u);if((o|0)==0){break}u=(o&-o)-1|0;q=u>>>12&16;u=u>>>(q>>>0);p=u>>>5&8;u=u>>>(p>>>0);r=u>>>2&4;u=u>>>(r>>>0);t=u>>>1&2;u=u>>>(t>>>0);s=u>>>1&1;s=c[10376+((p|q|r|t|s)+(u>>>(s>>>0))<<2)>>2]|0}if((s|0)!=0){while(1){p=(c[s+4>>2]&-8)-a|0;o=p>>>0<n>>>0;n=o?p:n;m=o?s:m;o=c[s+16>>2]|0;if((o|0)!=0){s=o;continue}s=c[s+20>>2]|0;if((s|0)==0){break}}}if((m|0)!=0?n>>>0<((c[2520]|0)-a|0)>>>0:0){b=m;g=c[2522]|0;if(b>>>0<g>>>0){Xb();return 0}e=b+a|0;d=e;if(!(b>>>0<e>>>0)){Xb();return 0}f=c[m+24>>2]|0;h=c[m+12>>2]|0;do{if((h|0)==(m|0)){i=m+20|0;h=c[i>>2]|0;if((h|0)==0){i=m+16|0;h=c[i>>2]|0;if((h|0)==0){h=0;break}}while(1){k=h+20|0;j=c[k>>2]|0;if((j|0)!=0){h=j;i=k;continue}k=h+16|0;j=c[k>>2]|0;if((j|0)==0){break}else{h=j;i=k}}if(i>>>0<g>>>0){Xb();return 0}else{c[i>>2]=0;break}}else{i=c[m+8>>2]|0;if(i>>>0<g>>>0){Xb();return 0}j=i+12|0;if((c[j>>2]|0)!=(m|0)){Xb();return 0}g=h+8|0;if((c[g>>2]|0)==(m|0)){c[j>>2]=h;c[g>>2]=i;break}else{Xb();return 0}}}while(0);do{if((f|0)!=0){g=c[m+28>>2]|0;i=10376+(g<<2)|0;if((m|0)==(c[i>>2]|0)){c[i>>2]=h;if((h|0)==0){c[2519]=c[2519]&~(1<<g);break}}else{if(f>>>0<(c[2522]|0)>>>0){Xb();return 0}g=f+16|0;if((c[g>>2]|0)==(m|0)){c[g>>2]=h}else{c[f+20>>2]=h}if((h|0)==0){break}}if(h>>>0<(c[2522]|0)>>>0){Xb();return 0}c[h+24>>2]=f;f=c[m+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[h+16>>2]=f;c[f+24>>2]=h;break}}}while(0);f=c[m+20>>2]|0;if((f|0)!=0){if(f>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[h+20>>2]=f;c[f+24>>2]=h;break}}}}while(0);b:do{if(!(n>>>0<16>>>0)){c[m+4>>2]=a|3;c[b+(a|4)>>2]=n|1;c[b+(n+a)>>2]=n;g=n>>>3;if(n>>>0<256>>>0){f=g<<1;e=10112+(f<<2)|0;h=c[2518]|0;g=1<<g;if((h&g|0)!=0){f=10112+(f+2<<2)|0;g=c[f>>2]|0;if(g>>>0<(c[2522]|0)>>>0){Xb();return 0}}else{c[2518]=h|g;g=e;f=10112+(f+2<<2)|0}c[f>>2]=d;c[g+12>>2]=d;c[b+(a+8)>>2]=g;c[b+(a+12)>>2]=e;break}d=n>>>8;if((d|0)!=0){if(n>>>0>16777215>>>0){f=31}else{t=(d+1048320|0)>>>16&8;u=d<<t;s=(u+520192|0)>>>16&4;u=u<<s;f=(u+245760|0)>>>16&2;f=14-(s|t|f)+(u<<f>>>15)|0;f=n>>>((f+7|0)>>>0)&1|f<<1}}else{f=0}d=10376+(f<<2)|0;c[b+(a+28)>>2]=f;c[b+(a+20)>>2]=0;c[b+(a+16)>>2]=0;h=c[2519]|0;g=1<<f;if((h&g|0)==0){c[2519]=h|g;c[d>>2]=e;c[b+(a+24)>>2]=d;c[b+(a+12)>>2]=e;c[b+(a+8)>>2]=e;break}d=c[d>>2]|0;if((f|0)==31){f=0}else{f=25-(f>>>1)|0}c:do{if((c[d+4>>2]&-8|0)!=(n|0)){f=n<<f;while(1){g=d+16+(f>>>31<<2)|0;h=c[g>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(n|0)){d=h;break c}else{d=h;f=f<<1}}if(g>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[g>>2]=e;c[b+(a+24)>>2]=d;c[b+(a+12)>>2]=e;c[b+(a+8)>>2]=e;break b}}}while(0);g=d+8|0;h=c[g>>2]|0;f=c[2522]|0;if(d>>>0<f>>>0){Xb();return 0}if(h>>>0<f>>>0){Xb();return 0}else{c[h+12>>2]=e;c[g>>2]=e;c[b+(a+8)>>2]=h;c[b+(a+12)>>2]=d;c[b+(a+24)>>2]=0;break}}else{u=n+a|0;c[m+4>>2]=u|3;u=b+(u+4)|0;c[u>>2]=c[u>>2]|1}}while(0);u=m+8|0;return u|0}}}else{a=-1}}}while(0);m=c[2520]|0;if(!(a>>>0>m>>>0)){d=m-a|0;b=c[2523]|0;if(d>>>0>15>>>0){u=b;c[2523]=u+a;c[2520]=d;c[u+(a+4)>>2]=d|1;c[u+m>>2]=d;c[b+4>>2]=a|3}else{c[2520]=0;c[2523]=0;c[b+4>>2]=m|3;u=b+(m+4)|0;c[u>>2]=c[u>>2]|1}u=b+8|0;return u|0}m=c[2521]|0;if(a>>>0<m>>>0){s=m-a|0;c[2521]=s;u=c[2524]|0;t=u;c[2524]=t+a;c[t+(a+4)>>2]=s|1;c[u+4>>2]=a|3;u=u+8|0;return u|0}do{if((c[2508]|0)==0){m=Ub(30)|0;if((m-1&m|0)==0){c[2510]=m;c[2509]=m;c[2511]=-1;c[2512]=-1;c[2513]=0;c[2629]=0;c[2508]=(jc(0)|0)&-16^1431655768;break}else{Xb();return 0}}}while(0);o=a+48|0;q=c[2510]|0;n=a+47|0;p=q+n|0;q=-q|0;m=p&q;if(!(m>>>0>a>>>0)){u=0;return u|0}r=c[2628]|0;if((r|0)!=0?(t=c[2626]|0,u=t+m|0,u>>>0<=t>>>0|u>>>0>r>>>0):0){u=0;return u|0}d:do{if((c[2629]&4|0)==0){r=c[2524]|0;e:do{if((r|0)!=0){u=10520;while(1){s=u|0;t=c[s>>2]|0;if(!(t>>>0>r>>>0)?(f=u+4|0,(t+(c[f>>2]|0)|0)>>>0>r>>>0):0){break}u=c[u+8>>2]|0;if((u|0)==0){g=182;break e}}if((u|0)!=0){p=p-(c[2521]|0)&q;if(p>>>0<2147483647>>>0){r=Kb(p|0)|0;g=(r|0)==((c[s>>2]|0)+(c[f>>2]|0)|0);f=g?r:-1;q=g?p:0;g=191}else{q=0}}else{g=182}}else{g=182}}while(0);do{if((g|0)==182){f=Kb(0)|0;if(!((f|0)==-1)){q=f;r=c[2509]|0;p=r-1|0;if((p&q|0)==0){p=m}else{p=m-q+(p+q&-r)|0}r=c[2626]|0;q=r+p|0;if(p>>>0>a>>>0&p>>>0<2147483647>>>0){s=c[2628]|0;if((s|0)!=0?q>>>0<=r>>>0|q>>>0>s>>>0:0){q=0;break}r=Kb(p|0)|0;g=(r|0)==(f|0);f=g?f:-1;q=g?p:0;g=191}else{q=0}}else{q=0}}}while(0);f:do{if((g|0)==191){g=-p|0;if(!((f|0)==-1)){i=q;g=202;break d}do{if((r|0)!=-1&p>>>0<2147483647>>>0&p>>>0<o>>>0?(l=c[2510]|0,l=n-p+l&-l,l>>>0<2147483647>>>0):0){if((Kb(l|0)|0)==-1){Kb(g|0)|0;break f}else{p=l+p|0;break}}}while(0);if(!((r|0)==-1)){i=p;f=r;g=202;break d}}}while(0);c[2629]=c[2629]|4;g=199}else{q=0;g=199}}while(0);if((((g|0)==199?m>>>0<2147483647>>>0:0)?(h=Kb(m|0)|0,k=Kb(0)|0,(k|0)!=-1&(h|0)!=-1&h>>>0<k>>>0):0)?(i=k-h|0,j=i>>>0>(a+40|0)>>>0,j):0){i=j?i:q;f=h;g=202}if((g|0)==202){h=(c[2626]|0)+i|0;c[2626]=h;if(h>>>0>(c[2627]|0)>>>0){c[2627]=h}h=c[2524]|0;g:do{if((h|0)!=0){j=10520;while(1){l=c[j>>2]|0;k=j+4|0;n=c[k>>2]|0;if((f|0)==(l+n|0)){g=214;break}m=c[j+8>>2]|0;if((m|0)==0){break}else{j=m}}if(((g|0)==214?(c[j+12>>2]&8|0)==0:0)?(e=h,e>>>0>=l>>>0&e>>>0<f>>>0):0){c[k>>2]=n+i;b=(c[2521]|0)+i|0;d=h+8|0;if((d&7|0)==0){d=0}else{d=-d&7}u=b-d|0;c[2524]=e+d;c[2521]=u;c[e+(d+4)>>2]=u|1;c[e+(b+4)>>2]=40;c[2525]=c[2512];break}if(f>>>0<(c[2522]|0)>>>0){c[2522]=f}j=f+i|0;e=10520;while(1){k=e|0;if((c[k>>2]|0)==(j|0)){g=224;break}l=c[e+8>>2]|0;if((l|0)==0){break}else{e=l}}if((g|0)==224?(c[e+12>>2]&8|0)==0:0){c[k>>2]=f;b=e+4|0;c[b>>2]=(c[b>>2]|0)+i;b=f+8|0;if((b&7|0)==0){b=0}else{b=-b&7}d=f+(i+8)|0;if((d&7|0)==0){j=0}else{j=-d&7}m=f+(j+i)|0;l=m;d=b+a|0;g=f+d|0;e=g;h=m-(f+b)-a|0;c[f+(b+4)>>2]=a|3;h:do{if((l|0)!=(c[2524]|0)){if((l|0)==(c[2523]|0)){u=(c[2520]|0)+h|0;c[2520]=u;c[2523]=e;c[f+(d+4)>>2]=u|1;c[f+(u+d)>>2]=u;break}k=i+4|0;o=c[f+(k+j)>>2]|0;if((o&3|0)==1){a=o&-8;n=o>>>3;do{if(!(o>>>0<256>>>0)){l=c[f+((j|24)+i)>>2]|0;n=c[f+(i+12+j)>>2]|0;do{if((n|0)==(m|0)){p=j|16;o=f+(k+p)|0;n=c[o>>2]|0;if((n|0)==0){o=f+(p+i)|0;n=c[o>>2]|0;if((n|0)==0){n=0;break}}while(1){p=n+20|0;q=c[p>>2]|0;if((q|0)!=0){n=q;o=p;continue}p=n+16|0;q=c[p>>2]|0;if((q|0)==0){break}else{n=q;o=p}}if(o>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[o>>2]=0;break}}else{o=c[f+((j|8)+i)>>2]|0;if(o>>>0<(c[2522]|0)>>>0){Xb();return 0}p=o+12|0;if((c[p>>2]|0)!=(m|0)){Xb();return 0}q=n+8|0;if((c[q>>2]|0)==(m|0)){c[p>>2]=n;c[q>>2]=o;break}else{Xb();return 0}}}while(0);if((l|0)!=0){o=c[f+(i+28+j)>>2]|0;p=10376+(o<<2)|0;if((m|0)==(c[p>>2]|0)){c[p>>2]=n;if((n|0)==0){c[2519]=c[2519]&~(1<<o);break}}else{if(l>>>0<(c[2522]|0)>>>0){Xb();return 0}o=l+16|0;if((c[o>>2]|0)==(m|0)){c[o>>2]=n}else{c[l+20>>2]=n}if((n|0)==0){break}}if(n>>>0<(c[2522]|0)>>>0){Xb();return 0}c[n+24>>2]=l;m=j|16;l=c[f+(m+i)>>2]|0;do{if((l|0)!=0){if(l>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[n+16>>2]=l;c[l+24>>2]=n;break}}}while(0);k=c[f+(k+m)>>2]|0;if((k|0)!=0){if(k>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[n+20>>2]=k;c[k+24>>2]=n;break}}}}else{k=c[f+((j|8)+i)>>2]|0;m=c[f+(i+12+j)>>2]|0;o=10112+(n<<1<<2)|0;if((k|0)!=(o|0)){if(k>>>0<(c[2522]|0)>>>0){Xb();return 0}if((c[k+12>>2]|0)!=(l|0)){Xb();return 0}}if((m|0)==(k|0)){c[2518]=c[2518]&~(1<<n);break}if((m|0)!=(o|0)){if(m>>>0<(c[2522]|0)>>>0){Xb();return 0}n=m+8|0;if((c[n>>2]|0)!=(l|0)){Xb();return 0}}else{n=m+8|0}c[k+12>>2]=m;c[n>>2]=k}}while(0);l=f+((a|j)+i)|0;h=a+h|0}i=l+4|0;c[i>>2]=c[i>>2]&-2;c[f+(d+4)>>2]=h|1;c[f+(h+d)>>2]=h;i=h>>>3;if(h>>>0<256>>>0){g=i<<1;a=10112+(g<<2)|0;h=c[2518]|0;i=1<<i;if((h&i|0)!=0){g=10112+(g+2<<2)|0;h=c[g>>2]|0;if(h>>>0<(c[2522]|0)>>>0){Xb();return 0}}else{c[2518]=h|i;h=a;g=10112+(g+2<<2)|0}c[g>>2]=e;c[h+12>>2]=e;c[f+(d+8)>>2]=h;c[f+(d+12)>>2]=a;break}a=h>>>8;if((a|0)!=0){if(h>>>0>16777215>>>0){a=31}else{t=(a+1048320|0)>>>16&8;u=a<<t;s=(u+520192|0)>>>16&4;u=u<<s;a=(u+245760|0)>>>16&2;a=14-(s|t|a)+(u<<a>>>15)|0;a=h>>>((a+7|0)>>>0)&1|a<<1}}else{a=0}j=10376+(a<<2)|0;c[f+(d+28)>>2]=a;c[f+(d+20)>>2]=0;c[f+(d+16)>>2]=0;e=c[2519]|0;i=1<<a;if((e&i|0)==0){c[2519]=e|i;c[j>>2]=g;c[f+(d+24)>>2]=j;c[f+(d+12)>>2]=g;c[f+(d+8)>>2]=g;break}e=c[j>>2]|0;if((a|0)==31){i=0}else{i=25-(a>>>1)|0}i:do{if((c[e+4>>2]&-8|0)!=(h|0)){a=e;j=h<<i;while(1){i=a+16+(j>>>31<<2)|0;e=c[i>>2]|0;if((e|0)==0){break}if((c[e+4>>2]&-8|0)==(h|0)){break i}else{a=e;j=j<<1}}if(i>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[i>>2]=g;c[f+(d+24)>>2]=a;c[f+(d+12)>>2]=g;c[f+(d+8)>>2]=g;break h}}}while(0);h=e+8|0;a=c[h>>2]|0;i=c[2522]|0;if(e>>>0<i>>>0){Xb();return 0}if(a>>>0<i>>>0){Xb();return 0}else{c[a+12>>2]=g;c[h>>2]=g;c[f+(d+8)>>2]=a;c[f+(d+12)>>2]=e;c[f+(d+24)>>2]=0;break}}else{u=(c[2521]|0)+h|0;c[2521]=u;c[2524]=e;c[f+(d+4)>>2]=u|1}}while(0);u=f+(b|8)|0;return u|0}e=h;j=10520;while(1){g=c[j>>2]|0;if(!(g>>>0>e>>>0)?(d=c[j+4>>2]|0,b=g+d|0,b>>>0>e>>>0):0){break}j=c[j+8>>2]|0}j=g+(d-39)|0;if((j&7|0)==0){j=0}else{j=-j&7}d=g+(d-47+j)|0;d=d>>>0<(h+16|0)>>>0?e:d;g=d+8|0;j=f+8|0;if((j&7|0)==0){j=0}else{j=-j&7}u=i-40-j|0;c[2524]=f+j;c[2521]=u;c[f+(j+4)>>2]=u|1;c[f+(i-36)>>2]=40;c[2525]=c[2512];c[d+4>>2]=27;c[g>>2]=c[2630];c[g+4>>2]=c[2631];c[g+8>>2]=c[2632];c[g+12>>2]=c[2633];c[2630]=f;c[2631]=i;c[2633]=0;c[2632]=g;f=d+28|0;c[f>>2]=7;if((d+32|0)>>>0<b>>>0){while(1){g=f+4|0;c[g>>2]=7;if((f+8|0)>>>0<b>>>0){f=g}else{break}}}if((d|0)!=(e|0)){d=d-h|0;u=e+(d+4)|0;c[u>>2]=c[u>>2]&-2;c[h+4>>2]=d|1;c[e+d>>2]=d;e=d>>>3;if(d>>>0<256>>>0){d=e<<1;b=10112+(d<<2)|0;f=c[2518]|0;e=1<<e;if((f&e|0)!=0){d=10112+(d+2<<2)|0;e=c[d>>2]|0;if(e>>>0<(c[2522]|0)>>>0){Xb();return 0}}else{c[2518]=f|e;e=b;d=10112+(d+2<<2)|0}c[d>>2]=h;c[e+12>>2]=h;c[h+8>>2]=e;c[h+12>>2]=b;break}b=h;e=d>>>8;if((e|0)!=0){if(d>>>0>16777215>>>0){e=31}else{t=(e+1048320|0)>>>16&8;u=e<<t;s=(u+520192|0)>>>16&4;u=u<<s;e=(u+245760|0)>>>16&2;e=14-(s|t|e)+(u<<e>>>15)|0;e=d>>>((e+7|0)>>>0)&1|e<<1}}else{e=0}i=10376+(e<<2)|0;c[h+28>>2]=e;c[h+20>>2]=0;c[h+16>>2]=0;f=c[2519]|0;g=1<<e;if((f&g|0)==0){c[2519]=f|g;c[i>>2]=b;c[h+24>>2]=i;c[h+12>>2]=h;c[h+8>>2]=h;break}i=c[i>>2]|0;if((e|0)==31){f=0}else{f=25-(e>>>1)|0}j:do{if((c[i+4>>2]&-8|0)!=(d|0)){e=i;f=d<<f;while(1){g=e+16+(f>>>31<<2)|0;i=c[g>>2]|0;if((i|0)==0){break}if((c[i+4>>2]&-8|0)==(d|0)){break j}else{e=i;f=f<<1}}if(g>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[g>>2]=b;c[h+24>>2]=e;c[h+12>>2]=h;c[h+8>>2]=h;break g}}}while(0);e=i+8|0;d=c[e>>2]|0;f=c[2522]|0;if(i>>>0<f>>>0){Xb();return 0}if(d>>>0<f>>>0){Xb();return 0}else{c[d+12>>2]=b;c[e>>2]=b;c[h+8>>2]=d;c[h+12>>2]=i;c[h+24>>2]=0;break}}}else{u=c[2522]|0;if((u|0)==0|f>>>0<u>>>0){c[2522]=f}c[2630]=f;c[2631]=i;c[2633]=0;c[2527]=c[2508];c[2526]=-1;b=0;do{u=b<<1;t=10112+(u<<2)|0;c[10112+(u+3<<2)>>2]=t;c[10112+(u+2<<2)>>2]=t;b=b+1|0}while(b>>>0<32>>>0);b=f+8|0;if((b&7|0)==0){b=0}else{b=-b&7}u=i-40-b|0;c[2524]=f+b;c[2521]=u;c[f+(b+4)>>2]=u|1;c[f+(i-36)>>2]=40;c[2525]=c[2512]}}while(0);b=c[2521]|0;if(b>>>0>a>>>0){s=b-a|0;c[2521]=s;u=c[2524]|0;t=u;c[2524]=t+a;c[t+(a+4)>>2]=s|1;c[u+4>>2]=a|3;u=u+8|0;return u|0}}c[(Lb()|0)>>2]=12;u=0;return u|0}function Jm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((a|0)==0){return}n=a-8|0;p=n;q=c[2522]|0;if(n>>>0<q>>>0){Xb()}r=c[a-4>>2]|0;m=r&3;if((m|0)==1){Xb()}g=r&-8;k=a+(g-8)|0;j=k;do{if((r&1|0)==0){u=c[n>>2]|0;if((m|0)==0){return}p=-8-u|0;r=a+p|0;n=r;m=u+g|0;if(r>>>0<q>>>0){Xb()}if((n|0)==(c[2523]|0)){b=a+(g-4)|0;if((c[b>>2]&3|0)!=3){b=n;l=m;break}c[2520]=m;c[b>>2]=c[b>>2]&-2;c[a+(p+4)>>2]=m|1;c[k>>2]=m;return}t=u>>>3;if(u>>>0<256>>>0){b=c[a+(p+8)>>2]|0;l=c[a+(p+12)>>2]|0;o=10112+(t<<1<<2)|0;if((b|0)!=(o|0)){if(b>>>0<q>>>0){Xb()}if((c[b+12>>2]|0)!=(n|0)){Xb()}}if((l|0)==(b|0)){c[2518]=c[2518]&~(1<<t);b=n;l=m;break}if((l|0)!=(o|0)){if(l>>>0<q>>>0){Xb()}o=l+8|0;if((c[o>>2]|0)==(n|0)){s=o}else{Xb()}}else{s=l+8|0}c[b+12>>2]=l;c[s>>2]=b;b=n;l=m;break}s=c[a+(p+24)>>2]|0;u=c[a+(p+12)>>2]|0;do{if((u|0)==(r|0)){u=a+(p+20)|0;t=c[u>>2]|0;if((t|0)==0){u=a+(p+16)|0;t=c[u>>2]|0;if((t|0)==0){o=0;break}}while(1){w=t+20|0;v=c[w>>2]|0;if((v|0)!=0){t=v;u=w;continue}v=t+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{t=w;u=v}}if(u>>>0<q>>>0){Xb()}else{c[u>>2]=0;o=t;break}}else{t=c[a+(p+8)>>2]|0;if(t>>>0<q>>>0){Xb()}v=t+12|0;if((c[v>>2]|0)!=(r|0)){Xb()}q=u+8|0;if((c[q>>2]|0)==(r|0)){c[v>>2]=u;c[q>>2]=t;o=u;break}else{Xb()}}}while(0);if((s|0)!=0){q=c[a+(p+28)>>2]|0;t=10376+(q<<2)|0;if((r|0)==(c[t>>2]|0)){c[t>>2]=o;if((o|0)==0){c[2519]=c[2519]&~(1<<q);b=n;l=m;break}}else{if(s>>>0<(c[2522]|0)>>>0){Xb()}q=s+16|0;if((c[q>>2]|0)==(r|0)){c[q>>2]=o}else{c[s+20>>2]=o}if((o|0)==0){b=n;l=m;break}}if(o>>>0<(c[2522]|0)>>>0){Xb()}c[o+24>>2]=s;q=c[a+(p+16)>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[2522]|0)>>>0){Xb()}else{c[o+16>>2]=q;c[q+24>>2]=o;break}}}while(0);p=c[a+(p+20)>>2]|0;if((p|0)!=0){if(p>>>0<(c[2522]|0)>>>0){Xb()}else{c[o+20>>2]=p;c[p+24>>2]=o;b=n;l=m;break}}else{b=n;l=m}}else{b=n;l=m}}else{b=p;l=g}}while(0);m=b;if(!(m>>>0<k>>>0)){Xb()}n=a+(g-4)|0;o=c[n>>2]|0;if((o&1|0)==0){Xb()}if((o&2|0)==0){if((j|0)==(c[2524]|0)){w=(c[2521]|0)+l|0;c[2521]=w;c[2524]=b;c[b+4>>2]=w|1;if((b|0)!=(c[2523]|0)){return}c[2523]=0;c[2520]=0;return}if((j|0)==(c[2523]|0)){w=(c[2520]|0)+l|0;c[2520]=w;c[2523]=b;c[b+4>>2]=w|1;c[m+w>>2]=w;return}l=(o&-8)+l|0;n=o>>>3;do{if(!(o>>>0<256>>>0)){i=c[a+(g+16)>>2]|0;o=c[a+(g|4)>>2]|0;do{if((o|0)==(k|0)){n=a+(g+12)|0;j=c[n>>2]|0;if((j|0)==0){n=a+(g+8)|0;j=c[n>>2]|0;if((j|0)==0){h=0;break}}while(1){p=j+20|0;o=c[p>>2]|0;if((o|0)!=0){j=o;n=p;continue}o=j+16|0;p=c[o>>2]|0;if((p|0)==0){break}else{j=p;n=o}}if(n>>>0<(c[2522]|0)>>>0){Xb()}else{c[n>>2]=0;h=j;break}}else{p=c[a+g>>2]|0;if(p>>>0<(c[2522]|0)>>>0){Xb()}n=p+12|0;if((c[n>>2]|0)!=(k|0)){Xb()}j=o+8|0;if((c[j>>2]|0)==(k|0)){c[n>>2]=o;c[j>>2]=p;h=o;break}else{Xb()}}}while(0);if((i|0)!=0){j=c[a+(g+20)>>2]|0;n=10376+(j<<2)|0;if((k|0)==(c[n>>2]|0)){c[n>>2]=h;if((h|0)==0){c[2519]=c[2519]&~(1<<j);break}}else{if(i>>>0<(c[2522]|0)>>>0){Xb()}j=i+16|0;if((c[j>>2]|0)==(k|0)){c[j>>2]=h}else{c[i+20>>2]=h}if((h|0)==0){break}}if(h>>>0<(c[2522]|0)>>>0){Xb()}c[h+24>>2]=i;i=c[a+(g+8)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2522]|0)>>>0){Xb()}else{c[h+16>>2]=i;c[i+24>>2]=h;break}}}while(0);g=c[a+(g+12)>>2]|0;if((g|0)!=0){if(g>>>0<(c[2522]|0)>>>0){Xb()}else{c[h+20>>2]=g;c[g+24>>2]=h;break}}}}else{h=c[a+g>>2]|0;g=c[a+(g|4)>>2]|0;a=10112+(n<<1<<2)|0;if((h|0)!=(a|0)){if(h>>>0<(c[2522]|0)>>>0){Xb()}if((c[h+12>>2]|0)!=(j|0)){Xb()}}if((g|0)==(h|0)){c[2518]=c[2518]&~(1<<n);break}if((g|0)!=(a|0)){if(g>>>0<(c[2522]|0)>>>0){Xb()}a=g+8|0;if((c[a>>2]|0)==(j|0)){i=a}else{Xb()}}else{i=g+8|0}c[h+12>>2]=g;c[i>>2]=h}}while(0);c[b+4>>2]=l|1;c[m+l>>2]=l;if((b|0)==(c[2523]|0)){c[2520]=l;return}}else{c[n>>2]=o&-2;c[b+4>>2]=l|1;c[m+l>>2]=l}g=l>>>3;if(l>>>0<256>>>0){a=g<<1;d=10112+(a<<2)|0;h=c[2518]|0;g=1<<g;if((h&g|0)!=0){g=10112+(a+2<<2)|0;a=c[g>>2]|0;if(a>>>0<(c[2522]|0)>>>0){Xb()}else{f=a;e=g}}else{c[2518]=h|g;f=d;e=10112+(a+2<<2)|0}c[e>>2]=b;c[f+12>>2]=b;c[b+8>>2]=f;c[b+12>>2]=d;return}e=b;f=l>>>8;if((f|0)!=0){if(l>>>0>16777215>>>0){f=31}else{v=(f+1048320|0)>>>16&8;w=f<<v;u=(w+520192|0)>>>16&4;w=w<<u;f=(w+245760|0)>>>16&2;f=14-(u|v|f)+(w<<f>>>15)|0;f=l>>>((f+7|0)>>>0)&1|f<<1}}else{f=0}g=10376+(f<<2)|0;c[b+28>>2]=f;c[b+20>>2]=0;c[b+16>>2]=0;h=c[2519]|0;a=1<<f;a:do{if((h&a|0)!=0){a=c[g>>2]|0;if((f|0)==31){g=0}else{g=25-(f>>>1)|0}b:do{if((c[a+4>>2]&-8|0)!=(l|0)){f=a;a=l<<g;while(1){h=f+16+(a>>>31<<2)|0;g=c[h>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(l|0)){d=g;break b}else{f=g;a=a<<1}}if(h>>>0<(c[2522]|0)>>>0){Xb()}else{c[h>>2]=e;c[b+24>>2]=f;c[b+12>>2]=b;c[b+8>>2]=b;break a}}else{d=a}}while(0);f=d+8|0;a=c[f>>2]|0;g=c[2522]|0;if(d>>>0<g>>>0){Xb()}if(a>>>0<g>>>0){Xb()}else{c[a+12>>2]=e;c[f>>2]=e;c[b+8>>2]=a;c[b+12>>2]=d;c[b+24>>2]=0;break}}else{c[2519]=h|a;c[g>>2]=e;c[b+24>>2]=g;c[b+12>>2]=b;c[b+8>>2]=b}}while(0);w=(c[2526]|0)-1|0;c[2526]=w;if((w|0)==0){b=10528}else{return}while(1){b=c[b>>2]|0;if((b|0)==0){break}else{b=b+8|0}}c[2526]=-1;return}function Km(a,b){a=a|0;b=b|0;var d=0,e=0;if((a|0)==0){e=Im(b)|0;return e|0}if(b>>>0>4294967231>>>0){c[(Lb()|0)>>2]=12;e=0;return e|0}if(b>>>0<11>>>0){d=16}else{d=b+11&-8}d=Lm(a-8|0,d)|0;if((d|0)!=0){e=d+8|0;return e|0}d=Im(b)|0;if((d|0)==0){e=0;return e|0}e=c[a-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;cn(d|0,a|0,e>>>0<b>>>0?e:b)|0;Jm(a);e=d;return e|0}function Lm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;e=a+4|0;f=c[e>>2]|0;h=f&-8;d=a;j=d+h|0;k=j;i=c[2522]|0;if(d>>>0<i>>>0){Xb();return 0}l=f&3;if(!((l|0)!=1&d>>>0<j>>>0)){Xb();return 0}g=d+(h|4)|0;m=c[g>>2]|0;if((m&1|0)==0){Xb();return 0}if((l|0)==0){if(b>>>0<256>>>0){o=0;return o|0}if(!(h>>>0<(b+4|0)>>>0)?!((h-b|0)>>>0>c[2510]<<1>>>0):0){o=a;return o|0}o=0;return o|0}if(!(h>>>0<b>>>0)){h=h-b|0;if(!(h>>>0>15>>>0)){o=a;return o|0}c[e>>2]=f&1|b|2;c[d+(b+4)>>2]=h|3;c[g>>2]=c[g>>2]|1;Mm(d+b|0,h);o=a;return o|0}if((k|0)==(c[2524]|0)){g=(c[2521]|0)+h|0;if(!(g>>>0>b>>>0)){o=0;return o|0}o=g-b|0;c[e>>2]=f&1|b|2;c[d+(b+4)>>2]=o|1;c[2524]=d+b;c[2521]=o;o=a;return o|0}if((k|0)==(c[2523]|0)){h=(c[2520]|0)+h|0;if(h>>>0<b>>>0){o=0;return o|0}g=h-b|0;if(g>>>0>15>>>0){c[e>>2]=f&1|b|2;c[d+(b+4)>>2]=g|1;c[d+h>>2]=g;o=d+(h+4)|0;c[o>>2]=c[o>>2]&-2;d=d+b|0}else{c[e>>2]=f&1|h|2;d=d+(h+4)|0;c[d>>2]=c[d>>2]|1;d=0;g=0}c[2520]=g;c[2523]=d;o=a;return o|0}if((m&2|0)!=0){o=0;return o|0}f=(m&-8)+h|0;if(f>>>0<b>>>0){o=0;return o|0}g=f-b|0;l=m>>>3;do{if(!(m>>>0<256>>>0)){k=c[d+(h+24)>>2]|0;l=c[d+(h+12)>>2]|0;do{if((l|0)==(j|0)){m=d+(h+20)|0;l=c[m>>2]|0;if((l|0)==0){m=d+(h+16)|0;l=c[m>>2]|0;if((l|0)==0){l=0;break}}while(1){n=l+20|0;o=c[n>>2]|0;if((o|0)!=0){l=o;m=n;continue}o=l+16|0;n=c[o>>2]|0;if((n|0)==0){break}else{l=n;m=o}}if(m>>>0<i>>>0){Xb();return 0}else{c[m>>2]=0;break}}else{m=c[d+(h+8)>>2]|0;if(m>>>0<i>>>0){Xb();return 0}n=m+12|0;if((c[n>>2]|0)!=(j|0)){Xb();return 0}i=l+8|0;if((c[i>>2]|0)==(j|0)){c[n>>2]=l;c[i>>2]=m;break}else{Xb();return 0}}}while(0);if((k|0)!=0){i=c[d+(h+28)>>2]|0;m=10376+(i<<2)|0;if((j|0)==(c[m>>2]|0)){c[m>>2]=l;if((l|0)==0){c[2519]=c[2519]&~(1<<i);break}}else{if(k>>>0<(c[2522]|0)>>>0){Xb();return 0}i=k+16|0;if((c[i>>2]|0)==(j|0)){c[i>>2]=l}else{c[k+20>>2]=l}if((l|0)==0){break}}if(l>>>0<(c[2522]|0)>>>0){Xb();return 0}c[l+24>>2]=k;i=c[d+(h+16)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[l+16>>2]=i;c[i+24>>2]=l;break}}}while(0);h=c[d+(h+20)>>2]|0;if((h|0)!=0){if(h>>>0<(c[2522]|0)>>>0){Xb();return 0}else{c[l+20>>2]=h;c[h+24>>2]=l;break}}}}else{j=c[d+(h+8)>>2]|0;h=c[d+(h+12)>>2]|0;m=10112+(l<<1<<2)|0;if((j|0)!=(m|0)){if(j>>>0<i>>>0){Xb();return 0}if((c[j+12>>2]|0)!=(k|0)){Xb();return 0}}if((h|0)==(j|0)){c[2518]=c[2518]&~(1<<l);break}if((h|0)!=(m|0)){if(h>>>0<i>>>0){Xb();return 0}i=h+8|0;if((c[i>>2]|0)!=(k|0)){Xb();return 0}}else{i=h+8|0}c[j+12>>2]=h;c[i>>2]=j}}while(0);if(g>>>0<16>>>0){c[e>>2]=f|c[e>>2]&1|2;o=d+(f|4)|0;c[o>>2]=c[o>>2]|1;o=a;return o|0}else{c[e>>2]=c[e>>2]&1|b|2;c[d+(b+4)>>2]=g|3;o=d+(f|4)|0;c[o>>2]=c[o>>2]|1;Mm(d+b|0,g);o=a;return o|0}return 0}function Mm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;h=a;k=h+b|0;i=k;l=c[a+4>>2]|0;do{if((l&1|0)==0){o=c[a>>2]|0;if((l&3|0)==0){return}q=h+(-o|0)|0;a=q;l=o+b|0;p=c[2522]|0;if(q>>>0<p>>>0){Xb()}if((a|0)==(c[2523]|0)){d=h+(b+4)|0;if((c[d>>2]&3|0)!=3){d=a;m=l;break}c[2520]=l;c[d>>2]=c[d>>2]&-2;c[h+(4-o)>>2]=l|1;c[k>>2]=l;return}s=o>>>3;if(o>>>0<256>>>0){d=c[h+(8-o)>>2]|0;m=c[h+(12-o)>>2]|0;n=10112+(s<<1<<2)|0;if((d|0)!=(n|0)){if(d>>>0<p>>>0){Xb()}if((c[d+12>>2]|0)!=(a|0)){Xb()}}if((m|0)==(d|0)){c[2518]=c[2518]&~(1<<s);d=a;m=l;break}if((m|0)!=(n|0)){if(m>>>0<p>>>0){Xb()}n=m+8|0;if((c[n>>2]|0)==(a|0)){r=n}else{Xb()}}else{r=m+8|0}c[d+12>>2]=m;c[r>>2]=d;d=a;m=l;break}r=c[h+(24-o)>>2]|0;s=c[h+(12-o)>>2]|0;do{if((s|0)==(q|0)){u=16-o|0;t=h+(u+4)|0;s=c[t>>2]|0;if((s|0)==0){t=h+u|0;s=c[t>>2]|0;if((s|0)==0){n=0;break}}while(1){v=s+20|0;u=c[v>>2]|0;if((u|0)!=0){s=u;t=v;continue}v=s+16|0;u=c[v>>2]|0;if((u|0)==0){break}else{s=u;t=v}}if(t>>>0<p>>>0){Xb()}else{c[t>>2]=0;n=s;break}}else{t=c[h+(8-o)>>2]|0;if(t>>>0<p>>>0){Xb()}p=t+12|0;if((c[p>>2]|0)!=(q|0)){Xb()}u=s+8|0;if((c[u>>2]|0)==(q|0)){c[p>>2]=s;c[u>>2]=t;n=s;break}else{Xb()}}}while(0);if((r|0)!=0){p=c[h+(28-o)>>2]|0;s=10376+(p<<2)|0;if((q|0)==(c[s>>2]|0)){c[s>>2]=n;if((n|0)==0){c[2519]=c[2519]&~(1<<p);d=a;m=l;break}}else{if(r>>>0<(c[2522]|0)>>>0){Xb()}p=r+16|0;if((c[p>>2]|0)==(q|0)){c[p>>2]=n}else{c[r+20>>2]=n}if((n|0)==0){d=a;m=l;break}}if(n>>>0<(c[2522]|0)>>>0){Xb()}c[n+24>>2]=r;p=16-o|0;o=c[h+p>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[2522]|0)>>>0){Xb()}else{c[n+16>>2]=o;c[o+24>>2]=n;break}}}while(0);o=c[h+(p+4)>>2]|0;if((o|0)!=0){if(o>>>0<(c[2522]|0)>>>0){Xb()}else{c[n+20>>2]=o;c[o+24>>2]=n;d=a;m=l;break}}else{d=a;m=l}}else{d=a;m=l}}else{d=a;m=b}}while(0);l=c[2522]|0;if(k>>>0<l>>>0){Xb()}a=h+(b+4)|0;n=c[a>>2]|0;if((n&2|0)==0){if((i|0)==(c[2524]|0)){v=(c[2521]|0)+m|0;c[2521]=v;c[2524]=d;c[d+4>>2]=v|1;if((d|0)!=(c[2523]|0)){return}c[2523]=0;c[2520]=0;return}if((i|0)==(c[2523]|0)){v=(c[2520]|0)+m|0;c[2520]=v;c[2523]=d;c[d+4>>2]=v|1;c[d+v>>2]=v;return}m=(n&-8)+m|0;a=n>>>3;do{if(!(n>>>0<256>>>0)){i=c[h+(b+24)>>2]|0;j=c[h+(b+12)>>2]|0;do{if((j|0)==(k|0)){a=h+(b+20)|0;j=c[a>>2]|0;if((j|0)==0){a=h+(b+16)|0;j=c[a>>2]|0;if((j|0)==0){g=0;break}}while(1){o=j+20|0;n=c[o>>2]|0;if((n|0)!=0){j=n;a=o;continue}o=j+16|0;n=c[o>>2]|0;if((n|0)==0){break}else{j=n;a=o}}if(a>>>0<l>>>0){Xb()}else{c[a>>2]=0;g=j;break}}else{a=c[h+(b+8)>>2]|0;if(a>>>0<l>>>0){Xb()}l=a+12|0;if((c[l>>2]|0)!=(k|0)){Xb()}n=j+8|0;if((c[n>>2]|0)==(k|0)){c[l>>2]=j;c[n>>2]=a;g=j;break}else{Xb()}}}while(0);if((i|0)!=0){j=c[h+(b+28)>>2]|0;l=10376+(j<<2)|0;if((k|0)==(c[l>>2]|0)){c[l>>2]=g;if((g|0)==0){c[2519]=c[2519]&~(1<<j);break}}else{if(i>>>0<(c[2522]|0)>>>0){Xb()}j=i+16|0;if((c[j>>2]|0)==(k|0)){c[j>>2]=g}else{c[i+20>>2]=g}if((g|0)==0){break}}if(g>>>0<(c[2522]|0)>>>0){Xb()}c[g+24>>2]=i;i=c[h+(b+16)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2522]|0)>>>0){Xb()}else{c[g+16>>2]=i;c[i+24>>2]=g;break}}}while(0);b=c[h+(b+20)>>2]|0;if((b|0)!=0){if(b>>>0<(c[2522]|0)>>>0){Xb()}else{c[g+20>>2]=b;c[b+24>>2]=g;break}}}}else{g=c[h+(b+8)>>2]|0;b=c[h+(b+12)>>2]|0;h=10112+(a<<1<<2)|0;if((g|0)!=(h|0)){if(g>>>0<l>>>0){Xb()}if((c[g+12>>2]|0)!=(i|0)){Xb()}}if((b|0)==(g|0)){c[2518]=c[2518]&~(1<<a);break}if((b|0)!=(h|0)){if(b>>>0<l>>>0){Xb()}h=b+8|0;if((c[h>>2]|0)==(i|0)){j=h}else{Xb()}}else{j=b+8|0}c[g+12>>2]=b;c[j>>2]=g}}while(0);c[d+4>>2]=m|1;c[d+m>>2]=m;if((d|0)==(c[2523]|0)){c[2520]=m;return}}else{c[a>>2]=n&-2;c[d+4>>2]=m|1;c[d+m>>2]=m}i=m>>>3;if(m>>>0<256>>>0){g=i<<1;b=10112+(g<<2)|0;h=c[2518]|0;i=1<<i;if((h&i|0)!=0){h=10112+(g+2<<2)|0;g=c[h>>2]|0;if(g>>>0<(c[2522]|0)>>>0){Xb()}else{e=g;f=h}}else{c[2518]=h|i;e=b;f=10112+(g+2<<2)|0}c[f>>2]=d;c[e+12>>2]=d;c[d+8>>2]=e;c[d+12>>2]=b;return}e=d;f=m>>>8;if((f|0)!=0){if(m>>>0>16777215>>>0){b=31}else{u=(f+1048320|0)>>>16&8;v=f<<u;t=(v+520192|0)>>>16&4;v=v<<t;b=(v+245760|0)>>>16&2;b=14-(t|u|b)+(v<<b>>>15)|0;b=m>>>((b+7|0)>>>0)&1|b<<1}}else{b=0}h=10376+(b<<2)|0;c[d+28>>2]=b;c[d+20>>2]=0;c[d+16>>2]=0;f=c[2519]|0;g=1<<b;if((f&g|0)==0){c[2519]=f|g;c[h>>2]=e;c[d+24>>2]=h;c[d+12>>2]=d;c[d+8>>2]=d;return}f=c[h>>2]|0;if((b|0)==31){b=0}else{b=25-(b>>>1)|0}a:do{if((c[f+4>>2]&-8|0)!=(m|0)){b=m<<b;while(1){g=f+16+(b>>>31<<2)|0;h=c[g>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(m|0)){f=h;break a}else{f=h;b=b<<1}}if(g>>>0<(c[2522]|0)>>>0){Xb()}c[g>>2]=e;c[d+24>>2]=f;c[d+12>>2]=d;c[d+8>>2]=d;return}}while(0);g=f+8|0;b=c[g>>2]|0;h=c[2522]|0;if(f>>>0<h>>>0){Xb()}if(b>>>0<h>>>0){Xb()}c[b+12>>2]=e;c[g>>2]=e;c[d+8>>2]=b;c[d+12>>2]=f;c[d+24>>2]=0;return}function Nm(a){a=a|0;var b=0,d=0;a=(a|0)==0?1:a;while(1){d=Im(a)|0;if((d|0)!=0){b=10;break}d=(I=c[3524]|0,c[3524]=I+0,I);if((d|0)==0){break}vc[d&1]()}if((b|0)==10){return d|0}d=cc(4)|0;c[d>>2]=2504;zb(d|0,8280,34);return 0}function Om(a){a=a|0;return Nm(a)|0}function Pm(a){a=a|0;if((a|0)==0){return}Jm(a);return}function Qm(a){a=a|0;Pm(a);return}function Rm(a){a=a|0;Pm(a);return}function Sm(a){a=a|0;return}function Tm(a){a=a|0;return 1136}function Um(){var a=0;a=cc(4)|0;c[a>>2]=2504;zb(a|0,8280,34)}function Vm(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0,J=0,L=0,M=0.0,N=0.0,O=0.0,P=0.0;g=i;i=i+512|0;k=g|0;if((e|0)==1){j=-1074;e=53}else if((e|0)==2){j=-1074;e=53}else if((e|0)==0){j=-149;e=24}else{N=0.0;i=g;return+N}n=b+4|0;o=b+100|0;do{h=c[n>>2]|0;if(h>>>0<(c[o>>2]|0)>>>0){c[n>>2]=h+1;D=d[h]|0}else{D=Ym(b)|0}}while((Na(D|0)|0)!=0);do{if((D|0)==45|(D|0)==43){h=1-(((D|0)==45)<<1)|0;m=c[n>>2]|0;if(m>>>0<(c[o>>2]|0)>>>0){c[n>>2]=m+1;D=d[m]|0;break}else{D=Ym(b)|0;break}}else{h=1}}while(0);m=0;do{if((D|32|0)!=(a[688+m|0]|0)){break}do{if(m>>>0<7>>>0){p=c[n>>2]|0;if(p>>>0<(c[o>>2]|0)>>>0){c[n>>2]=p+1;D=d[p]|0;break}else{D=Ym(b)|0;break}}}while(0);m=m+1|0}while(m>>>0<8>>>0);do{if((m|0)==3){q=23}else if((m|0)!=8){p=(f|0)==0;if(!(m>>>0<4>>>0|p)){if((m|0)==8){break}else{q=23;break}}a:do{if((m|0)==0){m=0;do{if((D|32|0)!=(a[1344+m|0]|0)){break a}do{if(m>>>0<2>>>0){r=c[n>>2]|0;if(r>>>0<(c[o>>2]|0)>>>0){c[n>>2]=r+1;D=d[r]|0;break}else{D=Ym(b)|0;break}}}while(0);m=m+1|0}while(m>>>0<3>>>0)}}while(0);if((m|0)==3){e=c[n>>2]|0;if(e>>>0<(c[o>>2]|0)>>>0){c[n>>2]=e+1;e=d[e]|0}else{e=Ym(b)|0}if((e|0)==40){e=1}else{if((c[o>>2]|0)==0){N=+v;i=g;return+N}c[n>>2]=(c[n>>2]|0)-1;N=+v;i=g;return+N}while(1){h=c[n>>2]|0;if(h>>>0<(c[o>>2]|0)>>>0){c[n>>2]=h+1;h=d[h]|0}else{h=Ym(b)|0}if(!((h-48|0)>>>0<10>>>0|(h-65|0)>>>0<26>>>0)?!((h-97|0)>>>0<26>>>0|(h|0)==95):0){break}e=e+1|0}if((h|0)==41){N=+v;i=g;return+N}h=(c[o>>2]|0)==0;if(!h){c[n>>2]=(c[n>>2]|0)-1}if(p){c[(Lb()|0)>>2]=22;Xm(b,0);N=0.0;i=g;return+N}if((e|0)==0|h){N=+v;i=g;return+N}while(1){e=e-1|0;c[n>>2]=(c[n>>2]|0)-1;if((e|0)==0){s=+v;break}}i=g;return+s}else if((m|0)==0){do{if((D|0)==48){m=c[n>>2]|0;if(m>>>0<(c[o>>2]|0)>>>0){c[n>>2]=m+1;m=d[m]|0}else{m=Ym(b)|0}if((m|32|0)!=120){if((c[o>>2]|0)==0){D=48;break}c[n>>2]=(c[n>>2]|0)-1;D=48;break}k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;y=d[k]|0;B=0}else{y=Ym(b)|0;B=0}while(1){if((y|0)==46){q=70;break}else if((y|0)!=48){m=0;k=0;r=0;t=0;x=0;C=0;H=1.0;s=0.0;u=0;break}k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;y=d[k]|0;B=1;continue}else{y=Ym(b)|0;B=1;continue}}b:do{if((q|0)==70){k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;y=d[k]|0}else{y=Ym(b)|0}if((y|0)==48){r=-1;t=-1;while(1){k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;y=d[k]|0}else{y=Ym(b)|0}if((y|0)!=48){m=0;k=0;B=1;x=1;C=0;H=1.0;s=0.0;u=0;break b}L=gn(t,r,-1,-1)|0;r=K;t=L}}else{m=0;k=0;r=0;t=0;x=1;C=0;H=1.0;s=0.0;u=0}}}while(0);c:while(1){z=y-48|0;do{if(!(z>>>0<10>>>0)){D=y|32;A=(y|0)==46;if(!((D-97|0)>>>0<6>>>0|A)){break c}if(A){if((x|0)==0){z=m;A=k;r=m;t=k;x=1;break}else{y=46;break c}}else{z=(y|0)>57?D-87|0:z;q=84;break}}else{q=84}}while(0);if((q|0)==84){q=0;L=0;do{if(!((m|0)<(L|0)|(m|0)==(L|0)&k>>>0<8>>>0)){L=0;if((m|0)<(L|0)|(m|0)==(L|0)&k>>>0<14>>>0){N=H*.0625;M=N;s=s+N*+(z|0);break}if((z|0)!=0&(C|0)==0){C=1;M=H;s=s+H*.5}else{M=H}}else{M=H;u=z+(u<<4)|0}}while(0);A=gn(k,m,1,0)|0;z=K;B=1;H=M}k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;y=d[k]|0;m=z;k=A;continue}else{y=Ym(b)|0;m=z;k=A;continue}}if((B|0)==0){e=(c[o>>2]|0)==0;if(!e){c[n>>2]=(c[n>>2]|0)-1}if(!p){if(!e?(l=c[n>>2]|0,c[n>>2]=l-1,(x|0)!=0):0){c[n>>2]=l-2}}else{Xm(b,0)}N=+(h|0)*0.0;i=g;return+N}q=(x|0)==0;l=q?k:t;q=q?m:r;L=0;if((m|0)<(L|0)|(m|0)==(L|0)&k>>>0<8>>>0){do{u=u<<4;k=gn(k,m,1,0)|0;m=K;L=0}while((m|0)<(L|0)|(m|0)==(L|0)&k>>>0<8>>>0)}do{if((y|32|0)==112){k=Wm(b,f)|0;m=K;if((k|0)==0&(m|0)==(-2147483648|0)){if(p){Xm(b,0);N=0.0;i=g;return+N}else{if((c[o>>2]|0)==0){m=0;k=0;break}c[n>>2]=(c[n>>2]|0)-1;m=0;k=0;break}}}else{if((c[o>>2]|0)==0){m=0;k=0}else{c[n>>2]=(c[n>>2]|0)-1;m=0;k=0}}}while(0);l=gn(l<<2|0>>>30,q<<2|l>>>30,-32,-1)|0;k=gn(l,K,k,m)|0;l=K;if((u|0)==0){N=+(h|0)*0.0;i=g;return+N}L=0;if((l|0)>(L|0)|(l|0)==(L|0)&k>>>0>(-j|0)>>>0){c[(Lb()|0)>>2]=34;N=+(h|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+N}m=j-106|0;L=(m|0)<0|0?-1:0;if((l|0)<(L|0)|(l|0)==(L|0)&k>>>0<m>>>0){c[(Lb()|0)>>2]=34;N=+(h|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+N}if((u|0)>-1){do{u=u<<1;if(s<.5){H=s}else{H=s+-1.0;u=u|1}s=s+H;k=gn(k,l,-1,-1)|0;l=K}while((u|0)>-1)}m=0;j=hn(32,0,j,(j|0)<0|0?-1:0)|0;j=gn(k,l,j,K)|0;L=K;if((m|0)>(L|0)|(m|0)==(L|0)&e>>>0>j>>>0){e=(j|0)<0?0:j}if((e|0)<53){H=+(h|0);M=+wb(+(+Zm(1.0,84-e|0)),+H);if((e|0)<32&s!=0.0){e=u&1;s=(e|0)==0?0.0:s;u=(e^1)+u|0}}else{M=0.0;H=+(h|0)}s=H*s+(M+H*+(u>>>0>>>0))-M;if(!(s!=0.0)){c[(Lb()|0)>>2]=34}N=+_m(s,k);i=g;return+N}}while(0);m=j+e|0;l=-m|0;C=0;while(1){if((D|0)==46){q=139;break}else if((D|0)!=48){F=0;u=0;x=0;break}r=c[n>>2]|0;if(r>>>0<(c[o>>2]|0)>>>0){c[n>>2]=r+1;D=d[r]|0;C=1;continue}else{D=Ym(b)|0;C=1;continue}}d:do{if((q|0)==139){r=c[n>>2]|0;if(r>>>0<(c[o>>2]|0)>>>0){c[n>>2]=r+1;D=d[r]|0}else{D=Ym(b)|0}if((D|0)==48){u=-1;x=-1;while(1){r=c[n>>2]|0;if(r>>>0<(c[o>>2]|0)>>>0){c[n>>2]=r+1;D=d[r]|0}else{D=Ym(b)|0}if((D|0)!=48){F=1;C=1;break d}L=gn(x,u,-1,-1)|0;u=K;x=L}}else{F=1;u=0;x=0}}}while(0);r=k|0;c[r>>2]=0;I=D-48|0;G=(D|0)==46;e:do{if(I>>>0<10>>>0|G){t=k+496|0;E=0;B=0;y=0;A=0;z=0;while(1){do{if(G){if((F|0)==0){F=1;L=E;J=B;u=E;x=B}else{break e}}else{B=gn(B,E,1,0)|0;E=K;G=(D|0)!=48;if((A|0)>=125){if(!G){L=E;J=B;break}c[t>>2]=c[t>>2]|1;L=E;J=B;break}C=k+(A<<2)|0;if((z|0)!=0){I=D-48+((c[C>>2]|0)*10|0)|0}c[C>>2]=I;z=z+1|0;C=(z|0)==9;z=C?0:z;A=(C&1)+A|0;C=1;y=G?B:y;L=E;J=B}}while(0);B=c[n>>2]|0;if(B>>>0<(c[o>>2]|0)>>>0){c[n>>2]=B+1;D=d[B]|0}else{D=Ym(b)|0}I=D-48|0;G=(D|0)==46;if(I>>>0<10>>>0|G){E=L;B=J}else{E=L;B=J;q=162;break}}}else{E=0;B=0;y=0;A=0;z=0;q=162}}while(0);if((q|0)==162){q=(F|0)==0;u=q?E:u;x=q?B:x}q=(C|0)!=0;if(q?(D|32|0)==101:0){f=Wm(b,f)|0;t=K;do{if((f|0)==0&(t|0)==(-2147483648|0)){if(p){Xm(b,0);N=0.0;i=g;return+N}else{if((c[o>>2]|0)==0){t=0;f=0;break}c[n>>2]=(c[n>>2]|0)-1;t=0;f=0;break}}}while(0);x=gn(f,t,x,u)|0;u=K}else{if((D|0)>-1?(c[o>>2]|0)!=0:0){c[n>>2]=(c[n>>2]|0)-1}}if(!q){c[(Lb()|0)>>2]=22;Xm(b,0);N=0.0;i=g;return+N}b=c[r>>2]|0;if((b|0)==0){N=+(h|0)*0.0;i=g;return+N}L=0;do{if((x|0)==(B|0)&(u|0)==(E|0)&((E|0)<(L|0)|(E|0)==(L|0)&B>>>0<10>>>0)){if(!(e>>>0>30>>>0)?(b>>>(e>>>0)|0)!=0:0){break}N=+(h|0)*+(b>>>0>>>0);i=g;return+N}}while(0);b=(j|0)/-2|0;L=(b|0)<0|0?-1:0;if((u|0)>(L|0)|(u|0)==(L|0)&x>>>0>b>>>0){c[(Lb()|0)>>2]=34;N=+(h|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+N}b=j-106|0;L=(b|0)<0|0?-1:0;if((u|0)<(L|0)|(u|0)==(L|0)&x>>>0<b>>>0){c[(Lb()|0)>>2]=34;N=+(h|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+N}if((z|0)!=0){if((z|0)<9){b=k+(A<<2)|0;n=c[b>>2]|0;do{n=n*10|0;z=z+1|0}while((z|0)<9);c[b>>2]=n}A=A+1|0}do{if((y|0)<9?(y|0)<=(x|0)&(x|0)<18:0){if((x|0)==9){N=+(h|0)*+((c[r>>2]|0)>>>0>>>0);i=g;return+N}if((x|0)<9){N=+(h|0)*+((c[r>>2]|0)>>>0>>>0)/+(c[24+(8-x<<2)>>2]|0);i=g;return+N}b=e+27+(x*-3|0)|0;n=c[r>>2]|0;if((b|0)<=30?(n>>>(b>>>0)|0)!=0:0){break}N=+(h|0)*+(n>>>0>>>0)*+(c[24+(x-10<<2)>>2]|0);i=g;return+N}}while(0);b=(x|0)%9|0;if((b|0)==0){b=0;n=0}else{o=(x|0)>-1?b:b+9|0;n=c[24+(8-o<<2)>>2]|0;if((A|0)!=0){f=1e9/(n|0)|0;b=0;r=0;q=0;while(1){J=k+(r<<2)|0;p=c[J>>2]|0;L=((p>>>0)/(n>>>0)|0)+q|0;c[J>>2]=L;q=ga((p>>>0)%(n>>>0)|0,f)|0;p=r+1|0;if((r|0)==(b|0)&(L|0)==0){b=p&127;x=x-9|0}if((p|0)==(A|0)){break}else{r=p}}if((q|0)!=0){c[k+(A<<2)>>2]=q;A=A+1|0}}else{A=0;b=0}n=0;x=9-o+x|0}f:while(1){o=k+(b<<2)|0;if((x|0)<18){do{f=0;o=A+127|0;while(1){o=o&127;p=k+(o<<2)|0;q=c[p>>2]|0;q=gn(q<<29|0>>>3,0<<29|q>>>3,f,0)|0;f=K;L=0;if(f>>>0>L>>>0|f>>>0==L>>>0&q>>>0>1e9>>>0){L=sn(q,f,1e9,0)|0;q=tn(q,f,1e9,0)|0;f=L}else{f=0}c[p>>2]=q;p=(o|0)==(b|0);if(!((o|0)!=(A+127&127|0)|p)){A=(q|0)==0?o:A}if(p){break}else{o=o-1|0}}n=n-29|0}while((f|0)==0)}else{if((x|0)!=18){break}do{if(!((c[o>>2]|0)>>>0<9007199>>>0)){x=18;break f}f=0;p=A+127|0;while(1){p=p&127;q=k+(p<<2)|0;r=c[q>>2]|0;r=gn(r<<29|0>>>3,0<<29|r>>>3,f,0)|0;f=K;L=0;if(f>>>0>L>>>0|f>>>0==L>>>0&r>>>0>1e9>>>0){L=sn(r,f,1e9,0)|0;r=tn(r,f,1e9,0)|0;f=L}else{f=0}c[q>>2]=r;q=(p|0)==(b|0);if(!((p|0)!=(A+127&127|0)|q)){A=(r|0)==0?p:A}if(q){break}else{p=p-1|0}}n=n-29|0}while((f|0)==0)}b=b+127&127;if((b|0)==(A|0)){L=A+127&127;A=k+((A+126&127)<<2)|0;c[A>>2]=c[A>>2]|c[k+(L<<2)>>2];A=L}c[k+(b<<2)>>2]=f;x=x+9|0}g:while(1){o=A+1&127;f=k+((A+127&127)<<2)|0;while(1){q=(x|0)==18;p=(x|0)>27?9:1;while(1){r=0;while(1){t=r+b&127;if((t|0)==(A|0)){r=2;break}t=c[k+(t<<2)>>2]|0;u=c[16+(r<<2)>>2]|0;if(t>>>0<u>>>0){r=2;break}y=r+1|0;if(t>>>0>u>>>0){break}if((y|0)<2){r=y}else{r=y;break}}if((r|0)==2&q){break g}n=p+n|0;if((b|0)==(A|0)){b=A}else{break}}r=(1<<p)-1|0;q=1e9>>>(p>>>0);t=b;u=b;b=0;do{J=k+(u<<2)|0;L=c[J>>2]|0;y=(L>>>(p>>>0))+b|0;c[J>>2]=y;b=ga(L&r,q)|0;y=(u|0)==(t|0)&(y|0)==0;u=u+1&127;x=y?x-9|0:x;t=y?u:t}while((u|0)!=(A|0));if((b|0)==0){b=t;continue}if((o|0)!=(t|0)){break}c[f>>2]=c[f>>2]|1;b=t}c[k+(A<<2)>>2]=b;b=t;A=o}f=b&127;if((f|0)==(A|0)){c[k+(o-1<<2)>>2]=0;A=o}H=+((c[k+(f<<2)>>2]|0)>>>0>>>0);o=b+1&127;if((o|0)==(A|0)){A=A+1&127;c[k+(A-1<<2)>>2]=0}s=+(h|0);M=s*(H*1.0e9+ +((c[k+(o<<2)>>2]|0)>>>0>>>0));o=n+53|0;h=o-j|0;if((h|0)<(e|0)){e=(h|0)<0?0:h;j=1}else{j=0}if((e|0)<53){P=+wb(+(+Zm(1.0,105-e|0)),+M);O=+Wa(+M,+(+Zm(1.0,53-e|0)));H=P;N=O;M=P+(M-O)}else{H=0.0;N=0.0}f=b+2&127;if((f|0)!=(A|0)){k=c[k+(f<<2)>>2]|0;do{if(!(k>>>0<5e8>>>0)){if(k>>>0>5e8>>>0){N=s*.75+N;break}if((b+3&127|0)==(A|0)){N=s*.5+N;break}else{N=s*.75+N;break}}else{if((k|0)==0?(b+3&127|0)==(A|0):0){break}N=s*.25+N}}while(0);if((53-e|0)>1?!(+Wa(+N,+1.0)!=0.0):0){N=N+1.0}}s=M+N-H;do{if((o&2147483647|0)>(-2-m|0)){if(!(+V(+s)<9007199254740992.0)){s=s*.5;j=(j|0)!=0&(e|0)==(h|0)?0:j;n=n+1|0}if((n+50|0)<=(l|0)?!((j|0)!=0&N!=0.0):0){break}c[(Lb()|0)>>2]=34}}while(0);P=+_m(s,n);i=g;return+P}else{if((c[o>>2]|0)!=0){c[n>>2]=(c[n>>2]|0)-1}c[(Lb()|0)>>2]=22;Xm(b,0);P=0.0;i=g;return+P}}}while(0);if((q|0)==23){e=(c[o>>2]|0)==0;if(!e){c[n>>2]=(c[n>>2]|0)-1}if(!(m>>>0<4>>>0|(f|0)==0|e)){do{c[n>>2]=(c[n>>2]|0)-1;m=m-1|0}while(m>>>0>3>>>0)}}P=+(h|0)*w;i=g;return+P}function Wm(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=a+4|0;g=c[e>>2]|0;f=a+100|0;if(g>>>0<(c[f>>2]|0)>>>0){c[e>>2]=g+1;h=d[g]|0}else{h=Ym(a)|0}if((h|0)==45|(h|0)==43){g=(h|0)==45|0;h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Ym(a)|0}if(!((h-48|0)>>>0<10>>>0|(b|0)==0)?(c[f>>2]|0)!=0:0){c[e>>2]=(c[e>>2]|0)-1}}else{g=0}if((h-48|0)>>>0>9>>>0){if((c[f>>2]|0)==0){h=-2147483648;i=0;return(K=h,i)|0}c[e>>2]=(c[e>>2]|0)-1;h=-2147483648;i=0;return(K=h,i)|0}else{b=0}while(1){b=h-48+b|0;h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Ym(a)|0}if(!((h-48|0)>>>0<10>>>0&(b|0)<214748364)){break}b=b*10|0}i=b;b=(b|0)<0|0?-1:0;if((h-48|0)>>>0<10>>>0){do{b=rn(i,b,10,0)|0;i=K;h=gn(h,(h|0)<0|0?-1:0,-48,-1)|0;i=gn(h,K,b,i)|0;b=K;h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Ym(a)|0}j=21474836}while((h-48|0)>>>0<10>>>0&((b|0)<(j|0)|(b|0)==(j|0)&i>>>0<2061584302>>>0))}if((h-48|0)>>>0<10>>>0){do{h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Ym(a)|0}}while((h-48|0)>>>0<10>>>0)}if((c[f>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)-1}e=(g|0)!=0;a=hn(0,0,i,b)|0;f=e?K:b;j=e?a:i;return(K=f,j)|0}function Xm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a+104>>2]=b;e=c[a+8>>2]|0;d=c[a+4>>2]|0;f=e-d|0;c[a+108>>2]=f;if((b|0)!=0&(f|0)>(b|0)){c[a+100>>2]=d+b;return}else{c[a+100>>2]=e;return}}function Ym(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;i=b+104|0;h=c[i>>2]|0;if(!((h|0)!=0?(c[b+108>>2]|0)>=(h|0):0)){j=3}if((j|0)==3?(e=an(b)|0,(e|0)>=0):0){i=c[i>>2]|0;h=c[b+8>>2]|0;if((i|0)!=0?(f=c[b+4>>2]|0,g=i-(c[b+108>>2]|0)-1|0,(h-f|0)>(g|0)):0){c[b+100>>2]=f+g}else{c[b+100>>2]=h}f=c[b+4>>2]|0;if((h|0)!=0){j=b+108|0;c[j>>2]=h+1-f+(c[j>>2]|0)}b=f-1|0;if((d[b]|0|0)==(e|0)){j=e;return j|0}a[b]=e;j=e;return j|0}c[b+100>>2]=0;j=-1;return j|0}function Zm(a,b){a=+a;b=b|0;var d=0;if((b|0)>1023){a=a*8.98846567431158e+307;d=b-1023|0;if((d|0)>1023){b=b-2046|0;a=a*8.98846567431158e+307;b=(b|0)>1023?1023:b}else{b=d}}else{if((b|0)<-1022){a=a*2.2250738585072014e-308;d=b+1022|0;if((d|0)<-1022){b=b+2044|0;a=a*2.2250738585072014e-308;b=(b|0)<-1022?-1022:b}else{b=d}}}return+(a*(c[k>>2]=0<<20|0>>>12,c[k+4>>2]=b+1023<<20|0>>>12,+h[k>>3]))}function _m(a,b){a=+a;b=b|0;return+(+Zm(a,b))}function $m(b){b=b|0;var d=0,e=0,f=0;e=b+74|0;d=a[e]|0;a[e]=d-1&255|d;e=b+20|0;d=b+44|0;if((c[e>>2]|0)>>>0>(c[d>>2]|0)>>>0){qc[c[b+36>>2]&63](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[e>>2]=0;f=b|0;e=c[f>>2]|0;if((e&20|0)==0){f=c[d>>2]|0;c[b+8>>2]=f;c[b+4>>2]=f;f=0;return f|0}if((e&4|0)==0){f=-1;return f|0}c[f>>2]=e|32;f=-1;return f|0}function an(a){a=a|0;var b=0,e=0;b=i;i=i+8|0;e=b|0;if((c[a+8>>2]|0)==0?($m(a)|0)!=0:0){a=-1}else{if((qc[c[a+32>>2]&63](a,e,1)|0)==1){a=d[e]|0}else{a=-1}}i=b;return a|0}function bn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0,g=0,h=0;d=i;i=i+112|0;f=d|0;dn(f|0,0,112)|0;h=f+4|0;c[h>>2]=a;g=f+8|0;c[g>>2]=-1;c[f+44>>2]=a;c[f+76>>2]=-1;Xm(f,0);e=+Vm(f,2,1);f=(c[h>>2]|0)-(c[g>>2]|0)+(c[f+108>>2]|0)|0;if((b|0)==0){i=d;return+e}if((f|0)!=0){a=a+f|0}c[b>>2]=a;i=d;return+e}function cn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return qb(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function dn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function en(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{cn(b,c,d)|0}return b|0}function fn(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function gn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return(K=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function hn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b=b-d-(c>>>0>a>>>0|0)>>>0;return(K=b,a-c>>>0|0)|0}function jn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function kn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function ln(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function mn(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function nn(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function on(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;d=b&65535;c=ga(d,f)|0;e=a>>>16;d=(c>>>16)+(ga(d,e)|0)|0;b=b>>>16;a=ga(b,f)|0;return(K=(d>>>16)+(ga(b,e)|0)+(((d&65535)+a|0)>>>16)|0,d+a<<16|c&65535|0)|0}function pn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;a=hn(e^a,f^b,e,f)|0;b=K;e=g^e;f=h^f;g=hn((un(a,b,hn(g^c,h^d,g,h)|0,K,0)|0)^e,K^f,e,f)|0;return g|0}function qn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=hn(h^a,j^b,h,j)|0;b=K;un(a,b,hn(k^d,l^e,k,l)|0,K,f)|0;k=hn(c[f>>2]^h,c[f+4>>2]^j,h,j)|0;j=K;i=g;return(K=j,k)|0}function rn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;a=on(e,f)|0;c=K;return(K=(ga(b,f)|0)+(ga(d,e)|0)+c|c&0,a|0|0)|0}function sn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=un(a,b,c,d,0)|0;return a|0}function tn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+8|0;f=g|0;un(a,b,d,e,f)|0;i=g;return(K=c[f+4>>2]|0,c[f>>2]|0)|0}function un(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=a;j=b;i=j;k=d;g=e;l=g;if((i|0)==0){d=(f|0)!=0;if((l|0)==0){if(d){c[f>>2]=(h>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(h>>>0)/(k>>>0)>>>0;return(K=l,m)|0}else{if(!d){l=0;m=0;return(K=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;l=0;m=0;return(K=l,m)|0}}m=(l|0)==0;do{if((k|0)!=0){if(!m){k=(mn(l|0)|0)-(mn(i|0)|0)|0;if(k>>>0<=31){l=k+1|0;m=31-k|0;b=k-31>>31;j=l;a=h>>>(l>>>0)&b|i<<m;b=i>>>(l>>>0)&b;l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(K=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(K=l,m)|0}l=k-1|0;if((l&k|0)!=0){m=(mn(k|0)|0)+33-(mn(i|0)|0)|0;p=64-m|0;k=32-m|0;n=k>>31;o=m-32|0;b=o>>31;j=m;a=k-1>>31&i>>>(o>>>0)|(i<<k|h>>>(m>>>0))&b;b=b&i>>>(m>>>0);l=h<<p&n;i=(i<<p|h>>>(o>>>0))&n|h<<k&m-33>>31;break}if((f|0)!=0){c[f>>2]=l&h;c[f+4>>2]=0}if((k|0)==1){o=j|b&0;p=a|0|0;return(K=o,p)|0}else{p=nn(k|0)|0;o=i>>>(p>>>0)|0;p=i<<32-p|h>>>(p>>>0)|0;return(K=o,p)|0}}else{if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(k>>>0);c[f+4>>2]=0}o=0;p=(i>>>0)/(k>>>0)>>>0;return(K=o,p)|0}if((h|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}o=0;p=(i>>>0)/(l>>>0)>>>0;return(K=o,p)|0}k=l-1|0;if((k&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=k&i|b&0}o=0;p=i>>>((nn(l|0)|0)>>>0);return(K=o,p)|0}k=(mn(l|0)|0)-(mn(i|0)|0)|0;if(k>>>0<=30){b=k+1|0;p=31-k|0;j=b;a=i<<p|h>>>(b>>>0);b=i>>>(b>>>0);l=0;i=h<<p;break}if((f|0)==0){o=0;p=0;return(K=o,p)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;o=0;p=0;return(K=o,p)|0}}while(0);if((j|0)==0){m=a;d=0;a=0}else{d=d|0|0;g=g|e&0;e=gn(d,g,-1,-1)|0;h=K;k=b;m=a;a=0;while(1){b=l>>>31|i<<1;l=a|l<<1;i=m<<1|i>>>31|0;k=m>>>31|k<<1|0;hn(e,h,i,k)|0;m=K;p=m>>31|((m|0)<0?-1:0)<<1;a=p&1;m=hn(i,k,p&d,(((m|0)<0?-1:0)>>31|((m|0)<0?-1:0)<<1)&g)|0;k=K;j=j-1|0;if((j|0)==0){break}else{i=b}}i=b;b=k;d=0}g=0;if((f|0)!=0){c[f>>2]=m;c[f+4>>2]=b}o=(l|0)>>>31|(i|g)<<1|(g<<1|l>>>31)&0|d;p=(l<<1|0>>>31)&-2|a;return(K=o,p)|0}function vn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;lc[a&7](b|0,c|0,d|0,e|0,f|0)}function wn(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;mc[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function xn(a,b){a=a|0;b=b|0;nc[a&511](b|0)}function yn(a,b,c){a=a|0;b=b|0;c=c|0;oc[a&127](b|0,c|0)}function zn(a,b,c){a=a|0;b=b|0;c=c|0;return pc[a&63](b|0,c|0)|0}function An(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return qc[a&63](b|0,c|0,d|0)|0}function Bn(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;rc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function Cn(a,b){a=a|0;b=b|0;return sc[a&127](b|0)|0}function Dn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;tc[a&7](b|0,c|0,d|0)}function En(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;uc[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function Fn(a){a=a|0;vc[a&1]()}function Gn(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return wc[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function Hn(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;xc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function In(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;yc[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Jn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;zc[a&31](b|0,c|0,d|0,e|0,f|0,g|0)}function Kn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Ac[a&15](b|0,c|0,d|0,e|0)|0}function Ln(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return Bc[a&31](b|0,c|0,d|0,e|0,f|0)|0}function Mn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Cc[a&15](b|0,c|0,d|0,e|0)}function Nn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ha(0)}function On(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ha(1)}function Pn(a){a=a|0;ha(2)}function Qn(a,b){a=a|0;b=b|0;ha(3)}function Rn(a,b){a=a|0;b=b|0;ha(4);return 0}function Sn(a,b,c){a=a|0;b=b|0;c=c|0;ha(5);return 0}function Tn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ha(6)}function Un(a){a=a|0;ha(7);return 0}function Vn(a,b,c){a=a|0;b=b|0;c=c|0;ha(8)}function Wn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ha(9)}function Xn(){ha(10)}function Yn(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ha(11);return 0}function Zn(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ha(12)}function _n(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ha(13)}function $n(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ha(14)}function ao(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ha(15);return 0}function bo(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ha(16);return 0}function co(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ha(17)}



function jh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;l=i;i=i+80|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=l|0;p=l+8|0;n=l+24|0;m=l+48|0;o=l+56|0;d=l+64|0;k=l+72|0;r=t|0;a[r]=a[2480]|0;a[r+1|0]=a[2481]|0;a[r+2|0]=a[2482]|0;a[r+3|0]=a[2483]|0;a[r+4|0]=a[2484]|0;a[r+5|0]=a[2485]|0;u=t+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[u]=43;u=t+2|0}if((s&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;t=u+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=117}}while(0);s=p|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}r=fh(s,12,c[3016]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==32){p=h}else if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if((r|0)>1&q<<24>>24==48?(u=a[p+1|0]|0,(u<<24>>24|0)==120|(u<<24>>24|0)==88):0){p=p+2|0}else{j=22}}else{j=22}}while(0);if((j|0)==22){p=s}u=n|0;Ne(d,f);gh(s,p,h,u,m,o,d);Wd(c[d>>2]|0)|0;c[k>>2]=c[e>>2];hh(b,k,u,c[m>>2]|0,c[o>>2]|0,f,g);i=l;return}function kh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;o=i;i=i+112|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=o|0;q=o+8|0;d=o+32|0;l=o+80|0;m=o+88|0;p=o+96|0;n=o+104|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;u=u+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);t=q|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}j=fh(t,23,c[3016]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==32){q=h}else if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if((j|0)>1&r<<24>>24==48?(v=a[q+1|0]|0,(v<<24>>24|0)==120|(v<<24>>24|0)==88):0){q=q+2|0}else{k=22}}else{k=22}}while(0);if((k|0)==22){q=t}v=d|0;Ne(p,f);gh(t,q,h,v,l,m,p);Wd(c[p>>2]|0)|0;c[n>>2]=c[e>>2];hh(b,n,v,c[l>>2]|0,c[m>>2]|0,f,g);i=o;return}function lh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;n=i;i=i+152|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=n|0;t=n+8|0;p=n+40|0;r=n+48|0;o=n+112|0;d=n+120|0;m=n+128|0;l=n+136|0;k=n+144|0;c[u>>2]=37;c[u+4>>2]=0;w=u+1|0;s=f+4|0;x=c[s>>2]|0;if((x&2048|0)!=0){a[w]=43;w=u+2|0}if((x&1024|0)!=0){a[w]=35;w=w+1|0}v=x&260;y=x>>>14;do{if((v|0)==260){if((y&1|0)==0){a[w]=97;v=0;break}else{a[w]=65;v=0;break}}else{a[w]=46;x=w+2|0;a[w+1|0]=42;if((v|0)==4){if((y&1|0)==0){a[x]=102;v=1;break}else{a[x]=70;v=1;break}}else if((v|0)==256){if((y&1|0)==0){a[x]=101;v=1;break}else{a[x]=69;v=1;break}}else{if((y&1|0)==0){a[x]=103;v=1;break}else{a[x]=71;v=1;break}}}}while(0);t=t|0;c[p>>2]=t;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}w=c[3016]|0;if(v){x=fh(t,30,w,u,(y=i,i=i+16|0,c[y>>2]=c[f+8>>2],h[y+8>>3]=j,y)|0)|0;i=y}else{x=fh(t,30,w,u,(y=i,i=i+8|0,h[y>>3]=j,y)|0)|0;i=y}if((x|0)>29){w=(a[14168]|0)==0;if(v){if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(y=i,i=i+16|0,c[y>>2]=c[f+8>>2],h[y+8>>3]=j,y)|0)|0;i=y}else{if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(y=i,i=i+16|0,c[y>>2]=c[f+8>>2],h[y+8>>3]=j,y)|0)|0;i=y}v=c[p>>2]|0;if((v|0)==0){Um();w=c[p>>2]|0;u=w}else{u=v;w=v}}else{u=0;w=c[p>>2]|0}v=w+x|0;s=c[s>>2]&176;do{if((s|0)==32){s=v}else if((s|0)==16){s=a[w]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){s=w+1|0;break}if((x|0)>1&s<<24>>24==48?(y=a[w+1|0]|0,(y<<24>>24|0)==120|(y<<24>>24|0)==88):0){s=w+2|0}else{q=53}}else{q=53}}while(0);if((q|0)==53){s=w}if((w|0)!=(t|0)){r=Im(x<<1)|0;if((r|0)==0){Um();q=0;r=0;t=c[p>>2]|0}else{q=r;t=w}}else{q=r|0;r=0}Ne(m,f);nh(t,s,v,q,o,d,m);Wd(c[m>>2]|0)|0;x=e|0;c[k>>2]=c[x>>2];hh(l,k,q,c[o>>2]|0,c[d>>2]|0,f,g);y=c[l>>2]|0;c[x>>2]=y;c[b>>2]=y;if((r|0)!=0){Jm(r)}if((u|0)==0){i=n;return}Jm(u);i=n;return}function mh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;b=Rb(b|0)|0;d=dc(a|0,d|0,g|0)|0;if((b|0)==0){i=f;return d|0}Rb(b|0)|0;i=f;return d|0}function nh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;k=i;i=i+48|0;o=k|0;m=k+16|0;l=k+32|0;p=j|0;j=c[p>>2]|0;if(!((c[3402]|0)==-1)){c[m>>2]=13608;c[m+4>>2]=14;c[m+8>>2]=0;oe(13608,m,96)}q=(c[3403]|0)-1|0;m=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-m>>2>>>0>q>>>0)){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}j=c[m+(q<<2)>>2]|0;if((j|0)==0){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}m=j;p=c[p>>2]|0;if(!((c[3306]|0)==-1)){c[o>>2]=13224;c[o+4>>2]=14;c[o+8>>2]=0;oe(13224,o,96)}o=(c[3307]|0)-1|0;q=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-q>>2>>>0>o>>>0)){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}q=c[q+(o<<2)>>2]|0;if((q|0)==0){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}o=q;oc[c[(c[q>>2]|0)+20>>2]&127](l,o);c[h>>2]=f;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){C=pc[c[(c[j>>2]|0)+28>>2]&63](m,p)|0;v=c[h>>2]|0;c[h>>2]=v+1;a[v]=C;v=b+1|0}else{v=b}p=e;a:do{if(((p-v|0)>1?(a[v]|0)==48:0)?(r=v+1|0,C=a[r]|0,(C<<24>>24|0)==120|(C<<24>>24|0)==88):0){B=j;A=pc[c[(c[B>>2]|0)+28>>2]&63](m,48)|0;C=c[h>>2]|0;c[h>>2]=C+1;a[C]=A;v=v+2|0;B=pc[c[(c[B>>2]|0)+28>>2]&63](m,a[r]|0)|0;C=c[h>>2]|0;c[h>>2]=C+1;a[C]=B;if(v>>>0<e>>>0){t=v;while(1){r=a[t]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}w=t+1|0;if((Pa(r<<24>>24|0,c[3016]|0)|0)==0){r=v;break a}if(w>>>0<e>>>0){t=w}else{r=v;t=w;break}}}else{r=v;t=v}}else{u=21}}while(0);b:do{if((u|0)==21){if(v>>>0<e>>>0){t=v;while(1){r=a[t]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}u=t+1|0;if((db(r<<24>>24|0,c[3016]|0)|0)==0){r=v;break b}if(u>>>0<e>>>0){t=u}else{r=v;t=u;break}}}else{r=v;t=v}}}while(0);u=l;v=a[u]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[l+4>>2]|0}if((v|0)!=0){if((r|0)!=(t|0)?(s=t-1|0,s>>>0>r>>>0):0){v=r;do{C=a[v]|0;a[v]=a[s]|0;a[s]=C;v=v+1|0;s=s-1|0}while(v>>>0<s>>>0)}s=sc[c[(c[q>>2]|0)+16>>2]&127](o)|0;if(r>>>0<t>>>0){y=l+1|0;v=l+4|0;z=l+8|0;x=j;B=0;A=0;w=r;while(1){C=(a[u]&1)==0;if((a[(C?y:c[z>>2]|0)+A|0]|0)>0?(B|0)==(a[(C?y:c[z>>2]|0)+A|0]|0):0){B=c[h>>2]|0;c[h>>2]=B+1;a[B]=s;B=a[u]|0;if((B&1)==0){B=(B&255)>>>1}else{B=c[v>>2]|0}A=(A>>>0<(B-1|0)>>>0)+A|0;B=0}D=pc[c[(c[x>>2]|0)+28>>2]&63](m,a[w]|0)|0;C=c[h>>2]|0;c[h>>2]=C+1;a[C]=D;w=w+1|0;if(!(w>>>0<t>>>0)){break}else{B=B+1|0}}}r=f+(r-b)|0;s=c[h>>2]|0;if((r|0)!=(s|0)?(n=s-1|0,n>>>0>r>>>0):0){do{D=a[r]|0;a[r]=a[n]|0;a[n]=D;r=r+1|0;n=n-1|0}while(r>>>0<n>>>0)}}else{Ac[c[(c[j>>2]|0)+32>>2]&15](m,r,t,c[h>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+(t-r)}c:do{if(t>>>0<e>>>0){n=j;while(1){r=a[t]|0;if(r<<24>>24==46){break}C=pc[c[(c[n>>2]|0)+28>>2]&63](m,r)|0;D=c[h>>2]|0;c[h>>2]=D+1;a[D]=C;t=t+1|0;if(!(t>>>0<e>>>0)){break c}}C=sc[c[(c[q>>2]|0)+12>>2]&127](o)|0;D=c[h>>2]|0;c[h>>2]=D+1;a[D]=C;t=t+1|0}}while(0);Ac[c[(c[j>>2]|0)+32>>2]&15](m,t,e,c[h>>2]|0)|0;j=(c[h>>2]|0)+(p-t)|0;c[h>>2]=j;if((d|0)==(e|0)){D=j;c[g>>2]=D;te(l);i=k;return}D=f+(d-b)|0;c[g>>2]=D;te(l);i=k;return}function oh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;n=i;i=i+152|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=n|0;t=n+8|0;p=n+40|0;r=n+48|0;o=n+112|0;d=n+120|0;m=n+128|0;l=n+136|0;k=n+144|0;c[u>>2]=37;c[u+4>>2]=0;x=u+1|0;s=f+4|0;w=c[s>>2]|0;if((w&2048|0)!=0){a[x]=43;x=u+2|0}if((w&1024|0)!=0){a[x]=35;x=x+1|0}v=w&260;w=w>>>14;do{if((v|0)==260){a[x]=76;v=x+1|0;if((w&1|0)==0){a[v]=97;v=0;break}else{a[v]=65;v=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;x=x+3|0;if((v|0)==256){if((w&1|0)==0){a[x]=101;v=1;break}else{a[x]=69;v=1;break}}else if((v|0)==4){if((w&1|0)==0){a[x]=102;v=1;break}else{a[x]=70;v=1;break}}else{if((w&1|0)==0){a[x]=103;v=1;break}else{a[x]=71;v=1;break}}}}while(0);t=t|0;c[p>>2]=t;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}w=c[3016]|0;if(v){x=fh(t,30,w,u,(w=i,i=i+16|0,c[w>>2]=c[f+8>>2],h[w+8>>3]=j,w)|0)|0;i=w}else{x=fh(t,30,w,u,(w=i,i=i+8|0,h[w>>3]=j,w)|0)|0;i=w}if((x|0)>29){w=(a[14168]|0)==0;if(v){if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(w=i,i=i+16|0,c[w>>2]=c[f+8>>2],h[w+8>>3]=j,w)|0)|0;i=w}else{if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(w=i,i=i+8|0,h[w>>3]=j,w)|0)|0;i=w}v=c[p>>2]|0;if((v|0)==0){Um();w=c[p>>2]|0;u=w}else{u=v;w=v}}else{u=0;w=c[p>>2]|0}v=w+x|0;s=c[s>>2]&176;do{if((s|0)==32){s=v}else if((s|0)==16){s=a[w]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){s=w+1|0;break}if((x|0)>1&s<<24>>24==48?(s=a[w+1|0]|0,(s<<24>>24|0)==120|(s<<24>>24|0)==88):0){s=w+2|0}else{q=53}}else{q=53}}while(0);if((q|0)==53){s=w}if((w|0)!=(t|0)){r=Im(x<<1)|0;if((r|0)==0){Um();q=0;r=0;t=c[p>>2]|0}else{q=r;t=w}}else{q=r|0;r=0}Ne(m,f);nh(t,s,v,q,o,d,m);Wd(c[m>>2]|0)|0;w=e|0;c[k>>2]=c[w>>2];hh(l,k,q,c[o>>2]|0,c[d>>2]|0,f,g);x=c[l>>2]|0;c[w>>2]=x;c[b>>2]=x;if((r|0)!=0){Jm(r)}if((u|0)==0){i=n;return}Jm(u);i=n;return}function ph(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+104|0;o=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[o>>2];o=j|0;k=j+24|0;m=j+48|0;s=j+88|0;d=j+96|0;p=j+16|0;a[p]=a[2488]|0;a[p+1|0]=a[2489]|0;a[p+2|0]=a[2490]|0;a[p+3|0]=a[2491]|0;a[p+4|0]=a[2492]|0;a[p+5|0]=a[2493]|0;n=k|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}p=fh(n,20,c[3016]|0,p,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;h=k+p|0;q=c[f+4>>2]&176;do{if((q|0)==32){q=h}else if((q|0)==16){q=a[n]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){q=k+1|0;break}if((p|0)>1&q<<24>>24==48?(u=a[k+1|0]|0,(u<<24>>24|0)==120|(u<<24>>24|0)==88):0){q=k+2|0}else{r=12}}else{r=12}}while(0);if((r|0)==12){q=n}r=m|0;Ne(s,f);t=s|0;s=c[t>>2]|0;if(!((c[3402]|0)==-1)){c[o>>2]=13608;c[o+4>>2]=14;c[o+8>>2]=0;oe(13608,o,96)}o=(c[3403]|0)-1|0;u=c[s+8>>2]|0;if((c[s+12>>2]|0)-u>>2>>>0>o>>>0?(l=c[u+(o<<2)>>2]|0,(l|0)!=0):0){Wd(c[t>>2]|0)|0;Ac[c[(c[l>>2]|0)+32>>2]&15](l,n,h,r)|0;l=m+p|0;if((q|0)==(h|0)){u=l;s=e|0;s=c[s>>2]|0;t=d|0;c[t>>2]=s;hh(b,d,r,u,l,f,g);i=j;return}u=m+(q-k)|0;s=e|0;s=c[s>>2]|0;t=d|0;c[t>>2]=s;hh(b,d,r,u,l,f,g);i=j;return}u=cc(4)|0;nm(u);zb(u|0,8296,130)}function qh(a){a=a|0;Ud(a|0);Pm(a);return}function rh(a){a=a|0;Ud(a|0);return}function sh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+48|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=j|0;n=j+16|0;o=j+24|0;k=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[n>>2]=c[e>>2];zc[o&31](b,d,n,f,g,h&1);i=j;return}Ne(o,f);n=o|0;f=c[n>>2]|0;if(!((c[3304]|0)==-1)){c[m>>2]=13216;c[m+4>>2]=14;c[m+8>>2]=0;oe(13216,m,96)}m=(c[3305]|0)-1|0;d=c[f+8>>2]|0;if((c[f+12>>2]|0)-d>>2>>>0>m>>>0?(l=c[d+(m<<2)>>2]|0,(l|0)!=0):0){m=l;Wd(c[n>>2]|0)|0;l=c[l>>2]|0;if(h){oc[c[l+24>>2]&127](k,m)}else{oc[c[l+28>>2]&127](k,m)}m=k;f=a[m]|0;if((f&1)==0){l=k+4|0;n=l;h=k+8|0}else{h=k+8|0;n=c[h>>2]|0;l=k+4|0}e=e|0;while(1){if((f&1)==0){f=(f&255)>>>1;d=l}else{f=c[l>>2]|0;d=c[h>>2]|0}if((n|0)==(d+(f<<2)|0)){break}f=c[n>>2]|0;d=c[e>>2]|0;if((d|0)!=0){o=d+24|0;g=c[o>>2]|0;if((g|0)==(c[d+28>>2]|0)){f=pc[c[(c[d>>2]|0)+52>>2]&63](d,f)|0}else{c[o>>2]=g+4;c[g>>2]=f}if((f|0)==-1){c[e>>2]=0}}n=n+4|0;f=a[m]|0}c[b>>2]=c[e>>2];Ee(k);i=j;return}g=cc(4)|0;nm(g);zb(g|0,8296,130)}function th(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;l=i;i=i+144|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=l|0;p=l+8|0;d=l+24|0;o=l+112|0;k=l+120|0;n=l+128|0;m=l+136|0;r=t|0;a[r]=a[2480]|0;a[r+1|0]=a[2481]|0;a[r+2|0]=a[2482]|0;a[r+3|0]=a[2483]|0;a[r+4|0]=a[2484]|0;a[r+5|0]=a[2485]|0;u=t+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[u]=43;u=t+2|0}if((s&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;t=u+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=100}}while(0);s=p|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}r=fh(s,12,c[3016]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if((r|0)>1&q<<24>>24==48?(u=a[p+1|0]|0,(u<<24>>24|0)==120|(u<<24>>24|0)==88):0){p=p+2|0}else{j=22}}else if((q|0)==32){p=h}else{j=22}}while(0);if((j|0)==22){p=s}u=d|0;Ne(n,f);uh(s,p,h,u,o,k,n);Wd(c[n>>2]|0)|0;c[m>>2]=c[e>>2];vh(b,m,u,c[o>>2]|0,c[k>>2]|0,f,g);i=l;return}function uh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;l=i;i=i+48|0;n=l|0;q=l+16|0;k=l+32|0;o=j|0;j=c[o>>2]|0;if(!((c[3400]|0)==-1)){c[q>>2]=13600;c[q+4>>2]=14;c[q+8>>2]=0;oe(13600,q,96)}s=(c[3401]|0)-1|0;q=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-q>>2>>>0>s>>>0)){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}q=c[q+(s<<2)>>2]|0;if((q|0)==0){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}j=q;o=c[o>>2]|0;if(!((c[3304]|0)==-1)){c[n>>2]=13216;c[n+4>>2]=14;c[n+8>>2]=0;oe(13216,n,96)}n=(c[3305]|0)-1|0;s=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-s>>2>>>0>n>>>0)){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}s=c[s+(n<<2)>>2]|0;if((s|0)==0){x=cc(4)|0;w=x;nm(w);zb(x|0,8296,130)}t=s;oc[c[(c[s>>2]|0)+20>>2]&127](k,t);n=k;o=a[n]|0;if((o&1)==0){o=(o&255)>>>1}else{o=c[k+4>>2]|0}if((o|0)!=0){c[h>>2]=f;o=a[b]|0;if((o<<24>>24|0)==45|(o<<24>>24|0)==43){x=pc[c[(c[q>>2]|0)+44>>2]&63](j,o)|0;o=c[h>>2]|0;c[h>>2]=o+4;c[o>>2]=x;o=b+1|0}else{o=b}if(((e-o|0)>1?(a[o]|0)==48:0)?(r=o+1|0,x=a[r]|0,(x<<24>>24|0)==120|(x<<24>>24|0)==88):0){w=q;v=pc[c[(c[w>>2]|0)+44>>2]&63](j,48)|0;x=c[h>>2]|0;c[h>>2]=x+4;c[x>>2]=v;w=pc[c[(c[w>>2]|0)+44>>2]&63](j,a[r]|0)|0;x=c[h>>2]|0;c[h>>2]=x+4;c[x>>2]=w;o=o+2|0}if((o|0)!=(e|0)?(p=e-1|0,p>>>0>o>>>0):0){r=o;do{x=a[r]|0;a[r]=a[p]|0;a[p]=x;r=r+1|0;p=p-1|0}while(r>>>0<p>>>0)}r=sc[c[(c[s>>2]|0)+16>>2]&127](t)|0;if(o>>>0<e>>>0){p=k+1|0;t=k+4|0;s=k+8|0;w=0;v=0;u=o;while(1){x=(a[n]&1)==0;if((a[(x?p:c[s>>2]|0)+v|0]|0)!=0?(w|0)==(a[(x?p:c[s>>2]|0)+v|0]|0):0){w=c[h>>2]|0;c[h>>2]=w+4;c[w>>2]=r;w=a[n]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[t>>2]|0}v=(v>>>0<(w-1|0)>>>0)+v|0;w=0}z=pc[c[(c[q>>2]|0)+44>>2]&63](j,a[u]|0)|0;y=c[h>>2]|0;x=y+4|0;c[h>>2]=x;c[y>>2]=z;u=u+1|0;if(u>>>0<e>>>0){w=w+1|0}else{break}}}else{x=c[h>>2]|0}h=f+(o-b<<2)|0;if((h|0)!=(x|0)?(m=x-4|0,m>>>0>h>>>0):0){do{z=c[h>>2]|0;c[h>>2]=c[m>>2];c[m>>2]=z;h=h+4|0;m=m-4|0}while(h>>>0<m>>>0)}}else{Ac[c[(c[q>>2]|0)+48>>2]&15](j,b,e,f)|0;x=f+(e-b<<2)|0;c[h>>2]=x}if((d|0)==(e|0)){z=x;c[g>>2]=z;te(k);i=l;return}z=f+(d-b<<2)|0;c[g>>2]=z;te(k);i=l;return}function vh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;i=i+16|0;m=d;l=i;i=i+4|0;i=i+7&-8;c[l>>2]=c[m>>2];m=k|0;l=l|0;d=c[l>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=e;o=g-n>>2;h=h+12|0;p=c[h>>2]|0;p=(p|0)>(o|0)?p-o|0:0;o=f;q=o-n|0;n=q>>2;if((q|0)>0?(qc[c[(c[d>>2]|0)+48>>2]&63](d,e,n)|0)!=(n|0):0){c[l>>2]=0;c[b>>2]=0;i=k;return}do{if((p|0)>0){De(m,p,j);if((a[m]&1)==0){e=m+4|0}else{e=c[m+8>>2]|0}if((qc[c[(c[d>>2]|0)+48>>2]&63](d,e,p)|0)==(p|0)){Ee(m);break}c[l>>2]=0;c[b>>2]=0;Ee(m);i=k;return}}while(0);q=g-o|0;m=q>>2;if((q|0)>0?(qc[c[(c[d>>2]|0)+48>>2]&63](d,f,m)|0)!=(m|0):0){c[l>>2]=0;c[b>>2]=0;i=k;return}c[h>>2]=0;c[b>>2]=d;i=k;return}function wh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;m=i;i=i+232|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=m|0;q=m+8|0;n=m+32|0;o=m+200|0;p=m+208|0;d=m+216|0;l=m+224|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;u=u+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);t=q|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}j=fh(t,22,c[3016]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==32){q=h}else if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if((j|0)>1&r<<24>>24==48?(v=a[q+1|0]|0,(v<<24>>24|0)==120|(v<<24>>24|0)==88):0){q=q+2|0}else{k=22}}else{k=22}}while(0);if((k|0)==22){q=t}v=n|0;Ne(d,f);uh(t,q,h,v,o,p,d);Wd(c[d>>2]|0)|0;c[l>>2]=c[e>>2];vh(b,l,v,c[o>>2]|0,c[p>>2]|0,f,g);i=m;return}function xh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;l=i;i=i+144|0;t=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[t>>2];t=l|0;p=l+8|0;d=l+24|0;o=l+112|0;k=l+120|0;n=l+128|0;m=l+136|0;r=t|0;a[r]=a[2480]|0;a[r+1|0]=a[2481]|0;a[r+2|0]=a[2482]|0;a[r+3|0]=a[2483]|0;a[r+4|0]=a[2484]|0;a[r+5|0]=a[2485]|0;u=t+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[u]=43;u=t+2|0}if((s&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;t=u+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=117}}while(0);s=p|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}r=fh(s,12,c[3016]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if((r|0)>1&q<<24>>24==48?(u=a[p+1|0]|0,(u<<24>>24|0)==120|(u<<24>>24|0)==88):0){p=p+2|0}else{j=22}}else if((q|0)==32){p=h}else{j=22}}while(0);if((j|0)==22){p=s}u=d|0;Ne(n,f);uh(s,p,h,u,o,k,n);Wd(c[n>>2]|0)|0;c[m>>2]=c[e>>2];vh(b,m,u,c[o>>2]|0,c[k>>2]|0,f,g);i=l;return}function yh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;m=i;i=i+240|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=m|0;q=m+8|0;n=m+32|0;o=m+208|0;p=m+216|0;d=m+224|0;l=m+232|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;u=u+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);t=q|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}j=fh(t,23,c[3016]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==32){q=h}else if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if((j|0)>1&r<<24>>24==48?(v=a[q+1|0]|0,(v<<24>>24|0)==120|(v<<24>>24|0)==88):0){q=q+2|0}else{k=22}}else{k=22}}while(0);if((k|0)==22){q=t}v=n|0;Ne(d,f);uh(t,q,h,v,o,p,d);Wd(c[d>>2]|0)|0;c[l>>2]=c[e>>2];vh(b,l,v,c[o>>2]|0,c[p>>2]|0,f,g);i=m;return}function zh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;n=i;i=i+320|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=n|0;t=n+8|0;p=n+40|0;r=n+48|0;o=n+280|0;d=n+288|0;m=n+296|0;l=n+304|0;k=n+312|0;c[u>>2]=37;c[u+4>>2]=0;w=u+1|0;s=f+4|0;x=c[s>>2]|0;if((x&2048|0)!=0){a[w]=43;w=u+2|0}if((x&1024|0)!=0){a[w]=35;w=w+1|0}v=x&260;y=x>>>14;do{if((v|0)==260){if((y&1|0)==0){a[w]=97;v=0;break}else{a[w]=65;v=0;break}}else{a[w]=46;x=w+2|0;a[w+1|0]=42;if((v|0)==4){if((y&1|0)==0){a[x]=102;v=1;break}else{a[x]=70;v=1;break}}else if((v|0)==256){if((y&1|0)==0){a[x]=101;v=1;break}else{a[x]=69;v=1;break}}else{if((y&1|0)==0){a[x]=103;v=1;break}else{a[x]=71;v=1;break}}}}while(0);t=t|0;c[p>>2]=t;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}w=c[3016]|0;if(v){x=fh(t,30,w,u,(y=i,i=i+16|0,c[y>>2]=c[f+8>>2],h[y+8>>3]=j,y)|0)|0;i=y}else{x=fh(t,30,w,u,(y=i,i=i+8|0,h[y>>3]=j,y)|0)|0;i=y}if((x|0)>29){w=(a[14168]|0)==0;if(v){if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(y=i,i=i+16|0,c[y>>2]=c[f+8>>2],h[y+8>>3]=j,y)|0)|0;i=y}else{if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(y=i,i=i+16|0,c[y>>2]=c[f+8>>2],h[y+8>>3]=j,y)|0)|0;i=y}v=c[p>>2]|0;if((v|0)==0){Um();w=c[p>>2]|0;u=w}else{u=v;w=v}}else{u=0;w=c[p>>2]|0}v=w+x|0;s=c[s>>2]&176;do{if((s|0)==16){s=a[w]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){s=w+1|0;break}if((x|0)>1&s<<24>>24==48?(y=a[w+1|0]|0,(y<<24>>24|0)==120|(y<<24>>24|0)==88):0){s=w+2|0}else{q=53}}else if((s|0)==32){s=v}else{q=53}}while(0);if((q|0)==53){s=w}if((w|0)!=(t|0)){y=Im(x<<3)|0;r=y;if((y|0)==0){Um();q=r;t=c[p>>2]|0}else{q=r;t=w}}else{q=r|0;r=0}Ne(m,f);Ah(t,s,v,q,o,d,m);Wd(c[m>>2]|0)|0;x=e|0;c[k>>2]=c[x>>2];vh(l,k,q,c[o>>2]|0,c[d>>2]|0,f,g);y=c[l>>2]|0;c[x>>2]=y;c[b>>2]=y;if((r|0)!=0){Jm(r)}if((u|0)==0){i=n;return}Jm(u);i=n;return}function Ah(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;l=i;i=i+48|0;n=l|0;m=l+16|0;k=l+32|0;p=j|0;j=c[p>>2]|0;if(!((c[3400]|0)==-1)){c[m>>2]=13600;c[m+4>>2]=14;c[m+8>>2]=0;oe(13600,m,96)}m=(c[3401]|0)-1|0;q=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-q>>2>>>0>m>>>0)){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}m=c[q+(m<<2)>>2]|0;if((m|0)==0){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}j=m;p=c[p>>2]|0;if(!((c[3304]|0)==-1)){c[n>>2]=13216;c[n+4>>2]=14;c[n+8>>2]=0;oe(13216,n,96)}n=(c[3305]|0)-1|0;q=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-q>>2>>>0>n>>>0)){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}q=c[q+(n<<2)>>2]|0;if((q|0)==0){C=cc(4)|0;B=C;nm(B);zb(C|0,8296,130)}p=q;oc[c[(c[q>>2]|0)+20>>2]&127](k,p);c[h>>2]=f;n=a[b]|0;if((n<<24>>24|0)==45|(n<<24>>24|0)==43){C=pc[c[(c[m>>2]|0)+44>>2]&63](j,n)|0;v=c[h>>2]|0;c[h>>2]=v+4;c[v>>2]=C;v=b+1|0}else{v=b}n=e;a:do{if(((n-v|0)>1?(a[v]|0)==48:0)?(r=v+1|0,C=a[r]|0,(C<<24>>24|0)==120|(C<<24>>24|0)==88):0){B=m;A=pc[c[(c[B>>2]|0)+44>>2]&63](j,48)|0;C=c[h>>2]|0;c[h>>2]=C+4;c[C>>2]=A;v=v+2|0;B=pc[c[(c[B>>2]|0)+44>>2]&63](j,a[r]|0)|0;C=c[h>>2]|0;c[h>>2]=C+4;c[C>>2]=B;if(v>>>0<e>>>0){r=v;while(1){s=a[r]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}w=r+1|0;if((Pa(s<<24>>24|0,c[3016]|0)|0)==0){s=v;break a}if(w>>>0<e>>>0){r=w}else{s=v;r=w;break}}}else{s=v;r=v}}else{u=21}}while(0);b:do{if((u|0)==21){if(v>>>0<e>>>0){r=v;while(1){s=a[r]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}u=r+1|0;if((db(s<<24>>24|0,c[3016]|0)|0)==0){s=v;break b}if(u>>>0<e>>>0){r=u}else{s=v;r=u;break}}}else{s=v;r=v}}}while(0);u=k;v=a[u]|0;if((v&1)==0){v=(v&255)>>>1}else{v=c[k+4>>2]|0}if((v|0)!=0){if((s|0)!=(r|0)?(t=r-1|0,t>>>0>s>>>0):0){v=s;do{C=a[v]|0;a[v]=a[t]|0;a[t]=C;v=v+1|0;t=t-1|0}while(v>>>0<t>>>0)}w=sc[c[(c[q>>2]|0)+16>>2]&127](p)|0;if(s>>>0<r>>>0){y=k+1|0;t=k+4|0;x=k+8|0;v=m;B=0;A=0;z=s;while(1){C=(a[u]&1)==0;if((a[(C?y:c[x>>2]|0)+A|0]|0)>0?(B|0)==(a[(C?y:c[x>>2]|0)+A|0]|0):0){B=c[h>>2]|0;c[h>>2]=B+4;c[B>>2]=w;B=a[u]|0;if((B&1)==0){B=(B&255)>>>1}else{B=c[t>>2]|0}A=(A>>>0<(B-1|0)>>>0)+A|0;B=0}E=pc[c[(c[v>>2]|0)+44>>2]&63](j,a[z]|0)|0;D=c[h>>2]|0;C=D+4|0;c[h>>2]=C;c[D>>2]=E;z=z+1|0;if(z>>>0<r>>>0){B=B+1|0}else{break}}}else{C=c[h>>2]|0}s=f+(s-b<<2)|0;if((s|0)!=(C|0)?(o=C-4|0,o>>>0>s>>>0):0){do{E=c[s>>2]|0;c[s>>2]=c[o>>2];c[o>>2]=E;s=s+4|0;o=o-4|0}while(s>>>0<o>>>0)}}else{Ac[c[(c[m>>2]|0)+48>>2]&15](j,s,r,c[h>>2]|0)|0;C=(c[h>>2]|0)+(r-s<<2)|0;c[h>>2]=C}c:do{if(r>>>0<e>>>0){o=m;while(1){s=a[r]|0;if(s<<24>>24==46){break}D=pc[c[(c[o>>2]|0)+44>>2]&63](j,s)|0;E=c[h>>2]|0;C=E+4|0;c[h>>2]=C;c[E>>2]=D;r=r+1|0;if(!(r>>>0<e>>>0)){break c}}D=sc[c[(c[q>>2]|0)+12>>2]&127](p)|0;E=c[h>>2]|0;C=E+4|0;c[h>>2]=C;c[E>>2]=D;r=r+1|0}}while(0);Ac[c[(c[m>>2]|0)+48>>2]&15](j,r,e,C)|0;j=(c[h>>2]|0)+(n-r<<2)|0;c[h>>2]=j;if((d|0)==(e|0)){E=j;c[g>>2]=E;te(k);i=l;return}E=f+(d-b<<2)|0;c[g>>2]=E;te(k);i=l;return}function Bh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;n=i;i=i+320|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=n|0;t=n+8|0;p=n+40|0;r=n+48|0;o=n+280|0;d=n+288|0;m=n+296|0;l=n+304|0;k=n+312|0;c[u>>2]=37;c[u+4>>2]=0;x=u+1|0;s=f+4|0;w=c[s>>2]|0;if((w&2048|0)!=0){a[x]=43;x=u+2|0}if((w&1024|0)!=0){a[x]=35;x=x+1|0}v=w&260;w=w>>>14;do{if((v|0)==260){a[x]=76;v=x+1|0;if((w&1|0)==0){a[v]=97;v=0;break}else{a[v]=65;v=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;x=x+3|0;if((v|0)==4){if((w&1|0)==0){a[x]=102;v=1;break}else{a[x]=70;v=1;break}}else if((v|0)==256){if((w&1|0)==0){a[x]=101;v=1;break}else{a[x]=69;v=1;break}}else{if((w&1|0)==0){a[x]=103;v=1;break}else{a[x]=71;v=1;break}}}}while(0);t=t|0;c[p>>2]=t;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}w=c[3016]|0;if(v){x=fh(t,30,w,u,(w=i,i=i+16|0,c[w>>2]=c[f+8>>2],h[w+8>>3]=j,w)|0)|0;i=w}else{x=fh(t,30,w,u,(w=i,i=i+8|0,h[w>>3]=j,w)|0)|0;i=w}if((x|0)>29){w=(a[14168]|0)==0;if(v){if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(w=i,i=i+16|0,c[w>>2]=c[f+8>>2],h[w+8>>3]=j,w)|0)|0;i=w}else{if(w?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}x=mh(p,c[3016]|0,u,(w=i,i=i+8|0,h[w>>3]=j,w)|0)|0;i=w}v=c[p>>2]|0;if((v|0)==0){Um();w=c[p>>2]|0;u=w}else{u=v;w=v}}else{u=0;w=c[p>>2]|0}v=w+x|0;s=c[s>>2]&176;do{if((s|0)==32){s=v}else if((s|0)==16){s=a[w]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){s=w+1|0;break}if((x|0)>1&s<<24>>24==48?(s=a[w+1|0]|0,(s<<24>>24|0)==120|(s<<24>>24|0)==88):0){s=w+2|0}else{q=53}}else{q=53}}while(0);if((q|0)==53){s=w}if((w|0)!=(t|0)){x=Im(x<<3)|0;r=x;if((x|0)==0){Um();q=r;t=c[p>>2]|0}else{q=r;t=w}}else{q=r|0;r=0}Ne(m,f);Ah(t,s,v,q,o,d,m);Wd(c[m>>2]|0)|0;w=e|0;c[k>>2]=c[w>>2];vh(l,k,q,c[o>>2]|0,c[d>>2]|0,f,g);x=c[l>>2]|0;c[w>>2]=x;c[b>>2]=x;if((r|0)!=0){Jm(r)}if((u|0)==0){i=n;return}Jm(u);i=n;return}function Ch(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+216|0;p=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[p>>2];p=j|0;k=j+24|0;l=j+48|0;s=j+200|0;d=j+208|0;o=j+16|0;a[o]=a[2488]|0;a[o+1|0]=a[2489]|0;a[o+2|0]=a[2490]|0;a[o+3|0]=a[2491]|0;a[o+4|0]=a[2492]|0;a[o+5|0]=a[2493]|0;n=k|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}o=fh(n,20,c[3016]|0,o,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;h=k+o|0;q=c[f+4>>2]&176;do{if((q|0)==32){q=h}else if((q|0)==16){q=a[n]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){q=k+1|0;break}if((o|0)>1&q<<24>>24==48?(t=a[k+1|0]|0,(t<<24>>24|0)==120|(t<<24>>24|0)==88):0){q=k+2|0}else{r=12}}else{r=12}}while(0);if((r|0)==12){q=n}Ne(s,f);s=s|0;r=c[s>>2]|0;if(!((c[3400]|0)==-1)){c[p>>2]=13600;c[p+4>>2]=14;c[p+8>>2]=0;oe(13600,p,96)}t=(c[3401]|0)-1|0;p=c[r+8>>2]|0;if((c[r+12>>2]|0)-p>>2>>>0>t>>>0?(m=c[p+(t<<2)>>2]|0,(m|0)!=0):0){Wd(c[s>>2]|0)|0;p=l|0;Ac[c[(c[m>>2]|0)+48>>2]&15](m,n,h,p)|0;m=l+(o<<2)|0;if((q|0)==(h|0)){t=m;r=e|0;r=c[r>>2]|0;s=d|0;c[s>>2]=r;vh(b,d,p,t,m,f,g);i=j;return}t=l+(q-k<<2)|0;r=e|0;r=c[r>>2]|0;s=d|0;c[s>>2]=r;vh(b,d,p,t,m,f,g);i=j;return}t=cc(4)|0;nm(t);zb(t|0,8296,130)}function Dh(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;o=i;i=i+48|0;v=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[v>>2];v=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[v>>2];v=o|0;u=o+16|0;q=o+24|0;p=o+32|0;s=o+40|0;Ne(u,h);u=u|0;t=c[u>>2]|0;if(!((c[3402]|0)==-1)){c[v>>2]=13608;c[v+4>>2]=14;c[v+8>>2]=0;oe(13608,v,96)}v=(c[3403]|0)-1|0;w=c[t+8>>2]|0;if((c[t+12>>2]|0)-w>>2>>>0>v>>>0?(y=c[w+(v<<2)>>2]|0,(y|0)!=0):0){t=y;Wd(c[u>>2]|0)|0;c[j>>2]=0;w=f|0;a:do{if((l|0)!=(m|0)){v=g|0;x=y;u=y+8|0;z=e;C=p|0;B=s|0;A=q|0;D=0;b:while(1){while(1){if((D|0)!=0){n=67;break a}D=c[w>>2]|0;if((D|0)!=0){if((c[D+12>>2]|0)==(c[D+16>>2]|0)?(sc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1:0){c[w>>2]=0;D=0}}else{D=0}F=(D|0)==0;E=c[v>>2]|0;do{if((E|0)!=0){if((c[E+12>>2]|0)==(c[E+16>>2]|0)?(sc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1:0){c[v>>2]=0;n=20;break}if(!F){n=21;break b}}else{n=20}}while(0);if((n|0)==20){n=0;if(F){n=21;break b}else{E=0}}if((qc[c[(c[x>>2]|0)+36>>2]&63](t,a[l]|0,0)|0)<<24>>24==37){n=24;break}F=a[l]|0;if(F<<24>>24>-1?(r=c[u>>2]|0,!((b[r+(F<<24>>24<<1)>>1]&8192)==0)):0){n=35;break}E=D+12|0;G=c[E>>2]|0;F=D+16|0;if((G|0)==(c[F>>2]|0)){G=(sc[c[(c[D>>2]|0)+36>>2]&127](D)|0)&255}else{G=a[G]|0}I=pc[c[(c[y>>2]|0)+12>>2]&63](t,G)|0;if(I<<24>>24==(pc[c[(c[y>>2]|0)+12>>2]&63](t,a[l]|0)|0)<<24>>24){n=62;break}c[j>>2]=4;D=4}c:do{if((n|0)==24){n=0;F=l+1|0;if((F|0)==(m|0)){n=25;break b}G=qc[c[(c[x>>2]|0)+36>>2]&63](t,a[F]|0,0)|0;if((G<<24>>24|0)==69|(G<<24>>24|0)==48){F=l+2|0;if((F|0)==(m|0)){n=28;break b}l=G;G=qc[c[(c[x>>2]|0)+36>>2]&63](t,a[F]|0,0)|0}else{l=0}I=c[(c[z>>2]|0)+36>>2]|0;c[C>>2]=D;c[B>>2]=E;xc[I&7](q,e,p,s,h,j,k,G,l);c[w>>2]=c[A>>2];l=F+1|0}else if((n|0)==35){while(1){n=0;l=l+1|0;if((l|0)==(m|0)){l=m;break}F=a[l]|0;if(!(F<<24>>24>-1)){break}if((b[r+(F<<24>>24<<1)>>1]&8192)==0){break}else{n=35}}G=E;F=E;while(1){if((D|0)!=0){if((c[D+12>>2]|0)==(c[D+16>>2]|0)?(sc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1:0){c[w>>2]=0;D=0}}else{D=0}E=(D|0)==0;do{if((G|0)!=0){if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(E){E=G;break}else{break c}}if(!((sc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1)){if(E^(F|0)==0){E=F;break}else{break c}}else{c[v>>2]=0;F=0;n=48;break}}else{n=48}}while(0);if((n|0)==48){n=0;if(E){break c}else{E=0}}H=D+12|0;I=c[H>>2]|0;G=D+16|0;if((I|0)==(c[G>>2]|0)){I=(sc[c[(c[D>>2]|0)+36>>2]&127](D)|0)&255}else{I=a[I]|0}if(!(I<<24>>24>-1)){break c}if((b[(c[u>>2]|0)+(I<<24>>24<<1)>>1]&8192)==0){break c}I=c[H>>2]|0;if((I|0)==(c[G>>2]|0)){sc[c[(c[D>>2]|0)+40>>2]&127](D)|0;G=E;continue}else{c[H>>2]=I+1;G=E;continue}}}else if((n|0)==62){n=0;G=c[E>>2]|0;if((G|0)==(c[F>>2]|0)){sc[c[(c[D>>2]|0)+40>>2]&127](D)|0}else{c[E>>2]=G+1}l=l+1|0}}while(0);if((l|0)==(m|0)){n=67;break a}D=c[j>>2]|0}if((n|0)==21){c[j>>2]=4;break}else if((n|0)==25){c[j>>2]=4;break}else if((n|0)==28){c[j>>2]=4;break}}else{n=67}}while(0);if((n|0)==67){D=c[w>>2]|0}f=f|0;if((D|0)!=0){if((c[D+12>>2]|0)==(c[D+16>>2]|0)?(sc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1:0){c[f>>2]=0;D=0}}else{D=0}f=(D|0)==0;g=g|0;m=c[g>>2]|0;do{if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)?(sc[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1:0){c[g>>2]=0;n=77;break}if(f){I=d|0;c[I>>2]=D;i=o;return}}else{n=77}}while(0);if((n|0)==77?!f:0){I=d|0;c[I>>2]=D;i=o;return}c[j>>2]=c[j>>2]|2;I=d|0;c[I>>2]=D;i=o;return}I=cc(4)|0;nm(I);zb(I|0,8296,130)}function Eh(a){a=a|0;Ud(a|0);Pm(a);return}function Fh(a){a=a|0;Ud(a|0);return}function Gh(a){a=a|0;return 2}function Hh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;m=d;l=i;i=i+4|0;i=i+7&-8;c[l>>2]=c[m>>2];m=e;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[m>>2];e=j|0;d=j+8|0;c[e>>2]=c[l>>2];c[d>>2]=c[k>>2];Dh(a,b,e,d,f,g,h,2472,2480);i=j;return}function Ih(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0;k=i;i=i+16|0;l=e;n=i;i=i+4|0;i=i+7&-8;c[n>>2]=c[l>>2];l=f;m=i;i=i+4|0;i=i+7&-8;c[m>>2]=c[l>>2];f=k|0;e=k+8|0;l=d+8|0;l=sc[c[(c[l>>2]|0)+20>>2]&127](l)|0;c[f>>2]=c[n>>2];c[e>>2]=c[m>>2];m=a[l]|0;if((m&1)==0){m=(m&255)>>>1;n=l+1|0;l=l+1|0}else{o=c[l+8>>2]|0;m=c[l+4>>2]|0;n=o;l=o}Dh(b,d,f,e,g,h,j,n,l+m|0);i=k;return}function Jh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+32|0;l=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[l>>2];l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=j|0;n=j+8|0;m=j+24|0;Ne(m,f);m=m|0;f=c[m>>2]|0;if(!((c[3402]|0)==-1)){c[n>>2]=13608;c[n+4>>2]=14;c[n+8>>2]=0;oe(13608,n,96)}n=(c[3403]|0)-1|0;o=c[f+8>>2]|0;if((c[f+12>>2]|0)-o>>2>>>0>n>>>0?(k=c[o+(n<<2)>>2]|0,(k|0)!=0):0){Wd(c[m>>2]|0)|0;o=c[e>>2]|0;e=b+8|0;e=sc[c[c[e>>2]>>2]&127](e)|0;c[l>>2]=o;e=(dg(d,l,e,e+168|0,k,g,0)|0)-e|0;if((e|0)>=168){n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}c[h+24>>2]=((e|0)/12|0|0)%7|0;n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}o=cc(4)|0;nm(o);zb(o|0,8296,130)}function Kh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+32|0;l=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[l>>2];l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=j|0;n=j+8|0;m=j+24|0;Ne(m,f);m=m|0;f=c[m>>2]|0;if(!((c[3402]|0)==-1)){c[n>>2]=13608;c[n+4>>2]=14;c[n+8>>2]=0;oe(13608,n,96)}n=(c[3403]|0)-1|0;o=c[f+8>>2]|0;if((c[f+12>>2]|0)-o>>2>>>0>n>>>0?(k=c[o+(n<<2)>>2]|0,(k|0)!=0):0){Wd(c[m>>2]|0)|0;o=c[e>>2]|0;e=b+8|0;e=sc[c[(c[e>>2]|0)+4>>2]&127](e)|0;c[l>>2]=o;e=(dg(d,l,e,e+288|0,k,g,0)|0)-e|0;if((e|0)>=288){n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}c[h+16>>2]=((e|0)/12|0|0)%12|0;n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}o=cc(4)|0;nm(o);zb(o|0,8296,130)}function Lh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;b=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=b|0;m=b+8|0;l=b+24|0;Ne(l,f);l=l|0;f=c[l>>2]|0;if(!((c[3402]|0)==-1)){c[m>>2]=13608;c[m+4>>2]=14;c[m+8>>2]=0;oe(13608,m,96)}m=(c[3403]|0)-1|0;n=c[f+8>>2]|0;if((c[f+12>>2]|0)-n>>2>>>0>m>>>0?(j=c[n+(m<<2)>>2]|0,(j|0)!=0):0){Wd(c[l>>2]|0)|0;c[k>>2]=c[e>>2];e=Qh(d,k,g,j,4)|0;if((c[g>>2]&4|0)!=0){m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=b;return}if((e|0)<69){g=e+2e3|0}else{g=(e-69|0)>>>0<31>>>0?e+1900|0:e}c[h+20>>2]=g-1900;m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=b;return}n=cc(4)|0;nm(n);zb(n|0,8296,130)}function Mh(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+328|0;y=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[y>>2];y=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[y>>2];y=l|0;u=l+8|0;Y=l+16|0;Q=l+24|0;L=l+32|0;H=l+40|0;G=l+48|0;t=l+56|0;v=l+64|0;s=l+72|0;X=l+80|0;w=l+88|0;$=l+96|0;R=l+112|0;m=l+120|0;q=l+128|0;r=l+136|0;M=l+144|0;E=l+152|0;F=l+160|0;P=l+168|0;N=l+176|0;O=l+184|0;x=l+192|0;A=l+200|0;K=l+208|0;I=l+216|0;J=l+224|0;D=l+232|0;B=l+240|0;C=l+248|0;V=l+256|0;S=l+264|0;W=l+272|0;T=l+280|0;U=l+288|0;p=l+296|0;n=l+304|0;o=l+312|0;z=l+320|0;c[h>>2]=0;Ne(R,g);R=R|0;_=c[R>>2]|0;if(!((c[3402]|0)==-1)){c[$>>2]=13608;c[$+4>>2]=14;c[$+8>>2]=0;oe(13608,$,96)}$=(c[3403]|0)-1|0;aa=c[_+8>>2]|0;if((c[_+12>>2]|0)-aa>>2>>>0>$>>>0?(Z=c[aa+($<<2)>>2]|0,(Z|0)!=0):0){Wd(c[R>>2]|0)|0;a:do{switch(k<<24>>24|0){case 84:{aa=e|0;c[S>>2]=c[aa>>2];c[W>>2]=c[f>>2];Dh(V,d,S,W,g,h,j,2424,2432);c[aa>>2]=c[V>>2];break};case 119:{c[Y>>2]=c[f>>2];g=Qh(e,Y,h,Z,1)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<7){c[j+24>>2]=g;break a}else{c[h>>2]=d|4;break a}};case 98:case 66:case 104:{$=c[f>>2]|0;aa=d+8|0;aa=sc[c[(c[aa>>2]|0)+4>>2]&127](aa)|0;c[X>>2]=$;h=(dg(e,X,aa,aa+288|0,Z,h,0)|0)-aa|0;if((h|0)<288){c[j+16>>2]=((h|0)/12|0|0)%12|0}break};case 72:{c[v>>2]=c[f>>2];d=Qh(e,v,h,Z,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<24){c[j+8>>2]=d;break a}else{c[h>>2]=g|4;break a}};case 68:{aa=e|0;c[E>>2]=c[aa>>2];c[F>>2]=c[f>>2];Dh(M,d,E,F,g,h,j,2464,2472);c[aa>>2]=c[M>>2];break};case 70:{aa=e|0;c[N>>2]=c[aa>>2];c[O>>2]=c[f>>2];Dh(P,d,N,O,g,h,j,2456,2464);c[aa>>2]=c[P>>2];break};case 120:{aa=c[(c[d>>2]|0)+20>>2]|0;c[T>>2]=c[e>>2];c[U>>2]=c[f>>2];mc[aa&127](b,d,T,U,g,h,j);i=l;return};case 88:{q=d+8|0;q=sc[c[(c[q>>2]|0)+24>>2]&127](q)|0;m=e|0;c[n>>2]=c[m>>2];c[o>>2]=c[f>>2];f=a[q]|0;if((f&1)==0){r=(f&255)>>>1;f=q+1|0;q=q+1|0}else{aa=c[q+8>>2]|0;r=c[q+4>>2]|0;f=aa;q=aa}Dh(p,d,n,o,g,h,j,f,q+r|0);c[m>>2]=c[p>>2];break};case 97:case 65:{$=c[f>>2]|0;aa=d+8|0;aa=sc[c[c[aa>>2]>>2]&127](aa)|0;c[w>>2]=$;h=(dg(e,w,aa,aa+168|0,Z,h,0)|0)-aa|0;if((h|0)<168){c[j+24>>2]=((h|0)/12|0|0)%7|0}break};case 110:case 116:{c[x>>2]=c[f>>2];Nh(0,e,x,h,Z);break};case 89:{c[y>>2]=c[f>>2];g=Qh(e,y,h,Z,4)|0;if((c[h>>2]&4|0)==0){c[j+20>>2]=g-1900}break};case 37:{c[z>>2]=c[f>>2];Ph(0,e,z,h,Z);break};case 112:{c[A>>2]=c[f>>2];Oh(d,j+8|0,e,A,h,Z);break};case 82:{aa=e|0;c[B>>2]=c[aa>>2];c[C>>2]=c[f>>2];Dh(D,d,B,C,g,h,j,2432,2437);c[aa>>2]=c[D>>2];break};case 121:{j=j+20|0;c[u>>2]=c[f>>2];g=Qh(e,u,h,Z,4)|0;if((c[h>>2]&4|0)==0){if((g|0)<69){h=g+2e3|0}else{h=(g-69|0)>>>0<31>>>0?g+1900|0:g}c[j>>2]=h-1900}break};case 73:{j=j+8|0;c[t>>2]=c[f>>2];g=Qh(e,t,h,Z,2)|0;d=c[h>>2]|0;if((d&4|0)==0?(g-1|0)>>>0<12>>>0:0){c[j>>2]=g;break a}c[h>>2]=d|4;break};case 106:{c[G>>2]=c[f>>2];d=Qh(e,G,h,Z,3)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<366){c[j+28>>2]=d;break a}else{c[h>>2]=g|4;break a}};case 109:{c[H>>2]=c[f>>2];g=Qh(e,H,h,Z,2)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<13){c[j+16>>2]=g-1;break a}else{c[h>>2]=d|4;break a}};case 114:{aa=e|0;c[I>>2]=c[aa>>2];c[J>>2]=c[f>>2];Dh(K,d,I,J,g,h,j,2440,2451);c[aa>>2]=c[K>>2];break};case 77:{c[L>>2]=c[f>>2];g=Qh(e,L,h,Z,2)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<60){c[j+4>>2]=g;break a}else{c[h>>2]=d|4;break a}};case 100:case 101:{j=j+12|0;c[s>>2]=c[f>>2];d=Qh(e,s,h,Z,2)|0;g=c[h>>2]|0;if((g&4|0)==0?(d-1|0)>>>0<31>>>0:0){c[j>>2]=d;break a}c[h>>2]=g|4;break};case 99:{o=d+8|0;o=sc[c[(c[o>>2]|0)+12>>2]&127](o)|0;n=e|0;c[q>>2]=c[n>>2];c[r>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=(f&255)>>>1;f=o+1|0;o=o+1|0}else{aa=c[o+8>>2]|0;p=c[o+4>>2]|0;f=aa;o=aa}Dh(m,d,q,r,g,h,j,f,o+p|0);c[n>>2]=c[m>>2];break};case 83:{c[Q>>2]=c[f>>2];g=Qh(e,Q,h,Z,2)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<61){c[j>>2]=g;break a}else{c[h>>2]=d|4;break a}};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}aa=cc(4)|0;nm(aa);zb(aa|0,8296,130)}function Nh(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;d=i;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];e=e|0;f=f|0;h=h+8|0;a:while(1){k=c[e>>2]|0;do{if((k|0)!=0){if((c[k+12>>2]|0)==(c[k+16>>2]|0)){if((sc[c[(c[k>>2]|0)+36>>2]&127](k)|0)==-1){c[e>>2]=0;k=0;break}else{k=c[e>>2]|0;break}}}else{k=0}}while(0);l=(k|0)==0;k=c[f>>2]|0;do{if((k|0)!=0){if((c[k+12>>2]|0)!=(c[k+16>>2]|0)){if(l){break}else{break a}}if(!((sc[c[(c[k>>2]|0)+36>>2]&127](k)|0)==-1)){if(l){break}else{break a}}else{c[f>>2]=0;j=12;break}}else{j=12}}while(0);if((j|0)==12){j=0;if(l){k=0;break}else{k=0}}m=c[e>>2]|0;l=c[m+12>>2]|0;if((l|0)==(c[m+16>>2]|0)){l=(sc[c[(c[m>>2]|0)+36>>2]&127](m)|0)&255}else{l=a[l]|0}if(!(l<<24>>24>-1)){break}if((b[(c[h>>2]|0)+(l<<24>>24<<1)>>1]&8192)==0){break}m=c[e>>2]|0;l=m+12|0;k=c[l>>2]|0;if((k|0)==(c[m+16>>2]|0)){sc[c[(c[m>>2]|0)+40>>2]&127](m)|0;continue}else{c[l>>2]=k+1;continue}}h=c[e>>2]|0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)){if((sc[c[(c[h>>2]|0)+36>>2]&127](h)|0)==-1){c[e>>2]=0;h=0;break}else{h=c[e>>2]|0;break}}}else{h=0}}while(0);e=(h|0)==0;do{if((k|0)!=0){if((c[k+12>>2]|0)==(c[k+16>>2]|0)?(sc[c[(c[k>>2]|0)+36>>2]&127](k)|0)==-1:0){c[f>>2]=0;j=32;break}if(e){i=d;return}}else{j=32}}while(0);if((j|0)==32?!e:0){i=d;return}c[g>>2]=c[g>>2]|2;i=d;return}function Oh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[k>>2];k=j|0;b=b+8|0;b=sc[c[(c[b>>2]|0)+8>>2]&127](b)|0;l=a[b]|0;if((l&1)==0){l=(l&255)>>>1}else{l=c[b+4>>2]|0}m=a[b+12|0]|0;if((m&1)==0){m=(m&255)>>>1}else{m=c[b+16>>2]|0}if((l|0)==(-m|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];m=dg(e,k,b,b+24|0,h,g,0)|0;h=m-b|0;if((m|0)==(b|0)?(c[d>>2]|0)==12:0){c[d>>2]=0;i=j;return}if((h|0)!=12){i=j;return}h=c[d>>2]|0;if((h|0)>=12){i=j;return}c[d>>2]=h+12;i=j;return}function Ph(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;b=i;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];d=d|0;j=c[d>>2]|0;do{if((j|0)!=0){if((c[j+12>>2]|0)==(c[j+16>>2]|0)){if((sc[c[(c[j>>2]|0)+36>>2]&127](j)|0)==-1){c[d>>2]=0;j=0;break}else{j=c[d>>2]|0;break}}}else{j=0}}while(0);k=(j|0)==0;e=e|0;j=c[e>>2]|0;do{if((j|0)!=0){if((c[j+12>>2]|0)==(c[j+16>>2]|0)?(sc[c[(c[j>>2]|0)+36>>2]&127](j)|0)==-1:0){c[e>>2]=0;h=11;break}if(!k){h=12}}else{h=11}}while(0);if((h|0)==11){if(k){h=12}else{j=0}}if((h|0)==12){c[f>>2]=c[f>>2]|6;i=b;return}l=c[d>>2]|0;k=c[l+12>>2]|0;if((k|0)==(c[l+16>>2]|0)){k=(sc[c[(c[l>>2]|0)+36>>2]&127](l)|0)&255}else{k=a[k]|0}if(!((qc[c[(c[g>>2]|0)+36>>2]&63](g,k,0)|0)<<24>>24==37)){c[f>>2]=c[f>>2]|4;i=b;return}g=c[d>>2]|0;l=g+12|0;k=c[l>>2]|0;if((k|0)==(c[g+16>>2]|0)){sc[c[(c[g>>2]|0)+40>>2]&127](g)|0}else{c[l>>2]=k+1}g=c[d>>2]|0;do{if((g|0)!=0){if((c[g+12>>2]|0)==(c[g+16>>2]|0)){if((sc[c[(c[g>>2]|0)+36>>2]&127](g)|0)==-1){c[d>>2]=0;g=0;break}else{g=c[d>>2]|0;break}}}else{g=0}}while(0);d=(g|0)==0;do{if((j|0)!=0){if((c[j+12>>2]|0)==(c[j+16>>2]|0)?(sc[c[(c[j>>2]|0)+36>>2]&127](j)|0)==-1:0){c[e>>2]=0;h=31;break}if(d){i=b;return}}else{h=31}}while(0);if((h|0)==31?!d:0){i=b;return}c[f>>2]=c[f>>2]|2;i=b;return}function Qh(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;j=i;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];d=d|0;m=c[d>>2]|0;do{if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((sc[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1){c[d>>2]=0;m=0;break}else{m=c[d>>2]|0;break}}}else{m=0}}while(0);m=(m|0)==0;e=e|0;n=c[e>>2]|0;do{if((n|0)!=0){if((c[n+12>>2]|0)==(c[n+16>>2]|0)?(sc[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1:0){c[e>>2]=0;l=11;break}if(!m){l=12}}else{l=11}}while(0);if((l|0)==11){if(m){l=12}else{n=0}}if((l|0)==12){c[f>>2]=c[f>>2]|6;r=0;i=j;return r|0}l=c[d>>2]|0;m=c[l+12>>2]|0;if((m|0)==(c[l+16>>2]|0)){m=(sc[c[(c[l>>2]|0)+36>>2]&127](l)|0)&255}else{m=a[m]|0}if(m<<24>>24>-1?(k=g+8|0,!((b[(c[k>>2]|0)+(m<<24>>24<<1)>>1]&2048)==0)):0){l=g;p=(qc[c[(c[l>>2]|0)+36>>2]&63](g,m,0)|0)<<24>>24;m=c[d>>2]|0;o=m+12|0;q=c[o>>2]|0;if((q|0)==(c[m+16>>2]|0)){sc[c[(c[m>>2]|0)+40>>2]&127](m)|0;m=h;o=n;h=n}else{c[o>>2]=q+1;m=h;o=n;h=n}while(1){n=p-48|0;m=m-1|0;p=c[d>>2]|0;do{if((p|0)!=0){if((c[p+12>>2]|0)==(c[p+16>>2]|0)){if((sc[c[(c[p>>2]|0)+36>>2]&127](p)|0)==-1){c[d>>2]=0;p=0;break}else{p=c[d>>2]|0;break}}}else{p=0}}while(0);p=(p|0)==0;if((o|0)!=0){if((c[o+12>>2]|0)==(c[o+16>>2]|0)){if((sc[c[(c[o>>2]|0)+36>>2]&127](o)|0)==-1){c[e>>2]=0;o=0;h=0}else{o=h}}}else{o=0}q=c[d>>2]|0;if(!((p^(o|0)==0)&(m|0)>0)){l=40;break}p=c[q+12>>2]|0;if((p|0)==(c[q+16>>2]|0)){p=(sc[c[(c[q>>2]|0)+36>>2]&127](q)|0)&255}else{p=a[p]|0}if(!(p<<24>>24>-1)){l=52;break}if((b[(c[k>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){l=52;break}p=((qc[c[(c[l>>2]|0)+36>>2]&63](g,p,0)|0)<<24>>24)+(n*10|0)|0;q=c[d>>2]|0;n=q+12|0;r=c[n>>2]|0;if((r|0)==(c[q+16>>2]|0)){sc[c[(c[q>>2]|0)+40>>2]&127](q)|0;continue}else{c[n>>2]=r+1;continue}}if((l|0)==40){do{if((q|0)!=0){if((c[q+12>>2]|0)==(c[q+16>>2]|0)){if((sc[c[(c[q>>2]|0)+36>>2]&127](q)|0)==-1){c[d>>2]=0;q=0;break}else{q=c[d>>2]|0;break}}}else{q=0}}while(0);g=(q|0)==0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)?(sc[c[(c[h>>2]|0)+36>>2]&127](h)|0)==-1:0){c[e>>2]=0;l=50;break}if(g){r=n;i=j;return r|0}}else{l=50}}while(0);if((l|0)==50?!g:0){r=n;i=j;return r|0}c[f>>2]=c[f>>2]|2;r=n;i=j;return r|0}else if((l|0)==52){i=j;return n|0}}c[f>>2]=c[f>>2]|4;r=0;i=j;return r|0}function Rh(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+48|0;s=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[s>>2];s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=m|0;r=m+16|0;p=m+24|0;n=m+32|0;o=m+40|0;Ne(r,f);r=r|0;q=c[r>>2]|0;if(!((c[3400]|0)==-1)){c[s>>2]=13600;c[s+4>>2]=14;c[s+8>>2]=0;oe(13600,s,96)}s=(c[3401]|0)-1|0;t=c[q+8>>2]|0;if((c[q+12>>2]|0)-t>>2>>>0>s>>>0?(v=c[t+(s<<2)>>2]|0,(v|0)!=0):0){q=v;Wd(c[r>>2]|0)|0;c[g>>2]=0;r=d|0;a:do{if((j|0)!=(k|0)){s=e|0;u=v;t=v;z=v;w=b;v=n|0;y=o|0;x=p|0;A=0;b:while(1){while(1){if((A|0)!=0){l=71;break a}A=c[r>>2]|0;if((A|0)!=0){B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){B=sc[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{B=c[B>>2]|0}if((B|0)==-1){c[r>>2]=0;C=1;A=0}else{C=0}}else{C=1;A=0}B=c[s>>2]|0;do{if((B|0)!=0){D=c[B+12>>2]|0;if((D|0)==(c[B+16>>2]|0)){D=sc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{D=c[D>>2]|0}if(!((D|0)==-1)){if(C){break}else{l=25;break b}}else{c[s>>2]=0;l=23;break}}else{l=23}}while(0);if((l|0)==23){l=0;if(C){l=25;break b}else{B=0}}if((qc[c[(c[u>>2]|0)+52>>2]&63](q,c[j>>2]|0,0)|0)<<24>>24==37){l=28;break}if(qc[c[(c[t>>2]|0)+12>>2]&63](q,8192,c[j>>2]|0)|0){l=38;break}B=A+12|0;D=c[B>>2]|0;C=A+16|0;if((D|0)==(c[C>>2]|0)){D=sc[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{D=c[D>>2]|0}F=pc[c[(c[z>>2]|0)+28>>2]&63](q,D)|0;if((F|0)==(pc[c[(c[z>>2]|0)+28>>2]&63](q,c[j>>2]|0)|0)){l=66;break}c[g>>2]=4;A=4}c:do{if((l|0)==28){l=0;C=j+4|0;if((C|0)==(k|0)){l=29;break b}D=qc[c[(c[u>>2]|0)+52>>2]&63](q,c[C>>2]|0,0)|0;if((D<<24>>24|0)==69|(D<<24>>24|0)==48){C=j+8|0;if((C|0)==(k|0)){l=32;break b}j=D;D=qc[c[(c[u>>2]|0)+52>>2]&63](q,c[C>>2]|0,0)|0}else{j=0}F=c[(c[w>>2]|0)+36>>2]|0;c[v>>2]=A;c[y>>2]=B;xc[F&7](p,b,n,o,f,g,h,D,j);c[r>>2]=c[x>>2];j=C+4|0}else if((l|0)==38){while(1){l=0;j=j+4|0;if((j|0)==(k|0)){j=k;break}if(qc[c[(c[t>>2]|0)+12>>2]&63](q,8192,c[j>>2]|0)|0){l=38}else{break}}D=B;C=B;while(1){if((A|0)!=0){B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){B=sc[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{B=c[B>>2]|0}if((B|0)==-1){c[r>>2]=0;B=1;A=0}else{B=0}}else{B=1;A=0}do{if((D|0)!=0){E=c[D+12>>2]|0;if((E|0)==(c[D+16>>2]|0)){D=sc[c[(c[D>>2]|0)+36>>2]&127](D)|0}else{D=c[E>>2]|0}if(!((D|0)==-1)){if(B^(C|0)==0){B=C;break}else{break c}}else{c[s>>2]=0;C=0;l=53;break}}else{l=53}}while(0);if((l|0)==53){l=0;if(B){break c}else{B=0}}E=A+12|0;F=c[E>>2]|0;D=A+16|0;if((F|0)==(c[D>>2]|0)){F=sc[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{F=c[F>>2]|0}if(!(qc[c[(c[t>>2]|0)+12>>2]&63](q,8192,F)|0)){break c}F=c[E>>2]|0;if((F|0)==(c[D>>2]|0)){sc[c[(c[A>>2]|0)+40>>2]&127](A)|0;D=B;continue}else{c[E>>2]=F+4;D=B;continue}}}else if((l|0)==66){l=0;D=c[B>>2]|0;if((D|0)==(c[C>>2]|0)){sc[c[(c[A>>2]|0)+40>>2]&127](A)|0}else{c[B>>2]=D+4}j=j+4|0}}while(0);if((j|0)==(k|0)){l=71;break a}A=c[g>>2]|0}if((l|0)==25){c[g>>2]=4;break}else if((l|0)==29){c[g>>2]=4;break}else if((l|0)==32){c[g>>2]=4;break}}else{l=71}}while(0);if((l|0)==71){A=c[r>>2]|0}d=d|0;if((A|0)!=0){k=c[A+12>>2]|0;if((k|0)==(c[A+16>>2]|0)){k=sc[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{k=c[k>>2]|0}if((k|0)==-1){c[d>>2]=0;d=1;A=0}else{d=0}}else{d=1;A=0}e=e|0;k=c[e>>2]|0;do{if((k|0)!=0){b=c[k+12>>2]|0;if((b|0)==(c[k+16>>2]|0)){k=sc[c[(c[k>>2]|0)+36>>2]&127](k)|0}else{k=c[b>>2]|0}if((k|0)==-1){c[e>>2]=0;l=84;break}if(d){F=a|0;c[F>>2]=A;i=m;return}}else{l=84}}while(0);if((l|0)==84?!d:0){F=a|0;c[F>>2]=A;i=m;return}c[g>>2]=c[g>>2]|2;F=a|0;c[F>>2]=A;i=m;return}F=cc(4)|0;nm(F);zb(F|0,8296,130)}function Sh(a){a=a|0;Ud(a|0);Pm(a);return}function Th(a){a=a|0;Ud(a|0);return}function Uh(a){a=a|0;return 2}function Vh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;m=d;l=i;i=i+4|0;i=i+7&-8;c[l>>2]=c[m>>2];m=e;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[m>>2];e=j|0;d=j+8|0;c[e>>2]=c[l>>2];c[d>>2]=c[k>>2];Rh(a,b,e,d,f,g,h,2392,2424);i=j;return}function Wh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0;k=i;i=i+16|0;l=e;n=i;i=i+4|0;i=i+7&-8;c[n>>2]=c[l>>2];l=f;m=i;i=i+4|0;i=i+7&-8;c[m>>2]=c[l>>2];f=k|0;e=k+8|0;l=d+8|0;l=sc[c[(c[l>>2]|0)+20>>2]&127](l)|0;c[f>>2]=c[n>>2];c[e>>2]=c[m>>2];m=a[l]|0;if((m&1)==0){m=(m&255)>>>1;n=l+4|0;l=l+4|0}else{o=c[l+8>>2]|0;m=c[l+4>>2]|0;n=o;l=o}Rh(b,d,f,e,g,h,j,n,l+(m<<2)|0);i=k;return}function Xh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+32|0;l=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[l>>2];l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=j|0;n=j+8|0;m=j+24|0;Ne(m,f);m=m|0;f=c[m>>2]|0;if(!((c[3400]|0)==-1)){c[n>>2]=13600;c[n+4>>2]=14;c[n+8>>2]=0;oe(13600,n,96)}n=(c[3401]|0)-1|0;o=c[f+8>>2]|0;if((c[f+12>>2]|0)-o>>2>>>0>n>>>0?(k=c[o+(n<<2)>>2]|0,(k|0)!=0):0){Wd(c[m>>2]|0)|0;o=c[e>>2]|0;e=b+8|0;e=sc[c[c[e>>2]>>2]&127](e)|0;c[l>>2]=o;e=(Cg(d,l,e,e+168|0,k,g,0)|0)-e|0;if((e|0)>=168){n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}c[h+24>>2]=((e|0)/12|0|0)%7|0;n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}o=cc(4)|0;nm(o);zb(o|0,8296,130)}function Yh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+32|0;l=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[l>>2];l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=j|0;n=j+8|0;m=j+24|0;Ne(m,f);m=m|0;f=c[m>>2]|0;if(!((c[3400]|0)==-1)){c[n>>2]=13600;c[n+4>>2]=14;c[n+8>>2]=0;oe(13600,n,96)}n=(c[3401]|0)-1|0;o=c[f+8>>2]|0;if((c[f+12>>2]|0)-o>>2>>>0>n>>>0?(k=c[o+(n<<2)>>2]|0,(k|0)!=0):0){Wd(c[m>>2]|0)|0;o=c[e>>2]|0;e=b+8|0;e=sc[c[(c[e>>2]|0)+4>>2]&127](e)|0;c[l>>2]=o;e=(Cg(d,l,e,e+288|0,k,g,0)|0)-e|0;if((e|0)>=288){n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}c[h+16>>2]=((e|0)/12|0|0)%12|0;n=d|0;n=c[n>>2]|0;o=a|0;c[o>>2]=n;i=j;return}o=cc(4)|0;nm(o);zb(o|0,8296,130)}function Zh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;b=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=b|0;m=b+8|0;l=b+24|0;Ne(l,f);l=l|0;f=c[l>>2]|0;if(!((c[3400]|0)==-1)){c[m>>2]=13600;c[m+4>>2]=14;c[m+8>>2]=0;oe(13600,m,96)}m=(c[3401]|0)-1|0;n=c[f+8>>2]|0;if((c[f+12>>2]|0)-n>>2>>>0>m>>>0?(j=c[n+(m<<2)>>2]|0,(j|0)!=0):0){Wd(c[l>>2]|0)|0;c[k>>2]=c[e>>2];e=ci(d,k,g,j,4)|0;if((c[g>>2]&4|0)!=0){m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=b;return}if((e|0)<69){g=e+2e3|0}else{g=(e-69|0)>>>0<31>>>0?e+1900|0:e}c[h+20>>2]=g-1900;m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=b;return}n=cc(4)|0;nm(n);zb(n|0,8296,130)}function _h(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+328|0;w=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[w>>2];w=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[w>>2];w=l|0;s=l+8|0;M=l+16|0;S=l+24|0;V=l+32|0;Z=l+40|0;I=l+48|0;t=l+56|0;U=l+64|0;u=l+72|0;Y=l+80|0;W=l+88|0;$=l+96|0;Q=l+112|0;m=l+120|0;r=l+128|0;n=l+136|0;P=l+144|0;N=l+152|0;O=l+160|0;z=l+168|0;x=l+176|0;y=l+184|0;J=l+192|0;T=l+200|0;E=l+208|0;C=l+216|0;D=l+224|0;H=l+232|0;F=l+240|0;G=l+248|0;L=l+256|0;v=l+264|0;K=l+272|0;A=l+280|0;B=l+288|0;o=l+296|0;p=l+304|0;q=l+312|0;R=l+320|0;c[h>>2]=0;Ne(Q,g);Q=Q|0;_=c[Q>>2]|0;if(!((c[3400]|0)==-1)){c[$>>2]=13600;c[$+4>>2]=14;c[$+8>>2]=0;oe(13600,$,96)}aa=(c[3401]|0)-1|0;$=c[_+8>>2]|0;if((c[_+12>>2]|0)-$>>2>>>0>aa>>>0?(X=c[$+(aa<<2)>>2]|0,(X|0)!=0):0){Wd(c[Q>>2]|0)|0;a:do{switch(k<<24>>24|0){case 121:{j=j+20|0;c[s>>2]=c[f>>2];g=ci(e,s,h,X,4)|0;if((c[h>>2]&4|0)==0){if((g|0)<69){h=g+2e3|0}else{h=(g-69|0)>>>0<31>>>0?g+1900|0:g}c[j>>2]=h-1900}break};case 100:case 101:{j=j+12|0;c[u>>2]=c[f>>2];g=ci(e,u,h,X,2)|0;d=c[h>>2]|0;if((d&4|0)==0?(g-1|0)>>>0<31>>>0:0){c[j>>2]=g;break a}c[h>>2]=d|4;break};case 72:{c[U>>2]=c[f>>2];d=ci(e,U,h,X,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<24){c[j+8>>2]=d;break a}else{c[h>>2]=g|4;break a}};case 73:{j=j+8|0;c[t>>2]=c[f>>2];g=ci(e,t,h,X,2)|0;d=c[h>>2]|0;if((d&4|0)==0?(g-1|0)>>>0<12>>>0:0){c[j>>2]=g;break a}c[h>>2]=d|4;break};case 83:{c[S>>2]=c[f>>2];g=ci(e,S,h,X,2)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<61){c[j>>2]=g;break a}else{c[h>>2]=d|4;break a}};case 99:{p=d+8|0;p=sc[c[(c[p>>2]|0)+12>>2]&127](p)|0;o=e|0;c[r>>2]=c[o>>2];c[n>>2]=c[f>>2];f=a[p]|0;if((f&1)==0){q=(f&255)>>>1;f=p+4|0;p=p+4|0}else{aa=c[p+8>>2]|0;q=c[p+4>>2]|0;f=aa;p=aa}Rh(m,d,r,n,g,h,j,f,p+(q<<2)|0);c[o>>2]=c[m>>2];break};case 88:{n=d+8|0;n=sc[c[(c[n>>2]|0)+24>>2]&127](n)|0;m=e|0;c[p>>2]=c[m>>2];c[q>>2]=c[f>>2];f=a[n]|0;if((f&1)==0){f=(f&255)>>>1;r=n+4|0;n=n+4|0}else{aa=c[n+8>>2]|0;f=c[n+4>>2]|0;r=aa;n=aa}Rh(o,d,p,q,g,h,j,r,n+(f<<2)|0);c[m>>2]=c[o>>2];break};case 98:case 66:case 104:{$=c[f>>2]|0;aa=d+8|0;aa=sc[c[(c[aa>>2]|0)+4>>2]&127](aa)|0;c[Y>>2]=$;h=(Cg(e,Y,aa,aa+288|0,X,h,0)|0)-aa|0;if((h|0)<288){c[j+16>>2]=((h|0)/12|0|0)%12|0}break};case 37:{c[R>>2]=c[f>>2];bi(0,e,R,h,X);break};case 109:{c[Z>>2]=c[f>>2];g=ci(e,Z,h,X,2)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<13){c[j+16>>2]=g-1;break a}else{c[h>>2]=d|4;break a}};case 110:case 116:{c[J>>2]=c[f>>2];$h(0,e,J,h,X);break};case 112:{c[T>>2]=c[f>>2];ai(d,j+8|0,e,T,h,X);break};case 77:{c[V>>2]=c[f>>2];g=ci(e,V,h,X,2)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<60){c[j+4>>2]=g;break a}else{c[h>>2]=d|4;break a}};case 97:case 65:{$=c[f>>2]|0;aa=d+8|0;aa=sc[c[c[aa>>2]>>2]&127](aa)|0;c[W>>2]=$;h=(Cg(e,W,aa,aa+168|0,X,h,0)|0)-aa|0;if((h|0)<168){c[j+24>>2]=((h|0)/12|0|0)%7|0}break};case 89:{c[w>>2]=c[f>>2];g=ci(e,w,h,X,4)|0;if((c[h>>2]&4|0)==0){c[j+20>>2]=g-1900}break};case 70:{aa=e|0;c[x>>2]=c[aa>>2];c[y>>2]=c[f>>2];Rh(z,d,x,y,g,h,j,2224,2256);c[aa>>2]=c[z>>2];break};case 120:{aa=c[(c[d>>2]|0)+20>>2]|0;c[A>>2]=c[e>>2];c[B>>2]=c[f>>2];mc[aa&127](b,d,A,B,g,h,j);i=l;return};case 114:{aa=e|0;c[C>>2]=c[aa>>2];c[D>>2]=c[f>>2];Rh(E,d,C,D,g,h,j,2312,2356);c[aa>>2]=c[E>>2];break};case 82:{aa=e|0;c[F>>2]=c[aa>>2];c[G>>2]=c[f>>2];Rh(H,d,F,G,g,h,j,2288,2308);c[aa>>2]=c[H>>2];break};case 106:{c[I>>2]=c[f>>2];g=ci(e,I,h,X,3)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<366){c[j+28>>2]=g;break a}else{c[h>>2]=d|4;break a}};case 84:{aa=e|0;c[v>>2]=c[aa>>2];c[K>>2]=c[f>>2];Rh(L,d,v,K,g,h,j,2256,2288);c[aa>>2]=c[L>>2];break};case 119:{c[M>>2]=c[f>>2];g=ci(e,M,h,X,1)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<7){c[j+24>>2]=g;break a}else{c[h>>2]=d|4;break a}};case 68:{aa=e|0;c[N>>2]=c[aa>>2];c[O>>2]=c[f>>2];Rh(P,d,N,O,g,h,j,2360,2392);c[aa>>2]=c[P>>2];break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}aa=cc(4)|0;nm(aa);zb(aa|0,8296,130)}function $h(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;a=i;h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];b=b|0;d=d|0;h=f;a:while(1){k=c[b>>2]|0;do{if((k|0)!=0){j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0)){j=sc[c[(c[k>>2]|0)+36>>2]&127](k)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[b>>2]=0;j=1;break}else{j=(c[b>>2]|0)==0;break}}else{j=1}}while(0);k=c[d>>2]|0;do{if((k|0)!=0){l=c[k+12>>2]|0;if((l|0)==(c[k+16>>2]|0)){l=sc[c[(c[k>>2]|0)+36>>2]&127](k)|0}else{l=c[l>>2]|0}if(!((l|0)==-1)){if(j){j=k;break}else{f=k;break a}}else{c[d>>2]=0;g=15;break}}else{g=15}}while(0);if((g|0)==15){g=0;if(j){f=0;break}else{j=0}}l=c[b>>2]|0;k=c[l+12>>2]|0;if((k|0)==(c[l+16>>2]|0)){k=sc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{k=c[k>>2]|0}if(!(qc[c[(c[h>>2]|0)+12>>2]&63](f,8192,k)|0)){f=j;break}j=c[b>>2]|0;k=j+12|0;l=c[k>>2]|0;if((l|0)==(c[j+16>>2]|0)){sc[c[(c[j>>2]|0)+40>>2]&127](j)|0;continue}else{c[k>>2]=l+4;continue}}h=c[b>>2]|0;do{if((h|0)!=0){j=c[h+12>>2]|0;if((j|0)==(c[h+16>>2]|0)){h=sc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{h=c[j>>2]|0}if((h|0)==-1){c[b>>2]=0;b=1;break}else{b=(c[b>>2]|0)==0;break}}else{b=1}}while(0);do{if((f|0)!=0){h=c[f+12>>2]|0;if((h|0)==(c[f+16>>2]|0)){f=sc[c[(c[f>>2]|0)+36>>2]&127](f)|0}else{f=c[h>>2]|0}if((f|0)==-1){c[d>>2]=0;g=37;break}if(b){i=a;return}}else{g=37}}while(0);if((g|0)==37?!b:0){i=a;return}c[e>>2]=c[e>>2]|2;i=a;return}function ai(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[k>>2];k=j|0;b=b+8|0;b=sc[c[(c[b>>2]|0)+8>>2]&127](b)|0;l=a[b]|0;if((l&1)==0){l=(l&255)>>>1}else{l=c[b+4>>2]|0}m=a[b+12|0]|0;if((m&1)==0){m=(m&255)>>>1}else{m=c[b+16>>2]|0}if((l|0)==(-m|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];m=Cg(e,k,b,b+24|0,h,g,0)|0;h=m-b|0;if((m|0)==(b|0)?(c[d>>2]|0)==12:0){c[d>>2]=0;i=j;return}if((h|0)!=12){i=j;return}h=c[d>>2]|0;if((h|0)>=12){i=j;return}c[d>>2]=h+12;i=j;return}function bi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;a=i;h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];b=b|0;h=c[b>>2]|0;do{if((h|0)!=0){j=c[h+12>>2]|0;if((j|0)==(c[h+16>>2]|0)){h=sc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{h=c[j>>2]|0}if((h|0)==-1){c[b>>2]=0;j=1;break}else{j=(c[b>>2]|0)==0;break}}else{j=1}}while(0);d=d|0;h=c[d>>2]|0;do{if((h|0)!=0){k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){k=sc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{k=c[k>>2]|0}if(!((k|0)==-1)){if(j){break}else{g=16;break}}else{c[d>>2]=0;g=14;break}}else{g=14}}while(0);if((g|0)==14){if(j){g=16}else{h=0}}if((g|0)==16){c[e>>2]=c[e>>2]|6;i=a;return}k=c[b>>2]|0;j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0)){j=sc[c[(c[k>>2]|0)+36>>2]&127](k)|0}else{j=c[j>>2]|0}if(!((qc[c[(c[f>>2]|0)+52>>2]&63](f,j,0)|0)<<24>>24==37)){c[e>>2]=c[e>>2]|4;i=a;return}k=c[b>>2]|0;j=k+12|0;f=c[j>>2]|0;if((f|0)==(c[k+16>>2]|0)){sc[c[(c[k>>2]|0)+40>>2]&127](k)|0}else{c[j>>2]=f+4}f=c[b>>2]|0;do{if((f|0)!=0){j=c[f+12>>2]|0;if((j|0)==(c[f+16>>2]|0)){f=sc[c[(c[f>>2]|0)+36>>2]&127](f)|0}else{f=c[j>>2]|0}if((f|0)==-1){c[b>>2]=0;b=1;break}else{b=(c[b>>2]|0)==0;break}}else{b=1}}while(0);do{if((h|0)!=0){f=c[h+12>>2]|0;if((f|0)==(c[h+16>>2]|0)){f=sc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{f=c[f>>2]|0}if((f|0)==-1){c[d>>2]=0;g=38;break}if(b){i=a;return}}else{g=38}}while(0);if((g|0)==38?!b:0){i=a;return}c[e>>2]=c[e>>2]|2;i=a;return}function ci(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;j=b;b=i;i=i+4|0;i=i+7&-8;c[b>>2]=c[j>>2];a=a|0;j=c[a>>2]|0;do{if((j|0)!=0){k=c[j+12>>2]|0;if((k|0)==(c[j+16>>2]|0)){j=sc[c[(c[j>>2]|0)+36>>2]&127](j)|0}else{j=c[k>>2]|0}if((j|0)==-1){c[a>>2]=0;j=1;break}else{j=(c[a>>2]|0)==0;break}}else{j=1}}while(0);b=b|0;l=c[b>>2]|0;do{if((l|0)!=0){k=c[l+12>>2]|0;if((k|0)==(c[l+16>>2]|0)){k=sc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{k=c[k>>2]|0}if(!((k|0)==-1)){if(j){break}else{h=16;break}}else{c[b>>2]=0;h=14;break}}else{h=14}}while(0);if((h|0)==14){if(j){h=16}else{l=0}}if((h|0)==16){c[d>>2]=c[d>>2]|6;q=0;i=g;return q|0}j=c[a>>2]|0;k=c[j+12>>2]|0;if((k|0)==(c[j+16>>2]|0)){m=sc[c[(c[j>>2]|0)+36>>2]&127](j)|0}else{m=c[k>>2]|0}k=e;if(!(qc[c[(c[k>>2]|0)+12>>2]&63](e,2048,m)|0)){c[d>>2]=c[d>>2]|4;q=0;i=g;return q|0}j=e;o=(qc[c[(c[j>>2]|0)+52>>2]&63](e,m,0)|0)<<24>>24;p=c[a>>2]|0;n=p+12|0;m=c[n>>2]|0;if((m|0)==(c[p+16>>2]|0)){sc[c[(c[p>>2]|0)+40>>2]&127](p)|0;n=l;m=l}else{c[n>>2]=m+4;n=l;m=l}while(1){l=o-48|0;f=f-1|0;o=c[a>>2]|0;do{if((o|0)!=0){p=c[o+12>>2]|0;if((p|0)==(c[o+16>>2]|0)){o=sc[c[(c[o>>2]|0)+36>>2]&127](o)|0}else{o=c[p>>2]|0}if((o|0)==-1){c[a>>2]=0;o=1;break}else{o=(c[a>>2]|0)==0;break}}else{o=1}}while(0);do{if((n|0)!=0){p=c[n+12>>2]|0;if((p|0)==(c[n+16>>2]|0)){n=sc[c[(c[n>>2]|0)+36>>2]&127](n)|0}else{n=c[p>>2]|0}if((n|0)==-1){c[b>>2]=0;q=1;n=0;m=0;break}else{q=(m|0)==0;n=m;break}}else{q=1;n=0}}while(0);p=c[a>>2]|0;if(!((o^q)&(f|0)>0)){break}o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){o=sc[c[(c[p>>2]|0)+36>>2]&127](p)|0}else{o=c[o>>2]|0}if(!(qc[c[(c[k>>2]|0)+12>>2]&63](e,2048,o)|0)){h=63;break}o=((qc[c[(c[j>>2]|0)+52>>2]&63](e,o,0)|0)<<24>>24)+(l*10|0)|0;p=c[a>>2]|0;l=p+12|0;q=c[l>>2]|0;if((q|0)==(c[p+16>>2]|0)){sc[c[(c[p>>2]|0)+40>>2]&127](p)|0;continue}else{c[l>>2]=q+4;continue}}if((h|0)==63){i=g;return l|0}do{if((p|0)!=0){e=c[p+12>>2]|0;if((e|0)==(c[p+16>>2]|0)){e=sc[c[(c[p>>2]|0)+36>>2]&127](p)|0}else{e=c[e>>2]|0}if((e|0)==-1){c[a>>2]=0;a=1;break}else{a=(c[a>>2]|0)==0;break}}else{a=1}}while(0);do{if((m|0)!=0){e=c[m+12>>2]|0;if((e|0)==(c[m+16>>2]|0)){e=sc[c[(c[m>>2]|0)+36>>2]&127](m)|0}else{e=c[e>>2]|0}if((e|0)==-1){c[b>>2]=0;h=60;break}if(a){q=l;i=g;return q|0}}else{h=60}}while(0);if((h|0)==60?!a:0){q=l;i=g;return q|0}c[d>>2]=c[d>>2]|2;q=l;i=g;return q|0}function di(b){b=b|0;var d=0,e=0;d=b+8|0;e=c[d>>2]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}if((e|0)!=(c[3016]|0)){jb(c[d>>2]|0)}Ud(b|0);Pm(b);return}function ei(b){b=b|0;var d=0,e=0;d=b+8|0;e=c[d>>2]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}if((e|0)==(c[3016]|0)){e=b|0;Ud(e);return}jb(c[d>>2]|0);e=b|0;Ud(e);return}function fi(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0;f=i;i=i+112|0;p=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[p>>2];p=f|0;l=f+8|0;g=l|0;n=p|0;a[n]=37;m=p+1|0;a[m]=j;o=p+2|0;a[o]=k;a[p+3|0]=0;if(!(k<<24>>24==0)){a[m]=k;a[o]=j}p=Wb(g|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+p|0;k=c[e>>2]|0;if((p|0)==0){o=k;p=b|0;c[p>>2]=o;i=f;return}else{e=k}do{j=a[g]|0;do{if((e|0)!=0){l=e+24|0;h=c[l>>2]|0;if((h|0)==(c[e+28>>2]|0)){j=(pc[c[(c[e>>2]|0)+52>>2]&63](e,j&255)|0)==-1;e=j?0:e;k=j?0:k;break}else{c[l>>2]=h+1;a[h]=j;break}}else{e=0}}while(0);g=g+1|0}while((g|0)!=(d|0));p=b|0;c[p>>2]=k;i=f;return}function gi(b){b=b|0;var d=0,e=0;d=b+8|0;e=c[d>>2]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}if((e|0)!=(c[3016]|0)){jb(c[d>>2]|0)}Ud(b|0);Pm(b);return}function hi(b){b=b|0;var d=0,e=0;d=b+8|0;e=c[d>>2]|0;if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}if((e|0)==(c[3016]|0)){e=b|0;Ud(e);return}jb(c[d>>2]|0);e=b|0;Ud(e);return}function ii(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;f=i;i=i+408|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=f|0;e=f+400|0;d=l|0;c[e>>2]=l+400;ji(b+8|0,d,e,g,h,j);h=c[e>>2]|0;b=c[k>>2]|0;if((d|0)==(h|0)){k=b;l=a|0;c[l>>2]=k;i=f;return}else{g=b}do{k=c[d>>2]|0;if((g|0)==0){g=0}else{j=g+24|0;e=c[j>>2]|0;if((e|0)==(c[g+28>>2]|0)){k=pc[c[(c[g>>2]|0)+52>>2]&63](g,k)|0}else{c[j>>2]=e+4;c[e>>2]=k}j=(k|0)==-1;g=j?0:g;b=j?0:b}d=d+4|0}while((d|0)!=(h|0));l=a|0;c[l>>2]=b;i=f;return}function ji(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;q=j|0;k=j+112|0;l=i;i=i+4|0;i=i+7&-8;m=j+8|0;o=q|0;a[o]=37;p=q+1|0;a[p]=g;n=q+2|0;a[n]=h;a[q+3|0]=0;if(!(h<<24>>24==0)){a[p]=h;a[n]=g}g=b|0;Wb(m|0,100,o|0,f|0,c[g>>2]|0)|0;c[k>>2]=0;c[k+4>>2]=0;c[l>>2]=m;q=(c[e>>2]|0)-d>>2;m=Rb(c[g>>2]|0)|0;k=dm(d,l,q,k)|0;if((m|0)!=0){Rb(m|0)|0}if((k|0)==-1){fj(896)}else{c[e>>2]=d+(k<<2);i=j;return}}function ki(a){a=a|0;Ud(a|0);Pm(a);return}function li(a){a=a|0;Ud(a|0);return}function mi(a){a=a|0;return 127}function ni(a){a=a|0;return 127}function oi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function pi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function qi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function ri(a,b){a=a|0;b=b|0;se(a,1,45);return}function si(a){a=a|0;return 0}function ti(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function ui(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function vi(a){a=a|0;Ud(a|0);Pm(a);return}function wi(a){a=a|0;Ud(a|0);return}function xi(a){a=a|0;return 127}function yi(a){a=a|0;return 127}function zi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Ai(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Bi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Ci(a,b){a=a|0;b=b|0;se(a,1,45);return}function Di(a){a=a|0;return 0}function Ei(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function Fi(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function Gi(a){a=a|0;Ud(a|0);Pm(a);return}function Hi(a){a=a|0;Ud(a|0);return}function Ii(a){a=a|0;return 2147483647}function Ji(a){a=a|0;return 2147483647}function Ki(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Li(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Mi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Ni(a,b){a=a|0;b=b|0;De(a,1,45);return}function Oi(a){a=a|0;return 0}function Pi(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function Qi(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function Ri(a){a=a|0;Ud(a|0);Pm(a);return}function Si(a){a=a|0;Ud(a|0);return}function Ti(a){a=a|0;return 2147483647}function Ui(a){a=a|0;return 2147483647}function Vi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Wi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Xi(a,b){a=a|0;b=b|0;dn(a|0,0,12)|0;return}function Yi(a,b){a=a|0;b=b|0;De(a,1,45);return}function Zi(a){a=a|0;return 0}function _i(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function $i(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C;C=C>>8;a[c+1|0]=C;C=C>>8;a[c+2|0]=C;C=C>>8;a[c+3|0]=C;return}function aj(a){a=a|0;Ud(a|0);Pm(a);return}function bj(a){a=a|0;Ud(a|0);return}function cj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;l=i;i=i+280|0;z=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[z>>2];z=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[z>>2];z=l|0;u=l+16|0;w=l+120|0;p=l+128|0;v=l+136|0;r=l+144|0;x=l+152|0;q=l+160|0;t=l+176|0;d=w|0;c[d>>2]=u;m=w+4|0;c[m>>2]=162;u=u+100|0;Ne(v,h);o=v|0;y=c[o>>2]|0;if(!((c[3402]|0)==-1)){c[z>>2]=13608;c[z+4>>2]=14;c[z+8>>2]=0;oe(13608,z,96)}A=(c[3403]|0)-1|0;z=c[y+8>>2]|0;if((c[y+12>>2]|0)-z>>2>>>0>A>>>0?(s=c[z+(A<<2)>>2]|0,(s|0)!=0):0){y=s;a[r]=0;f=f|0;c[x>>2]=c[f>>2];do{if(ej(e,x,g,v,c[h+4>>2]|0,j,r,y,w,p,u)|0){h=q|0;Ac[c[(c[s>>2]|0)+32>>2]&15](y,2208,2218,h)|0;s=t|0;v=c[p>>2]|0;t=c[d>>2]|0;g=v-t|0;if((g|0)>98){g=Im(g+2|0)|0;if((g|0)==0){Um();u=0;g=0}else{u=g}}else{u=s;g=0}if((a[r]|0)!=0){a[u]=45;u=u+1|0}if(t>>>0<v>>>0){r=q+10|0;do{x=a[t]|0;v=h;while(1){w=v+1|0;if((a[v]|0)==x<<24>>24){break}if((w|0)==(r|0)){v=r;break}else{v=w}}a[u]=a[2208+(v-q)|0]|0;t=t+1|0;u=u+1|0}while(t>>>0<(c[p>>2]|0)>>>0)}a[u]=0;A=Tb(s|0,1416,(z=i,i=i+8|0,c[z>>2]=k,z)|0)|0;i=z;if((A|0)==1){if((g|0)==0){break}Jm(g);break}A=cc(8)|0;ae(A,1368);zb(A|0,8312,26)}}while(0);k=e|0;e=c[k>>2]|0;if((e|0)!=0){if((c[e+12>>2]|0)==(c[e+16>>2]|0)?(sc[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1:0){c[k>>2]=0;e=0}}else{e=0}k=(e|0)==0;p=c[f>>2]|0;do{if((p|0)!=0){if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(k){break}else{n=47;break}}if(!((sc[c[(c[p>>2]|0)+36>>2]&127](p)|0)==-1)){if(k){break}else{n=47;break}}else{c[f>>2]=0;n=45;break}}else{n=45}}while(0);if((n|0)==45?k:0){n=47}if((n|0)==47){c[j>>2]=c[j>>2]|2}c[b>>2]=e;Wd(c[o>>2]|0)|0;b=c[d>>2]|0;c[d>>2]=0;if((b|0)==0){i=l;return}nc[c[m>>2]&511](b);i=l;return}A=cc(4)|0;nm(A);zb(A|0,8296,130)}function dj(a){a=a|0;return}function ej(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0;q=i;i=i+408|0;_=f;L=i;i=i+4|0;i=i+7&-8;c[L>>2]=c[_>>2];_=q|0;F=q+400|0;y=i;i=i+1|0;i=i+7&-8;A=i;i=i+1|0;i=i+7&-8;f=i;i=i+12|0;i=i+7&-8;s=i;i=i+12|0;i=i+7&-8;u=i;i=i+12|0;i=i+7&-8;t=i;i=i+12|0;i=i+7&-8;r=i;i=i+12|0;i=i+7&-8;z=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;Z=_|0;c[F>>2]=0;C=f;dn(C|0,0,12)|0;D=s;dn(D|0,0,12)|0;B=u;dn(B|0,0,12)|0;x=t;dn(x|0,0,12)|0;E=r;dn(E|0,0,12)|0;ij(g,h,F,y,A,f,s,u,t,z);h=n|0;c[o>>2]=c[h>>2];g=e|0;e=L|0;L=m+8|0;G=t+1|0;H=t+4|0;I=t+8|0;J=u+1|0;m=u+4|0;K=u+8|0;S=(j&512|0)!=0;R=s+1|0;P=s+8|0;Q=s+4|0;N=r;O=N+1|0;T=r+8|0;M=r+4|0;j=F+3|0;n=n+4|0;U=f+4|0;X=162;Y=Z;_=_+400|0;V=0;W=0;a:while(1){$=c[g>>2]|0;do{if(($|0)!=0){if((c[$+12>>2]|0)==(c[$+16>>2]|0)){if((sc[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[g>>2]=0;$=0;break}else{$=c[g>>2]|0;break}}}else{$=0}}while(0);aa=($|0)==0;$=c[e>>2]|0;do{if(($|0)!=0){if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(aa){break}else{w=310;break a}}if(!((sc[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1)){if(aa){break}else{w=310;break a}}else{c[e>>2]=0;w=15;break}}else{w=15}}while(0);if((w|0)==15){w=0;if(aa){w=310;break}else{$=0}}b:do{switch(a[F+V|0]|0){case 1:{if((V|0)==3){w=310;break a}aa=c[g>>2]|0;w=c[aa+12>>2]|0;if((w|0)==(c[aa+16>>2]|0)){w=(sc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0)&255}else{w=a[w]|0}if(!(w<<24>>24>-1)){w=41;break a}if((b[(c[L>>2]|0)+(w<<24>>24<<1)>>1]&8192)==0){w=41;break a}w=c[g>>2]|0;ba=w+12|0;aa=c[ba>>2]|0;if((aa|0)==(c[w+16>>2]|0)){w=(sc[c[(c[w>>2]|0)+40>>2]&127](w)|0)&255}else{c[ba>>2]=aa+1;w=a[aa]|0}ye(r,w);w=42;break};case 0:{w=42;break};case 3:{$=a[B]|0;ba=($&1)==0;if(ba){ea=($&255)>>>1}else{ea=c[m>>2]|0}aa=a[x]|0;ca=(aa&1)==0;if(ca){da=(aa&255)>>>1}else{da=c[H>>2]|0}if((ea|0)!=(-da|0)){if(ba){da=($&255)>>>1}else{da=c[m>>2]|0}if((da|0)!=0){if(ca){ca=(aa&255)>>>1}else{ca=c[H>>2]|0}if((ca|0)!=0){ba=c[g>>2]|0;da=c[ba+12>>2]|0;ca=c[ba+16>>2]|0;if((da|0)==(ca|0)){aa=(sc[c[(c[ba>>2]|0)+36>>2]&127](ba)|0)&255;ca=c[g>>2]|0;$=a[B]|0;ba=ca;da=c[ca+12>>2]|0;ca=c[ca+16>>2]|0}else{aa=a[da]|0}ea=ba+12|0;ca=(da|0)==(ca|0);if(aa<<24>>24==(a[($&1)==0?J:c[K>>2]|0]|0)){if(ca){sc[c[(c[ba>>2]|0)+40>>2]&127](ba)|0}else{c[ea>>2]=da+1}$=a[B]|0;if(($&1)==0){$=($&255)>>>1}else{$=c[m>>2]|0}W=$>>>0>1>>>0?u:W;break b}if(ca){$=(sc[c[(c[ba>>2]|0)+36>>2]&127](ba)|0)&255}else{$=a[da]|0}if(!($<<24>>24==(a[(a[x]&1)==0?G:c[I>>2]|0]|0))){w=136;break a}ba=c[g>>2]|0;$=ba+12|0;aa=c[$>>2]|0;if((aa|0)==(c[ba+16>>2]|0)){sc[c[(c[ba>>2]|0)+40>>2]&127](ba)|0}else{c[$>>2]=aa+1}a[l]=1;$=a[x]|0;if(($&1)==0){$=($&255)>>>1}else{$=c[H>>2]|0}W=$>>>0>1>>>0?t:W;break b}}if(ba){ba=($&255)>>>1}else{ba=c[m>>2]|0}ca=c[g>>2]|0;da=c[ca+12>>2]|0;ea=(da|0)==(c[ca+16>>2]|0);if((ba|0)==0){if(ea){$=(sc[c[(c[ca>>2]|0)+36>>2]&127](ca)|0)&255;aa=a[x]|0}else{$=a[da]|0}if(!($<<24>>24==(a[(aa&1)==0?G:c[I>>2]|0]|0))){break b}ba=c[g>>2]|0;$=ba+12|0;aa=c[$>>2]|0;if((aa|0)==(c[ba+16>>2]|0)){sc[c[(c[ba>>2]|0)+40>>2]&127](ba)|0}else{c[$>>2]=aa+1}a[l]=1;$=a[x]|0;if(($&1)==0){$=($&255)>>>1}else{$=c[H>>2]|0}W=$>>>0>1>>>0?t:W;break b}if(ea){aa=(sc[c[(c[ca>>2]|0)+36>>2]&127](ca)|0)&255;$=a[B]|0}else{aa=a[da]|0}if(!(aa<<24>>24==(a[($&1)==0?J:c[K>>2]|0]|0))){a[l]=1;break b}$=c[g>>2]|0;aa=$+12|0;ba=c[aa>>2]|0;if((ba|0)==(c[$+16>>2]|0)){sc[c[(c[$>>2]|0)+40>>2]&127]($)|0}else{c[aa>>2]=ba+1}$=a[B]|0;if(($&1)==0){$=($&255)>>>1}else{$=c[m>>2]|0}W=$>>>0>1>>>0?u:W}break};case 2:{if(!((W|0)!=0|V>>>0<2>>>0)){if((V|0)==2){aa=(a[j]|0)!=0}else{aa=0}if(!(S|aa)){W=0;break b}}ba=a[D]|0;ca=(ba&1)==0;aa=ca?R:c[P>>2]|0;c:do{if((V|0)!=0?(d[F+(V-1)|0]|0)>>>0<2>>>0:0){ca=aa+(ca?(ba&255)>>>1:c[Q>>2]|0)|0;da=aa;while(1){if((da|0)==(ca|0)){break}ea=a[da]|0;if(!(ea<<24>>24>-1)){ca=da;break}if((b[(c[L>>2]|0)+(ea<<24>>24<<1)>>1]&8192)==0){ca=da;break}else{da=da+1|0}}da=ca-aa|0;fa=a[E]|0;ea=(fa&1)==0;if(ea){ga=(fa&255)>>>1}else{ga=c[M>>2]|0}if(!(da>>>0>ga>>>0)){if(ea){ga=(fa&255)>>>1;ea=ga;fa=O;ga=ga-da+(N+1)|0}else{ha=c[T>>2]|0;ga=c[M>>2]|0;ea=ga;fa=ha;ga=ha+(ga-da)|0}da=fa+ea|0;if((ga|0)==(da|0)){aa=ca;da=$;ca=$}else{ea=aa;while(1){if((a[ga]|0)!=(a[ea]|0)){da=$;ca=$;break c}ga=ga+1|0;if((ga|0)==(da|0)){aa=ca;da=$;ca=$;break}else{ea=ea+1|0}}}}else{da=$;ca=$}}else{da=$;ca=$}}while(0);d:while(1){if((ba&1)==0){ba=(ba&255)>>>1;$=R}else{ba=c[Q>>2]|0;$=c[P>>2]|0}if((aa|0)==($+ba|0)){break}$=c[g>>2]|0;do{if(($|0)!=0){if((c[$+12>>2]|0)==(c[$+16>>2]|0)){if((sc[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[g>>2]=0;$=0;break}else{$=c[g>>2]|0;break}}}else{$=0}}while(0);$=($|0)==0;do{if((da|0)!=0){if((c[da+12>>2]|0)!=(c[da+16>>2]|0)){if($){$=da;break}else{break d}}if(!((sc[c[(c[da>>2]|0)+36>>2]&127](da)|0)==-1)){if($^(ca|0)==0){$=ca;break}else{break d}}else{c[e>>2]=0;ca=0;w=173;break}}else{w=173}}while(0);if((w|0)==173){w=0;if($){break}else{$=0}}ba=c[g>>2]|0;da=c[ba+12>>2]|0;if((da|0)==(c[ba+16>>2]|0)){ba=(sc[c[(c[ba>>2]|0)+36>>2]&127](ba)|0)&255}else{ba=a[da]|0}if(!(ba<<24>>24==(a[aa]|0))){break}ba=c[g>>2]|0;da=ba+12|0;ea=c[da>>2]|0;if((ea|0)==(c[ba+16>>2]|0)){sc[c[(c[ba>>2]|0)+40>>2]&127](ba)|0}else{c[da>>2]=ea+1}aa=aa+1|0;ba=a[D]|0;da=$}if(S){$=a[D]|0;if(($&1)==0){ba=($&255)>>>1;$=R}else{ba=c[Q>>2]|0;$=c[P>>2]|0}if((aa|0)!=($+ba|0)){w=189;break a}}break};case 4:{$=0;e:while(1){aa=c[g>>2]|0;do{if((aa|0)!=0){if((c[aa+12>>2]|0)==(c[aa+16>>2]|0)){if((sc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0)==-1){c[g>>2]=0;aa=0;break}else{aa=c[g>>2]|0;break}}}else{aa=0}}while(0);aa=(aa|0)==0;ba=c[e>>2]|0;do{if((ba|0)!=0){if((c[ba+12>>2]|0)!=(c[ba+16>>2]|0)){if(aa){break}else{break e}}if(!((sc[c[(c[ba>>2]|0)+36>>2]&127](ba)|0)==-1)){if(aa){break}else{break e}}else{c[e>>2]=0;w=202;break}}else{w=202}}while(0);if((w|0)==202?(w=0,aa):0){break}aa=c[g>>2]|0;ba=c[aa+12>>2]|0;if((ba|0)==(c[aa+16>>2]|0)){aa=(sc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0)&255}else{aa=a[ba]|0}if(aa<<24>>24>-1?!((b[(c[L>>2]|0)+(aa<<24>>24<<1)>>1]&2048)==0):0){ba=c[o>>2]|0;if((ba|0)==(p|0)){ca=(c[n>>2]|0)!=162;da=c[h>>2]|0;ba=p-da|0;p=ba>>>0<2147483647>>>0?ba<<1:-1;da=Km(ca?da:0,p)|0;if((da|0)==0){Um()}if(!ca){ca=c[h>>2]|0;c[h>>2]=da;if((ca|0)!=0){nc[c[n>>2]&511](ca);da=c[h>>2]|0}}else{c[h>>2]=da}c[n>>2]=80;ba=da+ba|0;c[o>>2]=ba;p=(c[h>>2]|0)+p|0}c[o>>2]=ba+1;a[ba]=aa;$=$+1|0}else{ba=a[C]|0;if((ba&1)==0){ba=(ba&255)>>>1}else{ba=c[U>>2]|0}if((ba|0)==0|($|0)==0){break}if(!(aa<<24>>24==(a[A]|0))){break}if((Z|0)==(_|0)){Z=Z-Y|0;_=Z>>>0<2147483647>>>0?Z<<1:-1;if((X|0)==162){Y=0}ha=Km(Y,_)|0;Y=ha;if((ha|0)==0){Um()}_=Y+(_>>>2<<2)|0;Z=Y+(Z>>2<<2)|0;X=80}c[Z>>2]=$;$=0;Z=Z+4|0}aa=c[g>>2]|0;ba=aa+12|0;ca=c[ba>>2]|0;if((ca|0)==(c[aa+16>>2]|0)){sc[c[(c[aa>>2]|0)+40>>2]&127](aa)|0;continue}else{c[ba>>2]=ca+1;continue}}if(!((Y|0)==(Z|0)|($|0)==0)){if((Z|0)==(_|0)){Z=Z-Y|0;_=Z>>>0<2147483647>>>0?Z<<1:-1;if((X|0)==162){Y=0}ha=Km(Y,_)|0;Y=ha;if((ha|0)==0){Um()}_=Y+(_>>>2<<2)|0;Z=Y+(Z>>2<<2)|0;X=80}c[Z>>2]=$;Z=Z+4|0}if((c[z>>2]|0)>0){$=c[g>>2]|0;do{if(($|0)!=0){if((c[$+12>>2]|0)==(c[$+16>>2]|0)){if((sc[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[g>>2]=0;$=0;break}else{$=c[g>>2]|0;break}}}else{$=0}}while(0);aa=($|0)==0;$=c[e>>2]|0;do{if(($|0)!=0){if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(aa){break}else{w=264;break a}}if(!((sc[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1)){if(aa){break}else{w=264;break a}}else{c[e>>2]=0;w=257;break}}else{w=257}}while(0);if((w|0)==257){w=0;if(aa){w=264;break a}else{$=0}}aa=c[g>>2]|0;ba=c[aa+12>>2]|0;if((ba|0)==(c[aa+16>>2]|0)){aa=(sc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0)&255}else{aa=a[ba]|0}if(!(aa<<24>>24==(a[y]|0))){w=264;break a}aa=c[g>>2]|0;ba=aa+12|0;ca=c[ba>>2]|0;if((ca|0)==(c[aa+16>>2]|0)){sc[c[(c[aa>>2]|0)+40>>2]&127](aa)|0;aa=$;ba=$}else{c[ba>>2]=ca+1;aa=$;ba=$}while(1){$=c[g>>2]|0;do{if(($|0)!=0){if((c[$+12>>2]|0)==(c[$+16>>2]|0)){if((sc[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[g>>2]=0;$=0;break}else{$=c[g>>2]|0;break}}}else{$=0}}while(0);ca=($|0)==0;do{if((aa|0)!=0){if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){if(ca){$=ba;break}else{w=288;break a}}if(!((sc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0)==-1)){if(ca^(ba|0)==0){$=ba;aa=ba;break}else{w=288;break a}}else{c[e>>2]=0;$=0;w=280;break}}else{$=ba;w=280}}while(0);if((w|0)==280){w=0;if(ca){w=288;break a}else{aa=0}}ba=c[g>>2]|0;ca=c[ba+12>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){ba=(sc[c[(c[ba>>2]|0)+36>>2]&127](ba)|0)&255}else{ba=a[ca]|0}if(!(ba<<24>>24>-1)){w=288;break a}if((b[(c[L>>2]|0)+(ba<<24>>24<<1)>>1]&2048)==0){w=288;break a}ba=c[o>>2]|0;if((ba|0)==(p|0)){ca=(c[n>>2]|0)!=162;da=c[h>>2]|0;p=p-da|0;ba=p>>>0<2147483647>>>0?p<<1:-1;da=Km(ca?da:0,ba)|0;if((da|0)==0){Um()}if(!ca){ca=c[h>>2]|0;c[h>>2]=da;if((ca|0)!=0){nc[c[n>>2]&511](ca);da=c[h>>2]|0}}else{c[h>>2]=da}c[n>>2]=80;ha=da+p|0;c[o>>2]=ha;p=(c[h>>2]|0)+ba|0;ba=ha}da=c[g>>2]|0;ca=c[da+12>>2]|0;if((ca|0)==(c[da+16>>2]|0)){ca=(sc[c[(c[da>>2]|0)+36>>2]&127](da)|0)&255;ba=c[o>>2]|0}else{ca=a[ca]|0}c[o>>2]=ba+1;a[ba]=ca;da=(c[z>>2]|0)-1|0;c[z>>2]=da;ba=c[g>>2]|0;ca=ba+12|0;ea=c[ca>>2]|0;if((ea|0)==(c[ba+16>>2]|0)){sc[c[(c[ba>>2]|0)+40>>2]&127](ba)|0}else{c[ca>>2]=ea+1}if((da|0)>0){ba=$}else{break}}}if((c[o>>2]|0)==(c[h>>2]|0)){w=308;break a}break};default:{}}}while(0);f:do{if((w|0)==42){w=0;if((V|0)==3){w=310;break a}else{ba=$;aa=$}while(1){$=c[g>>2]|0;do{if(($|0)!=0){if((c[$+12>>2]|0)==(c[$+16>>2]|0)){if((sc[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[g>>2]=0;$=0;break}else{$=c[g>>2]|0;break}}}else{$=0}}while(0);$=($|0)==0;do{if((ba|0)!=0){if((c[ba+12>>2]|0)!=(c[ba+16>>2]|0)){if($){$=ba;break}else{break f}}if(!((sc[c[(c[ba>>2]|0)+36>>2]&127](ba)|0)==-1)){if($^(aa|0)==0){$=aa;break}else{break f}}else{c[e>>2]=0;aa=0;w=55;break}}else{w=55}}while(0);if((w|0)==55){w=0;if($){break f}else{$=0}}ca=c[g>>2]|0;ba=c[ca+12>>2]|0;if((ba|0)==(c[ca+16>>2]|0)){ba=(sc[c[(c[ca>>2]|0)+36>>2]&127](ca)|0)&255}else{ba=a[ba]|0}if(!(ba<<24>>24>-1)){break f}if((b[(c[L>>2]|0)+(ba<<24>>24<<1)>>1]&8192)==0){break f}ba=c[g>>2]|0;da=ba+12|0;ca=c[da>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){ba=(sc[c[(c[ba>>2]|0)+40>>2]&127](ba)|0)&255}else{c[da>>2]=ca+1;ba=a[ca]|0}ye(r,ba);ba=$}}}while(0);V=V+1|0;if(!(V>>>0<4>>>0)){w=310;break}}g:do{if((w|0)==41){c[k>>2]=c[k>>2]|4;k=0}else if((w|0)==136){c[k>>2]=c[k>>2]|4;k=0}else if((w|0)==189){c[k>>2]=c[k>>2]|4;k=0}else if((w|0)==264){c[k>>2]=c[k>>2]|4;k=0}else if((w|0)==288){c[k>>2]=c[k>>2]|4;k=0}else if((w|0)==308){c[k>>2]=c[k>>2]|4;k=0}else if((w|0)==310){h:do{if((W|0)!=0){o=W;l=W+1|0;x=W+8|0;y=W+4|0;z=1;i:while(1){A=a[o]|0;if((A&1)==0){A=(A&255)>>>1}else{A=c[y>>2]|0}if(!(z>>>0<A>>>0)){break h}A=c[g>>2]|0;do{if((A|0)!=0){if((c[A+12>>2]|0)==(c[A+16>>2]|0)){if((sc[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1){c[g>>2]=0;A=0;break}else{A=c[g>>2]|0;break}}}else{A=0}}while(0);A=(A|0)==0;B=c[e>>2]|0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break i}}if(!((sc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1)){if(A){break}else{break i}}else{c[e>>2]=0;w=328;break}}else{w=328}}while(0);if((w|0)==328?(w=0,A):0){break}A=c[g>>2]|0;B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){B=(sc[c[(c[A>>2]|0)+36>>2]&127](A)|0)&255}else{B=a[B]|0}if((a[o]&1)==0){A=l}else{A=c[x>>2]|0}if(!(B<<24>>24==(a[A+z|0]|0))){break}z=z+1|0;C=c[g>>2]|0;B=C+12|0;A=c[B>>2]|0;if((A|0)==(c[C+16>>2]|0)){sc[c[(c[C>>2]|0)+40>>2]&127](C)|0;continue}else{c[B>>2]=A+1;continue}}c[k>>2]=c[k>>2]|4;k=0;break g}}while(0);if((Y|0)!=(Z|0)){c[v>>2]=0;jj(f,Y,Z,v);if((c[v>>2]|0)==0){k=1}else{c[k>>2]=c[k>>2]|4;k=0}}else{k=1;Y=Z}}}while(0);te(r);te(t);te(u);te(s);te(f);if((Y|0)==0){i=q;return k|0}nc[X&511](Y);i=q;return k|0}function fj(a){a=a|0;var b=0;b=cc(8)|0;ae(b,a);zb(b|0,8312,26)}function gj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;m=i;i=i+160|0;x=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[x>>2];x=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[x>>2];x=m|0;w=m+16|0;t=m+120|0;q=m+128|0;u=m+136|0;r=m+144|0;v=m+152|0;d=t|0;c[d>>2]=w;n=t+4|0;c[n>>2]=162;w=w+100|0;Ne(u,h);o=u|0;p=c[o>>2]|0;if(!((c[3402]|0)==-1)){c[x>>2]=13608;c[x+4>>2]=14;c[x+8>>2]=0;oe(13608,x,96)}y=(c[3403]|0)-1|0;x=c[p+8>>2]|0;if((c[p+12>>2]|0)-x>>2>>>0>y>>>0?(s=c[x+(y<<2)>>2]|0,(s|0)!=0):0){x=s;a[r]=0;f=f|0;p=c[f>>2]|0;c[v>>2]=p;if(ej(e,v,g,u,c[h+4>>2]|0,j,r,x,t,q,w)|0){g=k;if((a[g]&1)==0){a[k+1|0]=0;a[g]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}if((a[r]|0)!=0){ye(k,pc[c[(c[s>>2]|0)+28>>2]&63](x,45)|0)}r=pc[c[(c[s>>2]|0)+28>>2]&63](x,48)|0;g=c[d>>2]|0;q=c[q>>2]|0;s=q-1|0;a:do{if(g>>>0<s>>>0){while(1){h=g+1|0;if(!((a[g]|0)==r<<24>>24)){break a}if(h>>>0<s>>>0){g=h}else{g=h;break}}}}while(0);hj(k,g,q)|0}e=e|0;k=c[e>>2]|0;if((k|0)!=0){if((c[k+12>>2]|0)==(c[k+16>>2]|0)?(sc[c[(c[k>>2]|0)+36>>2]&127](k)|0)==-1:0){c[e>>2]=0;k=0}}else{k=0}e=(k|0)==0;do{if((p|0)!=0){if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(e){break}else{l=35;break}}if(!((sc[c[(c[p>>2]|0)+36>>2]&127](p)|0)==-1)){if(e^(p|0)==0){break}else{l=35;break}}else{c[f>>2]=0;l=33;break}}else{l=33}}while(0);if((l|0)==33?e:0){l=35}if((l|0)==35){c[j>>2]=c[j>>2]|2}c[b>>2]=k;Wd(c[o>>2]|0)|0;l=c[d>>2]|0;c[d>>2]=0;if((l|0)==0){i=m;return}nc[c[n>>2]&511](l);i=m;return}y=cc(4)|0;nm(y);zb(y|0,8296,130)}function hj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;i=d;g=a[f]|0;if((g&1)==0){k=10;j=g;g=(g&255)>>>1}else{j=c[b>>2]|0;k=(j&-2)-1|0;j=j&255;g=c[b+4>>2]|0}h=e-i|0;if((e|0)==(d|0)){return b|0}if((k-g|0)>>>0<h>>>0){Be(b,k,g+h-k|0,g,g,0,0);j=a[f]|0}if((j&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}i=e+(g-i)|0;k=j+g|0;while(1){a[k]=a[d]|0;d=d+1|0;if((d|0)==(e|0)){break}else{k=k+1|0}}a[j+i|0]=0;e=g+h|0;if((a[f]&1)==0){a[f]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function ij(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;n=i;i=i+176|0;y=n|0;z=n+16|0;x=n+32|0;u=n+40|0;t=n+56|0;r=n+72|0;o=n+88|0;w=n+104|0;v=n+112|0;s=n+128|0;q=n+144|0;p=n+160|0;if(b){p=c[d>>2]|0;if(!((c[3520]|0)==-1)){c[z>>2]=14080;c[z+4>>2]=14;c[z+8>>2]=0;oe(14080,z,96)}s=(c[3521]|0)-1|0;q=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-q>>2>>>0>s>>>0)){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}p=c[q+(s<<2)>>2]|0;if((p|0)==0){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}q=p;oc[c[(c[p>>2]|0)+44>>2]&127](x,q);C=c[x>>2]|0;a[e]=C;C=C>>8;a[e+1|0]=C;C=C>>8;a[e+2|0]=C;C=C>>8;a[e+3|0]=C;e=p;oc[c[(c[e>>2]|0)+32>>2]&127](u,q);s=l;if((a[s]&1)==0){a[l+1|0]=0;a[s]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xe(l,0);l=u;c[s>>2]=c[l>>2];c[s+4>>2]=c[l+4>>2];c[s+8>>2]=c[l+8>>2];dn(l|0,0,12)|0;te(u);oc[c[(c[e>>2]|0)+28>>2]&127](t,q);l=k;if((a[l]&1)==0){a[k+1|0]=0;a[l]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}xe(k,0);b=t;c[l>>2]=c[b>>2];c[l+4>>2]=c[b+4>>2];c[l+8>>2]=c[b+8>>2];dn(b|0,0,12)|0;te(t);b=p;a[f]=sc[c[(c[b>>2]|0)+12>>2]&127](q)|0;a[g]=sc[c[(c[b>>2]|0)+16>>2]&127](q)|0;oc[c[(c[e>>2]|0)+20>>2]&127](r,q);g=h;if((a[g]&1)==0){a[h+1|0]=0;a[g]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}xe(h,0);h=r;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];c[g+8>>2]=c[h+8>>2];dn(h|0,0,12)|0;te(r);oc[c[(c[e>>2]|0)+24>>2]&127](o,q);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xe(j,0);b=o;c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];dn(b|0,0,12)|0;te(o);b=sc[c[(c[p>>2]|0)+36>>2]&127](q)|0;c[m>>2]=b;i=n;return}else{o=c[d>>2]|0;if(!((c[3522]|0)==-1)){c[y>>2]=14088;c[y+4>>2]=14;c[y+8>>2]=0;oe(14088,y,96)}t=(c[3523]|0)-1|0;r=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-r>>2>>>0>t>>>0)){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}r=c[r+(t<<2)>>2]|0;if((r|0)==0){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}o=r;oc[c[(c[r>>2]|0)+44>>2]&127](w,o);C=c[w>>2]|0;a[e]=C;C=C>>8;a[e+1|0]=C;C=C>>8;a[e+2|0]=C;C=C>>8;a[e+3|0]=C;e=r;oc[c[(c[e>>2]|0)+32>>2]&127](v,o);t=l;if((a[t]&1)==0){a[l+1|0]=0;a[t]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xe(l,0);l=v;c[t>>2]=c[l>>2];c[t+4>>2]=c[l+4>>2];c[t+8>>2]=c[l+8>>2];dn(l|0,0,12)|0;te(v);oc[c[(c[e>>2]|0)+28>>2]&127](s,o);l=k;if((a[l]&1)==0){a[k+1|0]=0;a[l]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}xe(k,0);b=s;c[l>>2]=c[b>>2];c[l+4>>2]=c[b+4>>2];c[l+8>>2]=c[b+8>>2];dn(b|0,0,12)|0;te(s);b=r;a[f]=sc[c[(c[b>>2]|0)+12>>2]&127](o)|0;a[g]=sc[c[(c[b>>2]|0)+16>>2]&127](o)|0;oc[c[(c[e>>2]|0)+20>>2]&127](q,o);g=h;if((a[g]&1)==0){a[h+1|0]=0;a[g]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}xe(h,0);h=q;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];c[g+8>>2]=c[h+8>>2];dn(h|0,0,12)|0;te(q);oc[c[(c[e>>2]|0)+24>>2]&127](p,o);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xe(j,0);b=p;c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];dn(b|0,0,12)|0;te(p);b=sc[c[(c[r>>2]|0)+36>>2]&127](o)|0;c[m>>2]=b;i=n;return}}function jj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;g=b;i=a[g]|0;if((i&1)==0){j=(i&255)>>>1}else{j=c[b+4>>2]|0}if((j|0)==0){return}if((d|0)!=(e|0)?(h=e-4|0,h>>>0>d>>>0):0){i=d;do{j=c[i>>2]|0;c[i>>2]=c[h>>2];c[h>>2]=j;i=i+4|0;h=h-4|0}while(i>>>0<h>>>0);i=a[g]|0}if((i&1)==0){j=(i&255)>>>1;g=b+1|0}else{j=c[b+4>>2]|0;g=c[b+8>>2]|0}e=e-4|0;i=a[g]|0;h=i<<24>>24<1|i<<24>>24==127;a:do{if(e>>>0>d>>>0){b=g+j|0;while(1){if(!h?(i<<24>>24|0)!=(c[d>>2]|0):0){break}g=(b-g|0)>1?g+1|0:g;d=d+4|0;i=a[g]|0;h=i<<24>>24<1|i<<24>>24==127;if(!(d>>>0<e>>>0)){break a}}c[f>>2]=4;return}}while(0);if(h){return}j=c[e>>2]|0;if(!(i<<24>>24>>>0<j>>>0|(j|0)==0)){return}c[f>>2]=4;return}function kj(a){a=a|0;Ud(a|0);Pm(a);return}function lj(a){a=a|0;Ud(a|0);return}function mj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+600|0;z=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[z>>2];z=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[z>>2];z=d|0;u=d+16|0;x=d+416|0;p=d+424|0;v=d+432|0;r=d+440|0;w=d+448|0;q=d+456|0;t=d+496|0;l=x|0;c[l>>2]=u;m=x+4|0;c[m>>2]=162;u=u+400|0;Ne(v,h);o=v|0;y=c[o>>2]|0;if(!((c[3400]|0)==-1)){c[z>>2]=13600;c[z+4>>2]=14;c[z+8>>2]=0;oe(13600,z,96)}z=(c[3401]|0)-1|0;A=c[y+8>>2]|0;if((c[y+12>>2]|0)-A>>2>>>0>z>>>0?(s=c[A+(z<<2)>>2]|0,(s|0)!=0):0){y=s;a[r]=0;f=f|0;c[w>>2]=c[f>>2];do{if(nj(e,w,g,v,c[h+4>>2]|0,j,r,y,x,p,u)|0){h=q|0;Ac[c[(c[s>>2]|0)+48>>2]&15](y,2192,2202,h)|0;s=t|0;v=c[p>>2]|0;g=c[l>>2]|0;t=v-g|0;if((t|0)>392){t=Im((t>>2)+2|0)|0;if((t|0)==0){Um();u=0;t=0}else{u=t}}else{u=s;t=0}if((a[r]|0)!=0){a[u]=45;u=u+1|0}if(g>>>0<v>>>0){r=q+40|0;do{w=c[g>>2]|0;x=h;while(1){v=x+4|0;if((c[x>>2]|0)==(w|0)){break}if((v|0)==(r|0)){x=r;break}else{x=v}}a[u]=a[2192+(x-q>>2)|0]|0;g=g+4|0;u=u+1|0}while(g>>>0<(c[p>>2]|0)>>>0)}a[u]=0;A=Tb(s|0,1416,(z=i,i=i+8|0,c[z>>2]=k,z)|0)|0;i=z;if((A|0)==1){if((t|0)==0){break}Jm(t);break}A=cc(8)|0;ae(A,1368);zb(A|0,8312,26)}}while(0);k=e|0;e=c[k>>2]|0;do{if((e|0)!=0){p=c[e+12>>2]|0;if((p|0)==(c[e+16>>2]|0)){e=sc[c[(c[e>>2]|0)+36>>2]&127](e)|0}else{e=c[p>>2]|0}if((e|0)==-1){c[k>>2]=0;e=1;break}else{e=(c[k>>2]|0)==0;break}}else{e=1}}while(0);p=c[f>>2]|0;do{if((p|0)!=0){q=c[p+12>>2]|0;if((q|0)==(c[p+16>>2]|0)){p=sc[c[(c[p>>2]|0)+36>>2]&127](p)|0}else{p=c[q>>2]|0}if(!((p|0)==-1)){if(e){break}else{n=49;break}}else{c[f>>2]=0;n=47;break}}else{n=47}}while(0);if((n|0)==47?e:0){n=49}if((n|0)==49){c[j>>2]=c[j>>2]|2}c[b>>2]=c[k>>2];Wd(c[o>>2]|0)|0;j=c[l>>2]|0;c[l>>2]=0;if((j|0)==0){i=d;return}nc[c[m>>2]&511](j);i=d;return}A=cc(4)|0;nm(A);zb(A|0,8296,130)}function nj(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;p=i;i=i+416|0;y=e;H=i;i=i+4|0;i=i+7&-8;c[H>>2]=c[y>>2];y=p|0;V=p+8|0;J=p+408|0;w=i;i=i+4|0;i=i+7&-8;z=i;i=i+4|0;i=i+7&-8;s=i;i=i+12|0;i=i+7&-8;e=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;t=i;i=i+12|0;i=i+7&-8;r=i;i=i+12|0;i=i+7&-8;x=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;c[y>>2]=o;U=V|0;c[J>>2]=0;D=s;dn(D|0,0,12)|0;C=e;dn(C|0,0,12)|0;o=q;dn(o|0,0,12)|0;A=t;dn(A|0,0,12)|0;B=r;dn(B|0,0,12)|0;qj(f,g,J,w,z,s,e,q,t,x);f=m|0;c[n>>2]=c[f>>2];b=b|0;g=H|0;H=l;I=t+4|0;E=t+8|0;G=q+4|0;F=q+8|0;M=(h&512|0)!=0;K=e+4|0;L=e+8|0;h=r+4|0;O=r+8|0;N=J+3|0;P=s+4|0;S=162;T=U;V=V+400|0;Q=0;R=0;a:while(1){W=c[b>>2]|0;do{if((W|0)!=0){X=c[W+12>>2]|0;if((X|0)==(c[W+16>>2]|0)){W=sc[c[(c[W>>2]|0)+36>>2]&127](W)|0}else{W=c[X>>2]|0}if((W|0)==-1){c[b>>2]=0;X=1;break}else{X=(c[b>>2]|0)==0;break}}else{X=1}}while(0);W=c[g>>2]|0;do{if((W|0)!=0){Y=c[W+12>>2]|0;if((Y|0)==(c[W+16>>2]|0)){Y=sc[c[(c[W>>2]|0)+36>>2]&127](W)|0}else{Y=c[Y>>2]|0}if(!((Y|0)==-1)){if(X){break}else{v=302;break a}}else{c[g>>2]=0;v=16;break}}else{v=16}}while(0);if((v|0)==16){v=0;if(X){v=302;break}else{W=0}}b:do{switch(a[J+Q|0]|0){case 4:{W=0;c:while(1){X=c[b>>2]|0;do{if((X|0)!=0){Y=c[X+12>>2]|0;if((Y|0)==(c[X+16>>2]|0)){X=sc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{X=c[Y>>2]|0}if((X|0)==-1){c[b>>2]=0;X=1;break}else{X=(c[b>>2]|0)==0;break}}else{X=1}}while(0);Z=c[g>>2]|0;do{if((Z|0)!=0){Y=c[Z+12>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=sc[c[(c[Z>>2]|0)+36>>2]&127](Z)|0}else{Y=c[Y>>2]|0}if(!((Y|0)==-1)){if(X){break}else{break c}}else{c[g>>2]=0;v=207;break}}else{v=207}}while(0);if((v|0)==207?(v=0,X):0){break}X=c[b>>2]|0;Y=c[X+12>>2]|0;if((Y|0)==(c[X+16>>2]|0)){X=sc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{X=c[Y>>2]|0}if(qc[c[(c[H>>2]|0)+12>>2]&63](l,2048,X)|0){Y=c[n>>2]|0;if((Y|0)==(c[y>>2]|0)){rj(m,n,y);Y=c[n>>2]|0}c[n>>2]=Y+4;c[Y>>2]=X;W=W+1|0}else{Y=a[D]|0;if((Y&1)==0){Y=(Y&255)>>>1}else{Y=c[P>>2]|0}if((Y|0)==0|(W|0)==0){break}if((X|0)!=(c[z>>2]|0)){break}if((U|0)==(V|0)){V=(S|0)!=162;U=U-T|0;X=U>>>0<2147483647>>>0?U<<1:-1;if(V){S=T}else{S=0}ba=Km(S,X)|0;S=ba;if((ba|0)==0){Um()}V=S+(X>>>2<<2)|0;U=S+(U>>2<<2)|0;T=S;S=80}c[U>>2]=W;W=0;U=U+4|0}Z=c[b>>2]|0;Y=Z+12|0;X=c[Y>>2]|0;if((X|0)==(c[Z+16>>2]|0)){sc[c[(c[Z>>2]|0)+40>>2]&127](Z)|0;continue}else{c[Y>>2]=X+4;continue}}if(!((T|0)==(U|0)|(W|0)==0)){if((U|0)==(V|0)){V=(S|0)!=162;U=U-T|0;X=U>>>0<2147483647>>>0?U<<1:-1;if(V){S=T}else{S=0}ba=Km(S,X)|0;S=ba;if((ba|0)==0){Um()}V=S+(X>>>2<<2)|0;U=S+(U>>2<<2)|0;T=S;S=80}c[U>>2]=W;U=U+4|0}W=c[x>>2]|0;if((W|0)>0){X=c[b>>2]|0;do{if((X|0)!=0){Y=c[X+12>>2]|0;if((Y|0)==(c[X+16>>2]|0)){X=sc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{X=c[Y>>2]|0}if((X|0)==-1){c[b>>2]=0;Y=1;break}else{Y=(c[b>>2]|0)==0;break}}else{Y=1}}while(0);X=c[g>>2]|0;do{if((X|0)!=0){Z=c[X+12>>2]|0;if((Z|0)==(c[X+16>>2]|0)){Z=sc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{Z=c[Z>>2]|0}if(!((Z|0)==-1)){if(Y){break}else{v=265;break a}}else{c[g>>2]=0;v=259;break}}else{v=259}}while(0);if((v|0)==259){v=0;if(Y){v=265;break a}else{X=0}}Z=c[b>>2]|0;Y=c[Z+12>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=sc[c[(c[Z>>2]|0)+36>>2]&127](Z)|0}else{Y=c[Y>>2]|0}if((Y|0)!=(c[w>>2]|0)){v=265;break a}Y=c[b>>2]|0;Z=Y+12|0;_=c[Z>>2]|0;if((_|0)==(c[Y+16>>2]|0)){sc[c[(c[Y>>2]|0)+40>>2]&127](Y)|0;Y=X;Z=X}else{c[Z>>2]=_+4;Y=X;Z=X}while(1){X=c[b>>2]|0;do{if((X|0)!=0){_=c[X+12>>2]|0;if((_|0)==(c[X+16>>2]|0)){X=sc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{X=c[_>>2]|0}if((X|0)==-1){c[b>>2]=0;_=1;break}else{_=(c[b>>2]|0)==0;break}}else{_=1}}while(0);do{if((Y|0)!=0){X=c[Y+12>>2]|0;if((X|0)==(c[Y+16>>2]|0)){X=sc[c[(c[Y>>2]|0)+36>>2]&127](Y)|0}else{X=c[X>>2]|0}if(!((X|0)==-1)){if(_^(Z|0)==0){X=Z;Y=Z;break}else{v=289;break a}}else{c[g>>2]=0;X=0;v=282;break}}else{X=Z;v=282}}while(0);if((v|0)==282){v=0;if(_){v=289;break a}else{Y=0}}Z=c[b>>2]|0;_=c[Z+12>>2]|0;if((_|0)==(c[Z+16>>2]|0)){Z=sc[c[(c[Z>>2]|0)+36>>2]&127](Z)|0}else{Z=c[_>>2]|0}if(!(qc[c[(c[H>>2]|0)+12>>2]&63](l,2048,Z)|0)){v=289;break a}if((c[n>>2]|0)==(c[y>>2]|0)){rj(m,n,y)}Z=c[b>>2]|0;_=c[Z+12>>2]|0;if((_|0)==(c[Z+16>>2]|0)){Z=sc[c[(c[Z>>2]|0)+36>>2]&127](Z)|0}else{Z=c[_>>2]|0}_=c[n>>2]|0;c[n>>2]=_+4;c[_>>2]=Z;W=W-1|0;c[x>>2]=W;Z=c[b>>2]|0;_=Z+12|0;$=c[_>>2]|0;if(($|0)==(c[Z+16>>2]|0)){sc[c[(c[Z>>2]|0)+40>>2]&127](Z)|0}else{c[_>>2]=$+4}if((W|0)<=0){break}else{Z=X}}}if((c[n>>2]|0)==(c[f>>2]|0)){v=300;break a}break};case 1:{if((Q|0)==3){v=302;break a}X=c[b>>2]|0;v=c[X+12>>2]|0;if((v|0)==(c[X+16>>2]|0)){v=sc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{v=c[v>>2]|0}if(!(qc[c[(c[H>>2]|0)+12>>2]&63](l,8192,v)|0)){v=41;break a}v=c[b>>2]|0;Y=v+12|0;X=c[Y>>2]|0;if((X|0)==(c[v+16>>2]|0)){v=sc[c[(c[v>>2]|0)+40>>2]&127](v)|0}else{c[Y>>2]=X+4;v=c[X>>2]|0}Ie(r,v);v=42;break};case 0:{v=42;break};case 3:{W=a[o]|0;Y=(W&1)==0;if(Y){_=(W&255)>>>1}else{_=c[G>>2]|0}X=a[A]|0;Z=(X&1)==0;if(Z){$=(X&255)>>>1}else{$=c[I>>2]|0}if((_|0)!=(-$|0)){if(Y){_=(W&255)>>>1}else{_=c[G>>2]|0}if((_|0)!=0){if(Z){Z=(X&255)>>>1}else{Z=c[I>>2]|0}if((Z|0)!=0){X=c[b>>2]|0;Y=c[X+12>>2]|0;if((Y|0)==(c[X+16>>2]|0)){X=sc[c[(c[X>>2]|0)+36>>2]&127](X)|0;W=a[o]|0}else{X=c[Y>>2]|0}Z=c[b>>2]|0;_=Z+12|0;Y=c[_>>2]|0;$=(Y|0)==(c[Z+16>>2]|0);if((X|0)==(c[((W&1)==0?G:c[F>>2]|0)>>2]|0)){if($){sc[c[(c[Z>>2]|0)+40>>2]&127](Z)|0}else{c[_>>2]=Y+4}W=a[o]|0;if((W&1)==0){W=(W&255)>>>1}else{W=c[G>>2]|0}R=W>>>0>1>>>0?q:R;break b}if($){W=sc[c[(c[Z>>2]|0)+36>>2]&127](Z)|0}else{W=c[Y>>2]|0}if((W|0)!=(c[((a[A]&1)==0?I:c[E>>2]|0)>>2]|0)){v=134;break a}W=c[b>>2]|0;X=W+12|0;Y=c[X>>2]|0;if((Y|0)==(c[W+16>>2]|0)){sc[c[(c[W>>2]|0)+40>>2]&127](W)|0}else{c[X>>2]=Y+4}a[k]=1;W=a[A]|0;if((W&1)==0){W=(W&255)>>>1}else{W=c[I>>2]|0}R=W>>>0>1>>>0?t:R;break b}}if(Y){$=(W&255)>>>1}else{$=c[G>>2]|0}_=c[b>>2]|0;Z=c[_+12>>2]|0;Y=(Z|0)==(c[_+16>>2]|0);if(($|0)==0){if(Y){W=sc[c[(c[_>>2]|0)+36>>2]&127](_)|0;X=a[A]|0}else{W=c[Z>>2]|0}if((W|0)!=(c[((X&1)==0?I:c[E>>2]|0)>>2]|0)){break b}W=c[b>>2]|0;X=W+12|0;Y=c[X>>2]|0;if((Y|0)==(c[W+16>>2]|0)){sc[c[(c[W>>2]|0)+40>>2]&127](W)|0}else{c[X>>2]=Y+4}a[k]=1;W=a[A]|0;if((W&1)==0){W=(W&255)>>>1}else{W=c[I>>2]|0}R=W>>>0>1>>>0?t:R;break b}if(Y){X=sc[c[(c[_>>2]|0)+36>>2]&127](_)|0;W=a[o]|0}else{X=c[Z>>2]|0}if((X|0)!=(c[((W&1)==0?G:c[F>>2]|0)>>2]|0)){a[k]=1;break b}W=c[b>>2]|0;X=W+12|0;Y=c[X>>2]|0;if((Y|0)==(c[W+16>>2]|0)){sc[c[(c[W>>2]|0)+40>>2]&127](W)|0}else{c[X>>2]=Y+4}W=a[o]|0;if((W&1)==0){W=(W&255)>>>1}else{W=c[G>>2]|0}R=W>>>0>1>>>0?q:R}break};case 2:{if(!((R|0)!=0|Q>>>0<2>>>0)){if((Q|0)==2){X=(a[N]|0)!=0}else{X=0}if(!(M|X)){R=0;break b}}Y=a[C]|0;X=(Y&1)==0?K:c[L>>2]|0;d:do{if((Q|0)!=0?(d[J+(Q-1)|0]|0)>>>0<2>>>0:0){while(1){if((Y&1)==0){_=(Y&255)>>>1;Z=K}else{_=c[K>>2]|0;Z=c[L>>2]|0}if((X|0)==(Z+(_<<2)|0)){break}if(!(qc[c[(c[H>>2]|0)+12>>2]&63](l,8192,c[X>>2]|0)|0)){v=148;break}X=X+4|0;Y=a[C]|0}if((v|0)==148){v=0;Y=a[C]|0}Z=(Y&1)==0;_=X-(Z?K:c[L>>2]|0)>>2;$=a[B]|0;aa=($&1)==0;if(aa){ba=($&255)>>>1}else{ba=c[h>>2]|0}e:do{if(!(_>>>0>ba>>>0)){if(aa){aa=($&255)>>>1;ba=h;$=h+((($&255)>>>1)-_<<2)|0}else{ca=c[O>>2]|0;$=c[h>>2]|0;aa=$;ba=ca;$=ca+($-_<<2)|0}_=ba+(aa<<2)|0;if(($|0)==(_|0)){Z=W;break d}else{aa=Z?K:c[L>>2]|0}while(1){if((c[$>>2]|0)!=(c[aa>>2]|0)){break e}$=$+4|0;if(($|0)==(_|0)){Z=W;break d}aa=aa+4|0}}}while(0);X=Z?K:c[L>>2]|0;Z=W}else{Z=W}}while(0);f:while(1){if((Y&1)==0){Y=(Y&255)>>>1;_=K}else{Y=c[K>>2]|0;_=c[L>>2]|0}if((X|0)==(_+(Y<<2)|0)){break}Y=c[b>>2]|0;do{if((Y|0)!=0){_=c[Y+12>>2]|0;if((_|0)==(c[Y+16>>2]|0)){Y=sc[c[(c[Y>>2]|0)+36>>2]&127](Y)|0}else{Y=c[_>>2]|0}if((Y|0)==-1){c[b>>2]=0;Y=1;break}else{Y=(c[b>>2]|0)==0;break}}else{Y=1}}while(0);do{if((Z|0)!=0){_=c[Z+12>>2]|0;if((_|0)==(c[Z+16>>2]|0)){Z=sc[c[(c[Z>>2]|0)+36>>2]&127](Z)|0}else{Z=c[_>>2]|0}if(!((Z|0)==-1)){if(Y^(W|0)==0){Z=W;break}else{break f}}else{c[g>>2]=0;W=0;v=178;break}}else{v=178}}while(0);if((v|0)==178){v=0;if(Y){break}else{Z=0}}_=c[b>>2]|0;Y=c[_+12>>2]|0;if((Y|0)==(c[_+16>>2]|0)){Y=sc[c[(c[_>>2]|0)+36>>2]&127](_)|0}else{Y=c[Y>>2]|0}if((Y|0)!=(c[X>>2]|0)){break}$=c[b>>2]|0;_=$+12|0;Y=c[_>>2]|0;if((Y|0)==(c[$+16>>2]|0)){sc[c[(c[$>>2]|0)+40>>2]&127]($)|0}else{c[_>>2]=Y+4}X=X+4|0;Y=a[C]|0}if(M){W=a[C]|0;if((W&1)==0){Y=(W&255)>>>1;W=K}else{Y=c[K>>2]|0;W=c[L>>2]|0}if((X|0)!=(W+(Y<<2)|0)){v=193;break a}}break};default:{}}}while(0);g:do{if((v|0)==42){v=0;if((Q|0)==3){v=302;break a}else{Y=W;X=W}while(1){Z=c[b>>2]|0;do{if((Z|0)!=0){W=c[Z+12>>2]|0;if((W|0)==(c[Z+16>>2]|0)){W=sc[c[(c[Z>>2]|0)+36>>2]&127](Z)|0}else{W=c[W>>2]|0}if((W|0)==-1){c[b>>2]=0;W=1;break}else{W=(c[b>>2]|0)==0;break}}else{W=1}}while(0);do{if((Y|0)!=0){Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=sc[c[(c[Y>>2]|0)+36>>2]&127](Y)|0}else{Y=c[Z>>2]|0}if(!((Y|0)==-1)){if(W^(X|0)==0){W=X;break}else{break g}}else{c[g>>2]=0;X=0;v=56;break}}else{v=56}}while(0);if((v|0)==56){v=0;if(W){break g}else{W=0}}Y=c[b>>2]|0;Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=sc[c[(c[Y>>2]|0)+36>>2]&127](Y)|0}else{Y=c[Z>>2]|0}if(!(qc[c[(c[H>>2]|0)+12>>2]&63](l,8192,Y)|0)){break g}_=c[b>>2]|0;Y=_+12|0;Z=c[Y>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Y=sc[c[(c[_>>2]|0)+40>>2]&127](_)|0}else{c[Y>>2]=Z+4;Y=c[Z>>2]|0}Ie(r,Y);Y=W}}}while(0);Q=Q+1|0;if(!(Q>>>0<4>>>0)){v=302;break}}h:do{if((v|0)==41){c[j>>2]=c[j>>2]|4;j=0}else if((v|0)==134){c[j>>2]=c[j>>2]|4;j=0}else if((v|0)==193){c[j>>2]=c[j>>2]|4;j=0}else if((v|0)==265){c[j>>2]=c[j>>2]|4;j=0}else if((v|0)==289){c[j>>2]=c[j>>2]|4;j=0}else if((v|0)==300){c[j>>2]=c[j>>2]|4;j=0}else if((v|0)==302){i:do{if((R|0)!=0){k=R;n=R+4|0;l=R+8|0;m=1;j:while(1){w=a[k]|0;if((w&1)==0){w=(w&255)>>>1}else{w=c[n>>2]|0}if(!(m>>>0<w>>>0)){break i}w=c[b>>2]|0;do{if((w|0)!=0){x=c[w+12>>2]|0;if((x|0)==(c[w+16>>2]|0)){w=sc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{w=c[x>>2]|0}if((w|0)==-1){c[b>>2]=0;w=1;break}else{w=(c[b>>2]|0)==0;break}}else{w=1}}while(0);y=c[g>>2]|0;do{if((y|0)!=0){x=c[y+12>>2]|0;if((x|0)==(c[y+16>>2]|0)){x=sc[c[(c[y>>2]|0)+36>>2]&127](y)|0}else{x=c[x>>2]|0}if(!((x|0)==-1)){if(w){break}else{break j}}else{c[g>>2]=0;v=321;break}}else{v=321}}while(0);if((v|0)==321?(v=0,w):0){break}w=c[b>>2]|0;x=c[w+12>>2]|0;if((x|0)==(c[w+16>>2]|0)){x=sc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{x=c[x>>2]|0}if((a[k]&1)==0){w=n}else{w=c[l>>2]|0}if((x|0)!=(c[w+(m<<2)>>2]|0)){break}m=m+1|0;w=c[b>>2]|0;y=w+12|0;x=c[y>>2]|0;if((x|0)==(c[w+16>>2]|0)){sc[c[(c[w>>2]|0)+40>>2]&127](w)|0;continue}else{c[y>>2]=x+4;continue}}c[j>>2]=c[j>>2]|4;j=0;break h}}while(0);if((T|0)!=(U|0)){c[u>>2]=0;jj(s,T,U,u);if((c[u>>2]|0)==0){j=1}else{c[j>>2]=c[j>>2]|4;j=0}}else{j=1;T=U}}}while(0);Ee(r);Ee(t);Ee(q);Ee(e);te(s);if((T|0)==0){i=p;return j|0}nc[S&511](T);i=p;return j|0}function oj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+456|0;x=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[x>>2];x=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[x>>2];x=d|0;w=d+16|0;u=d+416|0;q=d+424|0;v=d+432|0;r=d+440|0;t=d+448|0;n=u|0;c[n>>2]=w;m=u+4|0;c[m>>2]=162;w=w+400|0;Ne(v,h);o=v|0;p=c[o>>2]|0;if(!((c[3400]|0)==-1)){c[x>>2]=13600;c[x+4>>2]=14;c[x+8>>2]=0;oe(13600,x,96)}y=(c[3401]|0)-1|0;x=c[p+8>>2]|0;if((c[p+12>>2]|0)-x>>2>>>0>y>>>0?(s=c[x+(y<<2)>>2]|0,(s|0)!=0):0){x=s;a[r]=0;f=f|0;p=c[f>>2]|0;c[t>>2]=p;if(nj(e,t,g,v,c[h+4>>2]|0,j,r,x,u,q,w)|0){h=k;if((a[h]&1)==0){c[k+4>>2]=0;a[h]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}if((a[r]|0)!=0){Ie(k,pc[c[(c[s>>2]|0)+44>>2]&63](x,45)|0)}r=pc[c[(c[s>>2]|0)+44>>2]&63](x,48)|0;h=c[n>>2]|0;q=c[q>>2]|0;s=q-4|0;a:do{if(h>>>0<s>>>0){while(1){g=h+4|0;if((c[h>>2]|0)!=(r|0)){break a}if(g>>>0<s>>>0){h=g}else{h=g;break}}}}while(0);pj(k,h,q)|0}k=e|0;e=c[k>>2]|0;do{if((e|0)!=0){q=c[e+12>>2]|0;if((q|0)==(c[e+16>>2]|0)){e=sc[c[(c[e>>2]|0)+36>>2]&127](e)|0}else{e=c[q>>2]|0}if((e|0)==-1){c[k>>2]=0;e=1;break}else{e=(c[k>>2]|0)==0;break}}else{e=1}}while(0);do{if((p|0)!=0){q=c[p+12>>2]|0;if((q|0)==(c[p+16>>2]|0)){p=sc[c[(c[p>>2]|0)+36>>2]&127](p)|0}else{p=c[q>>2]|0}if(!((p|0)==-1)){if(e){break}else{l=37;break}}else{c[f>>2]=0;l=35;break}}else{l=35}}while(0);if((l|0)==35?e:0){l=37}if((l|0)==37){c[j>>2]=c[j>>2]|2}c[b>>2]=c[k>>2];Wd(c[o>>2]|0)|0;l=c[n>>2]|0;c[n>>2]=0;if((l|0)==0){i=d;return}nc[c[m>>2]&511](l);i=d;return}y=cc(4)|0;nm(y);zb(y|0,8296,130)}function pj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;i=d;g=a[f]|0;if((g&1)==0){k=1;j=g;h=(g&255)>>>1}else{j=c[b>>2]|0;k=(j&-2)-1|0;j=j&255;h=c[b+4>>2]|0}g=e-i>>2;if((g|0)==0){return b|0}if((k-h|0)>>>0<g>>>0){Ke(b,k,h+g-k|0,h,h,0,0);j=a[f]|0}if((j&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}k=j+(h<<2)|0;if((d|0)!=(e|0)){i=h+((e-4+(-i|0)|0)>>>2)+1|0;while(1){c[k>>2]=c[d>>2];d=d+4|0;if((d|0)==(e|0)){break}else{k=k+4|0}}k=j+(i<<2)|0}c[k>>2]=0;g=h+g|0;if((a[f]&1)==0){a[f]=g<<1;return b|0}else{c[b+4>>2]=g;return b|0}return 0}function qj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;n=i;i=i+176|0;z=n|0;y=n+16|0;x=n+32|0;v=n+40|0;t=n+56|0;r=n+72|0;o=n+88|0;w=n+104|0;u=n+112|0;s=n+128|0;q=n+144|0;p=n+160|0;if(b){p=c[d>>2]|0;if(!((c[3516]|0)==-1)){c[y>>2]=14064;c[y+4>>2]=14;c[y+8>>2]=0;oe(14064,y,96)}s=(c[3517]|0)-1|0;q=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-q>>2>>>0>s>>>0)){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}q=c[q+(s<<2)>>2]|0;if((q|0)==0){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}p=q;oc[c[(c[q>>2]|0)+44>>2]&127](x,p);C=c[x>>2]|0;a[e]=C;C=C>>8;a[e+1|0]=C;C=C>>8;a[e+2|0]=C;C=C>>8;a[e+3|0]=C;e=q;oc[c[(c[e>>2]|0)+32>>2]&127](v,p);s=l;if((a[s]&1)==0){c[l+4>>2]=0;a[s]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}He(l,0);l=v;c[s>>2]=c[l>>2];c[s+4>>2]=c[l+4>>2];c[s+8>>2]=c[l+8>>2];dn(l|0,0,12)|0;Ee(v);oc[c[(c[e>>2]|0)+28>>2]&127](t,p);l=k;if((a[l]&1)==0){c[k+4>>2]=0;a[l]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}He(k,0);k=t;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];dn(k|0,0,12)|0;Ee(t);k=q;c[f>>2]=sc[c[(c[k>>2]|0)+12>>2]&127](p)|0;c[g>>2]=sc[c[(c[k>>2]|0)+16>>2]&127](p)|0;oc[c[(c[q>>2]|0)+20>>2]&127](r,p);g=h;if((a[g]&1)==0){a[h+1|0]=0;a[g]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}xe(h,0);h=r;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];c[g+8>>2]=c[h+8>>2];dn(h|0,0,12)|0;te(r);oc[c[(c[e>>2]|0)+24>>2]&127](o,p);h=j;if((a[h]&1)==0){c[j+4>>2]=0;a[h]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}He(j,0);b=o;c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];dn(b|0,0,12)|0;Ee(o);b=sc[c[(c[k>>2]|0)+36>>2]&127](p)|0;c[m>>2]=b;i=n;return}else{o=c[d>>2]|0;if(!((c[3518]|0)==-1)){c[z>>2]=14072;c[z+4>>2]=14;c[z+8>>2]=0;oe(14072,z,96)}t=(c[3519]|0)-1|0;r=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-r>>2>>>0>t>>>0)){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}r=c[r+(t<<2)>>2]|0;if((r|0)==0){b=cc(4)|0;d=b;nm(d);zb(b|0,8296,130)}o=r;oc[c[(c[r>>2]|0)+44>>2]&127](w,o);C=c[w>>2]|0;a[e]=C;C=C>>8;a[e+1|0]=C;C=C>>8;a[e+2|0]=C;C=C>>8;a[e+3|0]=C;e=r;oc[c[(c[e>>2]|0)+32>>2]&127](u,o);t=l;if((a[t]&1)==0){c[l+4>>2]=0;a[t]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}He(l,0);l=u;c[t>>2]=c[l>>2];c[t+4>>2]=c[l+4>>2];c[t+8>>2]=c[l+8>>2];dn(l|0,0,12)|0;Ee(u);oc[c[(c[e>>2]|0)+28>>2]&127](s,o);l=k;if((a[l]&1)==0){c[k+4>>2]=0;a[l]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}He(k,0);k=s;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];dn(k|0,0,12)|0;Ee(s);k=r;c[f>>2]=sc[c[(c[k>>2]|0)+12>>2]&127](o)|0;c[g>>2]=sc[c[(c[k>>2]|0)+16>>2]&127](o)|0;oc[c[(c[r>>2]|0)+20>>2]&127](q,o);g=h;if((a[g]&1)==0){a[h+1|0]=0;a[g]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}xe(h,0);h=q;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];c[g+8>>2]=c[h+8>>2];dn(h|0,0,12)|0;te(q);oc[c[(c[e>>2]|0)+24>>2]&127](p,o);h=j;if((a[h]&1)==0){c[j+4>>2]=0;a[h]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}He(j,0);b=p;c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];dn(b|0,0,12)|0;Ee(p);b=sc[c[(c[k>>2]|0)+36>>2]&127](o)|0;c[m>>2]=b;i=n;return}}function rj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=a+4|0;f=(c[e>>2]|0)!=162;a=a|0;i=c[a>>2]|0;h=i;g=(c[d>>2]|0)-h|0;g=g>>>0<2147483647>>>0?g<<1:-1;h=(c[b>>2]|0)-h>>2;if(!f){i=0}j=Km(i,g)|0;i=j;if((j|0)==0){Um()}if(!f){f=c[a>>2]|0;c[a>>2]=i;if((f|0)!=0){nc[c[e>>2]&511](f);i=c[a>>2]|0}}else{c[a>>2]=i}c[e>>2]=80;c[b>>2]=i+(h<<2);c[d>>2]=(c[a>>2]|0)+(g>>>2<<2);return}function sj(a){a=a|0;Ud(a|0);Pm(a);return}function tj(a){a=a|0;Ud(a|0);return}function uj(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=+k;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+248|0;z=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[z>>2];z=d|0;F=d+120|0;D=d+232|0;E=d+240|0;p=E;m=i;i=i+1|0;i=i+7&-8;t=i;i=i+1|0;i=i+7&-8;r=i;i=i+12|0;i=i+7&-8;n=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;B=i;i=i+4|0;i=i+7&-8;C=i;i=i+100|0;i=i+7&-8;s=i;i=i+4|0;i=i+7&-8;l=i;i=i+4|0;i=i+7&-8;o=i;i=i+4|0;i=i+7&-8;H=d+16|0;c[F>>2]=H;u=d+128|0;v=_a(H|0,100,1360,(H=i,i=i+8|0,h[H>>3]=k,H)|0)|0;i=H;if(v>>>0>99>>>0){if((a[14168]|0)==0?(ob(14168)|0)!=0:0){c[3016]=Sa(2147483647,1336,0)|0}v=mh(F,c[3016]|0,1360,(y=i,i=i+8|0,h[y>>3]=k,y)|0)|0;i=y;y=c[F>>2]|0;if((y|0)==0){Um();y=c[F>>2]|0}w=Im(v)|0;if((w|0)==0){Um();u=0;w=0}else{u=w}}else{w=0;y=0}Ne(D,g);x=D|0;G=c[x>>2]|0;if(!((c[3402]|0)==-1)){c[z>>2]=13608;c[z+4>>2]=14;c[z+8>>2]=0;oe(13608,z,96)}z=(c[3403]|0)-1|0;H=c[G+8>>2]|0;if((c[G+12>>2]|0)-H>>2>>>0>z>>>0?(A=c[H+(z<<2)>>2]|0,(A|0)!=0):0){z=A;H=c[F>>2]|0;Ac[c[(c[A>>2]|0)+32>>2]&15](z,H,H+v|0,u)|0;if((v|0)==0){A=0}else{A=(a[c[F>>2]|0]|0)==45}c[E>>2]=0;dn(r|0,0,12)|0;E=n;dn(E|0,0,12)|0;F=q;dn(F|0,0,12)|0;vj(f,A,D,p,m,t,r,n,q,B);f=C|0;B=c[B>>2]|0;if((v|0)>(B|0)){C=a[F]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[q+4>>2]|0}D=a[E]|0;if((D&1)==0){D=(D&255)>>>1}else{D=c[n+4>>2]|0}C=C+(v-B<<1|1)+D|0}else{C=a[F]|0;if((C&1)==0){C=(C&255)>>>1}else{C=c[q+4>>2]|0}D=a[E]|0;if((D&1)==0){D=(D&255)>>>1}else{D=c[n+4>>2]|0}C=C+2+D|0}C=C+B|0;if(C>>>0>100>>>0){C=Im(C)|0;if((C|0)==0){Um();f=0;C=0}else{f=C}}else{C=0}wj(f,s,l,c[g+4>>2]|0,u,u+v|0,z,A,p,a[m]|0,a[t]|0,r,n,q,B);c[o>>2]=c[e>>2];hh(b,o,f,c[s>>2]|0,c[l>>2]|0,g,j);if((C|0)!=0){Jm(C)}te(q);te(n);te(r);Wd(c[x>>2]|0)|0;if((w|0)!=0){Jm(w)}if((y|0)==0){i=d;return}Jm(y);i=d;return}H=cc(4)|0;nm(H);zb(H|0,8296,130)}function vj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0;n=i;i=i+40|0;G=n|0;F=n+16|0;z=n+32|0;B=z;s=i;i=i+12|0;i=i+7&-8;E=i;i=i+4|0;i=i+7&-8;y=E;t=i;i=i+12|0;i=i+7&-8;r=i;i=i+12|0;i=i+7&-8;o=i;i=i+12|0;i=i+7&-8;A=i;i=i+4|0;i=i+7&-8;D=A;v=i;i=i+12|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;x=w;u=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;e=c[e>>2]|0;if(b){if(!((c[3520]|0)==-1)){c[F>>2]=14080;c[F+4>>2]=14;c[F+8>>2]=0;oe(14080,F,96)}q=(c[3521]|0)-1|0;p=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-p>>2>>>0>q>>>0)){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}p=c[p+(q<<2)>>2]|0;if((p|0)==0){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}q=p;u=c[p>>2]|0;if(d){oc[c[u+44>>2]&127](B,q);C=c[z>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[p>>2]|0)+32>>2]&127](s,q);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xe(l,0);G=s;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;te(s)}else{oc[c[u+40>>2]&127](y,q);C=c[E>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[p>>2]|0)+28>>2]&127](t,q);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xe(l,0);G=t;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;te(t)}l=p;a[g]=sc[c[(c[l>>2]|0)+12>>2]&127](q)|0;a[h]=sc[c[(c[l>>2]|0)+16>>2]&127](q)|0;l=p;oc[c[(c[l>>2]|0)+20>>2]&127](r,q);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xe(j,0);j=r;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];dn(j|0,0,12)|0;te(r);oc[c[(c[l>>2]|0)+24>>2]&127](o,q);j=k;if((a[j]&1)==0){a[k+1|0]=0;a[j]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}xe(k,0);G=o;c[j>>2]=c[G>>2];c[j+4>>2]=c[G+4>>2];c[j+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;te(o);G=sc[c[(c[p>>2]|0)+36>>2]&127](q)|0;c[m>>2]=G;i=n;return}else{if(!((c[3522]|0)==-1)){c[G>>2]=14088;c[G+4>>2]=14;c[G+8>>2]=0;oe(14088,G,96)}o=(c[3523]|0)-1|0;r=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-r>>2>>>0>o>>>0)){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}r=c[r+(o<<2)>>2]|0;if((r|0)==0){G=cc(4)|0;b=G;nm(b);zb(G|0,8296,130)}o=r;s=c[r>>2]|0;if(d){oc[c[s+44>>2]&127](D,o);C=c[A>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[r>>2]|0)+32>>2]&127](v,o);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xe(l,0);G=v;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;te(v)}else{oc[c[s+40>>2]&127](x,o);C=c[w>>2]|0;a[f]=C;C=C>>8;a[f+1|0]=C;C=C>>8;a[f+2|0]=C;C=C>>8;a[f+3|0]=C;oc[c[(c[r>>2]|0)+28>>2]&127](u,o);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}xe(l,0);G=u;c[f>>2]=c[G>>2];c[f+4>>2]=c[G+4>>2];c[f+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;te(u)}l=r;a[g]=sc[c[(c[l>>2]|0)+12>>2]&127](o)|0;a[h]=sc[c[(c[l>>2]|0)+16>>2]&127](o)|0;h=r;oc[c[(c[h>>2]|0)+20>>2]&127](q,o);l=j;if((a[l]&1)==0){a[j+1|0]=0;a[l]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}xe(j,0);j=q;c[l>>2]=c[j>>2];c[l+4>>2]=c[j+4>>2];c[l+8>>2]=c[j+8>>2];dn(j|0,0,12)|0;te(q);oc[c[(c[h>>2]|0)+24>>2]&127](p,o);j=k;if((a[j]&1)==0){a[k+1|0]=0;a[j]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}xe(k,0);G=p;c[j>>2]=c[G>>2];c[j+4>>2]=c[G+4>>2];c[j+8>>2]=c[G+8>>2];dn(G|0,0,12)|0;te(p);G=sc[c[(c[r>>2]|0)+36>>2]&127](o)|0;c[m>>2]=G;i=n;return}}function wj(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;c[f>>2]=d;v=j;u=q;s=q+1|0;t=q+8|0;q=q+4|0;y=p;z=(g&512|0)==0;B=p+1|0;A=p+8|0;F=p+4|0;E=(r|0)>0;D=o;C=o+1|0;p=o+8|0;H=o+4|0;I=j+8|0;G=-r|0;o=0;do{switch(a[l+o|0]|0){case 0:{c[e>>2]=c[f>>2];break};case 1:{c[e>>2]=c[f>>2];O=pc[c[(c[v>>2]|0)+28>>2]&63](j,32)|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=O;break};case 3:{K=a[u]|0;J=(K&1)==0;if(J){K=(K&255)>>>1}else{K=c[q>>2]|0}if((K|0)!=0){if(J){J=s}else{J=c[t>>2]|0}O=a[J]|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=O}break};case 2:{L=a[y]|0;J=(L&1)==0;if(J){K=(L&255)>>>1}else{K=c[F>>2]|0}if(!((K|0)==0|z)){if(J){L=(L&255)>>>1;J=B;K=B}else{K=c[A>>2]|0;L=c[F>>2]|0;J=K}J=J+L|0;L=c[f>>2]|0;if((K|0)!=(J|0)){do{a[L]=a[K]|0;K=K+1|0;L=L+1|0}while((K|0)!=(J|0))}c[f>>2]=L}break};case 4:{J=c[f>>2]|0;h=k?h+1|0:h;a:do{if(h>>>0<i>>>0){K=h;while(1){L=a[K]|0;if(!(L<<24>>24>-1)){break a}M=K+1|0;if((b[(c[I>>2]|0)+(L<<24>>24<<1)>>1]&2048)==0){break a}if(M>>>0<i>>>0){K=M}else{K=M;break}}}else{K=h}}while(0);L=K;if(E){if(K>>>0>h>>>0){L=h+(-L|0)|0;L=L>>>0<G>>>0?G:L;M=L+r|0;N=K;O=r;P=J;while(1){N=N-1|0;Q=a[N]|0;c[f>>2]=P+1;a[P]=Q;O=O-1|0;P=(O|0)>0;if(!(N>>>0>h>>>0&P)){break}P=c[f>>2]|0}K=K+L|0;if(P){w=32}else{L=0}}else{M=r;w=32}if((w|0)==32){w=0;L=pc[c[(c[v>>2]|0)+28>>2]&63](j,48)|0}N=c[f>>2]|0;c[f>>2]=N+1;if((M|0)>0){do{a[N]=L;M=M-1|0;N=c[f>>2]|0;c[f>>2]=N+1}while((M|0)>0)}a[N]=m}if((K|0)==(h|0)){P=pc[c[(c[v>>2]|0)+28>>2]&63](j,48)|0;Q=c[f>>2]|0;c[f>>2]=Q+1;a[Q]=P}else{M=a[D]|0;L=(M&1)==0;if(L){M=(M&255)>>>1}else{M=c[H>>2]|0}if((M|0)==0){N=0;L=0;M=-1}else{if(L){M=C}else{M=c[p>>2]|0}N=0;L=0;M=a[M]|0}while(1){if((N|0)==(M|0)){O=c[f>>2]|0;c[f>>2]=O+1;a[O]=n;L=L+1|0;O=a[D]|0;N=(O&1)==0;if(N){O=(O&255)>>>1}else{O=c[H>>2]|0}if(L>>>0<O>>>0){if(N){M=C}else{M=c[p>>2]|0}if((a[M+L|0]|0)==127){M=-1;N=0}else{if(N){M=C}else{M=c[p>>2]|0}M=a[M+L|0]|0;N=0}}else{N=0}}K=K-1|0;P=a[K]|0;Q=c[f>>2]|0;c[f>>2]=Q+1;a[Q]=P;if((K|0)==(h|0)){break}else{N=N+1|0}}}K=c[f>>2]|0;if((J|0)!=(K|0)?(x=K-1|0,x>>>0>J>>>0):0){K=x;do{Q=a[J]|0;a[J]=a[K]|0;a[K]=Q;J=J+1|0;K=K-1|0}while(J>>>0<K>>>0)}break};default:{}}o=o+1|0}while(o>>>0<4>>>0);u=a[u]|0;k=(u&1)==0;if(k){l=(u&255)>>>1}else{l=c[q>>2]|0}if(l>>>0>1>>>0){if(k){q=(u&255)>>>1;u=s}else{s=c[t>>2]|0;q=c[q>>2]|0;u=s}t=s+1|0;s=u+q|0;q=c[f>>2]|0;if((t|0)!=(s|0)){do{a[q]=a[t]|0;t=t+1|0;q=q+1|0}while((t|0)!=(s|0))}c[f>>2]=q}g=g&176;if((g|0)==32){c[e>>2]=c[f>>2];return}else if((g|0)==16){return}else{c[e>>2]=d;return}}function xj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;p=i;i=i+32|0;v=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[v>>2];v=p|0;z=p+16|0;A=p+24|0;r=A;s=i;i=i+1|0;i=i+7&-8;d=i;i=i+1|0;i=i+7&-8;k=i;i=i+12|0;i=i+7&-8;l=i;i=i+12|0;i=i+7&-8;m=i;i=i+12|0;i=i+7&-8;x=i;i=i+4|0;i=i+7&-8;y=i;i=i+100|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;n=i;i=i+4|0;i=i+7&-8;Ne(z,g);o=z|0;u=c[o>>2]|0;if(!((c[3402]|0)==-1)){c[v>>2]=13608;c[v+4>>2]=14;c[v+8>>2]=0;oe(13608,v,96)}B=(c[3403]|0)-1|0;v=c[u+8>>2]|0;if((c[u+12>>2]|0)-v>>2>>>0>B>>>0?(w=c[v+(B<<2)>>2]|0,(w|0)!=0):0){u=w;v=j;C=a[v]|0;B=(C&1)==0;if(B){C=(C&255)>>>1}else{C=c[j+4>>2]|0}if((C|0)==0){w=0}else{if(B){B=j+1|0}else{B=c[j+8>>2]|0}C=a[B]|0;w=C<<24>>24==(pc[c[(c[w>>2]|0)+28>>2]&63](u,45)|0)<<24>>24}c[A>>2]=0;dn(k|0,0,12)|0;A=l;dn(A|0,0,12)|0;B=m;dn(B|0,0,12)|0;vj(f,w,z,r,s,d,k,l,m,x);y=y|0;f=a[v]|0;C=(f&1)==0;if(C){z=(f&255)>>>1}else{z=c[j+4>>2]|0}x=c[x>>2]|0;if((z|0)>(x|0)){if(C){z=(f&255)>>>1}else{z=c[j+4>>2]|0}B=a[B]|0;if((B&1)==0){B=(B&255)>>>1}else{B=c[m+4>>2]|0}A=a[A]|0;if((A&1)==0){A=(A&255)>>>1}else{A=c[l+4>>2]|0}z=B+(z-x<<1|1)+A|0}else{z=a[B]|0;if((z&1)==0){z=(z&255)>>>1}else{z=c[m+4>>2]|0}A=a[A]|0;if((A&1)==0){A=(A&255)>>>1}else{A=c[l+4>>2]|0}z=z+2+A|0}z=z+x|0;if(z>>>0>100>>>0){z=Im(z)|0;if((z|0)==0){Um();y=0;z=0;f=a[v]|0}else{y=z}}else{z=0}if((f&1)==0){v=(f&255)>>>1;j=j+1|0}else{v=c[j+4>>2]|0;j=c[j+8>>2]|0}wj(y,q,t,c[g+4>>2]|0,j,j+v|0,u,w,r,a[s]|0,a[d]|0,k,l,m,x);c[n>>2]=c[e>>2];hh(b,n,y,c[q>>2]|0,c[t>>2]|0,g,h);if((z|0)==0){te(m);te(l);te(k);C=c[o>>2]|0;C=C|0;Wd(C)|0;i=p;return}Jm(z);te(m);te(l);te(k);C=c[o>>2]|0;C=C|0;Wd(C)|0;i=p;return}C=cc(4)|0;nm(C);zb(C|0,8296,130)}function yj(a){a=a|0;Ud(a|0);Pm(a);return}function zj(a){a=a|0;Ud(a|0);return}




// EMSCRIPTEN_END_FUNCS
var lc=[Nn,Nn,Dm,Nn,Em,Nn,Cm,Nn];var mc=[On,On,Lh,On,Vh,On,Xh,On,Dj,On,yh,On,wh,On,xj,On,Hh,On,Kh,On,Yh,On,kh,On,Vg,On,Jh,On,qg,On,Jg,On,Wh,On,ih,On,Ng,On,Fg,On,Hg,On,wg,On,Lg,On,Dg,On,Bg,On,Tg,On,Rg,On,Pg,On,Zh,On,kg,On,Ih,On,og,On,gg,On,ig,On,mg,On,eg,On,ug,On,sg,On,cg,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On];var nc=[Pn,Pn,Jj,Pn,ag,Pn,rh,Pn,ee,Pn,Qe,Pn,Oj,Pn,$j,Pn,Md,Pn,zd,Pn,bh,Pn,Yd,Pn,Nk,Pn,ce,Pn,zg,Pn,Sf,Pn,Of,Pn,Sm,Pn,Zd,Pn,Zj,Pn,nk,Pn,Th,Pn,Ag,Pn,nm,Pn,Gf,Pn,Fj,Pn,_j,Pn,sf,Pn,bg,Pn,Gi,Pn,Tj,Pn,kl,Pn,sm,Pn,jl,Pn,Mf,Pn,ce,Pn,Yf,Pn,li,Pn,ml,Pn,ak,Pn,Jm,Pn,yj,Pn,il,Pn,wf,Pn,yd,Pn,Xf,Pn,gi,Pn,Zd,Pn,Ul,Pn,ch,Pn,Yk,Pn,Hi,Pn,rf,Pn,Df,Pn,di,Pn,Sh,Pn,Pf,Pn,vi,Pn,Rm,Pn,Pe,Pn,Xl,Pn,Yl,Pn,Hf,Pn,cf,Pn,xk,Pn,pm,Pn,tf,Pn,Nf,Pn,aj,Pn,qd,Pn,Ri,Pn,If,Pn,Xj,Pn,vm,Pn,_l,Pn,tm,Pn,Fd,Pn,Sj,Pn,ei,Pn,lj,Pn,om,Pn,dj,Pn,zj,Pn,Zl,Pn,ki,Pn,qh,Pn,Rf,Pn,Gd,Pn,Tf,Pn,yf,Pn,me,Pn,$c,Pn,Fk,Pn,sj,Pn,kj,Pn,ll,Pn,Ee,Pn,pm,Pn,wm,Pn,_c,Pn,Cf,Pn,ne,Pn,qf,Pn,Ff,Pn,Ej,Pn,Me,Pn,Bf,Pn,Nd,Pn,Vj,Pn,Qf,Pn,Si,Pn,Eh,Pn,wi,Pn,sd,Pn,xf,Pn,bf,Pn,Af,Pn,hl,Pn,Wl,Pn,Fh,Pn,um,Pn,Kj,Pn,rd,Pn,rm,Pn,hi,Pn,tj,Pn,bj,Pn,te,Pn,ok,Pn,be,Pn,vf,Pn,$l,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn];var oc=[Qn,Qn,vl,Qn,Xi,Qn,zi,Qn,sl,Qn,Qi,Qn,rl,Qn,Fi,Qn,td,Qn,Ij,Qn,df,Qn,ri,Qn,_i,Qn,Ni,Qn,qi,Qn,Vi,Qn,oi,Qn,Yi,Qn,Wj,Qn,Hd,Qn,Ad,Qn,$i,Qn,ul,Qn,Ai,Qn,ae,Qn,wl,Qn,Pi,Qn,Ci,Qn,tl,Qn,Ei,Qn,Re,Qn,Od,Qn,Nj,Qn,Ki,Qn,ui,Qn,ti,Qn,pi,Qn,Li,Qn,Mi,Qn,Wi,Qn,Bi,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn];var pc=[Rn,Rn,Rd,Rn,jk,Rn,nf,Rn,tk,Rn,pk,Rn,Dd,Rn,Kd,Rn,fk,Rn,bd,Rn,rk,Rn,af,Rn,pf,Rn,hk,Rn,Xc,Rn,_e,Rn,wd,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn];var qc=[Sn,Sn,Wf,Sn,qk,Sn,ik,Sn,xm,Sn,ad,Sn,lk,Sn,$f,Sn,he,Sn,$e,Sn,Xe,Sn,bk,Sn,ef,Sn,Lj,Sn,vk,Sn,gk,Sn,vd,Sn,ie,Sn,kf,Sn,sk,Sn,Uc,Sn,Gj,Sn,Se,Sn,Jd,Sn,Vc,Sn,of,Sn,Sn,Sn,Sn,Sn,Sn,Sn,Sn,Sn,Sn,Sn,Sn,Sn];var rc=[Tn,Tn,Aj,Tn,uj,Tn,Tn,Tn];var sc=[Un,Un,Kl,Un,Ji,Un,Ye,Un,Ck,Un,Al,Un,Ze,Un,Il,Un,xi,Un,Gh,Un,yl,Un,Qd,Un,mf,Un,lf,Un,cl,Un,El,Un,Cl,Un,qm,Un,de,Un,ql,Un,nl,Un,Dl,Un,ol,Un,Ve,Un,Bk,Un,Zi,Un,Fl,Un,ud,Un,yi,Un,Uk,Un,Ti,Un,xl,Un,Bd,Un,dl,Un,Tm,Un,Kf,Un,si,Un,Cd,Un,pl,Un,We,Un,hf,Un,Id,Un,Ek,Un,Di,Un,Jl,Un,Pd,Un,Tk,Un,Kk,Un,jf,Un,mi,Un,zl,Un,ni,Un,_d,Un,Ii,Un,Mk,Un,Oi,Un,Bl,Un,Ui,Un,Jk,Un,Uh,Un,Hl,Un,Gl,Un,Xk,Un,gl,Un];var tc=[Vn,Vn,ge,Vn,Lf,Vn,Vn,Vn];var uc=[Wn,Wn,Bh,Wn,zh,Wn,oh,Wn,lh,Wn,Wn,Wn,Wn,Wn,Wn,Wn];var vc=[Xn,Xn];var wc=[Yn,Yn,Gk,Yn,Qk,Yn,Ok,Yn,$k,Yn,Hk,Yn,Zk,Yn,yk,Yn,zk,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn];var xc=[Zn,Zn,_h,Zn,Mh,Zn,Zn,Zn];var yc=[_n,_n,ii,_n,fi,_n,cj,_n,mj,_n,gj,_n,oj,_n,_n,_n];var zc=[$n,$n,Fm,$n,xh,$n,th,$n,sh,$n,Gm,$n,Ch,$n,Hj,$n,ff,$n,ph,$n,dh,$n,jh,$n,eh,$n,Hm,$n,Te,$n,Mj,$n];var Ac=[ao,ao,ck,ao,dk,ao,uk,ao,Yc,ao,kk,ao,ek,ao,Wc,ao];var Bc=[bo,bo,mk,bo,Sk,bo,Zf,bo,el,bo,Vk,bo,wk,bo,Ik,bo,Uf,bo,Ak,bo,Dk,bo,bl,bo,Lk,bo,bo,bo,bo,bo,bo,bo];var Cc=[co,co,zm,co,Am,co,ym,co,Ue,co,_f,co,gf,co,Vf,co];return{_set_init_vector:md,_strlen:fn,_transform:jd,_free:Jm,_delete_transformer:id,_realloc:Km,_memmove:en,__GLOBAL__I_a:Td,_restore:kd,_memset:dn,_malloc:Im,_set_key:ld,_memcpy:cn,_create_transformer:Zc,_configure:nd,runPostSets:Tc,stackAlloc:Dc,stackSave:Ec,stackRestore:Fc,setThrew:Gc,setTempRet0:Jc,setTempRet1:Kc,setTempRet2:Lc,setTempRet3:Mc,setTempRet4:Nc,setTempRet5:Oc,setTempRet6:Pc,setTempRet7:Qc,setTempRet8:Rc,setTempRet9:Sc,dynCall_viiiii:vn,dynCall_viiiiiii:wn,dynCall_vi:xn,dynCall_vii:yn,dynCall_iii:zn,dynCall_iiii:An,dynCall_viiiiiid:Bn,dynCall_ii:Cn,dynCall_viii:Dn,dynCall_viiiiid:En,dynCall_v:Fn,dynCall_iiiiiiiii:Gn,dynCall_viiiiiiiii:Hn,dynCall_viiiiiiii:In,dynCall_viiiiii:Jn,dynCall_iiiii:Kn,dynCall_iiiiii:Ln,dynCall_viiii:Mn}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiii": invoke_iiii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_ii": invoke_ii, "invoke_viii": invoke_viii, "invoke_viiiiid": invoke_viiiiid, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "__scanString": __scanString, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "_strtoull": _strtoull, "_fflush": _fflush, "__isLeapYear": __isLeapYear, "_fwrite": _fwrite, "_send": _send, "_isspace": _isspace, "_read": _read, "_isxdigit_l": _isxdigit_l, "_fileno": _fileno, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "_fmod": _fmod, "___resumeException": ___resumeException, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "__getFloat": __getFloat, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_isdigit_l": _isdigit_l, "___setErrNo": ___setErrNo, "_isxdigit": _isxdigit, "_exit": _exit, "_sprintf": _sprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "_catgets": _catgets, "_asprintf": _asprintf, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "_mkport": _mkport, "_copysign": _copysign, "__exit": __exit, "_strftime": _strftime, "___cxa_throw": ___cxa_throw, "_pread": _pread, "_strtoull_l": _strtoull_l, "__arraySum": __arraySum, "_strtoll_l": _strtoll_l, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "__ZSt9terminatev": __ZSt9terminatev, "_pthread_mutex_unlock": _pthread_mutex_unlock, "___cxa_call_unexpected": ___cxa_call_unexpected, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_strerror": _strerror, "_catclose": _catclose, "_llvm_lifetime_start": _llvm_lifetime_start, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_strftime_l": _strftime_l, "_abort": _abort, "_isdigit": _isdigit, "_strtoll": _strtoll, "__addDays": __addDays, "_fabs": _fabs, "__reallyNegative": __reallyNegative, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "_vasprintf": _vasprintf, "_catopen": _catopen, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "_stdout": _stdout, "__ZTISt9exception": __ZTISt9exception, "___dso_handle": ___dso_handle }, buffer);
var _set_init_vector = Module["_set_init_vector"] = asm["_set_init_vector"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _transform = Module["_transform"] = asm["_transform"];
var _free = Module["_free"] = asm["_free"];
var _delete_transformer = Module["_delete_transformer"] = asm["_delete_transformer"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _restore = Module["_restore"] = asm["_restore"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _set_key = Module["_set_key"] = asm["_set_key"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _create_transformer = Module["_create_transformer"] = asm["_create_transformer"];
var _configure = Module["_configure"] = asm["_configure"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






return Module;
}();

rabbit.Transformer = (function () {
  var Module = rabbit.Module;
  var iv_size_ = 8;

  var generateRandomUint8Array = function (len) {
    var vector = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      vector[i] = (Math.random() + '').substr(3) & 255;
    }
    return vector;
  }

  var create_transformer = Module.cwrap('create_transformer', 'number', []);

  /**
   * Create a transformer instance.
   * @constructor
   */
  var Transformer = function () {
    this.handle_ = create_transformer();
    this.ciphertext_max_len_ = 0;
  };

  // int set_key(int handle, const unsigned char* key, uint32_t key_len)
  var set_key = Module.cwrap('set_key', 'number',
                             ['number', 'number', 'number']);

  /**
   * Sets the key for transformation session.
   *
   * @param {ArrayBuffer} key session key.
   * @return {boolean} true if successful.
   */
  Transformer.prototype.setKey = function (key) {
    var ptr = Module._malloc(key.byteLength);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, ptr, key.byteLength);
    dataHeap.set(new Uint8Array(key));
    var ret = set_key(this.handle_, dataHeap.byteOffset, key.byteLength);
    Module._free(dataHeap.byteOffset);
    return ret == 0;
  };

  // int configure(int handle, const unsigned char* data,
  //                     uint32_t data_len)
  var configure = Module.cwrap('configure', 'number',
                               ['number', 'number', 'number']);
  /**
   * Performs configuration to the transformer. 
   *  
   * @param {String} serialized Json string.  
   */
  Transformer.prototype.configure = function (jsonStr) {
    var jsonStrArrayBuffer = str2ab(jsonStr);
    var jsonStrObj = JSON.parse(jsonStr);
    this.ciphertext_max_len_ = jsonStrObj.ciphertext_max_len;
    var ptr = Module._malloc(jsonStrArrayBuffer.byteLength);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, ptr,
                                  jsonStrArrayBuffer.byteLength);
    dataHeap.set(new Uint8Array(jsonStrArrayBuffer));
    var ret = configure(this.handle_, dataHeap.byteOffset,
                        jsonStrArrayBuffer.byteLength);
    Module._free(dataHeap.byteOffset);
    return ret == 0;
  }

  // int set_init_vector(int handle, const unsigned char* data,
  //                     uint32_t data_len)
  var set_init_vector = Module.cwrap('set_init_vector', 'number',
                                     ['number', 'number', 'number']);
  var setInitVector = function (handle) {
    var iv = generateRandomUint8Array(iv_size_);
    var ptr = Module._malloc(iv.byteLength);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, ptr, iv.byteLength);
    dataHeap.set(iv);
    var ret = set_init_vector(handle, dataHeap.byteOffset, iv.byteLength);
    Module._free(dataHeap.byteOffset);
    return ret == 0;
  }

  // int transform(int handle, const uint8_t* data, uint32_t data_len,
  //               uint8_t* output, uint32_t* output_len) {
  var transform = Module.cwrap('transform', 'number',
                               ['number', 'number', 'number', 'number',
                                'number']);

  /**
   * Transforms a piece of data to obfuscated form.
   *
   * @param {ArrayBuffer} plaintext data need to be obfuscated.
   * @return {?ArrayBuffer} obfuscated data, or null if failed.
   */
  Transformer.prototype.transform = function (plaintext) {
    if (!setInitVector(this.handle_)) {
      return null;
    }

    var plaintextLen = plaintext.byteLength;
    var ptr = Module._malloc(plaintextLen);
    var dataHeap1 = new Uint8Array(Module.HEAPU8.buffer, ptr, plaintextLen);
    dataHeap1.set(new Uint8Array(plaintext));

    var ciphertextLen = plaintextLen + iv_size_;
    if (this.ciphertext_max_len_) {
      ciphertextLen = this.ciphertext_max_len_;
    }
    ptr = Module._malloc(ciphertextLen);
    var dataHeap2 = new Uint8Array(Module.HEAPU8.buffer, ptr, ciphertextLen);

    ptr = Module._malloc(4);
    var dataHeap3 = new Uint8Array(Module.HEAPU8.buffer, ptr, 4);
    var data = new Uint32Array([ciphertextLen]);
    dataHeap3.set(new Uint8Array(data.buffer));

    var ret = transform(this.handle_,
      dataHeap1.byteOffset, plaintext.byteLength,
      dataHeap2.byteOffset, dataHeap3.byteOffset);

    if (ret != 0) {
      return null;
    }
    var length = (new Uint32Array(dataHeap3.buffer, dataHeap3.byteOffset, 4))[0];
    var result = new Uint8Array(length);
    result.set(new Uint8Array(dataHeap2.buffer, dataHeap2.byteOffset, length));

    Module._free(dataHeap1.byteOffset);
    Module._free(dataHeap2.byteOffset);
    Module._free(dataHeap3.byteOffset);

    return result.buffer;
  }

  // int restore(int handle, const uint8_t* data, uint32_t data_len,
  //             uint8_t* result, uint32_t* result_len) {
  var restore = Module.cwrap('restore', 'number',
                             ['number', 'number', 'number', 'number',
                              'number']);

  /**
   * Restores data from obfuscated form to original form.
   *
   * @param {ArrayBuffer} ciphertext obfuscated data.
   * @return {?ArrayBuffer} original data, or null if failed.
   */
  Transformer.prototype.restore = function (ciphertext) {
    var len = ciphertext.byteLength;
    var ptr = Module._malloc(len);
    var dataHeap1 = new Uint8Array(Module.HEAPU8.buffer, ptr, len);
    dataHeap1.set(new Uint8Array(ciphertext, 0, len));

    ptr = Module._malloc(len);
    var dataHeap2 = new Uint8Array(Module.HEAPU8.buffer, ptr, len);

    ptr = Module._malloc(4);
    var dataHeap3 = new Uint8Array(Module.HEAPU8.buffer, ptr, 4);
    var data = new Uint32Array([len]);
    dataHeap3.set(new Uint8Array(data.buffer));

    var ret = restore(this.handle_,
                      dataHeap1.byteOffset, ciphertext.byteLength,
                      dataHeap2.byteOffset, dataHeap3.byteOffset);
    if (ret != 0) {
      return null;
    }
    var len = (new Uint32Array(dataHeap3.buffer, dataHeap3.byteOffset, 4))[0];
    var result = new Uint8Array(len);
    result.set(new Uint8Array(dataHeap2.buffer, dataHeap2.byteOffset, len));
    Module._free(dataHeap1.byteOffset);
    Module._free(dataHeap2.byteOffset);
    Module._free(dataHeap3.byteOffset);
    return result.buffer;
  };

  var delete_transformer = Module.cwrap('delete_transformer', 'number',
                                        ['number']);

  /**
   * Dispose the transformer.
   *
   * This should be the last method to be called for a transformer
   * instance.
   */
  Transformer.prototype.dispose = function () {
    delete_transformer(this.handle_);
    this.handle_ = -1;
  }

  return Transformer;
}());

exports.Transformer = function() {
  return new rabbit.Transformer();
};

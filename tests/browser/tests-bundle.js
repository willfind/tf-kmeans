(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod3, isNodeMode, target) => (target = mod3 != null ? __create(__getProtoOf(mod3)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod3 || !mod3.__esModule ? __defProp(target, "default", { value: mod3, enumerable: true }) : target,
    mod3
  ));

  // node_modules/@jrc03c/bee/dist/bee.import.mjs
  var __defProp2 = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  function isNumber(x) {
    return typeof x === "number" && !isNaN(x) || typeof x === "bigint";
  }
  var isBrowser = new Function(`
  try {
    return this === window
  } catch(e) {}

  try {
    return typeof importScripts !== "undefined"
  } catch(e) {}

  return false
`);
  var MathError = class extends Error {
    constructor(message) {
      if (isBrowser()) {
        super(message);
      } else {
        super("\n\n\x1B[31m" + message + "\n\x1B[0m");
      }
    }
  };
  function assert(isTrue, message) {
    if (!isTrue)
      throw new MathError(message);
  }
  var arrayTypes = [
    Array,
    ArrayBuffer,
    BigInt64Array,
    BigUint64Array,
    Float32Array,
    Float64Array,
    Int16Array,
    Int32Array,
    Int8Array,
    Uint16Array,
    Uint32Array,
    Uint8Array,
    Uint8ClampedArray
  ];
  function isUndefined(x) {
    return x === null || typeof x === "undefined";
  }
  var typeStrings = arrayTypes.map((s22) => s22.name);
  function isArray(obj) {
    try {
      if (obj instanceof Array) {
        return true;
      }
      if (!isUndefined(obj.constructor)) {
        return arrayTypes.indexOf(obj.constructor) > -1 || typeStrings.indexOf(obj.constructor.name) > -1;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  function isDataFrame(x) {
    try {
      return !!x._symbol && x._symbol === Symbol.for("@jrc03c/js-math-tools/dataframe");
    } catch (e) {
      return false;
    }
  }
  function isFunction(fn) {
    return typeof fn === "function";
  }
  function isObject(x) {
    return typeof x === "object" && !isUndefined(x) && !isArray(x);
  }
  function isSeries(x) {
    try {
      return !!x._symbol && x._symbol === Symbol.for("@jrc03c/js-math-tools/series");
    } catch (e) {
      return false;
    }
  }
  function indexOf(x, fn) {
    if (isDataFrame(x)) {
      const index = indexOf(x.values, fn);
      if (index.length > 0 && isNumber(index[0]) && index[0] >= 0 && index[0] < x.index.length) {
        index[0] = x.index[index[0]];
      }
      if (index.length > 1 && isNumber(index[1]) && index[1] >= 0 && index[1] < x.columns.length) {
        index[1] = x.columns[index[1]];
      }
      return index;
    }
    if (isSeries(x)) {
      const index = indexOf(x.values, fn);
      if (index.length > 0 && isNumber(index[0]) && index[0] >= 0 && index[0] < x.index.length) {
        index[0] = x.index[index[0]];
      }
      return index;
    }
    assert(isObject(x) || isArray(x), "You must pass (1) an object, array, Series, or DataFrame and (2) a function or value into the `indexOf` function!");
    if (!isFunction(fn)) {
      const value = fn;
      fn = (v) => v === value;
    }
    function helper52(x2, fn2, checked) {
      checked = checked || [];
      if (checked.indexOf(x2) > -1) {
        return null;
      }
      if (isObject(x2)) {
        checked.push(x2);
        const keys = Object.keys(x2).concat(Object.getOwnPropertySymbols(x2));
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = x2[key];
          if (fn2(value)) {
            return [key];
          }
          const results = helper52(value, fn2, checked);
          if (results && results.length > 0) {
            return [key].concat(results);
          }
        }
      } else if (isArray(x2)) {
        checked.push(x2);
        for (let i = 0; i < x2.length; i++) {
          const value = x2[i];
          if (fn2(value)) {
            return [i];
          }
          const results = helper52(value, fn2, checked);
          if (results && results.length > 0) {
            return [i].concat(results);
          }
        }
      } else {
        if (fn2(x2)) {
          return [];
        }
      }
      return null;
    }
    function safeFn(v) {
      try {
        return fn(v);
      } catch (e) {
        return false;
      }
    }
    const paths = helper52(x, safeFn);
    if (paths && paths.length > 0) {
      return paths;
    } else {
      return null;
    }
  }
  function copy(x) {
    function helper52(x2) {
      if (typeof x2 === "object") {
        if (x2 === null) {
          return null;
        }
        if (isArray(x2)) {
          if (!(x2 instanceof Array)) {
            return x2.slice();
          }
          return x2.map((v) => copy(v));
        }
        if (isSeries(x2)) {
          const out3 = x2.copy();
          out3.values = copy(out3.values);
          return out3;
        }
        if (isDataFrame(x2)) {
          const out3 = x2.copy();
          out3.values = copy(x2.values);
          return out3;
        }
        if (x2 instanceof Date) {
          return new Date(x2.getTime());
        }
        x2 = decycle(x2);
        const out22 = {};
        Object.keys(x2).concat(Object.getOwnPropertySymbols(x2)).forEach((key) => {
          out22[key] = copy(x2[key]);
        });
        return out22;
      } else {
        return x2;
      }
    }
    return helper52(decycle(x));
  }
  function decycle(x) {
    function helper52(x2, checked, currentPath) {
      checked = checked || [];
      currentPath = currentPath || "";
      if (checked.indexOf(x2) > -1) {
        const parts = currentPath.split("/").slice(currentPath.startsWith("/") ? 1 : 0);
        const isANestedCopy = parts.some((v, i) => {
          const subParts = parts.slice(0, parts.length - i - 1);
          let temp = orig;
          subParts.forEach((part) => {
            temp = temp[part];
          });
          return temp === x2;
        });
        if (isANestedCopy) {
          const pathToCopy = orig === x2 ? "/" : "/" + indexOf(orig, x2).join("/");
          return `<reference to "${pathToCopy}">`;
        }
      }
      if (typeof x2 === "object") {
        if (x2 === null)
          return null;
        checked.push(x2);
        if (isArray(x2)) {
          if (typeof x2.constructor !== "undefined" && x2.constructor.name !== "Array") {
            return x2.slice();
          }
          return x2.map((v, i) => helper52(v, checked, currentPath + "/" + i));
        } else {
          Object.keys(x2).concat(Object.getOwnPropertySymbols(x2)).forEach((key) => {
            x2[key] = helper52(x2[key], checked, currentPath + "/" + key.toString());
          });
          return x2;
        }
      } else {
        return x2;
      }
    }
    const orig = x;
    let out22 = helper52(orig);
    if (isDataFrame(x)) {
      const temp = x.copy();
      temp._values = out22.values;
      temp._columns = out22.columns;
      temp._index = out22.index;
      out22 = temp;
    }
    if (isSeries(x)) {
      const temp = x.copy();
      temp.name = out22.name;
      temp._values = out22.values;
      temp._index = out22.index;
      out22 = temp;
    }
    return out22;
  }
  function isDate(x) {
    return x instanceof Date && x.toString() !== "Invalid Date";
  }
  var numberTypes = ["number", "int", "float", "bigint"];
  function isEqual(a, b) {
    function helper52(a2, b2) {
      const aType = typeof a2;
      const bType = typeof b2;
      if (aType !== bType && !numberTypes.includes(aType) && !numberTypes.includes(bType))
        return false;
      if (aType === "undefined" && bType === "undefined")
        return true;
      if (aType === "boolean")
        return a2 === b2;
      if (aType === "symbol")
        return a2 === b2;
      if (aType === "number" || aType === "bigint") {
        try {
          const aString = a2.toString();
          const bString = b2.toString();
          return aString === bString;
        } catch (e) {
          return false;
        }
      }
      if (aType === "string")
        return a2 === b2;
      if (aType === "function")
        return a2 === b2;
      if (aType === "object") {
        if (a2 === null || b2 === null) {
          return a2 === null && b2 === null;
        } else {
          if (isDate(a2)) {
            if (isDate(b2)) {
              return a2.getTime() === b2.getTime();
            } else {
              return false;
            }
          } else if (isDate(b2)) {
            return false;
          }
          if (a2 instanceof RegExp && b2 instanceof RegExp) {
            return a2.toString() === b2.toString();
          }
          if (isArray(a2) !== isArray(b2)) {
            return false;
          }
          const aKeys = Object.keys(a2).concat(Object.getOwnPropertySymbols(a2));
          const bKeys = Object.keys(b2).concat(Object.getOwnPropertySymbols(b2));
          if (aKeys.length !== bKeys.length)
            return false;
          for (let i = 0; i < aKeys.length; i++) {
            const key = aKeys[i];
            if (!helper52(a2[key], b2[key]))
              return false;
          }
          return true;
        }
      }
    }
    try {
      return helper52(a, b);
    } catch (e) {
      return helper52(decycle(a), decycle(b));
    }
  }
  function makeKey(n) {
    const alpha = "abcdefg1234567890";
    let out22 = "";
    while (out22.length < n)
      out22 += alpha[Math.floor(Math.random() * alpha.length)];
    return out22;
  }
  var NULL_KEY = makeKey(16);
  var UNDEFINED_KEY = makeKey(16);
  var INFINITY_KEY = makeKey(16);
  var MINUS_INFINITY_KEY = makeKey(16);
  var SYMBOL_KEY = makeKey(16);
  var Counter = class {
    constructor() {
      this.clear();
    }
    get counts() {
      return this.values.map((v) => this.get(v));
    }
    get values() {
      return Object.values(this.valuesDict);
    }
    clear() {
      this.countsDict = {};
      this.valuesDict = {};
      return this;
    }
    count(x) {
      for (const v of x) {
        if (isArray(v)) {
          this.count(v);
        } else {
          this.increment(v);
        }
      }
      return this;
    }
    delete(value) {
      const key = this.getStandardizedKey(value);
      delete this.countsDict[key];
      delete this.valuesDict[key];
      return this;
    }
    get(value) {
      return this.countsDict[this.getStandardizedKey(value)] || 0;
    }
    getStandardizedKey(value) {
      return typeof value === "object" && value === null ? NULL_KEY : isUndefined(value) ? UNDEFINED_KEY : isFunction(value) ? value.toString() : typeof value === "symbol" ? value.toString() + " - " + SYMBOL_KEY : value === Infinity ? INFINITY_KEY : value === -Infinity ? MINUS_INFINITY_KEY : typeof value === "bigint" ? value.toString() : isDataFrame(value) ? value.toJSONString() : isSeries(value) ? JSON.stringify(value.toObject()) : JSON.stringify(value);
    }
    has(value) {
      return !isUndefined(this.countsDict[this.getStandardizedKey(value)]);
    }
    increment(value) {
      return this.set(value, this.get(value) + 1);
    }
    set(value, count22) {
      const key = this.getStandardizedKey(value);
      this.countsDict[key] = count22;
      this.valuesDict[key] = value;
      return this;
    }
    toArray() {
      return this.values.map((v) => ({ value: v, count: this.get(v) }));
    }
    toObject() {
      const out22 = {};
      this.values.forEach((value) => {
        out22[value] = this.get(value);
      });
      return out22;
    }
  };
  function flatten(arr) {
    if (isDataFrame(arr) || isSeries(arr)) {
      return flatten(arr.values);
    }
    assert(isArray(arr), "The `flatten` function only works on arrays, Series, and DataFrames!");
    function helper52(arr2) {
      let out22 = [];
      arr2.forEach((child) => {
        if (isArray(child)) {
          out22 = out22.concat(helper52(child));
        } else {
          out22.push(child);
        }
      });
      return out22;
    }
    return helper52(arr);
  }
  function stats(x, options) {
    options = options || {};
    const counts = new Counter();
    const out22 = {};
    const xflat = flatten(x);
    const xnums = [];
    let max22 = -Infinity;
    let min22 = Infinity;
    let resultsShouldIncludeBigInts = false;
    let sum22 = 0;
    for (const v of xflat) {
      if (typeof v === "bigint") {
        resultsShouldIncludeBigInts = true;
      }
      if (!options.shouldDropNaNs || isNumber(v)) {
        try {
          if (v > max22) {
            max22 = v;
          }
          if (v < min22) {
            min22 = v;
          }
          sum22 += Number(v);
          xnums.push(v);
        } catch (e) {
          max22 = NaN;
          min22 = NaN;
          sum22 = NaN;
        }
      }
      counts.increment(v);
    }
    const mean22 = sum22 / xnums.length;
    out22.counts = counts;
    out22.max = max22;
    out22.mean = mean22;
    out22.min = min22;
    out22.n = xflat.length;
    out22.sum = sum22;
    if (isNaN(out22.mean)) {
      out22.max = NaN;
      out22.min = NaN;
    }
    if (options.shouldDropNaNs) {
      out22.nWithoutNaNs = xnums.length;
    }
    if (options.mode) {
      const sortedCountPairs = Array.from(counts.values.map((v) => [v, counts.get(v)])).toSorted((a, b) => b[1] - a[1]);
      const highestCount = sortedCountPairs[0][1];
      const mode22 = [];
      for (const pair of sortedCountPairs) {
        if (pair[1] == highestCount) {
          mode22.push(pair[0]);
        } else {
          break;
        }
      }
      out22.mode = mode22.toSorted();
    }
    if (options.median) {
      if (isNaN(mean22)) {
        out22.median = NaN;
      } else {
        const xnumsSorted = xnums.toSorted((a, b) => Number(a) - Number(b));
        const middle = Math.floor(xnumsSorted.length / 2);
        if (xnumsSorted.length % 2 === 0) {
          const left = xnumsSorted[middle - 1];
          const right = xnumsSorted[middle];
          out22.median = (Number(left) + Number(right)) / 2;
          if (resultsShouldIncludeBigInts && typeof left === "bigint" && typeof right === "bigint") {
            try {
              out22.median = BigInt(out22.median);
            } catch (e) {
            }
          }
        } else {
          out22.median = xnumsSorted[middle];
        }
      }
    }
    if (options.stdev || options.variance) {
      let variance22 = 0;
      for (const v of xnums) {
        variance22 += Math.pow(Number(v) - mean22, 2);
      }
      variance22 /= xnums.length;
      const stdev22 = Math.sqrt(variance22);
      out22.stdev = stdev22;
      out22.variance = variance22;
    }
    if (resultsShouldIncludeBigInts) {
      try {
        out22.sum = BigInt(out22.sum);
      } catch (e) {
      }
      try {
        out22.mean = BigInt(out22.mean);
      } catch (e) {
      }
      if (options.mode) {
        out22.mode = out22.mode.map((v) => {
          try {
            return BigInt(v);
          } catch (e) {
            return v;
          }
        });
      }
    }
    return out22;
  }
  function count(arr, matcher) {
    const { counts } = stats(arr);
    if (!isUndefined(matcher)) {
      if (isFunction(matcher)) {
        counts.values.forEach((v) => {
          if (!matcher(v)) {
            counts.delete(v);
          }
        });
      } else {
        counts.values.forEach((v) => {
          if (!isEqual(v, matcher)) {
            counts.delete(v);
          }
        });
      }
    }
    return counts;
  }
  function helper(x) {
    if (isDataFrame(x) || isSeries(x)) {
      return helper(x.values);
    }
    if (isArray(x)) {
      let hasArrayValues = false;
      let hasNonArrayValues = false;
      let arrayLength = null;
      for (const v of x) {
        if (helper(v)) {
          return true;
        }
        if (isArray(v)) {
          if (arrayLength === null) {
            arrayLength = v.length;
          } else if (v.length !== arrayLength) {
            return true;
          }
          hasArrayValues = true;
        } else {
          hasNonArrayValues = true;
        }
        if (hasArrayValues && hasNonArrayValues) {
          return true;
        }
      }
    }
    return false;
  }
  function isJagged(x) {
    return helper(decycle(x));
  }
  function isNested(x) {
    if (isDataFrame(x) || isSeries(x)) {
      return isNested(x.values);
    }
    assert(isArray(x), "The `isNested` function only works on arrays, Series, and DataFrames!");
    for (let i = 0; i < x.length; i++) {
      if (isArray(x[i])) {
        return true;
      }
    }
    return false;
  }
  var error = "You must pass a natural number or a one-dimensional array of natural numbers into the `ndarray` function!";
  function ndarray(shape22) {
    assert(!isUndefined(shape22), error);
    if (!isArray(shape22))
      shape22 = [shape22];
    assert(!isNested(shape22), error);
    assert(shape22.length > 0, error);
    let s22 = shape22[0];
    if (typeof s22 === "bigint")
      s22 = Number(s22);
    assert(isNumber(s22), error);
    assert(s22 >= 0, error);
    assert(Math.floor(s22) === s22, error);
    assert(s22 !== Infinity, "We can't create an array containing an infinite number of values!");
    if (shape22.length === 1) {
      const out22 = [];
      for (let i = 0; i < s22; i++)
        out22.push(void 0);
      return out22;
    } else {
      const out22 = [];
      for (let i = 0; i < s22; i++) {
        out22.push(ndarray(shape22.slice(1)));
      }
      return out22;
    }
  }
  function reverse(arr) {
    if (isDataFrame(arr) || isSeries(arr)) {
      const out3 = arr.copy();
      out3.values = reverse(out3.values);
      out3.index = reverse(out3.index);
      return out3;
    }
    assert(isArray(arr), "The `reverse` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    for (let i = arr.length - 1; i >= 0; i--)
      out22.push(arr[i]);
    return out22;
  }
  function range(a, b, step = 1) {
    assert(!isUndefined(a) && !isUndefined(b) && !isUndefined(step), "You must pass two numbers and optionally a step value to the `range` function!");
    assert(isNumber(a) && isNumber(b) && isNumber(step), "You must pass two numbers and optionally a step value to the `range` function!");
    assert(step > 0, "The step value must be greater than 0! (NOTE: The step value is a magnitude; it does not indicate direction.)");
    let shouldReverse = false;
    const shouldIncludeBigInts = typeof a === "bigint" || typeof b === "bigint" || typeof step === "bigint";
    a = Number(a);
    b = Number(b);
    step = Number(step);
    if (a > b) {
      shouldReverse = true;
      const buffer = a;
      a = b + step;
      b = buffer + step;
    }
    let out22 = [];
    for (let i = a; i < b; i += step) {
      if (shouldIncludeBigInts) {
        try {
          out22.push(BigInt(i));
        } catch (e) {
          out22.push(i);
        }
      } else {
        out22.push(i);
      }
    }
    if (shouldReverse)
      out22 = reverse(out22);
    return out22;
  }
  function makeKey2(n) {
    const alpha = "abcdefg1234567890";
    let out22 = "";
    while (out22.length < n)
      out22 += alpha[Math.floor(Math.random() * alpha.length)];
    return out22;
  }
  var NULL_KEY2 = makeKey2(256);
  var UNDEFINED_KEY2 = makeKey2(256);
  var INFINITY_KEY2 = makeKey2(256);
  var MINUS_INFINITY_KEY2 = makeKey2(256);
  var SYMBOL_KEY2 = makeKey2(256);
  function set(arr) {
    if (isDataFrame(arr) || isSeries(arr)) {
      return set(arr.values);
    }
    assert(isArray(arr), "The `set` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    const temp = {};
    flatten(arr).forEach((item) => {
      const key = typeof item === "object" && item === null ? NULL_KEY2 : isUndefined(item) ? UNDEFINED_KEY2 : isFunction(item) ? item.toString() : typeof item === "symbol" ? item.toString() + " - " + SYMBOL_KEY2 : item === Infinity ? INFINITY_KEY2 : item === -Infinity ? MINUS_INFINITY_KEY2 : typeof item === "bigint" ? item.toString() : isDataFrame(item) ? item.toJSONString() : isSeries(item) ? JSON.stringify(item.toObject()) : JSON.stringify(item);
      if (!temp[key])
        out22.push(item);
      temp[key] = true;
    });
    return out22;
  }
  function helper2(x) {
    if (isArray(x)) {
      const childShapes = helper2(x[0]);
      return [x.length].concat(childShapes || []);
    } else {
      return void 0;
    }
  }
  function shape(x) {
    if (isDataFrame(x) || isSeries(x)) {
      return shape(x.values);
    }
    assert(isArray(x), "The `shape` function only works on arrays, Series, and DataFrames!");
    return helper2(x);
  }
  function dfAppend(df, x, axis) {
    if (isUndefined(axis)) {
      axis = 0;
    }
    assert(axis === 0 || axis === 1 || axis === "vertical" || axis === "horizontal", 'The only valid axis values for use when appending data to a DataFrame are 0, 1, "vertical", and "horizontal". Note that 0 == "horizontal" and 1 == "vertical".');
    if (isArray(x)) {
      assert(!isJagged(x), "The array of data you're trying to append to this DataFrame is jagged!");
      const xShape = shape(x);
      if (xShape.length === 1) {
        if (axis === 0) {
          const out22 = df.copy();
          out22._values.push(x);
          const maxRowLength = Math.max(df.shape[1], xShape[0]);
          out22._values.forEach((row) => {
            while (row.length < maxRowLength) {
              row.push(void 0);
            }
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < maxRowLength) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        } else {
          const maxColLength = Math.max(df.shape[0], xShape[0]);
          const out22 = df.copy();
          range(0, maxColLength).forEach((i) => {
            if (i >= out22._values.length) {
              out22._values.push(ndarray(df.shape[1]));
            }
            out22._values[i].push(x[i]);
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < out22._values[0].length) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        }
      } else if (xShape.length === 2) {
        if (axis === 0) {
          const maxRowLength = Math.max(...x.map((row) => row.length).concat([df.shape[1]]));
          const out22 = df.copy();
          out22._values = out22._values.concat(x).map((row) => {
            while (row.length < maxRowLength) {
              row.push(void 0);
            }
            return row;
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < maxRowLength) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        } else {
          const maxRowLength = Math.max(...x.map((row) => row.length)) + df.shape[1];
          const maxColLength = Math.max(df.shape[0], xShape[0]);
          const out22 = df.copy();
          range(0, maxColLength).forEach((i) => {
            if (i >= out22._values.length) {
              out22._values.push(ndarray(df.shape[1]));
            }
            out22._values[i] = out22._values[i].concat(x[i]);
            while (out22._values[i].length < maxRowLength) {
              out22._values[i].push(void 0);
            }
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < maxRowLength) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        }
      } else {
        throw new MathError("Only 1- and 2-dimensional arrays can be appended to a DataFrame!");
      }
    } else if (isSeries(x)) {
      const out22 = dfAppend(df, x.values, axis);
      if (axis === 0) {
        out22.index[out22.index.length - 1] = out22.index.indexOf(x.name) > -1 ? x.name + " (2)" : x.name;
      } else {
        out22.columns[out22.columns.length - 1] = out22.columns.indexOf(x.name) > -1 ? x.name + " (2)" : x.name;
      }
      return out22;
    } else if (isDataFrame(x)) {
      if (axis === 0) {
        const out22 = df.copy();
        const maxRowLength = set(out22._columns.concat(x._columns)).length;
        out22._values.forEach((row) => {
          while (row.length < maxRowLength) {
            row.push(void 0);
          }
        });
        x.apply((row) => {
          const rowCopy = row.copy();
          const temp = [];
          out22._columns.forEach((col) => {
            const index = rowCopy._index.indexOf(col);
            if (index > -1) {
              temp.push(rowCopy._values[index]);
              rowCopy._values.splice(index, 1);
              rowCopy._index.splice(index, 1);
            } else {
              temp.push(void 0);
            }
          });
          out22._values.push(temp.concat(rowCopy._values));
        }, 1);
        out22._columns = out22._columns.concat(x._columns.filter((c) => out22._columns.indexOf(c) < 0));
        while (out22._index.length < out22._values.length) {
          const newRowName = "row" + out22._index.length;
          out22._index.push(newRowName + (df._index.indexOf(newRowName) > -1 ? " (2)" : ""));
        }
        return out22;
      } else {
        const out22 = df.copy();
        out22._index.forEach((rowName, i) => {
          const xIndex = x._index.indexOf(rowName);
          if (xIndex > -1) {
            out22._values[i] = out22._values[i].concat(x._values[xIndex]);
          } else {
            out22._values[i] = out22._values[i].concat(ndarray(x.shape[1]));
          }
        });
        x._index.forEach((rowName, i) => {
          const outIndex = out22._index.indexOf(rowName);
          if (outIndex < 0) {
            out22._index.push(rowName);
            out22._values.push(ndarray(out22._columns.length).concat(x._values[i]));
          }
        });
        out22._columns = out22._columns.concat(x._columns.map((c) => c + (out22._columns.indexOf(c) > -1 ? " (2)" : "")));
        return out22;
      }
    } else {
      throw new MathError("Only 1- or 2-dimensional arrays, Series, and DataFrames can be appended to a DataFrame!");
    }
  }
  function dfApply(DataFrame22, Series22, df, fn, axis) {
    axis = axis || 0;
    assert(isFunction(fn), "The first parameter to the `apply` method must be a function.");
    assert(axis === 0 || axis === 1, "The second parameter to the `apply` method (the `axis`) must be 0 or 1.");
    if (axis === 0) {
      const temp = {};
      let shouldReturnADataFrame;
      df.columns.forEach((colName, i) => {
        const series = new Series22(df.values.map((row) => row[i]));
        series.name = colName;
        series.index = df.index;
        const value = fn(series, i, df);
        if (value instanceof Series22) {
          temp[colName] = value.values;
        } else {
          temp[colName] = value;
        }
        if (isUndefined(shouldReturnADataFrame)) {
          shouldReturnADataFrame = value instanceof Series22 || isArray(value);
        }
      });
      if (shouldReturnADataFrame) {
        const out22 = new DataFrame22(temp);
        out22.index = df.index;
        return out22;
      } else {
        const out22 = new Series22(df.columns.map((colName) => temp[colName]));
        out22.index = df.columns;
        return out22;
      }
    } else if (axis === 1) {
      let shouldReturnADataFrame;
      const temp = df.values.map((row, i) => {
        const series = new Series22(row);
        series.name = df.index[i];
        series.index = df.columns;
        const value = fn(series, i, df);
        if (isUndefined(shouldReturnADataFrame)) {
          shouldReturnADataFrame = value instanceof Series22 || isArray(value);
        }
        if (value instanceof Series22) {
          return value.values;
        } else {
          return value;
        }
      });
      if (shouldReturnADataFrame) {
        const out22 = new DataFrame22(temp);
        out22.index = df.index;
        out22.columns = df.columns;
        return out22;
      } else {
        const out22 = new Series22(temp);
        out22.index = df.index;
        return out22;
      }
    }
  }
  function isString(s22) {
    return typeof s22 === "string";
  }
  function dfAssign(DataFrame22, Series22, df, p1, p2) {
    const isDataFrame22 = (x) => x instanceof DataFrame22;
    const isSeries22 = (x) => x instanceof Series22;
    if (!isUndefined(p2)) {
      assert(isString(p1), "If passing two arguments into the `assign` method, then the first argument must be a string name!");
      assert(isArray(p2) && !isJagged(p2) && shape(p2).length === 1, "If passing two arguments into the `assign` method, then the second argument must be a 1-dimensional array!");
      const out22 = df.append(p2, 1);
      out22.columns[out22.columns.length - 1] = p1;
      return out22;
    } else {
      if (isDataFrame22(p1)) {
        return df.append(p1, 1);
      } else if (isSeries22(p1)) {
        return df.append(p1, 1);
      } else if (isObject(p1)) {
        const maxColumnLength = Math.max(...Object.keys(p1).concat(Object.getOwnPropertySymbols(p1)).map((key) => p1[key].length));
        Object.keys(p1).concat(Object.getOwnPropertySymbols(p1)).forEach((key) => {
          while (p1[key].length < maxColumnLength) {
            p1[key].push(void 0);
          }
        });
        return df.append(new DataFrame22(p1), 1);
      } else {
        throw new MathError("You must pass a DataFrame, Series, or object into the `assign` method!");
      }
    }
  }
  function dfCopy(DataFrame22, df) {
    if (df.isEmpty)
      return new DataFrame22();
    const out22 = new DataFrame22(copy(df.values));
    out22.columns = df.columns.slice();
    out22.index = df.index.slice();
    return out22;
  }
  function dfDrop(DataFrame22, Series22, df, rows, cols) {
    if (isUndefined(rows))
      rows = [];
    if (isUndefined(cols))
      cols = [];
    if (isString(rows) || isNumber(rows))
      rows = [rows];
    if (isString(cols) || isNumber(cols))
      cols = [cols];
    assert(isArray(rows), "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    assert(isArray(cols), "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    assert(shape(rows).length === 1, "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    assert(shape(cols).length === 1, "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    let outIndex, outColumns;
    df.index.forEach((row, i) => {
      if (rows.indexOf(row) < 0 && rows.indexOf(i) < 0) {
        if (!outIndex)
          outIndex = [];
        outIndex.push(row);
      }
    });
    df.columns.forEach((col, i) => {
      if (cols.indexOf(col) < 0 && cols.indexOf(i) < 0) {
        if (!outColumns)
          outColumns = [];
        outColumns.push(col);
      }
    });
    let out22 = df.get(outIndex, outColumns);
    if (out22 instanceof Series22) {
      let temp = new DataFrame22();
      temp = temp.assign(out22);
      if (df.index.indexOf(out22.name) > -1)
        temp = temp.transpose();
      out22 = temp;
    }
    return out22;
  }
  function isInteger(x) {
    return isNumber(x) && (x >= 0 ? Math.floor(x) === x : Math.ceil(x) === x);
  }
  function isWholeNumber(x) {
    return isInteger(x) && x >= 0;
  }
  function dfDropMissing(DataFrame22, Series22, df, axis, condition, threshold) {
    axis = axis || 0;
    assert(axis === 0 || axis === 1, "The first parameter of the `dropMissing` method (the `axis`) must be 0 or 1.");
    threshold = threshold || 0;
    assert(isWholeNumber(threshold), "The third parameter of the `dropMissing` method (the `threshold`) should be a whole number (meaning that data should be dropped if it contains more than `threshold` null values).");
    condition = threshold > 0 ? "none" : condition || "any";
    assert(condition === "any" || condition === "all" || condition === "none", "The second parameter of the `dropMissing` method (the `condition` parameter, which indicates the condition under which data should be dropped) should be 'any' or 'all' (meaning that if 'any' of the data contains null values, then it should be dropped; or that if 'all' of the data contains null values, then it should be dropped).");
    function helper52(values) {
      if (threshold > 0) {
        let count22 = 0;
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (isUndefined(value))
            count22++;
          if (count22 >= threshold)
            return [];
        }
      } else if (condition === "any") {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (isUndefined(value))
            return [];
        }
      } else if (condition === "all") {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (!isUndefined(value))
            return values;
        }
        return [];
      }
      return values;
    }
    let out22 = df.copy();
    const tempID = Math.random().toString();
    if (axis === 0) {
      out22 = out22.assign(tempID, out22.index);
      const newValues = out22.values.map(helper52).filter((row) => row.length > 0);
      if (shape(newValues).length < 2)
        return new DataFrame22();
      out22.values = newValues;
      let newIndex = out22.get(null, tempID);
      if (isUndefined(newIndex))
        return new DataFrame22();
      if (isString(newIndex))
        newIndex = [newIndex];
      if (newIndex instanceof Series22)
        newIndex = newIndex.values;
      out22.index = newIndex;
      out22 = out22.drop(null, tempID);
    } else if (axis === 1) {
      const temp = {};
      out22.columns.forEach((colName, i) => {
        const values = out22.values.map((row) => row[i]);
        const newValues = helper52(values);
        if (newValues.length > 0) {
          temp[colName] = newValues;
        }
      });
      if (Object.keys(temp).length + Object.getOwnPropertySymbols(temp).length === 0) {
        return new DataFrame22();
      }
      const newOut = new DataFrame22(temp);
      newOut.index = out22.index;
      return newOut;
    }
    return out22;
  }
  function dropNaN(x) {
    if (isDataFrame(x) || isSeries(x)) {
      return x.dropNaN(...Object.values(arguments).slice(1));
    }
    assert(isArray(x), "The `dropNaN` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    x.forEach((v) => {
      try {
        return out22.push(dropNaN(v));
      } catch (e) {
        if (isNumber(v)) {
          return out22.push(v);
        }
      }
    });
    return out22;
  }
  function dfDropNaN(DataFrame22, df, axis, condition, threshold) {
    axis = axis || 0;
    assert(axis === 0 || axis === 1, "The first parameter of the `dropNaN` method (the `axis`) must be 0 or 1.");
    threshold = threshold || 0;
    assert(isWholeNumber(threshold), "The third parameter of the `dropNaN` method (the `threshold`) should be a whole number (meaning that data should be dropped if it contains more than `threshold` NaN values).");
    condition = threshold > 0 ? "none" : condition || "any";
    assert(condition === "any" || condition === "all" || condition === "none", "The second parameter of the `dropNaN` method (the `condition` parameter, which indicates the condition under which data should be dropped) should be 'any' or 'all' (meaning that if 'any' of the data contains NaN values, then it should be dropped; or that if 'all' of the data contains NaN values, then it should be dropped).");
    function helper52(values) {
      const numericalValues = dropNaN(values);
      if (threshold > 0)
        return values.length - numericalValues.length < threshold;
      if (condition === "any")
        return numericalValues.length === values.length;
      if (condition === "all")
        return numericalValues.length > 0;
      return true;
    }
    const out22 = df.copy();
    if (axis === 0) {
      const rowsToKeep = out22.index.filter((row) => {
        const values = out22.get(row, null).values;
        return helper52(values);
      });
      if (rowsToKeep.length > 0)
        return out22.get(rowsToKeep, null);
      else
        return new DataFrame22();
    } else if (axis === 1) {
      const colsToKeep = out22.columns.filter((col) => {
        const values = out22.get(null, col).values;
        return helper52(values);
      });
      if (colsToKeep.length > 0)
        return out22.get(null, colsToKeep);
      else
        return new DataFrame22();
    }
    return out22;
  }
  function arrayToObject(x) {
    const out22 = {};
    flatten(x).forEach((value, i) => {
      out22[value] = i;
    });
    return out22;
  }
  function undoArrayToObject(obj) {
    return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)).sort((a, b) => obj[a] - obj[b]);
  }
  function dfFilter(DataFrame22, Series22, df, fn, axis) {
    assert(isFunction(fn), "The `filter` method takes a single parameter: a function that is used to filter the values.");
    if (isUndefined(axis))
      axis = 0;
    assert(axis === 0 || axis === 1, "The `axis` parameter to the `filter` method must be 0 or 1.");
    let out22 = df.copy();
    if (out22.isEmpty)
      return out22;
    const index = arrayToObject(out22.index);
    const columns = arrayToObject(out22.columns);
    if (axis === 0) {
      let count22 = 0;
      const newValues = out22.values.filter((row, i) => {
        const series = new Series22(row);
        series.name = df.index[i];
        series.index = df.columns;
        const shouldKeep = fn(series, i, df);
        if (shouldKeep) {
          count22++;
        } else {
          delete index[out22.index[i]];
        }
        return shouldKeep;
      });
      if (count22 === 0) {
        return new DataFrame22();
      }
      if (count22 === 1) {
        const temp = new Series22(newValues[0]);
        temp.name = undoArrayToObject(index)[0];
        temp.index = undoArrayToObject(columns);
        return temp;
      }
      out22.values = newValues;
      out22.index = undoArrayToObject(index);
    } else if (axis === 1) {
      out22 = out22.transpose();
      let count22 = 0;
      const newValues = out22.values.filter((row, i) => {
        const series = new Series22(row);
        series.name = df.columns[i];
        series.index = df.index;
        const shouldKeep = fn(series, i, df);
        if (shouldKeep) {
          count22++;
        } else {
          delete columns[out22.index[i]];
        }
        return shouldKeep;
      });
      if (count22 === 0) {
        return new DataFrame22();
      }
      if (count22 === 1) {
        const temp = new Series22(newValues[0]);
        temp.name = undoArrayToObject(columns)[0];
        temp.index = undoArrayToObject(index);
        return temp;
      }
      out22.values = newValues;
      out22.index = undoArrayToObject(columns);
      out22 = out22.transpose();
    }
    return out22;
  }
  function dfGet(df, rows, cols) {
    if (isString(rows) || isNumber(rows))
      rows = [rows];
    if (isString(cols) || isNumber(cols))
      cols = [cols];
    for (const i in rows) {
      if (typeof rows[i] === "bigint") {
        rows[i] = Number(rows[i]);
      }
    }
    for (const i in cols) {
      if (typeof cols[i] === "bigint") {
        cols[i] = Number(cols[i]);
      }
    }
    const types = set((rows || []).concat(cols || []).map((v) => typeof v));
    assert(types.length <= 2, "Only whole numbers and/or strings are allowed in `get` arrays!");
    if (types.length === 1) {
      assert(types[0] === "string" || types[0] === "number", "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (types.length === 2) {
      assert(types.indexOf("string") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
      assert(types.indexOf("number") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (!isUndefined(rows)) {
      rows = rows.map((r) => {
        if (isString(r)) {
          assert(df.index.indexOf(r) > -1, `Row "${r}" does not exist!`);
          return r;
        }
        if (isNumber(r)) {
          assert(r >= 0, `Index ${r} is out of bounds!`);
          assert(Math.floor(r) === r, `Row numbers must be integers!`);
          assert(r < df.index.length, `Index ${r} is out of bounds!`);
          return df.index[r];
        }
      });
    }
    if (!isUndefined(cols)) {
      cols = cols.map((c) => {
        if (isString(c)) {
          assert(df.columns.indexOf(c) > -1, `Column "${c}" does not exist!`);
          return c;
        }
        if (isNumber(c)) {
          assert(c >= 0, `Column ${c} is out of bounds!`);
          assert(Math.floor(c) === c, `Column numbers must be integers!`);
          assert(c < df.columns.length, `Column ${c} is out of bounds!`);
          return df.columns[c];
        }
      });
    }
    return df.getSubsetByNames(rows, cols);
  }
  function alphaSort(a, b) {
    try {
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    } catch (e) {
      a = typeof a === "object" && a !== null ? JSON.stringify(a) : a.toString();
      b = typeof b === "object" && b !== null ? JSON.stringify(b) : b.toString();
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    }
  }
  function sort(arr, fn) {
    if (isUndefined(fn))
      fn = alphaSort;
    if (isDataFrame(arr) || isSeries(arr)) {
      return arr.sort(...Object.values(arguments).slice(1));
    }
    assert(isArray(arr), "The `sort` function only works on arrays, Series, and DataFrames!");
    assert(isFunction(fn), "The second parameter of the `sort` function must be a comparison function!");
    const out22 = arr.slice();
    out22.sort(fn);
    return out22;
  }
  function camelify(text) {
    const temp = text.toLowerCase();
    let out22 = "";
    for (let i = 0; i < temp.length; i++) {
      const char = temp[i];
      if (char.match(/[a-z0-9]/g)) {
        out22 += char;
      } else {
        out22 += " ";
      }
    }
    const words = out22.split(" ").filter((word) => word.length > 0);
    return words[0] + words.slice(1).map((word) => word[0].toUpperCase() + word.substring(1)).join("");
  }
  function dfGetDummies(DataFrame22, df, columns) {
    if (isUndefined(columns)) {
      columns = df.columns;
    } else if (isString(columns)) {
      columns = [columns];
    }
    const temp = {};
    columns.forEach((col) => {
      assert(isString(col), "You must pass either a string or a one-dimensional array of strings into the `getDummies` (AKA `oneHotEncode`) method!");
      const colIndex = df.columns.indexOf(col);
      assert(colIndex > -1, `The given DataFrame does not have a column called "${col}"!`);
      const values = df.values.map((row) => row[colIndex]);
      const valuesSet = sort(set(values));
      values.forEach((value) => {
        valuesSet.forEach((orig) => {
          const colName = col + "_" + camelify(orig.toString());
          if (!temp[colName]) {
            temp[colName] = [];
          }
          if (value === orig) {
            temp[colName].push(1);
          } else {
            temp[colName].push(0);
          }
        });
      });
    });
    const out22 = new DataFrame22(temp);
    out22.index = df.index;
    return out22;
  }
  function dfGetSubsetByIndices(df, rowIndices, colIndices) {
    const dataShape = df.shape;
    if (isUndefined(rowIndices))
      rowIndices = range(0, dataShape[0]);
    if (isUndefined(colIndices))
      colIndices = range(0, dataShape[1]);
    if (isNumber(rowIndices))
      rowIndices = [rowIndices];
    if (isNumber(colIndices))
      colIndices = [colIndices];
    assert(isArray(rowIndices) && isArray(colIndices), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
    assert(shape(rowIndices).length === 1 && shape(colIndices).length === 1, "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
    assert(rowIndices.length > 0, "The `rowIndices` array must contain at least one index.");
    assert(colIndices.length > 0, "The `colIndices` array must contain at least one index.");
    rowIndices.forEach((rowIndex) => {
      assert(isWholeNumber(rowIndex), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
      assert(rowIndex < df.index.length, `The row index ${rowIndex} is out of bounds.`);
    });
    colIndices.forEach((colIndex) => {
      assert(isWholeNumber(colIndex), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
      assert(colIndex < df.columns.length, `The column index ${colIndex} is out of bounds.`);
    });
    const rows = rowIndices.map((i) => df.index[i]);
    const cols = colIndices.map((i) => df.columns[i]);
    return df.getSubsetByNames(rows, cols);
  }
  function dfGetSubsetByNames(DataFrame22, Series22, df, rows, cols) {
    if (isUndefined(rows))
      rows = df.index;
    if (isUndefined(cols))
      cols = df.columns;
    if (isString(rows))
      rows = [rows];
    if (isString(cols))
      cols = [cols];
    assert(isArray(rows) && isArray(cols), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
    assert(shape(rows).length === 1 && shape(cols).length === 1, "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
    assert(rows.length > 0, "The `rows` array must contain at least one row name.");
    assert(cols.length > 0, "The `cols` array must contain at least one column name.");
    rows.forEach((row) => {
      assert(isString(row), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
      assert(df.index.indexOf(row) > -1, `The row name "${row}" does not exist in the list of rows.`);
    });
    cols.forEach((col) => {
      assert(isString(col), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
      assert(df.columns.indexOf(col) > -1, `The column name "${col}" does not exist in the list of columns.`);
    });
    const values = rows.map((row) => {
      return cols.map((col) => {
        return df.values[df.index.indexOf(row)][df.columns.indexOf(col)];
      });
    });
    if (rows.length === 1 && cols.length === 1) {
      return values[0][0];
    }
    if (rows.length === 1) {
      const out3 = new Series22(values[0]);
      out3.name = rows[0];
      out3.index = cols;
      return out3;
    }
    if (cols.length === 1) {
      const out3 = new Series22(values.map((v) => v[0]));
      out3.name = cols[0];
      out3.index = rows;
      return out3;
    }
    const out22 = new DataFrame22(values);
    out22.columns = cols;
    out22.index = rows;
    return out22;
  }
  function dfPrint(DataFrame22, Series22, df) {
    function truncate(s22, maxLength2) {
      if (isString(s22)) {
        if (s22.length > maxLength2) {
          return s22.substring(0, maxLength2 - 3) + "...";
        } else {
          return s22;
        }
      } else {
        return s22;
      }
    }
    if (df.isEmpty) {
      console.table({});
      console.log("Shape:", [0, 0], "\n");
      return df;
    }
    const maxRows = typeof window === "undefined" ? 20 : 10;
    const halfMaxRows = Math.floor(maxRows / 2);
    const maxColumns = typeof process === "undefined" ? 10 : Math.floor(process.stdout.columns / 24) - 1;
    const halfMaxColumns = Math.floor(maxColumns / 2);
    const tempRows = maxRows > df.index.length ? null : range(0, halfMaxRows).concat(range(df.index.length - halfMaxRows, df.index.length));
    const tempColumns = maxColumns > df.columns.length ? null : range(0, halfMaxColumns).concat(range(df.columns.length - halfMaxColumns, df.columns.length));
    let temp = df.get(tempRows, tempColumns);
    if (temp instanceof Series22) {
      if (df.shape[0] === 1) {
        temp = new DataFrame22([temp.values]);
        temp.index = df.index;
        temp.columns = new Series22(df.columns).get(tempColumns).values;
      } else if (df.shape[1] === 1) {
        temp = new DataFrame22([temp.values]).transpose();
        temp.index = new Series22(df.index).get(tempRows).values;
        temp.columns = df.columns;
      }
    }
    if (maxRows <= df.index.length) {
      temp._index.splice(halfMaxRows, 0, "...");
      temp._values.splice(halfMaxRows, 0, range(0, temp.columns.length).map(() => "..."));
    }
    if (maxColumns <= df.columns.length) {
      temp._columns.splice(halfMaxColumns, 0, "...");
      temp._values = temp._values.map((row) => {
        row.splice(halfMaxColumns, 0, "...");
        return row;
      });
    }
    const maxLength = 28;
    if (temp instanceof Series22) {
      temp.values = temp.values.map((value) => truncate(value, maxLength));
      temp.name = truncate(temp.name, maxLength);
      temp.index = temp.index.map((row) => truncate(row, maxLength));
    } else {
      temp.values = temp.values.map((row) => {
        return row.map((value) => truncate(value, maxLength));
      });
      temp.columns = temp.columns.map((col) => truncate(col, maxLength));
      temp.index = temp.index.map((row) => truncate(row, maxLength));
    }
    console.table(temp.toDetailedObject());
    console.log("Shape:", df.shape, "\n");
    return df;
  }
  function leftPad(x, maxLength) {
    assert(isNumber(x), "The `leftPad` function only works on numbers!");
    let out22 = x.toString();
    while (out22.length < maxLength)
      out22 = "0" + out22;
    return out22;
  }
  function dfResetIndex(df, shouldSkipCopying) {
    const out22 = shouldSkipCopying ? df : df.copy();
    out22.index = range(0, df.shape[0]).map((i) => {
      return "row" + leftPad(i, (out22.index.length - 1).toString().length);
    });
    return out22;
  }
  function product(arr, shouldDropNaNs) {
    if (isDataFrame(arr) || isSeries(arr)) {
      return product(arr.values, shouldDropNaNs);
    }
    assert(isArray(arr), "The `product` function only works on arrays, Series, and DataFrames!");
    try {
      if (arr.length === 0)
        return NaN;
      const temp = flatten(arr);
      let resultShouldBeABigInt = false;
      let out22 = 1;
      for (let v of temp) {
        if (!isNumber(v)) {
          if (shouldDropNaNs) {
            v = 1;
          } else {
            return NaN;
          }
        }
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
          v = Number(v);
        }
        out22 *= v;
      }
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  }
  function isNaturalNumber(x) {
    return isInteger(x) && x > 0;
  }
  function reshape(x, newShape) {
    if (isDataFrame(x) || isSeries(x)) {
      return reshape(x.values, newShape);
    }
    assert(isArray(x), "The first argument passed into the `reshape` function must be an array!");
    if (isNumber(newShape))
      newShape = [newShape];
    assert(isArray(newShape), "The second argument passed into the `reshape` function must be a whole number or a one-dimensional array of whole numbers!");
    assert(shape(newShape).length === 1, "The first argument passed into the `reshape` function must be a whole number or a one-dimensional array of whole numbers!");
    newShape = newShape.map((v) => {
      if (typeof v === "bigint") {
        v = Number(v);
      }
      assert(isNaturalNumber(v), "The first argument passed into the `reshape` function must be a whole number or a one-dimensional array of whole numbers!");
      return Number(v);
    });
    if (newShape.length === 0) {
      return flatten(x);
    }
    const temp = flatten(x);
    if (newShape.length === 1 && newShape[0] === temp.length) {
      return temp;
    }
    assert(product(newShape) === temp.length, "The new shape doesn't match the number of values available in `x` (the first argument passed into the `reshape` function)!");
    const out22 = [];
    const step = Math.floor(temp.length / newShape[0]);
    for (let i = 0; i < newShape[0]; i++) {
      const row = temp.slice(i * step, (i + 1) * step);
      out22.push(reshape(row, newShape.slice(1)));
    }
    return out22;
  }
  var MAX = Math.pow(2, 64);
  var s = [];
  seed(Math.floor(Math.random() * MAX));
  function splitmix64(state, n) {
    state = uint(state);
    function helper52() {
      state += uint("0x9e3779b97f4a7c15");
      let z = copy(state);
      z = (z ^ z >> BigInt(30)) * uint("0xbf58476d1ce4e5b9");
      z = (z ^ z >> BigInt(27)) * uint("0x94d049bb133111eb");
      return z ^ z >> BigInt(31);
    }
    const out22 = [];
    for (let i = 0; i < n; i++)
      out22.push(helper52());
    return out22;
  }
  function uint(x) {
    return BigInt.asUintN(64, BigInt(x));
  }
  function rotl(x, k) {
    x = uint(x);
    k = BigInt(k);
    return uint(uint(x << k) | uint(x >> uint(BigInt(64) - k)));
  }
  function seed(val) {
    if (typeof val === "bigint") {
      val = Number(val);
    }
    if (!isUndefined(val)) {
      assert(isNumber(val), "If passing a value into the `seed` function, then that value must be an integer!");
      const temp = splitmix64(Math.floor(val), 4);
      s[0] = temp[0];
      s[1] = temp[1];
      s[2] = temp[2];
      s[3] = temp[3];
    } else {
      return copy(s);
    }
  }
  function next() {
    const result = uint(rotl(s[0] + s[3], 23) + s[0]);
    const t = uint(s[1] << BigInt(17));
    s[2] = uint(s[2] ^ s[0]);
    s[3] = uint(s[3] ^ s[1]);
    s[1] = uint(s[1] ^ s[2]);
    s[0] = uint(s[0] ^ s[3]);
    s[2] = uint(s[2] ^ t);
    s[3] = rotl(s[3], 45);
    return Math.floor(Number(result)) / MAX;
  }
  function random(shape22) {
    if (isUndefined(shape22))
      return next();
    if (!isArray(shape22))
      shape22 = [shape22];
    return reshape(ndarray(product(shape22)).map(next), shape22);
  }
  function shuffle(arr) {
    if (isDataFrame(arr) || isSeries(arr)) {
      return arr.shuffle(...Object.values(arguments).slice(1));
    }
    assert(isArray(arr), "The `shuffle` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    const temp = arr.slice();
    for (let i = 0; i < arr.length; i++) {
      const index = Math.floor(random() * temp.length);
      out22.push(temp.splice(index, 1)[0]);
    }
    return out22;
  }
  function dfShuffle(df, axis) {
    if (isUndefined(axis))
      axis = 0;
    assert(axis === 0 || axis === 1, "The `axis` parameter to the `shuffle` must be 0, 1, or undefined.");
    return df.get(axis === 0 ? shuffle(df.index) : null, axis === 1 ? shuffle(df.columns) : null);
  }
  function isBoolean(x) {
    return typeof x === "boolean";
  }
  function dfSort(df, a, b) {
    if (isFunction(a)) {
      return dfSortByFunction(df, a, b);
    } else {
      return dfSortByColumns(df, a, b);
    }
  }
  function dfSortByFunction(df, fn, axis) {
    axis = isUndefined(axis) ? 0 : axis;
    assert(isFunction(fn), "When sorting a DataFrame using a function, the first argument to the `sort` method must be a function!");
    assert(isNumber(axis), "When sorting a DataFrame using a function, the second argument to the `sort` method must be null, undefined, 0, or 1 to indicate the axis along which the data should be sorted! An axis of 0 means that the rows will be sorted relative to each other, whereas an axis of 1 means that the columns will be sorted relative to each other.");
    if (axis === 0) {
      const index = sort(df.index, (a, b) => {
        return fn(df.get(a, null), df.get(b, null));
      });
      return df.get(index, null);
    } else {
      const columns = sort(df.columns, (a, b) => {
        return fn(df.get(null, a), df.get(null, b));
      });
      return df.get(null, columns);
    }
  }
  function dfSortByColumns(df, cols, directions) {
    let out22 = df.copy();
    const indexID = random().toString();
    out22 = out22.assign(indexID, out22.index);
    if (isUndefined(cols)) {
      cols = [indexID];
      directions = [true];
    }
    if (isNumber(cols) || isString(cols)) {
      cols = [cols];
      if (isBoolean(directions) || isString(directions))
        directions = [directions];
    }
    assert(isArray(cols), "The first parameter of the `sort` method must be (1) a string or index representing a column name or index, respectively; (2) a 1-dimensional array of strings and/or indices; or (3) null.");
    assert(shape(cols).length === 1, "The first parameter of the `sort` method must be (1) a string or index representing a column name or index, respectively; (2) a 1-dimensional array of strings and/or indices; or (3) null.");
    if (isUndefined(directions))
      directions = range(0, cols.length).map(() => true);
    assert(isArray(directions), "The second parameter of the `sort` method must be (1) a string or boolean representing the sort direction ('ascending' / 'descending', or true / false); (2) a 1-dimensional array of strings and/or booleans; or (3) null.");
    assert(shape(directions).length === 1, "The second parameter of the `sort` method must be (1) a string or boolean representing the sort direction ('ascending' / 'descending', or true / false); (2) a 1-dimensional array of strings and/or booleans; or (3) null.");
    assert(cols.length === directions.length, "The arrays passed into the `sort` method must be equal in length.");
    cols = cols.map((col) => {
      assert(isString(col) || isNumber(col), "Column references can either be column names (as strings) or column indices (as whole numbers).");
      if (isString(col)) {
        const index = out22.columns.indexOf(col);
        assert(index > -1, `The column "${col}" does not exist!`);
        return index;
      }
      if (isNumber(col)) {
        assert(isWholeNumber(col), "Column indices must be whole numbers!");
        assert(col < out22.columns.length, `The index ${col} is out of bounds!`);
        return col;
      }
    });
    directions = directions.map((dir) => {
      assert(isString(dir) || isBoolean(dir), "Direction references can either be strings ('ascending' or 'descending') or booleans (true or false).");
      if (isString(dir)) {
        const value = dir.trim().toLowerCase();
        assert(value === "ascending" || value === "descending", "Direction references can either be strings ('ascending' or 'descending') or booleans (true or false).");
        return value === "ascending";
      }
      if (isBoolean(dir)) {
        return dir;
      }
    });
    out22.values = sort(out22.values, (a, b) => {
      let counter = 0;
      while (a[cols[counter]] === b[cols[counter]] && counter < cols.length) {
        counter++;
      }
      const isAscending = directions[counter];
      if (a[cols[counter]] === b[cols[counter]])
        return 0;
      if (a[cols[counter]] < b[cols[counter]])
        return isAscending ? -1 : 1;
      if (a[cols[counter]] > b[cols[counter]])
        return isAscending ? 1 : -1;
    });
    const indexNumber = out22.columns.indexOf(indexID);
    out22.index = out22.values.map((row) => row[indexNumber]);
    out22 = out22.dropColumns(indexID);
    return out22;
  }
  function dfToDetailedObject(df, axis) {
    if (isUndefined(axis)) {
      axis = 0;
    } else {
      assert(axis === 0 || axis === 1, "The axis parameter of the `toDetailedObject` method must be undefined, 0, or 1. An axis of 0 indicates that the returned object should be organized first by rows and then by columns. An axis of 1 indicates that the returned object should be organized first by columns and then by rows.");
    }
    const out22 = {};
    if (axis === 0) {
      df.index.forEach((rowName, i) => {
        const temp = {};
        df.columns.forEach((colName, j) => {
          temp[colName] = df.values[i][j];
        });
        out22[rowName] = temp;
      });
    } else {
      df.columns.forEach((colName, j) => {
        const temp = {};
        df.index.forEach((rowName, i) => {
          temp[rowName] = df.values[i][j];
        });
        out22[colName] = temp;
      });
    }
    return out22;
  }
  function dfToJSONString(df, axis) {
    return JSON.stringify(df.toObject(axis));
  }
  async function dfToJSON(df, filename, axis) {
    const out22 = dfToJSONString(df, axis);
    let downloadedInBrowser = false;
    let wroteToDiskInNode = false;
    let browserError, nodeError;
    try {
      let newFilename = filename;
      if (filename.includes("/")) {
        const parts = filename.split("/");
        newFilename = parts[parts.length - 1];
      }
      const a = document.createElement("a");
      a.href = `data:application/json;charset=utf-8,${encodeURIComponent(out22)}`;
      a.download = newFilename;
      a.dispatchEvent(new MouseEvent("click"));
      downloadedInBrowser = true;
    } catch (e) {
      browserError = e;
    }
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      fs.writeFileSync(path.resolve(filename), out22, "utf8");
      wroteToDiskInNode = true;
    } catch (e) {
      nodeError = e;
    }
    if (!downloadedInBrowser && !wroteToDiskInNode) {
      if (typeof window !== "undefined") {
        throw new MathError(browserError);
      } else if (typeof module !== "undefined") {
        throw new MathError(nodeError);
      } else {
        throw new MathError("I don't know what's going wrong, but it doesn't seem like you're in Node or the browser, and we couldn't download and/or write the file to disk!");
      }
    }
    return df;
  }
  function dfToObject(df) {
    const out22 = {};
    df.columns.forEach((col) => {
      out22[col] = df.get(col).values;
    });
    return out22;
  }
  function transpose(arr) {
    if (isDataFrame(arr) || isSeries(arr)) {
      return arr.transpose();
    }
    assert(isArray(arr), "The `transpose` function only works on arrays, Series, and DataFrames!");
    const theShape = shape(arr);
    assert(theShape.length <= 2, "I'm not smart enough to know how to transpose arrays that have more than 2 dimensions. Sorry for the inconvenience! Please only pass 1- or 2-dimensional arrays into the `transpose` function!");
    if (theShape.length === 1) {
      return reverse(arr);
    } else if (theShape.length === 2) {
      const out22 = ndarray(reverse(theShape));
      for (let row = 0; row < theShape[0]; row++) {
        for (let col = 0; col < theShape[1]; col++) {
          out22[col][row] = arr[row][col];
        }
      }
      return out22;
    }
  }
  function seriesAppend(Series22, series, x) {
    if (isSeries(x)) {
      return new Series22(series.values.concat(x.values));
    }
    if (isArray(x)) {
      const xShape = shape(x);
      assert(xShape.length === 1 && !isNested(xShape), "Only vectors can be appended to Series!");
      const out22 = series.copy();
      x.forEach((v, i) => {
        out22._values.push(v);
        out22._index.push("item" + (series.values.length + i));
      });
      return out22;
    }
    return seriesAppend(series, [x]);
  }
  function seriesApply(series, fn) {
    assert(isFunction(fn), "The parameter to the `apply` method must be a function.");
    const out22 = series.copy();
    out22._values = out22._values.map((v, i) => fn(v, i));
    return out22;
  }
  function seriesDropMissing(series) {
    const out22 = series.copy();
    const outIndex = [];
    out22._values = out22.values.filter((v, i) => {
      if (isUndefined(v)) {
        return false;
      } else {
        outIndex.push(out22.index[i]);
        return true;
      }
    });
    out22._index = outIndex;
    return out22;
  }
  function seriesDropNaN(Series22, series) {
    const index = [];
    const values = [];
    series.values.forEach((value, i) => {
      if (isNumber(value)) {
        values.push(value);
        index.push(series.index[i]);
      }
    });
    const out22 = new Series22(values);
    out22.name = series.name;
    out22.index = index;
    return out22;
  }
  function seriesFilter(Series22, series, fn) {
    let out22 = series.copy();
    const index = copy(out22.index);
    const indicesToRemove = [];
    const newValues = out22.values.filter((value, i) => {
      const shouldKeep = fn(value, i, out22.values);
      if (!shouldKeep)
        indicesToRemove.push(out22.index[i]);
      return shouldKeep;
    });
    indicesToRemove.forEach((i) => {
      index.splice(index.indexOf(i), 1);
    });
    if (newValues.length === 0) {
      out22 = new Series22();
      out22.name = series.name;
      return out22;
    }
    out22.values = newValues;
    out22.index = index;
    return out22;
  }
  function seriesGet(series, indices) {
    if (isString(indices) || isNumber(indices))
      indices = [indices];
    for (const i in indices) {
      if (typeof indices[i] === "bigint") {
        indices[i] = Number(indices[i]);
      }
    }
    const types = set((indices || []).map((v) => typeof v));
    assert(types.length <= 2, "Only whole numbers and/or strings are allowed in `get` arrays!");
    if (types.length === 1) {
      assert(types[0] === "string" || types[0] === "number", "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (types.length === 2) {
      assert(types.indexOf("string") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
      assert(types.indexOf("number") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (!isUndefined(indices)) {
      indices = indices.map((i) => {
        if (typeof i === "string") {
          assert(series.index.indexOf(i) > -1, `Index "${i}" does not exist!`);
          return i;
        }
        if (typeof i === "number") {
          assert(i >= 0, `Index ${i} is out of bounds!`);
          assert(Math.floor(i) === i, `Indices must be integers!`);
          assert(i < series.index.length, `Index ${i} is out of bounds!`);
          return series.index[i];
        }
      });
    }
    return series.getSubsetByNames(indices);
  }
  function seriesGetSubsetByIndices(series, indices) {
    const dataShape = series.shape;
    if (isUndefined(indices))
      indices = range(0, dataShape[0]);
    assert(isArray(indices), "The `indices` array must be 1-dimensional array of whole numbers.");
    assert(shape(indices).length === 1, "The `indices` array must be a 1-dimensional array of whole numbers.");
    assert(indices.length > 0, "The `indices` array must contain at least one index.");
    indices.forEach((index) => {
      assert(isWholeNumber(index), "The `indices` array must be a 1-dimensional array of whole numbers.");
      assert(index < series.index.length, `The row index ${index} is out of bounds.`);
    });
    const rows = indices.map((i) => series.index[i]);
    return series.getSubsetByNames(rows);
  }
  function seriesGetSubsetByNames(Series22, series, indices) {
    if (isUndefined(indices))
      indices = series.index;
    assert(isArray(indices), "The `indices` array must be a 1-dimensional array of strings.");
    assert(shape(indices).length === 1, "The `indices` array must be a 1-dimensional array of strings.");
    assert(indices.length > 0, "The `indices` array must contain at least one index name.");
    indices.forEach((name) => {
      assert(isString(name), "The `indices` array must contain only strings.");
      assert(series.index.indexOf(name) > -1, `The name "${name}" does not exist in the index.`);
    });
    const values = indices.map((name) => {
      return series.values[series.index.indexOf(name)];
    });
    if (values.length === 1)
      return values[0];
    const out22 = new Series22(values);
    out22.index = indices;
    out22.name = series.name;
    return out22;
  }
  function seriesPrint(series) {
    let temp = series.copy();
    const maxRows = typeof window === "undefined" ? 20 : 10;
    if (temp.index.length > maxRows) {
      temp = temp.get(range(0, maxRows / 2).concat(range(temp.index.length - maxRows / 2, temp.index.length)));
      const tempIndex = copy(temp.index);
      tempIndex.splice(Math.floor(tempIndex.length / 2), 0, "...");
      temp.values.push("...");
      temp.index.push("...");
      temp = temp.get(tempIndex);
    }
    const out22 = {};
    temp.values.forEach((value, i) => {
      const obj = {};
      obj[temp.name] = value;
      out22[temp.index[i]] = obj;
    });
    console.table(out22);
    console.log("Shape:", series.shape, "\n");
    return series;
  }
  function seriesShuffle(series) {
    const out22 = series.copy();
    return out22.get(shuffle(out22.index));
  }
  function seriesSort(Series22, series, fn) {
    fn = fn || ((a, b) => a < b ? -1 : 1);
    assert(isUndefined(fn) || isFunction(fn), "You must pass undefined, null, or a comparison function as the second argument to the `sort` method!");
    const pairs = transpose([series.values, series.index]);
    const temp = sort(pairs, (aPair, bPair) => {
      return fn(aPair[0], bPair[0]);
    });
    const newValues = [];
    const newIndex = [];
    temp.forEach((pair) => {
      newValues.push(pair[0]);
      newIndex.push(pair[1]);
    });
    const out22 = new Series22();
    out22._values = newValues;
    out22._index = newIndex;
    out22.name = series.name;
    return out22;
  }
  function seriesSortByIndex(Series22, series) {
    let temp = transpose([series.values, series.index]);
    temp = transpose(sort(temp, (a, b) => {
      if (a[1] === b[1])
        return 0;
      if (a[1] < b[1])
        return -1;
      if (a[1] > b[1])
        return 1;
    }));
    const out22 = new Series22(temp[0]);
    out22.index = temp[1];
    out22.name = series.name;
    return out22;
  }
  function seriesToObject(series) {
    const out22 = {};
    out22[series.name] = {};
    series.index.forEach((index, i) => {
      out22[series.name][index] = series.values[i];
    });
    return out22;
  }
  var SERIES_SYMBOL = Symbol.for("@jrc03c/js-math-tools/series");
  function createSeriesClass(DataFrame22) {
    class Series22 {
      static [Symbol.hasInstance](x) {
        try {
          return !!x._symbol && x._symbol === SERIES_SYMBOL;
        } catch (e) {
          return false;
        }
      }
      constructor(data) {
        this.name = "data";
        Object.defineProperty(this, "_symbol", {
          configurable: false,
          enumerable: false,
          writable: false,
          value: SERIES_SYMBOL
        });
        Object.defineProperty(this, "_values", {
          value: [],
          configurable: true,
          enumerable: false,
          writable: true
        });
        Object.defineProperty(this, "values", {
          configurable: true,
          enumerable: true,
          get() {
            return this._values;
          },
          set(x) {
            assert(isArray(x), "The new values must be a 1-dimensional array!");
            const dataShape = shape(x);
            assert(dataShape.length === 1, "The new array of values must be 1-dimensional!");
            if (dataShape[0] < this._index.length) {
              this._index = this._index.slice(0, dataShape[0]);
            } else if (dataShape[0] > this._index.length) {
              this._index = this._index.concat(range(this._index.length, dataShape[0]).map((i) => {
                return "item" + leftPad(i, (x.length - 1).toString().length);
              }));
            }
            this._values = x;
          }
        });
        Object.defineProperty(this, "_index", {
          value: [],
          configurable: true,
          enumerable: false,
          writable: true
        });
        Object.defineProperty(this, "index", {
          configurable: true,
          enumerable: true,
          get() {
            return this._index;
          },
          set(x) {
            assert(isArray(x), "The new index must be a 1-dimensional array of strings!");
            assert(x.length === this.shape[0], "The new index must be the same length as the old index!");
            assert(shape(x).length === 1, "The new index must be a 1-dimensional array of strings!");
            x.forEach((value) => {
              assert(isString(value), "All of the row names must be strings!");
            });
            this._index = x;
          }
        });
        if (data) {
          if (data instanceof Series22) {
            this.name = data.name;
            this.values = copy(data.values);
            this.index = copy(data.index);
          } else if (isArray(data)) {
            const dataShape = shape(data);
            assert(dataShape.length === 1, "When passing an array into the constructor of a Series, the array must be 1-dimensional!");
            this.values = data;
          } else if (data instanceof Object) {
            const keys = Object.keys(data).concat(Object.getOwnPropertySymbols(data)).map((v) => v.toString());
            assert(keys.length === 1, "When passing an object into the constructor of a Series, the object must have only 1 key-value pair, where the key is the name of the data and the value is the 1-dimensional array of values!");
            const name = keys[0];
            const values = data[name];
            assert(shape(values).length === 1, "When passing an object into the constructor of a Series, the object must have only 1 key-value pair, where the key is the name of the data and the value is the 1-dimensional array of values!");
            this.name = name;
            this.values = values.slice();
          }
        }
      }
      get shape() {
        return shape(this.values);
      }
      get length() {
        return this.shape[0];
      }
      get isEmpty() {
        return this.values.filter((v) => !isUndefined(v)).length === 0;
      }
      clear() {
        const out22 = this.copy();
        out22.values.forEach((v, i) => {
          out22.values[i] = void 0;
        });
        return out22;
      }
      get(indices) {
        return seriesGet(this, indices);
      }
      getSubsetByNames(indices) {
        return seriesGetSubsetByNames(Series22, this, indices);
      }
      getSubsetByIndices(indices) {
        return seriesGetSubsetByIndices(this, indices);
      }
      loc(indices) {
        return this.getSubsetByNames(indices);
      }
      iloc(indices) {
        return this.getSubsetByIndices(indices);
      }
      reverse() {
        const out22 = new Series22(reverse(this.values));
        out22.index = reverse(this.index);
        out22.name = this.name;
        return out22;
      }
      resetIndex() {
        const out22 = this.copy();
        out22.index = range(0, this.shape[0]).map((i) => {
          return "item" + leftPad(i, (out22.index.length - 1).toString().length);
        });
        return out22;
      }
      copy() {
        const out22 = new Series22();
        out22._values = copy(this.values);
        out22._index = copy(this.index);
        out22.name = this.name;
        return out22;
      }
      append(x) {
        return seriesAppend(Series22, this, x);
      }
      apply(fn) {
        return seriesApply(this, fn);
      }
      concat(x) {
        return this.append(x);
      }
      dropMissing(condition, threshold) {
        return seriesDropMissing(this, condition, threshold);
      }
      dropNaN() {
        return seriesDropNaN(Series22, this);
      }
      toObject() {
        return seriesToObject(this);
      }
      print() {
        return seriesPrint(this);
      }
      shuffle() {
        return seriesShuffle(this);
      }
      sort(direction) {
        return seriesSort(Series22, this, direction);
      }
      sortByIndex() {
        return seriesSortByIndex(Series22, this);
      }
      filter(fn) {
        return seriesFilter(Series22, this, fn);
      }
      toDataFrame() {
        const out22 = new DataFrame22(transpose([this.values]));
        out22.columns = [this.name];
        out22.index = this.index;
        return out22;
      }
      transpose() {
        const out22 = this.copy();
        out22.values = reverse(out22.values);
        out22.index = reverse(out22.index);
        return out22;
      }
      getDummies() {
        return this.toDataFrame().getDummies();
      }
      oneHotEncode() {
        return this.getDummies();
      }
    }
    return Series22;
  }
  var DATAFRAME_SYMBOL = Symbol.for("@jrc03c/js-math-tools/dataframe");
  function makeKey3(n) {
    const alpha = "abcdefghijklmnopqrstuvwxyz1234567890";
    let out22 = "";
    for (let i = 0; i < n; i++)
      out22 += alpha[Math.floor(random() * alpha.length)];
    return out22;
  }
  var DataFrame = class {
    static [Symbol.hasInstance](x) {
      try {
        return !!x._symbol && x._symbol === DATAFRAME_SYMBOL;
      } catch (e) {
        return false;
      }
    }
    constructor(data) {
      Object.defineProperty(this, "_symbol", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: DATAFRAME_SYMBOL
      });
      Object.defineProperty(this, "_values", {
        value: [],
        configurable: true,
        enumerable: false,
        writable: true
      });
      Object.defineProperty(this, "values", {
        configurable: true,
        enumerable: true,
        get() {
          if (this._values.length === 0 || !isUndefined(this._values[0]) && this._values[0].length === 0) {
            return [[]];
          }
          return this._values;
        },
        set(x) {
          assert(isArray(x), "The new values must be a 2-dimensional array!");
          const dataShape = shape(x);
          assert(dataShape.length === 2, "The new array of values must be 2-dimensional!");
          if (dataShape[0] < this._index.length) {
            this._index = this._index.slice(0, dataShape[0]);
          } else if (dataShape[0] > this._index.length) {
            this._index = this._index.concat(range(this._index.length, dataShape[0]).map((i) => {
              return "row" + leftPad(i, (dataShape[0] - 1).toString().length);
            }));
          }
          if (dataShape[1] < this._columns.length) {
            this._columns = this._columns.slice(0, dataShape[1]);
          } else if (dataShape[1] > this._columns.length) {
            this._columns = this._columns.concat(range(this._columns.length, dataShape[1]).map((i) => {
              return "col" + leftPad(i, (dataShape[1] - 1).toString().length);
            }));
          }
          this._values = x;
        }
      });
      Object.defineProperty(this, "_columns", {
        value: [],
        configurable: true,
        enumerable: false,
        writable: true
      });
      Object.defineProperty(this, "columns", {
        configurable: true,
        enumerable: true,
        get() {
          return this._columns;
        },
        set(x) {
          assert(isArray(x), "The new columns list must be a 1-dimensional array of strings!");
          assert(this.isEmpty || x.length === this.shape[1], "The new columns list must be the same length as the old columns list!");
          assert(shape(x).length === 1, "The new columns list must be a 1-dimensional array of strings!");
          x = x.map((v) => {
            if (typeof v !== "string") {
              v = JSON.stringify(v) || v.toString();
            }
            if (v.trim().length === 0) {
              return "untitled_" + makeKey3(8);
            }
            return v.trim();
          });
          const counts = (() => {
            const temp = count(x);
            const out22 = {};
            temp.values.forEach((v) => {
              out22[v] = temp.get(v);
            });
            return out22;
          })();
          x = x.map((v) => {
            if (counts[v] > 1) {
              return v + "_" + makeKey3(8);
            }
            return v;
          });
          this._columns = x;
        }
      });
      Object.defineProperty(this, "_index", {
        value: [],
        configurable: true,
        enumerable: false,
        writable: true
      });
      Object.defineProperty(this, "index", {
        configurable: true,
        enumerable: true,
        get() {
          return this._index;
        },
        set(x) {
          assert(isArray(x), "The new index must be a 1-dimensional array of strings!");
          assert(this.isEmpty || x.length === this.shape[0], "The new index must be the same length as the old index!");
          assert(shape(x).length === 1, "The new index must be a 1-dimensional array of strings!");
          x = x.map((v) => {
            if (typeof v !== "string") {
              v = JSON.stringify(v) || v.toString();
            }
            if (v.trim().length === 0) {
              return "untitled_" + makeKey3(8);
            }
            return v.trim();
          });
          const counts = (() => {
            const temp = count(x);
            const out22 = {};
            temp.values.forEach((v) => {
              out22[v] = temp.get(v);
            });
            return out22;
          })();
          x = x.map((v) => {
            if (counts[v] > 1) {
              return v + "_" + makeKey3(8);
            }
            return v;
          });
          this._index = x;
        }
      });
      assert(isUndefined(data) || isObject(data) || isArray(data), "The `data` passed into the constructor of a DataFrame must be either (1) an object where the key-value pairs are (respectively) column names and 1-dimensional arrays of values, or (2) a 2-dimensional array of values.");
      if (data) {
        if (data instanceof DataFrame) {
          this.values = copy(data.values);
          this.columns = copy(data.columns);
          this.index = copy(data.index);
        } else if (isArray(data)) {
          const dataShape = shape(data);
          assert(dataShape.length === 2, "The `data` array passed into the constructor of a DataFrame must be 2-dimensional!");
          assert(!isJagged(data), "The 2-dimensional array passed into the constructor of a DataFrame must not contain sub-arrays (i.e., rows) of different lengths!");
          this.values = data;
        } else {
          this._columns = Object.keys(data).concat(Object.getOwnPropertySymbols(data)).map((v) => v.toString());
          const temp = [];
          let lastColName = null;
          let lastColLength = null;
          this._columns.forEach((col) => {
            if (isUndefined(lastColLength)) {
              lastColName = col;
              lastColLength = data[col].length;
            }
            assert(data[col].length === lastColLength, `The object passed into the DataFrame constructor contains arrays of different lengths! The key "${lastColName}" points to an array containing ${lastColLength} items, and the key "${col}" points to an array containing ${data[col].length} items.`);
            lastColLength = data[col].length;
            const values = data[col];
            temp.push(values);
          });
          this._values = transpose(temp);
          const dataShape = shape(this.values);
          this._index = range(0, dataShape[0]).map((i) => {
            return "row" + leftPad(i, (dataShape[0] - 1).toString().length);
          });
        }
      }
    }
    get shape() {
      return shape(this.values);
    }
    get length() {
      return this.shape[0];
    }
    get width() {
      return this.shape[1];
    }
    get rows() {
      return this.index;
    }
    set rows(rows) {
      this.index = rows;
    }
    get isEmpty() {
      return this.values.length === 0 || this.values.every((row) => row.length === 0);
    }
    clear() {
      const out22 = new DataFrame(ndarray(this.shape));
      out22.columns = this.columns.slice();
      out22.index = this.index.slice();
      return out22;
    }
    get(rows, cols) {
      if (arguments.length === 0) {
        return this;
      }
      if (arguments.length === 1) {
        try {
          return this.get(null, rows);
        } catch (e) {
          return this.get(rows, null);
        }
      }
      return dfGet(this, rows, cols);
    }
    getSubsetByNames(rows, cols) {
      return dfGetSubsetByNames(DataFrame, Series, this, rows, cols);
    }
    getSubsetByIndices(rowIndices, colIndices) {
      return dfGetSubsetByIndices(this, rowIndices, colIndices);
    }
    getDummies(columns) {
      return dfGetDummies(DataFrame, this, columns);
    }
    oneHotEncode(columns) {
      return dfGetDummies(DataFrame, this, columns);
    }
    transpose() {
      const out22 = new DataFrame(transpose(this.values));
      out22.columns = this.index.slice();
      out22.index = this.columns.slice();
      return out22;
    }
    get T() {
      return this.transpose();
    }
    resetIndex(shouldSkipCopying) {
      return dfResetIndex(this, shouldSkipCopying);
    }
    copy() {
      return dfCopy(DataFrame, this);
    }
    assign(p1, p2) {
      return dfAssign(DataFrame, Series, this, p1, p2);
    }
    apply(fn, axis) {
      return dfApply(DataFrame, Series, this, fn, axis);
    }
    dropMissing(axis, condition, threshold) {
      return dfDropMissing(DataFrame, Series, this, axis, condition, threshold);
    }
    dropNaN(axis, condition, threshold) {
      return dfDropNaN(DataFrame, this, axis, condition, threshold);
    }
    drop(rows, cols) {
      return dfDrop(DataFrame, Series, this, rows, cols);
    }
    dropColumns(columns) {
      return this.drop(null, columns);
    }
    dropRows(rows) {
      return this.drop(rows, null);
    }
    toDetailedObject(axis) {
      return dfToDetailedObject(this, axis);
    }
    toObject() {
      return dfToObject(this);
    }
    toJSONString(axis) {
      return dfToJSONString(this, axis);
    }
    saveAsJSON(filename, axis) {
      return dfToJSON(this, filename, axis);
    }
    print() {
      return dfPrint(DataFrame, Series, this);
    }
    sort(cols, directions) {
      return dfSort(this, cols, directions);
    }
    sortByIndex() {
      return this.sort();
    }
    filter(fn, axis) {
      return dfFilter(DataFrame, Series, this, fn, axis);
    }
    shuffle(axis) {
      return dfShuffle(this, axis);
    }
    append(x, axis) {
      return dfAppend(this, x, axis);
    }
    concat(x, axis) {
      return this.append(x, axis);
    }
    join(x, axis) {
      return this.append(x, axis);
    }
    toString() {
      return JSON.stringify(this);
    }
  };
  var Series = createSeriesClass(DataFrame);
  function max(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs }).max;
  }
  function vectorize(fn) {
    assert(isFunction(fn), "You must pass a function into the `vectorize` function!");
    return function helper52() {
      let hasSeries, hasDataFrames;
      const series = [];
      const dataframes = [];
      const childArrays = Object.keys(arguments).filter((key) => {
        const arg = arguments[key];
        if (isArray(arg)) {
          return true;
        } else if (isSeries(arg)) {
          hasSeries = true;
          series.push(arg);
          return true;
        } else if (isDataFrame(arg)) {
          hasDataFrames = true;
          dataframes.push(arg);
          return true;
        } else {
          return false;
        }
      }).map((key) => arguments[key]);
      childArrays.slice(0, -1).forEach((s22, i) => {
        assert(isEqual(isArray(s22) ? shape(s22) : s22.shape, isArray(childArrays[i + 1]) ? shape(childArrays[i + 1]) : childArrays[i + 1].shape), `When passing multiple arrays into the \`${fn.name}\` function, all of the arrays must have the same shape!`);
      });
      if (childArrays.length > 0) {
        const maxLength = max(childArrays.map((a) => a.length ? a.length : a.values.length));
        const out22 = range(0, maxLength).map((i) => {
          const args = Object.keys(arguments).map((key) => {
            if (isArray(arguments[key])) {
              return arguments[key][i];
            } else if (isSeries(arguments[key])) {
              return arguments[key].values[i];
            } else if (isDataFrame(arguments[key])) {
              return arguments[key].values[i];
            } else {
              return arguments[key];
            }
          });
          return helper52(...args);
        });
        if (hasDataFrames) {
          try {
            if (dataframes.length === 1 && isEqual(shape(dataframes[0]), shape(out22))) {
              const temp = new DataFrame(out22);
              temp.index = dataframes[0].index.slice();
              temp.columns = dataframes[0].columns.slice();
              return temp;
            } else {
              return new DataFrame(out22);
            }
          } catch (e) {
            return out22;
          }
        }
        if (hasSeries) {
          try {
            if (series.length === 1 && series[0].length === out22.length) {
              const temp = new Series(out22);
              temp.name = series[0].name;
              temp.index = series[0].index.slice();
              return temp;
            } else {
              return new Series(out22);
            }
          } catch (e) {
            return out22;
          }
        }
        return out22;
      } else {
        return fn(...arguments);
      }
    };
  }
  function abs(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        return x < 0 ? -x : x;
      } else {
        return Math.abs(x);
      }
    } catch (e) {
      return NaN;
    }
  }
  var vabs = vectorize(abs);
  function add() {
    try {
      let out22 = 0;
      let resultShouldBeABigInt = false;
      const x = Object.values(arguments);
      for (let v of x) {
        if (!isNumber(v))
          return NaN;
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
          v = Number(v);
        }
        out22 += v;
      }
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  }
  var vadd = vectorize(add);
  function apply(x, fn) {
    try {
      return fn(x);
    } catch (e) {
      return NaN;
    }
  }
  var vapply = vectorize(apply);
  function arccos(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.acos(x);
    } catch (e) {
      return NaN;
    }
  }
  var varccos = vectorize(arccos);
  function arcsin(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.asin(x);
    } catch (e) {
      return NaN;
    }
  }
  var varcsin = vectorize(arcsin);
  function arctan(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.atan(x);
    } catch (e) {
      return NaN;
    }
  }
  var varctan = vectorize(arctan);
  function argmax(x, shouldDropNaNs) {
    if (isDataFrame(x)) {
      const index = argmax(x.values, shouldDropNaNs);
      return [x.index[index[0]], x.columns[index[1]]];
    }
    if (isSeries(x)) {
      const index = argmax(x.values, shouldDropNaNs);
      return x.index[index];
    }
    assert(isArray(x), "The `argmax` function only works on arrays, Series, and DataFrames!");
    try {
      const out22 = indexOf(x, max(x, shouldDropNaNs));
      if (out22) {
        if (out22.length === 0) {
          return void 0;
        } else if (out22.length === 1) {
          return out22[0];
        } else {
          return out22;
        }
      } else {
        return void 0;
      }
    } catch (e) {
      return void 0;
    }
  }
  function min(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs }).min;
  }
  function argmin(x, shouldDropNaNs) {
    if (isDataFrame(x)) {
      const index = argmin(x.values, shouldDropNaNs);
      return [x.index[index[0]], x.columns[index[1]]];
    }
    if (isSeries(x)) {
      const index = argmin(x.values, shouldDropNaNs);
      return x.index[index];
    }
    assert(isArray(x), "The `argmin` function only works on arrays, Series, and DataFrames!");
    try {
      const out22 = indexOf(x, min(x, shouldDropNaNs));
      if (out22) {
        if (out22.length === 0) {
          return void 0;
        } else if (out22.length === 1) {
          return out22[0];
        } else {
          return out22;
        }
      } else {
        return void 0;
      }
    } catch (e) {
      return void 0;
    }
  }
  function cast(value, type) {
    if (isDataFrame(value) || isSeries(value)) {
      return value.apply((item) => cast(item, type));
    }
    if (isArray(value)) {
      return value.map((v) => cast(v, type));
    }
    if (type === "null") {
      return null;
    }
    if (type === "number") {
      if (isUndefined(value)) {
        return NaN;
      }
      const booleanValue = cast(value, "boolean");
      if (isBoolean(booleanValue)) {
        return booleanValue ? 1 : 0;
      }
      try {
        JSON.parse(value);
      } catch (e) {
        const dateValue = cast(value, "date");
        if (isDate(dateValue)) {
          return dateValue.getTime();
        }
      }
      const out22 = parseFloat(value);
      if (isNaN(out22))
        return NaN;
      return out22;
    }
    if (type === "int") {
      const out22 = cast(value, "number");
      return out22 >= 0 ? Math.floor(out22) : Math.ceil(out22);
    }
    if (type === "float") {
      return cast(value, "number");
    }
    if (type === "bigint") {
      if (typeof value === "bigint") {
        return value;
      }
      return BigInt(cast(value, "int"));
    }
    if (type === "boolean") {
      if (isBoolean(value)) {
        return value;
      }
      if (isNumber(value)) {
        if (value === 0) {
          return false;
        }
        if (value === 1) {
          return true;
        }
        return null;
      }
      try {
        const vBool = (typeof value === "object" ? value.toString() === "null" ? "false" : JSON.stringify(value) : value.toString()).trim().toLowerCase();
        if (vBool === "true" || vBool === "yes" || vBool === "y") {
          return true;
        }
        if (vBool === "false" || vBool === "no" || vBool === "n") {
          return false;
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    if (type === "date") {
      if (isDate(value)) {
        return value;
      }
      if (isUndefined(value)) {
        return null;
      }
      const valueFloat = parseFloat(value);
      if (!isNaN(valueFloat)) {
        const out22 = new Date(value);
        if (!isDate(out22))
          return null;
        return out22;
      }
      const valueDate = Date.parse(value);
      if (!isNaN(valueDate)) {
        return new Date(valueDate);
      }
      return null;
    }
    if (type === "object") {
      if (isObject(value)) {
        return value;
      }
      const booleanValue = cast(value, "boolean");
      if (isBoolean(booleanValue)) {
        return null;
      }
      try {
        const numberValue = cast(value, "number");
        if (isNumber(numberValue)) {
          JSON.parse(value);
          return null;
        }
      } catch (e) {
      }
      const dateValue = cast(value, "date");
      if (dateValue) {
        return dateValue;
      }
      try {
        const out22 = JSON.parse(value);
        if (isArray(out22)) {
          return out22.map((v) => cast(v, type));
        } else {
          return out22;
        }
      } catch (e) {
        return null;
      }
    }
    if (type === "string") {
      if (isUndefined(value)) {
        if (isEqual(value, void 0)) {
          return "undefined";
        }
        return "null";
      }
      if (value instanceof Date) {
        return value.toJSON();
      }
      const valueString = (() => {
        if (typeof value === "object") {
          if (value === null) {
            return "null";
          } else {
            return JSON.stringify(value);
          }
        } else {
          return value.toString();
        }
      })();
      return valueString;
    }
  }
  function ceil(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint")
        return x;
      return Math.ceil(x);
    } catch (e) {
      return NaN;
    }
  }
  var vceil = vectorize(ceil);
  function chop(x, threshold) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint")
        return x;
      if (isUndefined(threshold)) {
        threshold = 1e-10;
      } else if (!isNumber(threshold)) {
        return NaN;
      }
      return vabs(x) < threshold ? 0 : x;
    } catch (e) {
      return NaN;
    }
  }
  var vchop = vectorize(chop);
  function int(x) {
    if (isDataFrame(x) || isSeries(x)) {
      const out22 = x.copy();
      out22.values = int(out22.values);
      return out22;
    }
    if (isArray(x)) {
      return x.map((v) => int(v));
    } else {
      try {
        const out22 = JSON.parse(x);
        if (isNumber(out22)) {
          return typeof out22 === "bigint" ? Number(out22) : out22 >= 0 ? Math.floor(out22) : Math.ceil(out22);
        }
        return NaN;
      } catch (e) {
        return NaN;
      }
    }
  }
  var vint = vectorize(int);
  function clamp(x, a, b) {
    try {
      if (!isNumber(x))
        return NaN;
      if (!isNumber(a))
        return NaN;
      if (!isNumber(b))
        return NaN;
      if (typeof x === "bigint") {
        return BigInt(clamp(vint(x), a, b));
      }
      if (x < a)
        return a;
      if (x > b)
        return b;
      return x;
    } catch (e) {
      return NaN;
    }
  }
  var vclamp = vectorize(clamp);
  function combinationsIterator(x, r) {
    function* helper52(x2, r2) {
      if (r2 > x2.length) {
        yield x2;
      } else if (r2 <= 0) {
        yield [];
      } else if (x2.length < 2) {
        yield x2;
      } else {
        for (let i = 0; i < x2.length; i++) {
          const item = x2[i];
          const after = x2.slice(i + 1);
          if (after.length < r2 - 1) {
            continue;
          }
          if (r2 - 1 >= 0) {
            for (const child of combinationsIterator(after, r2 - 1)) {
              yield [item].concat(child);
            }
          }
        }
      }
    }
    if (isDataFrame(x) || isSeries(x)) {
      return combinationsIterator(x.values, r);
    }
    assert(isArray(x), "The `combinations` function only works on arrays, Series, and DataFrames!");
    assert(isNumber(r) && vint(r) === r && r >= 0, "`r` must be a non-negative integer!");
    return helper52(flatten(x), r);
  }
  function combinations(x, r) {
    const out22 = [];
    for (const combo of combinationsIterator(x, r)) {
      out22.push(combo.slice());
    }
    return out22;
  }
  function intersect() {
    const arrays = Object.values(arguments).map((x) => {
      if (isDataFrame(x) || isSeries(x)) {
        return set(x.values);
      }
      assert(isArray(x), "The `intersect` function only works on arrays, Series, and DataFrames!");
      return set(x);
    });
    const all = set(arrays);
    return all.filter((v) => {
      return arrays.every((arr) => arr.findIndex((other) => isEqual(other, v)) > -1);
    });
  }
  var _IndexMatcher = class {
    constructor(mode22) {
      assert(isUndefined(mode22) || mode22 === _IndexMatcher.DROP_NAN_MODE || mode22 === _IndexMatcher.DROP_MISSING_MODE, "The `mode` value passed into the `IndexMatcher` constructor must be undefined or one of [IndexMatcher.DROP_NAN_MODE, IndexMatcher.DROP_MISSING_MODE]! (By default, the mode is `Indexer.DROP_MISSING_MODE`.)");
      this.mode = !isUndefined(mode22) ? mode22 : _IndexMatcher.DROP_NAN_MODE;
      this.index = null;
    }
    fit() {
      const indices = [];
      Object.values(arguments).forEach((x) => {
        if (isArray(x)) {
          const xshape = shape(x);
          if (xshape.length === 1) {
            x = new Series(x);
          } else if (xshape.length === 2) {
            x = new DataFrame(x);
          } else {
            throw new Error("The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
          }
        }
        assert(isDataFrame(x) || isSeries(x), "The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
        if (this.mode === _IndexMatcher.DROP_MISSING_MODE) {
          indices.push(x.dropMissing().index);
        } else {
          indices.push(x.dropNaN().index);
        }
      });
      this.index = intersect(...indices);
      return this;
    }
    transform() {
      assert(!!this.index, "The IndexMatcher hasn't been fitted yet! Please call the `fit` method before calling the `transform` method.");
      const out22 = Object.values(arguments).map((x) => {
        if (isArray(x)) {
          const xshape = shape(x);
          if (xshape.length === 1) {
            return new Series(x).get(this.index).values;
          } else if (xshape.length === 2) {
            return new DataFrame(x).get(this.index, null).values;
          } else {
            throw new Error("The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
          }
        }
        assert(isDataFrame(x) || isSeries(x), "The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
        return x.get(this.index, null);
      });
      return out22.length === 1 ? out22[0] : out22;
    }
    fitAndTransform() {
      return this.fit(...arguments).transform(...arguments);
    }
  };
  var IndexMatcher = _IndexMatcher;
  __publicField(IndexMatcher, "DROP_NAN_MODE", "DROP_NAN_MODE");
  __publicField(IndexMatcher, "DROP_MISSING_MODE", "DROP_MISSING_MODE");
  function covariance(x, y, shouldDropNaNs, shouldAlsoReturnStatsObjects) {
    if (isSeries(x)) {
      return covariance(x.values, y, shouldDropNaNs, shouldAlsoReturnStatsObjects);
    }
    if (isSeries(y)) {
      return covariance(x, y.values, shouldDropNaNs, shouldAlsoReturnStatsObjects);
    }
    assert(isArray(x) && isArray(y) && shape(x).length === 1 && shape(y).length === 1, "The `covariance` function only works on 1-dimensional arrays and Series!");
    assert(x.length === y.length, "The two arrays or Series passed into the `covariance` function must have the same length!");
    if (shouldDropNaNs) {
      return covariance(...new IndexMatcher().fitAndTransform(x, y), false, shouldAlsoReturnStatsObjects);
    }
    try {
      const xstats = stats(x, { stdev: shouldAlsoReturnStatsObjects });
      const ystats = stats(y, { stdev: shouldAlsoReturnStatsObjects });
      const mx = Number(xstats.mean);
      const my = Number(ystats.mean);
      if (!isNumber(mx) || !isNumber(my)) {
        return NaN;
      }
      const n = Math.max(x.length, y.length);
      let out22 = 0;
      for (let i = 0; i < n; i++) {
        let vx = x[i];
        let vy = y[i];
        if (!isNumber(vx))
          return NaN;
        if (!isNumber(vy))
          return NaN;
        if (typeof vx === "bigint") {
          vx = Number(vx);
        }
        if (typeof vy === "bigint") {
          vy = Number(vy);
        }
        out22 += (vx - mx) * (vy - my);
      }
      if (shouldAlsoReturnStatsObjects) {
        return [out22 / x.length, xstats, ystats];
      } else {
        return out22 / x.length;
      }
    } catch (e) {
      return NaN;
    }
  }
  function correl(x, y, shouldDropNaNs) {
    if (isSeries(x)) {
      return correl(x.values, y, shouldDropNaNs);
    }
    if (isSeries(y)) {
      return correl(x, y.values, shouldDropNaNs);
    }
    assert(isArray(x) && isArray(y) && shape(x).length === 1 && shape(y).length === 1, "The `correl` function only works on 1-dimensional arrays and Series!");
    assert(x.length === y.length, "The two arrays or Series passed into the `correl` function must have the same length!");
    try {
      const shouldAlsoReturnStatsObjects = true;
      const [num, xstats, ystats] = covariance(x, y, shouldDropNaNs, shouldAlsoReturnStatsObjects);
      const den = xstats.stdev * ystats.stdev;
      return num / den;
    } catch (e) {
      return NaN;
    }
  }
  function cos(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.cos(x);
    } catch (e) {
      return NaN;
    }
  }
  var vcos = vectorize(cos);
  var dataTypes = Object.freeze({
    boolean: "boolean",
    date: "date",
    null: "null",
    number: "number",
    object: "object",
    string: "string"
  });
  function diff(a, b) {
    if (isDataFrame(a) || isSeries(a)) {
      return diff(a.values, b);
    }
    if (isDataFrame(b) || isSeries(b)) {
      return diff(a, b.values);
    }
    assert(isArray(a) && isArray(b), "The `diff` function only works on arrays, Series, and DataFrames!");
    const aTemp = set(a);
    const bTemp = set(b);
    const out22 = [];
    aTemp.forEach((item) => {
      if (bTemp.findIndex((other) => isEqual(other, item)) < 0) {
        out22.push(item);
      }
    });
    return out22;
  }
  function pow(x, p) {
    try {
      if (!isNumber(x))
        return NaN;
      if (!isNumber(p))
        return NaN;
      if (typeof x === "bigint" || typeof p === "bigint") {
        const out22 = pow(Number(x), Number(p));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return Math.pow(x, p);
    } catch (e) {
      return NaN;
    }
  }
  var vpow = vectorize(pow);
  function sqrt(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        const out22 = sqrt(Number(x));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return Math.sqrt(x);
    } catch (e) {
      return NaN;
    }
  }
  var vsqrt = vectorize(sqrt);
  function multiply() {
    try {
      const x = Object.values(arguments);
      if (x.length === 0)
        return NaN;
      let resultShouldBeABigInt = false;
      let out22 = 1;
      for (let v of x) {
        if (!isNumber(v))
          return NaN;
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
          v = Number(v);
        }
        out22 *= v;
      }
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  }
  var vmultiply = vectorize(multiply);
  function scale() {
    return vmultiply(...arguments);
  }
  function subtract(a, b) {
    return vadd(a, scale(b, -1));
  }
  function sum(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs }).sum;
  }
  function distance(a, b) {
    if (isNumber(a) && isNumber(b)) {
      return vabs(a - b);
    }
    if (isDataFrame(a) || isSeries(a)) {
      return distance(a.values, b);
    }
    if (isDataFrame(b) || isSeries(b)) {
      return distance(a, b.values);
    }
    if (isArray(a) && isArray(b)) {
      assert(isEqual(shape(a), shape(b)), "If passing two arrays, Series, or DataFrames into the `distance` function, then those objects must have the same shape!");
    }
    try {
      return vsqrt(sum(vpow(subtract(a, b), 2)));
    } catch (e) {
      return NaN;
    }
  }
  function divide(a, b) {
    return scale(a, vpow(b, -1));
  }
  function dot(a, b) {
    if (isDataFrame(a)) {
      const temp = dot(a.values, b);
      if (shape(temp).length === 1) {
        const out22 = new Series(temp);
        out22.name = isSeries(b) ? b.name : out22.name;
        out22.index = a.index.slice();
        return out22;
      } else {
        const out22 = new DataFrame(temp);
        out22.index = a.index.slice();
        if (isDataFrame(b)) {
          out22.columns = b.columns.slice();
        }
        return out22;
      }
    }
    if (isDataFrame(b)) {
      const temp = dot(a, b.values);
      if (shape(temp).length === 1) {
        const out22 = new Series(temp);
        out22.name = isSeries(a) ? a.name : out22.name;
        out22.index = b.columns.slice();
        return out22;
      } else {
        const out22 = new DataFrame(temp);
        out22.columns = b.columns.slice();
        return out22;
      }
    }
    if (isSeries(a)) {
      return dot(a.values, b);
    }
    if (isSeries(b)) {
      return dot(a, b.values);
    }
    assert(isArray(a) && isArray(b), "The `dot` function only works on arrays, Series, and DataFrames!");
    const aShape = shape(a);
    const bShape = shape(b);
    assert(aShape.length <= 2 && bShape.length <= 2, "I'm not smart enough to know how to get the dot-product of arrays that have more than 2 dimensions. Sorry for the inconvenience! Please only pass 1- or 2-dimensional arrays into the `dot` function!");
    assert(aShape[aShape.length - 1] === bShape[0], `There's a dimension misalignment in the two arrays you passed into the \`dot\` function. (${aShape[aShape.length - 1]} !== ${bShape[0]})`);
    if (aShape.length === 1 && bShape.length === 1) {
      return sum(scale(a, b));
    } else if (aShape.length === 1 && bShape.length === 2) {
      return transpose(b).map((col) => dot(a, col));
    } else if (aShape.length === 2 && bShape.length === 1) {
      return a.map((row) => dot(row, b));
    } else if (aShape.length === 2 && bShape.length === 2) {
      const bTranspose = transpose(b);
      const out22 = [];
      for (let i = 0; i < a.length; i++) {
        const row = [];
        for (let j = 0; j < bTranspose.length; j++) {
          row.push(dot(a[i], bTranspose[j]));
        }
        out22.push(row);
      }
      return out22;
    }
  }
  function dropMissing(x) {
    if (isDataFrame(x) || isSeries(x)) {
      return x.dropMissing(...Object.values(arguments).slice(1));
    }
    assert(isArray(x), "The `dropMissing` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    x.forEach((v) => {
      try {
        return out22.push(dropMissing(v));
      } catch (e) {
        if (!isUndefined(v)) {
          out22.push(v);
        }
      }
    });
    return out22;
  }
  function dropMissingPairwise(a, b) {
    if (isDataFrame(a) || isSeries(a)) {
      return dropMissingPairwise(a.values, b);
    }
    if (isDataFrame(b) || isSeries(b)) {
      return dropMissingPairwise(a, b.values);
    }
    assert(isArray(a) && isArray(b), "The `dropMissingPairwise` function only works on arrays, Series, and DataFrames!");
    assert(isEqual(shape(a), shape(b)), "The two arrays, Series, and/or DataFrames passed into the `dropMissingPairwise` function must have the same shape!");
    const aOut = [];
    const bOut = [];
    for (let i = 0; i < a.length; i++) {
      try {
        const [aChildren, bChildren] = dropMissingPairwise(a[i], b[i]);
        aOut.push(aChildren);
        bOut.push(bChildren);
      } catch (e) {
        if (!isUndefined(a[i]) && !isUndefined(b[i])) {
          aOut.push(a[i]);
          bOut.push(b[i]);
        }
      }
    }
    return [aOut, bOut];
  }
  function dropNaNPairwise(a, b) {
    if (isDataFrame(a) || isSeries(a)) {
      return dropNaNPairwise(a.values, b);
    }
    if (isDataFrame(b) || isSeries(b)) {
      return dropNaNPairwise(a, b.values);
    }
    assert(isArray(a) && isArray(b), "The `dropNaNPairwise` only works on arrays, Series, and DataFrames!");
    assert(isEqual(shape(a), shape(b)), "The two arrays, Series, and/or DataFrames passed into the `dropNaNPairwise` must have the same shape!");
    const aOut = [];
    const bOut = [];
    for (let i = 0; i < a.length; i++) {
      try {
        const [aChildren, bChildren] = dropNaNPairwise(a[i], b[i]);
        aOut.push(aChildren);
        bOut.push(bChildren);
      } catch (e) {
        if (isNumber(a[i]) && isNumber(b[i])) {
          aOut.push(a[i]);
          bOut.push(b[i]);
        }
      }
    }
    return [aOut, bOut];
  }
  function dropUndefined(x) {
    return dropMissing(x);
  }
  function every(x, fn) {
    if (isDataFrame(x) || isSeries(x)) {
      return every(x.values, fn);
    }
    assert(isArray(x), "The first argument passed into the `every` function must be an array, Series, or DataFrame!");
    assert(isFunction(fn), "The second argument passed into the `every` function must be a function!");
    for (const v of x) {
      if (isArray(v)) {
        if (!every(v, fn)) {
          return false;
        }
      } else {
        if (!fn(v)) {
          return false;
        }
      }
    }
    return true;
  }
  function exp(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        if (x === 0n) {
          return 1n;
        } else {
          x = Number(x);
        }
      }
      return Math.exp(x);
    } catch (e) {
      return NaN;
    }
  }
  var vexp = vectorize(exp);
  function factorial(n) {
    try {
      if (typeof n === "bigint") {
        return BigInt(factorial(vint(n)));
      }
      if (n !== vint(n))
        return NaN;
      if (n <= 1)
        return 1;
      return n * factorial(n - 1);
    } catch (e) {
      return NaN;
    }
  }
  var vfactorial = vectorize(factorial);
  function find(x, fn) {
    if (isDataFrame(x)) {
      return find(x.values, fn);
    }
    if (isSeries(x)) {
      return find(x.values, fn);
    }
    assert(isObject(x) || isArray(x), "You must pass (1) an object, array, Series, or DataFrame and (2) a function or value into the `find` function!");
    if (!isFunction(fn)) {
      const value = fn;
      fn = (v) => v === value;
    }
    function helper52(x2, fn2, checked) {
      checked = checked || [];
      if (checked.indexOf(x2) > -1) {
        return null;
      }
      if (isObject(x2)) {
        checked.push(x2);
        const keys = Object.keys(x2).concat(Object.getOwnPropertySymbols(x2));
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = x2[key];
          if (fn2(value)) {
            return value;
          }
          const result = helper52(value, fn2, checked);
          if (result) {
            return result;
          }
        }
      } else if (isArray(x2)) {
        checked.push(x2);
        for (let i = 0; i < x2.length; i++) {
          const value = x2[i];
          if (fn2(value)) {
            return value;
          }
          const result = helper52(value, fn2, checked);
          if (result) {
            return result;
          }
        }
      } else {
        if (fn2(x2)) {
          return x2;
        }
      }
      return null;
    }
    function safeFn(v) {
      try {
        return fn(v);
      } catch (e) {
        return false;
      }
    }
    return helper52(x, safeFn);
  }
  function findAll(x, fn) {
    if (isDataFrame(x)) {
      return findAll(x.values, fn);
    }
    if (isSeries(x)) {
      return findAll(x.values, fn);
    }
    assert(isObject(x) || isArray(x), "You must pass (1) an object, array, Series, or DataFrame and (2) a function or value into the `findAll` function!");
    if (!isFunction(fn)) {
      const value = fn;
      fn = (v) => v === value;
    }
    function helper52(x2, fn2, checked) {
      checked = checked || [];
      if (checked.indexOf(x2) > -1) {
        return null;
      }
      if (isObject(x2)) {
        checked.push(x2);
        const keys = Object.keys(x2).concat(Object.getOwnPropertySymbols(x2));
        const out22 = [];
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = x2[key];
          let alreadyStoredThisValue = false;
          if (fn2(value)) {
            out22.push(value);
            alreadyStoredThisValue = true;
          }
          const results2 = helper52(value, fn2, checked);
          if (results2 && results2.length > 0) {
            results2.slice(alreadyStoredThisValue ? 1 : 0).forEach((r) => out22.push(r));
          }
        }
        return out22;
      } else if (isArray(x2)) {
        checked.push(x2);
        const out22 = [];
        for (let i = 0; i < x2.length; i++) {
          const value = x2[i];
          let alreadyStoredThisValue = false;
          if (fn2(value)) {
            out22.push(value);
            alreadyStoredThisValue = true;
          }
          const results2 = helper52(value, fn2, checked);
          if (results2 && results2.length > 0) {
            results2.slice(alreadyStoredThisValue ? 1 : 0).forEach((r) => out22.push(r));
          }
        }
        return out22;
      } else {
        if (fn2(x2)) {
          return [x2];
        }
      }
      return null;
    }
    function safeFn(v) {
      try {
        return fn(v);
      } catch (e) {
        return false;
      }
    }
    const results = helper52(x, safeFn);
    if (results && results.length > 0) {
      return results;
    } else {
      return null;
    }
  }
  function float(x) {
    try {
      if (x === "Infinity") {
        return Infinity;
      }
      if (x === "-Infinity") {
        return -Infinity;
      }
      const out22 = JSON.parse(x);
      if (isNumber(out22))
        return out22;
      return NaN;
    } catch (e) {
      return NaN;
    }
  }
  var vfloat = vectorize(float);
  function floor(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        return x;
      }
      return Math.floor(x);
    } catch (e) {
      return NaN;
    }
  }
  var vfloor = vectorize(floor);
  function zeros(shape22) {
    if (isNumber(shape22))
      shape22 = [shape22];
    const out22 = [];
    const n = product(shape22);
    for (let i = 0; i < n; i++)
      out22.push(0);
    return reshape(out22, shape22);
  }
  function identity(size) {
    if (typeof size === "bigint") {
      size = vint(size);
    }
    assert(!isUndefined(size), "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    assert(isNumber(size), "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    assert(vint(size) === size, "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    assert(size > 0, "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    const out22 = zeros([size, size]);
    for (let i = 0; i < size; i++)
      out22[i][i] = 1;
    return out22;
  }
  var booleanValues = ["true", "false", "yes", "no"];
  var nullValues = ["null", "none", "nan", "na", "n/a", "", "undefined"];
  function checkIfInteger(results) {
    if (results.type === "number") {
      if (typeof results.value !== "undefined") {
        results.isInteger = vint(results.value) === results.value;
      } else {
        results.isInteger = every(results.values, (v) => isNumber(v) ? vint(v) === v : true);
      }
    }
    return results;
  }
  function inferType(arr) {
    if (isDataFrame(arr)) {
      const out22 = arr.copy();
      const results = inferType(arr.values);
      out22.values = results.values;
      return checkIfInteger({ type: results.type, values: out22 });
    }
    if (isSeries(arr)) {
      const out22 = arr.copy();
      const results = inferType(arr.values);
      out22.values = results.values;
      return checkIfInteger({ type: results.type, values: out22 });
    }
    if (!isArray(arr)) {
      const out22 = inferType([arr]);
      out22.value = out22.values[0];
      delete out22.values;
      return checkIfInteger(out22);
    }
    assert(isArray(arr), "The `inferType` function only works on arrays, Series, and DataFrames!");
    const types = flatten(arr).map((v) => {
      if (v === void 0)
        return "null";
      try {
        if (typeof v === "object") {
          const temp = new Date(v.getTime());
          if (isDate(temp)) {
            return "date";
          }
        }
      } catch (e) {
      }
      if (!isString(v)) {
        if (typeof v === "bigint") {
          v = v.toString() + "n";
        } else {
          v = JSON.stringify(v);
        }
      }
      const vLower = v.toLowerCase();
      const vLowerTrimmed = vLower.trim();
      if (nullValues.indexOf(vLowerTrimmed) > -1) {
        return "null";
      }
      if (booleanValues.indexOf(vLowerTrimmed) > -1) {
        return "boolean";
      }
      try {
        if (v.match(/^-?\d+n$/g)) {
          return "bigint";
        }
        const vParsed = JSON.parse(v);
        if (isNumber(vParsed)) {
          return "number";
        }
        if (typeof vParsed === "object") {
          if (isArray(vParsed))
            return "string";
          return "object";
        }
        return "string";
      } catch (e) {
        const vDate = new Date(v);
        if (isDate(vDate)) {
          return "date";
        }
        return "string";
      }
    });
    const counts = count(types);
    const sortedValues = counts.values.toSorted((a, b) => counts.get(b) - counts.get(a));
    const primaryType = sortedValues[0];
    return checkIfInteger({
      type: primaryType,
      values: vapply(arr, (v) => cast(v, primaryType))
    });
  }
  function inverse(x) {
    if (isDataFrame(x)) {
      const out22 = x.copy();
      out22.values = inverse(out22.values);
      return out22;
    }
    assert(isArray(x), "The `inverse` function only works on square 2-dimensional arrays or DataFrames!");
    const xShape = shape(x);
    assert(xShape.length === 2, "The array passed into the `inverse` function must be exactly two-dimensional and square!");
    assert(xShape[0] === xShape[1], "The array passed into the `inverse` function must be exactly two-dimensional and square!");
    assert(xShape[0] >= 0, "The array passed into the `inverse` function must be exactly two-dimensional and square!");
    if (xShape[0] === 0) {
      return x;
    } else if (xShape[0] === 1) {
      assert(x[0][0] !== 0, "This matrix cannot be inverted!");
      let v = x[0][0];
      if (typeof v === "bigint")
        v = Number(v);
      return 1 / v;
    } else if (xShape[0] === 2) {
      let a = x[0][0];
      let b = x[0][1];
      let c = x[1][0];
      let d = x[1][1];
      if (typeof a === "bigint")
        a = Number(a);
      if (typeof b === "bigint")
        b = Number(b);
      if (typeof c === "bigint")
        c = Number(c);
      if (typeof d === "bigint")
        d = Number(d);
      const det = a * d - b * c;
      assert(det !== 0, "This matrix cannot be inverted!");
      const out22 = [
        [d, -b],
        [-c, a]
      ];
      return scale(out22, 1 / det);
    } else if (xShape[0] > 1) {
      const times = (a, b) => isNumber(a) || isNumber(b) ? scale(a, b) : dot(a, b);
      for (let divider = 1; divider < xShape[0] - 1; divider++) {
        try {
          const A = x.slice(0, divider).map((row) => row.slice(0, divider));
          const B = x.slice(0, divider).map((row) => row.slice(divider, xShape[0]));
          const C = x.slice(divider, xShape[0]).map((row) => row.slice(0, divider));
          const D = x.slice(divider, xShape[0]).map((row) => row.slice(divider, xShape[0]));
          const AInv = inverse(A);
          const CompInv = inverse(vadd(D, times(-1, times(times(C, AInv), B))));
          const topLeft = vadd(AInv, times(times(times(times(AInv, B), CompInv), C), AInv));
          const topRight = times(-1, times(times(AInv, B), CompInv));
          const bottomLeft = times(-1, times(times(CompInv, C), AInv));
          const bottomRight = CompInv;
          const out22 = topLeft.map((row, i) => row.concat(topRight[i])).concat(bottomLeft.map((row, i) => row.concat(bottomRight[i])));
          return out22;
        } catch (e) {
        }
      }
      assert(false, "This matrix cannot be inverted!");
    }
  }
  var isBrowser2 = new Function(`
    try {
      return this === window
    } catch(e) {}

    try {
      return !!importScripts
    } catch(e){}

    return false
  `);
  function lerp(a, b, f) {
    try {
      if (!isNumber(a))
        return NaN;
      if (!isNumber(b))
        return NaN;
      if (!isNumber(f))
        return NaN;
      if (typeof a === "bigint" || typeof b === "bigint") {
        const out22 = lerp(Number(a), Number(b), f);
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return f * (b - a) + a;
    } catch (e) {
      return NaN;
    }
  }
  var vlerp = vectorize(lerp);
  function log(x, base) {
    try {
      base = isUndefined(base) ? Math.E : base;
      if (!isNumber(x))
        return NaN;
      if (!isNumber(base))
        return NaN;
      if (typeof x === "bigint" || typeof base === "bigint") {
        const out22 = log(Number(x), Number(base));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return Math.log(x) / Math.log(base);
    } catch (e) {
      return NaN;
    }
  }
  var vlog = vectorize(log);
  function mean(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs }).mean;
  }
  function median(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs, median: true }).median;
  }
  function mod(a, b) {
    try {
      if (!isNumber(a))
        return NaN;
      if (!isNumber(b))
        return NaN;
      if (typeof a === "bigint" || typeof b === "bigint") {
        const out22 = mod(Number(a), Number(b));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return a % b;
    } catch (e) {
      return NaN;
    }
  }
  var vmod = vectorize(mod);
  function mode(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs, mode: true }).mode;
  }
  function helper3() {
    const u1 = random();
    const u2 = random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
  function normal(shape22) {
    if (isUndefined(shape22))
      return helper3();
    return vapply(ndarray(shape22), helper3);
  }
  function ones(shape22) {
    return vapply(ndarray(shape22), () => 1);
  }
  function permutationsIterator(x, r) {
    function* helper52(x2, r2) {
      r2 = r2 || x2.length;
      if (x2.length === 1) {
        yield [x2];
        return;
      }
      for (const c of combinations(x2, r2)) {
        if (!c.slice)
          continue;
        const state = zeros(c.length);
        yield c;
        let i = 1;
        while (i < c.length) {
          if (state[i] < i) {
            if (i % 2 === 0) {
              const buf = c[0];
              c[0] = c[i];
              c[i] = buf;
            } else {
              const buf = c[state[i]];
              c[state[i]] = c[i];
              c[i] = buf;
            }
            yield c;
            state[i] += 1;
            i = 1;
          } else {
            state[i] = 0;
            i += 1;
          }
        }
      }
    }
    if (isDataFrame(x) || isSeries(x)) {
      return permutationsIterator(x.values, r);
    }
    assert(isArray(x), "The `permutations` function only works on arrays, Series, and DataFrames!");
    if (isUndefined(r)) {
      r = x.length;
    }
    assert(isNumber(r) && vint(r) === r && r >= 0, "`r` must be a non-negative integer!");
    return helper52(flatten(x), r);
  }
  function permutations(x, r) {
    const out22 = [];
    for (const perm of permutationsIterator(x, r)) {
      out22.push(perm.slice());
    }
    return out22;
  }
  function print() {
    Object.keys(arguments).forEach((key) => {
      const x = arguments[key];
      if (isArray(x)) {
        if (!isJagged(x)) {
          const xShape = shape(x);
          if (xShape.length === 1) {
            new Series(x).print();
          } else if (xShape.length == 2) {
            new DataFrame(x).print();
          } else {
            console.log(x);
          }
        } else {
          console.log(x);
        }
      } else if (isDataFrame(x) || isSeries(x)) {
        x.print();
      } else {
        console.log(x);
      }
    });
  }
  var helper4 = vectorize((x, a, b, c, d) => {
    try {
      let resultShouldBeABigInt = false;
      for (const v of [x, a, b, c, d]) {
        if (!isNumber(v)) {
          return NaN;
        }
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
        }
      }
      if (resultShouldBeABigInt) {
        x = Number(x);
        a = Number(a);
        b = Number(b);
        c = Number(c);
        d = Number(d);
      }
      const num = (d - c) * (x - a);
      const den = b - a;
      if (den === 0)
        return NaN;
      const out22 = num / den + c;
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  });
  function remap(x, a, b, c, d) {
    if (isArray(x) && isUndefined(c) && isUndefined(d)) {
      c = a;
      d = b;
      const results = stats(x);
      a = results.min;
      b = results.max;
    }
    return helper4(x, a, b, c, d);
  }
  function round(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint")
        return x;
      return Math.round(x);
    } catch (e) {
      return NaN;
    }
  }
  var vround = vectorize(round);
  function sign(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint")
        return BigInt(sign(Number(x)));
      if (x < 0)
        return -1;
      if (x > 0)
        return 1;
      return 0;
    } catch (e) {
      return NaN;
    }
  }
  var vsign = vectorize(sign);
  function sin(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.sin(x);
    } catch (e) {
      return NaN;
    }
  }
  var vsin = vectorize(sin);
  function some(x, fn) {
    if (isDataFrame(x) || isSeries(x)) {
      return some(x.values, fn);
    }
    assert(isArray(x), "The first argument passed into the `some` function must be an array, Series, or DataFrame!");
    assert(isFunction(fn), "The second argument passed into the `some` function must be a function!");
    for (const v of x) {
      if (isArray(v)) {
        if (some(v, fn)) {
          return true;
        }
      } else {
        if (fn(v)) {
          return true;
        }
      }
    }
    return false;
  }
  function std(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs, stdev: true }).stdev;
  }
  function stdev(x) {
    return std(x);
  }
  function tan(x) {
    try {
      if (!isNumber(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.tan(x);
    } catch (e) {
      return NaN;
    }
  }
  var vtan = vectorize(tan);
  function timeSync(fn, args) {
    assert(isFunction(fn), "`fn` must be a function!");
    const start = /* @__PURE__ */ new Date();
    if (args) {
      fn(...args);
    } else {
      fn();
    }
    return /* @__PURE__ */ new Date() - start;
  }
  async function timeAsync(fn, args) {
    assert(isFunction(fn), "`fn` must be a function!");
    const start = /* @__PURE__ */ new Date();
    if (args) {
      await fn(...args);
    } else {
      await fn();
    }
    return /* @__PURE__ */ new Date() - start;
  }
  function union() {
    return set([...arguments].map((v) => {
      if (isArray(v))
        return v;
      if (isDataFrame(v))
        return v.values;
      if (isSeries(v))
        return v.values;
      return [v];
    }));
  }
  function variance(arr, shouldDropNaNs) {
    return stats(arr, { shouldDropNaNs, variance: true }).variance;
  }
  function zip() {
    const out22 = [];
    const arrays = Object.values(arguments).map((arr) => {
      if (isDataFrame(arr) || isSeries(arr)) {
        arr = arr.values;
      }
      assert(isArray(arr), "The `zip` function only works on arrays, Series, and DataFrames!");
      return arr;
    });
    range(0, max(arrays.map((arr) => arr.length))).forEach((i) => {
      const row = [];
      arrays.forEach((arr) => {
        const value = arr[i];
        row.push(isUndefined(value) ? void 0 : value);
      });
      out22.push(row);
    });
    return out22;
  }
  var out = {
    abs: vabs,
    add: vadd,
    apply: vapply,
    arccos: varccos,
    arcsin: varcsin,
    arctan: varctan,
    argmax,
    argmin,
    assert,
    cast,
    ceil: vceil,
    chop: vchop,
    clamp: vclamp,
    combinations,
    combinationsIterator,
    copy,
    correl,
    cos: vcos,
    count,
    covariance,
    DataFrame,
    dataTypes,
    decycle,
    diff,
    distance,
    divide,
    dot,
    dropMissing,
    dropMissingPairwise,
    dropNaN,
    dropNaNPairwise,
    dropUndefined,
    every,
    exp: vexp,
    factorial: vfactorial,
    find,
    findAll,
    flatten,
    float: vfloat,
    floor: vfloor,
    identity,
    IndexMatcher,
    indexOf,
    inferType,
    int: vint,
    intersect,
    inverse,
    isArray,
    isBoolean,
    isBrowser: isBrowser2,
    isDataFrame,
    isDate,
    isEqual,
    isFunction,
    isJagged,
    isNested,
    isNumber,
    isObject,
    isSeries,
    isString,
    isUndefined,
    lerp: vlerp,
    log: vlog,
    MathError,
    max,
    mean,
    median,
    min,
    mod: vmod,
    mode,
    multiply: vmultiply,
    ndarray,
    normal,
    ones,
    permutations,
    permutationsIterator,
    pow: vpow,
    print,
    product,
    random,
    range,
    remap,
    reshape,
    reverse,
    round: vround,
    scale,
    seed,
    Series,
    set,
    shape,
    shuffle,
    sign: vsign,
    sin: vsin,
    some,
    sort,
    sqrt: vsqrt,
    stats,
    std,
    stdev,
    subtract,
    sum,
    tan: vtan,
    timeAsync,
    timeSync,
    time: timeSync,
    transpose,
    union,
    variance,
    vectorize,
    zeros,
    zip,
    dump() {
      const context2 = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : void 0;
      if (!context2) {
        throw new out.MathError("Cannot dump functions into global scope because none of `globalThis`, `global`, `window`, or `self` exist in the current context!");
      }
      Object.keys(out).forEach((key) => {
        try {
          Object.defineProperty(context2, key, {
            configurable: false,
            enumerable: true,
            writable: false,
            value: out[key]
          });
        } catch (e) {
          context2[key] = out[key];
        }
      });
    }
  };
  if (typeof window !== "undefined") {
    window.JSMathTools = out;
  }
  function makeKey4(keyLength, keySeed, charset) {
    if (arguments.length === 2) {
      if (isNumber(arguments[1])) {
        charset = null;
      } else {
        charset = keySeed;
        keySeed = null;
      }
    }
    assert(
      isNumber(keyLength) && vint(keyLength) === keyLength,
      "`keyLength` must be an integer!"
    );
    if (keySeed) {
      assert(
        isNumber(keySeed) && vint(keySeed) === keySeed,
        "`keySeed` must be an integer!"
      );
      seed(keySeed);
    }
    if (charset) {
      assert(isString(charset), "`charset` must be a string!");
    }
    let out22 = "";
    charset = charset || "abcdefg1234567890";
    for (let i = 0; i < keyLength; i++) {
      out22 += charset[vint(random() * charset.length)];
    }
    return out22;
  }
  if (typeof window !== "undefined") {
    window.makeKey = makeKey4;
  }
  function camelify2(text) {
    if (typeof text !== "string") {
      throw new Error("`text` must be a string!");
    }
    text = text.trim();
    let out22 = "";
    let shouldCapitalizeNextCharacter = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[A-Za-z0-9]/g)) {
        if (out22.length === 0) {
          out22 += char.toLowerCase();
        } else if (shouldCapitalizeNextCharacter) {
          out22 += char.toUpperCase();
        } else {
          out22 += char;
        }
        shouldCapitalizeNextCharacter = false;
      } else if (!char.includes("'") && !char.includes("\u2019") && !char.includes("\u275C")) {
        shouldCapitalizeNextCharacter = true;
      }
    }
    return out22;
  }
  var __defProp22 = Object.defineProperty;
  var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp22(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField2 = (obj, key, value) => {
    __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  function isNumber2(x) {
    return typeof x === "number" && !isNaN(x) || typeof x === "bigint";
  }
  var isBrowser3 = new Function(`
  try {
    return this === window
  } catch(e) {}

  try {
    return typeof importScripts !== "undefined"
  } catch(e) {}

  return false
`);
  var MathError2 = class extends Error {
    constructor(message) {
      if (isBrowser3()) {
        super(message);
      } else {
        super("\n\n\x1B[31m" + message + "\n\x1B[0m");
      }
    }
  };
  function assert2(isTrue, message) {
    if (!isTrue)
      throw new MathError2(message);
  }
  var arrayTypes2 = [
    Array,
    ArrayBuffer,
    BigInt64Array,
    BigUint64Array,
    Float32Array,
    Float64Array,
    Int16Array,
    Int32Array,
    Int8Array,
    Uint16Array,
    Uint32Array,
    Uint8Array,
    Uint8ClampedArray
  ];
  function isUndefined2(x) {
    return x === null || typeof x === "undefined";
  }
  var typeStrings2 = arrayTypes2.map((s22) => s22.name);
  function isArray2(obj) {
    try {
      if (obj instanceof Array) {
        return true;
      }
      if (!isUndefined2(obj.constructor)) {
        return arrayTypes2.indexOf(obj.constructor) > -1 || typeStrings2.indexOf(obj.constructor.name) > -1;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  function isDataFrame2(x) {
    try {
      return !!x._symbol && x._symbol === Symbol.for("@jrc03c/js-math-tools/dataframe");
    } catch (e) {
      return false;
    }
  }
  function isFunction2(fn) {
    return typeof fn === "function";
  }
  function isObject2(x) {
    return typeof x === "object" && !isUndefined2(x) && !isArray2(x);
  }
  function isSeries2(x) {
    try {
      return !!x._symbol && x._symbol === Symbol.for("@jrc03c/js-math-tools/series");
    } catch (e) {
      return false;
    }
  }
  function indexOf2(x, fn) {
    if (isDataFrame2(x)) {
      const index = indexOf2(x.values, fn);
      if (index.length > 0 && isNumber2(index[0]) && index[0] >= 0 && index[0] < x.index.length) {
        index[0] = x.index[index[0]];
      }
      if (index.length > 1 && isNumber2(index[1]) && index[1] >= 0 && index[1] < x.columns.length) {
        index[1] = x.columns[index[1]];
      }
      return index;
    }
    if (isSeries2(x)) {
      const index = indexOf2(x.values, fn);
      if (index.length > 0 && isNumber2(index[0]) && index[0] >= 0 && index[0] < x.index.length) {
        index[0] = x.index[index[0]];
      }
      return index;
    }
    assert2(isObject2(x) || isArray2(x), "You must pass (1) an object, array, Series, or DataFrame and (2) a function or value into the `indexOf` function!");
    if (!isFunction2(fn)) {
      const value = fn;
      fn = (v) => v === value;
    }
    function helper52(x2, fn2, checked) {
      checked = checked || [];
      if (checked.indexOf(x2) > -1) {
        return null;
      }
      if (isObject2(x2)) {
        checked.push(x2);
        const keys = Object.keys(x2).concat(Object.getOwnPropertySymbols(x2));
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = x2[key];
          if (fn2(value)) {
            return [key];
          }
          const results = helper52(value, fn2, checked);
          if (results && results.length > 0) {
            return [key].concat(results);
          }
        }
      } else if (isArray2(x2)) {
        checked.push(x2);
        for (let i = 0; i < x2.length; i++) {
          const value = x2[i];
          if (fn2(value)) {
            return [i];
          }
          const results = helper52(value, fn2, checked);
          if (results && results.length > 0) {
            return [i].concat(results);
          }
        }
      } else {
        if (fn2(x2)) {
          return [];
        }
      }
      return null;
    }
    function safeFn(v) {
      try {
        return fn(v);
      } catch (e) {
        return false;
      }
    }
    const paths = helper52(x, safeFn);
    if (paths && paths.length > 0) {
      return paths;
    } else {
      return null;
    }
  }
  function copy2(x) {
    function helper52(x2) {
      if (typeof x2 === "object") {
        if (x2 === null) {
          return null;
        }
        if (isArray2(x2)) {
          if (!(x2 instanceof Array)) {
            return x2.slice();
          }
          return x2.map((v) => copy2(v));
        }
        if (isSeries2(x2)) {
          const out3 = x2.copy();
          out3.values = copy2(out3.values);
          return out3;
        }
        if (isDataFrame2(x2)) {
          const out3 = x2.copy();
          out3.values = copy2(x2.values);
          return out3;
        }
        if (x2 instanceof Date) {
          return new Date(x2.getTime());
        }
        x2 = decycle2(x2);
        const out22 = {};
        Object.keys(x2).concat(Object.getOwnPropertySymbols(x2)).forEach((key) => {
          out22[key] = copy2(x2[key]);
        });
        return out22;
      } else {
        return x2;
      }
    }
    return helper52(decycle2(x));
  }
  function decycle2(x) {
    function helper52(x2, checked, currentPath) {
      checked = checked || [];
      currentPath = currentPath || "";
      if (checked.indexOf(x2) > -1) {
        const parts = currentPath.split("/").slice(currentPath.startsWith("/") ? 1 : 0);
        const isANestedCopy = parts.some((v, i) => {
          const subParts = parts.slice(0, parts.length - i - 1);
          let temp = orig;
          subParts.forEach((part) => {
            temp = temp[part];
          });
          return temp === x2;
        });
        if (isANestedCopy) {
          const pathToCopy = orig === x2 ? "/" : "/" + indexOf2(orig, x2).join("/");
          return `<reference to "${pathToCopy}">`;
        }
      }
      if (typeof x2 === "object") {
        if (x2 === null)
          return null;
        checked.push(x2);
        if (isArray2(x2)) {
          if (typeof x2.constructor !== "undefined" && x2.constructor.name !== "Array") {
            return x2.slice();
          }
          return x2.map((v, i) => helper52(v, checked, currentPath + "/" + i));
        } else {
          Object.keys(x2).concat(Object.getOwnPropertySymbols(x2)).forEach((key) => {
            x2[key] = helper52(x2[key], checked, currentPath + "/" + key.toString());
          });
          return x2;
        }
      } else {
        return x2;
      }
    }
    const orig = x;
    let out22 = helper52(orig);
    if (isDataFrame2(x)) {
      const temp = x.copy();
      temp._values = out22.values;
      temp._columns = out22.columns;
      temp._index = out22.index;
      out22 = temp;
    }
    if (isSeries2(x)) {
      const temp = x.copy();
      temp.name = out22.name;
      temp._values = out22.values;
      temp._index = out22.index;
      out22 = temp;
    }
    return out22;
  }
  function isDate2(x) {
    return x instanceof Date && x.toString() !== "Invalid Date";
  }
  var numberTypes2 = ["number", "int", "float", "bigint"];
  function isEqual2(a, b) {
    function helper52(a2, b2) {
      const aType = typeof a2;
      const bType = typeof b2;
      if (aType !== bType && !numberTypes2.includes(aType) && !numberTypes2.includes(bType))
        return false;
      if (aType === "undefined" && bType === "undefined")
        return true;
      if (aType === "boolean")
        return a2 === b2;
      if (aType === "symbol")
        return a2 === b2;
      if (aType === "number" || aType === "bigint") {
        try {
          const aString = a2.toString();
          const bString = b2.toString();
          return aString === bString;
        } catch (e) {
          return false;
        }
      }
      if (aType === "string")
        return a2 === b2;
      if (aType === "function")
        return a2 === b2;
      if (aType === "object") {
        if (a2 === null || b2 === null) {
          return a2 === null && b2 === null;
        } else {
          if (isDate2(a2)) {
            if (isDate2(b2)) {
              return a2.getTime() === b2.getTime();
            } else {
              return false;
            }
          } else if (isDate2(b2)) {
            return false;
          }
          if (a2 instanceof RegExp && b2 instanceof RegExp) {
            return a2.toString() === b2.toString();
          }
          if (isArray2(a2) !== isArray2(b2)) {
            return false;
          }
          const aKeys = Object.keys(a2).concat(Object.getOwnPropertySymbols(a2));
          const bKeys = Object.keys(b2).concat(Object.getOwnPropertySymbols(b2));
          if (aKeys.length !== bKeys.length)
            return false;
          for (let i = 0; i < aKeys.length; i++) {
            const key = aKeys[i];
            if (!helper52(a2[key], b2[key]))
              return false;
          }
          return true;
        }
      }
    }
    try {
      return helper52(a, b);
    } catch (e) {
      return helper52(decycle2(a), decycle2(b));
    }
  }
  function makeKey5(n) {
    const alpha = "abcdefg1234567890";
    let out22 = "";
    while (out22.length < n)
      out22 += alpha[Math.floor(Math.random() * alpha.length)];
    return out22;
  }
  var NULL_KEY3 = makeKey5(16);
  var UNDEFINED_KEY3 = makeKey5(16);
  var INFINITY_KEY3 = makeKey5(16);
  var MINUS_INFINITY_KEY3 = makeKey5(16);
  var SYMBOL_KEY3 = makeKey5(16);
  var Counter2 = class {
    constructor() {
      this.clear();
    }
    get counts() {
      return this.values.map((v) => this.get(v));
    }
    get values() {
      return Object.values(this.valuesDict);
    }
    clear() {
      this.countsDict = {};
      this.valuesDict = {};
      return this;
    }
    count(x) {
      for (const v of x) {
        if (isArray2(v)) {
          this.count(v);
        } else {
          this.increment(v);
        }
      }
      return this;
    }
    delete(value) {
      const key = this.getStandardizedKey(value);
      delete this.countsDict[key];
      delete this.valuesDict[key];
      return this;
    }
    get(value) {
      return this.countsDict[this.getStandardizedKey(value)] || 0;
    }
    getStandardizedKey(value) {
      return typeof value === "object" && value === null ? NULL_KEY3 : isUndefined2(value) ? UNDEFINED_KEY3 : isFunction2(value) ? value.toString() : typeof value === "symbol" ? value.toString() + " - " + SYMBOL_KEY3 : value === Infinity ? INFINITY_KEY3 : value === -Infinity ? MINUS_INFINITY_KEY3 : typeof value === "bigint" ? value.toString() : isDataFrame2(value) ? value.toJSONString() : isSeries2(value) ? JSON.stringify(value.toObject()) : JSON.stringify(value);
    }
    has(value) {
      return !isUndefined2(this.countsDict[this.getStandardizedKey(value)]);
    }
    increment(value) {
      return this.set(value, this.get(value) + 1);
    }
    set(value, count22) {
      const key = this.getStandardizedKey(value);
      this.countsDict[key] = count22;
      this.valuesDict[key] = value;
      return this;
    }
    toArray() {
      return this.values.map((v) => ({ value: v, count: this.get(v) }));
    }
    toObject() {
      const out22 = {};
      this.values.forEach((value) => {
        out22[value] = this.get(value);
      });
      return out22;
    }
  };
  function flatten2(arr) {
    if (isDataFrame2(arr) || isSeries2(arr)) {
      return flatten2(arr.values);
    }
    assert2(isArray2(arr), "The `flatten` function only works on arrays, Series, and DataFrames!");
    function helper52(arr2) {
      let out22 = [];
      arr2.forEach((child) => {
        if (isArray2(child)) {
          out22 = out22.concat(helper52(child));
        } else {
          out22.push(child);
        }
      });
      return out22;
    }
    return helper52(arr);
  }
  function stats2(x, options) {
    options = options || {};
    const counts = new Counter2();
    const out22 = {};
    const xflat = flatten2(x);
    const xnums = [];
    let max22 = -Infinity;
    let min22 = Infinity;
    let resultsShouldIncludeBigInts = false;
    let sum22 = 0;
    for (const v of xflat) {
      if (typeof v === "bigint") {
        resultsShouldIncludeBigInts = true;
      }
      if (!options.shouldDropNaNs || isNumber2(v)) {
        try {
          if (v > max22) {
            max22 = v;
          }
          if (v < min22) {
            min22 = v;
          }
          sum22 += Number(v);
          xnums.push(v);
        } catch (e) {
          max22 = NaN;
          min22 = NaN;
          sum22 = NaN;
        }
      }
      counts.increment(v);
    }
    const mean22 = sum22 / xnums.length;
    out22.counts = counts;
    out22.max = max22;
    out22.mean = mean22;
    out22.min = min22;
    out22.n = xflat.length;
    out22.sum = sum22;
    if (isNaN(out22.mean)) {
      out22.max = NaN;
      out22.min = NaN;
    }
    if (options.shouldDropNaNs) {
      out22.nWithoutNaNs = xnums.length;
    }
    if (options.mode) {
      const sortedCountPairs = Array.from(counts.values.map((v) => [v, counts.get(v)])).toSorted((a, b) => b[1] - a[1]);
      const highestCount = sortedCountPairs[0][1];
      const mode22 = [];
      for (const pair of sortedCountPairs) {
        if (pair[1] == highestCount) {
          mode22.push(pair[0]);
        } else {
          break;
        }
      }
      out22.mode = mode22.toSorted();
    }
    if (options.median) {
      if (isNaN(mean22)) {
        out22.median = NaN;
      } else {
        const xnumsSorted = xnums.toSorted((a, b) => Number(a) - Number(b));
        const middle = Math.floor(xnumsSorted.length / 2);
        if (xnumsSorted.length % 2 === 0) {
          const left = xnumsSorted[middle - 1];
          const right = xnumsSorted[middle];
          out22.median = (Number(left) + Number(right)) / 2;
          if (resultsShouldIncludeBigInts && typeof left === "bigint" && typeof right === "bigint") {
            try {
              out22.median = BigInt(out22.median);
            } catch (e) {
            }
          }
        } else {
          out22.median = xnumsSorted[middle];
        }
      }
    }
    if (options.stdev || options.variance) {
      let variance22 = 0;
      for (const v of xnums) {
        variance22 += Math.pow(Number(v) - mean22, 2);
      }
      variance22 /= xnums.length;
      const stdev22 = Math.sqrt(variance22);
      out22.stdev = stdev22;
      out22.variance = variance22;
    }
    if (resultsShouldIncludeBigInts) {
      try {
        out22.sum = BigInt(out22.sum);
      } catch (e) {
      }
      try {
        out22.mean = BigInt(out22.mean);
      } catch (e) {
      }
      if (options.mode) {
        out22.mode = out22.mode.map((v) => {
          try {
            return BigInt(v);
          } catch (e) {
            return v;
          }
        });
      }
    }
    return out22;
  }
  function count2(arr, matcher) {
    const { counts } = stats2(arr);
    if (!isUndefined2(matcher)) {
      if (isFunction2(matcher)) {
        counts.values.forEach((v) => {
          if (!matcher(v)) {
            counts.delete(v);
          }
        });
      } else {
        counts.values.forEach((v) => {
          if (!isEqual2(v, matcher)) {
            counts.delete(v);
          }
        });
      }
    }
    return counts;
  }
  function helper5(x) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return helper5(x.values);
    }
    if (isArray2(x)) {
      let hasArrayValues = false;
      let hasNonArrayValues = false;
      let arrayLength = null;
      for (const v of x) {
        if (helper5(v)) {
          return true;
        }
        if (isArray2(v)) {
          if (arrayLength === null) {
            arrayLength = v.length;
          } else if (v.length !== arrayLength) {
            return true;
          }
          hasArrayValues = true;
        } else {
          hasNonArrayValues = true;
        }
        if (hasArrayValues && hasNonArrayValues) {
          return true;
        }
      }
    }
    return false;
  }
  function isJagged2(x) {
    return helper5(decycle2(x));
  }
  function isNested2(x) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return isNested2(x.values);
    }
    assert2(isArray2(x), "The `isNested` function only works on arrays, Series, and DataFrames!");
    for (let i = 0; i < x.length; i++) {
      if (isArray2(x[i])) {
        return true;
      }
    }
    return false;
  }
  var error2 = "You must pass a natural number or a one-dimensional array of natural numbers into the `ndarray` function!";
  function ndarray2(shape22) {
    assert2(!isUndefined2(shape22), error2);
    if (!isArray2(shape22))
      shape22 = [shape22];
    assert2(!isNested2(shape22), error2);
    assert2(shape22.length > 0, error2);
    let s22 = shape22[0];
    if (typeof s22 === "bigint")
      s22 = Number(s22);
    assert2(isNumber2(s22), error2);
    assert2(s22 >= 0, error2);
    assert2(Math.floor(s22) === s22, error2);
    assert2(s22 !== Infinity, "We can't create an array containing an infinite number of values!");
    if (shape22.length === 1) {
      const out22 = [];
      for (let i = 0; i < s22; i++)
        out22.push(void 0);
      return out22;
    } else {
      const out22 = [];
      for (let i = 0; i < s22; i++) {
        out22.push(ndarray2(shape22.slice(1)));
      }
      return out22;
    }
  }
  function reverse2(arr) {
    if (isDataFrame2(arr) || isSeries2(arr)) {
      const out3 = arr.copy();
      out3.values = reverse2(out3.values);
      out3.index = reverse2(out3.index);
      return out3;
    }
    assert2(isArray2(arr), "The `reverse` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    for (let i = arr.length - 1; i >= 0; i--)
      out22.push(arr[i]);
    return out22;
  }
  function range2(a, b, step = 1) {
    assert2(!isUndefined2(a) && !isUndefined2(b) && !isUndefined2(step), "You must pass two numbers and optionally a step value to the `range` function!");
    assert2(isNumber2(a) && isNumber2(b) && isNumber2(step), "You must pass two numbers and optionally a step value to the `range` function!");
    assert2(step > 0, "The step value must be greater than 0! (NOTE: The step value is a magnitude; it does not indicate direction.)");
    let shouldReverse = false;
    const shouldIncludeBigInts = typeof a === "bigint" || typeof b === "bigint" || typeof step === "bigint";
    a = Number(a);
    b = Number(b);
    step = Number(step);
    if (a > b) {
      shouldReverse = true;
      const buffer = a;
      a = b + step;
      b = buffer + step;
    }
    let out22 = [];
    for (let i = a; i < b; i += step) {
      if (shouldIncludeBigInts) {
        try {
          out22.push(BigInt(i));
        } catch (e) {
          out22.push(i);
        }
      } else {
        out22.push(i);
      }
    }
    if (shouldReverse)
      out22 = reverse2(out22);
    return out22;
  }
  function makeKey22(n) {
    const alpha = "abcdefg1234567890";
    let out22 = "";
    while (out22.length < n)
      out22 += alpha[Math.floor(Math.random() * alpha.length)];
    return out22;
  }
  var NULL_KEY22 = makeKey22(256);
  var UNDEFINED_KEY22 = makeKey22(256);
  var INFINITY_KEY22 = makeKey22(256);
  var MINUS_INFINITY_KEY22 = makeKey22(256);
  var SYMBOL_KEY22 = makeKey22(256);
  function set2(arr) {
    if (isDataFrame2(arr) || isSeries2(arr)) {
      return set2(arr.values);
    }
    assert2(isArray2(arr), "The `set` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    const temp = {};
    flatten2(arr).forEach((item) => {
      const key = typeof item === "object" && item === null ? NULL_KEY22 : isUndefined2(item) ? UNDEFINED_KEY22 : isFunction2(item) ? item.toString() : typeof item === "symbol" ? item.toString() + " - " + SYMBOL_KEY22 : item === Infinity ? INFINITY_KEY22 : item === -Infinity ? MINUS_INFINITY_KEY22 : typeof item === "bigint" ? item.toString() : isDataFrame2(item) ? item.toJSONString() : isSeries2(item) ? JSON.stringify(item.toObject()) : JSON.stringify(item);
      if (!temp[key])
        out22.push(item);
      temp[key] = true;
    });
    return out22;
  }
  function helper22(x) {
    if (isArray2(x)) {
      const childShapes = helper22(x[0]);
      return [x.length].concat(childShapes || []);
    } else {
      return void 0;
    }
  }
  function shape2(x) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return shape2(x.values);
    }
    assert2(isArray2(x), "The `shape` function only works on arrays, Series, and DataFrames!");
    return helper22(x);
  }
  function dfAppend2(df, x, axis) {
    if (isUndefined2(axis)) {
      axis = 0;
    }
    assert2(axis === 0 || axis === 1 || axis === "vertical" || axis === "horizontal", 'The only valid axis values for use when appending data to a DataFrame are 0, 1, "vertical", and "horizontal". Note that 0 == "horizontal" and 1 == "vertical".');
    if (isArray2(x)) {
      assert2(!isJagged2(x), "The array of data you're trying to append to this DataFrame is jagged!");
      const xShape = shape2(x);
      if (xShape.length === 1) {
        if (axis === 0) {
          const out22 = df.copy();
          out22._values.push(x);
          const maxRowLength = Math.max(df.shape[1], xShape[0]);
          out22._values.forEach((row) => {
            while (row.length < maxRowLength) {
              row.push(void 0);
            }
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < maxRowLength) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        } else {
          const maxColLength = Math.max(df.shape[0], xShape[0]);
          const out22 = df.copy();
          range2(0, maxColLength).forEach((i) => {
            if (i >= out22._values.length) {
              out22._values.push(ndarray2(df.shape[1]));
            }
            out22._values[i].push(x[i]);
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < out22._values[0].length) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        }
      } else if (xShape.length === 2) {
        if (axis === 0) {
          const maxRowLength = Math.max(...x.map((row) => row.length).concat([df.shape[1]]));
          const out22 = df.copy();
          out22._values = out22._values.concat(x).map((row) => {
            while (row.length < maxRowLength) {
              row.push(void 0);
            }
            return row;
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < maxRowLength) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        } else {
          const maxRowLength = Math.max(...x.map((row) => row.length)) + df.shape[1];
          const maxColLength = Math.max(df.shape[0], xShape[0]);
          const out22 = df.copy();
          range2(0, maxColLength).forEach((i) => {
            if (i >= out22._values.length) {
              out22._values.push(ndarray2(df.shape[1]));
            }
            out22._values[i] = out22._values[i].concat(x[i]);
            while (out22._values[i].length < maxRowLength) {
              out22._values[i].push(void 0);
            }
          });
          while (out22._index.length < out22._values.length) {
            out22._index.push("row" + out22._index.length);
          }
          while (out22._columns.length < maxRowLength) {
            out22._columns.push("col" + out22._columns.length);
          }
          return out22;
        }
      } else {
        throw new MathError2("Only 1- and 2-dimensional arrays can be appended to a DataFrame!");
      }
    } else if (isSeries2(x)) {
      const out22 = dfAppend2(df, x.values, axis);
      if (axis === 0) {
        out22.index[out22.index.length - 1] = out22.index.indexOf(x.name) > -1 ? x.name + " (2)" : x.name;
      } else {
        out22.columns[out22.columns.length - 1] = out22.columns.indexOf(x.name) > -1 ? x.name + " (2)" : x.name;
      }
      return out22;
    } else if (isDataFrame2(x)) {
      if (axis === 0) {
        const out22 = df.copy();
        const maxRowLength = set2(out22._columns.concat(x._columns)).length;
        out22._values.forEach((row) => {
          while (row.length < maxRowLength) {
            row.push(void 0);
          }
        });
        x.apply((row) => {
          const rowCopy = row.copy();
          const temp = [];
          out22._columns.forEach((col) => {
            const index = rowCopy._index.indexOf(col);
            if (index > -1) {
              temp.push(rowCopy._values[index]);
              rowCopy._values.splice(index, 1);
              rowCopy._index.splice(index, 1);
            } else {
              temp.push(void 0);
            }
          });
          out22._values.push(temp.concat(rowCopy._values));
        }, 1);
        out22._columns = out22._columns.concat(x._columns.filter((c) => out22._columns.indexOf(c) < 0));
        while (out22._index.length < out22._values.length) {
          const newRowName = "row" + out22._index.length;
          out22._index.push(newRowName + (df._index.indexOf(newRowName) > -1 ? " (2)" : ""));
        }
        return out22;
      } else {
        const out22 = df.copy();
        out22._index.forEach((rowName, i) => {
          const xIndex = x._index.indexOf(rowName);
          if (xIndex > -1) {
            out22._values[i] = out22._values[i].concat(x._values[xIndex]);
          } else {
            out22._values[i] = out22._values[i].concat(ndarray2(x.shape[1]));
          }
        });
        x._index.forEach((rowName, i) => {
          const outIndex = out22._index.indexOf(rowName);
          if (outIndex < 0) {
            out22._index.push(rowName);
            out22._values.push(ndarray2(out22._columns.length).concat(x._values[i]));
          }
        });
        out22._columns = out22._columns.concat(x._columns.map((c) => c + (out22._columns.indexOf(c) > -1 ? " (2)" : "")));
        return out22;
      }
    } else {
      throw new MathError2("Only 1- or 2-dimensional arrays, Series, and DataFrames can be appended to a DataFrame!");
    }
  }
  function dfApply2(DataFrame22, Series22, df, fn, axis) {
    axis = axis || 0;
    assert2(isFunction2(fn), "The first parameter to the `apply` method must be a function.");
    assert2(axis === 0 || axis === 1, "The second parameter to the `apply` method (the `axis`) must be 0 or 1.");
    if (axis === 0) {
      const temp = {};
      let shouldReturnADataFrame;
      df.columns.forEach((colName, i) => {
        const series = new Series22(df.values.map((row) => row[i]));
        series.name = colName;
        series.index = df.index;
        const value = fn(series, i, df);
        if (value instanceof Series22) {
          temp[colName] = value.values;
        } else {
          temp[colName] = value;
        }
        if (isUndefined2(shouldReturnADataFrame)) {
          shouldReturnADataFrame = value instanceof Series22 || isArray2(value);
        }
      });
      if (shouldReturnADataFrame) {
        const out22 = new DataFrame22(temp);
        out22.index = df.index;
        return out22;
      } else {
        const out22 = new Series22(df.columns.map((colName) => temp[colName]));
        out22.index = df.columns;
        return out22;
      }
    } else if (axis === 1) {
      let shouldReturnADataFrame;
      const temp = df.values.map((row, i) => {
        const series = new Series22(row);
        series.name = df.index[i];
        series.index = df.columns;
        const value = fn(series, i, df);
        if (isUndefined2(shouldReturnADataFrame)) {
          shouldReturnADataFrame = value instanceof Series22 || isArray2(value);
        }
        if (value instanceof Series22) {
          return value.values;
        } else {
          return value;
        }
      });
      if (shouldReturnADataFrame) {
        const out22 = new DataFrame22(temp);
        out22.index = df.index;
        out22.columns = df.columns;
        return out22;
      } else {
        const out22 = new Series22(temp);
        out22.index = df.index;
        return out22;
      }
    }
  }
  function isString2(s22) {
    return typeof s22 === "string";
  }
  function dfAssign2(DataFrame22, Series22, df, p1, p2) {
    const isDataFrame22 = (x) => x instanceof DataFrame22;
    const isSeries22 = (x) => x instanceof Series22;
    if (!isUndefined2(p2)) {
      assert2(isString2(p1), "If passing two arguments into the `assign` method, then the first argument must be a string name!");
      assert2(isArray2(p2) && !isJagged2(p2) && shape2(p2).length === 1, "If passing two arguments into the `assign` method, then the second argument must be a 1-dimensional array!");
      const out22 = df.append(p2, 1);
      out22.columns[out22.columns.length - 1] = p1;
      return out22;
    } else {
      if (isDataFrame22(p1)) {
        return df.append(p1, 1);
      } else if (isSeries22(p1)) {
        return df.append(p1, 1);
      } else if (isObject2(p1)) {
        const maxColumnLength = Math.max(...Object.keys(p1).concat(Object.getOwnPropertySymbols(p1)).map((key) => p1[key].length));
        Object.keys(p1).concat(Object.getOwnPropertySymbols(p1)).forEach((key) => {
          while (p1[key].length < maxColumnLength) {
            p1[key].push(void 0);
          }
        });
        return df.append(new DataFrame22(p1), 1);
      } else {
        throw new MathError2("You must pass a DataFrame, Series, or object into the `assign` method!");
      }
    }
  }
  function dfCopy2(DataFrame22, df) {
    if (df.isEmpty)
      return new DataFrame22();
    const out22 = new DataFrame22(copy2(df.values));
    out22.columns = df.columns.slice();
    out22.index = df.index.slice();
    return out22;
  }
  function dfDrop2(DataFrame22, Series22, df, rows, cols) {
    if (isUndefined2(rows))
      rows = [];
    if (isUndefined2(cols))
      cols = [];
    if (isString2(rows) || isNumber2(rows))
      rows = [rows];
    if (isString2(cols) || isNumber2(cols))
      cols = [cols];
    assert2(isArray2(rows), "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    assert2(isArray2(cols), "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    assert2(shape2(rows).length === 1, "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    assert2(shape2(cols).length === 1, "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.");
    let outIndex, outColumns;
    df.index.forEach((row, i) => {
      if (rows.indexOf(row) < 0 && rows.indexOf(i) < 0) {
        if (!outIndex)
          outIndex = [];
        outIndex.push(row);
      }
    });
    df.columns.forEach((col, i) => {
      if (cols.indexOf(col) < 0 && cols.indexOf(i) < 0) {
        if (!outColumns)
          outColumns = [];
        outColumns.push(col);
      }
    });
    let out22 = df.get(outIndex, outColumns);
    if (out22 instanceof Series22) {
      let temp = new DataFrame22();
      temp = temp.assign(out22);
      if (df.index.indexOf(out22.name) > -1)
        temp = temp.transpose();
      out22 = temp;
    }
    return out22;
  }
  function isInteger2(x) {
    return isNumber2(x) && (x >= 0 ? Math.floor(x) === x : Math.ceil(x) === x);
  }
  function isWholeNumber2(x) {
    return isInteger2(x) && x >= 0;
  }
  function dfDropMissing2(DataFrame22, Series22, df, axis, condition, threshold) {
    axis = axis || 0;
    assert2(axis === 0 || axis === 1, "The first parameter of the `dropMissing` method (the `axis`) must be 0 or 1.");
    threshold = threshold || 0;
    assert2(isWholeNumber2(threshold), "The third parameter of the `dropMissing` method (the `threshold`) should be a whole number (meaning that data should be dropped if it contains more than `threshold` null values).");
    condition = threshold > 0 ? "none" : condition || "any";
    assert2(condition === "any" || condition === "all" || condition === "none", "The second parameter of the `dropMissing` method (the `condition` parameter, which indicates the condition under which data should be dropped) should be 'any' or 'all' (meaning that if 'any' of the data contains null values, then it should be dropped; or that if 'all' of the data contains null values, then it should be dropped).");
    function helper52(values) {
      if (threshold > 0) {
        let count22 = 0;
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (isUndefined2(value))
            count22++;
          if (count22 >= threshold)
            return [];
        }
      } else if (condition === "any") {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (isUndefined2(value))
            return [];
        }
      } else if (condition === "all") {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (!isUndefined2(value))
            return values;
        }
        return [];
      }
      return values;
    }
    let out22 = df.copy();
    const tempID = Math.random().toString();
    if (axis === 0) {
      out22 = out22.assign(tempID, out22.index);
      const newValues = out22.values.map(helper52).filter((row) => row.length > 0);
      if (shape2(newValues).length < 2)
        return new DataFrame22();
      out22.values = newValues;
      let newIndex = out22.get(null, tempID);
      if (isUndefined2(newIndex))
        return new DataFrame22();
      if (isString2(newIndex))
        newIndex = [newIndex];
      if (newIndex instanceof Series22)
        newIndex = newIndex.values;
      out22.index = newIndex;
      out22 = out22.drop(null, tempID);
    } else if (axis === 1) {
      const temp = {};
      out22.columns.forEach((colName, i) => {
        const values = out22.values.map((row) => row[i]);
        const newValues = helper52(values);
        if (newValues.length > 0) {
          temp[colName] = newValues;
        }
      });
      if (Object.keys(temp).length + Object.getOwnPropertySymbols(temp).length === 0) {
        return new DataFrame22();
      }
      const newOut = new DataFrame22(temp);
      newOut.index = out22.index;
      return newOut;
    }
    return out22;
  }
  function dropNaN2(x) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return x.dropNaN(...Object.values(arguments).slice(1));
    }
    assert2(isArray2(x), "The `dropNaN` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    x.forEach((v) => {
      try {
        return out22.push(dropNaN2(v));
      } catch (e) {
        if (isNumber2(v)) {
          return out22.push(v);
        }
      }
    });
    return out22;
  }
  function dfDropNaN2(DataFrame22, df, axis, condition, threshold) {
    axis = axis || 0;
    assert2(axis === 0 || axis === 1, "The first parameter of the `dropNaN` method (the `axis`) must be 0 or 1.");
    threshold = threshold || 0;
    assert2(isWholeNumber2(threshold), "The third parameter of the `dropNaN` method (the `threshold`) should be a whole number (meaning that data should be dropped if it contains more than `threshold` NaN values).");
    condition = threshold > 0 ? "none" : condition || "any";
    assert2(condition === "any" || condition === "all" || condition === "none", "The second parameter of the `dropNaN` method (the `condition` parameter, which indicates the condition under which data should be dropped) should be 'any' or 'all' (meaning that if 'any' of the data contains NaN values, then it should be dropped; or that if 'all' of the data contains NaN values, then it should be dropped).");
    function helper52(values) {
      const numericalValues = dropNaN2(values);
      if (threshold > 0)
        return values.length - numericalValues.length < threshold;
      if (condition === "any")
        return numericalValues.length === values.length;
      if (condition === "all")
        return numericalValues.length > 0;
      return true;
    }
    const out22 = df.copy();
    if (axis === 0) {
      const rowsToKeep = out22.index.filter((row) => {
        const values = out22.get(row, null).values;
        return helper52(values);
      });
      if (rowsToKeep.length > 0)
        return out22.get(rowsToKeep, null);
      else
        return new DataFrame22();
    } else if (axis === 1) {
      const colsToKeep = out22.columns.filter((col) => {
        const values = out22.get(null, col).values;
        return helper52(values);
      });
      if (colsToKeep.length > 0)
        return out22.get(null, colsToKeep);
      else
        return new DataFrame22();
    }
    return out22;
  }
  function arrayToObject2(x) {
    const out22 = {};
    flatten2(x).forEach((value, i) => {
      out22[value] = i;
    });
    return out22;
  }
  function undoArrayToObject2(obj) {
    return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)).sort((a, b) => obj[a] - obj[b]);
  }
  function dfFilter2(DataFrame22, Series22, df, fn, axis) {
    assert2(isFunction2(fn), "The `filter` method takes a single parameter: a function that is used to filter the values.");
    if (isUndefined2(axis))
      axis = 0;
    assert2(axis === 0 || axis === 1, "The `axis` parameter to the `filter` method must be 0 or 1.");
    let out22 = df.copy();
    if (out22.isEmpty)
      return out22;
    const index = arrayToObject2(out22.index);
    const columns = arrayToObject2(out22.columns);
    if (axis === 0) {
      let count22 = 0;
      const newValues = out22.values.filter((row, i) => {
        const series = new Series22(row);
        series.name = df.index[i];
        series.index = df.columns;
        const shouldKeep = fn(series, i, df);
        if (shouldKeep) {
          count22++;
        } else {
          delete index[out22.index[i]];
        }
        return shouldKeep;
      });
      if (count22 === 0) {
        return new DataFrame22();
      }
      if (count22 === 1) {
        const temp = new Series22(newValues[0]);
        temp.name = undoArrayToObject2(index)[0];
        temp.index = undoArrayToObject2(columns);
        return temp;
      }
      out22.values = newValues;
      out22.index = undoArrayToObject2(index);
    } else if (axis === 1) {
      out22 = out22.transpose();
      let count22 = 0;
      const newValues = out22.values.filter((row, i) => {
        const series = new Series22(row);
        series.name = df.columns[i];
        series.index = df.index;
        const shouldKeep = fn(series, i, df);
        if (shouldKeep) {
          count22++;
        } else {
          delete columns[out22.index[i]];
        }
        return shouldKeep;
      });
      if (count22 === 0) {
        return new DataFrame22();
      }
      if (count22 === 1) {
        const temp = new Series22(newValues[0]);
        temp.name = undoArrayToObject2(columns)[0];
        temp.index = undoArrayToObject2(index);
        return temp;
      }
      out22.values = newValues;
      out22.index = undoArrayToObject2(columns);
      out22 = out22.transpose();
    }
    return out22;
  }
  function dfGet2(df, rows, cols) {
    if (isString2(rows) || isNumber2(rows))
      rows = [rows];
    if (isString2(cols) || isNumber2(cols))
      cols = [cols];
    for (const i in rows) {
      if (typeof rows[i] === "bigint") {
        rows[i] = Number(rows[i]);
      }
    }
    for (const i in cols) {
      if (typeof cols[i] === "bigint") {
        cols[i] = Number(cols[i]);
      }
    }
    const types = set2((rows || []).concat(cols || []).map((v) => typeof v));
    assert2(types.length <= 2, "Only whole numbers and/or strings are allowed in `get` arrays!");
    if (types.length === 1) {
      assert2(types[0] === "string" || types[0] === "number", "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (types.length === 2) {
      assert2(types.indexOf("string") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
      assert2(types.indexOf("number") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (!isUndefined2(rows)) {
      rows = rows.map((r) => {
        if (isString2(r)) {
          assert2(df.index.indexOf(r) > -1, `Row "${r}" does not exist!`);
          return r;
        }
        if (isNumber2(r)) {
          assert2(r >= 0, `Index ${r} is out of bounds!`);
          assert2(Math.floor(r) === r, `Row numbers must be integers!`);
          assert2(r < df.index.length, `Index ${r} is out of bounds!`);
          return df.index[r];
        }
      });
    }
    if (!isUndefined2(cols)) {
      cols = cols.map((c) => {
        if (isString2(c)) {
          assert2(df.columns.indexOf(c) > -1, `Column "${c}" does not exist!`);
          return c;
        }
        if (isNumber2(c)) {
          assert2(c >= 0, `Column ${c} is out of bounds!`);
          assert2(Math.floor(c) === c, `Column numbers must be integers!`);
          assert2(c < df.columns.length, `Column ${c} is out of bounds!`);
          return df.columns[c];
        }
      });
    }
    return df.getSubsetByNames(rows, cols);
  }
  function alphaSort2(a, b) {
    try {
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    } catch (e) {
      a = typeof a === "object" && a !== null ? JSON.stringify(a) : a.toString();
      b = typeof b === "object" && b !== null ? JSON.stringify(b) : b.toString();
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    }
  }
  function sort2(arr, fn) {
    if (isUndefined2(fn))
      fn = alphaSort2;
    if (isDataFrame2(arr) || isSeries2(arr)) {
      return arr.sort(...Object.values(arguments).slice(1));
    }
    assert2(isArray2(arr), "The `sort` function only works on arrays, Series, and DataFrames!");
    assert2(isFunction2(fn), "The second parameter of the `sort` function must be a comparison function!");
    const out22 = arr.slice();
    out22.sort(fn);
    return out22;
  }
  function camelify22(text) {
    const temp = text.toLowerCase();
    let out22 = "";
    for (let i = 0; i < temp.length; i++) {
      const char = temp[i];
      if (char.match(/[a-z0-9]/g)) {
        out22 += char;
      } else {
        out22 += " ";
      }
    }
    const words = out22.split(" ").filter((word) => word.length > 0);
    return words[0] + words.slice(1).map((word) => word[0].toUpperCase() + word.substring(1)).join("");
  }
  function dfGetDummies2(DataFrame22, df, columns) {
    if (isUndefined2(columns)) {
      columns = df.columns;
    } else if (isString2(columns)) {
      columns = [columns];
    }
    const temp = {};
    columns.forEach((col) => {
      assert2(isString2(col), "You must pass either a string or a one-dimensional array of strings into the `getDummies` (AKA `oneHotEncode`) method!");
      const colIndex = df.columns.indexOf(col);
      assert2(colIndex > -1, `The given DataFrame does not have a column called "${col}"!`);
      const values = df.values.map((row) => row[colIndex]);
      const valuesSet = sort2(set2(values));
      values.forEach((value) => {
        valuesSet.forEach((orig) => {
          const colName = col + "_" + camelify22(orig.toString());
          if (!temp[colName]) {
            temp[colName] = [];
          }
          if (value === orig) {
            temp[colName].push(1);
          } else {
            temp[colName].push(0);
          }
        });
      });
    });
    const out22 = new DataFrame22(temp);
    out22.index = df.index;
    return out22;
  }
  function dfGetSubsetByIndices2(df, rowIndices, colIndices) {
    const dataShape = df.shape;
    if (isUndefined2(rowIndices))
      rowIndices = range2(0, dataShape[0]);
    if (isUndefined2(colIndices))
      colIndices = range2(0, dataShape[1]);
    if (isNumber2(rowIndices))
      rowIndices = [rowIndices];
    if (isNumber2(colIndices))
      colIndices = [colIndices];
    assert2(isArray2(rowIndices) && isArray2(colIndices), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
    assert2(shape2(rowIndices).length === 1 && shape2(colIndices).length === 1, "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
    assert2(rowIndices.length > 0, "The `rowIndices` array must contain at least one index.");
    assert2(colIndices.length > 0, "The `colIndices` array must contain at least one index.");
    rowIndices.forEach((rowIndex) => {
      assert2(isWholeNumber2(rowIndex), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
      assert2(rowIndex < df.index.length, `The row index ${rowIndex} is out of bounds.`);
    });
    colIndices.forEach((colIndex) => {
      assert2(isWholeNumber2(colIndex), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.");
      assert2(colIndex < df.columns.length, `The column index ${colIndex} is out of bounds.`);
    });
    const rows = rowIndices.map((i) => df.index[i]);
    const cols = colIndices.map((i) => df.columns[i]);
    return df.getSubsetByNames(rows, cols);
  }
  function dfGetSubsetByNames2(DataFrame22, Series22, df, rows, cols) {
    if (isUndefined2(rows))
      rows = df.index;
    if (isUndefined2(cols))
      cols = df.columns;
    if (isString2(rows))
      rows = [rows];
    if (isString2(cols))
      cols = [cols];
    assert2(isArray2(rows) && isArray2(cols), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
    assert2(shape2(rows).length === 1 && shape2(cols).length === 1, "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
    assert2(rows.length > 0, "The `rows` array must contain at least one row name.");
    assert2(cols.length > 0, "The `cols` array must contain at least one column name.");
    rows.forEach((row) => {
      assert2(isString2(row), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
      assert2(df.index.indexOf(row) > -1, `The row name "${row}" does not exist in the list of rows.`);
    });
    cols.forEach((col) => {
      assert2(isString2(col), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.");
      assert2(df.columns.indexOf(col) > -1, `The column name "${col}" does not exist in the list of columns.`);
    });
    const values = rows.map((row) => {
      return cols.map((col) => {
        return df.values[df.index.indexOf(row)][df.columns.indexOf(col)];
      });
    });
    if (rows.length === 1 && cols.length === 1) {
      return values[0][0];
    }
    if (rows.length === 1) {
      const out3 = new Series22(values[0]);
      out3.name = rows[0];
      out3.index = cols;
      return out3;
    }
    if (cols.length === 1) {
      const out3 = new Series22(values.map((v) => v[0]));
      out3.name = cols[0];
      out3.index = rows;
      return out3;
    }
    const out22 = new DataFrame22(values);
    out22.columns = cols;
    out22.index = rows;
    return out22;
  }
  function dfPrint2(DataFrame22, Series22, df) {
    function truncate(s22, maxLength2) {
      if (isString2(s22)) {
        if (s22.length > maxLength2) {
          return s22.substring(0, maxLength2 - 3) + "...";
        } else {
          return s22;
        }
      } else {
        return s22;
      }
    }
    if (df.isEmpty) {
      console.table({});
      console.log("Shape:", [0, 0], "\n");
      return df;
    }
    const maxRows = typeof window === "undefined" ? 20 : 10;
    const halfMaxRows = Math.floor(maxRows / 2);
    const maxColumns = typeof process === "undefined" ? 10 : Math.floor(process.stdout.columns / 24) - 1;
    const halfMaxColumns = Math.floor(maxColumns / 2);
    const tempRows = maxRows > df.index.length ? null : range2(0, halfMaxRows).concat(range2(df.index.length - halfMaxRows, df.index.length));
    const tempColumns = maxColumns > df.columns.length ? null : range2(0, halfMaxColumns).concat(range2(df.columns.length - halfMaxColumns, df.columns.length));
    let temp = df.get(tempRows, tempColumns);
    if (temp instanceof Series22) {
      if (df.shape[0] === 1) {
        temp = new DataFrame22([temp.values]);
        temp.index = df.index;
        temp.columns = new Series22(df.columns).get(tempColumns).values;
      } else if (df.shape[1] === 1) {
        temp = new DataFrame22([temp.values]).transpose();
        temp.index = new Series22(df.index).get(tempRows).values;
        temp.columns = df.columns;
      }
    }
    if (maxRows <= df.index.length) {
      temp._index.splice(halfMaxRows, 0, "...");
      temp._values.splice(halfMaxRows, 0, range2(0, temp.columns.length).map(() => "..."));
    }
    if (maxColumns <= df.columns.length) {
      temp._columns.splice(halfMaxColumns, 0, "...");
      temp._values = temp._values.map((row) => {
        row.splice(halfMaxColumns, 0, "...");
        return row;
      });
    }
    const maxLength = 28;
    if (temp instanceof Series22) {
      temp.values = temp.values.map((value) => truncate(value, maxLength));
      temp.name = truncate(temp.name, maxLength);
      temp.index = temp.index.map((row) => truncate(row, maxLength));
    } else {
      temp.values = temp.values.map((row) => {
        return row.map((value) => truncate(value, maxLength));
      });
      temp.columns = temp.columns.map((col) => truncate(col, maxLength));
      temp.index = temp.index.map((row) => truncate(row, maxLength));
    }
    console.table(temp.toDetailedObject());
    console.log("Shape:", df.shape, "\n");
    return df;
  }
  function leftPad2(x, maxLength) {
    assert2(isNumber2(x), "The `leftPad` function only works on numbers!");
    let out22 = x.toString();
    while (out22.length < maxLength)
      out22 = "0" + out22;
    return out22;
  }
  function dfResetIndex2(df, shouldSkipCopying) {
    const out22 = shouldSkipCopying ? df : df.copy();
    out22.index = range2(0, df.shape[0]).map((i) => {
      return "row" + leftPad2(i, (out22.index.length - 1).toString().length);
    });
    return out22;
  }
  function product2(arr, shouldDropNaNs) {
    if (isDataFrame2(arr) || isSeries2(arr)) {
      return product2(arr.values, shouldDropNaNs);
    }
    assert2(isArray2(arr), "The `product` function only works on arrays, Series, and DataFrames!");
    try {
      if (arr.length === 0)
        return NaN;
      const temp = flatten2(arr);
      let resultShouldBeABigInt = false;
      let out22 = 1;
      for (let v of temp) {
        if (!isNumber2(v)) {
          if (shouldDropNaNs) {
            v = 1;
          } else {
            return NaN;
          }
        }
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
          v = Number(v);
        }
        out22 *= v;
      }
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  }
  function isNaturalNumber2(x) {
    return isInteger2(x) && x > 0;
  }
  function reshape2(x, newShape) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return reshape2(x.values, newShape);
    }
    assert2(isArray2(x), "The first argument passed into the `reshape` function must be an array!");
    if (isNumber2(newShape))
      newShape = [newShape];
    assert2(isArray2(newShape), "The second argument passed into the `reshape` function must be a whole number or a one-dimensional array of whole numbers!");
    assert2(shape2(newShape).length === 1, "The first argument passed into the `reshape` function must be a whole number or a one-dimensional array of whole numbers!");
    newShape = newShape.map((v) => {
      if (typeof v === "bigint") {
        v = Number(v);
      }
      assert2(isNaturalNumber2(v), "The first argument passed into the `reshape` function must be a whole number or a one-dimensional array of whole numbers!");
      return Number(v);
    });
    if (newShape.length === 0) {
      return flatten2(x);
    }
    const temp = flatten2(x);
    if (newShape.length === 1 && newShape[0] === temp.length) {
      return temp;
    }
    assert2(product2(newShape) === temp.length, "The new shape doesn't match the number of values available in `x` (the first argument passed into the `reshape` function)!");
    const out22 = [];
    const step = Math.floor(temp.length / newShape[0]);
    for (let i = 0; i < newShape[0]; i++) {
      const row = temp.slice(i * step, (i + 1) * step);
      out22.push(reshape2(row, newShape.slice(1)));
    }
    return out22;
  }
  var MAX2 = Math.pow(2, 64);
  var s2 = [];
  seed2(Math.floor(Math.random() * MAX2));
  function splitmix642(state, n) {
    state = uint2(state);
    function helper52() {
      state += uint2("0x9e3779b97f4a7c15");
      let z = copy2(state);
      z = (z ^ z >> BigInt(30)) * uint2("0xbf58476d1ce4e5b9");
      z = (z ^ z >> BigInt(27)) * uint2("0x94d049bb133111eb");
      return z ^ z >> BigInt(31);
    }
    const out22 = [];
    for (let i = 0; i < n; i++)
      out22.push(helper52());
    return out22;
  }
  function uint2(x) {
    return BigInt.asUintN(64, BigInt(x));
  }
  function rotl2(x, k) {
    x = uint2(x);
    k = BigInt(k);
    return uint2(uint2(x << k) | uint2(x >> uint2(BigInt(64) - k)));
  }
  function seed2(val) {
    if (typeof val === "bigint") {
      val = Number(val);
    }
    if (!isUndefined2(val)) {
      assert2(isNumber2(val), "If passing a value into the `seed` function, then that value must be an integer!");
      const temp = splitmix642(Math.floor(val), 4);
      s2[0] = temp[0];
      s2[1] = temp[1];
      s2[2] = temp[2];
      s2[3] = temp[3];
    } else {
      return copy2(s2);
    }
  }
  function next2() {
    const result = uint2(rotl2(s2[0] + s2[3], 23) + s2[0]);
    const t = uint2(s2[1] << BigInt(17));
    s2[2] = uint2(s2[2] ^ s2[0]);
    s2[3] = uint2(s2[3] ^ s2[1]);
    s2[1] = uint2(s2[1] ^ s2[2]);
    s2[0] = uint2(s2[0] ^ s2[3]);
    s2[2] = uint2(s2[2] ^ t);
    s2[3] = rotl2(s2[3], 45);
    return Math.floor(Number(result)) / MAX2;
  }
  function random2(shape22) {
    if (isUndefined2(shape22))
      return next2();
    if (!isArray2(shape22))
      shape22 = [shape22];
    return reshape2(ndarray2(product2(shape22)).map(next2), shape22);
  }
  function shuffle2(arr) {
    if (isDataFrame2(arr) || isSeries2(arr)) {
      return arr.shuffle(...Object.values(arguments).slice(1));
    }
    assert2(isArray2(arr), "The `shuffle` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    const temp = arr.slice();
    for (let i = 0; i < arr.length; i++) {
      const index = Math.floor(random2() * temp.length);
      out22.push(temp.splice(index, 1)[0]);
    }
    return out22;
  }
  function dfShuffle2(df, axis) {
    if (isUndefined2(axis))
      axis = 0;
    assert2(axis === 0 || axis === 1, "The `axis` parameter to the `shuffle` must be 0, 1, or undefined.");
    return df.get(axis === 0 ? shuffle2(df.index) : null, axis === 1 ? shuffle2(df.columns) : null);
  }
  function isBoolean2(x) {
    return typeof x === "boolean";
  }
  function dfSort2(df, a, b) {
    if (isFunction2(a)) {
      return dfSortByFunction2(df, a, b);
    } else {
      return dfSortByColumns2(df, a, b);
    }
  }
  function dfSortByFunction2(df, fn, axis) {
    axis = isUndefined2(axis) ? 0 : axis;
    assert2(isFunction2(fn), "When sorting a DataFrame using a function, the first argument to the `sort` method must be a function!");
    assert2(isNumber2(axis), "When sorting a DataFrame using a function, the second argument to the `sort` method must be null, undefined, 0, or 1 to indicate the axis along which the data should be sorted! An axis of 0 means that the rows will be sorted relative to each other, whereas an axis of 1 means that the columns will be sorted relative to each other.");
    if (axis === 0) {
      const index = sort2(df.index, (a, b) => {
        return fn(df.get(a, null), df.get(b, null));
      });
      return df.get(index, null);
    } else {
      const columns = sort2(df.columns, (a, b) => {
        return fn(df.get(null, a), df.get(null, b));
      });
      return df.get(null, columns);
    }
  }
  function dfSortByColumns2(df, cols, directions) {
    let out22 = df.copy();
    const indexID = random2().toString();
    out22 = out22.assign(indexID, out22.index);
    if (isUndefined2(cols)) {
      cols = [indexID];
      directions = [true];
    }
    if (isNumber2(cols) || isString2(cols)) {
      cols = [cols];
      if (isBoolean2(directions) || isString2(directions))
        directions = [directions];
    }
    assert2(isArray2(cols), "The first parameter of the `sort` method must be (1) a string or index representing a column name or index, respectively; (2) a 1-dimensional array of strings and/or indices; or (3) null.");
    assert2(shape2(cols).length === 1, "The first parameter of the `sort` method must be (1) a string or index representing a column name or index, respectively; (2) a 1-dimensional array of strings and/or indices; or (3) null.");
    if (isUndefined2(directions))
      directions = range2(0, cols.length).map(() => true);
    assert2(isArray2(directions), "The second parameter of the `sort` method must be (1) a string or boolean representing the sort direction ('ascending' / 'descending', or true / false); (2) a 1-dimensional array of strings and/or booleans; or (3) null.");
    assert2(shape2(directions).length === 1, "The second parameter of the `sort` method must be (1) a string or boolean representing the sort direction ('ascending' / 'descending', or true / false); (2) a 1-dimensional array of strings and/or booleans; or (3) null.");
    assert2(cols.length === directions.length, "The arrays passed into the `sort` method must be equal in length.");
    cols = cols.map((col) => {
      assert2(isString2(col) || isNumber2(col), "Column references can either be column names (as strings) or column indices (as whole numbers).");
      if (isString2(col)) {
        const index = out22.columns.indexOf(col);
        assert2(index > -1, `The column "${col}" does not exist!`);
        return index;
      }
      if (isNumber2(col)) {
        assert2(isWholeNumber2(col), "Column indices must be whole numbers!");
        assert2(col < out22.columns.length, `The index ${col} is out of bounds!`);
        return col;
      }
    });
    directions = directions.map((dir) => {
      assert2(isString2(dir) || isBoolean2(dir), "Direction references can either be strings ('ascending' or 'descending') or booleans (true or false).");
      if (isString2(dir)) {
        const value = dir.trim().toLowerCase();
        assert2(value === "ascending" || value === "descending", "Direction references can either be strings ('ascending' or 'descending') or booleans (true or false).");
        return value === "ascending";
      }
      if (isBoolean2(dir)) {
        return dir;
      }
    });
    out22.values = sort2(out22.values, (a, b) => {
      let counter = 0;
      while (a[cols[counter]] === b[cols[counter]] && counter < cols.length) {
        counter++;
      }
      const isAscending = directions[counter];
      if (a[cols[counter]] === b[cols[counter]])
        return 0;
      if (a[cols[counter]] < b[cols[counter]])
        return isAscending ? -1 : 1;
      if (a[cols[counter]] > b[cols[counter]])
        return isAscending ? 1 : -1;
    });
    const indexNumber = out22.columns.indexOf(indexID);
    out22.index = out22.values.map((row) => row[indexNumber]);
    out22 = out22.dropColumns(indexID);
    return out22;
  }
  function dfToDetailedObject2(df, axis) {
    if (isUndefined2(axis)) {
      axis = 0;
    } else {
      assert2(axis === 0 || axis === 1, "The axis parameter of the `toDetailedObject` method must be undefined, 0, or 1. An axis of 0 indicates that the returned object should be organized first by rows and then by columns. An axis of 1 indicates that the returned object should be organized first by columns and then by rows.");
    }
    const out22 = {};
    if (axis === 0) {
      df.index.forEach((rowName, i) => {
        const temp = {};
        df.columns.forEach((colName, j) => {
          temp[colName] = df.values[i][j];
        });
        out22[rowName] = temp;
      });
    } else {
      df.columns.forEach((colName, j) => {
        const temp = {};
        df.index.forEach((rowName, i) => {
          temp[rowName] = df.values[i][j];
        });
        out22[colName] = temp;
      });
    }
    return out22;
  }
  function dfToJSONString2(df, axis) {
    return JSON.stringify(df.toObject(axis));
  }
  async function dfToJSON2(df, filename, axis) {
    const out22 = dfToJSONString2(df, axis);
    let downloadedInBrowser = false;
    let wroteToDiskInNode = false;
    let browserError, nodeError;
    try {
      let newFilename = filename;
      if (filename.includes("/")) {
        const parts = filename.split("/");
        newFilename = parts[parts.length - 1];
      }
      const a = document.createElement("a");
      a.href = `data:application/json;charset=utf-8,${encodeURIComponent(out22)}`;
      a.download = newFilename;
      a.dispatchEvent(new MouseEvent("click"));
      downloadedInBrowser = true;
    } catch (e) {
      browserError = e;
    }
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      fs.writeFileSync(path.resolve(filename), out22, "utf8");
      wroteToDiskInNode = true;
    } catch (e) {
      nodeError = e;
    }
    if (!downloadedInBrowser && !wroteToDiskInNode) {
      if (typeof window !== "undefined") {
        throw new MathError2(browserError);
      } else if (typeof module !== "undefined") {
        throw new MathError2(nodeError);
      } else {
        throw new MathError2("I don't know what's going wrong, but it doesn't seem like you're in Node or the browser, and we couldn't download and/or write the file to disk!");
      }
    }
    return df;
  }
  function dfToObject2(df) {
    const out22 = {};
    df.columns.forEach((col) => {
      out22[col] = df.get(col).values;
    });
    return out22;
  }
  function transpose2(arr) {
    if (isDataFrame2(arr) || isSeries2(arr)) {
      return arr.transpose();
    }
    assert2(isArray2(arr), "The `transpose` function only works on arrays, Series, and DataFrames!");
    const theShape = shape2(arr);
    assert2(theShape.length <= 2, "I'm not smart enough to know how to transpose arrays that have more than 2 dimensions. Sorry for the inconvenience! Please only pass 1- or 2-dimensional arrays into the `transpose` function!");
    if (theShape.length === 1) {
      return reverse2(arr);
    } else if (theShape.length === 2) {
      const out22 = ndarray2(reverse2(theShape));
      for (let row = 0; row < theShape[0]; row++) {
        for (let col = 0; col < theShape[1]; col++) {
          out22[col][row] = arr[row][col];
        }
      }
      return out22;
    }
  }
  function seriesAppend2(Series22, series, x) {
    if (isSeries2(x)) {
      return new Series22(series.values.concat(x.values));
    }
    if (isArray2(x)) {
      const xShape = shape2(x);
      assert2(xShape.length === 1 && !isNested2(xShape), "Only vectors can be appended to Series!");
      const out22 = series.copy();
      x.forEach((v, i) => {
        out22._values.push(v);
        out22._index.push("item" + (series.values.length + i));
      });
      return out22;
    }
    return seriesAppend2(series, [x]);
  }
  function seriesApply2(series, fn) {
    assert2(isFunction2(fn), "The parameter to the `apply` method must be a function.");
    const out22 = series.copy();
    out22._values = out22._values.map((v, i) => fn(v, i));
    return out22;
  }
  function seriesDropMissing2(series) {
    const out22 = series.copy();
    const outIndex = [];
    out22._values = out22.values.filter((v, i) => {
      if (isUndefined2(v)) {
        return false;
      } else {
        outIndex.push(out22.index[i]);
        return true;
      }
    });
    out22._index = outIndex;
    return out22;
  }
  function seriesDropNaN2(Series22, series) {
    const index = [];
    const values = [];
    series.values.forEach((value, i) => {
      if (isNumber2(value)) {
        values.push(value);
        index.push(series.index[i]);
      }
    });
    const out22 = new Series22(values);
    out22.name = series.name;
    out22.index = index;
    return out22;
  }
  function seriesFilter2(Series22, series, fn) {
    let out22 = series.copy();
    const index = copy2(out22.index);
    const indicesToRemove = [];
    const newValues = out22.values.filter((value, i) => {
      const shouldKeep = fn(value, i, out22.values);
      if (!shouldKeep)
        indicesToRemove.push(out22.index[i]);
      return shouldKeep;
    });
    indicesToRemove.forEach((i) => {
      index.splice(index.indexOf(i), 1);
    });
    if (newValues.length === 0) {
      out22 = new Series22();
      out22.name = series.name;
      return out22;
    }
    out22.values = newValues;
    out22.index = index;
    return out22;
  }
  function seriesGet2(series, indices) {
    if (isString2(indices) || isNumber2(indices))
      indices = [indices];
    for (const i in indices) {
      if (typeof indices[i] === "bigint") {
        indices[i] = Number(indices[i]);
      }
    }
    const types = set2((indices || []).map((v) => typeof v));
    assert2(types.length <= 2, "Only whole numbers and/or strings are allowed in `get` arrays!");
    if (types.length === 1) {
      assert2(types[0] === "string" || types[0] === "number", "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (types.length === 2) {
      assert2(types.indexOf("string") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
      assert2(types.indexOf("number") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!");
    }
    if (!isUndefined2(indices)) {
      indices = indices.map((i) => {
        if (typeof i === "string") {
          assert2(series.index.indexOf(i) > -1, `Index "${i}" does not exist!`);
          return i;
        }
        if (typeof i === "number") {
          assert2(i >= 0, `Index ${i} is out of bounds!`);
          assert2(Math.floor(i) === i, `Indices must be integers!`);
          assert2(i < series.index.length, `Index ${i} is out of bounds!`);
          return series.index[i];
        }
      });
    }
    return series.getSubsetByNames(indices);
  }
  function seriesGetSubsetByIndices2(series, indices) {
    const dataShape = series.shape;
    if (isUndefined2(indices))
      indices = range2(0, dataShape[0]);
    assert2(isArray2(indices), "The `indices` array must be 1-dimensional array of whole numbers.");
    assert2(shape2(indices).length === 1, "The `indices` array must be a 1-dimensional array of whole numbers.");
    assert2(indices.length > 0, "The `indices` array must contain at least one index.");
    indices.forEach((index) => {
      assert2(isWholeNumber2(index), "The `indices` array must be a 1-dimensional array of whole numbers.");
      assert2(index < series.index.length, `The row index ${index} is out of bounds.`);
    });
    const rows = indices.map((i) => series.index[i]);
    return series.getSubsetByNames(rows);
  }
  function seriesGetSubsetByNames2(Series22, series, indices) {
    if (isUndefined2(indices))
      indices = series.index;
    assert2(isArray2(indices), "The `indices` array must be a 1-dimensional array of strings.");
    assert2(shape2(indices).length === 1, "The `indices` array must be a 1-dimensional array of strings.");
    assert2(indices.length > 0, "The `indices` array must contain at least one index name.");
    indices.forEach((name) => {
      assert2(isString2(name), "The `indices` array must contain only strings.");
      assert2(series.index.indexOf(name) > -1, `The name "${name}" does not exist in the index.`);
    });
    const values = indices.map((name) => {
      return series.values[series.index.indexOf(name)];
    });
    if (values.length === 1)
      return values[0];
    const out22 = new Series22(values);
    out22.index = indices;
    out22.name = series.name;
    return out22;
  }
  function seriesPrint2(series) {
    let temp = series.copy();
    const maxRows = typeof window === "undefined" ? 20 : 10;
    if (temp.index.length > maxRows) {
      temp = temp.get(range2(0, maxRows / 2).concat(range2(temp.index.length - maxRows / 2, temp.index.length)));
      const tempIndex = copy2(temp.index);
      tempIndex.splice(Math.floor(tempIndex.length / 2), 0, "...");
      temp.values.push("...");
      temp.index.push("...");
      temp = temp.get(tempIndex);
    }
    const out22 = {};
    temp.values.forEach((value, i) => {
      const obj = {};
      obj[temp.name] = value;
      out22[temp.index[i]] = obj;
    });
    console.table(out22);
    console.log("Shape:", series.shape, "\n");
    return series;
  }
  function seriesShuffle2(series) {
    const out22 = series.copy();
    return out22.get(shuffle2(out22.index));
  }
  function seriesSort2(Series22, series, fn) {
    fn = fn || ((a, b) => a < b ? -1 : 1);
    assert2(isUndefined2(fn) || isFunction2(fn), "You must pass undefined, null, or a comparison function as the second argument to the `sort` method!");
    const pairs = transpose2([series.values, series.index]);
    const temp = sort2(pairs, (aPair, bPair) => {
      return fn(aPair[0], bPair[0]);
    });
    const newValues = [];
    const newIndex = [];
    temp.forEach((pair) => {
      newValues.push(pair[0]);
      newIndex.push(pair[1]);
    });
    const out22 = new Series22();
    out22._values = newValues;
    out22._index = newIndex;
    out22.name = series.name;
    return out22;
  }
  function seriesSortByIndex2(Series22, series) {
    let temp = transpose2([series.values, series.index]);
    temp = transpose2(sort2(temp, (a, b) => {
      if (a[1] === b[1])
        return 0;
      if (a[1] < b[1])
        return -1;
      if (a[1] > b[1])
        return 1;
    }));
    const out22 = new Series22(temp[0]);
    out22.index = temp[1];
    out22.name = series.name;
    return out22;
  }
  function seriesToObject2(series) {
    const out22 = {};
    out22[series.name] = {};
    series.index.forEach((index, i) => {
      out22[series.name][index] = series.values[i];
    });
    return out22;
  }
  var SERIES_SYMBOL2 = Symbol.for("@jrc03c/js-math-tools/series");
  function createSeriesClass2(DataFrame22) {
    class Series22 {
      static [Symbol.hasInstance](x) {
        try {
          return !!x._symbol && x._symbol === SERIES_SYMBOL2;
        } catch (e) {
          return false;
        }
      }
      constructor(data) {
        this.name = "data";
        Object.defineProperty(this, "_symbol", {
          configurable: false,
          enumerable: false,
          writable: false,
          value: SERIES_SYMBOL2
        });
        Object.defineProperty(this, "_values", {
          value: [],
          configurable: true,
          enumerable: false,
          writable: true
        });
        Object.defineProperty(this, "values", {
          configurable: true,
          enumerable: true,
          get() {
            return this._values;
          },
          set(x) {
            assert2(isArray2(x), "The new values must be a 1-dimensional array!");
            const dataShape = shape2(x);
            assert2(dataShape.length === 1, "The new array of values must be 1-dimensional!");
            if (dataShape[0] < this._index.length) {
              this._index = this._index.slice(0, dataShape[0]);
            } else if (dataShape[0] > this._index.length) {
              this._index = this._index.concat(range2(this._index.length, dataShape[0]).map((i) => {
                return "item" + leftPad2(i, (x.length - 1).toString().length);
              }));
            }
            this._values = x;
          }
        });
        Object.defineProperty(this, "_index", {
          value: [],
          configurable: true,
          enumerable: false,
          writable: true
        });
        Object.defineProperty(this, "index", {
          configurable: true,
          enumerable: true,
          get() {
            return this._index;
          },
          set(x) {
            assert2(isArray2(x), "The new index must be a 1-dimensional array of strings!");
            assert2(x.length === this.shape[0], "The new index must be the same length as the old index!");
            assert2(shape2(x).length === 1, "The new index must be a 1-dimensional array of strings!");
            x.forEach((value) => {
              assert2(isString2(value), "All of the row names must be strings!");
            });
            this._index = x;
          }
        });
        if (data) {
          if (data instanceof Series22) {
            this.name = data.name;
            this.values = copy2(data.values);
            this.index = copy2(data.index);
          } else if (isArray2(data)) {
            const dataShape = shape2(data);
            assert2(dataShape.length === 1, "When passing an array into the constructor of a Series, the array must be 1-dimensional!");
            this.values = data;
          } else if (data instanceof Object) {
            const keys = Object.keys(data).concat(Object.getOwnPropertySymbols(data)).map((v) => v.toString());
            assert2(keys.length === 1, "When passing an object into the constructor of a Series, the object must have only 1 key-value pair, where the key is the name of the data and the value is the 1-dimensional array of values!");
            const name = keys[0];
            const values = data[name];
            assert2(shape2(values).length === 1, "When passing an object into the constructor of a Series, the object must have only 1 key-value pair, where the key is the name of the data and the value is the 1-dimensional array of values!");
            this.name = name;
            this.values = values.slice();
          }
        }
      }
      get shape() {
        return shape2(this.values);
      }
      get length() {
        return this.shape[0];
      }
      get isEmpty() {
        return this.values.filter((v) => !isUndefined2(v)).length === 0;
      }
      clear() {
        const out22 = this.copy();
        out22.values.forEach((v, i) => {
          out22.values[i] = void 0;
        });
        return out22;
      }
      get(indices) {
        return seriesGet2(this, indices);
      }
      getSubsetByNames(indices) {
        return seriesGetSubsetByNames2(Series22, this, indices);
      }
      getSubsetByIndices(indices) {
        return seriesGetSubsetByIndices2(this, indices);
      }
      loc(indices) {
        return this.getSubsetByNames(indices);
      }
      iloc(indices) {
        return this.getSubsetByIndices(indices);
      }
      reverse() {
        const out22 = new Series22(reverse2(this.values));
        out22.index = reverse2(this.index);
        out22.name = this.name;
        return out22;
      }
      resetIndex() {
        const out22 = this.copy();
        out22.index = range2(0, this.shape[0]).map((i) => {
          return "item" + leftPad2(i, (out22.index.length - 1).toString().length);
        });
        return out22;
      }
      copy() {
        const out22 = new Series22();
        out22._values = copy2(this.values);
        out22._index = copy2(this.index);
        out22.name = this.name;
        return out22;
      }
      append(x) {
        return seriesAppend2(Series22, this, x);
      }
      apply(fn) {
        return seriesApply2(this, fn);
      }
      concat(x) {
        return this.append(x);
      }
      dropMissing(condition, threshold) {
        return seriesDropMissing2(this, condition, threshold);
      }
      dropNaN() {
        return seriesDropNaN2(Series22, this);
      }
      toObject() {
        return seriesToObject2(this);
      }
      print() {
        return seriesPrint2(this);
      }
      shuffle() {
        return seriesShuffle2(this);
      }
      sort(direction) {
        return seriesSort2(Series22, this, direction);
      }
      sortByIndex() {
        return seriesSortByIndex2(Series22, this);
      }
      filter(fn) {
        return seriesFilter2(Series22, this, fn);
      }
      toDataFrame() {
        const out22 = new DataFrame22(transpose2([this.values]));
        out22.columns = [this.name];
        out22.index = this.index;
        return out22;
      }
      transpose() {
        const out22 = this.copy();
        out22.values = reverse2(out22.values);
        out22.index = reverse2(out22.index);
        return out22;
      }
      getDummies() {
        return this.toDataFrame().getDummies();
      }
      oneHotEncode() {
        return this.getDummies();
      }
    }
    return Series22;
  }
  var DATAFRAME_SYMBOL2 = Symbol.for("@jrc03c/js-math-tools/dataframe");
  function makeKey32(n) {
    const alpha = "abcdefghijklmnopqrstuvwxyz1234567890";
    let out22 = "";
    for (let i = 0; i < n; i++)
      out22 += alpha[Math.floor(random2() * alpha.length)];
    return out22;
  }
  var DataFrame2 = class {
    static [Symbol.hasInstance](x) {
      try {
        return !!x._symbol && x._symbol === DATAFRAME_SYMBOL2;
      } catch (e) {
        return false;
      }
    }
    constructor(data) {
      Object.defineProperty(this, "_symbol", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: DATAFRAME_SYMBOL2
      });
      Object.defineProperty(this, "_values", {
        value: [],
        configurable: true,
        enumerable: false,
        writable: true
      });
      Object.defineProperty(this, "values", {
        configurable: true,
        enumerable: true,
        get() {
          if (this._values.length === 0 || !isUndefined2(this._values[0]) && this._values[0].length === 0) {
            return [[]];
          }
          return this._values;
        },
        set(x) {
          assert2(isArray2(x), "The new values must be a 2-dimensional array!");
          const dataShape = shape2(x);
          assert2(dataShape.length === 2, "The new array of values must be 2-dimensional!");
          if (dataShape[0] < this._index.length) {
            this._index = this._index.slice(0, dataShape[0]);
          } else if (dataShape[0] > this._index.length) {
            this._index = this._index.concat(range2(this._index.length, dataShape[0]).map((i) => {
              return "row" + leftPad2(i, (dataShape[0] - 1).toString().length);
            }));
          }
          if (dataShape[1] < this._columns.length) {
            this._columns = this._columns.slice(0, dataShape[1]);
          } else if (dataShape[1] > this._columns.length) {
            this._columns = this._columns.concat(range2(this._columns.length, dataShape[1]).map((i) => {
              return "col" + leftPad2(i, (dataShape[1] - 1).toString().length);
            }));
          }
          this._values = x;
        }
      });
      Object.defineProperty(this, "_columns", {
        value: [],
        configurable: true,
        enumerable: false,
        writable: true
      });
      Object.defineProperty(this, "columns", {
        configurable: true,
        enumerable: true,
        get() {
          return this._columns;
        },
        set(x) {
          assert2(isArray2(x), "The new columns list must be a 1-dimensional array of strings!");
          assert2(this.isEmpty || x.length === this.shape[1], "The new columns list must be the same length as the old columns list!");
          assert2(shape2(x).length === 1, "The new columns list must be a 1-dimensional array of strings!");
          x = x.map((v) => {
            if (typeof v !== "string") {
              v = JSON.stringify(v) || v.toString();
            }
            if (v.trim().length === 0) {
              return "untitled_" + makeKey32(8);
            }
            return v.trim();
          });
          const counts = (() => {
            const temp = count2(x);
            const out22 = {};
            temp.values.forEach((v) => {
              out22[v] = temp.get(v);
            });
            return out22;
          })();
          x = x.map((v) => {
            if (counts[v] > 1) {
              return v + "_" + makeKey32(8);
            }
            return v;
          });
          this._columns = x;
        }
      });
      Object.defineProperty(this, "_index", {
        value: [],
        configurable: true,
        enumerable: false,
        writable: true
      });
      Object.defineProperty(this, "index", {
        configurable: true,
        enumerable: true,
        get() {
          return this._index;
        },
        set(x) {
          assert2(isArray2(x), "The new index must be a 1-dimensional array of strings!");
          assert2(this.isEmpty || x.length === this.shape[0], "The new index must be the same length as the old index!");
          assert2(shape2(x).length === 1, "The new index must be a 1-dimensional array of strings!");
          x = x.map((v) => {
            if (typeof v !== "string") {
              v = JSON.stringify(v) || v.toString();
            }
            if (v.trim().length === 0) {
              return "untitled_" + makeKey32(8);
            }
            return v.trim();
          });
          const counts = (() => {
            const temp = count2(x);
            const out22 = {};
            temp.values.forEach((v) => {
              out22[v] = temp.get(v);
            });
            return out22;
          })();
          x = x.map((v) => {
            if (counts[v] > 1) {
              return v + "_" + makeKey32(8);
            }
            return v;
          });
          this._index = x;
        }
      });
      assert2(isUndefined2(data) || isObject2(data) || isArray2(data), "The `data` passed into the constructor of a DataFrame must be either (1) an object where the key-value pairs are (respectively) column names and 1-dimensional arrays of values, or (2) a 2-dimensional array of values.");
      if (data) {
        if (data instanceof DataFrame2) {
          this.values = copy2(data.values);
          this.columns = copy2(data.columns);
          this.index = copy2(data.index);
        } else if (isArray2(data)) {
          const dataShape = shape2(data);
          assert2(dataShape.length === 2, "The `data` array passed into the constructor of a DataFrame must be 2-dimensional!");
          assert2(!isJagged2(data), "The 2-dimensional array passed into the constructor of a DataFrame must not contain sub-arrays (i.e., rows) of different lengths!");
          this.values = data;
        } else {
          this._columns = Object.keys(data).concat(Object.getOwnPropertySymbols(data)).map((v) => v.toString());
          const temp = [];
          let lastColName = null;
          let lastColLength = null;
          this._columns.forEach((col) => {
            if (isUndefined2(lastColLength)) {
              lastColName = col;
              lastColLength = data[col].length;
            }
            assert2(data[col].length === lastColLength, `The object passed into the DataFrame constructor contains arrays of different lengths! The key "${lastColName}" points to an array containing ${lastColLength} items, and the key "${col}" points to an array containing ${data[col].length} items.`);
            lastColLength = data[col].length;
            const values = data[col];
            temp.push(values);
          });
          this._values = transpose2(temp);
          const dataShape = shape2(this.values);
          this._index = range2(0, dataShape[0]).map((i) => {
            return "row" + leftPad2(i, (dataShape[0] - 1).toString().length);
          });
        }
      }
    }
    get shape() {
      return shape2(this.values);
    }
    get length() {
      return this.shape[0];
    }
    get width() {
      return this.shape[1];
    }
    get rows() {
      return this.index;
    }
    set rows(rows) {
      this.index = rows;
    }
    get isEmpty() {
      return this.values.length === 0 || this.values.every((row) => row.length === 0);
    }
    clear() {
      const out22 = new DataFrame2(ndarray2(this.shape));
      out22.columns = this.columns.slice();
      out22.index = this.index.slice();
      return out22;
    }
    get(rows, cols) {
      if (arguments.length === 0) {
        return this;
      }
      if (arguments.length === 1) {
        try {
          return this.get(null, rows);
        } catch (e) {
          return this.get(rows, null);
        }
      }
      return dfGet2(this, rows, cols);
    }
    getSubsetByNames(rows, cols) {
      return dfGetSubsetByNames2(DataFrame2, Series2, this, rows, cols);
    }
    getSubsetByIndices(rowIndices, colIndices) {
      return dfGetSubsetByIndices2(this, rowIndices, colIndices);
    }
    getDummies(columns) {
      return dfGetDummies2(DataFrame2, this, columns);
    }
    oneHotEncode(columns) {
      return dfGetDummies2(DataFrame2, this, columns);
    }
    transpose() {
      const out22 = new DataFrame2(transpose2(this.values));
      out22.columns = this.index.slice();
      out22.index = this.columns.slice();
      return out22;
    }
    get T() {
      return this.transpose();
    }
    resetIndex(shouldSkipCopying) {
      return dfResetIndex2(this, shouldSkipCopying);
    }
    copy() {
      return dfCopy2(DataFrame2, this);
    }
    assign(p1, p2) {
      return dfAssign2(DataFrame2, Series2, this, p1, p2);
    }
    apply(fn, axis) {
      return dfApply2(DataFrame2, Series2, this, fn, axis);
    }
    dropMissing(axis, condition, threshold) {
      return dfDropMissing2(DataFrame2, Series2, this, axis, condition, threshold);
    }
    dropNaN(axis, condition, threshold) {
      return dfDropNaN2(DataFrame2, this, axis, condition, threshold);
    }
    drop(rows, cols) {
      return dfDrop2(DataFrame2, Series2, this, rows, cols);
    }
    dropColumns(columns) {
      return this.drop(null, columns);
    }
    dropRows(rows) {
      return this.drop(rows, null);
    }
    toDetailedObject(axis) {
      return dfToDetailedObject2(this, axis);
    }
    toObject() {
      return dfToObject2(this);
    }
    toJSONString(axis) {
      return dfToJSONString2(this, axis);
    }
    saveAsJSON(filename, axis) {
      return dfToJSON2(this, filename, axis);
    }
    print() {
      return dfPrint2(DataFrame2, Series2, this);
    }
    sort(cols, directions) {
      return dfSort2(this, cols, directions);
    }
    sortByIndex() {
      return this.sort();
    }
    filter(fn, axis) {
      return dfFilter2(DataFrame2, Series2, this, fn, axis);
    }
    shuffle(axis) {
      return dfShuffle2(this, axis);
    }
    append(x, axis) {
      return dfAppend2(this, x, axis);
    }
    concat(x, axis) {
      return this.append(x, axis);
    }
    join(x, axis) {
      return this.append(x, axis);
    }
    toString() {
      return JSON.stringify(this);
    }
  };
  var Series2 = createSeriesClass2(DataFrame2);
  function max2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs }).max;
  }
  function vectorize2(fn) {
    assert2(isFunction2(fn), "You must pass a function into the `vectorize` function!");
    return function helper52() {
      let hasSeries, hasDataFrames;
      const series = [];
      const dataframes = [];
      const childArrays = Object.keys(arguments).filter((key) => {
        const arg = arguments[key];
        if (isArray2(arg)) {
          return true;
        } else if (isSeries2(arg)) {
          hasSeries = true;
          series.push(arg);
          return true;
        } else if (isDataFrame2(arg)) {
          hasDataFrames = true;
          dataframes.push(arg);
          return true;
        } else {
          return false;
        }
      }).map((key) => arguments[key]);
      childArrays.slice(0, -1).forEach((s22, i) => {
        assert2(isEqual2(isArray2(s22) ? shape2(s22) : s22.shape, isArray2(childArrays[i + 1]) ? shape2(childArrays[i + 1]) : childArrays[i + 1].shape), `When passing multiple arrays into the \`${fn.name}\` function, all of the arrays must have the same shape!`);
      });
      if (childArrays.length > 0) {
        const maxLength = max2(childArrays.map((a) => a.length ? a.length : a.values.length));
        const out22 = range2(0, maxLength).map((i) => {
          const args = Object.keys(arguments).map((key) => {
            if (isArray2(arguments[key])) {
              return arguments[key][i];
            } else if (isSeries2(arguments[key])) {
              return arguments[key].values[i];
            } else if (isDataFrame2(arguments[key])) {
              return arguments[key].values[i];
            } else {
              return arguments[key];
            }
          });
          return helper52(...args);
        });
        if (hasDataFrames) {
          try {
            if (dataframes.length === 1 && isEqual2(shape2(dataframes[0]), shape2(out22))) {
              const temp = new DataFrame2(out22);
              temp.index = dataframes[0].index.slice();
              temp.columns = dataframes[0].columns.slice();
              return temp;
            } else {
              return new DataFrame2(out22);
            }
          } catch (e) {
            return out22;
          }
        }
        if (hasSeries) {
          try {
            if (series.length === 1 && series[0].length === out22.length) {
              const temp = new Series2(out22);
              temp.name = series[0].name;
              temp.index = series[0].index.slice();
              return temp;
            } else {
              return new Series2(out22);
            }
          } catch (e) {
            return out22;
          }
        }
        return out22;
      } else {
        return fn(...arguments);
      }
    };
  }
  function abs2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        return x < 0 ? -x : x;
      } else {
        return Math.abs(x);
      }
    } catch (e) {
      return NaN;
    }
  }
  var vabs2 = vectorize2(abs2);
  function add2() {
    try {
      let out22 = 0;
      let resultShouldBeABigInt = false;
      const x = Object.values(arguments);
      for (let v of x) {
        if (!isNumber2(v))
          return NaN;
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
          v = Number(v);
        }
        out22 += v;
      }
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  }
  var vadd2 = vectorize2(add2);
  function apply2(x, fn) {
    try {
      return fn(x);
    } catch (e) {
      return NaN;
    }
  }
  var vapply2 = vectorize2(apply2);
  function arccos2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.acos(x);
    } catch (e) {
      return NaN;
    }
  }
  var varccos2 = vectorize2(arccos2);
  function arcsin2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.asin(x);
    } catch (e) {
      return NaN;
    }
  }
  var varcsin2 = vectorize2(arcsin2);
  function arctan2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.atan(x);
    } catch (e) {
      return NaN;
    }
  }
  var varctan2 = vectorize2(arctan2);
  function argmax2(x, shouldDropNaNs) {
    if (isDataFrame2(x)) {
      const index = argmax2(x.values, shouldDropNaNs);
      return [x.index[index[0]], x.columns[index[1]]];
    }
    if (isSeries2(x)) {
      const index = argmax2(x.values, shouldDropNaNs);
      return x.index[index];
    }
    assert2(isArray2(x), "The `argmax` function only works on arrays, Series, and DataFrames!");
    try {
      const out22 = indexOf2(x, max2(x, shouldDropNaNs));
      if (out22) {
        if (out22.length === 0) {
          return void 0;
        } else if (out22.length === 1) {
          return out22[0];
        } else {
          return out22;
        }
      } else {
        return void 0;
      }
    } catch (e) {
      return void 0;
    }
  }
  function min2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs }).min;
  }
  function argmin2(x, shouldDropNaNs) {
    if (isDataFrame2(x)) {
      const index = argmin2(x.values, shouldDropNaNs);
      return [x.index[index[0]], x.columns[index[1]]];
    }
    if (isSeries2(x)) {
      const index = argmin2(x.values, shouldDropNaNs);
      return x.index[index];
    }
    assert2(isArray2(x), "The `argmin` function only works on arrays, Series, and DataFrames!");
    try {
      const out22 = indexOf2(x, min2(x, shouldDropNaNs));
      if (out22) {
        if (out22.length === 0) {
          return void 0;
        } else if (out22.length === 1) {
          return out22[0];
        } else {
          return out22;
        }
      } else {
        return void 0;
      }
    } catch (e) {
      return void 0;
    }
  }
  function cast2(value, type) {
    if (isDataFrame2(value) || isSeries2(value)) {
      return value.apply((item) => cast2(item, type));
    }
    if (isArray2(value)) {
      return value.map((v) => cast2(v, type));
    }
    if (type === "null") {
      return null;
    }
    if (type === "number") {
      if (isUndefined2(value)) {
        return NaN;
      }
      const booleanValue = cast2(value, "boolean");
      if (isBoolean2(booleanValue)) {
        return booleanValue ? 1 : 0;
      }
      try {
        JSON.parse(value);
      } catch (e) {
        const dateValue = cast2(value, "date");
        if (isDate2(dateValue)) {
          return dateValue.getTime();
        }
      }
      const out22 = parseFloat(value);
      if (isNaN(out22))
        return NaN;
      return out22;
    }
    if (type === "int") {
      const out22 = cast2(value, "number");
      return out22 >= 0 ? Math.floor(out22) : Math.ceil(out22);
    }
    if (type === "float") {
      return cast2(value, "number");
    }
    if (type === "bigint") {
      if (typeof value === "bigint") {
        return value;
      }
      return BigInt(cast2(value, "int"));
    }
    if (type === "boolean") {
      if (isBoolean2(value)) {
        return value;
      }
      if (isNumber2(value)) {
        if (value === 0) {
          return false;
        }
        if (value === 1) {
          return true;
        }
        return null;
      }
      try {
        const vBool = (typeof value === "object" ? value.toString() === "null" ? "false" : JSON.stringify(value) : value.toString()).trim().toLowerCase();
        if (vBool === "true" || vBool === "yes" || vBool === "y") {
          return true;
        }
        if (vBool === "false" || vBool === "no" || vBool === "n") {
          return false;
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    if (type === "date") {
      if (isDate2(value)) {
        return value;
      }
      if (isUndefined2(value)) {
        return null;
      }
      const valueFloat = parseFloat(value);
      if (!isNaN(valueFloat)) {
        const out22 = new Date(value);
        if (!isDate2(out22))
          return null;
        return out22;
      }
      const valueDate = Date.parse(value);
      if (!isNaN(valueDate)) {
        return new Date(valueDate);
      }
      return null;
    }
    if (type === "object") {
      if (isObject2(value)) {
        return value;
      }
      const booleanValue = cast2(value, "boolean");
      if (isBoolean2(booleanValue)) {
        return null;
      }
      try {
        const numberValue = cast2(value, "number");
        if (isNumber2(numberValue)) {
          JSON.parse(value);
          return null;
        }
      } catch (e) {
      }
      const dateValue = cast2(value, "date");
      if (dateValue) {
        return dateValue;
      }
      try {
        const out22 = JSON.parse(value);
        if (isArray2(out22)) {
          return out22.map((v) => cast2(v, type));
        } else {
          return out22;
        }
      } catch (e) {
        return null;
      }
    }
    if (type === "string") {
      if (isUndefined2(value)) {
        if (isEqual2(value, void 0)) {
          return "undefined";
        }
        return "null";
      }
      if (value instanceof Date) {
        return value.toJSON();
      }
      const valueString = (() => {
        if (typeof value === "object") {
          if (value === null) {
            return "null";
          } else {
            return JSON.stringify(value);
          }
        } else {
          return value.toString();
        }
      })();
      return valueString;
    }
  }
  function ceil2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint")
        return x;
      return Math.ceil(x);
    } catch (e) {
      return NaN;
    }
  }
  var vceil2 = vectorize2(ceil2);
  function chop2(x, threshold) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint")
        return x;
      if (isUndefined2(threshold)) {
        threshold = 1e-10;
      } else if (!isNumber2(threshold)) {
        return NaN;
      }
      return vabs2(x) < threshold ? 0 : x;
    } catch (e) {
      return NaN;
    }
  }
  var vchop2 = vectorize2(chop2);
  function int2(x) {
    if (isDataFrame2(x) || isSeries2(x)) {
      const out22 = x.copy();
      out22.values = int2(out22.values);
      return out22;
    }
    if (isArray2(x)) {
      return x.map((v) => int2(v));
    } else {
      try {
        const out22 = JSON.parse(x);
        if (isNumber2(out22)) {
          return typeof out22 === "bigint" ? Number(out22) : out22 >= 0 ? Math.floor(out22) : Math.ceil(out22);
        }
        return NaN;
      } catch (e) {
        return NaN;
      }
    }
  }
  var vint2 = vectorize2(int2);
  function clamp2(x, a, b) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (!isNumber2(a))
        return NaN;
      if (!isNumber2(b))
        return NaN;
      if (typeof x === "bigint") {
        return BigInt(clamp2(vint2(x), a, b));
      }
      if (x < a)
        return a;
      if (x > b)
        return b;
      return x;
    } catch (e) {
      return NaN;
    }
  }
  var vclamp2 = vectorize2(clamp2);
  function combinationsIterator2(x, r) {
    function* helper52(x2, r2) {
      if (r2 > x2.length) {
        yield x2;
      } else if (r2 <= 0) {
        yield [];
      } else if (x2.length < 2) {
        yield x2;
      } else {
        for (let i = 0; i < x2.length; i++) {
          const item = x2[i];
          const after = x2.slice(i + 1);
          if (after.length < r2 - 1) {
            continue;
          }
          if (r2 - 1 >= 0) {
            for (const child of combinationsIterator2(after, r2 - 1)) {
              yield [item].concat(child);
            }
          }
        }
      }
    }
    if (isDataFrame2(x) || isSeries2(x)) {
      return combinationsIterator2(x.values, r);
    }
    assert2(isArray2(x), "The `combinations` function only works on arrays, Series, and DataFrames!");
    assert2(isNumber2(r) && vint2(r) === r && r >= 0, "`r` must be a non-negative integer!");
    return helper52(flatten2(x), r);
  }
  function combinations2(x, r) {
    const out22 = [];
    for (const combo of combinationsIterator2(x, r)) {
      out22.push(combo.slice());
    }
    return out22;
  }
  function intersect2() {
    const arrays = Object.values(arguments).map((x) => {
      if (isDataFrame2(x) || isSeries2(x)) {
        return set2(x.values);
      }
      assert2(isArray2(x), "The `intersect` function only works on arrays, Series, and DataFrames!");
      return set2(x);
    });
    const all = set2(arrays);
    return all.filter((v) => {
      return arrays.every((arr) => arr.findIndex((other) => isEqual2(other, v)) > -1);
    });
  }
  var _IndexMatcher2 = class {
    constructor(mode22) {
      assert2(isUndefined2(mode22) || mode22 === _IndexMatcher2.DROP_NAN_MODE || mode22 === _IndexMatcher2.DROP_MISSING_MODE, "The `mode` value passed into the `IndexMatcher` constructor must be undefined or one of [IndexMatcher.DROP_NAN_MODE, IndexMatcher.DROP_MISSING_MODE]! (By default, the mode is `Indexer.DROP_MISSING_MODE`.)");
      this.mode = !isUndefined2(mode22) ? mode22 : _IndexMatcher2.DROP_NAN_MODE;
      this.index = null;
    }
    fit() {
      const indices = [];
      Object.values(arguments).forEach((x) => {
        if (isArray2(x)) {
          const xshape = shape2(x);
          if (xshape.length === 1) {
            x = new Series2(x);
          } else if (xshape.length === 2) {
            x = new DataFrame2(x);
          } else {
            throw new Error("The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
          }
        }
        assert2(isDataFrame2(x) || isSeries2(x), "The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
        if (this.mode === _IndexMatcher2.DROP_MISSING_MODE) {
          indices.push(x.dropMissing().index);
        } else {
          indices.push(x.dropNaN().index);
        }
      });
      this.index = intersect2(...indices);
      return this;
    }
    transform() {
      assert2(!!this.index, "The IndexMatcher hasn't been fitted yet! Please call the `fit` method before calling the `transform` method.");
      const out22 = Object.values(arguments).map((x) => {
        if (isArray2(x)) {
          const xshape = shape2(x);
          if (xshape.length === 1) {
            return new Series2(x).get(this.index).values;
          } else if (xshape.length === 2) {
            return new DataFrame2(x).get(this.index, null).values;
          } else {
            throw new Error("The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
          }
        }
        assert2(isDataFrame2(x) || isSeries2(x), "The `IndexMatcher.fit` method only works on arrays, Series, and DataFrames!");
        return x.get(this.index, null);
      });
      return out22.length === 1 ? out22[0] : out22;
    }
    fitAndTransform() {
      return this.fit(...arguments).transform(...arguments);
    }
  };
  var IndexMatcher2 = _IndexMatcher2;
  __publicField2(IndexMatcher2, "DROP_NAN_MODE", "DROP_NAN_MODE");
  __publicField2(IndexMatcher2, "DROP_MISSING_MODE", "DROP_MISSING_MODE");
  function covariance2(x, y, shouldDropNaNs, shouldAlsoReturnStatsObjects) {
    if (isSeries2(x)) {
      return covariance2(x.values, y, shouldDropNaNs, shouldAlsoReturnStatsObjects);
    }
    if (isSeries2(y)) {
      return covariance2(x, y.values, shouldDropNaNs, shouldAlsoReturnStatsObjects);
    }
    assert2(isArray2(x) && isArray2(y) && shape2(x).length === 1 && shape2(y).length === 1, "The `covariance` function only works on 1-dimensional arrays and Series!");
    assert2(x.length === y.length, "The two arrays or Series passed into the `covariance` function must have the same length!");
    if (shouldDropNaNs) {
      return covariance2(...new IndexMatcher2().fitAndTransform(x, y), false, shouldAlsoReturnStatsObjects);
    }
    try {
      const xstats = stats2(x, { stdev: shouldAlsoReturnStatsObjects });
      const ystats = stats2(y, { stdev: shouldAlsoReturnStatsObjects });
      const mx = Number(xstats.mean);
      const my = Number(ystats.mean);
      if (!isNumber2(mx) || !isNumber2(my)) {
        return NaN;
      }
      const n = Math.max(x.length, y.length);
      let out22 = 0;
      for (let i = 0; i < n; i++) {
        let vx = x[i];
        let vy = y[i];
        if (!isNumber2(vx))
          return NaN;
        if (!isNumber2(vy))
          return NaN;
        if (typeof vx === "bigint") {
          vx = Number(vx);
        }
        if (typeof vy === "bigint") {
          vy = Number(vy);
        }
        out22 += (vx - mx) * (vy - my);
      }
      if (shouldAlsoReturnStatsObjects) {
        return [out22 / x.length, xstats, ystats];
      } else {
        return out22 / x.length;
      }
    } catch (e) {
      return NaN;
    }
  }
  function correl2(x, y, shouldDropNaNs) {
    if (isSeries2(x)) {
      return correl2(x.values, y, shouldDropNaNs);
    }
    if (isSeries2(y)) {
      return correl2(x, y.values, shouldDropNaNs);
    }
    assert2(isArray2(x) && isArray2(y) && shape2(x).length === 1 && shape2(y).length === 1, "The `correl` function only works on 1-dimensional arrays and Series!");
    assert2(x.length === y.length, "The two arrays or Series passed into the `correl` function must have the same length!");
    try {
      const shouldAlsoReturnStatsObjects = true;
      const [num, xstats, ystats] = covariance2(x, y, shouldDropNaNs, shouldAlsoReturnStatsObjects);
      const den = xstats.stdev * ystats.stdev;
      return num / den;
    } catch (e) {
      return NaN;
    }
  }
  function cos2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.cos(x);
    } catch (e) {
      return NaN;
    }
  }
  var vcos2 = vectorize2(cos2);
  var dataTypes2 = Object.freeze({
    boolean: "boolean",
    date: "date",
    null: "null",
    number: "number",
    object: "object",
    string: "string"
  });
  function diff2(a, b) {
    if (isDataFrame2(a) || isSeries2(a)) {
      return diff2(a.values, b);
    }
    if (isDataFrame2(b) || isSeries2(b)) {
      return diff2(a, b.values);
    }
    assert2(isArray2(a) && isArray2(b), "The `diff` function only works on arrays, Series, and DataFrames!");
    const aTemp = set2(a);
    const bTemp = set2(b);
    const out22 = [];
    aTemp.forEach((item) => {
      if (bTemp.findIndex((other) => isEqual2(other, item)) < 0) {
        out22.push(item);
      }
    });
    return out22;
  }
  function pow2(x, p) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (!isNumber2(p))
        return NaN;
      if (typeof x === "bigint" || typeof p === "bigint") {
        const out22 = pow2(Number(x), Number(p));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return Math.pow(x, p);
    } catch (e) {
      return NaN;
    }
  }
  var vpow2 = vectorize2(pow2);
  function sqrt2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        const out22 = sqrt2(Number(x));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return Math.sqrt(x);
    } catch (e) {
      return NaN;
    }
  }
  var vsqrt2 = vectorize2(sqrt2);
  function multiply2() {
    try {
      const x = Object.values(arguments);
      if (x.length === 0)
        return NaN;
      let resultShouldBeABigInt = false;
      let out22 = 1;
      for (let v of x) {
        if (!isNumber2(v))
          return NaN;
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
          v = Number(v);
        }
        out22 *= v;
      }
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  }
  var vmultiply2 = vectorize2(multiply2);
  function scale2() {
    return vmultiply2(...arguments);
  }
  function subtract2(a, b) {
    return vadd2(a, scale2(b, -1));
  }
  function sum2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs }).sum;
  }
  function distance2(a, b) {
    if (isNumber2(a) && isNumber2(b)) {
      return vabs2(a - b);
    }
    if (isDataFrame2(a) || isSeries2(a)) {
      return distance2(a.values, b);
    }
    if (isDataFrame2(b) || isSeries2(b)) {
      return distance2(a, b.values);
    }
    if (isArray2(a) && isArray2(b)) {
      assert2(isEqual2(shape2(a), shape2(b)), "If passing two arrays, Series, or DataFrames into the `distance` function, then those objects must have the same shape!");
    }
    try {
      return vsqrt2(sum2(vpow2(subtract2(a, b), 2)));
    } catch (e) {
      return NaN;
    }
  }
  function divide2(a, b) {
    return scale2(a, vpow2(b, -1));
  }
  function dot2(a, b) {
    if (isDataFrame2(a)) {
      const temp = dot2(a.values, b);
      if (shape2(temp).length === 1) {
        const out22 = new Series2(temp);
        out22.name = isSeries2(b) ? b.name : out22.name;
        out22.index = a.index.slice();
        return out22;
      } else {
        const out22 = new DataFrame2(temp);
        out22.index = a.index.slice();
        if (isDataFrame2(b)) {
          out22.columns = b.columns.slice();
        }
        return out22;
      }
    }
    if (isDataFrame2(b)) {
      const temp = dot2(a, b.values);
      if (shape2(temp).length === 1) {
        const out22 = new Series2(temp);
        out22.name = isSeries2(a) ? a.name : out22.name;
        out22.index = b.columns.slice();
        return out22;
      } else {
        const out22 = new DataFrame2(temp);
        out22.columns = b.columns.slice();
        return out22;
      }
    }
    if (isSeries2(a)) {
      return dot2(a.values, b);
    }
    if (isSeries2(b)) {
      return dot2(a, b.values);
    }
    assert2(isArray2(a) && isArray2(b), "The `dot` function only works on arrays, Series, and DataFrames!");
    const aShape = shape2(a);
    const bShape = shape2(b);
    assert2(aShape.length <= 2 && bShape.length <= 2, "I'm not smart enough to know how to get the dot-product of arrays that have more than 2 dimensions. Sorry for the inconvenience! Please only pass 1- or 2-dimensional arrays into the `dot` function!");
    assert2(aShape[aShape.length - 1] === bShape[0], `There's a dimension misalignment in the two arrays you passed into the \`dot\` function. (${aShape[aShape.length - 1]} !== ${bShape[0]})`);
    if (aShape.length === 1 && bShape.length === 1) {
      return sum2(scale2(a, b));
    } else if (aShape.length === 1 && bShape.length === 2) {
      return transpose2(b).map((col) => dot2(a, col));
    } else if (aShape.length === 2 && bShape.length === 1) {
      return a.map((row) => dot2(row, b));
    } else if (aShape.length === 2 && bShape.length === 2) {
      const bTranspose = transpose2(b);
      const out22 = [];
      for (let i = 0; i < a.length; i++) {
        const row = [];
        for (let j = 0; j < bTranspose.length; j++) {
          row.push(dot2(a[i], bTranspose[j]));
        }
        out22.push(row);
      }
      return out22;
    }
  }
  function dropMissing2(x) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return x.dropMissing(...Object.values(arguments).slice(1));
    }
    assert2(isArray2(x), "The `dropMissing` function only works on arrays, Series, and DataFrames!");
    const out22 = [];
    x.forEach((v) => {
      try {
        return out22.push(dropMissing2(v));
      } catch (e) {
        if (!isUndefined2(v)) {
          out22.push(v);
        }
      }
    });
    return out22;
  }
  function dropMissingPairwise2(a, b) {
    if (isDataFrame2(a) || isSeries2(a)) {
      return dropMissingPairwise2(a.values, b);
    }
    if (isDataFrame2(b) || isSeries2(b)) {
      return dropMissingPairwise2(a, b.values);
    }
    assert2(isArray2(a) && isArray2(b), "The `dropMissingPairwise` function only works on arrays, Series, and DataFrames!");
    assert2(isEqual2(shape2(a), shape2(b)), "The two arrays, Series, and/or DataFrames passed into the `dropMissingPairwise` function must have the same shape!");
    const aOut = [];
    const bOut = [];
    for (let i = 0; i < a.length; i++) {
      try {
        const [aChildren, bChildren] = dropMissingPairwise2(a[i], b[i]);
        aOut.push(aChildren);
        bOut.push(bChildren);
      } catch (e) {
        if (!isUndefined2(a[i]) && !isUndefined2(b[i])) {
          aOut.push(a[i]);
          bOut.push(b[i]);
        }
      }
    }
    return [aOut, bOut];
  }
  function dropNaNPairwise2(a, b) {
    if (isDataFrame2(a) || isSeries2(a)) {
      return dropNaNPairwise2(a.values, b);
    }
    if (isDataFrame2(b) || isSeries2(b)) {
      return dropNaNPairwise2(a, b.values);
    }
    assert2(isArray2(a) && isArray2(b), "The `dropNaNPairwise` only works on arrays, Series, and DataFrames!");
    assert2(isEqual2(shape2(a), shape2(b)), "The two arrays, Series, and/or DataFrames passed into the `dropNaNPairwise` must have the same shape!");
    const aOut = [];
    const bOut = [];
    for (let i = 0; i < a.length; i++) {
      try {
        const [aChildren, bChildren] = dropNaNPairwise2(a[i], b[i]);
        aOut.push(aChildren);
        bOut.push(bChildren);
      } catch (e) {
        if (isNumber2(a[i]) && isNumber2(b[i])) {
          aOut.push(a[i]);
          bOut.push(b[i]);
        }
      }
    }
    return [aOut, bOut];
  }
  function dropUndefined2(x) {
    return dropMissing2(x);
  }
  function every2(x, fn) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return every2(x.values, fn);
    }
    assert2(isArray2(x), "The first argument passed into the `every` function must be an array, Series, or DataFrame!");
    assert2(isFunction2(fn), "The second argument passed into the `every` function must be a function!");
    for (const v of x) {
      if (isArray2(v)) {
        if (!every2(v, fn)) {
          return false;
        }
      } else {
        if (!fn(v)) {
          return false;
        }
      }
    }
    return true;
  }
  function exp2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        if (x === 0n) {
          return 1n;
        } else {
          x = Number(x);
        }
      }
      return Math.exp(x);
    } catch (e) {
      return NaN;
    }
  }
  var vexp2 = vectorize2(exp2);
  function factorial2(n) {
    try {
      if (typeof n === "bigint") {
        return BigInt(factorial2(vint2(n)));
      }
      if (n !== vint2(n))
        return NaN;
      if (n <= 1)
        return 1;
      return n * factorial2(n - 1);
    } catch (e) {
      return NaN;
    }
  }
  var vfactorial2 = vectorize2(factorial2);
  function find2(x, fn) {
    if (isDataFrame2(x)) {
      return find2(x.values, fn);
    }
    if (isSeries2(x)) {
      return find2(x.values, fn);
    }
    assert2(isObject2(x) || isArray2(x), "You must pass (1) an object, array, Series, or DataFrame and (2) a function or value into the `find` function!");
    if (!isFunction2(fn)) {
      const value = fn;
      fn = (v) => v === value;
    }
    function helper52(x2, fn2, checked) {
      checked = checked || [];
      if (checked.indexOf(x2) > -1) {
        return null;
      }
      if (isObject2(x2)) {
        checked.push(x2);
        const keys = Object.keys(x2).concat(Object.getOwnPropertySymbols(x2));
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = x2[key];
          if (fn2(value)) {
            return value;
          }
          const result = helper52(value, fn2, checked);
          if (result) {
            return result;
          }
        }
      } else if (isArray2(x2)) {
        checked.push(x2);
        for (let i = 0; i < x2.length; i++) {
          const value = x2[i];
          if (fn2(value)) {
            return value;
          }
          const result = helper52(value, fn2, checked);
          if (result) {
            return result;
          }
        }
      } else {
        if (fn2(x2)) {
          return x2;
        }
      }
      return null;
    }
    function safeFn(v) {
      try {
        return fn(v);
      } catch (e) {
        return false;
      }
    }
    return helper52(x, safeFn);
  }
  function findAll2(x, fn) {
    if (isDataFrame2(x)) {
      return findAll2(x.values, fn);
    }
    if (isSeries2(x)) {
      return findAll2(x.values, fn);
    }
    assert2(isObject2(x) || isArray2(x), "You must pass (1) an object, array, Series, or DataFrame and (2) a function or value into the `findAll` function!");
    if (!isFunction2(fn)) {
      const value = fn;
      fn = (v) => v === value;
    }
    function helper52(x2, fn2, checked) {
      checked = checked || [];
      if (checked.indexOf(x2) > -1) {
        return null;
      }
      if (isObject2(x2)) {
        checked.push(x2);
        const keys = Object.keys(x2).concat(Object.getOwnPropertySymbols(x2));
        const out22 = [];
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = x2[key];
          let alreadyStoredThisValue = false;
          if (fn2(value)) {
            out22.push(value);
            alreadyStoredThisValue = true;
          }
          const results2 = helper52(value, fn2, checked);
          if (results2 && results2.length > 0) {
            results2.slice(alreadyStoredThisValue ? 1 : 0).forEach((r) => out22.push(r));
          }
        }
        return out22;
      } else if (isArray2(x2)) {
        checked.push(x2);
        const out22 = [];
        for (let i = 0; i < x2.length; i++) {
          const value = x2[i];
          let alreadyStoredThisValue = false;
          if (fn2(value)) {
            out22.push(value);
            alreadyStoredThisValue = true;
          }
          const results2 = helper52(value, fn2, checked);
          if (results2 && results2.length > 0) {
            results2.slice(alreadyStoredThisValue ? 1 : 0).forEach((r) => out22.push(r));
          }
        }
        return out22;
      } else {
        if (fn2(x2)) {
          return [x2];
        }
      }
      return null;
    }
    function safeFn(v) {
      try {
        return fn(v);
      } catch (e) {
        return false;
      }
    }
    const results = helper52(x, safeFn);
    if (results && results.length > 0) {
      return results;
    } else {
      return null;
    }
  }
  function float2(x) {
    try {
      if (x === "Infinity") {
        return Infinity;
      }
      if (x === "-Infinity") {
        return -Infinity;
      }
      const out22 = JSON.parse(x);
      if (isNumber2(out22))
        return out22;
      return NaN;
    } catch (e) {
      return NaN;
    }
  }
  var vfloat2 = vectorize2(float2);
  function floor2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        return x;
      }
      return Math.floor(x);
    } catch (e) {
      return NaN;
    }
  }
  var vfloor2 = vectorize2(floor2);
  function zeros2(shape22) {
    if (isNumber2(shape22))
      shape22 = [shape22];
    const out22 = [];
    const n = product2(shape22);
    for (let i = 0; i < n; i++)
      out22.push(0);
    return reshape2(out22, shape22);
  }
  function identity2(size) {
    if (typeof size === "bigint") {
      size = vint2(size);
    }
    assert2(!isUndefined2(size), "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    assert2(isNumber2(size), "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    assert2(vint2(size) === size, "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    assert2(size > 0, "You must pass an integer greater than 0 (representing the size) into the `identity` function!");
    const out22 = zeros2([size, size]);
    for (let i = 0; i < size; i++)
      out22[i][i] = 1;
    return out22;
  }
  var booleanValues2 = ["true", "false", "yes", "no"];
  var nullValues2 = ["null", "none", "nan", "na", "n/a", "", "undefined"];
  function checkIfInteger2(results) {
    if (results.type === "number") {
      if (typeof results.value !== "undefined") {
        results.isInteger = vint2(results.value) === results.value;
      } else {
        results.isInteger = every2(results.values, (v) => isNumber2(v) ? vint2(v) === v : true);
      }
    }
    return results;
  }
  function inferType2(arr) {
    if (isDataFrame2(arr)) {
      const out22 = arr.copy();
      const results = inferType2(arr.values);
      out22.values = results.values;
      return checkIfInteger2({ type: results.type, values: out22 });
    }
    if (isSeries2(arr)) {
      const out22 = arr.copy();
      const results = inferType2(arr.values);
      out22.values = results.values;
      return checkIfInteger2({ type: results.type, values: out22 });
    }
    if (!isArray2(arr)) {
      const out22 = inferType2([arr]);
      out22.value = out22.values[0];
      delete out22.values;
      return checkIfInteger2(out22);
    }
    assert2(isArray2(arr), "The `inferType` function only works on arrays, Series, and DataFrames!");
    const types = flatten2(arr).map((v) => {
      if (v === void 0)
        return "null";
      try {
        if (typeof v === "object") {
          const temp = new Date(v.getTime());
          if (isDate2(temp)) {
            return "date";
          }
        }
      } catch (e) {
      }
      if (!isString2(v)) {
        if (typeof v === "bigint") {
          v = v.toString() + "n";
        } else {
          v = JSON.stringify(v);
        }
      }
      const vLower = v.toLowerCase();
      const vLowerTrimmed = vLower.trim();
      if (nullValues2.indexOf(vLowerTrimmed) > -1) {
        return "null";
      }
      if (booleanValues2.indexOf(vLowerTrimmed) > -1) {
        return "boolean";
      }
      try {
        if (v.match(/^-?\d+n$/g)) {
          return "bigint";
        }
        const vParsed = JSON.parse(v);
        if (isNumber2(vParsed)) {
          return "number";
        }
        if (typeof vParsed === "object") {
          if (isArray2(vParsed))
            return "string";
          return "object";
        }
        return "string";
      } catch (e) {
        const vDate = new Date(v);
        if (isDate2(vDate)) {
          return "date";
        }
        return "string";
      }
    });
    const counts = count2(types);
    const sortedValues = counts.values.toSorted((a, b) => counts.get(b) - counts.get(a));
    const primaryType = sortedValues[0];
    return checkIfInteger2({
      type: primaryType,
      values: vapply2(arr, (v) => cast2(v, primaryType))
    });
  }
  function inverse2(x) {
    if (isDataFrame2(x)) {
      const out22 = x.copy();
      out22.values = inverse2(out22.values);
      return out22;
    }
    assert2(isArray2(x), "The `inverse` function only works on square 2-dimensional arrays or DataFrames!");
    const xShape = shape2(x);
    assert2(xShape.length === 2, "The array passed into the `inverse` function must be exactly two-dimensional and square!");
    assert2(xShape[0] === xShape[1], "The array passed into the `inverse` function must be exactly two-dimensional and square!");
    assert2(xShape[0] >= 0, "The array passed into the `inverse` function must be exactly two-dimensional and square!");
    if (xShape[0] === 0) {
      return x;
    } else if (xShape[0] === 1) {
      assert2(x[0][0] !== 0, "This matrix cannot be inverted!");
      let v = x[0][0];
      if (typeof v === "bigint")
        v = Number(v);
      return 1 / v;
    } else if (xShape[0] === 2) {
      let a = x[0][0];
      let b = x[0][1];
      let c = x[1][0];
      let d = x[1][1];
      if (typeof a === "bigint")
        a = Number(a);
      if (typeof b === "bigint")
        b = Number(b);
      if (typeof c === "bigint")
        c = Number(c);
      if (typeof d === "bigint")
        d = Number(d);
      const det = a * d - b * c;
      assert2(det !== 0, "This matrix cannot be inverted!");
      const out22 = [
        [d, -b],
        [-c, a]
      ];
      return scale2(out22, 1 / det);
    } else if (xShape[0] > 1) {
      const times = (a, b) => isNumber2(a) || isNumber2(b) ? scale2(a, b) : dot2(a, b);
      for (let divider = 1; divider < xShape[0] - 1; divider++) {
        try {
          const A = x.slice(0, divider).map((row) => row.slice(0, divider));
          const B = x.slice(0, divider).map((row) => row.slice(divider, xShape[0]));
          const C = x.slice(divider, xShape[0]).map((row) => row.slice(0, divider));
          const D = x.slice(divider, xShape[0]).map((row) => row.slice(divider, xShape[0]));
          const AInv = inverse2(A);
          const CompInv = inverse2(vadd2(D, times(-1, times(times(C, AInv), B))));
          const topLeft = vadd2(AInv, times(times(times(times(AInv, B), CompInv), C), AInv));
          const topRight = times(-1, times(times(AInv, B), CompInv));
          const bottomLeft = times(-1, times(times(CompInv, C), AInv));
          const bottomRight = CompInv;
          const out22 = topLeft.map((row, i) => row.concat(topRight[i])).concat(bottomLeft.map((row, i) => row.concat(bottomRight[i])));
          return out22;
        } catch (e) {
        }
      }
      assert2(false, "This matrix cannot be inverted!");
    }
  }
  var isBrowser22 = new Function(`
    try {
      return this === window
    } catch(e) {}

    try {
      return !!importScripts
    } catch(e){}

    return false
  `);
  function lerp2(a, b, f) {
    try {
      if (!isNumber2(a))
        return NaN;
      if (!isNumber2(b))
        return NaN;
      if (!isNumber2(f))
        return NaN;
      if (typeof a === "bigint" || typeof b === "bigint") {
        const out22 = lerp2(Number(a), Number(b), f);
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return f * (b - a) + a;
    } catch (e) {
      return NaN;
    }
  }
  var vlerp2 = vectorize2(lerp2);
  function log2(x, base) {
    try {
      base = isUndefined2(base) ? Math.E : base;
      if (!isNumber2(x))
        return NaN;
      if (!isNumber2(base))
        return NaN;
      if (typeof x === "bigint" || typeof base === "bigint") {
        const out22 = log2(Number(x), Number(base));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return Math.log(x) / Math.log(base);
    } catch (e) {
      return NaN;
    }
  }
  var vlog2 = vectorize2(log2);
  function mean2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs }).mean;
  }
  function median2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs, median: true }).median;
  }
  function mod2(a, b) {
    try {
      if (!isNumber2(a))
        return NaN;
      if (!isNumber2(b))
        return NaN;
      if (typeof a === "bigint" || typeof b === "bigint") {
        const out22 = mod2(Number(a), Number(b));
        try {
          return BigInt(out22);
        } catch (e) {
          return out22;
        }
      }
      return a % b;
    } catch (e) {
      return NaN;
    }
  }
  var vmod2 = vectorize2(mod2);
  function mode2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs, mode: true }).mode;
  }
  function helper32() {
    const u1 = random2();
    const u2 = random2();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
  function normal2(shape22) {
    if (isUndefined2(shape22))
      return helper32();
    return vapply2(ndarray2(shape22), helper32);
  }
  function ones2(shape22) {
    return vapply2(ndarray2(shape22), () => 1);
  }
  function permutationsIterator2(x, r) {
    function* helper52(x2, r2) {
      r2 = r2 || x2.length;
      if (x2.length === 1) {
        yield [x2];
        return;
      }
      for (const c of combinations2(x2, r2)) {
        if (!c.slice)
          continue;
        const state = zeros2(c.length);
        yield c;
        let i = 1;
        while (i < c.length) {
          if (state[i] < i) {
            if (i % 2 === 0) {
              const buf = c[0];
              c[0] = c[i];
              c[i] = buf;
            } else {
              const buf = c[state[i]];
              c[state[i]] = c[i];
              c[i] = buf;
            }
            yield c;
            state[i] += 1;
            i = 1;
          } else {
            state[i] = 0;
            i += 1;
          }
        }
      }
    }
    if (isDataFrame2(x) || isSeries2(x)) {
      return permutationsIterator2(x.values, r);
    }
    assert2(isArray2(x), "The `permutations` function only works on arrays, Series, and DataFrames!");
    if (isUndefined2(r)) {
      r = x.length;
    }
    assert2(isNumber2(r) && vint2(r) === r && r >= 0, "`r` must be a non-negative integer!");
    return helper52(flatten2(x), r);
  }
  function permutations2(x, r) {
    const out22 = [];
    for (const perm of permutationsIterator2(x, r)) {
      out22.push(perm.slice());
    }
    return out22;
  }
  function print2() {
    Object.keys(arguments).forEach((key) => {
      const x = arguments[key];
      if (isArray2(x)) {
        if (!isJagged2(x)) {
          const xShape = shape2(x);
          if (xShape.length === 1) {
            new Series2(x).print();
          } else if (xShape.length == 2) {
            new DataFrame2(x).print();
          } else {
            console.log(x);
          }
        } else {
          console.log(x);
        }
      } else if (isDataFrame2(x) || isSeries2(x)) {
        x.print();
      } else {
        console.log(x);
      }
    });
  }
  var helper42 = vectorize2((x, a, b, c, d) => {
    try {
      let resultShouldBeABigInt = false;
      for (const v of [x, a, b, c, d]) {
        if (!isNumber2(v)) {
          return NaN;
        }
        if (typeof v === "bigint") {
          resultShouldBeABigInt = true;
        }
      }
      if (resultShouldBeABigInt) {
        x = Number(x);
        a = Number(a);
        b = Number(b);
        c = Number(c);
        d = Number(d);
      }
      const num = (d - c) * (x - a);
      const den = b - a;
      if (den === 0)
        return NaN;
      const out22 = num / den + c;
      if (resultShouldBeABigInt) {
        try {
          return BigInt(out22);
        } catch (e) {
        }
      }
      return out22;
    } catch (e) {
      return NaN;
    }
  });
  function remap2(x, a, b, c, d) {
    if (isArray2(x) && isUndefined2(c) && isUndefined2(d)) {
      c = a;
      d = b;
      const results = stats2(x);
      a = results.min;
      b = results.max;
    }
    return helper42(x, a, b, c, d);
  }
  function round2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint")
        return x;
      return Math.round(x);
    } catch (e) {
      return NaN;
    }
  }
  var vround2 = vectorize2(round2);
  function sign2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint")
        return BigInt(sign2(Number(x)));
      if (x < 0)
        return -1;
      if (x > 0)
        return 1;
      return 0;
    } catch (e) {
      return NaN;
    }
  }
  var vsign2 = vectorize2(sign2);
  function sin2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.sin(x);
    } catch (e) {
      return NaN;
    }
  }
  var vsin2 = vectorize2(sin2);
  function some2(x, fn) {
    if (isDataFrame2(x) || isSeries2(x)) {
      return some2(x.values, fn);
    }
    assert2(isArray2(x), "The first argument passed into the `some` function must be an array, Series, or DataFrame!");
    assert2(isFunction2(fn), "The second argument passed into the `some` function must be a function!");
    for (const v of x) {
      if (isArray2(v)) {
        if (some2(v, fn)) {
          return true;
        }
      } else {
        if (fn(v)) {
          return true;
        }
      }
    }
    return false;
  }
  function std2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs, stdev: true }).stdev;
  }
  function stdev2(x) {
    return std2(x);
  }
  function tan2(x) {
    try {
      if (!isNumber2(x))
        return NaN;
      if (typeof x === "bigint") {
        x = Number(x);
      }
      return Math.tan(x);
    } catch (e) {
      return NaN;
    }
  }
  var vtan2 = vectorize2(tan2);
  function timeSync2(fn, args) {
    assert2(isFunction2(fn), "`fn` must be a function!");
    const start = /* @__PURE__ */ new Date();
    if (args) {
      fn(...args);
    } else {
      fn();
    }
    return /* @__PURE__ */ new Date() - start;
  }
  async function timeAsync2(fn, args) {
    assert2(isFunction2(fn), "`fn` must be a function!");
    const start = /* @__PURE__ */ new Date();
    if (args) {
      await fn(...args);
    } else {
      await fn();
    }
    return /* @__PURE__ */ new Date() - start;
  }
  function union2() {
    return set2([...arguments].map((v) => {
      if (isArray2(v))
        return v;
      if (isDataFrame2(v))
        return v.values;
      if (isSeries2(v))
        return v.values;
      return [v];
    }));
  }
  function variance2(arr, shouldDropNaNs) {
    return stats2(arr, { shouldDropNaNs, variance: true }).variance;
  }
  function zip2() {
    const out22 = [];
    const arrays = Object.values(arguments).map((arr) => {
      if (isDataFrame2(arr) || isSeries2(arr)) {
        arr = arr.values;
      }
      assert2(isArray2(arr), "The `zip` function only works on arrays, Series, and DataFrames!");
      return arr;
    });
    range2(0, max2(arrays.map((arr) => arr.length))).forEach((i) => {
      const row = [];
      arrays.forEach((arr) => {
        const value = arr[i];
        row.push(isUndefined2(value) ? void 0 : value);
      });
      out22.push(row);
    });
    return out22;
  }
  var out2 = {
    abs: vabs2,
    add: vadd2,
    apply: vapply2,
    arccos: varccos2,
    arcsin: varcsin2,
    arctan: varctan2,
    argmax: argmax2,
    argmin: argmin2,
    assert: assert2,
    cast: cast2,
    ceil: vceil2,
    chop: vchop2,
    clamp: vclamp2,
    combinations: combinations2,
    combinationsIterator: combinationsIterator2,
    copy: copy2,
    correl: correl2,
    cos: vcos2,
    count: count2,
    covariance: covariance2,
    DataFrame: DataFrame2,
    dataTypes: dataTypes2,
    decycle: decycle2,
    diff: diff2,
    distance: distance2,
    divide: divide2,
    dot: dot2,
    dropMissing: dropMissing2,
    dropMissingPairwise: dropMissingPairwise2,
    dropNaN: dropNaN2,
    dropNaNPairwise: dropNaNPairwise2,
    dropUndefined: dropUndefined2,
    every: every2,
    exp: vexp2,
    factorial: vfactorial2,
    find: find2,
    findAll: findAll2,
    flatten: flatten2,
    float: vfloat2,
    floor: vfloor2,
    identity: identity2,
    IndexMatcher: IndexMatcher2,
    indexOf: indexOf2,
    inferType: inferType2,
    int: vint2,
    intersect: intersect2,
    inverse: inverse2,
    isArray: isArray2,
    isBoolean: isBoolean2,
    isBrowser: isBrowser22,
    isDataFrame: isDataFrame2,
    isDate: isDate2,
    isEqual: isEqual2,
    isFunction: isFunction2,
    isJagged: isJagged2,
    isNested: isNested2,
    isNumber: isNumber2,
    isObject: isObject2,
    isSeries: isSeries2,
    isString: isString2,
    isUndefined: isUndefined2,
    lerp: vlerp2,
    log: vlog2,
    MathError: MathError2,
    max: max2,
    mean: mean2,
    median: median2,
    min: min2,
    mod: vmod2,
    mode: mode2,
    multiply: vmultiply2,
    ndarray: ndarray2,
    normal: normal2,
    ones: ones2,
    permutations: permutations2,
    permutationsIterator: permutationsIterator2,
    pow: vpow2,
    print: print2,
    product: product2,
    random: random2,
    range: range2,
    remap: remap2,
    reshape: reshape2,
    reverse: reverse2,
    round: vround2,
    scale: scale2,
    seed: seed2,
    Series: Series2,
    set: set2,
    shape: shape2,
    shuffle: shuffle2,
    sign: vsign2,
    sin: vsin2,
    some: some2,
    sort: sort2,
    sqrt: vsqrt2,
    stats: stats2,
    std: std2,
    stdev: stdev2,
    subtract: subtract2,
    sum: sum2,
    tan: vtan2,
    timeAsync: timeAsync2,
    timeSync: timeSync2,
    time: timeSync2,
    transpose: transpose2,
    union: union2,
    variance: variance2,
    vectorize: vectorize2,
    zeros: zeros2,
    zip: zip2,
    dump() {
      const context2 = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : void 0;
      if (!context2) {
        throw new out2.MathError("Cannot dump functions into global scope because none of `globalThis`, `global`, `window`, or `self` exist in the current context!");
      }
      Object.keys(out2).forEach((key) => {
        try {
          Object.defineProperty(context2, key, {
            configurable: false,
            enumerable: true,
            writable: false,
            value: out2[key]
          });
        } catch (e) {
          context2[key] = out2[key];
        }
      });
    }
  };
  if (typeof window !== "undefined") {
    window.JSMathTools = out2;
  }
  var context = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : void 0;
  function convertObjectToTypedArray(x) {
    const typedArrayConstructorSymbol = Symbol.for("@TypedArrayConstructor");
    const typedArrayConstructorString = "Symbol(@TypedArrayConstructor)";
    const typedArrayConstructorKey = typedArrayConstructorSymbol in x ? typedArrayConstructorSymbol : typedArrayConstructorString in x ? typedArrayConstructorString : void 0;
    if (typedArrayConstructorKey) {
      if (!("values" in x)) {
        throw new Error("The value passed into the `convertObjectToTypedArray` must have a 'values' property!");
      }
      if (x[typedArrayConstructorKey] === "ArrayBuffer") {
        return new Uint8Array(x.values).buffer;
      }
      return new context[x[typedArrayConstructorKey]](x.values);
    }
    if (isArray2(x) && x.constructor.name === "Array") {
      return x;
    }
    throw new Error("The value passed into the `convertObjectToTypedArray` must be an object that can be converted into a typed array!");
  }
  function convertTypedArrayToObject(x) {
    if (x instanceof ArrayBuffer || x instanceof BigInt64Array || x instanceof BigUint64Array || x instanceof Float32Array || x instanceof Float64Array || x instanceof Int16Array || x instanceof Int32Array || x instanceof Int8Array || x instanceof Uint16Array || x instanceof Uint32Array || x instanceof Uint8Array || x instanceof Uint8ClampedArray) {
      return {
        [Symbol.for("@TypedArrayConstructor")]: x.constructor.name,
        values: x instanceof ArrayBuffer ? Array.from(new Uint8Array(x)) : Array.from(x)
      };
    }
    if (isArray2(x)) {
      return x.map((v) => {
        try {
          return convertTypedArrayToObject(v);
        } catch (e) {
          return v;
        }
      });
    }
    if (typeof x === "object" & x !== null) {
      if (isDate2(x)) {
        return new Date(x.getTime());
      }
      const out22 = {};
      Object.keys(x).forEach((key) => {
        try {
          out22[key] = convertTypedArrayToObject(x[key]);
        } catch (e) {
          out22[key] = x[key];
        }
      });
      return out22;
    }
    throw new Error("The value passed into the `convertTypedArrayToObject` function must be a typed array! Valid types include: ArrayBuffer, Float32Array, Float64Array, Int16Array, Int32Array, Int8Array, Uint16Array, Uint32Array, Uint8Array, and Uint8ClampedArray.");
  }
  function isANumberString(x) {
    x = x.trim();
    return !!(x.match(/^-?\d+(\.\d+)?$/g) || x.match(/^-?\d+(\.\d+)?e-?\d+(\.\d+)?$/g) || x.match(/^-?\.\d+$/g) || x === "NaN");
  }
  var punctuation = "!\"#%&'()*+,-./:;<=>?@[]^_`{|}~\xA0\xA1\xA4\xA7\xA9\xAA\xAB\xAE\xB0\xB1\xB6\xB7\xBA\xBB\xBF\xD7\xF7\u0254\u0300\u0301\u0302\u0303\u037E\u0387\u055A\u055B\u055C\u055D\u055E\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A\u066B\u066C\u066D\u06D4\u0700\u0701\u0702\u0703\u0704\u0705\u0706\u0707\u0708\u0709\u070A\u070B\u070C\u070D\u07F7\u07F8\u07F9\u0830\u0831\u0832\u0833\u0834\u0835\u0836\u0837\u0838\u0839\u083A\u083B\u083C\u083D\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04\u0F05\u0F06\u0F07\u0F08\u0F09\u0F0A\u0F0B\u0F0C\u0F0D\u0F0E\u0F0F\u0F10\u0F11\u0F12\u0F14\u0F3A\u0F3B\u0F3C\u0F3D\u0F85\u0FD0\u0FD1\u0FD2\u0FD3\u0FD4\u0FD9\u0FDA\u104A\u104B\u104C\u104D\u104E\u104F\u10FB\u1360\u1361\u1362\u1363\u1364\u1365\u1366\u1367\u1368\u1400\u166E\u169B\u169C\u16EB\u16EC\u16ED\u1735\u1736\u17D4\u17D5\u17D6\u17D8\u17D9\u17DA\u1800\u1801\u1802\u1803\u1804\u1805\u1806\u1807\u1808\u1809\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0\u1AA1\u1AA2\u1AA3\u1AA4\u1AA5\u1AA6\u1AA8\u1AA9\u1AAA\u1AAB\u1AAC\u1AAD\u1B5A\u1B5B\u1B5C\u1B5D\u1B5E\u1B5F\u1B60\u1BFC\u1BFD\u1BFE\u1BFF\u1C3B\u1C3C\u1C3D\u1C3E\u1C3F\u1C7E\u1C7F\u1CC0\u1CC1\u1CC2\u1CC3\u1CC4\u1CC5\u1CC6\u1CC7\u1CD3\u2010\u2011\u2012\u2013\u2014\u2015\u2016\u2017\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2020\u2021\u2022\u2023\u2024\u2025\u2026\u2027\u2030\u2031\u2032\u2033\u2034\u2035\u2036\u2037\u2038\u2039\u203A\u203B\u203C\u203D\u203E\u203F\u2040\u2041\u2042\u2043\u2045\u2046\u2047\u2048\u2049\u204A\u204B\u204C\u204D\u204E\u204F\u2050\u2051\u2052\u2053\u2054\u2055\u2056\u2057\u2058\u2059\u205A\u205B\u205C\u205D\u205E\u207D\u207E\u208D\u208E\u2116\u2117\u2120\u2122\u212E\u2212\u2234\u2235\u2248\u2300\u2308\u2309\u230A\u230B\u2311\u2329\u232A\u2380\u25CA\u25CC\u261E\u2640\u2642\u26A5\u2766\u2767\u2768\u2769\u276A\u276B\u276C\u276D\u276E\u276F\u2770\u2771\u2772\u2773\u2774\u2775\u27C5\u27C6\u27E6\u27E7\u27E8\u27E9\u27EA\u27EB\u27EC\u27ED\u27EE\u27EF\u2983\u2984\u2985\u2986\u2987\u2988\u2989\u298A\u298B\u298C\u298D\u298E\u298F\u2990\u2991\u2992\u2993\u2994\u2995\u2996\u2997\u2998\u29D8\u29D9\u29DA\u29DB\u29FC\u29FD\u2CF9\u2CFA\u2CFB\u2CFC\u2CFE\u2CFF\u2D70\u2E00\u2E01\u2E02\u2E03\u2E04\u2E05\u2E06\u2E07\u2E08\u2E09\u2E0A\u2E0B\u2E0C\u2E0D\u2E0E\u2E0F\u2E10\u2E11\u2E12\u2E13\u2E14\u2E15\u2E16\u2E17\u2E18\u2E19\u2E1A\u2E1B\u2E1C\u2E1D\u2E1E\u2E1F\u2E20\u2E21\u2E22\u2E23\u2E24\u2E25\u2E26\u2E27\u2E28\u2E29\u2E2A\u2E2B\u2E2C\u2E2D\u2E2E\u2E30\u2E31\u2E32\u2E33\u2E34\u2E35\u2E36\u2E37\u2E38\u2E39\u2E3A\u2E3B\u2E3C\u2E3D\u2E3E\u2E3F\u2E40\u2E41\u2E42\u2E43\u2E44\u2E45\u2E46\u2E47\u2E48\u2E49\u2E4A\u2E4B\u2E4C\u2E4D\u2E4E\u2E4F\u2E52\u3001\u3002\u3003\u3008\u3009\u300A\u300B\u300C\u300D\u300E\u300F\u3010\u3011\u3014\u3015\u3016\u3017\u3018\u3019\u301A\u301B\u301C\u301D\u301E\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D\uA60E\uA60F\uA673\uA67E\uA6F2\uA6F3\uA6F4\uA6F5\uA6F6\uA6F7\uA874\uA875\uA876\uA877\uA8CE\uA8CF\uA8F8\uA8F9\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1\uA9C2\uA9C3\uA9C4\uA9C5\uA9C6\uA9C7\uA9C8\uA9C9\uA9CA\uA9CB\uA9CC\uA9CD\uA9DE\uA9DF\uAA5C\uAA5D\uAA5E\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uD800\uD801\uD802\uD803\uD804\uD805\uD806\uD807\uD809\uD81A\uD81B\uD82F\uD836\uD83A\u{1F03B}\uDC41\uDC42\uDC43\uDC44\uDC45\uDC47\uDC48\uDC49\uDC4A\uDC4B\uDC4C\uDC4D\uDC4E\uDC4F\uDC57\uDC5A\uDC5B\uDC5D\uDC70\uDC71\uDC72\uDC73\uDC74\uDC9F\uDCBB\uDCBC\uDCBE\uDCBF\uDCC0\uDCC1\uDCC6\uDD00\uDD01\uDD02\uDD1F\uDD2F\uDD3F\uDD40\uDD41\uDD42\uDD43\uDD44\uDD45\uDD46\uDD5E\uDD5F\uDD6F\uDD74\uDD75\uDDC1\uDDC2\uDDC3\uDDC4\uDDC5\uDDC6\uDDC7\uDDC8\uDDC9\uDDCA\uDDCB\uDDCC\uDDCD\uDDCE\uDDCF\uDDD0\uDDD1\uDDD2\uDDD3\uDDD4\uDDD5\uDDD6\uDDD7\uDDDB\uDDDD\uDDDE\uDDDF\uDDE2\uDE38\uDE39\uDE3A\uDE3B\uDE3C\uDE3D\uDE3F\uDE40\uDE41\uDE42\uDE43\uDE44\uDE45\uDE46\uDE50\uDE51\uDE52\uDE53\uDE54\uDE55\uDE56\uDE57\uDE58\uDE60\uDE61\uDE62\uDE63\uDE64\uDE65\uDE66\uDE67\uDE68\uDE69\uDE6A\uDE6B\uDE6C\uDE6E\uDE6F\uDE7F\uDE87\uDE88\uDE89\uDE8A\uDE8B\uDE97\uDE98\uDE99\uDE9A\uDE9B\uDE9C\uDE9E\uDE9F\uDEA0\uDEA1\uDEA2\uDEA9\uDEAD\uDEF0\uDEF1\uDEF2\uDEF3\uDEF4\uDEF5\uDEF6\uDEF7\uDEF8\uDF37\uDF38\uDF39\uDF3A\uDF3B\uDF3C\uDF3D\uDF3E\uDF3F\uDF44\uDF55\uDF56\uDF57\uDF58\uDF59\uDF99\uDF9A\uDF9B\uDF9C\uDF9F\uDFD0\uDFE2\uDFFF\uFD3F\uFE10\uFE11\uFE12\uFE13\uFE14\uFE15\uFE16\uFE17\uFE18\uFE19\uFE30\uFE31\uFE32\uFE33\uFE34\uFE35\uFE36\uFE37\uFE38\uFE39\uFE3A\uFE3B\uFE3C\uFE3D\uFE3E\uFE3F\uFE40\uFE41\uFE42\uFE43\uFE44\uFE45\uFE46\uFE47\uFE48\uFE49\uFE4A\uFE4B\uFE4C\uFE4D\uFE4E\uFE4F\uFE50\uFE51\uFE52\uFE54\uFE55\uFE56\uFE57\uFE58\uFE59\uFE5A\uFE5B\uFE5C\uFE5D\uFE5E\uFE5F\uFE60\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01\uFF02\uFF03\uFF05\uFF06\uFF07\uFF08\uFF09\uFF0A\uFF0C\uFF0D\uFF0E\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B\uFF3C\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F\uFF60\uFF61\uFF62\uFF63\uFF64\uFF65";
  function replaceAll(text, a, b) {
    if (typeof text !== "string") {
      throw new Error("`text` must be a string!");
    }
    if (typeof a !== "string") {
      throw new Error("`a` must be a string!");
    }
    if (typeof b !== "string") {
      throw new Error("`b` must be a string!");
    }
    return text.split(a).join(b);
  }
  var doubleSpace = "  ";
  var singleSpace = " ";
  function strip(text) {
    if (typeof text !== "string") {
      throw new Error("`text` must be a string!");
    }
    let out22 = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      if (punctuation.includes(char)) {
        out22 += singleSpace;
      } else {
        out22 += char;
      }
    }
    while (out22.includes(doubleSpace)) {
      out22 = replaceAll(out22, doubleSpace, singleSpace);
    }
    return out22.trim();
  }
  function indent(text, chars) {
    chars = chars || "";
    return text.split("\n").map((line) => {
      if (line.trim().length > 0) {
        return chars + line;
      } else {
        return line;
      }
    }).join("\n");
  }
  function kebabify(text) {
    if (typeof text !== "string") {
      throw new Error("`text` must be a string!");
    }
    const words = strip(text).split(" ");
    if (words.length === 0)
      return "";
    if (words.length === 1)
      return words[0];
    return words.join("-");
  }
  var specials = {
    "@Infinity": Infinity,
    "@NegativeInfinity": -Infinity,
    "@NaN": NaN,
    "@undefined": void 0
  };
  function fixUndefineds(x) {
    if (typeof x === "object") {
      if (x === null) {
        return x;
      }
      if (isArray2(x)) {
        for (let i = 0; i < x.length; i++) {
          x[i] = fixUndefineds(x[i]);
        }
      } else {
        Object.keys(x).concat(Object.getOwnPropertySymbols(x)).forEach((key) => {
          x[key] = fixUndefineds(x[key]);
        });
      }
      return x;
    } else {
      if (typeof x === "undefined") {
        return void 0;
      }
      if (x === "Symbol(@undefined)") {
        return void 0;
      }
      return x;
    }
  }
  function parseAsBigInt(x) {
    if (typeof x === "bigint") {
      return x;
    } else if (typeof x === "string") {
      if (x.match(/^\s*?-?\d+n\s*?$/g)) {
        try {
          return BigInt(x.split("n")[0]);
        } catch (e) {
          return NaN;
        }
      } else {
        return NaN;
      }
    } else {
      return NaN;
    }
  }
  function parseAsNumber(x) {
    if (typeof x !== "string") {
      if (typeof x === "number") {
        return x;
      } else {
        return;
      }
    }
    if (isANumberString(x)) {
      return parseFloat(x);
    }
  }
  function parseAsString(x) {
    if (typeof x !== "string") {
      return;
    }
    const replacement = "@jrc03c/js-text-tools/newline-replacer";
    x = x.replaceAll("\n", replacement);
    if (x.trim().match(/^("|')?Symbol\(@String\):.*?("|')?$/g)) {
      let out22 = x.replace("Symbol(@String):", "");
      if (out22.match(/^".*?"$/g)) {
        try {
          return JSON.parse(out22);
        } catch (e) {
          out22 = out22.substring(1, out22.length - 1);
        }
      }
      out22 = out22.replaceAll(replacement, "\n");
      return out22;
    }
  }
  function parseAsSymbol(x) {
    if (typeof x !== "string") {
      if (typeof x === "symbol") {
        return { out: x, isASymbol: true };
      } else {
        return;
      }
    }
    if (x.trim().match(/^'?"?Symbol\(.*?\)"?'?$/g)) {
      const xTemp = x.replace(/^.*?Symbol\(/g, "").replace(/\).*?$/g, "");
      if (xTemp in specials) {
        return { out: specials[xTemp], isASymbol: true };
      }
      return { out: Symbol.for(xTemp), isASymbol: true };
    }
  }
  function parseAsRegex(x) {
    if (typeof x !== "string") {
      if (x instanceof RegExp) {
        return x;
      } else {
        return;
      }
    }
    const xTrimmed = x.trim();
    if (xTrimmed.match(/^\/.*?\/(d|g|i|m|s|u|v|y)*?$/g)) {
      try {
        const pattern = xTrimmed.replace(/^\//g, "").replace(/\/(d|g|i|m|s|u|v|y)*?$/g, "");
        const flags = xTrimmed.match(/\/(d|g|i|m|s|u|v|y)*?$/g).at(-1).split("/").at(-1);
        return new RegExp(pattern, flags);
      } catch (e) {
      }
    }
  }
  function parseWithJSONParse(x) {
    if (typeof x !== "string") {
      if (typeof x === "object") {
        return x;
      } else {
        return "Symbol(@undefined)";
      }
    }
    try {
      let out22 = JSON.parse(x, (key, value) => {
        try {
          const out3 = parse(value);
          return typeof out3 === "undefined" ? "Symbol(@undefined)" : out3;
        } catch (e) {
          return typeof value === "undefined" ? "Symbol(@undefined)" : value;
        }
      });
      if (isArray2(out22)) {
        out22 = fixUndefineds(out22);
      }
      return out22;
    } catch (e) {
      return x;
    }
  }
  function parseAsDate(x) {
    if (typeof x !== "string") {
      if (x instanceof Date && x.toString() !== "Invalid Date") {
        return x;
      } else {
        return;
      }
    }
    try {
      const d = new Date(Date.parse(x));
      if (d.toString() !== "Invalid Date") {
        return d;
      }
    } catch (e) {
    }
  }
  function parseObjectKeysAndValues(x) {
    if (typeof x === "object") {
      if (x !== null) {
        return fixUndefineds(x);
      }
      return;
    }
    Object.keys(x).concat(Object.getOwnPropertySymbols(x)).forEach((key) => {
      try {
        let origKey = key;
        try {
          key = parse(key);
        } catch (e) {
        }
        x[key] = parse(x[origKey]);
        if (key !== origKey) {
          delete x[origKey];
        }
      } catch (e) {
      }
    });
    return fixUndefineds(x);
  }
  function parse(x) {
    function helper52(x2) {
      if (typeof x2 === "string") {
        let out22 = parseAsString(x2);
        if (typeof out22 === "string") {
          return out22;
        }
        const results = parseAsSymbol(x2);
        out22 = results ? results.out : void 0;
        if (results && results.isASymbol) {
          return out22;
        }
        out22 = parseAsRegex(x2);
        if (out22 instanceof RegExp) {
          return out22;
        }
        out22 = parseAsBigInt(x2);
        if (typeof out22 === "bigint") {
          return out22;
        }
        out22 = parseAsNumber(x2);
        if (typeof out22 === "number") {
          return out22;
        }
        out22 = parseAsDate(x2);
        if (out22 instanceof Date) {
          return out22;
        }
        out22 = parseWithJSONParse(x2);
        if (typeof out22 !== "undefined") {
          if (out22 === "Symbol(@undefined)") {
            return void 0;
          } else {
            return out22;
          }
        }
        return x2;
      }
      if (typeof x2 === "object") {
        if (x2 === null) {
          return null;
        }
        let out22;
        try {
          out22 = convertObjectToTypedArray(x2);
          if (isArray2(out22))
            return out22;
        } catch (e) {
        }
        out22 = parseObjectKeysAndValues(x2);
        if (out22) {
          try {
            return convertObjectToTypedArray(out22);
          } catch (e) {
            return out22;
          }
        }
        return x2;
      }
      return x2;
    }
    return helper52(x);
  }
  function pascalify(text) {
    const out22 = camelify2(text);
    return out22[0].toUpperCase() + out22.slice(1);
  }
  function snakeify(text) {
    if (typeof text !== "string") {
      throw new Error("`text` must be a string!");
    }
    const words = strip(text).split(" ");
    if (words.length === 0)
      return "";
    if (words.length === 1)
      return words[0];
    return words.join("_");
  }
  function prefix(s22, n) {
    if (!s22 || n <= 0)
      return "";
    return range2(0, n).map(() => s22).join("");
  }
  function stringify(x, indent2) {
    assert2(isString2(indent2) || isUndefined2(indent2), "The second parameter to the `stringify` function must be undefined or a string!");
    const newline = indent2 ? "\n" : "";
    function helper52(x2, indent3, depth) {
      depth = depth || 0;
      if (typeof x2 === "bigint") {
        return JSON.stringify(x2.toString() + "n");
      }
      if (typeof x2 === "number") {
        if (x2 === Infinity) {
          return '"Symbol(@Infinity)"';
        }
        if (x2 === -Infinity) {
          return '"Symbol(@NegativeInfinity)"';
        }
        if (isNaN(x2)) {
          return '"Symbol(@NaN)"';
        }
        return x2.toString();
      }
      if (typeof x2 === "string") {
        return JSON.stringify("Symbol(@String):" + x2);
      }
      if (typeof x2 === "boolean") {
        return x2.toString();
      }
      if (typeof x2 === "undefined") {
        return '"Symbol(@undefined)"';
      }
      if (typeof x2 === "symbol") {
        return JSON.stringify(x2.toString());
      }
      if (typeof x2 === "function") {
        return JSON.stringify(x2.toString());
      }
      if (x2 instanceof RegExp) {
        return x2.toString();
      }
      if (typeof x2 === "object") {
        if (x2 === null) {
          return "null";
        }
        if (isDate2(x2)) {
          return JSON.stringify(x2.toJSON());
        }
        if (isArray2(x2)) {
          if (x2.length === 0) {
            return prefix(indent3, depth - 1) + "[]";
          }
          if (!(x2 instanceof Array)) {
            return helper52(convertTypedArrayToObject(x2), null, indent3);
          }
          return prefix(indent3, depth - 1) + "[" + newline + x2.map((v) => {
            let child = (() => {
              try {
                return helper52(convertTypedArrayToObject(v), indent3, depth + 1);
              } catch (e) {
                return helper52(v, indent3, depth + 1);
              }
            })();
            if (isString2(child))
              child = child.trim();
            return prefix(indent3, depth + 1) + child;
          }).join("," + newline) + newline + prefix(indent3, depth) + "]";
        }
        if (Object.keys(x2).length + Object.getOwnPropertySymbols(x2).length === 0) {
          return prefix(indent3, depth - 1) + "{}";
        }
        return prefix(indent3, depth - 1) + "{" + newline + Object.keys(x2).concat(Object.getOwnPropertySymbols(x2)).map((key) => {
          let child = (() => {
            try {
              return helper52(convertTypedArrayToObject(x2[key]), indent3, depth + 1);
            } catch (e) {
              return helper52(x2[key], indent3, depth + 1);
            }
          })();
          if (isString2(child))
            child = child.trim();
          const stringifiedKey = typeof key === "symbol" ? helper52(key) : JSON.stringify(key);
          return prefix(indent3, depth + 1) + stringifiedKey + ":" + (indent3 ? " " : "") + child;
        }).join("," + newline) + newline + prefix(indent3, depth) + "}";
      }
      return "undefined";
    }
    return helper52(decycle2(x), indent2);
  }
  function unindent(text) {
    const lines = text.split("\n");
    const indentations = lines.filter((line) => line.trim().length > 0).map((line) => line.split("").findIndex((char) => !char.match(/\s/g)));
    const minIndentation = Math.min(...indentations);
    return lines.map((line) => line.substring(minIndentation)).join("\n");
  }
  function wrap(raw, maxLineLength) {
    if (typeof raw !== "string") {
      throw new Error("The first argument to the `wrap` function must be a string!");
    }
    if (typeof maxLineLength === "undefined" || maxLineLength === null) {
      if (typeof process !== "undefined" && typeof process.stdout !== "undefined" && typeof process.stdout.columns === "number") {
        maxLineLength = process.stdout.columns > 80 ? 80 : process.stdout.columns;
      } else {
        maxLineLength = 80;
      }
    }
    if (isNaN(maxLineLength) || typeof maxLineLength !== "number") {
      throw new Error("The second argument to the `wrap` function must be undefined, null, or an integer!");
    }
    const out22 = [];
    raw.split("\n").forEach((line) => {
      if (line.trim().length === 0) {
        return out22.push("");
      }
      const indentation = line.split(/[^\s]/g)[0];
      const words = line.replace(indentation, "").split(" ");
      let temp = indentation;
      words.forEach((word) => {
        const newLine = temp + (temp.trim().length > 0 ? " " : "") + word;
        if (newLine.length > maxLineLength) {
          out22.push(temp);
          temp = indentation + word;
        } else {
          temp = newLine;
        }
      });
      if (temp.length > 0) {
        out22.push(temp);
      }
    });
    return out22.join("\n");
  }
  if (typeof window !== "undefined") {
    window.JSTextTools = {
      camelify: camelify2,
      convertObjectToTypedArray,
      convertTypedArrayToObject,
      indent,
      isANumberString,
      kebabify,
      parse,
      pascalify,
      punctuation,
      replaceAll,
      snakeify,
      stringify,
      strip,
      unindent,
      wrap
    };
  }
  Array.prototype.remove = function(x) {
    let index = this.indexOf(x);
    while (index > -1) {
      this.splice(index, 1);
      index = this.indexOf(x);
    }
    return this;
  };
  var alive = {};
  var SubscriptionService = class {
    context = void 0;
    rejects = [];
    resolves = [];
    unsubs = [];
    constructor() {
      this.context = globalThis;
      const id = makeKey4(8);
      Object.defineProperty(this, "id", {
        configurable: false,
        enumerable: true,
        get: () => id,
        set() {
          throw new Error(
            `The \`id\` property of this SubscriptionService instance is read-only!`
          );
        }
      });
      alive[this.id] = true;
    }
    get hasBeenDestroyed() {
      return !alive[this.id];
    }
    set hasBeenDestroyed(value) {
      throw new Error(
        `The \`hasBeenDestroyed\` property of this SubscriptionService instance is read-only! To destroy this SubscriptionService instance, invoke its \`destroy\` method.`
      );
    }
    destroy(error3) {
      if (this.hasBeenDestroyed) {
        throw new Error(
          `This SubscriptionService instance has already been destroyed!`
        );
      }
      delete alive[this.id];
      this.unsubs.forEach((unsub) => unsub());
      if (error3) {
        this.rejects.forEach((reject) => reject(error3));
      } else {
        this.resolves.forEach((resolve) => resolve());
      }
      delete this.context;
      delete this.rejects;
      delete this.resolves;
      delete this.unsubs;
    }
    emit(signal, payload) {
      if (this.hasBeenDestroyed) {
        throw new Error(
          `This SubscriptionService instance has already been destroyed!`
        );
      }
      return new Promise((resolve, reject) => {
        try {
          const cbid = makeKey4(8);
          const callback = (event) => {
            if (event.data.signal === cbid) {
              this.context.removeEventListener("message", callback);
              this.resolves.remove(resolve);
              this.rejects.remove(reject);
              let out3 = event.data.payload;
              try {
                out3 = parse(out3);
              } catch (e) {
              }
              return resolve(out3);
            }
          };
          this.context.addEventListener("message", callback);
          this.resolves.push(resolve);
          this.rejects.push(reject);
          try {
            payload = stringify(payload);
          } catch (e) {
          }
          this.context.postMessage({
            cbid,
            signal,
            payload
          });
        } catch (e) {
          this.resolves.remove(resolve);
          this.rejects.remove(reject);
          return reject(e);
        }
      });
    }
    on(signal, callback) {
      if (this.hasBeenDestroyed) {
        throw new Error(
          `This SubscriptionService instance has already been destroyed!`
        );
      }
      const inner = (event) => {
        if (event.data.signal === signal) {
          const cbid = event.data.cbid;
          let payload = event.data.payload;
          try {
            payload = parse(payload);
          } catch (e) {
          }
          const request = { data: payload };
          const response = {
            send: (result) => {
              try {
                result = stringify(result);
              } catch (e) {
              }
              if (!this.hasBeenDestroyed) {
                this.context.postMessage({
                  signal: cbid,
                  payload: result
                });
              }
            }
          };
          callback(request, response);
        }
      };
      const unsub = () => {
        this.context.removeEventListener("message", inner);
        this.unsubs.remove(unsub);
      };
      this.unsubs.push(unsub);
      this.context.addEventListener("message", inner);
      return unsub;
    }
  };
  var Drone = class extends SubscriptionService {
    constructor(path) {
      super();
      if (typeof window === "undefined") {
        if (typeof path !== "undefined") {
          throw new Error(
            "You must not pass a `path` to a `Drone` created in a web worker context! (Passing a `path` only makes sense when creating a `Drone` in a window context.)"
          );
        }
      } else if (typeof path === "undefined") {
        throw new Error("You must pass a `path` into the `Drone` constructor!");
      }
      if (path) {
        this.context = new Worker(path);
      }
    }
    get isDead() {
      return this.hasBeenDestroyed;
    }
    set isDead(value) {
      throw new Error(
        `The \`isDead\` property of this Drone instance is read-only! To destroy this Drone instance, invoke its \`destroy\` method.`
      );
    }
    propose(signal, payload) {
      return this.emit(signal, payload);
    }
    destroy() {
      if (this.context instanceof Worker) {
        this.context.terminate();
      }
      return super.destroy();
    }
  };
  var Queen = class extends SubscriptionService {
    hive = [];
    constructor(path, n) {
      super();
      if (path) {
        n = n || 1;
        this.addDrones(path, n);
      }
    }
    get isDead() {
      return this.hasBeenDestroyed;
    }
    set isDead(value) {
      throw new Error(
        `The \`isDead\` property of this Queen instance is read-only! To destroy this Queen instance, invoke her \`destroy\` method.`
      );
    }
    addDrone(path) {
      if (this.isDead) {
        throw new Error("The queen is dead!");
      }
      const drone = new Drone(path);
      this.hive.push(drone);
      return drone;
    }
    addDrones(path, n) {
      const out3 = [];
      for (let i = 0; i < n; i++) {
        out3.push(this.addDrone(path));
      }
      return out3;
    }
    removeDrone(drone) {
      if (this.isDead) {
        throw new Error("The queen is dead!");
      }
      drone.destroy();
      this.hive.remove(drone);
      return this;
    }
    removeDrones(drones) {
      drones.forEach((drone) => this.removeDrone(drone));
      return this;
    }
    on(signal, callback, specificDrones) {
      if (typeof specificDrones !== "undefined" && specificDrones instanceof Drone) {
        specificDrones = [specificDrones];
      }
      const unsubs = (specificDrones || this.hive).map((drone) => {
        return drone.on(signal, callback);
      });
      const unsub = () => unsubs.forEach((unsub2) => unsub2());
      this.unsubs.push(unsub);
      return unsub;
    }
    emit(signal, payload, specificDrones) {
      if (this.isDead) {
        throw new Error("The queen is dead!");
      }
      if (typeof specificDrones !== "undefined" && specificDrones instanceof Drone) {
        specificDrones = [specificDrones];
      }
      const drones = specificDrones || this.hive;
      if (drones.length === 0) {
        throw new Error(
          `The queen issued a "${signal}" command, but there are no drones in the hive!`
        );
      }
      return new Promise((resolve, reject) => {
        try {
          const results = new Array(drones.length);
          const promises = drones.map((drone, i) => {
            return new Promise((resolve2, reject2) => {
              try {
                this.resolves.push(resolve2);
                this.rejects.push(reject2);
                drone.emit(signal, payload).then((result) => {
                  if (!this.hasBeenDestroyed) {
                    this.resolves.remove(resolve2);
                    this.rejects.remove(reject2);
                    results[i] = result;
                    resolve2();
                  }
                });
              } catch (e) {
                this.resolves.remove(resolve2);
                this.rejects.remove(reject2);
                return reject2(e);
              }
            });
          });
          this.resolves.push(resolve);
          this.rejects.push(reject);
          Promise.all(promises).then(() => {
            if (!this.hasBeenDestroyed) {
              this.resolves.remove(resolve);
              this.rejects.remove(reject);
              if (results.length === 1) {
                return resolve(results[0]);
              } else {
                return resolve(results);
              }
            }
          });
        } catch (e) {
          this.resolves.remove(resolve);
          this.rejects.remove(reject);
          return reject(e);
        }
      });
    }
    command() {
      return this.emit(...arguments);
    }
    destroy(error3) {
      if (this.isDead) {
        throw new Error("The queen is dead!");
      }
      const out3 = super.destroy(error3);
      this.hive.forEach((drone) => {
        drone.destroy(error3);
      });
      delete this.hive;
      return out3;
    }
  };
  var Bee = { Drone, Queen };
  if (typeof globalThis !== "undefined") {
    globalThis.Bee = Bee;
  }
  if (typeof window !== "undefined") {
    window.Bee = Bee;
  }

  // tests/browser/src/tests.mjs
  var progress = document.getElementsByTagName("progress")[0];
  var queen = new Bee.Queen();
  queen.addDrone("tests-worker-bundle.js");
  queen.command("start-tests");
  var isWorking = false;
  var interval = setInterval(() => {
    if (isWorking) return;
    isWorking = true;
    queen.command("get-progress").then((p) => {
      if (!p) return;
      p = parseFloat(p.toFixed(2));
      progress.value = p * 100;
      progress.innerHTML = p * 100 + "%";
      if (p >= 1) {
        console.log("done! requesting results...");
        clearInterval(interval);
        return queen.command("get-results").then((results) => {
          console.log(results);
        });
      }
      isWorking = false;
    });
  }, 100);
})();

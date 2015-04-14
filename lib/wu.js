"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

(function (root, factory) {
  module.exports = factory();
  /*if (typeof define === "function" && define.amd&& 1===5) {
    define(factory);
  } else if (typeof exports === "object") {
    //require("traceur/bin/traceur-runtime");
   } else {
    const oldWu = root.wu;
    root.wu = factory();
    root.wu.noConflict = () => {
      const wu = root.wu;
      root.wu = oldWu;
      return wu;
    };
  }*/
})(undefined, function () {
  "use strict";

  function wu(iterable) {
    if (!isIterable(iterable)) {
      throw new Error("wu: `" + iterable + "` is not iterable!");
    }
    return new Wu(iterable);
  }

  function Wu(iterable) {
    var iterator = getIterator(iterable);
    this.next = iterator.next.bind(iterator);
  }
  wu.prototype = Wu.prototype;

  // This is known as @@iterator in the ES6 spec.
  Object.defineProperty(wu, "iteratorSymbol", {
    value: (function () {
      // Try and create a Proxy to intercept the actual symbol used to get the
      // iterator. We prefer this to Symbol.iterator because some versions of
      // SpiderMonkey use the string "@@iteratorSymbol" despite exposing the
      // Symbol.iterator symbol!
      if (typeof Proxy === "function") {
        var _iteratorNormalCompletion;

        var _didIteratorError;

        var _iteratorError;

        var _iterator, _step;

        var _ret = (function () {
          var symbol = undefined;
          try {
            var proxy = new Proxy({}, {
              get: function get(_, name) {
                symbol = name;
                throw Error();
              }
            });
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;

            try {
              for (_iterator = proxy[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _ = _step.value;

                break;
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                  _iterator["return"]();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          } catch (e) {}
          if (symbol) {
            return {
              v: symbol
            };
          }
        })();

        if (typeof _ret === "object") return _ret.v;
      }

      // Check if `Symbol.iterator` exists and use that if possible.
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        return Symbol.iterator;
      }

      throw new Error("Cannot find iterator symbol.");
    })()
  });

  wu.prototype[wu.iteratorSymbol] = function () {
    return this;
  };

  /*
   * Internal utilities
   */

  // An internal placeholder value.
  var MISSING = {};

  // Return whether a thing is iterable.
  var isIterable = function isIterable(thing) {
    return thing && typeof thing[wu.iteratorSymbol] === "function";
  };

  // Get the iterator for the thing or throw an error.
  var getIterator = function getIterator(thing) {
    if (isIterable(thing)) {
      return thing[wu.iteratorSymbol]();
    }
    throw new TypeError("Not iterable: " + thing);
  };

  // Define a static method on `wu` and set its prototype to the shared
  // `Wu.prototype`.
  var staticMethod = function staticMethod(name, fn) {
    fn.prototype = Wu.prototype;
    wu[name] = fn;
  };

  // Define a function that is attached as both a `Wu.prototype` method and a
  // curryable static method on `wu` directly that takes an iterable as its last
  // parameter.
  var prototypeAndStatic = function prototypeAndStatic(name, fn) {
    var expectedArgs = arguments[2] === undefined ? fn.length : arguments[2];
    return (function () {
      fn.prototype = Wu.prototype;
      Wu.prototype[name] = fn;

      // +1 for the iterable, which is the `this` value of the function so it
      // isn't reflected by the length property.
      expectedArgs += 1;

      wu[name] = wu.curryable(function () {
        var _wu;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var iterable = args.pop();
        return (_wu = wu(iterable))[name].apply(_wu, args);
      }, expectedArgs);
    })();
  };

  // A decorator for rewrapping a method's returned iterable in wu to maintain
  // chainability.
  var rewrap = function rewrap(fn) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return wu(fn.call.apply(fn, [this].concat(args)));
    };
  };

  var rewrapStaticMethod = function rewrapStaticMethod(name, fn) {
    return staticMethod(name, rewrap(fn));
  };
  var rewrapPrototypeAndStatic = function rewrapPrototypeAndStatic(name, fn, expectedArgs) {
    return prototypeAndStatic(name, rewrap(fn), expectedArgs);
  };

  // Return a wrapped version of `fn` bound with the initial arguments
  // `...args`.
  function curry(fn, args) {
    return function () {
      for (var _len3 = arguments.length, moreArgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        moreArgs[_key3] = arguments[_key3];
      }

      return fn.call.apply(fn, [this].concat(_toConsumableArray(args), moreArgs));
    };
  }

  /*
   * Public utilities
   */

  staticMethod("curryable", function (fn) {
    var expected = arguments[1] === undefined ? fn.length : arguments[1];
    return (function () {
      return function f() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return args.length >= expected ? fn.apply(this, args) : curry(f, args);
      };
    })();
  });

  rewrapStaticMethod("entries", regeneratorRuntime.mark(function callee$1$0(obj) {
    var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, k;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          context$2$0.prev = 3;
          _iterator2 = Object.keys(obj)[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            context$2$0.next = 12;
            break;
          }

          k = _step2.value;
          context$2$0.next = 9;
          return [k, obj[k]];

        case 9:
          _iteratorNormalCompletion2 = true;
          context$2$0.next = 5;
          break;

        case 12:
          context$2$0.next = 18;
          break;

        case 14:
          context$2$0.prev = 14;
          context$2$0.t0 = context$2$0["catch"](3);
          _didIteratorError2 = true;
          _iteratorError2 = context$2$0.t0;

        case 18:
          context$2$0.prev = 18;
          context$2$0.prev = 19;

          if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
            _iterator2["return"]();
          }

        case 21:
          context$2$0.prev = 21;

          if (!_didIteratorError2) {
            context$2$0.next = 24;
            break;
          }

          throw _iteratorError2;

        case 24:
          return context$2$0.finish(21);

        case 25:
          return context$2$0.finish(18);

        case 26:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$0, this, [[3, 14, 18, 26], [19,, 21, 25]]);
  }));

  rewrapStaticMethod("keys", regeneratorRuntime.mark(function callee$1$1(obj) {
    return regeneratorRuntime.wrap(function callee$1$1$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          return context$2$0.delegateYield(Object.keys(obj), "t1", 1);

        case 1:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$1, this);
  }));

  rewrapStaticMethod("values", regeneratorRuntime.mark(function callee$1$2(obj) {
    var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, k;

    return regeneratorRuntime.wrap(function callee$1$2$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion3 = true;
          _didIteratorError3 = false;
          _iteratorError3 = undefined;
          context$2$0.prev = 3;
          _iterator3 = Object.keys(obj)[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
            context$2$0.next = 12;
            break;
          }

          k = _step3.value;
          context$2$0.next = 9;
          return obj[k];

        case 9:
          _iteratorNormalCompletion3 = true;
          context$2$0.next = 5;
          break;

        case 12:
          context$2$0.next = 18;
          break;

        case 14:
          context$2$0.prev = 14;
          context$2$0.t2 = context$2$0["catch"](3);
          _didIteratorError3 = true;
          _iteratorError3 = context$2$0.t2;

        case 18:
          context$2$0.prev = 18;
          context$2$0.prev = 19;

          if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
            _iterator3["return"]();
          }

        case 21:
          context$2$0.prev = 21;

          if (!_didIteratorError3) {
            context$2$0.next = 24;
            break;
          }

          throw _iteratorError3;

        case 24:
          return context$2$0.finish(21);

        case 25:
          return context$2$0.finish(18);

        case 26:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$2, this, [[3, 14, 18, 26], [19,, 21, 25]]);
  }));

  /*
   * Infinite iterators
   */

  rewrapPrototypeAndStatic("cycle", regeneratorRuntime.mark(function callee$1$3() {
    var saved, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, x;

    return regeneratorRuntime.wrap(function callee$1$3$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          saved = [];
          _iteratorNormalCompletion4 = true;
          _didIteratorError4 = false;
          _iteratorError4 = undefined;
          context$2$0.prev = 4;
          _iterator4 = this[Symbol.iterator]();

        case 6:
          if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
            context$2$0.next = 14;
            break;
          }

          x = _step4.value;
          context$2$0.next = 10;
          return x;

        case 10:
          saved.push(x);

        case 11:
          _iteratorNormalCompletion4 = true;
          context$2$0.next = 6;
          break;

        case 14:
          context$2$0.next = 20;
          break;

        case 16:
          context$2$0.prev = 16;
          context$2$0.t3 = context$2$0["catch"](4);
          _didIteratorError4 = true;
          _iteratorError4 = context$2$0.t3;

        case 20:
          context$2$0.prev = 20;
          context$2$0.prev = 21;

          if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
            _iterator4["return"]();
          }

        case 23:
          context$2$0.prev = 23;

          if (!_didIteratorError4) {
            context$2$0.next = 26;
            break;
          }

          throw _iteratorError4;

        case 26:
          return context$2$0.finish(23);

        case 27:
          return context$2$0.finish(20);

        case 28:
          if (!saved) {
            context$2$0.next = 32;
            break;
          }

          return context$2$0.delegateYield(saved, "t4", 30);

        case 30:
          context$2$0.next = 28;
          break;

        case 32:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$3, this, [[4, 16, 20, 28], [21,, 23, 27]]);
  }));

  rewrapStaticMethod("count", regeneratorRuntime.mark(function callee$1$4() {
    var start = arguments[0] === undefined ? 0 : arguments[0];
    var step = arguments[1] === undefined ? 1 : arguments[1];
    var n;
    return regeneratorRuntime.wrap(function callee$1$4$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          n = start;

        case 1:
          if (!true) {
            context$2$0.next = 7;
            break;
          }

          context$2$0.next = 4;
          return n;

        case 4:
          n += step;
          context$2$0.next = 1;
          break;

        case 7:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$4, this);
  }));

  rewrapStaticMethod("repeat", regeneratorRuntime.mark(function callee$1$5(thing) {
    var times = arguments[1] === undefined ? Infinity : arguments[1];
    var i;
    return regeneratorRuntime.wrap(function callee$1$5$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (!(times === Infinity)) {
            context$2$0.next = 8;
            break;
          }

        case 1:
          if (!true) {
            context$2$0.next = 6;
            break;
          }

          context$2$0.next = 4;
          return thing;

        case 4:
          context$2$0.next = 1;
          break;

        case 6:
          context$2$0.next = 15;
          break;

        case 8:
          i = 0;

        case 9:
          if (!(i < times)) {
            context$2$0.next = 15;
            break;
          }

          context$2$0.next = 12;
          return thing;

        case 12:
          i++;
          context$2$0.next = 9;
          break;

        case 15:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$5, this);
  }));

  /*
   * Iterators that terminate once the input sequence has been exhausted
   */

  rewrapStaticMethod("chain", regeneratorRuntime.mark(function callee$1$6() {
    for (var _len5 = arguments.length, iterables = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      iterables[_key5] = arguments[_key5];
    }

    var _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, it;

    return regeneratorRuntime.wrap(function callee$1$6$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion5 = true;
          _didIteratorError5 = false;
          _iteratorError5 = undefined;
          context$2$0.prev = 3;
          _iterator5 = iterables[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
            context$2$0.next = 11;
            break;
          }

          it = _step5.value;
          return context$2$0.delegateYield(it, "t5", 8);

        case 8:
          _iteratorNormalCompletion5 = true;
          context$2$0.next = 5;
          break;

        case 11:
          context$2$0.next = 17;
          break;

        case 13:
          context$2$0.prev = 13;
          context$2$0.t6 = context$2$0["catch"](3);
          _didIteratorError5 = true;
          _iteratorError5 = context$2$0.t6;

        case 17:
          context$2$0.prev = 17;
          context$2$0.prev = 18;

          if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
            _iterator5["return"]();
          }

        case 20:
          context$2$0.prev = 20;

          if (!_didIteratorError5) {
            context$2$0.next = 23;
            break;
          }

          throw _iteratorError5;

        case 23:
          return context$2$0.finish(20);

        case 24:
          return context$2$0.finish(17);

        case 25:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$6, this, [[3, 13, 17, 25], [18,, 20, 24]]);
  }));

  rewrapPrototypeAndStatic("chunk", regeneratorRuntime.mark(function callee$1$7() {
    var n = arguments[0] === undefined ? 2 : arguments[0];

    var items, index, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, item;

    return regeneratorRuntime.wrap(function callee$1$7$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          items = [];
          index = 0;
          _iteratorNormalCompletion6 = true;
          _didIteratorError6 = false;
          _iteratorError6 = undefined;
          context$2$0.prev = 5;
          _iterator6 = this[Symbol.iterator]();

        case 7:
          if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
            context$2$0.next = 18;
            break;
          }

          item = _step6.value;

          items[index++] = item;

          if (!(index === n)) {
            context$2$0.next = 15;
            break;
          }

          context$2$0.next = 13;
          return items;

        case 13:
          items = [];
          index = 0;

        case 15:
          _iteratorNormalCompletion6 = true;
          context$2$0.next = 7;
          break;

        case 18:
          context$2$0.next = 24;
          break;

        case 20:
          context$2$0.prev = 20;
          context$2$0.t7 = context$2$0["catch"](5);
          _didIteratorError6 = true;
          _iteratorError6 = context$2$0.t7;

        case 24:
          context$2$0.prev = 24;
          context$2$0.prev = 25;

          if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
            _iterator6["return"]();
          }

        case 27:
          context$2$0.prev = 27;

          if (!_didIteratorError6) {
            context$2$0.next = 30;
            break;
          }

          throw _iteratorError6;

        case 30:
          return context$2$0.finish(27);

        case 31:
          return context$2$0.finish(24);

        case 32:
          if (!index) {
            context$2$0.next = 35;
            break;
          }

          context$2$0.next = 35;
          return items;

        case 35:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$7, this, [[5, 20, 24, 32], [25,, 27, 31]]);
  }), 1);

  rewrapPrototypeAndStatic("concatMap", regeneratorRuntime.mark(function callee$1$8(fn) {
    var _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, x;

    return regeneratorRuntime.wrap(function callee$1$8$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion7 = true;
          _didIteratorError7 = false;
          _iteratorError7 = undefined;
          context$2$0.prev = 3;
          _iterator7 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
            context$2$0.next = 11;
            break;
          }

          x = _step7.value;
          return context$2$0.delegateYield(fn(x), "t8", 8);

        case 8:
          _iteratorNormalCompletion7 = true;
          context$2$0.next = 5;
          break;

        case 11:
          context$2$0.next = 17;
          break;

        case 13:
          context$2$0.prev = 13;
          context$2$0.t9 = context$2$0["catch"](3);
          _didIteratorError7 = true;
          _iteratorError7 = context$2$0.t9;

        case 17:
          context$2$0.prev = 17;
          context$2$0.prev = 18;

          if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
            _iterator7["return"]();
          }

        case 20:
          context$2$0.prev = 20;

          if (!_didIteratorError7) {
            context$2$0.next = 23;
            break;
          }

          throw _iteratorError7;

        case 23:
          return context$2$0.finish(20);

        case 24:
          return context$2$0.finish(17);

        case 25:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$8, this, [[3, 13, 17, 25], [18,, 20, 24]]);
  }));

  rewrapPrototypeAndStatic("drop", regeneratorRuntime.mark(function callee$1$9(n) {
    var i, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, x;

    return regeneratorRuntime.wrap(function callee$1$9$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          i = 0;
          _iteratorNormalCompletion8 = true;
          _didIteratorError8 = false;
          _iteratorError8 = undefined;
          context$2$0.prev = 4;
          _iterator8 = this[Symbol.iterator]();

        case 6:
          if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
            context$2$0.next = 16;
            break;
          }

          x = _step8.value;

          if (!(i++ < n)) {
            context$2$0.next = 10;
            break;
          }

          return context$2$0.abrupt("continue", 13);

        case 10:
          context$2$0.next = 12;
          return x;

        case 12:
          return context$2$0.abrupt("break", 16);

        case 13:
          _iteratorNormalCompletion8 = true;
          context$2$0.next = 6;
          break;

        case 16:
          context$2$0.next = 22;
          break;

        case 18:
          context$2$0.prev = 18;
          context$2$0.t10 = context$2$0["catch"](4);
          _didIteratorError8 = true;
          _iteratorError8 = context$2$0.t10;

        case 22:
          context$2$0.prev = 22;
          context$2$0.prev = 23;

          if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
            _iterator8["return"]();
          }

        case 25:
          context$2$0.prev = 25;

          if (!_didIteratorError8) {
            context$2$0.next = 28;
            break;
          }

          throw _iteratorError8;

        case 28:
          return context$2$0.finish(25);

        case 29:
          return context$2$0.finish(22);

        case 30:
          return context$2$0.delegateYield(this, "t11", 31);

        case 31:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$9, this, [[4, 18, 22, 30], [23,, 25, 29]]);
  }));

  rewrapPrototypeAndStatic("dropWhile", regeneratorRuntime.mark(function callee$1$10() {
    var fn = arguments[0] === undefined ? Boolean : arguments[0];

    var _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, x;

    return regeneratorRuntime.wrap(function callee$1$10$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion9 = true;
          _didIteratorError9 = false;
          _iteratorError9 = undefined;
          context$2$0.prev = 3;
          _iterator9 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
            context$2$0.next = 15;
            break;
          }

          x = _step9.value;

          if (!fn(x)) {
            context$2$0.next = 9;
            break;
          }

          return context$2$0.abrupt("continue", 12);

        case 9:
          context$2$0.next = 11;
          return x;

        case 11:
          return context$2$0.abrupt("break", 15);

        case 12:
          _iteratorNormalCompletion9 = true;
          context$2$0.next = 5;
          break;

        case 15:
          context$2$0.next = 21;
          break;

        case 17:
          context$2$0.prev = 17;
          context$2$0.t12 = context$2$0["catch"](3);
          _didIteratorError9 = true;
          _iteratorError9 = context$2$0.t12;

        case 21:
          context$2$0.prev = 21;
          context$2$0.prev = 22;

          if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
            _iterator9["return"]();
          }

        case 24:
          context$2$0.prev = 24;

          if (!_didIteratorError9) {
            context$2$0.next = 27;
            break;
          }

          throw _iteratorError9;

        case 27:
          return context$2$0.finish(24);

        case 28:
          return context$2$0.finish(21);

        case 29:
          return context$2$0.delegateYield(this, "t13", 30);

        case 30:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$10, this, [[3, 17, 21, 29], [22,, 24, 28]]);
  }), 1);

  rewrapPrototypeAndStatic("enumerate", regeneratorRuntime.mark(function callee$1$11() {
    return regeneratorRuntime.wrap(function callee$1$11$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          return context$2$0.delegateYield(_zip([this, wu.count()]), "t14", 1);

        case 1:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$11, this);
  }));

  rewrapPrototypeAndStatic("filter", regeneratorRuntime.mark(function callee$1$12() {
    var fn = arguments[0] === undefined ? Boolean : arguments[0];

    var _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, x;

    return regeneratorRuntime.wrap(function callee$1$12$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion10 = true;
          _didIteratorError10 = false;
          _iteratorError10 = undefined;
          context$2$0.prev = 3;
          _iterator10 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
            context$2$0.next = 13;
            break;
          }

          x = _step10.value;

          if (!fn(x)) {
            context$2$0.next = 10;
            break;
          }

          context$2$0.next = 10;
          return x;

        case 10:
          _iteratorNormalCompletion10 = true;
          context$2$0.next = 5;
          break;

        case 13:
          context$2$0.next = 19;
          break;

        case 15:
          context$2$0.prev = 15;
          context$2$0.t15 = context$2$0["catch"](3);
          _didIteratorError10 = true;
          _iteratorError10 = context$2$0.t15;

        case 19:
          context$2$0.prev = 19;
          context$2$0.prev = 20;

          if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
            _iterator10["return"]();
          }

        case 22:
          context$2$0.prev = 22;

          if (!_didIteratorError10) {
            context$2$0.next = 25;
            break;
          }

          throw _iteratorError10;

        case 25:
          return context$2$0.finish(22);

        case 26:
          return context$2$0.finish(19);

        case 27:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$12, this, [[3, 15, 19, 27], [20,, 22, 26]]);
  }), 1);

  rewrapPrototypeAndStatic("flatten", regeneratorRuntime.mark(function callee$1$13() {
    var shallow = arguments[0] === undefined ? false : arguments[0];

    var _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, x;

    return regeneratorRuntime.wrap(function callee$1$13$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion11 = true;
          _didIteratorError11 = false;
          _iteratorError11 = undefined;
          context$2$0.prev = 3;
          _iterator11 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
            context$2$0.next = 16;
            break;
          }

          x = _step11.value;

          if (!(typeof x !== "string" && isIterable(x))) {
            context$2$0.next = 11;
            break;
          }

          return context$2$0.delegateYield(shallow ? x : wu(x).flatten(), "t16", 9);

        case 9:
          context$2$0.next = 13;
          break;

        case 11:
          context$2$0.next = 13;
          return x;

        case 13:
          _iteratorNormalCompletion11 = true;
          context$2$0.next = 5;
          break;

        case 16:
          context$2$0.next = 22;
          break;

        case 18:
          context$2$0.prev = 18;
          context$2$0.t17 = context$2$0["catch"](3);
          _didIteratorError11 = true;
          _iteratorError11 = context$2$0.t17;

        case 22:
          context$2$0.prev = 22;
          context$2$0.prev = 23;

          if (!_iteratorNormalCompletion11 && _iterator11["return"]) {
            _iterator11["return"]();
          }

        case 25:
          context$2$0.prev = 25;

          if (!_didIteratorError11) {
            context$2$0.next = 28;
            break;
          }

          throw _iteratorError11;

        case 28:
          return context$2$0.finish(25);

        case 29:
          return context$2$0.finish(22);

        case 30:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$13, this, [[3, 18, 22, 30], [23,, 25, 29]]);
  }), 1);

  rewrapPrototypeAndStatic("invoke", regeneratorRuntime.mark(function callee$1$14(name) {
    for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      args[_key6 - 1] = arguments[_key6];
    }

    var _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, x;

    return regeneratorRuntime.wrap(function callee$1$14$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion12 = true;
          _didIteratorError12 = false;
          _iteratorError12 = undefined;
          context$2$0.prev = 3;
          _iterator12 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
            context$2$0.next = 12;
            break;
          }

          x = _step12.value;
          context$2$0.next = 9;
          return x[name].apply(x, args);

        case 9:
          _iteratorNormalCompletion12 = true;
          context$2$0.next = 5;
          break;

        case 12:
          context$2$0.next = 18;
          break;

        case 14:
          context$2$0.prev = 14;
          context$2$0.t18 = context$2$0["catch"](3);
          _didIteratorError12 = true;
          _iteratorError12 = context$2$0.t18;

        case 18:
          context$2$0.prev = 18;
          context$2$0.prev = 19;

          if (!_iteratorNormalCompletion12 && _iterator12["return"]) {
            _iterator12["return"]();
          }

        case 21:
          context$2$0.prev = 21;

          if (!_didIteratorError12) {
            context$2$0.next = 24;
            break;
          }

          throw _iteratorError12;

        case 24:
          return context$2$0.finish(21);

        case 25:
          return context$2$0.finish(18);

        case 26:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$14, this, [[3, 14, 18, 26], [19,, 21, 25]]);
  }));

  rewrapPrototypeAndStatic("map", regeneratorRuntime.mark(function callee$1$15(fn) {
    var _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, x;

    return regeneratorRuntime.wrap(function callee$1$15$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion13 = true;
          _didIteratorError13 = false;
          _iteratorError13 = undefined;
          context$2$0.prev = 3;
          _iterator13 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
            context$2$0.next = 12;
            break;
          }

          x = _step13.value;
          context$2$0.next = 9;
          return fn(x);

        case 9:
          _iteratorNormalCompletion13 = true;
          context$2$0.next = 5;
          break;

        case 12:
          context$2$0.next = 18;
          break;

        case 14:
          context$2$0.prev = 14;
          context$2$0.t19 = context$2$0["catch"](3);
          _didIteratorError13 = true;
          _iteratorError13 = context$2$0.t19;

        case 18:
          context$2$0.prev = 18;
          context$2$0.prev = 19;

          if (!_iteratorNormalCompletion13 && _iterator13["return"]) {
            _iterator13["return"]();
          }

        case 21:
          context$2$0.prev = 21;

          if (!_didIteratorError13) {
            context$2$0.next = 24;
            break;
          }

          throw _iteratorError13;

        case 24:
          return context$2$0.finish(21);

        case 25:
          return context$2$0.finish(18);

        case 26:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$15, this, [[3, 14, 18, 26], [19,, 21, 25]]);
  }));

  rewrapPrototypeAndStatic("pluck", regeneratorRuntime.mark(function callee$1$16(name) {
    var _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, x;

    return regeneratorRuntime.wrap(function callee$1$16$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion14 = true;
          _didIteratorError14 = false;
          _iteratorError14 = undefined;
          context$2$0.prev = 3;
          _iterator14 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
            context$2$0.next = 12;
            break;
          }

          x = _step14.value;
          context$2$0.next = 9;
          return x[name];

        case 9:
          _iteratorNormalCompletion14 = true;
          context$2$0.next = 5;
          break;

        case 12:
          context$2$0.next = 18;
          break;

        case 14:
          context$2$0.prev = 14;
          context$2$0.t20 = context$2$0["catch"](3);
          _didIteratorError14 = true;
          _iteratorError14 = context$2$0.t20;

        case 18:
          context$2$0.prev = 18;
          context$2$0.prev = 19;

          if (!_iteratorNormalCompletion14 && _iterator14["return"]) {
            _iterator14["return"]();
          }

        case 21:
          context$2$0.prev = 21;

          if (!_didIteratorError14) {
            context$2$0.next = 24;
            break;
          }

          throw _iteratorError14;

        case 24:
          return context$2$0.finish(21);

        case 25:
          return context$2$0.finish(18);

        case 26:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$16, this, [[3, 14, 18, 26], [19,, 21, 25]]);
  }));

  rewrapPrototypeAndStatic("reductions", regeneratorRuntime.mark(function callee$1$17(fn) {
    var initial = arguments[1] === undefined ? undefined : arguments[1];

    var val, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, x, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16;

    return regeneratorRuntime.wrap(function callee$1$17$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          val = initial;

          if (!(val === undefined)) {
            context$2$0.next = 28;
            break;
          }

          _iteratorNormalCompletion15 = true;
          _didIteratorError15 = false;
          _iteratorError15 = undefined;
          context$2$0.prev = 5;
          _iterator15 = this[Symbol.iterator]();

        case 7:
          if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
            context$2$0.next = 14;
            break;
          }

          x = _step15.value;

          val = x;
          return context$2$0.abrupt("break", 14);

        case 11:
          _iteratorNormalCompletion15 = true;
          context$2$0.next = 7;
          break;

        case 14:
          context$2$0.next = 20;
          break;

        case 16:
          context$2$0.prev = 16;
          context$2$0.t21 = context$2$0["catch"](5);
          _didIteratorError15 = true;
          _iteratorError15 = context$2$0.t21;

        case 20:
          context$2$0.prev = 20;
          context$2$0.prev = 21;

          if (!_iteratorNormalCompletion15 && _iterator15["return"]) {
            _iterator15["return"]();
          }

        case 23:
          context$2$0.prev = 23;

          if (!_didIteratorError15) {
            context$2$0.next = 26;
            break;
          }

          throw _iteratorError15;

        case 26:
          return context$2$0.finish(23);

        case 27:
          return context$2$0.finish(20);

        case 28:
          context$2$0.next = 30;
          return val;

        case 30:
          _iteratorNormalCompletion16 = true;
          _didIteratorError16 = false;
          _iteratorError16 = undefined;
          context$2$0.prev = 33;
          _iterator16 = this[Symbol.iterator]();

        case 35:
          if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
            context$2$0.next = 42;
            break;
          }

          x = _step16.value;
          context$2$0.next = 39;
          return val = fn(val, x);

        case 39:
          _iteratorNormalCompletion16 = true;
          context$2$0.next = 35;
          break;

        case 42:
          context$2$0.next = 48;
          break;

        case 44:
          context$2$0.prev = 44;
          context$2$0.t22 = context$2$0["catch"](33);
          _didIteratorError16 = true;
          _iteratorError16 = context$2$0.t22;

        case 48:
          context$2$0.prev = 48;
          context$2$0.prev = 49;

          if (!_iteratorNormalCompletion16 && _iterator16["return"]) {
            _iterator16["return"]();
          }

        case 51:
          context$2$0.prev = 51;

          if (!_didIteratorError16) {
            context$2$0.next = 54;
            break;
          }

          throw _iteratorError16;

        case 54:
          return context$2$0.finish(51);

        case 55:
          return context$2$0.finish(48);

        case 56:
          return context$2$0.abrupt("return", val);

        case 57:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$17, this, [[5, 16, 20, 28], [21,, 23, 27], [33, 44, 48, 56], [49,, 51, 55]]);
  }), 2);

  rewrapPrototypeAndStatic("reject", regeneratorRuntime.mark(function callee$1$18() {
    var fn = arguments[0] === undefined ? Boolean : arguments[0];

    var _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, x;

    return regeneratorRuntime.wrap(function callee$1$18$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion17 = true;
          _didIteratorError17 = false;
          _iteratorError17 = undefined;
          context$2$0.prev = 3;
          _iterator17 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done) {
            context$2$0.next = 13;
            break;
          }

          x = _step17.value;

          if (fn(x)) {
            context$2$0.next = 10;
            break;
          }

          context$2$0.next = 10;
          return x;

        case 10:
          _iteratorNormalCompletion17 = true;
          context$2$0.next = 5;
          break;

        case 13:
          context$2$0.next = 19;
          break;

        case 15:
          context$2$0.prev = 15;
          context$2$0.t23 = context$2$0["catch"](3);
          _didIteratorError17 = true;
          _iteratorError17 = context$2$0.t23;

        case 19:
          context$2$0.prev = 19;
          context$2$0.prev = 20;

          if (!_iteratorNormalCompletion17 && _iterator17["return"]) {
            _iterator17["return"]();
          }

        case 22:
          context$2$0.prev = 22;

          if (!_didIteratorError17) {
            context$2$0.next = 25;
            break;
          }

          throw _iteratorError17;

        case 25:
          return context$2$0.finish(22);

        case 26:
          return context$2$0.finish(19);

        case 27:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$18, this, [[3, 15, 19, 27], [20,, 22, 26]]);
  }), 1);

  rewrapPrototypeAndStatic("slice", regeneratorRuntime.mark(function callee$1$19() {
    var start = arguments[0] === undefined ? 0 : arguments[0];
    var stop = arguments[1] === undefined ? Infinity : arguments[1];

    var _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, _step18$value, x, i;

    return regeneratorRuntime.wrap(function callee$1$19$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (!(stop < start)) {
            context$2$0.next = 2;
            break;
          }

          throw new RangeError("parameter `stop` (= " + stop + ") must be >= `start` (= " + start + ")");

        case 2:
          _iteratorNormalCompletion18 = true;
          _didIteratorError18 = false;
          _iteratorError18 = undefined;
          context$2$0.prev = 5;
          _iterator18 = this.enumerate()[Symbol.iterator]();

        case 7:
          if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
            context$2$0.next = 20;
            break;
          }

          _step18$value = _slicedToArray(_step18.value, 2);
          x = _step18$value[0];
          i = _step18$value[1];

          if (!(i < start)) {
            context$2$0.next = 13;
            break;
          }

          return context$2$0.abrupt("continue", 17);

        case 13:
          if (!(i >= stop)) {
            context$2$0.next = 15;
            break;
          }

          return context$2$0.abrupt("break", 20);

        case 15:
          context$2$0.next = 17;
          return x;

        case 17:
          _iteratorNormalCompletion18 = true;
          context$2$0.next = 7;
          break;

        case 20:
          context$2$0.next = 26;
          break;

        case 22:
          context$2$0.prev = 22;
          context$2$0.t24 = context$2$0["catch"](5);
          _didIteratorError18 = true;
          _iteratorError18 = context$2$0.t24;

        case 26:
          context$2$0.prev = 26;
          context$2$0.prev = 27;

          if (!_iteratorNormalCompletion18 && _iterator18["return"]) {
            _iterator18["return"]();
          }

        case 29:
          context$2$0.prev = 29;

          if (!_didIteratorError18) {
            context$2$0.next = 32;
            break;
          }

          throw _iteratorError18;

        case 32:
          return context$2$0.finish(29);

        case 33:
          return context$2$0.finish(26);

        case 34:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$19, this, [[5, 22, 26, 34], [27,, 29, 33]]);
  }), 2);

  rewrapPrototypeAndStatic("spreadMap", regeneratorRuntime.mark(function callee$1$20(fn) {
    var _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, x;

    return regeneratorRuntime.wrap(function callee$1$20$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion19 = true;
          _didIteratorError19 = false;
          _iteratorError19 = undefined;
          context$2$0.prev = 3;
          _iterator19 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done) {
            context$2$0.next = 12;
            break;
          }

          x = _step19.value;
          context$2$0.next = 9;
          return fn.apply(undefined, _toConsumableArray(x));

        case 9:
          _iteratorNormalCompletion19 = true;
          context$2$0.next = 5;
          break;

        case 12:
          context$2$0.next = 18;
          break;

        case 14:
          context$2$0.prev = 14;
          context$2$0.t25 = context$2$0["catch"](3);
          _didIteratorError19 = true;
          _iteratorError19 = context$2$0.t25;

        case 18:
          context$2$0.prev = 18;
          context$2$0.prev = 19;

          if (!_iteratorNormalCompletion19 && _iterator19["return"]) {
            _iterator19["return"]();
          }

        case 21:
          context$2$0.prev = 21;

          if (!_didIteratorError19) {
            context$2$0.next = 24;
            break;
          }

          throw _iteratorError19;

        case 24:
          return context$2$0.finish(21);

        case 25:
          return context$2$0.finish(18);

        case 26:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$20, this, [[3, 14, 18, 26], [19,, 21, 25]]);
  }));

  rewrapPrototypeAndStatic("take", regeneratorRuntime.mark(function callee$1$21(n) {
    var i, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, x;

    return regeneratorRuntime.wrap(function callee$1$21$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (!(n < 1)) {
            context$2$0.next = 2;
            break;
          }

          return context$2$0.abrupt("return");

        case 2:
          i = 0;
          _iteratorNormalCompletion20 = true;
          _didIteratorError20 = false;
          _iteratorError20 = undefined;
          context$2$0.prev = 6;
          _iterator20 = this[Symbol.iterator]();

        case 8:
          if (_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done) {
            context$2$0.next = 17;
            break;
          }

          x = _step20.value;
          context$2$0.next = 12;
          return x;

        case 12:
          if (!(++i >= n)) {
            context$2$0.next = 14;
            break;
          }

          return context$2$0.abrupt("break", 17);

        case 14:
          _iteratorNormalCompletion20 = true;
          context$2$0.next = 8;
          break;

        case 17:
          context$2$0.next = 23;
          break;

        case 19:
          context$2$0.prev = 19;
          context$2$0.t26 = context$2$0["catch"](6);
          _didIteratorError20 = true;
          _iteratorError20 = context$2$0.t26;

        case 23:
          context$2$0.prev = 23;
          context$2$0.prev = 24;

          if (!_iteratorNormalCompletion20 && _iterator20["return"]) {
            _iterator20["return"]();
          }

        case 26:
          context$2$0.prev = 26;

          if (!_didIteratorError20) {
            context$2$0.next = 29;
            break;
          }

          throw _iteratorError20;

        case 29:
          return context$2$0.finish(26);

        case 30:
          return context$2$0.finish(23);

        case 31:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$21, this, [[6, 19, 23, 31], [24,, 26, 30]]);
  }));

  rewrapPrototypeAndStatic("takeWhile", regeneratorRuntime.mark(function callee$1$22() {
    var fn = arguments[0] === undefined ? Boolean : arguments[0];

    var _iteratorNormalCompletion21, _didIteratorError21, _iteratorError21, _iterator21, _step21, x;

    return regeneratorRuntime.wrap(function callee$1$22$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion21 = true;
          _didIteratorError21 = false;
          _iteratorError21 = undefined;
          context$2$0.prev = 3;
          _iterator21 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done) {
            context$2$0.next = 14;
            break;
          }

          x = _step21.value;

          if (fn(x)) {
            context$2$0.next = 9;
            break;
          }

          return context$2$0.abrupt("break", 14);

        case 9:
          context$2$0.next = 11;
          return x;

        case 11:
          _iteratorNormalCompletion21 = true;
          context$2$0.next = 5;
          break;

        case 14:
          context$2$0.next = 20;
          break;

        case 16:
          context$2$0.prev = 16;
          context$2$0.t27 = context$2$0["catch"](3);
          _didIteratorError21 = true;
          _iteratorError21 = context$2$0.t27;

        case 20:
          context$2$0.prev = 20;
          context$2$0.prev = 21;

          if (!_iteratorNormalCompletion21 && _iterator21["return"]) {
            _iterator21["return"]();
          }

        case 23:
          context$2$0.prev = 23;

          if (!_didIteratorError21) {
            context$2$0.next = 26;
            break;
          }

          throw _iteratorError21;

        case 26:
          return context$2$0.finish(23);

        case 27:
          return context$2$0.finish(20);

        case 28:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$22, this, [[3, 16, 20, 28], [21,, 23, 27]]);
  }), 1);

  rewrapPrototypeAndStatic("tap", regeneratorRuntime.mark(function callee$1$23() {
    var fn = arguments[0] === undefined ? console.log.bind(console) : arguments[0];

    var _iteratorNormalCompletion22, _didIteratorError22, _iteratorError22, _iterator22, _step22, x;

    return regeneratorRuntime.wrap(function callee$1$23$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _iteratorNormalCompletion22 = true;
          _didIteratorError22 = false;
          _iteratorError22 = undefined;
          context$2$0.prev = 3;
          _iterator22 = this[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done) {
            context$2$0.next = 13;
            break;
          }

          x = _step22.value;

          fn(x);
          context$2$0.next = 10;
          return x;

        case 10:
          _iteratorNormalCompletion22 = true;
          context$2$0.next = 5;
          break;

        case 13:
          context$2$0.next = 19;
          break;

        case 15:
          context$2$0.prev = 15;
          context$2$0.t28 = context$2$0["catch"](3);
          _didIteratorError22 = true;
          _iteratorError22 = context$2$0.t28;

        case 19:
          context$2$0.prev = 19;
          context$2$0.prev = 20;

          if (!_iteratorNormalCompletion22 && _iterator22["return"]) {
            _iterator22["return"]();
          }

        case 22:
          context$2$0.prev = 22;

          if (!_didIteratorError22) {
            context$2$0.next = 25;
            break;
          }

          throw _iteratorError22;

        case 25:
          return context$2$0.finish(22);

        case 26:
          return context$2$0.finish(19);

        case 27:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$23, this, [[3, 15, 19, 27], [20,, 22, 26]]);
  }), 1);

  rewrapPrototypeAndStatic("unique", regeneratorRuntime.mark(function callee$1$24() {
    var seen, _iteratorNormalCompletion23, _didIteratorError23, _iteratorError23, _iterator23, _step23, x;

    return regeneratorRuntime.wrap(function callee$1$24$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          seen = new Set();
          _iteratorNormalCompletion23 = true;
          _didIteratorError23 = false;
          _iteratorError23 = undefined;
          context$2$0.prev = 4;
          _iterator23 = this[Symbol.iterator]();

        case 6:
          if (_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done) {
            context$2$0.next = 15;
            break;
          }

          x = _step23.value;

          if (seen.has(x)) {
            context$2$0.next = 12;
            break;
          }

          context$2$0.next = 11;
          return x;

        case 11:
          seen.add(x);

        case 12:
          _iteratorNormalCompletion23 = true;
          context$2$0.next = 6;
          break;

        case 15:
          context$2$0.next = 21;
          break;

        case 17:
          context$2$0.prev = 17;
          context$2$0.t29 = context$2$0["catch"](4);
          _didIteratorError23 = true;
          _iteratorError23 = context$2$0.t29;

        case 21:
          context$2$0.prev = 21;
          context$2$0.prev = 22;

          if (!_iteratorNormalCompletion23 && _iterator23["return"]) {
            _iterator23["return"]();
          }

        case 24:
          context$2$0.prev = 24;

          if (!_didIteratorError23) {
            context$2$0.next = 27;
            break;
          }

          throw _iteratorError23;

        case 27:
          return context$2$0.finish(24);

        case 28:
          return context$2$0.finish(21);

        case 29:
          seen.clear();

        case 30:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$24, this, [[4, 17, 21, 29], [22,, 24, 28]]);
  }));

  var _zip = rewrap(regeneratorRuntime.mark(function callee$1$25(iterables) {
    var longest = arguments[1] === undefined ? false : arguments[1];

    var iters, numIters, numFinished, finished, zipped, _iteratorNormalCompletion24, _didIteratorError24, _iteratorError24, _iterator24, _step24, it, _it$next, value, done;

    return regeneratorRuntime.wrap(function callee$1$25$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (iterables.length) {
            context$2$0.next = 2;
            break;
          }

          return context$2$0.abrupt("return");

        case 2:
          iters = iterables.map(getIterator);
          numIters = iterables.length;
          numFinished = 0;
          finished = false;

        case 6:
          if (finished) {
            context$2$0.next = 44;
            break;
          }

          zipped = [];
          _iteratorNormalCompletion24 = true;
          _didIteratorError24 = false;
          _iteratorError24 = undefined;
          context$2$0.prev = 11;
          _iterator24 = iters[Symbol.iterator]();

        case 13:
          if (_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done) {
            context$2$0.next = 26;
            break;
          }

          it = _step24.value;
          _it$next = it.next();
          value = _it$next.value;
          done = _it$next.done;

          if (!done) {
            context$2$0.next = 22;
            break;
          }

          if (longest) {
            context$2$0.next = 21;
            break;
          }

          return context$2$0.abrupt("return");

        case 21:
          if (++numFinished == numIters) {
            finished = true;
          }

        case 22:
          if (value === undefined) {
            // Leave a hole in the array so that you can distinguish an iterable
            // that's done (via `index in array == false`) from an iterable
            // yielding `undefined`.
            zipped.length++;
          } else {
            zipped.push(value);
          }

        case 23:
          _iteratorNormalCompletion24 = true;
          context$2$0.next = 13;
          break;

        case 26:
          context$2$0.next = 32;
          break;

        case 28:
          context$2$0.prev = 28;
          context$2$0.t30 = context$2$0["catch"](11);
          _didIteratorError24 = true;
          _iteratorError24 = context$2$0.t30;

        case 32:
          context$2$0.prev = 32;
          context$2$0.prev = 33;

          if (!_iteratorNormalCompletion24 && _iterator24["return"]) {
            _iterator24["return"]();
          }

        case 35:
          context$2$0.prev = 35;

          if (!_didIteratorError24) {
            context$2$0.next = 38;
            break;
          }

          throw _iteratorError24;

        case 38:
          return context$2$0.finish(35);

        case 39:
          return context$2$0.finish(32);

        case 40:
          context$2$0.next = 42;
          return zipped;

        case 42:
          context$2$0.next = 6;
          break;

        case 44:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$25, this, [[11, 28, 32, 40], [33,, 35, 39]]);
  }));

  rewrapStaticMethod("zip", regeneratorRuntime.mark(function callee$1$26() {
    for (var _len7 = arguments.length, iterables = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      iterables[_key7] = arguments[_key7];
    }

    return regeneratorRuntime.wrap(function callee$1$26$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          return context$2$0.delegateYield(_zip(iterables), "t31", 1);

        case 1:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$26, this);
  }));

  rewrapStaticMethod("zipLongest", regeneratorRuntime.mark(function callee$1$27() {
    for (var _len8 = arguments.length, iterables = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      iterables[_key8] = arguments[_key8];
    }

    return regeneratorRuntime.wrap(function callee$1$27$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          return context$2$0.delegateYield(_zip(iterables, true), "t32", 1);

        case 1:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$27, this);
  }));

  rewrapStaticMethod("zipWith", regeneratorRuntime.mark(function callee$1$28(fn) {
    for (var _len9 = arguments.length, iterables = Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
      iterables[_key9 - 1] = arguments[_key9];
    }

    return regeneratorRuntime.wrap(function callee$1$28$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          return context$2$0.delegateYield(_zip(iterables).spreadMap(fn), "t33", 1);

        case 1:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$28, this);
  }));

  /*
   * Functions that force iteration to completion and return a value.
   */

  // The maximum number of milliseconds we will block the main thread at a time
  // while in `asyncEach`.
  wu.MAX_BLOCK = 15;
  // The number of milliseconds to yield to the main thread between bursts of
  // work.
  wu.TIMEOUT = 1;

  prototypeAndStatic("asyncEach", function (fn) {
    var maxBlock = arguments[1] === undefined ? wu.MAX_BLOCK : arguments[1];
    var timeout = arguments[2] === undefined ? wu.TIMEOUT : arguments[2];

    var iter = getIterator(this);

    return new Promise(function (resolve, reject) {
      (function loop() {
        var start = Date.now();

        var _iteratorNormalCompletion25 = true;
        var _didIteratorError25 = false;
        var _iteratorError25 = undefined;

        try {
          for (var _iterator25 = iter[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
            var x = _step25.value;

            try {
              fn(x);
            } catch (e) {
              reject(e);
              return;
            }

            if (Date.now() - start > maxBlock) {
              setTimeout(loop, timeout);
              return;
            }
          }
        } catch (err) {
          _didIteratorError25 = true;
          _iteratorError25 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion25 && _iterator25["return"]) {
              _iterator25["return"]();
            }
          } finally {
            if (_didIteratorError25) {
              throw _iteratorError25;
            }
          }
        }

        resolve();
      })();
    });
  }, 3);

  prototypeAndStatic("every", function () {
    var fn = arguments[0] === undefined ? Boolean : arguments[0];
    var _iteratorNormalCompletion26 = true;
    var _didIteratorError26 = false;
    var _iteratorError26 = undefined;

    try {
      for (var _iterator26 = this[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
        var x = _step26.value;

        if (!fn(x)) {
          return false;
        }
      }
    } catch (err) {
      _didIteratorError26 = true;
      _iteratorError26 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion26 && _iterator26["return"]) {
          _iterator26["return"]();
        }
      } finally {
        if (_didIteratorError26) {
          throw _iteratorError26;
        }
      }
    }

    return true;
  }, 1);

  prototypeAndStatic("find", function (fn) {
    var _iteratorNormalCompletion27 = true;
    var _didIteratorError27 = false;
    var _iteratorError27 = undefined;

    try {
      for (var _iterator27 = this[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
        var x = _step27.value;

        if (fn(x)) {
          return x;
        }
      }
    } catch (err) {
      _didIteratorError27 = true;
      _iteratorError27 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion27 && _iterator27["return"]) {
          _iterator27["return"]();
        }
      } finally {
        if (_didIteratorError27) {
          throw _iteratorError27;
        }
      }
    }
  });

  prototypeAndStatic("forEach", function (fn) {
    var _iteratorNormalCompletion28 = true;
    var _didIteratorError28 = false;
    var _iteratorError28 = undefined;

    try {
      for (var _iterator28 = this[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
        var x = _step28.value;

        fn(x);
      }
    } catch (err) {
      _didIteratorError28 = true;
      _iteratorError28 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion28 && _iterator28["return"]) {
          _iterator28["return"]();
        }
      } finally {
        if (_didIteratorError28) {
          throw _iteratorError28;
        }
      }
    }
  });

  prototypeAndStatic("has", function (thing) {
    return this.some(function (x) {
      return x === thing;
    });
  });

  prototypeAndStatic("reduce", function (fn) {
    var initial = arguments[1] === undefined ? undefined : arguments[1];

    var val = initial;
    if (val === undefined) {
      var _iteratorNormalCompletion29 = true;
      var _didIteratorError29 = false;
      var _iteratorError29 = undefined;

      try {
        for (var _iterator29 = this[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
          var x = _step29.value;

          val = x;
          break;
        }
      } catch (err) {
        _didIteratorError29 = true;
        _iteratorError29 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion29 && _iterator29["return"]) {
            _iterator29["return"]();
          }
        } finally {
          if (_didIteratorError29) {
            throw _iteratorError29;
          }
        }
      }
    }

    var _iteratorNormalCompletion30 = true;
    var _didIteratorError30 = false;
    var _iteratorError30 = undefined;

    try {
      for (var _iterator30 = this[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
        var x = _step30.value;

        val = fn(val, x);
      }
    } catch (err) {
      _didIteratorError30 = true;
      _iteratorError30 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion30 && _iterator30["return"]) {
          _iterator30["return"]();
        }
      } finally {
        if (_didIteratorError30) {
          throw _iteratorError30;
        }
      }
    }

    return val;
  }, 2);

  prototypeAndStatic("some", function () {
    var fn = arguments[0] === undefined ? Boolean : arguments[0];
    var _iteratorNormalCompletion31 = true;
    var _didIteratorError31 = false;
    var _iteratorError31 = undefined;

    try {
      for (var _iterator31 = this[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
        var x = _step31.value;

        if (fn(x)) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError31 = true;
      _iteratorError31 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion31 && _iterator31["return"]) {
          _iterator31["return"]();
        }
      } finally {
        if (_didIteratorError31) {
          throw _iteratorError31;
        }
      }
    }

    return false;
  }, 1);

  prototypeAndStatic("toArray", function () {
    return [].concat(_toConsumableArray(this));
  });

  /*
   * Methods that return an array of iterables.
   */

  var MAX_CACHE = 500;

  var _tee = rewrap(regeneratorRuntime.mark(function callee$1$29(iterator, cache) {
    var items, index, _iterator$next, done, value;

    return regeneratorRuntime.wrap(function callee$1$29$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          items = cache.items;
          index = 0;

        case 2:
          if (!true) {
            context$2$0.next = 25;
            break;
          }

          if (!(index === items.length)) {
            context$2$0.next = 14;
            break;
          }

          _iterator$next = iterator.next();
          done = _iterator$next.done;
          value = _iterator$next.value;

          if (!done) {
            context$2$0.next = 10;
            break;
          }

          if (cache.returned === MISSING) {
            cache.returned = value;
          }
          return context$2$0.abrupt("break", 25);

        case 10:
          context$2$0.next = 12;
          return items[index++] = value;

        case 12:
          context$2$0.next = 23;
          break;

        case 14:
          if (!(index === cache.tail)) {
            context$2$0.next = 21;
            break;
          }

          value = items[index];

          if (index === MAX_CACHE) {
            items = cache.items = items.slice(index);
            index = 0;
            cache.tail = 0;
          } else {
            items[index] = undefined;
            cache.tail = ++index;
          }
          context$2$0.next = 19;
          return value;

        case 19:
          context$2$0.next = 23;
          break;

        case 21:
          context$2$0.next = 23;
          return items[index++];

        case 23:
          context$2$0.next = 2;
          break;

        case 25:

          if (cache.tail === index) {
            items.length = 0;
          }

          return context$2$0.abrupt("return", cache.returned);

        case 27:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$29, this);
  }));
  _tee.prototype = Wu.prototype;

  prototypeAndStatic("tee", function () {
    var n = arguments[0] === undefined ? 2 : arguments[0];

    var iterables = new Array(n);
    var cache = { tail: 0, items: [], returned: MISSING };

    while (n--) {
      iterables[n] = _tee(this, cache);
    }

    return iterables;
  }, 1);

  prototypeAndStatic("unzip", function () {
    var n = arguments[0] === undefined ? 2 : arguments[0];

    return this.tee(n).map(function (iter, i) {
      return iter.pluck(i);
    });
  }, 1);

  /*
   * Number of chambers.
   */

  wu.tang = { clan: 36 };

  return wu;
});

// We don't have a cached item for this index, we need to force its
// evaluation.

// If we are the last iterator to use a cached value, clean up after
// ourselves.

// We have an item in the cache for this index, so yield it.

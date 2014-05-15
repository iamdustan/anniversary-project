(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $getPrototypeOf = $Object.getPrototypeOf;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var types = {
    void: function voidType() {},
    any: function any() {},
    string: function string() {},
    number: function number() {},
    boolean: function boolean() {}
  };
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    $freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  $freeze(SymbolValue.prototype);
  Symbol.iterator = Symbol();
  function toProperty(name) {
    if (isSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name])
        rv.push(name);
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol)
        rv.push(symbol);
    }
    return rv;
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
      $defineProperty(object, name, {enumerable: false});
    return value;
  }
  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {enumerable: {value: false}});
      }
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
    function is(left, right) {
      if (left === right)
        return left !== 0 || 1 / left === 1 / right;
      return left !== left && right !== right;
    }
    $defineProperty(Object, 'is', method(is));
    function assign(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        target[props[p]] = source[props[p]];
      }
      return target;
    }
    $defineProperty(Object, 'assign', method(assign));
    function mixin(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          descriptor,
          length = props.length;
      for (p = 0; p < length; p++) {
        descriptor = $getOwnPropertyDescriptor(source, props[p]);
        $defineProperty(target, props[p], descriptor);
      }
      return target;
    }
    $defineProperty(Object, 'mixin', method(mixin));
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function toObject(value) {
    if (value == null)
      throw $TypeError();
    return $Object(value);
  }
  function spread() {
    var rv = [],
        k = 0;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = toObject(arguments[i]);
      for (var j = 0; j < valueToSpread.length; j++) {
        rv[k++] = valueToSpread[j];
      }
    }
    return rv;
  }
  function getPropertyDescriptor(object, name) {
    while (object !== null) {
      var result = $getOwnPropertyDescriptor(object, name);
      if (result)
        return result;
      object = $getPrototypeOf(object);
    }
    return undefined;
  }
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    if (!proto)
      throw $TypeError('super is null');
    return getPropertyDescriptor(proto, name);
  }
  function superCall(self, homeObject, name, args) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if ('value' in descriptor)
        return descriptor.value.apply(self, args);
      if (descriptor.get)
        return descriptor.get.call(self).apply(self, args);
    }
    throw $TypeError("super has no method '" + name + "'.");
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (descriptor.get)
        return descriptor.get.call(self);
      else if ('value' in descriptor)
        return descriptor.value;
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {},
        name,
        names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
    }
    if (superClass === null)
      return null;
    throw new TypeError();
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function addIterator(object) {
    return defineProperty(object, Symbol.iterator, nonEnum(function() {
      return this;
    }));
  }
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    }
  };
  function getNextOrThrow(ctx, moveNext, action) {
    return function(x) {
      switch (ctx.GState) {
        case ST_EXECUTING:
          throw new Error(("\"" + action + "\" on executing generator"));
        case ST_CLOSED:
          throw new Error(("\"" + action + "\" on closed generator"));
        case ST_NEWBORN:
          if (action === 'throw') {
            ctx.GState = ST_CLOSED;
            throw x;
          }
          if (x !== undefined)
            throw $TypeError('Sent value to newborn generator');
        case ST_SUSPENDED:
          ctx.GState = ST_EXECUTING;
          ctx.action = action;
          ctx.sent = x;
          var value = moveNext(ctx);
          var done = value === ctx;
          if (done)
            value = ctx.returnValue;
          ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
          return {
            value: value,
            done: done
          };
      }
    };
  }
  function generatorWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    return addIterator({
      next: getNextOrThrow(ctx, moveNext, 'next'),
      throw: getNextOrThrow(ctx, moveNext, 'throw')
    });
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = Object.create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        return;
      case RETHROW_STATE:
        this.reject(this.storedException);
      default:
        this.reject(getInternalError(this.state));
    }
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.createErrback = function(newState) {
      return function(err) {
        ctx.state = newState;
        ctx.err = err;
        moveNext(ctx);
      };
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          ctx.storedException = ex;
          var last = ctx.tryStack_[ctx.tryStack_.length - 1];
          if (!last) {
            ctx.GState = ST_CLOSED;
            ctx.state = END_STATE;
            throw ex;
          }
          ctx.state = last.catch !== undefined ? last.catch : last.finally;
          if (last.finallyFallThrough !== undefined)
            ctx.finallyFallThrough = last.finallyFallThrough;
        }
      }
    };
  }
  function setupGlobals(global) {
    global.Symbol = Symbol;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    asyncWrap: asyncWrap,
    createClass: createClass,
    defaultSuperCall: defaultSuperCall,
    exportStar: exportStar,
    generatorWrap: generatorWrap,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    spread: spread,
    superCall: superCall,
    superGet: superGet,
    superSet: superSet,
    toObject: toObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      return this.value_ = this.func.call(global);
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length) {
        this.registerModule(name, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: func
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({ModuleStore: ModuleStore}));
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.32/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.32/src/runtime/polyfills/utils";
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x | 0;
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    }
  };
});
System.register("traceur-runtime@0.0.32/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__4;
  var __moduleName = "traceur-runtime@0.0.32/src/runtime/polyfills/ArrayIterator";
  var $__5 = System.get("traceur-runtime@0.0.32/src/runtime/polyfills/utils"),
      toObject = $__5.toObject,
      toUint32 = $__5.toUint32;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__4 = {}, Object.defineProperty($__4, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__4, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__4), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.register("traceur-runtime@0.0.32/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.32/node_modules/rsvp/lib/rsvp/asap";
  var $__default = function asap(callback, arg) {
    var length = queue.push([callback, arg]);
    if (length === 1) {
      scheduleFlush();
    }
  };
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = [];
  function flush() {
    for (var i = 0; i < queue.length; i++) {
      var tuple = queue[i];
      var callback = tuple[0],
          arg = tuple[1];
      callback(arg);
    }
    queue = [];
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur-runtime@0.0.32/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.32/src/runtime/polyfills/Promise";
  var async = System.get("traceur-runtime@0.0.32/node_modules/rsvp/lib/rsvp/asap").default;
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : (function(x) {
      return x;
    });
    var onReject = arguments[2] !== (void 0) ? arguments[2] : (function(e) {
      throw e;
    });
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 'pending':
        promise.onResolve_.push([deferred, onResolve]);
        promise.onReject_.push([deferred, onReject]);
        break;
      case 'resolved':
        promiseReact(deferred, onResolve, promise.value_);
        break;
      case 'rejected':
        promiseReact(deferred, onReject, promise.value_);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    var result = {};
    result.promise = new C((function(resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    }));
    return result;
  }
  var Promise = function Promise(resolver) {
    var $__6 = this;
    this.status_ = 'pending';
    this.onResolve_ = [];
    this.onReject_ = [];
    resolver((function(x) {
      promiseResolve($__6, x);
    }), (function(r) {
      promiseReject($__6, r);
    }));
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function() {
      var onResolve = arguments[0] !== (void 0) ? arguments[0] : (function(x) {
        return x;
      });
      var onReject = arguments[1];
      var $__6 = this;
      var constructor = this.constructor;
      return chain(this, (function(x) {
        x = promiseCoerce(constructor, x);
        return x === $__6 ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }), onReject);
    }
  }, {
    resolve: function(x) {
      return new this((function(resolve, reject) {
        resolve(x);
      }));
    },
    reject: function(r) {
      return new this((function(resolve, reject) {
        reject(r);
      }));
    },
    cast: function(x) {
      if (x instanceof this)
        return x;
      if (isPromise(x)) {
        var result = getDeferred(this);
        chain(x, result.resolve, result.reject);
        return result.promise;
      }
      return this.resolve(x);
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var count = 0;
      var resolutions = [];
      try {
        for (var i = 0; i < values.length; i++) {
          ++count;
          this.cast(values[i]).then(function(i, x) {
            resolutions[i] = x;
            if (--count === 0)
              deferred.resolve(resolutions);
          }.bind(undefined, i), (function(r) {
            if (count > 0)
              count = 0;
            deferred.reject(r);
          }));
        }
        if (count === 0)
          deferred.resolve(resolutions);
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.cast(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  function promiseResolve(promise, x) {
    promiseDone(promise, 'resolved', x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, 'rejected', r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 'pending')
      return;
    for (var i = 0; i < reactions.length; i++) {
      promiseReact(reactions[i][0], reactions[i][1], value);
    }
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = promise.onReject_ = undefined;
  }
  function promiseReact(deferred, handler, x) {
    async((function() {
      try {
        var y = handler(x);
        if (y === deferred.promise)
          throw new TypeError;
        else if (isPromise(y))
          chain(y, deferred.resolve, deferred.reject);
        else
          deferred.resolve(y);
      } catch (e) {
        deferred.reject(e);
      }
    }));
  }
  var thenableSymbol = '@@thenable';
  function promiseCoerce(constructor, x) {
    if (isPromise(x)) {
      return x;
    } else if (x && typeof x.then === 'function') {
      var p = x[thenableSymbol];
      if (p) {
        return p;
      } else {
        var deferred = getDeferred(constructor);
        x[thenableSymbol] = deferred.promise;
        try {
          x.then(deferred.resolve, deferred.reject);
        } catch (e) {
          deferred.reject(e);
        }
        return deferred.promise;
      }
    } else {
      return x;
    }
  }
  return {get Promise() {
      return Promise;
    }};
});
System.register("traceur-runtime@0.0.32/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.32/src/runtime/polyfills/String";
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    }
  };
});
System.register("traceur-runtime@0.0.32/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.32/src/runtime/polyfills/polyfills";
  var Promise = System.get("traceur-runtime@0.0.32/src/runtime/polyfills/Promise").Promise;
  var $__9 = System.get("traceur-runtime@0.0.32/src/runtime/polyfills/String"),
      codePointAt = $__9.codePointAt,
      contains = $__9.contains,
      endsWith = $__9.endsWith,
      fromCodePoint = $__9.fromCodePoint,
      repeat = $__9.repeat,
      raw = $__9.raw,
      startsWith = $__9.startsWith;
  var $__9 = System.get("traceur-runtime@0.0.32/src/runtime/polyfills/ArrayIterator"),
      entries = $__9.entries,
      keys = $__9.keys,
      values = $__9.values;
  function maybeDefineMethod(object, name, value) {
    if (!(name in object)) {
      Object.defineProperty(object, name, {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  function polyfillString(String) {
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
  }
  function polyfillArray(Array, Symbol) {
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values]);
    if (Symbol && Symbol.iterator) {
      Object.defineProperty(Array.prototype, Symbol.iterator, {
        value: values,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }
  function polyfill(global) {
    polyfillPromise(global);
    polyfillString(global.String);
    polyfillArray(global.Array, global.Symbol);
  }
  polyfill(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfill(global);
  };
  return {};
});
System.register("traceur-runtime@0.0.32/src/runtime/polyfill-import", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.32/src/runtime/polyfill-import";
  var $__11 = System.get("traceur-runtime@0.0.32/src/runtime/polyfills/polyfills");
  return {};
});
System.get("traceur-runtime@0.0.32/src/runtime/polyfill-import" + '');

/**
 * matchesSelector v1.0.2
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

( function( ElemProto ) {

  'use strict';

  var matchesMethod = ( function() {
    // check un-prefixed
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector';
    }
    // check vendor prefixes
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0, len = prefixes.length; i < len; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if ( ElemProto[ method ] ) {
        return method;
      }
    }
  })();

  // ----- match ----- //

  function match( elem, selector ) {
    return elem[ matchesMethod ]( selector );
  }

  // ----- appendToFragment ----- //

  function checkParent( elem ) {
    // not needed if already has parent
    if ( elem.parentNode ) {
      return;
    }
    var fragment = document.createDocumentFragment();
    fragment.appendChild( elem );
  }

  // ----- query ----- //

  // fall back to using QSA
  // thx @jonathantneal https://gist.github.com/3062955
  function query( elem, selector ) {
    // append to fragment if no parent
    checkParent( elem );

    // match elem with all selected elems of parent
    var elems = elem.parentNode.querySelectorAll( selector );
    for ( var i=0, len = elems.length; i < len; i++ ) {
      // return true if match
      if ( elems[i] === elem ) {
        return true;
      }
    }
    // otherwise return false
    return false;
  }

  // ----- matchChild ----- //

  function matchChild( elem, selector ) {
    checkParent( elem );
    return match( elem, selector );
  }

  // ----- matchesSelector ----- //

  var matchesSelector;

  if ( matchesMethod ) {
    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    var div = document.createElement('div');
    var supportsOrphans = match( div, 'div' );
    matchesSelector = supportsOrphans ? match : matchChild;
  } else {
    matchesSelector = query;
  }

  // transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( function() {
      return matchesSelector;
    });
  } else if ( typeof exports === 'object' ) {
    module.exports = matchesSelector;
  }
  else {
    // browser global
    window.matchesSelector = matchesSelector;
  }

})( Element.prototype );

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __moduleName = "app/js/_util";
var prependTo = require('./es6query').prependTo;
var getXML = require('./ajax').getXML;
var CACHE = {};
var loadInto = (function(element, name) {
  var success = (function(resp) {
    if (element)
      prependTo(element, resp);
    return resp;
  });
  var error = (function(err) {
    return console.error(("Failed to load \"images/" + name + ".svg\""), err.message, err.stack);
  });
  if (CACHE[name])
    return CACHE[name].then(success, error);
  CACHE[name] = getXML(("images/" + name + ".svg")).then(success, error);
  return CACHE[name];
});
var fadeInto = (function(element, name) {
  return loadInto(element, name).then((function(el) {
    el.setAttribute('class', 'livets-ord actor actor-is-loading');
    setTimeout((function() {
      return el.setAttribute('class', 'livets-ord actor');
    }), 100);
  }));
});
module.exports = {
  get loadInto() {
    return loadInto;
  },
  get fadeInto() {
    return fadeInto;
  },
  __esModule: true
};


},{"./ajax":2,"./es6query":4}],2:[function(require,module,exports){
"use strict";
var __moduleName = "app/js/ajax";
var get = (function(url) {
  return new Promise((function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = (function() {
      if (req.status == 200)
        resolve(req.response);
      else
        reject(Error(req.statusText));
    });
    req.onerror = (function() {
      return reject(Error("Network Error"));
    });
    req.send();
  }));
});
var getJSON = (function(url) {
  return get(url).then(JSON.parse);
});
var getXML = (function(url) {
  return get(url).then((function(resp) {
    var n = document.createElement('div');
    n.innerHTML = resp.trim();
    if (n.childNodes.length > 1)
      return n.childNodes;
    return n.firstChild;
  }));
});
module.exports = {
  get get() {
    return get;
  },
  get getJSON() {
    return getJSON;
  },
  get getXML() {
    return getXML;
  },
  __esModule: true
};


},{}],3:[function(require,module,exports){
"use strict";
var __moduleName = "app/js/config";
var CONFIG = {
  Introduction: {
    MIN_SPEED: 1000,
    MAX_SPEED: 1000
  },
  Interlude: {
    MIN_SPEED: 100,
    MAX_SPEED: 100
  },
  'Livets Ord': {
    MIN_SPEED: 100,
    MAX_SPEED: 100
  },
  Tiramisu: {
    MIN_SPEED: 100,
    MAX_SPEED: 100
  },
  Uppsala: {
    MIN_SPEED: 100,
    MAX_SPEED: 100
  }
};
module.exports = {
  get CONFIG() {
    return CONFIG;
  },
  __esModule: true
};


},{}],4:[function(require,module,exports){
"use strict";
var __moduleName = "app/js/es6query";
var $ = (function(selector) {
  var ctx = arguments[1] !== (void 0) ? arguments[1] : document;
  return $traceurRuntime.spread(ctx.querySelectorAll(selector));
});
var $$ = (function(selector) {
  var ctx = arguments[1] !== (void 0) ? arguments[1] : document;
  return ctx.querySelector(selector);
});
var UUID = (function() {
  return 'uuid-' + Math.floor((Math.random() ^ 100 * Math.random() ^ 100) * 10000);
});
var events = {};
var on = (function(element, event, fn) {
  if (typeof element === 'string')
    element = $(element);
  events[UUID()] = {
    element: element,
    event: event,
    fn: fn
  };
  if (element instanceof Array)
    element.forEach(addEventListener);
  else
    addEventListener();
  function addEventListener() {
    var el = arguments[0] !== (void 0) ? arguments[0] : element;
    el.addEventListener(event, fn, false);
  }
});
var off = (function(element, event, fn) {
  if (typeof element === 'string')
    element = $(element);
  for (var o in events) {
    o = events[o];
    if (o.event !== event)
      continue;
    fn = fn || o.fn;
    if (o.element instanceof Array) {
      if (o.element.every((function(e, i) {
        return e === element[i];
      })))
        o.element.forEach(removeEventListener);
      else
        removeEventListener();
    }
  }
  function removeEventListener() {
    var el = arguments[0] !== (void 0) ? arguments[0] : element;
    el.removeEventListener(event, fn);
  }
});
var delegateTo = function delegateTo(selector, fn) {
  return function(e) {
    var ctx;
    if ((ctx = isChild(e.target, 'button', this)))
      fn.apply(ctx, arguments);
  };
};
var isChild = (function(node, parentSelector) {
  var stopAtNode = arguments[2] !== (void 0) ? arguments[2] : document.body;
  while (!node.matches(parentSelector)) {
    if (node === stopAtNode)
      return false;
    node = node.parentNode;
  }
  return node;
});
var prependTo = (function(ctx, el) {
  if (typeof ctx === 'string')
    ctx = $(ctx);
  if (Array.isArray(ctx))
    ctx.forEach((function(c) {
      return c.insertBefore(el, c.firstChild);
    }));
  else
    ctx.insertBefore(el, ctx.firstChild);
  return ctx;
});
module.exports = {
  get $() {
    return $;
  },
  get $$() {
    return $$;
  },
  get on() {
    return on;
  },
  get off() {
    return off;
  },
  get delegateTo() {
    return delegateTo;
  },
  get prependTo() {
    return prependTo;
  },
  __esModule: true
};


},{}],5:[function(require,module,exports){
"use strict";
var __moduleName = "app/js/fake_a4adcc5";
var $__0 = require('./es6query'),
    $ = $__0.$,
    $$ = $__0.$$,
    on = $__0.on,
    off = $__0.off,
    delegateTo = $__0.delegateTo,
    prependTo = $__0.prependTo;
var scenes = require('./scenes').scenes;
var loadInto = require('./_util').loadInto;
loadInto($$('#storybox'), 'dustan');
loadInto($$('#scene'), 'water');
var rand = (function(min, max) {
  return Math.random() * (max - min) + min;
});
loadInto(null, 'cloud').then((function(el) {
  var container = $$('#scene');
  var width = container.clientWidth;
  var clouds = Array.apply(0, Array(3)).map((function(_) {
    return el.cloneNode(true);
  }));
  clouds.forEach(prependTo.bind(null, container));
  clouds.forEach((function(c, i) {
    var scale = rand(0.9, 1.4);
    var y = rand(6, 80);
    var w = c.clientWidth * scale;
    var tween = new TWEEN.Tween({x: width + w * Math.random()}).to({x: -w}, 26000).repeat(Infinity).onUpdate(function(time) {
      var _x = this.x - (width / (i + 1));
      var _y = (Math.sin(time) * 2) + y;
      c.style.webkitTransform = ("scale(" + scale + ") translate(" + _x + "px," + _y + "px)");
    }).start();
  }));
}));
var p = scenes[0].scene.start(scenes[0]).then((function() {
  return scenes[1].scene.start(scenes[1]);
})).then((function() {
  return scenes[2].scene.start(scenes[2]);
})).then((function() {
  return scenes[3].scene.start(scenes[3]);
})).then((function() {
  return scenes[4].scene.start(scenes[4]);
})).then((function() {
  return scenes[5].scene.start(scenes[5]);
})).then((function() {
  return scenes[6].scene.start(scenes[6]);
})).then((function() {
  return scenes[7].scene.start(scenes[7]);
})).then((function() {
  return scenes[8].scene.start(scenes[8]);
})).then((function() {
  return scenes[9].scene.start(scenes[9]);
})).then((function() {
  return scenes[10].scene.start(scenes[10]);
})).then((function() {
  return scenes[11].scene.start(scenes[12]);
})).then((function() {
  return scenes[11].scene.start(scenes[12]);
})).then((function() {
  return scenes[13].scene.start(scenes[13]);
})).then((function() {
  return scenes[14].scene.start(scenes[14]);
})).then((function() {
  return scenes[15].scene.start(scenes[15]);
})).then((function() {
  return scenes[16].scene.start(scenes[16]);
}));
['livets-ord', 'uppsala', 'tiramisu', 'hutchinson', 'lincolnton', 'courthouse'].forEach(loadInto.bind(null, null));
var fadeIn = (function() {
  return document.body.classList.remove('is-loading');
});
on(document.body, 'click', delegateTo('button', (function(e) {
  console.log('clicked that thing');
})));
(function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
})();


},{"./_util":1,"./es6query":4,"./scenes":6}],6:[function(require,module,exports){
"use strict";
var __moduleName = "app/js/scenes";
var Scene = require('./scenes/_scene').Scene;
var scenes = [{
  name: 'Introduction',
  scene: new Scene('Introduction'),
  content: ['Five years ago began the most wonderful part of my life.', 'The woman beyond my dreams had agreed to be my wife.', 'But first, let us travel back to where this journey began.']
}, {
  name: 'Livets Ord',
  scene: new Scene('Livets Ord', {element: 'livets-ord'}),
  content: ['It was the September of 2006 that we met.', 'I can picture in my mind the moment you walked up to our group.', 'I was happy to have another American in our small group.', 'It wasn’t long after our first encounter that I heard God say to me, ', '“That woman will be your wife.”']
}, {
  name: 'Tiramisu',
  scene: new Scene('Livets Ord', {element: 'tiramisu'}),
  content: ['The days and weeks passed and our friendship strengthened.', 'Just beyond Christmas, in February of 2007 that we officially began our relationship.', 'For our first date we went to Stockholm and enjoyed each other’s companies and a meal at Tiramisu.']
}, {
  name: 'Uppsala',
  scene: new Scene('Uppsala', {element: 'uppsala'}),
  content: ['We enjoyed each others company most everyday for the rest of our time in Uppsala, Sweden.', 'But all good things must come to an end.', 'And as May drew to a close, our flights home and apart had come.']
}, {
  name: 'Interlude',
  scene: new Scene('Interlude'),
  content: ['I still remember those months apart as the most lonely and painful of my life.', 'I had fallen in love with this woman.', 'My feelings, hopes, and dreams had all been transformed to revolve around this southern girl.', 'We didn’t have a plan for how our lives would come together again.', 'So we began to travel back and forth&mdash;to visit each other as much as we can.']
}, {
  name: 'Hutchinson',
  scene: new Scene('First trip to Hutchinson', {element: 'hutchinson'}),
  content: ['She came to me in Hutchinson, Minnesota first for a week in the summertime to meet my family.']
}, {
  name: 'Lincolnton',
  scene: new Scene('First trip to Lincolnton', {element: 'lincolnton'}),
  content: ['Then I came to Lincolnton, North Carolina for a week to meet her family.']
}, {
  name: 'Hutchinson',
  scene: new Scene('Second trip to Hutchinson', {element: 'hutchinson'}),
  content: ['Then she came to Hutchinson.']
}, {
  name: 'Lincolnton',
  scene: new Scene('Second trip to Lincolnton', {element: 'lincolnton'}),
  content: ['And I to Lincolnton.']
}, {
  name: 'Hutchinson',
  scene: new Scene('Third trip to Hutchinson', {element: 'hutchinson'}),
  content: ['And she to Hutchinson.']
}, {
  name: 'Lincolnton',
  scene: new Scene('Third trip to Lincolnton', {element: 'lincolnton'}),
  content: ['And I to Lincolnton.', 'It “snowed”. School was canceled. Groceries were lacking milk and bread.', 'There was no snow on the ground.']
}, {
  name: 'Hutchinson',
  scene: new Scene('Fourth trip to Hutchinson', {element: 'hutchinson'}),
  content: ['And she came to Hutchinson.', 'It snowed. Real, proper snow.', '<br />', 'That day it was decided. I would be moving to North Carolina.']
}, {
  name: 'Lincolnton',
  scene: new Scene('Move to Lincolnton', {element: 'lincolnton'}),
  content: ['I purchased a car in the July of 2008. I packed all of my things in it and drove down in August.', 'And thus began our stateside life together.', 'This was quite different from our life in Sweden. We were no longer students and had to work and learn how to have a relationship while the requirements of daily life began around us.']
}, {
  name: 'Lincolnton',
  scene: new Scene('Engaged. I ask', {element: 'lincolnton'}),
  content: ['And for Christmas, we got engaged.', 'I said, "Kelly. Will you marry me?']
}, {
  name: 'Lincolnton',
  scene: new Scene('Engaged. She says yes. ', {element: 'lincolnton'}),
  content: ['Yes! Of course I will!']
}, {
  name: 'Lincolnton',
  scene: new Scene('Married', {element: 'courthouse'}),
  content: ['And on this day, May 16th, 5 years ago', 'Kelly Renee Richards and Dustan Lee Kasten were wed.', '', 'I love you.']
}];
module.exports = {
  get scenes() {
    return scenes;
  },
  __esModule: true
};


},{"./scenes/_scene":7}],7:[function(require,module,exports){
"use strict";
var __moduleName = "app/js/scenes/_scene";
var Promise = require('es6-promise').Promise;
var typewriter = require('typewriter');
var $$ = require('./../es6query').$$;
var fadeInto = require('./../_util').fadeInto;
var CONFIG = require('./../config').CONFIG;
var generateTypewriter = (function(name) {
  var minSpeed = 8,
      maxSpeed = 12;
  if (CONFIG[name]) {
    var minSpeed = CONFIG[name].MIN_SPEED;
    var maxSpeed = CONFIG[name].MAX_SPEED;
  }
  return typewriter(Scene.TYPEWRITER).withAccuracy(99.9).withMinimumSpeed(minSpeed).withMaximumSpeed(maxSpeed).build();
});
var Scene = function Scene(name, options, sceneFn) {
  if (typeof options === 'function' || typeof options === 'undefined') {
    sceneFn = options;
    options = {};
  }
  this.name = name;
  this.options = options || {};
  this.sceneFn = sceneFn || this._defaultSceneFn;
  this._playPromise;
  this.typewriter = generateTypewriter(this.name);
};
($traceurRuntime.createClass)(Scene, {
  start: function(context) {
    var $__0 = this;
    if (this._playPromise)
      return this._playPromise;
    this._playPromise = new Promise((function(resolve, reject) {
      $__0.sceneFn(context, resolve);
    }));
    return this._playPromise;
  },
  _defaultSceneFn: function(content, done) {
    var $__0 = this;
    console.log('Starting %s', this.name);
    var tw = this.typewriter;
    tw.clear();
    content.content.forEach((function(l, i) {
      tw.waitRange(500, 2000, (function(o) {
        if (!$__0.options.element || i !== 0)
          return;
        fadeInto($$('#scene'), $__0.options.element);
      })).type(l).put('<br />');
    }));
    tw.waitRange(500, 2000).type('', (function() {
      console.log('Ending %s', $__0.name);
      done();
    }));
  }
}, {});
Scene.TYPEWRITER = document.getElementById('typewriter');
Scene.CONFIG = CONFIG;
module.exports = {Scene: Scene};


},{"./../_util":1,"./../config":3,"./../es6query":4,"es6-promise":8,"typewriter":29}],8:[function(require,module,exports){
"use strict";
var Promise = require("./promise/promise").Promise;
var polyfill = require("./promise/polyfill").polyfill;
exports.Promise = Promise;
exports.polyfill = polyfill;
},{"./promise/polyfill":12,"./promise/promise":13}],9:[function(require,module,exports){
"use strict";
/* global toString */

var isArray = require("./utils").isArray;
var isFunction = require("./utils").isFunction;

/**
  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The return promise
  is fulfilled with an array that gives all the values in the order they were
  passed in the `promises` array argument.

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `RSVP.all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.reject(new Error("2"));
  var promise3 = RSVP.reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @for RSVP
  @param {Array} promises
  @param {String} label
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
*/
function all(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to all.');
  }

  return new Promise(function(resolve, reject) {
    var results = [], remaining = promises.length,
    promise;

    if (remaining === 0) {
      resolve([]);
    }

    function resolver(index) {
      return function(value) {
        resolveAll(index, value);
      };
    }

    function resolveAll(index, value) {
      results[index] = value;
      if (--remaining === 0) {
        resolve(results);
      }
    }

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && isFunction(promise.then)) {
        promise.then(resolver(i), reject);
      } else {
        resolveAll(i, promise);
      }
    }
  });
}

exports.all = all;
},{"./utils":17}],10:[function(require,module,exports){
(function (process,global){
"use strict";
var browserGlobal = (typeof window !== 'undefined') ? window : {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

// node
function useNextTick() {
  return function() {
    process.nextTick(flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function() {
    node.data = (iterations = ++iterations % 2);
  };
}

function useSetTimeout() {
  return function() {
    local.setTimeout(flush, 1);
  };
}

var queue = [];
function flush() {
  for (var i = 0; i < queue.length; i++) {
    var tuple = queue[i];
    var callback = tuple[0], arg = tuple[1];
    callback(arg);
  }
  queue = [];
}

var scheduleFlush;

// Decide what async method to use to triggering processing of queued callbacks:
if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else {
  scheduleFlush = useSetTimeout();
}

function asap(callback, arg) {
  var length = queue.push([callback, arg]);
  if (length === 1) {
    // If length is 1, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    scheduleFlush();
  }
}

exports.asap = asap;
}).call(this,require("/Users/dustankasten/projects/personal/the-project/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"/Users/dustankasten/projects/personal/the-project/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":22}],11:[function(require,module,exports){
"use strict";
var config = {
  instrument: false
};

function configure(name, value) {
  if (arguments.length === 2) {
    config[name] = value;
  } else {
    return config[name];
  }
}

exports.config = config;
exports.configure = configure;
},{}],12:[function(require,module,exports){
(function (global){
"use strict";
/*global self*/
var RSVPPromise = require("./promise").Promise;
var isFunction = require("./utils").isFunction;

function polyfill() {
  var local;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof window !== 'undefined' && window.document) {
    local = window;
  } else {
    local = self;
  }

  var es6PromiseSupport = 
    "Promise" in local &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    "resolve" in local.Promise &&
    "reject" in local.Promise &&
    "all" in local.Promise &&
    "race" in local.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new local.Promise(function(r) { resolve = r; });
      return isFunction(resolve);
    }());

  if (!es6PromiseSupport) {
    local.Promise = RSVPPromise;
  }
}

exports.polyfill = polyfill;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./promise":13,"./utils":17}],13:[function(require,module,exports){
"use strict";
var config = require("./config").config;
var configure = require("./config").configure;
var objectOrFunction = require("./utils").objectOrFunction;
var isFunction = require("./utils").isFunction;
var now = require("./utils").now;
var all = require("./all").all;
var race = require("./race").race;
var staticResolve = require("./resolve").resolve;
var staticReject = require("./reject").reject;
var asap = require("./asap").asap;

var counter = 0;

config.async = asap; // default async is asap;

function Promise(resolver) {
  if (!isFunction(resolver)) {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  if (!(this instanceof Promise)) {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  this._subscribers = [];

  invokeResolver(resolver, this);
}

function invokeResolver(resolver, promise) {
  function resolvePromise(value) {
    resolve(promise, value);
  }

  function rejectPromise(reason) {
    reject(promise, reason);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch(e) {
    rejectPromise(e);
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value, error, succeeded, failed;

  if (hasCallback) {
    try {
      value = callback(detail);
      succeeded = true;
    } catch(e) {
      failed = true;
      error = e;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (handleThenable(promise, value)) {
    return;
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    resolve(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

var PENDING   = void 0;
var SEALED    = 0;
var FULFILLED = 1;
var REJECTED  = 2;

function subscribe(parent, child, onFulfillment, onRejection) {
  var subscribers = parent._subscribers;
  var length = subscribers.length;

  subscribers[length] = child;
  subscribers[length + FULFILLED] = onFulfillment;
  subscribers[length + REJECTED]  = onRejection;
}

function publish(promise, settled) {
  var child, callback, subscribers = promise._subscribers, detail = promise._detail;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    invokeCallback(settled, child, callback, detail);
  }

  promise._subscribers = null;
}

Promise.prototype = {
  constructor: Promise,

  _state: undefined,
  _detail: undefined,
  _subscribers: undefined,

  then: function(onFulfillment, onRejection) {
    var promise = this;

    var thenPromise = new this.constructor(function() {});

    if (this._state) {
      var callbacks = arguments;
      config.async(function invokePromiseCallback() {
        invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
      });
    } else {
      subscribe(this, thenPromise, onFulfillment, onRejection);
    }

    return thenPromise;
  },

  'catch': function(onRejection) {
    return this.then(null, onRejection);
  }
};

Promise.all = all;
Promise.race = race;
Promise.resolve = staticResolve;
Promise.reject = staticReject;

function handleThenable(promise, value) {
  var then = null,
  resolved;

  try {
    if (promise === value) {
      throw new TypeError("A promises callback cannot return that same promise.");
    }

    if (objectOrFunction(value)) {
      then = value.then;

      if (isFunction(then)) {
        then.call(value, function(val) {
          if (resolved) { return true; }
          resolved = true;

          if (value !== val) {
            resolve(promise, val);
          } else {
            fulfill(promise, val);
          }
        }, function(val) {
          if (resolved) { return true; }
          resolved = true;

          reject(promise, val);
        });

        return true;
      }
    }
  } catch (error) {
    if (resolved) { return true; }
    reject(promise, error);
    return true;
  }

  return false;
}

function resolve(promise, value) {
  if (promise === value) {
    fulfill(promise, value);
  } else if (!handleThenable(promise, value)) {
    fulfill(promise, value);
  }
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = value;

  config.async(publishFulfillment, promise);
}

function reject(promise, reason) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = reason;

  config.async(publishRejection, promise);
}

function publishFulfillment(promise) {
  publish(promise, promise._state = FULFILLED);
}

function publishRejection(promise) {
  publish(promise, promise._state = REJECTED);
}

exports.Promise = Promise;
},{"./all":9,"./asap":10,"./config":11,"./race":14,"./reject":15,"./resolve":16,"./utils":17}],14:[function(require,module,exports){
"use strict";
/* global toString */
var isArray = require("./utils").isArray;

/**
  `RSVP.race` allows you to watch a series of promises and act as soon as the
  first promise given to the `promises` argument fulfills or rejects.

  Example:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 2");
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // result === "promise 2" because it was resolved before promise1
    // was resolved.
  });
  ```

  `RSVP.race` is deterministic in that only the state of the first completed
  promise matters. For example, even if other promises given to the `promises`
  array argument are resolved, but the first completed promise has become
  rejected before the other promises became fulfilled, the returned promise
  will become rejected:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error("promise 2"));
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // Code here never runs because there are rejected promises!
  }, function(reason){
    // reason.message === "promise2" because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  @method race
  @for RSVP
  @param {Array} promises array of promises to observe
  @param {String} label optional string for describing the promise returned.
  Useful for tooling.
  @return {Promise} a promise that becomes fulfilled with the value the first
  completed promises is resolved with if the first completed promise was
  fulfilled, or rejected with the reason that the first completed promise
  was rejected with.
*/
function race(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to race.');
  }
  return new Promise(function(resolve, reject) {
    var results = [], promise;

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
  });
}

exports.race = race;
},{"./utils":17}],15:[function(require,module,exports){
"use strict";
/**
  `RSVP.reject` returns a promise that will become rejected with the passed
  `reason`. `RSVP.reject` is essentially shorthand for the following:

  ```javascript
  var promise = new RSVP.Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  var promise = RSVP.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @for RSVP
  @param {Any} reason value that the returned promise will be rejected with.
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise that will become rejected with the given
  `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Promise = this;

  return new Promise(function (resolve, reject) {
    reject(reason);
  });
}

exports.reject = reject;
},{}],16:[function(require,module,exports){
"use strict";
function resolve(value) {
  /*jshint validthis:true */
  if (value && typeof value === 'object' && value.constructor === this) {
    return value;
  }

  var Promise = this;

  return new Promise(function(resolve) {
    resolve(value);
  });
}

exports.resolve = resolve;
},{}],17:[function(require,module,exports){
"use strict";
function objectOrFunction(x) {
  return isFunction(x) || (typeof x === "object" && x !== null);
}

function isFunction(x) {
  return typeof x === "function";
}

function isArray(x) {
  return Object.prototype.toString.call(x) === "[object Array]";
}

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
var now = Date.now || function() { return new Date().getTime(); };


exports.objectOrFunction = objectOrFunction;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.now = now;
},{}],18:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":20}],19:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],20:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("/Users/dustankasten/projects/personal/the-project/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":19,"/Users/dustankasten/projects/personal/the-project/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":22,"inherits":21}],21:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],22:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],23:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var characterGenerator, random;

  random = require('./random');

  characterGenerator = function(keyboardLayout, accuracy, checkInterval, text) {
    var currentIndex, shouldCorrect, typoIndex;
    currentIndex = -1;
    typoIndex = -1;
    shouldCorrect = false;
    return {
      next: function() {
        var result;
        if (currentIndex >= text.length - 1) {
          if (typoIndex !== -1) {
            shouldCorrect = true;
          } else {
            return null;
          }
        }
        if (!shouldCorrect) {
          currentIndex++;
          shouldCorrect = typoIndex !== -1 && currentIndex % checkInterval === 0;
          if (random.integerInRange(0, 100) > accuracy) {
            result = keyboardLayout.getAdjacentCharacter(text.charAt(currentIndex));
            if (result == null) {
              return text.charAt(currentIndex);
            }
            if (typoIndex === -1) {
              typoIndex = currentIndex;
              shouldCorrect = random.integerInRange(0, 1) === 1;
            }
            return result;
          } else {
            return text.charAt(currentIndex);
          }
        }
        if (currentIndex >= typoIndex) {
          currentIndex--;
          return '\b';
        }
        shouldCorrect = false;
        typoIndex = -1;
        return text.charAt(++currentIndex);
      }
    };
  };

  module.exports = characterGenerator;

}).call(this);

},{"./random":26}],24:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var getAdjacentCharacter, isLowerCase, layout, random;

  random = require('./random');

  layout = [['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='], ['', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'], ['', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\''], ['', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']];

  isLowerCase = function(character) {
    return character === character.toLowerCase();
  };

  getAdjacentCharacter = function(character) {
    var adjacentCharacter, adjacentCol, adjacentRow, col, randomNumber, row, _i, _j, _ref, _ref1;
    for (row = _i = 0, _ref = layout.length; _i < _ref; row = _i += 1) {
      for (col = _j = 0, _ref1 = layout[row].length; _j < _ref1; col = _j += 1) {
        if (layout[row][col].toLowerCase() !== character.toLowerCase()) {
          continue;
        }
        randomNumber = random.integerInRange(-1, 1);
        adjacentRow = row + randomNumber;
        if (adjacentRow >= layout.length || adjacentRow < 0) {
          adjacentRow += -2 * randomNumber;
        }
        if (col >= layout[adjacentRow].length) {
          col = layout[adjacentRow].length - 1;
        }
        if (randomNumber === 0) {
          randomNumber = [-1, 1][random.integerInRange(0, 1)];
        } else {
          randomNumber = random.integerInRange(-1, 1);
        }
        adjacentCol = col + randomNumber;
        if (adjacentCol >= layout[adjacentRow].length || adjacentCol < 0) {
          adjacentCol += -2 * randomNumber;
        }
        adjacentCharacter = layout[adjacentRow][adjacentCol];
        if (adjacentCharacter === '') {
          return getAdjacentCharacter(character);
        }
        if (isLowerCase(character)) {
          return adjacentCharacter.toLowerCase();
        }
        return adjacentCharacter;
      }
    }
    return null;
  };

  module.exports.getAdjacentCharacter = getAdjacentCharacter;

}).call(this);

},{"./random":26}],25:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var PrioritySequence, Sequence, assert;

  assert = require('assert');

  Sequence = require('./sequence');

  PrioritySequence = (function() {
    function PrioritySequence(onWait) {
      this.onWait = onWait;
      this._sequences = [];
      this._waiting = true;
      if (typeof this.onWait === "function") {
        this.onWait();
      }
    }

    PrioritySequence.prototype._next = function() {
      var s, sequence, _i, _len, _ref;
      sequence = null;
      _ref = this._sequences;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        if (s != null) {
          if (s.empty()) {
            continue;
          }
          sequence = s;
          break;
        }
      }
      if (sequence != null) {
        return sequence.next(this._next.bind(this));
      } else {
        this._sequences = [];
        this._waiting = true;
        return typeof this.onWait === "function" ? this.onWait() : void 0;
      }
    };

    PrioritySequence.prototype.then = function(priority, fn) {
      assert.ok(priority != null, 'The priority must be specified');
      assert.strictEqual(typeof priority, 'number', 'Priority must be a number');
      assert.strictEqual(~~priority, priority, 'Priority must be an integer');
      assert.ok(priority >= 0, 'Priority must be a positive integer');
      assert.ok(fn != null, 'The function must be specified');
      if (this._sequences[priority] == null) {
        this._sequences[priority] = new Sequence();
      }
      this._sequences[priority].add(fn);
      if (this._waiting) {
        this._waiting = false;
        return this._next();
      }
    };

    return PrioritySequence;

  })();

  module.exports = PrioritySequence;

}).call(this);

},{"./sequence":27,"assert":18}],26:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, integerInRange;

  assert = require('assert');

  integerInRange = function(min, max) {
    assert.ok(min != null, 'The minimum must be specified');
    assert.strictEqual(typeof min, 'number', 'Min must be a Number');
    assert.strictEqual(~~min, min, 'Min must be an integer');
    assert.ok(max != null, 'The maximum must be specified');
    assert.strictEqual(typeof max, 'number', 'Max must be a Number');
    assert.strictEqual(~~max, max, 'Max must be an integer');
    assert.strictEqual(min <= max, true, 'Min must be less than or equal to Max');
    if (min === max) {
      return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  module.exports.integerInRange = integerInRange;

}).call(this);

},{"assert":18}],27:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var Sequence, assert;

  assert = require('assert');

  Sequence = (function() {
    function Sequence() {
      this._queue = [];
    }

    Sequence.prototype.next = function(cb) {
      var fn;
      if (!this.empty()) {
        fn = this._queue.shift();
        return fn(cb);
      }
    };

    Sequence.prototype.add = function(fn) {
      assert.ok(fn != null, 'The function must be specified');
      return this._queue.push(fn);
    };

    Sequence.prototype.empty = function() {
      return this._queue.length === 0;
    };

    return Sequence;

  })();

  module.exports = Sequence;

}).call(this);

},{"assert":18}],28:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var PrioritySequence, Typewriter, assert, charactergenerator, random;

  assert = require('assert');

  PrioritySequence = require('./prioritysequence');

  random = require('./random');

  charactergenerator = require('./charactergenerator');

  Typewriter = (function() {
    function Typewriter() {
      var _this = this;
      this._prioritySequence = new PrioritySequence(function() {
        return _this._sequenceLevel = 0;
      });
    }

    Typewriter.prototype.setTargetDomElement = function(targetDomElement) {
      assert.ok(targetDomElement instanceof Element, 'TargetDomElement must be an instance of Element');
      return this.targetDomElement = targetDomElement;
    };

    Typewriter.prototype.setAccuracy = function(accuracy) {
      assert.strictEqual(typeof accuracy, 'number', 'Accuracy must be a number');
      assert.ok(accuracy > 0 && accuracy <= 100, 'Accuracy must be greater than 0 and less than or equal to 100');
      return this.accuracy = accuracy;
    };

    Typewriter.prototype.setMinimumSpeed = function(minimumSpeed) {
      assert.strictEqual(typeof minimumSpeed, 'number', 'MinimumSpeed must be a number');
      assert.ok(minimumSpeed > 0, 'MinimumSpeed must be greater than 0');
      if ((this.maximumSpeed != null) && minimumSpeed > this.maximumSpeed) {
        return this.minimumSpeed = this.maximumSpeed;
      } else {
        return this.minimumSpeed = minimumSpeed;
      }
    };

    Typewriter.prototype.setMaximumSpeed = function(maximumSpeed) {
      assert.strictEqual(typeof maximumSpeed, 'number', 'MaximumSpeed must be a number');
      assert.ok(maximumSpeed > 0, 'MaximumSpeed must be greater than 0');
      if ((this.minimumSpeed != null) && this.minimumSpeed > maximumSpeed) {
        return this.maximumSpeed = minimumSpeed;
      } else {
        return this.maximumSpeed = maximumSpeed;
      }
    };

    Typewriter.prototype.setKeyboardLayout = function(keyboardLayout) {
      assert.strictEqual(typeof keyboardLayout.getAdjacentCharacter, 'function', 'KeyboardLayout must have an exported getAdjacentCharacter method');
      return this.keyboardLayout = keyboardLayout;
    };

    Typewriter.prototype._makeChainable = function(cb, fn) {
      var shadow;
      shadow = Object.create(this);
      shadow._sequenceLevel = this._sequenceLevel;
      this._prioritySequence.then(this._sequenceLevel, function(next) {
        return process.nextTick(function() {
          return fn(function() {
            if (cb != null) {
              cb.call(shadow);
            }
            return next();
          });
        });
      });
      if (cb != null) {
        this._sequenceLevel++;
      }
      if ((cb == null) || this.hasOwnProperty('_prioritySequence')) {
        return this;
      }
    };

    Typewriter.prototype.clear = function(cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        var child;
        while ((child = _this.targetDomElement.lastChild) != null) {
          _this.targetDomElement.removeChild(child);
        }
        return done();
      });
    };

    Typewriter.prototype.waitRange = function(millisMin, millisMax, cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        return setTimeout(done, random.integerInRange(millisMin, millisMax));
      });
    };

    Typewriter.prototype.wait = function(millis, cb) {
      return this.waitRange(millis, millis, cb);
    };

    Typewriter.prototype.put = function(text, cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        var child, element;
        element = document.createElement('div');
        element.innerHTML = text;
        while ((child = element.firstChild) != null) {
          _this.targetDomElement.appendChild(child);
        }
        return done();
      });
    };

    Typewriter.prototype["delete"] = function(cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        _this.targetDomElement.removeChild(_this.targetDomElement.lastChild);
        return done();
      });
    };

    Typewriter.prototype.type = function(text, cb) {
      var char, checkInterval, gen;
      checkInterval = (this.minimumSpeed + this.maximumSpeed) / 2;
      gen = charactergenerator(this.keyboardLayout, this.accuracy, checkInterval, text);
      while ((char = gen.next()) !== null) {
        if (char !== '\b') {
          this.put(char);
        } else {
          this["delete"]();
        }
        this.waitRange(~~(1000 / this.maximumSpeed), ~~(1000 / this.minimumSpeed));
      }
      return this.wait(0, cb);
    };

    return Typewriter;

  })();

  module.exports = Typewriter;

}).call(this);

}).call(this,require("/Users/dustankasten/projects/personal/the-project/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./charactergenerator":23,"./prioritysequence":25,"./random":26,"/Users/dustankasten/projects/personal/the-project/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":22,"assert":18}],29:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var Typewriter, TypewriterBuilder, assert;

  assert = require('assert');

  Typewriter = require('./typewriter');

  TypewriterBuilder = function(targetDomElement) {
    var typewriter;
    typewriter = new Typewriter();
    typewriter.setTargetDomElement(targetDomElement);
    return {
      withAccuracy: function(accuracy) {
        this.accuracy = accuracy;
        typewriter.setAccuracy(this.accuracy);
        return this;
      },
      withMinimumSpeed: function(minimumSpeed) {
        this.minimumSpeed = minimumSpeed;
        typewriter.setMinimumSpeed(this.minimumSpeed);
        return this;
      },
      withMaximumSpeed: function(maximumSpeed) {
        this.maximumSpeed = maximumSpeed;
        typewriter.setMaximumSpeed(this.maximumSpeed);
        return this;
      },
      withKeyboardLayout: function(keyboardLayout) {
        this.keyboardLayout = keyboardLayout;
        typewriter.setKeyboardLayout(this.keyboardLayout);
        return this;
      },
      build: function() {
        assert.ok(this.accuracy != null, 'Accuracy must be set');
        assert.ok(this.minimumSpeed != null, 'MinimumSpeed must be set');
        assert.ok(this.maximumSpeed != null, 'MaximumSpeed must be set');
        if (this.keyboardLayout == null) {
          typewriter.setKeyboardLayout(require('./defaultkeyboardlayout'));
        }
        return typewriter;
      }
    };
  };

  module.exports = TypewriterBuilder;

}).call(this);

},{"./defaultkeyboardlayout":24,"./typewriter":28,"assert":18}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3QvYXBwL2pzL191dGlsLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9hcHAvanMvYWpheC5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3QvYXBwL2pzL2NvbmZpZy5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3QvYXBwL2pzL2VzNnF1ZXJ5LmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9hcHAvanMvZmFrZV9hNGFkY2M1LmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9hcHAvanMvc2NlbmVzLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9hcHAvanMvc2NlbmVzL19zY2VuZS5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2Rpc3QvY29tbW9uanMvbWFpbi5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2Rpc3QvY29tbW9uanMvcHJvbWlzZS9hbGwuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy9lczYtcHJvbWlzZS9kaXN0L2NvbW1vbmpzL3Byb21pc2UvYXNhcC5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2Rpc3QvY29tbW9uanMvcHJvbWlzZS9jb25maWcuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy9lczYtcHJvbWlzZS9kaXN0L2NvbW1vbmpzL3Byb21pc2UvcG9seWZpbGwuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy9lczYtcHJvbWlzZS9kaXN0L2NvbW1vbmpzL3Byb21pc2UvcHJvbWlzZS5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2Rpc3QvY29tbW9uanMvcHJvbWlzZS9yYWNlLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9jb21tb25qcy9wcm9taXNlL3JlamVjdC5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2Rpc3QvY29tbW9uanMvcHJvbWlzZS9yZXNvbHZlLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9jb21tb25qcy9wcm9taXNlL3V0aWxzLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9hc3NlcnQvYXNzZXJ0LmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9hc3NlcnQvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL3R5cGV3cml0ZXIvYnVpbGQvY2hhcmFjdGVyZ2VuZXJhdG9yLmpzIiwiL1VzZXJzL2R1c3Rhbmthc3Rlbi9wcm9qZWN0cy9wZXJzb25hbC90aGUtcHJvamVjdC9ub2RlX21vZHVsZXMvdHlwZXdyaXRlci9idWlsZC9kZWZhdWx0a2V5Ym9hcmRsYXlvdXQuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy90eXBld3JpdGVyL2J1aWxkL3ByaW9yaXR5c2VxdWVuY2UuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy90eXBld3JpdGVyL2J1aWxkL3JhbmRvbS5qcyIsIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL3R5cGV3cml0ZXIvYnVpbGQvc2VxdWVuY2UuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy90eXBld3JpdGVyL2J1aWxkL3R5cGV3cml0ZXIuanMiLCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy90eXBld3JpdGVyL2J1aWxkL3R5cGV3cml0ZXJidWlsZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O3dCQUEwQixZQUFZO3FCQUNmLFFBQVE7QUFFM0IsQ0FBSixFQUFJLENBQUEsS0FBSyxFQUFHLEdBQUUsQ0FBQztBQUVKLENBQUosRUFBSSxDQUFBLFFBQVEsYUFBSSxPQUFPLENBQUUsQ0FBQSxJQUFJO0FBQzlCLENBQUosSUFBSSxDQUFBLE9BQU8sYUFBSSxJQUFJLENBQUs7Q0FDdEIsT0FBSSxPQUFPO0FBQ1QsQ0FBQSxjQUFTLENBQUMsT0FBTyxDQUFFLEtBQUksQ0FBQyxDQUFDO0FBQzNCLENBRDJCLFNBQ3BCLEtBQUksQ0FBQztHQUNiLENBQUEsQ0FBQztBQUVFLENBQUosSUFBSSxDQUFBLEtBQUssYUFBSSxHQUFHO1VBQUssQ0FBQSxPQUFPLE1BQU0sRUFBQywwQkFBMEIsRUFBQSxL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QUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUNqQztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQyxLQUN0QztRQUFLLENBQUEsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7R0FBQyxLQUN4QztRQUFLLENBQUEsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMs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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgcHJlcGVuZFRvIH0gZnJvbSAnLi9lczZxdWVyeSc7XG5pbXBvcnQgeyBnZXRYTUwgfSBmcm9tICcuL2FqYXgnO1xuXG52YXIgQ0FDSEUgPSB7fTtcblxuZXhwb3J0IHZhciBsb2FkSW50byA9IChlbGVtZW50LCBuYW1lKSA9PiB7XG4gIHZhciBzdWNjZXNzID0gKHJlc3ApID0+IHtcbiAgICBpZiAoZWxlbWVudClcbiAgICAgIHByZXBlbmRUbyhlbGVtZW50LCByZXNwKTtcbiAgICByZXR1cm4gcmVzcDtcbiAgfTtcblxuICB2YXIgZXJyb3IgPSAoZXJyKSA9PiBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBcImltYWdlcy8ke25hbWV9LnN2Z1wiYCwgZXJyLm1lc3NhZ2UsIGVyci5zdGFjaylcbiAgaWYgKENBQ0hFW25hbWVdKVxuICAgIHJldHVybiBDQUNIRVtuYW1lXS50aGVuKHN1Y2Nlc3MsIGVycm9yKTtcblxuICBDQUNIRVtuYW1lXSA9IGdldFhNTChgaW1hZ2VzLyR7bmFtZX0uc3ZnYCkudGhlbihzdWNjZXNzLCBlcnJvcik7XG5cbiAgcmV0dXJuIENBQ0hFW25hbWVdO1xufTtcblxuZXhwb3J0IHZhciBmYWRlSW50byA9IChlbGVtZW50LCBuYW1lKSA9PiB7XG4gIHJldHVybiBsb2FkSW50byhlbGVtZW50LCBuYW1lKS50aGVuKChlbCkgPT4ge1xuICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbGl2ZXRzLW9yZCBhY3RvciBhY3Rvci1pcy1sb2FkaW5nJyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBlbC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2xpdmV0cy1vcmQgYWN0b3InKSwgMTAwKTtcbiAgfSk7XG59XG5cbiIsImV4cG9ydCB2YXIgZ2V0ID0gKHVybCkgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICByZXEub3BlbignR0VUJywgdXJsKTtcblxuICAgIHJlcS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAvLyBUaGlzIGlzIGNhbGxlZCBldmVuIG9uIDQwNCBldGMgc28gY2hlY2sgdGhlIHN0YXR1c1xuICAgICAgaWYgKHJlcS5zdGF0dXMgPT0gMjAwKVxuICAgICAgICByZXNvbHZlKHJlcS5yZXNwb25zZSk7XG4gICAgICBlbHNlXG4gICAgICAgIHJlamVjdChFcnJvcihyZXEuc3RhdHVzVGV4dCkpO1xuICAgIH07XG5cbiAgICByZXEub25lcnJvciA9ICgpID0+IHJlamVjdChFcnJvcihcIk5ldHdvcmsgRXJyb3JcIikpO1xuICAgIHJlcS5zZW5kKCk7XG4gIH0pO1xufTtcblxuZXhwb3J0IHZhciBnZXRKU09OID0gKHVybCkgPT4ge1xuICByZXR1cm4gZ2V0KHVybCkudGhlbihKU09OLnBhcnNlKTtcbn07XG5cbmV4cG9ydCB2YXIgZ2V0WE1MID0gKHVybCkgPT4ge1xuICByZXR1cm4gZ2V0KHVybCkudGhlbigocmVzcCkgPT4ge1xuICAgIHZhciBuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbi5pbm5lckhUTUwgPSByZXNwLnRyaW0oKTtcbiAgICBpZiAobi5jaGlsZE5vZGVzLmxlbmd0aCA+IDEpIHJldHVybiBuLmNoaWxkTm9kZXM7XG4gICAgcmV0dXJuIG4uZmlyc3RDaGlsZDtcbiAgfSk7XG59XG5cblxuIiwiZXhwb3J0IHZhciBDT05GSUcgPSB7XG4gIEludHJvZHVjdGlvbjoge1xuICAgIE1JTl9TUEVFRDogMTAwMCxcbiAgICBNQVhfU1BFRUQ6IDEwMDBcbiAgfSxcbiAgSW50ZXJsdWRlOiB7XG4gICAgTUlOX1NQRUVEOiAxMDAsXG4gICAgTUFYX1NQRUVEOiAxMDBcbiAgfSxcbiAgJ0xpdmV0cyBPcmQnOiB7XG4gICAgTUlOX1NQRUVEOiAxMDAsXG4gICAgTUFYX1NQRUVEOiAxMDBcbiAgfSxcbiAgVGlyYW1pc3U6IHtcbiAgICBNSU5fU1BFRUQ6IDEwMCxcbiAgICBNQVhfU1BFRUQ6IDEwMFxuICB9LFxuICBVcHBzYWxhOiB7XG4gICAgTUlOX1NQRUVEOiAxMDAsXG4gICAgTUFYX1NQRUVEOiAxMDBcbiAgfSxcbn07XG5cbiIsIi8vIGpRdWVyeSBMaXRlXG5leHBvcnQgdmFyICQgPSAoc2VsZWN0b3IsIGN0eD1kb2N1bWVudCkgPT4gWy4uLmN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKV07XG5leHBvcnQgdmFyICQkID0gKHNlbGVjdG9yLCBjdHg9ZG9jdW1lbnQpID0+IGN0eC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbnZhciBVVUlEID0gKCkgPT4gJ3V1aWQtJyArIE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgXiAxMDAgKiBNYXRoLnJhbmRvbSgpIF4gMTAwKSAqIDEwMDAwKTtcbnZhciBldmVudHMgPSB7fTtcbmV4cG9ydCB2YXIgb24gPSAoZWxlbWVudCwgZXZlbnQsIGZuKSA9PiB7XG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICBldmVudHNbVVVJRCgpXSA9IHsgZWxlbWVudCwgZXZlbnQsIGZuIH07XG4gIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQXJyYXkpXG4gICAgZWxlbWVudC5mb3JFYWNoKGFkZEV2ZW50TGlzdGVuZXIpO1xuICBlbHNlIGFkZEV2ZW50TGlzdGVuZXIoKTtcblxuICBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKGVsPWVsZW1lbnQpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgZmFsc2UpO1xuICB9XG59XG5cbmV4cG9ydCB2YXIgb2ZmID0gKGVsZW1lbnQsIGV2ZW50LCBmbikgPT4ge1xuICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSBlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgZm9yICh2YXIgbyBpbiBldmVudHMpIHtcbiAgICBvID0gZXZlbnRzW29dO1xuICAgIGlmIChvLmV2ZW50ICE9PSBldmVudCkgY29udGludWU7XG4gICAgZm4gPSBmbiB8fCBvLmZuO1xuICAgIGlmIChvLmVsZW1lbnQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgLy8gVE9PRDogbWFrZSB0aGlzIGEgYml0IHNtYXJ0ZXIgdGhhbiBqdXN0IGxvb3BpbmcgaW4gdGhlIHNhbWUgb3JkZXJcbiAgICAgIGlmIChvLmVsZW1lbnQuZXZlcnkoKGUsIGkpID0+IGUgPT09IGVsZW1lbnRbaV0pKVxuICAgICAgICBvLmVsZW1lbnQuZm9yRWFjaChyZW1vdmVFdmVudExpc3RlbmVyKTtcbiAgICAgIGVsc2UgcmVtb3ZlRXZlbnRMaXN0ZW5lcigpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKGVsPWVsZW1lbnQpIHtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmbik7XG4gIH1cbn1cblxuZXhwb3J0IHZhciBkZWxlZ2F0ZVRvID0gZnVuY3Rpb24gZGVsZWdhdGVUbyhzZWxlY3RvciwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgY3R4O1xuICAgIGlmICgoY3R4ID0gaXNDaGlsZChlLnRhcmdldCwgJ2J1dHRvbicsIHRoaXMpKSkgZm4uYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxudmFyIGlzQ2hpbGQgPSAobm9kZSwgcGFyZW50U2VsZWN0b3IsIHN0b3BBdE5vZGU9ZG9jdW1lbnQuYm9keSkgPT4ge1xuICB3aGlsZSAoIW5vZGUubWF0Y2hlcyhwYXJlbnRTZWxlY3RvcikpIHtcbiAgICBpZiAobm9kZSA9PT0gc3RvcEF0Tm9kZSkgcmV0dXJuIGZhbHNlO1xuICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gIH1cbiAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCB2YXIgcHJlcGVuZFRvID0gKGN0eCwgZWwpID0+IHtcbiAgaWYgKHR5cGVvZiBjdHggPT09ICdzdHJpbmcnKSBjdHggPSAkKGN0eCk7XG4gIGlmIChBcnJheS5pc0FycmF5KGN0eCkpIGN0eC5mb3JFYWNoKChjKSA9PiBjLmluc2VydEJlZm9yZShlbCwgYy5maXJzdENoaWxkKSk7XG4gIGVsc2UgY3R4Lmluc2VydEJlZm9yZShlbCwgY3R4LmZpcnN0Q2hpbGQpO1xuICByZXR1cm4gY3R4O1xufVxuXG4iLCJpbXBvcnQgeyAkLCAkJCwgb24sIG9mZiwgZGVsZWdhdGVUbywgcHJlcGVuZFRvIH0gZnJvbSAnLi9lczZxdWVyeSc7XG5pbXBvcnQgeyBzY2VuZXMgfSBmcm9tICcuL3NjZW5lcyc7XG5pbXBvcnQgeyBsb2FkSW50byB9IGZyb20gJy4vX3V0aWwnO1xuXG5sb2FkSW50bygkJCgnI3N0b3J5Ym94JyksICdkdXN0YW4nKTtcbmxvYWRJbnRvKCQkKCcjc2NlbmUnKSwgJ3dhdGVyJyk7XG5cbnZhciByYW5kID0gKG1pbiwgbWF4KSA9PiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG5cbmxvYWRJbnRvKG51bGwsICdjbG91ZCcpLnRoZW4oKGVsKSA9PiB7XG4gIHZhciBjb250YWluZXIgPSAkJCgnI3NjZW5lJyk7XG4gIHZhciB3aWR0aCA9IGNvbnRhaW5lci5jbGllbnRXaWR0aDtcbiAgdmFyIGNsb3VkcyA9IEFycmF5LmFwcGx5KDAsIEFycmF5KDMpKS5tYXAoXz0+ZWwuY2xvbmVOb2RlKHRydWUpKTtcblxuICBjbG91ZHMuZm9yRWFjaChwcmVwZW5kVG8uYmluZChudWxsLCBjb250YWluZXIpKTtcbiAgY2xvdWRzLmZvckVhY2goKGMsIGkpID0+IHtcbiAgICB2YXIgc2NhbGUgPSByYW5kKDAuOSwgMS40KTtcbiAgICB2YXIgeSA9IHJhbmQoNiwgODApO1xuICAgIHZhciB3ID0gYy5jbGllbnRXaWR0aCAqIHNjYWxlO1xuICAgIHZhciB0d2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih7eDogd2lkdGggKyB3ICogTWF0aC5yYW5kb20oKX0pXG4gICAgICAudG8oeyB4OiAtd30sIDI2MDAwKVxuICAgICAgLnJlcGVhdChJbmZpbml0eSlcbiAgICAgIC5vblVwZGF0ZShmdW5jdGlvbih0aW1lKSB7XG4gICAgICAgIHZhciBfeCA9IHRoaXMueCAtICh3aWR0aCAvIChpICsgMSkpO1xuICAgICAgICB2YXIgX3kgPSAoTWF0aC5zaW4odGltZSkgKiAyKSArIHk7XG4gICAgICAgIGMuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gYHNjYWxlKCR7c2NhbGV9KSB0cmFuc2xhdGUoJHtfeH1weCwke195fXB4KWA7XG4gICAgICB9KVxuICAgICAgLnN0YXJ0KCk7XG4gIH0pO1xufSk7XG5cbnZhciBwID0gc2NlbmVzWzBdLnNjZW5lLnN0YXJ0KHNjZW5lc1swXSlcbiAgLnRoZW4oKCk9PnNjZW5lc1sxXS5zY2VuZS5zdGFydChzY2VuZXNbMV0pKVxuICAudGhlbigoKT0+c2NlbmVzWzJdLnNjZW5lLnN0YXJ0KHNjZW5lc1syXSkpXG4gIC50aGVuKCgpPT5zY2VuZXNbM10uc2NlbmUuc3RhcnQoc2NlbmVzWzNdKSlcbiAgLnRoZW4oKCk9PnNjZW5lc1s0XS5zY2VuZS5zdGFydChzY2VuZXNbNF0pKVxuICAudGhlbigoKT0+c2NlbmVzWzVdLnNjZW5lLnN0YXJ0KHNjZW5lc1s1XSkpXG4gIC50aGVuKCgpPT5zY2VuZXNbNl0uc2NlbmUuc3RhcnQoc2NlbmVzWzZdKSlcbiAgLnRoZW4oKCk9PnNjZW5lc1s3XS5zY2VuZS5zdGFydChzY2VuZXNbN10pKVxuICAudGhlbigoKT0+c2NlbmVzWzhdLnNjZW5lLnN0YXJ0KHNjZW5lc1s4XSkpXG4gIC50aGVuKCgpPT5zY2VuZXNbOV0uc2NlbmUuc3RhcnQoc2NlbmVzWzldKSlcbiAgLnRoZW4oKCk9PnNjZW5lc1sxMF0uc2NlbmUuc3RhcnQoc2NlbmVzWzEwXSkpXG4gIC50aGVuKCgpPT5zY2VuZXNbMTFdLnNjZW5lLnN0YXJ0KHNjZW5lc1sxMl0pKVxuICAudGhlbigoKT0+c2NlbmVzWzExXS5zY2VuZS5zdGFydChzY2VuZXNbMTJdKSlcbiAgLnRoZW4oKCk9PnNjZW5lc1sxM10uc2NlbmUuc3RhcnQoc2NlbmVzWzEzXSkpXG4gIC50aGVuKCgpPT5zY2VuZXNbMTRdLnNjZW5lLnN0YXJ0KHNjZW5lc1sxNF0pKVxuICAudGhlbigoKT0+c2NlbmVzWzE1XS5zY2VuZS5zdGFydChzY2VuZXNbMTVdKSlcbiAgLnRoZW4oKCk9PnNjZW5lc1sxNl0uc2NlbmUuc3RhcnQoc2NlbmVzWzE2XSkpO1xuXG5bXG4gICdsaXZldHMtb3JkJyxcbiAgJ3VwcHNhbGEnLFxuICAndGlyYW1pc3UnLFxuICAnaHV0Y2hpbnNvbicsXG4gICdsaW5jb2xudG9uJyxcbiAgJ2NvdXJ0aG91c2UnLFxuXS5mb3JFYWNoKGxvYWRJbnRvLmJpbmQobnVsbCwgbnVsbCkpO1xuXG52YXIgZmFkZUluID0gKCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1sb2FkaW5nJyk7XG5cbm9uKGRvY3VtZW50LmJvZHksICdjbGljaycsIGRlbGVnYXRlVG8oJ2J1dHRvbicsIChlKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdjbGlja2VkIHRoYXQgdGhpbmcnKTtcbn0pKTtcblxuKGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgVFdFRU4udXBkYXRlKCk7XG59KSgpO1xuXG4iLCJpbXBvcnQgeyBTY2VuZSB9IGZyb20gJy4vc2NlbmVzL19zY2VuZSc7XG5cbmV4cG9ydCB2YXIgc2NlbmVzID0gW1xuICB7XG4gICAgbmFtZTogJ0ludHJvZHVjdGlvbicsXG4gICAgc2NlbmU6IG5ldyBTY2VuZSgnSW50cm9kdWN0aW9uJyksXG4gICAgY29udGVudDogW1xuICAgICAgJ0ZpdmUgeWVhcnMgYWdvIGJlZ2FuIHRoZSBtb3N0IHdvbmRlcmZ1bCBwYXJ0IG9mIG15IGxpZmUuJyxcbiAgICAgICdUaGUgd29tYW4gYmV5b25kIG15IGRyZWFtcyBoYWQgYWdyZWVkIHRvIGJlIG15IHdpZmUuJyxcbiAgICAgICdCdXQgZmlyc3QsIGxldCB1cyB0cmF2ZWwgYmFjayB0byB3aGVyZSB0aGlzIGpvdXJuZXkgYmVnYW4uJ1xuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdMaXZldHMgT3JkJyxcbiAgICBzY2VuZTogbmV3IFNjZW5lKCdMaXZldHMgT3JkJywge2VsZW1lbnQ6ICdsaXZldHMtb3JkJ30pLFxuICAgIGNvbnRlbnQ6IFtcbiAgICAgICdJdCB3YXMgdGhlIFNlcHRlbWJlciBvZiAyMDA2IHRoYXQgd2UgbWV0LicsXG4gICAgICAnSSBjYW4gcGljdHVyZSBpbiBteSBtaW5kIHRoZSBtb21lbnQgeW91IHdhbGtlZCB1cCB0byBvdXIgZ3JvdXAuJyxcbiAgICAgICdJIHdhcyBoYXBweSB0byBoYXZlIGFub3RoZXIgQW1lcmljYW4gaW4gb3VyIHNtYWxsIGdyb3VwLicsXG4gICAgICAnSXQgd2FzbuKAmXQgbG9uZyBhZnRlciBvdXIgZmlyc3QgZW5jb3VudGVyIHRoYXQgSSBoZWFyZCBHb2Qgc2F5IHRvIG1lLCAnLFxuICAgICAgJ+KAnFRoYXQgd29tYW4gd2lsbCBiZSB5b3VyIHdpZmUu4oCdJ1xuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdUaXJhbWlzdScsXG4gICAgc2NlbmU6IG5ldyBTY2VuZSgnTGl2ZXRzIE9yZCcsIHtlbGVtZW50OiAndGlyYW1pc3UnfSksXG4gICAgY29udGVudDogW1xuICAgICAgJ1RoZSBkYXlzIGFuZCB3ZWVrcyBwYXNzZWQgYW5kIG91ciBmcmllbmRzaGlwIHN0cmVuZ3RoZW5lZC4nLFxuICAgICAgJ0p1c3QgYmV5b25kIENocmlzdG1hcywgaW4gRmVicnVhcnkgb2YgMjAwNyB0aGF0IHdlIG9mZmljaWFsbHkgYmVnYW4gb3VyIHJlbGF0aW9uc2hpcC4nLFxuICAgICAgJ0ZvciBvdXIgZmlyc3QgZGF0ZSB3ZSB3ZW50IHRvIFN0b2NraG9sbSBhbmQgZW5qb3llZCBlYWNoIG90aGVy4oCZcyBjb21wYW5pZXMgYW5kIGEgbWVhbCBhdCBUaXJhbWlzdS4nXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogJ1VwcHNhbGEnLFxuICAgIHNjZW5lOiBuZXcgU2NlbmUoJ1VwcHNhbGEnLCB7ZWxlbWVudDogJ3VwcHNhbGEnfSksXG4gICAgY29udGVudDogW1xuICAgICAgJ1dlIGVuam95ZWQgZWFjaCBvdGhlcnMgY29tcGFueSBtb3N0IGV2ZXJ5ZGF5IGZvciB0aGUgcmVzdCBvZiBvdXIgdGltZSBpbiBVcHBzYWxhLCBTd2VkZW4uJyxcbiAgICAgICdCdXQgYWxsIGdvb2QgdGhpbmdzIG11c3QgY29tZSB0byBhbiBlbmQuJyxcbiAgICAgICdBbmQgYXMgTWF5IGRyZXcgdG8gYSBjbG9zZSwgb3VyIGZsaWdodHMgaG9tZSBhbmQgYXBhcnQgaGFkIGNvbWUuJ1xuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdJbnRlcmx1ZGUnLFxuICAgIHNjZW5lOiBuZXcgU2NlbmUoJ0ludGVybHVkZScpLFxuICAgIGNvbnRlbnQ6IFtcbiAgICAgICdJIHN0aWxsIHJlbWVtYmVyIHRob3NlIG1vbnRocyBhcGFydCBhcyB0aGUgbW9zdCBsb25lbHkgYW5kIHBhaW5mdWwgb2YgbXkgbGlmZS4nLFxuICAgICAgJ0kgaGFkIGZhbGxlbiBpbiBsb3ZlIHdpdGggdGhpcyB3b21hbi4nLFxuICAgICAgJ015IGZlZWxpbmdzLCBob3BlcywgYW5kIGRyZWFtcyBoYWQgYWxsIGJlZW4gdHJhbnNmb3JtZWQgdG8gcmV2b2x2ZSBhcm91bmQgdGhpcyBzb3V0aGVybiBnaXJsLicsXG4gICAgICAnV2UgZGlkbuKAmXQgaGF2ZSBhIHBsYW4gZm9yIGhvdyBvdXIgbGl2ZXMgd291bGQgY29tZSB0b2dldGhlciBhZ2Fpbi4nLFxuICAgICAgJ1NvIHdlIGJlZ2FuIHRvIHRyYXZlbCBiYWNrIGFuZCBmb3J0aCZtZGFzaDt0byB2aXNpdCBlYWNoIG90aGVyIGFzIG11Y2ggYXMgd2UgY2FuLicsXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogJ0h1dGNoaW5zb24nLFxuICAgIHNjZW5lOiBuZXcgU2NlbmUoJ0ZpcnN0IHRyaXAgdG8gSHV0Y2hpbnNvbicsIHtlbGVtZW50OiAnaHV0Y2hpbnNvbid9KSxcbiAgICBjb250ZW50OiBbXG4gICAgICAnU2hlIGNhbWUgdG8gbWUgaW4gSHV0Y2hpbnNvbiwgTWlubmVzb3RhIGZpcnN0IGZvciBhIHdlZWsgaW4gdGhlIHN1bW1lcnRpbWUgdG8gbWVldCBteSBmYW1pbHkuJyxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnTGluY29sbnRvbicsXG4gICAgc2NlbmU6IG5ldyBTY2VuZSgnRmlyc3QgdHJpcCB0byBMaW5jb2xudG9uJywge2VsZW1lbnQ6ICdsaW5jb2xudG9uJ30pLFxuICAgIGNvbnRlbnQ6IFtcbiAgICAgICdUaGVuIEkgY2FtZSB0byBMaW5jb2xudG9uLCBOb3J0aCBDYXJvbGluYSBmb3IgYSB3ZWVrIHRvIG1lZXQgaGVyIGZhbWlseS4nLFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdIdXRjaGluc29uJyxcbiAgICBzY2VuZTogbmV3IFNjZW5lKCdTZWNvbmQgdHJpcCB0byBIdXRjaGluc29uJywge2VsZW1lbnQ6ICdodXRjaGluc29uJ30pLFxuICAgIGNvbnRlbnQ6IFtcbiAgICAgICdUaGVuIHNoZSBjYW1lIHRvIEh1dGNoaW5zb24uJyxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnTGluY29sbnRvbicsXG4gICAgc2NlbmU6IG5ldyBTY2VuZSgnU2Vjb25kIHRyaXAgdG8gTGluY29sbnRvbicsIHtlbGVtZW50OiAnbGluY29sbnRvbid9KSxcbiAgICBjb250ZW50OiBbXG4gICAgICAnQW5kIEkgdG8gTGluY29sbnRvbi4nLFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdIdXRjaGluc29uJyxcbiAgICBzY2VuZTogbmV3IFNjZW5lKCdUaGlyZCB0cmlwIHRvIEh1dGNoaW5zb24nLCB7ZWxlbWVudDogJ2h1dGNoaW5zb24nfSksXG4gICAgY29udGVudDogW1xuICAgICAgJ0FuZCBzaGUgdG8gSHV0Y2hpbnNvbi4nLFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdMaW5jb2xudG9uJyxcbiAgICBzY2VuZTogbmV3IFNjZW5lKCdUaGlyZCB0cmlwIHRvIExpbmNvbG50b24nLCB7ZWxlbWVudDogJ2xpbmNvbG50b24nfSksXG4gICAgY29udGVudDogW1xuICAgICAgJ0FuZCBJIHRvIExpbmNvbG50b24uJyxcbiAgICAgICdJdCDigJxzbm93ZWTigJ0uIFNjaG9vbCB3YXMgY2FuY2VsZWQuIEdyb2NlcmllcyB3ZXJlIGxhY2tpbmcgbWlsayBhbmQgYnJlYWQuJyxcbiAgICAgICdUaGVyZSB3YXMgbm8gc25vdyBvbiB0aGUgZ3JvdW5kLicsXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogJ0h1dGNoaW5zb24nLFxuICAgIHNjZW5lOiBuZXcgU2NlbmUoJ0ZvdXJ0aCB0cmlwIHRvIEh1dGNoaW5zb24nLCB7ZWxlbWVudDogJ2h1dGNoaW5zb24nfSksXG4gICAgY29udGVudDogW1xuICAgICAgJ0FuZCBzaGUgY2FtZSB0byBIdXRjaGluc29uLicsXG4gICAgICAnSXQgc25vd2VkLiBSZWFsLCBwcm9wZXIgc25vdy4nLFxuICAgICAgJzxiciAvPicsXG4gICAgICAnVGhhdCBkYXkgaXQgd2FzIGRlY2lkZWQuIEkgd291bGQgYmUgbW92aW5nIHRvIE5vcnRoIENhcm9saW5hLicsXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogJ0xpbmNvbG50b24nLFxuICAgIHNjZW5lOiBuZXcgU2NlbmUoJ01vdmUgdG8gTGluY29sbnRvbicsIHtlbGVtZW50OiAnbGluY29sbnRvbid9KSxcbiAgICBjb250ZW50OiBbXG4gICAgICAnSSBwdXJjaGFzZWQgYSBjYXIgaW4gdGhlIEp1bHkgb2YgMjAwOC4gSSBwYWNrZWQgYWxsIG9mIG15IHRoaW5ncyBpbiBpdCBhbmQgZHJvdmUgZG93biBpbiBBdWd1c3QuJyxcbiAgICAgICdBbmQgdGh1cyBiZWdhbiBvdXIgc3RhdGVzaWRlIGxpZmUgdG9nZXRoZXIuJyxcbiAgICAgICdUaGlzIHdhcyBxdWl0ZSBkaWZmZXJlbnQgZnJvbSBvdXIgbGlmZSBpbiBTd2VkZW4uIFdlIHdlcmUgbm8gbG9uZ2VyIHN0dWRlbnRzIGFuZCBoYWQgdG8gd29yayBhbmQgbGVhcm4gaG93IHRvIGhhdmUgYSByZWxhdGlvbnNoaXAgd2hpbGUgdGhlIHJlcXVpcmVtZW50cyBvZiBkYWlseSBsaWZlIGJlZ2FuIGFyb3VuZCB1cy4nLFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdMaW5jb2xudG9uJyxcbiAgICBzY2VuZTogbmV3IFNjZW5lKCdFbmdhZ2VkLiBJIGFzaycsIHtlbGVtZW50OiAnbGluY29sbnRvbid9KSxcbiAgICBjb250ZW50OiBbXG4gICAgICAnQW5kIGZvciBDaHJpc3RtYXMsIHdlIGdvdCBlbmdhZ2VkLicsXG4gICAgICAnSSBzYWlkLCBcIktlbGx5LiBXaWxsIHlvdSBtYXJyeSBtZT8nXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogJ0xpbmNvbG50b24nLFxuICAgIHNjZW5lOiBuZXcgU2NlbmUoJ0VuZ2FnZWQuIFNoZSBzYXlzIHllcy4gJywge2VsZW1lbnQ6ICdsaW5jb2xudG9uJ30pLFxuICAgIGNvbnRlbnQ6IFtcbiAgICAgICdZZXMhIE9mIGNvdXJzZSBJIHdpbGwhJ1xuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdMaW5jb2xudG9uJyxcbiAgICBzY2VuZTogbmV3IFNjZW5lKCdNYXJyaWVkJywge2VsZW1lbnQ6ICdjb3VydGhvdXNlJ30pLFxuICAgIGNvbnRlbnQ6IFtcbiAgICAgICdBbmQgb24gdGhpcyBkYXksIE1heSAxNnRoLCA1IHllYXJzIGFnbycsXG4gICAgICAnS2VsbHkgUmVuZWUgUmljaGFyZHMgYW5kIER1c3RhbiBMZWUgS2FzdGVuIHdlcmUgd2VkLicsXG4gICAgICAnJyxcbiAgICAgICdJIGxvdmUgeW91LicsXG4gICAgXVxuICB9LFxuXTtcblxuIiwidmFyIFByb21pc2UgPSByZXF1aXJlKCdlczYtcHJvbWlzZScpLlByb21pc2U7XG52YXIgdHlwZXdyaXRlciA9IHJlcXVpcmUoJ3R5cGV3cml0ZXInKTtcblxuaW1wb3J0IHsgJCQgfSBmcm9tICcuLy4uL2VzNnF1ZXJ5JztcbmltcG9ydCB7IGZhZGVJbnRvIH0gZnJvbSAnLi8uLi9fdXRpbCc7XG5pbXBvcnQgeyBDT05GSUcgfSBmcm9tICcuLy4uL2NvbmZpZyc7XG5cbnZhciBnZW5lcmF0ZVR5cGV3cml0ZXIgPSAobmFtZSkgPT4ge1xuICB2YXIgbWluU3BlZWQgPSA4LCBtYXhTcGVlZCA9IDEyO1xuICBpZiAoQ09ORklHW25hbWVdKSB7XG4gICAgdmFyIG1pblNwZWVkID0gQ09ORklHW25hbWVdLk1JTl9TUEVFRFxuICAgIHZhciBtYXhTcGVlZCA9IENPTkZJR1tuYW1lXS5NQVhfU1BFRURcbiAgfVxuICByZXR1cm4gdHlwZXdyaXRlcihTY2VuZS5UWVBFV1JJVEVSKVxuICAgIC53aXRoQWNjdXJhY3koOTkuOSlcbiAgICAud2l0aE1pbmltdW1TcGVlZChtaW5TcGVlZClcbiAgICAud2l0aE1heGltdW1TcGVlZChtYXhTcGVlZClcbiAgICAuYnVpbGQoKTtcbn1cblxuY2xhc3MgU2NlbmUge1xuICBjb25zdHJ1Y3RvcihuYW1lLCBvcHRpb25zLCBzY2VuZUZuKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBvcHRpb25zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgc2NlbmVGbiA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuc2NlbmVGbiA9IHNjZW5lRm4gfHwgdGhpcy5fZGVmYXVsdFNjZW5lRm47XG5cbiAgICB0aGlzLl9wbGF5UHJvbWlzZTtcbiAgICB0aGlzLnR5cGV3cml0ZXIgPSBnZW5lcmF0ZVR5cGV3cml0ZXIodGhpcy5uYW1lKTtcbiAgfVxuXG4gIHN0YXJ0KGNvbnRleHQpIHtcbiAgICBpZiAodGhpcy5fcGxheVByb21pc2UpXG4gICAgICByZXR1cm4gdGhpcy5fcGxheVByb21pc2U7XG5cbiAgICB0aGlzLl9wbGF5UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuc2NlbmVGbihjb250ZXh0LCByZXNvbHZlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9wbGF5UHJvbWlzZTtcbiAgfVxuXG4gIF9kZWZhdWx0U2NlbmVGbihjb250ZW50LCBkb25lKSB7XG4gICAgY29uc29sZS5sb2coJ1N0YXJ0aW5nICVzJywgdGhpcy5uYW1lKTtcbiAgICB2YXIgdHcgPSB0aGlzLnR5cGV3cml0ZXI7XG5cbiAgICB0dy5jbGVhcigpO1xuICAgIGNvbnRlbnQuY29udGVudC5mb3JFYWNoKChsLCBpKSA9PiB7XG4gICAgICB0d1xuICAgICAgICAud2FpdFJhbmdlKDUwMCwgMjAwMCwgKG8pID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5lbGVtZW50IHx8IGkgIT09IDApIHJldHVybjtcblxuICAgICAgICAgIGZhZGVJbnRvKCQkKCcjc2NlbmUnKSwgdGhpcy5vcHRpb25zLmVsZW1lbnQpO1xuICAgICAgICB9KVxuICAgICAgICAudHlwZShsKVxuICAgICAgICAucHV0KCc8YnIgLz4nKTtcbiAgICB9KTtcblxuICAgIHR3XG4gICAgICAud2FpdFJhbmdlKDUwMCwgMjAwMClcbiAgICAgIC50eXBlKCcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFbmRpbmcgJXMnLCB0aGlzLm5hbWUpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgfVxufVxuXG5TY2VuZS5UWVBFV1JJVEVSID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R5cGV3cml0ZXInKTtcblNjZW5lLkNPTkZJRyA9IENPTkZJRztcblxubW9kdWxlLmV4cG9ydHMgPSB7IFNjZW5lIH07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFByb21pc2UgPSByZXF1aXJlKFwiLi9wcm9taXNlL3Byb21pc2VcIikuUHJvbWlzZTtcbnZhciBwb2x5ZmlsbCA9IHJlcXVpcmUoXCIuL3Byb21pc2UvcG9seWZpbGxcIikucG9seWZpbGw7XG5leHBvcnRzLlByb21pc2UgPSBQcm9taXNlO1xuZXhwb3J0cy5wb2x5ZmlsbCA9IHBvbHlmaWxsOyIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHRvU3RyaW5nICovXG5cbnZhciBpc0FycmF5ID0gcmVxdWlyZShcIi4vdXRpbHNcIikuaXNBcnJheTtcbnZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZShcIi4vdXRpbHNcIikuaXNGdW5jdGlvbjtcblxuLyoqXG4gIFJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gYWxsIHRoZSBnaXZlbiBwcm9taXNlcyBoYXZlIGJlZW5cbiAgZnVsZmlsbGVkLCBvciByZWplY3RlZCBpZiBhbnkgb2YgdGhlbSBiZWNvbWUgcmVqZWN0ZWQuIFRoZSByZXR1cm4gcHJvbWlzZVxuICBpcyBmdWxmaWxsZWQgd2l0aCBhbiBhcnJheSB0aGF0IGdpdmVzIGFsbCB0aGUgdmFsdWVzIGluIHRoZSBvcmRlciB0aGV5IHdlcmVcbiAgcGFzc2VkIGluIHRoZSBgcHJvbWlzZXNgIGFycmF5IGFyZ3VtZW50LlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICB2YXIgcHJvbWlzZTEgPSBSU1ZQLnJlc29sdmUoMSk7XG4gIHZhciBwcm9taXNlMiA9IFJTVlAucmVzb2x2ZSgyKTtcbiAgdmFyIHByb21pc2UzID0gUlNWUC5yZXNvbHZlKDMpO1xuICB2YXIgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBSU1ZQLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gICAgLy8gVGhlIGFycmF5IGhlcmUgd291bGQgYmUgWyAxLCAyLCAzIF07XG4gIH0pO1xuICBgYGBcblxuICBJZiBhbnkgb2YgdGhlIGBwcm9taXNlc2AgZ2l2ZW4gdG8gYFJTVlAuYWxsYCBhcmUgcmVqZWN0ZWQsIHRoZSBmaXJzdCBwcm9taXNlXG4gIHRoYXQgaXMgcmVqZWN0ZWQgd2lsbCBiZSBnaXZlbiBhcyBhbiBhcmd1bWVudCB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZXMnc1xuICByZWplY3Rpb24gaGFuZGxlci4gRm9yIGV4YW1wbGU6XG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIHZhciBwcm9taXNlMSA9IFJTVlAucmVzb2x2ZSgxKTtcbiAgdmFyIHByb21pc2UyID0gUlNWUC5yZWplY3QobmV3IEVycm9yKFwiMlwiKSk7XG4gIHZhciBwcm9taXNlMyA9IFJTVlAucmVqZWN0KG5ldyBFcnJvcihcIjNcIikpO1xuICB2YXIgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBSU1ZQLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gICAgLy8gQ29kZSBoZXJlIG5ldmVyIHJ1bnMgYmVjYXVzZSB0aGVyZSBhcmUgcmVqZWN0ZWQgcHJvbWlzZXMhXG4gIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgLy8gZXJyb3IubWVzc2FnZSA9PT0gXCIyXCJcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgYWxsXG4gIEBmb3IgUlNWUFxuICBAcGFyYW0ge0FycmF5fSBwcm9taXNlc1xuICBAcGFyYW0ge1N0cmluZ30gbGFiZWxcbiAgQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIGFsbCBgcHJvbWlzZXNgIGhhdmUgYmVlblxuICBmdWxmaWxsZWQsIG9yIHJlamVjdGVkIGlmIGFueSBvZiB0aGVtIGJlY29tZSByZWplY3RlZC5cbiovXG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIFByb21pc2UgPSB0aGlzO1xuXG4gIGlmICghaXNBcnJheShwcm9taXNlcykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIGFsbC4nKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdLCByZW1haW5pbmcgPSBwcm9taXNlcy5sZW5ndGgsXG4gICAgcHJvbWlzZTtcblxuICAgIGlmIChyZW1haW5pbmcgPT09IDApIHtcbiAgICAgIHJlc29sdmUoW10pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVyKGluZGV4KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZUFsbChpbmRleCwgdmFsdWUpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlQWxsKGluZGV4LCB2YWx1ZSkge1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgIGlmICgtLXJlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvbWlzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlc1tpXTtcblxuICAgICAgaWYgKHByb21pc2UgJiYgaXNGdW5jdGlvbihwcm9taXNlLnRoZW4pKSB7XG4gICAgICAgIHByb21pc2UudGhlbihyZXNvbHZlcihpKSwgcmVqZWN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmVBbGwoaSwgcHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0cy5hbGwgPSBhbGw7IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBicm93c2VyR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xudmFyIEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbnZhciBsb2NhbCA9ICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykgPyBnbG9iYWwgOiAodGhpcyA9PT0gdW5kZWZpbmVkPyB3aW5kb3c6dGhpcyk7XG5cbi8vIG5vZGVcbmZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB1c2VTZXRUaW1lb3V0KCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgbG9jYWwuc2V0VGltZW91dChmbHVzaCwgMSk7XG4gIH07XG59XG5cbnZhciBxdWV1ZSA9IFtdO1xuZnVuY3Rpb24gZmx1c2goKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdHVwbGUgPSBxdWV1ZVtpXTtcbiAgICB2YXIgY2FsbGJhY2sgPSB0dXBsZVswXSwgYXJnID0gdHVwbGVbMV07XG4gICAgY2FsbGJhY2soYXJnKTtcbiAgfVxuICBxdWV1ZSA9IFtdO1xufVxuXG52YXIgc2NoZWR1bGVGbHVzaDtcblxuLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbmlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xufSBlbHNlIGlmIChCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTXV0YXRpb25PYnNlcnZlcigpO1xufSBlbHNlIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZVNldFRpbWVvdXQoKTtcbn1cblxuZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gIHZhciBsZW5ndGggPSBxdWV1ZS5wdXNoKFtjYWxsYmFjaywgYXJnXSk7XG4gIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICAvLyBJZiBsZW5ndGggaXMgMSwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgLy8gSWYgYWRkaXRpb25hbCBjYWxsYmFja3MgYXJlIHF1ZXVlZCBiZWZvcmUgdGhlIHF1ZXVlIGlzIGZsdXNoZWQsIHRoZXlcbiAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgc2NoZWR1bGVGbHVzaCgpO1xuICB9XG59XG5cbmV4cG9ydHMuYXNhcCA9IGFzYXA7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5zZXJ0LW1vZHVsZS1nbG9iYWxzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIlwidXNlIHN0cmljdFwiO1xudmFyIGNvbmZpZyA9IHtcbiAgaW5zdHJ1bWVudDogZmFsc2Vcbn07XG5cbmZ1bmN0aW9uIGNvbmZpZ3VyZShuYW1lLCB2YWx1ZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb25maWdbbmFtZV07XG4gIH1cbn1cblxuZXhwb3J0cy5jb25maWcgPSBjb25maWc7XG5leHBvcnRzLmNvbmZpZ3VyZSA9IGNvbmZpZ3VyZTsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG5cInVzZSBzdHJpY3RcIjtcbi8qZ2xvYmFsIHNlbGYqL1xudmFyIFJTVlBQcm9taXNlID0gcmVxdWlyZShcIi4vcHJvbWlzZVwiKS5Qcm9taXNlO1xudmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKFwiLi91dGlsc1wiKS5pc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgdmFyIGxvY2FsO1xuXG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvY2FsID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgIGxvY2FsID0gd2luZG93O1xuICB9IGVsc2Uge1xuICAgIGxvY2FsID0gc2VsZjtcbiAgfVxuXG4gIHZhciBlczZQcm9taXNlU3VwcG9ydCA9IFxuICAgIFwiUHJvbWlzZVwiIGluIGxvY2FsICYmXG4gICAgLy8gU29tZSBvZiB0aGVzZSBtZXRob2RzIGFyZSBtaXNzaW5nIGZyb21cbiAgICAvLyBGaXJlZm94L0Nocm9tZSBleHBlcmltZW50YWwgaW1wbGVtZW50YXRpb25zXG4gICAgXCJyZXNvbHZlXCIgaW4gbG9jYWwuUHJvbWlzZSAmJlxuICAgIFwicmVqZWN0XCIgaW4gbG9jYWwuUHJvbWlzZSAmJlxuICAgIFwiYWxsXCIgaW4gbG9jYWwuUHJvbWlzZSAmJlxuICAgIFwicmFjZVwiIGluIGxvY2FsLlByb21pc2UgJiZcbiAgICAvLyBPbGRlciB2ZXJzaW9uIG9mIHRoZSBzcGVjIGhhZCBhIHJlc29sdmVyIG9iamVjdFxuICAgIC8vIGFzIHRoZSBhcmcgcmF0aGVyIHRoYW4gYSBmdW5jdGlvblxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXNvbHZlO1xuICAgICAgbmV3IGxvY2FsLlByb21pc2UoZnVuY3Rpb24ocikgeyByZXNvbHZlID0gcjsgfSk7XG4gICAgICByZXR1cm4gaXNGdW5jdGlvbihyZXNvbHZlKTtcbiAgICB9KCkpO1xuXG4gIGlmICghZXM2UHJvbWlzZVN1cHBvcnQpIHtcbiAgICBsb2NhbC5Qcm9taXNlID0gUlNWUFByb21pc2U7XG4gIH1cbn1cblxuZXhwb3J0cy5wb2x5ZmlsbCA9IHBvbHlmaWxsO1xufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBjb25maWcgPSByZXF1aXJlKFwiLi9jb25maWdcIikuY29uZmlnO1xudmFyIGNvbmZpZ3VyZSA9IHJlcXVpcmUoXCIuL2NvbmZpZ1wiKS5jb25maWd1cmU7XG52YXIgb2JqZWN0T3JGdW5jdGlvbiA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpLm9iamVjdE9yRnVuY3Rpb247XG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpLmlzRnVuY3Rpb247XG52YXIgbm93ID0gcmVxdWlyZShcIi4vdXRpbHNcIikubm93O1xudmFyIGFsbCA9IHJlcXVpcmUoXCIuL2FsbFwiKS5hbGw7XG52YXIgcmFjZSA9IHJlcXVpcmUoXCIuL3JhY2VcIikucmFjZTtcbnZhciBzdGF0aWNSZXNvbHZlID0gcmVxdWlyZShcIi4vcmVzb2x2ZVwiKS5yZXNvbHZlO1xudmFyIHN0YXRpY1JlamVjdCA9IHJlcXVpcmUoXCIuL3JlamVjdFwiKS5yZWplY3Q7XG52YXIgYXNhcCA9IHJlcXVpcmUoXCIuL2FzYXBcIikuYXNhcDtcblxudmFyIGNvdW50ZXIgPSAwO1xuXG5jb25maWcuYXN5bmMgPSBhc2FwOyAvLyBkZWZhdWx0IGFzeW5jIGlzIGFzYXA7XG5cbmZ1bmN0aW9uIFByb21pc2UocmVzb2x2ZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKHJlc29sdmVyKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gIH1cblxuICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gIGludm9rZVJlc29sdmVyKHJlc29sdmVyLCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gaW52b2tlUmVzb2x2ZXIocmVzb2x2ZXIsIHByb21pc2UpIHtcbiAgZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpIHtcbiAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gIH1cblxuICB0cnkge1xuICAgIHJlc29sdmVyKHJlc29sdmVQcm9taXNlLCByZWplY3RQcm9taXNlKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmVqZWN0UHJvbWlzZShlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gIHZhciBoYXNDYWxsYmFjayA9IGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgdmFsdWUsIGVycm9yLCBzdWNjZWVkZWQsIGZhaWxlZDtcblxuICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGZhaWxlZCA9IHRydWU7XG4gICAgICBlcnJvciA9IGU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gZGV0YWlsO1xuICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gIH1cblxuICBpZiAoaGFuZGxlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpKSB7XG4gICAgcmV0dXJuO1xuICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKGZhaWxlZCkge1xuICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gRlVMRklMTEVEKSB7XG4gICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gUkVKRUNURUQpIHtcbiAgICByZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICB9XG59XG5cbnZhciBQRU5ESU5HICAgPSB2b2lkIDA7XG52YXIgU0VBTEVEICAgID0gMDtcbnZhciBGVUxGSUxMRUQgPSAxO1xudmFyIFJFSkVDVEVEICA9IDI7XG5cbmZ1bmN0aW9uIHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICB2YXIgc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gIHN1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgRlVMRklMTEVEXSA9IG9uRnVsZmlsbG1lbnQ7XG4gIHN1YnNjcmliZXJzW2xlbmd0aCArIFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcbn1cblxuZnVuY3Rpb24gcHVibGlzaChwcm9taXNlLCBzZXR0bGVkKSB7XG4gIHZhciBjaGlsZCwgY2FsbGJhY2ssIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnMsIGRldGFpbCA9IHByb21pc2UuX2RldGFpbDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgfVxuXG4gIHByb21pc2UuX3N1YnNjcmliZXJzID0gbnVsbDtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBQcm9taXNlLFxuXG4gIF9zdGF0ZTogdW5kZWZpbmVkLFxuICBfZGV0YWlsOiB1bmRlZmluZWQsXG4gIF9zdWJzY3JpYmVyczogdW5kZWZpbmVkLFxuXG4gIHRoZW46IGZ1bmN0aW9uKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuXG4gICAgdmFyIHRoZW5Qcm9taXNlID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZnVuY3Rpb24oKSB7fSk7XG5cbiAgICBpZiAodGhpcy5fc3RhdGUpIHtcbiAgICAgIHZhciBjYWxsYmFja3MgPSBhcmd1bWVudHM7XG4gICAgICBjb25maWcuYXN5bmMoZnVuY3Rpb24gaW52b2tlUHJvbWlzZUNhbGxiYWNrKCkge1xuICAgICAgICBpbnZva2VDYWxsYmFjayhwcm9taXNlLl9zdGF0ZSwgdGhlblByb21pc2UsIGNhbGxiYWNrc1twcm9taXNlLl9zdGF0ZSAtIDFdLCBwcm9taXNlLl9kZXRhaWwpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1YnNjcmliZSh0aGlzLCB0aGVuUHJvbWlzZSwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGVuUHJvbWlzZTtcbiAgfSxcblxuICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICB9XG59O1xuXG5Qcm9taXNlLmFsbCA9IGFsbDtcblByb21pc2UucmFjZSA9IHJhY2U7XG5Qcm9taXNlLnJlc29sdmUgPSBzdGF0aWNSZXNvbHZlO1xuUHJvbWlzZS5yZWplY3QgPSBzdGF0aWNSZWplY3Q7XG5cbmZ1bmN0aW9uIGhhbmRsZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlKSB7XG4gIHZhciB0aGVuID0gbnVsbCxcbiAgcmVzb2x2ZWQ7XG5cbiAgdHJ5IHtcbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpO1xuICAgIH1cblxuICAgIGlmIChvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdGhlbiA9IHZhbHVlLnRoZW47XG5cbiAgICAgIGlmIChpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgaWYgKHJlc29sdmVkKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICE9PSB2YWwpIHtcbiAgICAgICAgICAgIHJlc29sdmUocHJvbWlzZSwgdmFsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnVsZmlsbChwcm9taXNlLCB2YWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgaWYgKHJlc29sdmVkKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgcmVqZWN0KHByb21pc2UsIHZhbCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAocmVzb2x2ZWQpIHsgcmV0dXJuIHRydWU7IH1cbiAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKCFoYW5kbGVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSkpIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykgeyByZXR1cm47IH1cbiAgcHJvbWlzZS5fc3RhdGUgPSBTRUFMRUQ7XG4gIHByb21pc2UuX2RldGFpbCA9IHZhbHVlO1xuXG4gIGNvbmZpZy5hc3luYyhwdWJsaXNoRnVsZmlsbG1lbnQsIHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiByZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykgeyByZXR1cm47IH1cbiAgcHJvbWlzZS5fc3RhdGUgPSBTRUFMRUQ7XG4gIHByb21pc2UuX2RldGFpbCA9IHJlYXNvbjtcblxuICBjb25maWcuYXN5bmMocHVibGlzaFJlamVjdGlvbiwgcHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2hGdWxmaWxsbWVudChwcm9taXNlKSB7XG4gIHB1Ymxpc2gocHJvbWlzZSwgcHJvbWlzZS5fc3RhdGUgPSBGVUxGSUxMRUQpO1xufVxuXG5mdW5jdGlvbiBwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgcHVibGlzaChwcm9taXNlLCBwcm9taXNlLl9zdGF0ZSA9IFJFSkVDVEVEKTtcbn1cblxuZXhwb3J0cy5Qcm9taXNlID0gUHJvbWlzZTsiLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCB0b1N0cmluZyAqL1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKFwiLi91dGlsc1wiKS5pc0FycmF5O1xuXG4vKipcbiAgYFJTVlAucmFjZWAgYWxsb3dzIHlvdSB0byB3YXRjaCBhIHNlcmllcyBvZiBwcm9taXNlcyBhbmQgYWN0IGFzIHNvb24gYXMgdGhlXG4gIGZpcnN0IHByb21pc2UgZ2l2ZW4gdG8gdGhlIGBwcm9taXNlc2AgYXJndW1lbnQgZnVsZmlsbHMgb3IgcmVqZWN0cy5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgdmFyIHByb21pc2UxID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoXCJwcm9taXNlIDFcIik7XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2UyID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoXCJwcm9taXNlIDJcIik7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUlNWUC5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gcmVzdWx0ID09PSBcInByb21pc2UgMlwiIGJlY2F1c2UgaXQgd2FzIHJlc29sdmVkIGJlZm9yZSBwcm9taXNlMVxuICAgIC8vIHdhcyByZXNvbHZlZC5cbiAgfSk7XG4gIGBgYFxuXG4gIGBSU1ZQLnJhY2VgIGlzIGRldGVybWluaXN0aWMgaW4gdGhhdCBvbmx5IHRoZSBzdGF0ZSBvZiB0aGUgZmlyc3QgY29tcGxldGVkXG4gIHByb21pc2UgbWF0dGVycy4gRm9yIGV4YW1wbGUsIGV2ZW4gaWYgb3RoZXIgcHJvbWlzZXMgZ2l2ZW4gdG8gdGhlIGBwcm9taXNlc2BcbiAgYXJyYXkgYXJndW1lbnQgYXJlIHJlc29sdmVkLCBidXQgdGhlIGZpcnN0IGNvbXBsZXRlZCBwcm9taXNlIGhhcyBiZWNvbWVcbiAgcmVqZWN0ZWQgYmVmb3JlIHRoZSBvdGhlciBwcm9taXNlcyBiZWNhbWUgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICB3aWxsIGJlY29tZSByZWplY3RlZDpcblxuICBgYGBqYXZhc2NyaXB0XG4gIHZhciBwcm9taXNlMSA9IG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKFwicHJvbWlzZSAxXCIpO1xuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlMiA9IG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZWplY3QobmV3IEVycm9yKFwicHJvbWlzZSAyXCIpKTtcbiAgICB9LCAxMDApO1xuICB9KTtcblxuICBSU1ZQLnJhY2UoW3Byb21pc2UxLCBwcm9taXNlMl0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gXCJwcm9taXNlMlwiIGJlY2F1c2UgcHJvbWlzZSAyIGJlY2FtZSByZWplY3RlZCBiZWZvcmVcbiAgICAvLyBwcm9taXNlIDEgYmVjYW1lIGZ1bGZpbGxlZFxuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCByYWNlXG4gIEBmb3IgUlNWUFxuICBAcGFyYW0ge0FycmF5fSBwcm9taXNlcyBhcnJheSBvZiBwcm9taXNlcyB0byBvYnNlcnZlXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGRlc2NyaWJpbmcgdGhlIHByb21pc2UgcmV0dXJuZWQuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHRoYXQgYmVjb21lcyBmdWxmaWxsZWQgd2l0aCB0aGUgdmFsdWUgdGhlIGZpcnN0XG4gIGNvbXBsZXRlZCBwcm9taXNlcyBpcyByZXNvbHZlZCB3aXRoIGlmIHRoZSBmaXJzdCBjb21wbGV0ZWQgcHJvbWlzZSB3YXNcbiAgZnVsZmlsbGVkLCBvciByZWplY3RlZCB3aXRoIHRoZSByZWFzb24gdGhhdCB0aGUgZmlyc3QgY29tcGxldGVkIHByb21pc2VcbiAgd2FzIHJlamVjdGVkIHdpdGguXG4qL1xuZnVuY3Rpb24gcmFjZShwcm9taXNlcykge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgUHJvbWlzZSA9IHRoaXM7XG5cbiAgaWYgKCFpc0FycmF5KHByb21pc2VzKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKTtcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXSwgcHJvbWlzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvbWlzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlc1tpXTtcblxuICAgICAgaWYgKHByb21pc2UgJiYgdHlwZW9mIHByb21pc2UudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9taXNlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUocHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0cy5yYWNlID0gcmFjZTsiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICBgUlNWUC5yZWplY3RgIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZWNvbWUgcmVqZWN0ZWQgd2l0aCB0aGUgcGFzc2VkXG4gIGByZWFzb25gLiBgUlNWUC5yZWplY3RgIGlzIGVzc2VudGlhbGx5IHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIHZhciBwcm9taXNlID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyBDb2RlIGhlcmUgZG9lc24ndCBydW4gYmVjYXVzZSB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIHZhciBwcm9taXNlID0gUlNWUC5yZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyBDb2RlIGhlcmUgZG9lc24ndCBydW4gYmVjYXVzZSB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVqZWN0XG4gIEBmb3IgUlNWUFxuICBAcGFyYW0ge0FueX0gcmVhc29uIHZhbHVlIHRoYXQgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoLlxuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBpZGVudGlmeWluZyB0aGUgcmV0dXJuZWQgcHJvbWlzZS5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSByZWplY3RlZCB3aXRoIHRoZSBnaXZlblxuICBgcmVhc29uYC5cbiovXG5mdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBQcm9taXNlID0gdGhpcztcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlamVjdChyZWFzb24pO1xuICB9KTtcbn1cblxuZXhwb3J0cy5yZWplY3QgPSByZWplY3Q7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5mdW5jdGlvbiByZXNvbHZlKHZhbHVlKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSB0aGlzKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgdmFyIFByb21pc2UgPSB0aGlzO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLnJlc29sdmUgPSByZXNvbHZlOyIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gIHJldHVybiBpc0Z1bmN0aW9uKHgpIHx8ICh0eXBlb2YgeCA9PT0gXCJvYmplY3RcIiAmJiB4ICE9PSBudWxsKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5KHgpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xufVxuXG4vLyBEYXRlLm5vdyBpcyBub3QgYXZhaWxhYmxlIGluIGJyb3dzZXJzIDwgSUU5XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9EYXRlL25vdyNDb21wYXRpYmlsaXR5XG52YXIgbm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuXG5leHBvcnRzLm9iamVjdE9yRnVuY3Rpb24gPSBvYmplY3RPckZ1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5leHBvcnRzLm5vdyA9IG5vdzsiLCIvLyBodHRwOi8vd2lraS5jb21tb25qcy5vcmcvd2lraS9Vbml0X1Rlc3RpbmcvMS4wXG4vL1xuLy8gVEhJUyBJUyBOT1QgVEVTVEVEIE5PUiBMSUtFTFkgVE8gV09SSyBPVVRTSURFIFY4IVxuLy9cbi8vIE9yaWdpbmFsbHkgZnJvbSBuYXJ3aGFsLmpzIChodHRwOi8vbmFyd2hhbGpzLm9yZylcbi8vIENvcHlyaWdodCAoYykgMjAwOSBUaG9tYXMgUm9iaW5zb24gPDI4MG5vcnRoLmNvbT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG9cbi8vIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXG4vLyByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Jcbi8vIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOXG4vLyBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gd2hlbiB1c2VkIGluIG5vZGUsIHRoaXMgd2lsbCBhY3R1YWxseSBsb2FkIHRoZSB1dGlsIG1vZHVsZSB3ZSBkZXBlbmQgb25cbi8vIHZlcnN1cyBsb2FkaW5nIHRoZSBidWlsdGluIHV0aWwgbW9kdWxlIGFzIGhhcHBlbnMgb3RoZXJ3aXNlXG4vLyB0aGlzIGlzIGEgYnVnIGluIG5vZGUgbW9kdWxlIGxvYWRpbmcgYXMgZmFyIGFzIEkgYW0gY29uY2VybmVkXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwvJyk7XG5cbnZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gMS4gVGhlIGFzc2VydCBtb2R1bGUgcHJvdmlkZXMgZnVuY3Rpb25zIHRoYXQgdGhyb3dcbi8vIEFzc2VydGlvbkVycm9yJ3Mgd2hlbiBwYXJ0aWN1bGFyIGNvbmRpdGlvbnMgYXJlIG5vdCBtZXQuIFRoZVxuLy8gYXNzZXJ0IG1vZHVsZSBtdXN0IGNvbmZvcm0gdG8gdGhlIGZvbGxvd2luZyBpbnRlcmZhY2UuXG5cbnZhciBhc3NlcnQgPSBtb2R1bGUuZXhwb3J0cyA9IG9rO1xuXG4vLyAyLiBUaGUgQXNzZXJ0aW9uRXJyb3IgaXMgZGVmaW5lZCBpbiBhc3NlcnQuXG4vLyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHsgbWVzc2FnZTogbWVzc2FnZSxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogZXhwZWN0ZWQgfSlcblxuYXNzZXJ0LkFzc2VydGlvbkVycm9yID0gZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3Iob3B0aW9ucykge1xuICB0aGlzLm5hbWUgPSAnQXNzZXJ0aW9uRXJyb3InO1xuICB0aGlzLmFjdHVhbCA9IG9wdGlvbnMuYWN0dWFsO1xuICB0aGlzLmV4cGVjdGVkID0gb3B0aW9ucy5leHBlY3RlZDtcbiAgdGhpcy5vcGVyYXRvciA9IG9wdGlvbnMub3BlcmF0b3I7XG4gIGlmIChvcHRpb25zLm1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2U7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5tZXNzYWdlID0gZ2V0TWVzc2FnZSh0aGlzKTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSB0cnVlO1xuICB9XG4gIHZhciBzdGFja1N0YXJ0RnVuY3Rpb24gPSBvcHRpb25zLnN0YWNrU3RhcnRGdW5jdGlvbiB8fCBmYWlsO1xuXG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHN0YWNrU3RhcnRGdW5jdGlvbik7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gbm9uIHY4IGJyb3dzZXJzIHNvIHdlIGNhbiBoYXZlIGEgc3RhY2t0cmFjZVxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoKTtcbiAgICBpZiAoZXJyLnN0YWNrKSB7XG4gICAgICB2YXIgb3V0ID0gZXJyLnN0YWNrO1xuXG4gICAgICAvLyB0cnkgdG8gc3RyaXAgdXNlbGVzcyBmcmFtZXNcbiAgICAgIHZhciBmbl9uYW1lID0gc3RhY2tTdGFydEZ1bmN0aW9uLm5hbWU7XG4gICAgICB2YXIgaWR4ID0gb3V0LmluZGV4T2YoJ1xcbicgKyBmbl9uYW1lKTtcbiAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAvLyBvbmNlIHdlIGhhdmUgbG9jYXRlZCB0aGUgZnVuY3Rpb24gZnJhbWVcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzdHJpcCBvdXQgZXZlcnl0aGluZyBiZWZvcmUgaXQgKGFuZCBpdHMgbGluZSlcbiAgICAgICAgdmFyIG5leHRfbGluZSA9IG91dC5pbmRleE9mKCdcXG4nLCBpZHggKyAxKTtcbiAgICAgICAgb3V0ID0gb3V0LnN1YnN0cmluZyhuZXh0X2xpbmUgKyAxKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGFjayA9IG91dDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIGFzc2VydC5Bc3NlcnRpb25FcnJvciBpbnN0YW5jZW9mIEVycm9yXG51dGlsLmluaGVyaXRzKGFzc2VydC5Bc3NlcnRpb25FcnJvciwgRXJyb3IpO1xuXG5mdW5jdGlvbiByZXBsYWNlcihrZXksIHZhbHVlKSB7XG4gIGlmICh1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgIHJldHVybiAnJyArIHZhbHVlO1xuICB9XG4gIGlmICh1dGlsLmlzTnVtYmVyKHZhbHVlKSAmJiAoaXNOYU4odmFsdWUpIHx8ICFpc0Zpbml0ZSh2YWx1ZSkpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbih2YWx1ZSkgfHwgdXRpbC5pc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIHRydW5jYXRlKHMsIG4pIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocykpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPCBuID8gcyA6IHMuc2xpY2UoMCwgbik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TWVzc2FnZShzZWxmKSB7XG4gIHJldHVybiB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmFjdHVhbCwgcmVwbGFjZXIpLCAxMjgpICsgJyAnICtcbiAgICAgICAgIHNlbGYub3BlcmF0b3IgKyAnICcgK1xuICAgICAgICAgdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5leHBlY3RlZCwgcmVwbGFjZXIpLCAxMjgpO1xufVxuXG4vLyBBdCBwcmVzZW50IG9ubHkgdGhlIHRocmVlIGtleXMgbWVudGlvbmVkIGFib3ZlIGFyZSB1c2VkIGFuZFxuLy8gdW5kZXJzdG9vZCBieSB0aGUgc3BlYy4gSW1wbGVtZW50YXRpb25zIG9yIHN1YiBtb2R1bGVzIGNhbiBwYXNzXG4vLyBvdGhlciBrZXlzIHRvIHRoZSBBc3NlcnRpb25FcnJvcidzIGNvbnN0cnVjdG9yIC0gdGhleSB3aWxsIGJlXG4vLyBpZ25vcmVkLlxuXG4vLyAzLiBBbGwgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgbXVzdCB0aHJvdyBhbiBBc3NlcnRpb25FcnJvclxuLy8gd2hlbiBhIGNvcnJlc3BvbmRpbmcgY29uZGl0aW9uIGlzIG5vdCBtZXQsIHdpdGggYSBtZXNzYWdlIHRoYXRcbi8vIG1heSBiZSB1bmRlZmluZWQgaWYgbm90IHByb3ZpZGVkLiAgQWxsIGFzc2VydGlvbiBtZXRob2RzIHByb3ZpZGVcbi8vIGJvdGggdGhlIGFjdHVhbCBhbmQgZXhwZWN0ZWQgdmFsdWVzIHRvIHRoZSBhc3NlcnRpb24gZXJyb3IgZm9yXG4vLyBkaXNwbGF5IHB1cnBvc2VzLlxuXG5mdW5jdGlvbiBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsIG9wZXJhdG9yLCBzdGFja1N0YXJ0RnVuY3Rpb24pIHtcbiAgdGhyb3cgbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7XG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICBleHBlY3RlZDogZXhwZWN0ZWQsXG4gICAgb3BlcmF0b3I6IG9wZXJhdG9yLFxuICAgIHN0YWNrU3RhcnRGdW5jdGlvbjogc3RhY2tTdGFydEZ1bmN0aW9uXG4gIH0pO1xufVxuXG4vLyBFWFRFTlNJT04hIGFsbG93cyBmb3Igd2VsbCBiZWhhdmVkIGVycm9ycyBkZWZpbmVkIGVsc2V3aGVyZS5cbmFzc2VydC5mYWlsID0gZmFpbDtcblxuLy8gNC4gUHVyZSBhc3NlcnRpb24gdGVzdHMgd2hldGhlciBhIHZhbHVlIGlzIHRydXRoeSwgYXMgZGV0ZXJtaW5lZFxuLy8gYnkgISFndWFyZC5cbi8vIGFzc2VydC5vayhndWFyZCwgbWVzc2FnZV9vcHQpO1xuLy8gVGhpcyBzdGF0ZW1lbnQgaXMgZXF1aXZhbGVudCB0byBhc3NlcnQuZXF1YWwodHJ1ZSwgISFndWFyZCxcbi8vIG1lc3NhZ2Vfb3B0KTsuIFRvIHRlc3Qgc3RyaWN0bHkgZm9yIHRoZSB2YWx1ZSB0cnVlLCB1c2Vcbi8vIGFzc2VydC5zdHJpY3RFcXVhbCh0cnVlLCBndWFyZCwgbWVzc2FnZV9vcHQpOy5cblxuZnVuY3Rpb24gb2sodmFsdWUsIG1lc3NhZ2UpIHtcbiAgaWYgKCF2YWx1ZSkgZmFpbCh2YWx1ZSwgdHJ1ZSwgbWVzc2FnZSwgJz09JywgYXNzZXJ0Lm9rKTtcbn1cbmFzc2VydC5vayA9IG9rO1xuXG4vLyA1LiBUaGUgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHNoYWxsb3csIGNvZXJjaXZlIGVxdWFsaXR5IHdpdGhcbi8vID09LlxuLy8gYXNzZXJ0LmVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmVxdWFsID0gZnVuY3Rpb24gZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9IGV4cGVjdGVkKSBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5lcXVhbCk7XG59O1xuXG4vLyA2LiBUaGUgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igd2hldGhlciB0d28gb2JqZWN0cyBhcmUgbm90IGVxdWFsXG4vLyB3aXRoICE9IGFzc2VydC5ub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RFcXVhbCA9IGZ1bmN0aW9uIG5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9JywgYXNzZXJ0Lm5vdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gNy4gVGhlIGVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBhIGRlZXAgZXF1YWxpdHkgcmVsYXRpb24uXG4vLyBhc3NlcnQuZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmRlZXBFcXVhbCA9IGZ1bmN0aW9uIGRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmICghX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ2RlZXBFcXVhbCcsIGFzc2VydC5kZWVwRXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmICh1dGlsLmlzQnVmZmVyKGFjdHVhbCkgJiYgdXRpbC5pc0J1ZmZlcihleHBlY3RlZCkpIHtcbiAgICBpZiAoYWN0dWFsLmxlbmd0aCAhPSBleHBlY3RlZC5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0dWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYWN0dWFsW2ldICE9PSBleHBlY3RlZFtpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuXG4gIC8vIDcuMi4gSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgRGF0ZSBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgRGF0ZSBvYmplY3QgdGhhdCByZWZlcnMgdG8gdGhlIHNhbWUgdGltZS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzRGF0ZShhY3R1YWwpICYmIHV0aWwuaXNEYXRlKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIFJlZ0V4cCBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgUmVnRXhwIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNvdXJjZSBhbmRcbiAgLy8gcHJvcGVydGllcyAoYGdsb2JhbGAsIGBtdWx0aWxpbmVgLCBgbGFzdEluZGV4YCwgYGlnbm9yZUNhc2VgKS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzUmVnRXhwKGFjdHVhbCkgJiYgdXRpbC5pc1JlZ0V4cChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLnNvdXJjZSA9PT0gZXhwZWN0ZWQuc291cmNlICYmXG4gICAgICAgICAgIGFjdHVhbC5nbG9iYWwgPT09IGV4cGVjdGVkLmdsb2JhbCAmJlxuICAgICAgICAgICBhY3R1YWwubXVsdGlsaW5lID09PSBleHBlY3RlZC5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgYWN0dWFsLmxhc3RJbmRleCA9PT0gZXhwZWN0ZWQubGFzdEluZGV4ICYmXG4gICAgICAgICAgIGFjdHVhbC5pZ25vcmVDYXNlID09PSBleHBlY3RlZC5pZ25vcmVDYXNlO1xuXG4gIC8vIDcuNC4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICghdXRpbC5pc09iamVjdChhY3R1YWwpICYmICF1dGlsLmlzT2JqZWN0KGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gNy41IEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBcmd1bWVudHMob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYikge1xuICBpZiAodXRpbC5pc051bGxPclVuZGVmaW5lZChhKSB8fCB1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG4gIC8vfn5+SSd2ZSBtYW5hZ2VkIHRvIGJyZWFrIE9iamVjdC5rZXlzIHRocm91Z2ggc2NyZXd5IGFyZ3VtZW50cyBwYXNzaW5nLlxuICAvLyAgIENvbnZlcnRpbmcgdG8gYXJyYXkgc29sdmVzIHRoZSBwcm9ibGVtLlxuICBpZiAoaXNBcmd1bWVudHMoYSkpIHtcbiAgICBpZiAoIWlzQXJndW1lbnRzKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIF9kZWVwRXF1YWwoYSwgYik7XG4gIH1cbiAgdHJ5IHtcbiAgICB2YXIga2EgPSBvYmplY3RLZXlzKGEpLFxuICAgICAgICBrYiA9IG9iamVjdEtleXMoYiksXG4gICAgICAgIGtleSwgaTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghX2RlZXBFcXVhbChhW2tleV0sIGJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gOC4gVGhlIG5vbi1lcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgZm9yIGFueSBkZWVwIGluZXF1YWxpdHkuXG4vLyBhc3NlcnQubm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdERlZXBFcXVhbCA9IGZ1bmN0aW9uIG5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnbm90RGVlcEVxdWFsJywgYXNzZXJ0Lm5vdERlZXBFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDkuIFRoZSBzdHJpY3QgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHN0cmljdCBlcXVhbGl0eSwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuc3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBzdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT09JywgYXNzZXJ0LnN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gMTAuIFRoZSBzdHJpY3Qgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igc3RyaWN0IGluZXF1YWxpdHksIGFzXG4vLyBkZXRlcm1pbmVkIGJ5ICE9PS4gIGFzc2VydC5ub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RTdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIG5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPT0nLCBhc3NlcnQubm90U3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIGlmICghYWN0dWFsIHx8ICFleHBlY3RlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXhwZWN0ZWQpID09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgcmV0dXJuIGV4cGVjdGVkLnRlc3QoYWN0dWFsKTtcbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGV4cGVjdGVkLmNhbGwoe30sIGFjdHVhbCkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX3Rocm93cyhzaG91bGRUaHJvdywgYmxvY2ssIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIHZhciBhY3R1YWw7XG5cbiAgaWYgKHV0aWwuaXNTdHJpbmcoZXhwZWN0ZWQpKSB7XG4gICAgbWVzc2FnZSA9IGV4cGVjdGVkO1xuICAgIGV4cGVjdGVkID0gbnVsbDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgYmxvY2soKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGFjdHVhbCA9IGU7XG4gIH1cblxuICBtZXNzYWdlID0gKGV4cGVjdGVkICYmIGV4cGVjdGVkLm5hbWUgPyAnICgnICsgZXhwZWN0ZWQubmFtZSArICcpLicgOiAnLicpICtcbiAgICAgICAgICAgIChtZXNzYWdlID8gJyAnICsgbWVzc2FnZSA6ICcuJyk7XG5cbiAgaWYgKHNob3VsZFRocm93ICYmICFhY3R1YWwpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdNaXNzaW5nIGV4cGVjdGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICghc2hvdWxkVGhyb3cgJiYgZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdHb3QgdW53YW50ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKChzaG91bGRUaHJvdyAmJiBhY3R1YWwgJiYgZXhwZWN0ZWQgJiZcbiAgICAgICFleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkgfHwgKCFzaG91bGRUaHJvdyAmJiBhY3R1YWwpKSB7XG4gICAgdGhyb3cgYWN0dWFsO1xuICB9XG59XG5cbi8vIDExLiBFeHBlY3RlZCB0byB0aHJvdyBhbiBlcnJvcjpcbi8vIGFzc2VydC50aHJvd3MoYmxvY2ssIEVycm9yX29wdCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQudGhyb3dzID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL2Vycm9yLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW3RydWVdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG4vLyBFWFRFTlNJT04hIFRoaXMgaXMgYW5ub3lpbmcgdG8gd3JpdGUgb3V0c2lkZSB0aGlzIG1vZHVsZS5cbmFzc2VydC5kb2VzTm90VGhyb3cgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFtmYWxzZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbmFzc2VydC5pZkVycm9yID0gZnVuY3Rpb24oZXJyKSB7IGlmIChlcnIpIHt0aHJvdyBlcnI7fX07XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIi9Vc2Vycy9kdXN0YW5rYXN0ZW4vcHJvamVjdHMvcGVyc29uYWwvdGhlLXByb2plY3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5zZXJ0LW1vZHVsZS1nbG9iYWxzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS42LjNcbihmdW5jdGlvbigpIHtcbiAgdmFyIGNoYXJhY3RlckdlbmVyYXRvciwgcmFuZG9tO1xuXG4gIHJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbiAgY2hhcmFjdGVyR2VuZXJhdG9yID0gZnVuY3Rpb24oa2V5Ym9hcmRMYXlvdXQsIGFjY3VyYWN5LCBjaGVja0ludGVydmFsLCB0ZXh0KSB7XG4gICAgdmFyIGN1cnJlbnRJbmRleCwgc2hvdWxkQ29ycmVjdCwgdHlwb0luZGV4O1xuICAgIGN1cnJlbnRJbmRleCA9IC0xO1xuICAgIHR5cG9JbmRleCA9IC0xO1xuICAgIHNob3VsZENvcnJlY3QgPSBmYWxzZTtcbiAgICByZXR1cm4ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmIChjdXJyZW50SW5kZXggPj0gdGV4dC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgaWYgKHR5cG9JbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHNob3VsZENvcnJlY3QgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzaG91bGRDb3JyZWN0KSB7XG4gICAgICAgICAgY3VycmVudEluZGV4Kys7XG4gICAgICAgICAgc2hvdWxkQ29ycmVjdCA9IHR5cG9JbmRleCAhPT0gLTEgJiYgY3VycmVudEluZGV4ICUgY2hlY2tJbnRlcnZhbCA9PT0gMDtcbiAgICAgICAgICBpZiAocmFuZG9tLmludGVnZXJJblJhbmdlKDAsIDEwMCkgPiBhY2N1cmFjeSkge1xuICAgICAgICAgICAgcmVzdWx0ID0ga2V5Ym9hcmRMYXlvdXQuZ2V0QWRqYWNlbnRDaGFyYWN0ZXIodGV4dC5jaGFyQXQoY3VycmVudEluZGV4KSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRleHQuY2hhckF0KGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwb0luZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICB0eXBvSW5kZXggPSBjdXJyZW50SW5kZXg7XG4gICAgICAgICAgICAgIHNob3VsZENvcnJlY3QgPSByYW5kb20uaW50ZWdlckluUmFuZ2UoMCwgMSkgPT09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGV4dC5jaGFyQXQoY3VycmVudEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN1cnJlbnRJbmRleCA+PSB0eXBvSW5kZXgpIHtcbiAgICAgICAgICBjdXJyZW50SW5kZXgtLTtcbiAgICAgICAgICByZXR1cm4gJ1xcYic7XG4gICAgICAgIH1cbiAgICAgICAgc2hvdWxkQ29ycmVjdCA9IGZhbHNlO1xuICAgICAgICB0eXBvSW5kZXggPSAtMTtcbiAgICAgICAgcmV0dXJuIHRleHQuY2hhckF0KCsrY3VycmVudEluZGV4KTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gY2hhcmFjdGVyR2VuZXJhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0QWRqYWNlbnRDaGFyYWN0ZXIsIGlzTG93ZXJDYXNlLCBsYXlvdXQsIHJhbmRvbTtcblxuICByYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpO1xuXG4gIGxheW91dCA9IFtbJ2AnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnMCcsICctJywgJz0nXSwgWycnLCAnUScsICdXJywgJ0UnLCAnUicsICdUJywgJ1knLCAnVScsICdJJywgJ08nLCAnUCcsICdbJywgJ10nLCAnXFxcXCddLCBbJycsICdBJywgJ1MnLCAnRCcsICdGJywgJ0cnLCAnSCcsICdKJywgJ0snLCAnTCcsICc7JywgJ1xcJyddLCBbJycsICdaJywgJ1gnLCAnQycsICdWJywgJ0InLCAnTicsICdNJywgJywnLCAnLicsICcvJ11dO1xuXG4gIGlzTG93ZXJDYXNlID0gZnVuY3Rpb24oY2hhcmFjdGVyKSB7XG4gICAgcmV0dXJuIGNoYXJhY3RlciA9PT0gY2hhcmFjdGVyLnRvTG93ZXJDYXNlKCk7XG4gIH07XG5cbiAgZ2V0QWRqYWNlbnRDaGFyYWN0ZXIgPSBmdW5jdGlvbihjaGFyYWN0ZXIpIHtcbiAgICB2YXIgYWRqYWNlbnRDaGFyYWN0ZXIsIGFkamFjZW50Q29sLCBhZGphY2VudFJvdywgY29sLCByYW5kb21OdW1iZXIsIHJvdywgX2ksIF9qLCBfcmVmLCBfcmVmMTtcbiAgICBmb3IgKHJvdyA9IF9pID0gMCwgX3JlZiA9IGxheW91dC5sZW5ndGg7IF9pIDwgX3JlZjsgcm93ID0gX2kgKz0gMSkge1xuICAgICAgZm9yIChjb2wgPSBfaiA9IDAsIF9yZWYxID0gbGF5b3V0W3Jvd10ubGVuZ3RoOyBfaiA8IF9yZWYxOyBjb2wgPSBfaiArPSAxKSB7XG4gICAgICAgIGlmIChsYXlvdXRbcm93XVtjb2xdLnRvTG93ZXJDYXNlKCkgIT09IGNoYXJhY3Rlci50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZG9tTnVtYmVyID0gcmFuZG9tLmludGVnZXJJblJhbmdlKC0xLCAxKTtcbiAgICAgICAgYWRqYWNlbnRSb3cgPSByb3cgKyByYW5kb21OdW1iZXI7XG4gICAgICAgIGlmIChhZGphY2VudFJvdyA+PSBsYXlvdXQubGVuZ3RoIHx8IGFkamFjZW50Um93IDwgMCkge1xuICAgICAgICAgIGFkamFjZW50Um93ICs9IC0yICogcmFuZG9tTnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPj0gbGF5b3V0W2FkamFjZW50Um93XS5sZW5ndGgpIHtcbiAgICAgICAgICBjb2wgPSBsYXlvdXRbYWRqYWNlbnRSb3ddLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJhbmRvbU51bWJlciA9PT0gMCkge1xuICAgICAgICAgIHJhbmRvbU51bWJlciA9IFstMSwgMV1bcmFuZG9tLmludGVnZXJJblJhbmdlKDAsIDEpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5kb21OdW1iZXIgPSByYW5kb20uaW50ZWdlckluUmFuZ2UoLTEsIDEpO1xuICAgICAgICB9XG4gICAgICAgIGFkamFjZW50Q29sID0gY29sICsgcmFuZG9tTnVtYmVyO1xuICAgICAgICBpZiAoYWRqYWNlbnRDb2wgPj0gbGF5b3V0W2FkamFjZW50Um93XS5sZW5ndGggfHwgYWRqYWNlbnRDb2wgPCAwKSB7XG4gICAgICAgICAgYWRqYWNlbnRDb2wgKz0gLTIgKiByYW5kb21OdW1iZXI7XG4gICAgICAgIH1cbiAgICAgICAgYWRqYWNlbnRDaGFyYWN0ZXIgPSBsYXlvdXRbYWRqYWNlbnRSb3ddW2FkamFjZW50Q29sXTtcbiAgICAgICAgaWYgKGFkamFjZW50Q2hhcmFjdGVyID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBnZXRBZGphY2VudENoYXJhY3RlcihjaGFyYWN0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0xvd2VyQ2FzZShjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgcmV0dXJuIGFkamFjZW50Q2hhcmFjdGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFkamFjZW50Q2hhcmFjdGVyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cy5nZXRBZGphY2VudENoYXJhY3RlciA9IGdldEFkamFjZW50Q2hhcmFjdGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgUHJpb3JpdHlTZXF1ZW5jZSwgU2VxdWVuY2UsIGFzc2VydDtcblxuICBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxuICBTZXF1ZW5jZSA9IHJlcXVpcmUoJy4vc2VxdWVuY2UnKTtcblxuICBQcmlvcml0eVNlcXVlbmNlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFByaW9yaXR5U2VxdWVuY2Uob25XYWl0KSB7XG4gICAgICB0aGlzLm9uV2FpdCA9IG9uV2FpdDtcbiAgICAgIHRoaXMuX3NlcXVlbmNlcyA9IFtdO1xuICAgICAgdGhpcy5fd2FpdGluZyA9IHRydWU7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub25XYWl0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5vbldhaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBQcmlvcml0eVNlcXVlbmNlLnByb3RvdHlwZS5fbmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHMsIHNlcXVlbmNlLCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIHNlcXVlbmNlID0gbnVsbDtcbiAgICAgIF9yZWYgPSB0aGlzLl9zZXF1ZW5jZXM7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgcyA9IF9yZWZbX2ldO1xuICAgICAgICBpZiAocyAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKHMuZW1wdHkoKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlcXVlbmNlID0gcztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNlcXVlbmNlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHNlcXVlbmNlLm5leHQodGhpcy5fbmV4dC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NlcXVlbmNlcyA9IFtdO1xuICAgICAgICB0aGlzLl93YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLm9uV2FpdCA9PT0gXCJmdW5jdGlvblwiID8gdGhpcy5vbldhaXQoKSA6IHZvaWQgMDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgUHJpb3JpdHlTZXF1ZW5jZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKHByaW9yaXR5LCBmbikge1xuICAgICAgYXNzZXJ0Lm9rKHByaW9yaXR5ICE9IG51bGwsICdUaGUgcHJpb3JpdHkgbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgICAgIGFzc2VydC5zdHJpY3RFcXVhbCh0eXBlb2YgcHJpb3JpdHksICdudW1iZXInLCAnUHJpb3JpdHkgbXVzdCBiZSBhIG51bWJlcicpO1xuICAgICAgYXNzZXJ0LnN0cmljdEVxdWFsKH5+cHJpb3JpdHksIHByaW9yaXR5LCAnUHJpb3JpdHkgbXVzdCBiZSBhbiBpbnRlZ2VyJyk7XG4gICAgICBhc3NlcnQub2socHJpb3JpdHkgPj0gMCwgJ1ByaW9yaXR5IG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gICAgICBhc3NlcnQub2soZm4gIT0gbnVsbCwgJ1RoZSBmdW5jdGlvbiBtdXN0IGJlIHNwZWNpZmllZCcpO1xuICAgICAgaWYgKHRoaXMuX3NlcXVlbmNlc1twcmlvcml0eV0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9zZXF1ZW5jZXNbcHJpb3JpdHldID0gbmV3IFNlcXVlbmNlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXF1ZW5jZXNbcHJpb3JpdHldLmFkZChmbik7XG4gICAgICBpZiAodGhpcy5fd2FpdGluZykge1xuICAgICAgICB0aGlzLl93YWl0aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXh0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBQcmlvcml0eVNlcXVlbmNlO1xuXG4gIH0pKCk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBQcmlvcml0eVNlcXVlbmNlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgYXNzZXJ0LCBpbnRlZ2VySW5SYW5nZTtcblxuICBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxuICBpbnRlZ2VySW5SYW5nZSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgYXNzZXJ0Lm9rKG1pbiAhPSBudWxsLCAnVGhlIG1pbmltdW0gbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgICBhc3NlcnQuc3RyaWN0RXF1YWwodHlwZW9mIG1pbiwgJ251bWJlcicsICdNaW4gbXVzdCBiZSBhIE51bWJlcicpO1xuICAgIGFzc2VydC5zdHJpY3RFcXVhbCh+fm1pbiwgbWluLCAnTWluIG11c3QgYmUgYW4gaW50ZWdlcicpO1xuICAgIGFzc2VydC5vayhtYXggIT0gbnVsbCwgJ1RoZSBtYXhpbXVtIG11c3QgYmUgc3BlY2lmaWVkJyk7XG4gICAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiBtYXgsICdudW1iZXInLCAnTWF4IG11c3QgYmUgYSBOdW1iZXInKTtcbiAgICBhc3NlcnQuc3RyaWN0RXF1YWwofn5tYXgsIG1heCwgJ01heCBtdXN0IGJlIGFuIGludGVnZXInKTtcbiAgICBhc3NlcnQuc3RyaWN0RXF1YWwobWluIDw9IG1heCwgdHJ1ZSwgJ01pbiBtdXN0IGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byBNYXgnKTtcbiAgICBpZiAobWluID09PSBtYXgpIHtcbiAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzLmludGVnZXJJblJhbmdlID0gaW50ZWdlckluUmFuZ2U7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuNi4zXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBTZXF1ZW5jZSwgYXNzZXJ0O1xuXG4gIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG4gIFNlcXVlbmNlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFNlcXVlbmNlKCkge1xuICAgICAgdGhpcy5fcXVldWUgPSBbXTtcbiAgICB9XG5cbiAgICBTZXF1ZW5jZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgICB2YXIgZm47XG4gICAgICBpZiAoIXRoaXMuZW1wdHkoKSkge1xuICAgICAgICBmbiA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBmbihjYik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFNlcXVlbmNlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihmbikge1xuICAgICAgYXNzZXJ0Lm9rKGZuICE9IG51bGwsICdUaGUgZnVuY3Rpb24gbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLl9xdWV1ZS5wdXNoKGZuKTtcbiAgICB9O1xuXG4gICAgU2VxdWVuY2UucHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcXVldWUubGVuZ3RoID09PSAwO1xuICAgIH07XG5cbiAgICByZXR1cm4gU2VxdWVuY2U7XG5cbiAgfSkoKTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IFNlcXVlbmNlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS42LjNcbihmdW5jdGlvbigpIHtcbiAgdmFyIFByaW9yaXR5U2VxdWVuY2UsIFR5cGV3cml0ZXIsIGFzc2VydCwgY2hhcmFjdGVyZ2VuZXJhdG9yLCByYW5kb207XG5cbiAgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbiAgUHJpb3JpdHlTZXF1ZW5jZSA9IHJlcXVpcmUoJy4vcHJpb3JpdHlzZXF1ZW5jZScpO1xuXG4gIHJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbiAgY2hhcmFjdGVyZ2VuZXJhdG9yID0gcmVxdWlyZSgnLi9jaGFyYWN0ZXJnZW5lcmF0b3InKTtcblxuICBUeXBld3JpdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFR5cGV3cml0ZXIoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgdGhpcy5fcHJpb3JpdHlTZXF1ZW5jZSA9IG5ldyBQcmlvcml0eVNlcXVlbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuX3NlcXVlbmNlTGV2ZWwgPSAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgVHlwZXdyaXRlci5wcm90b3R5cGUuc2V0VGFyZ2V0RG9tRWxlbWVudCA9IGZ1bmN0aW9uKHRhcmdldERvbUVsZW1lbnQpIHtcbiAgICAgIGFzc2VydC5vayh0YXJnZXREb21FbGVtZW50IGluc3RhbmNlb2YgRWxlbWVudCwgJ1RhcmdldERvbUVsZW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBFbGVtZW50Jyk7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXREb21FbGVtZW50ID0gdGFyZ2V0RG9tRWxlbWVudDtcbiAgICB9O1xuXG4gICAgVHlwZXdyaXRlci5wcm90b3R5cGUuc2V0QWNjdXJhY3kgPSBmdW5jdGlvbihhY2N1cmFjeSkge1xuICAgICAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiBhY2N1cmFjeSwgJ251bWJlcicsICdBY2N1cmFjeSBtdXN0IGJlIGEgbnVtYmVyJyk7XG4gICAgICBhc3NlcnQub2soYWNjdXJhY3kgPiAwICYmIGFjY3VyYWN5IDw9IDEwMCwgJ0FjY3VyYWN5IG11c3QgYmUgZ3JlYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byAxMDAnKTtcbiAgICAgIHJldHVybiB0aGlzLmFjY3VyYWN5ID0gYWNjdXJhY3k7XG4gICAgfTtcblxuICAgIFR5cGV3cml0ZXIucHJvdG90eXBlLnNldE1pbmltdW1TcGVlZCA9IGZ1bmN0aW9uKG1pbmltdW1TcGVlZCkge1xuICAgICAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiBtaW5pbXVtU3BlZWQsICdudW1iZXInLCAnTWluaW11bVNwZWVkIG11c3QgYmUgYSBudW1iZXInKTtcbiAgICAgIGFzc2VydC5vayhtaW5pbXVtU3BlZWQgPiAwLCAnTWluaW11bVNwZWVkIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAnKTtcbiAgICAgIGlmICgodGhpcy5tYXhpbXVtU3BlZWQgIT0gbnVsbCkgJiYgbWluaW11bVNwZWVkID4gdGhpcy5tYXhpbXVtU3BlZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluaW11bVNwZWVkID0gdGhpcy5tYXhpbXVtU3BlZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5taW5pbXVtU3BlZWQgPSBtaW5pbXVtU3BlZWQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFR5cGV3cml0ZXIucHJvdG90eXBlLnNldE1heGltdW1TcGVlZCA9IGZ1bmN0aW9uKG1heGltdW1TcGVlZCkge1xuICAgICAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiBtYXhpbXVtU3BlZWQsICdudW1iZXInLCAnTWF4aW11bVNwZWVkIG11c3QgYmUgYSBudW1iZXInKTtcbiAgICAgIGFzc2VydC5vayhtYXhpbXVtU3BlZWQgPiAwLCAnTWF4aW11bVNwZWVkIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAnKTtcbiAgICAgIGlmICgodGhpcy5taW5pbXVtU3BlZWQgIT0gbnVsbCkgJiYgdGhpcy5taW5pbXVtU3BlZWQgPiBtYXhpbXVtU3BlZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF4aW11bVNwZWVkID0gbWluaW11bVNwZWVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF4aW11bVNwZWVkID0gbWF4aW11bVNwZWVkO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBUeXBld3JpdGVyLnByb3RvdHlwZS5zZXRLZXlib2FyZExheW91dCA9IGZ1bmN0aW9uKGtleWJvYXJkTGF5b3V0KSB7XG4gICAgICBhc3NlcnQuc3RyaWN0RXF1YWwodHlwZW9mIGtleWJvYXJkTGF5b3V0LmdldEFkamFjZW50Q2hhcmFjdGVyLCAnZnVuY3Rpb24nLCAnS2V5Ym9hcmRMYXlvdXQgbXVzdCBoYXZlIGFuIGV4cG9ydGVkIGdldEFkamFjZW50Q2hhcmFjdGVyIG1ldGhvZCcpO1xuICAgICAgcmV0dXJuIHRoaXMua2V5Ym9hcmRMYXlvdXQgPSBrZXlib2FyZExheW91dDtcbiAgICB9O1xuXG4gICAgVHlwZXdyaXRlci5wcm90b3R5cGUuX21ha2VDaGFpbmFibGUgPSBmdW5jdGlvbihjYiwgZm4pIHtcbiAgICAgIHZhciBzaGFkb3c7XG4gICAgICBzaGFkb3cgPSBPYmplY3QuY3JlYXRlKHRoaXMpO1xuICAgICAgc2hhZG93Ll9zZXF1ZW5jZUxldmVsID0gdGhpcy5fc2VxdWVuY2VMZXZlbDtcbiAgICAgIHRoaXMuX3ByaW9yaXR5U2VxdWVuY2UudGhlbih0aGlzLl9zZXF1ZW5jZUxldmVsLCBmdW5jdGlvbihuZXh0KSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBmbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChjYiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGNiLmNhbGwoc2hhZG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBpZiAoY2IgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9zZXF1ZW5jZUxldmVsKys7XG4gICAgICB9XG4gICAgICBpZiAoKGNiID09IG51bGwpIHx8IHRoaXMuaGFzT3duUHJvcGVydHkoJ19wcmlvcml0eVNlcXVlbmNlJykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFR5cGV3cml0ZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY2IpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcy5fbWFrZUNoYWluYWJsZShjYiwgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICB2YXIgY2hpbGQ7XG4gICAgICAgIHdoaWxlICgoY2hpbGQgPSBfdGhpcy50YXJnZXREb21FbGVtZW50Lmxhc3RDaGlsZCkgIT0gbnVsbCkge1xuICAgICAgICAgIF90aGlzLnRhcmdldERvbUVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgVHlwZXdyaXRlci5wcm90b3R5cGUud2FpdFJhbmdlID0gZnVuY3Rpb24obWlsbGlzTWluLCBtaWxsaXNNYXgsIGNiKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgcmV0dXJuIHRoaXMuX21ha2VDaGFpbmFibGUoY2IsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZG9uZSwgcmFuZG9tLmludGVnZXJJblJhbmdlKG1pbGxpc01pbiwgbWlsbGlzTWF4KSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgVHlwZXdyaXRlci5wcm90b3R5cGUud2FpdCA9IGZ1bmN0aW9uKG1pbGxpcywgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLndhaXRSYW5nZShtaWxsaXMsIG1pbGxpcywgY2IpO1xuICAgIH07XG5cbiAgICBUeXBld3JpdGVyLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbih0ZXh0LCBjYikge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLl9tYWtlQ2hhaW5hYmxlKGNiLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIHZhciBjaGlsZCwgZWxlbWVudDtcbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgIHdoaWxlICgoY2hpbGQgPSBlbGVtZW50LmZpcnN0Q2hpbGQpICE9IG51bGwpIHtcbiAgICAgICAgICBfdGhpcy50YXJnZXREb21FbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFR5cGV3cml0ZXIucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24oY2IpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcy5fbWFrZUNoYWluYWJsZShjYiwgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBfdGhpcy50YXJnZXREb21FbGVtZW50LnJlbW92ZUNoaWxkKF90aGlzLnRhcmdldERvbUVsZW1lbnQubGFzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBUeXBld3JpdGVyLnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odGV4dCwgY2IpIHtcbiAgICAgIHZhciBjaGFyLCBjaGVja0ludGVydmFsLCBnZW47XG4gICAgICBjaGVja0ludGVydmFsID0gKHRoaXMubWluaW11bVNwZWVkICsgdGhpcy5tYXhpbXVtU3BlZWQpIC8gMjtcbiAgICAgIGdlbiA9IGNoYXJhY3RlcmdlbmVyYXRvcih0aGlzLmtleWJvYXJkTGF5b3V0LCB0aGlzLmFjY3VyYWN5LCBjaGVja0ludGVydmFsLCB0ZXh0KTtcbiAgICAgIHdoaWxlICgoY2hhciA9IGdlbi5uZXh0KCkpICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChjaGFyICE9PSAnXFxiJykge1xuICAgICAgICAgIHRoaXMucHV0KGNoYXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXNbXCJkZWxldGVcIl0oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndhaXRSYW5nZSh+figxMDAwIC8gdGhpcy5tYXhpbXVtU3BlZWQpLCB+figxMDAwIC8gdGhpcy5taW5pbXVtU3BlZWQpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLndhaXQoMCwgY2IpO1xuICAgIH07XG5cbiAgICByZXR1cm4gVHlwZXdyaXRlcjtcblxuICB9KSgpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gVHlwZXdyaXRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIvVXNlcnMvZHVzdGFua2FzdGVuL3Byb2plY3RzL3BlcnNvbmFsL3RoZS1wcm9qZWN0L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIpKSIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS42LjNcbihmdW5jdGlvbigpIHtcbiAgdmFyIFR5cGV3cml0ZXIsIFR5cGV3cml0ZXJCdWlsZGVyLCBhc3NlcnQ7XG5cbiAgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbiAgVHlwZXdyaXRlciA9IHJlcXVpcmUoJy4vdHlwZXdyaXRlcicpO1xuXG4gIFR5cGV3cml0ZXJCdWlsZGVyID0gZnVuY3Rpb24odGFyZ2V0RG9tRWxlbWVudCkge1xuICAgIHZhciB0eXBld3JpdGVyO1xuICAgIHR5cGV3cml0ZXIgPSBuZXcgVHlwZXdyaXRlcigpO1xuICAgIHR5cGV3cml0ZXIuc2V0VGFyZ2V0RG9tRWxlbWVudCh0YXJnZXREb21FbGVtZW50KTtcbiAgICByZXR1cm4ge1xuICAgICAgd2l0aEFjY3VyYWN5OiBmdW5jdGlvbihhY2N1cmFjeSkge1xuICAgICAgICB0aGlzLmFjY3VyYWN5ID0gYWNjdXJhY3k7XG4gICAgICAgIHR5cGV3cml0ZXIuc2V0QWNjdXJhY3kodGhpcy5hY2N1cmFjeSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIHdpdGhNaW5pbXVtU3BlZWQ6IGZ1bmN0aW9uKG1pbmltdW1TcGVlZCkge1xuICAgICAgICB0aGlzLm1pbmltdW1TcGVlZCA9IG1pbmltdW1TcGVlZDtcbiAgICAgICAgdHlwZXdyaXRlci5zZXRNaW5pbXVtU3BlZWQodGhpcy5taW5pbXVtU3BlZWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICB3aXRoTWF4aW11bVNwZWVkOiBmdW5jdGlvbihtYXhpbXVtU3BlZWQpIHtcbiAgICAgICAgdGhpcy5tYXhpbXVtU3BlZWQgPSBtYXhpbXVtU3BlZWQ7XG4gICAgICAgIHR5cGV3cml0ZXIuc2V0TWF4aW11bVNwZWVkKHRoaXMubWF4aW11bVNwZWVkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgd2l0aEtleWJvYXJkTGF5b3V0OiBmdW5jdGlvbihrZXlib2FyZExheW91dCkge1xuICAgICAgICB0aGlzLmtleWJvYXJkTGF5b3V0ID0ga2V5Ym9hcmRMYXlvdXQ7XG4gICAgICAgIHR5cGV3cml0ZXIuc2V0S2V5Ym9hcmRMYXlvdXQodGhpcy5rZXlib2FyZExheW91dCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGJ1aWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgYXNzZXJ0Lm9rKHRoaXMuYWNjdXJhY3kgIT0gbnVsbCwgJ0FjY3VyYWN5IG11c3QgYmUgc2V0Jyk7XG4gICAgICAgIGFzc2VydC5vayh0aGlzLm1pbmltdW1TcGVlZCAhPSBudWxsLCAnTWluaW11bVNwZWVkIG11c3QgYmUgc2V0Jyk7XG4gICAgICAgIGFzc2VydC5vayh0aGlzLm1heGltdW1TcGVlZCAhPSBudWxsLCAnTWF4aW11bVNwZWVkIG11c3QgYmUgc2V0Jyk7XG4gICAgICAgIGlmICh0aGlzLmtleWJvYXJkTGF5b3V0ID09IG51bGwpIHtcbiAgICAgICAgICB0eXBld3JpdGVyLnNldEtleWJvYXJkTGF5b3V0KHJlcXVpcmUoJy4vZGVmYXVsdGtleWJvYXJkbGF5b3V0JykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0eXBld3JpdGVyO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBUeXBld3JpdGVyQnVpbGRlcjtcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==

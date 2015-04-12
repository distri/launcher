(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "launcher\n========\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/qs.js": {
      "path": "lib/qs.js",
      "content": "!function(e){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=e();else if(\"function\"==typeof define&&define.amd)define([],e);else{var f;\"undefined\"!=typeof window?f=window:\"undefined\"!=typeof global?f=global:\"undefined\"!=typeof self&&(f=self),f.QS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n// Load modules\n\nvar Stringify = require('./stringify');\nvar Parse = require('./parse');\n\n\n// Declare internals\n\nvar internals = {};\n\n\nmodule.exports = {\n    stringify: Stringify,\n    parse: Parse\n};\n\n},{\"./parse\":2,\"./stringify\":3}],2:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    depth: 5,\n    arrayLimit: 20,\n    parameterLimit: 1000\n};\n\n\ninternals.parseValues = function (str, options) {\n\n    var obj = {};\n    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);\n\n    for (var i = 0, il = parts.length; i < il; ++i) {\n        var part = parts[i];\n        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;\n\n        if (pos === -1) {\n            obj[Utils.decode(part)] = '';\n        }\n        else {\n            var key = Utils.decode(part.slice(0, pos));\n            var val = Utils.decode(part.slice(pos + 1));\n\n            if (!obj.hasOwnProperty(key)) {\n                obj[key] = val;\n            }\n            else {\n                obj[key] = [].concat(obj[key]).concat(val);\n            }\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseObject = function (chain, val, options) {\n\n    if (!chain.length) {\n        return val;\n    }\n\n    var root = chain.shift();\n\n    var obj = {};\n    if (root === '[]') {\n        obj = [];\n        obj = obj.concat(internals.parseObject(chain, val, options));\n    }\n    else {\n        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;\n        var index = parseInt(cleanRoot, 10);\n        var indexString = '' + index;\n        if (!isNaN(index) &&\n            root !== cleanRoot &&\n            indexString === cleanRoot &&\n            index >= 0 &&\n            index <= options.arrayLimit) {\n\n            obj = [];\n            obj[index] = internals.parseObject(chain, val, options);\n        }\n        else {\n            obj[cleanRoot] = internals.parseObject(chain, val, options);\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseKeys = function (key, val, options) {\n\n    if (!key) {\n        return;\n    }\n\n    // The regex chunks\n\n    var parent = /^([^\\[\\]]*)/;\n    var child = /(\\[[^\\[\\]]*\\])/g;\n\n    // Get the parent\n\n    var segment = parent.exec(key);\n\n    // Don't allow them to overwrite object prototype properties\n\n    if (Object.prototype.hasOwnProperty(segment[1])) {\n        return;\n    }\n\n    // Stash the parent if it exists\n\n    var keys = [];\n    if (segment[1]) {\n        keys.push(segment[1]);\n    }\n\n    // Loop through children appending to the array until we hit depth\n\n    var i = 0;\n    while ((segment = child.exec(key)) !== null && i < options.depth) {\n\n        ++i;\n        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\\[|\\]/g, ''))) {\n            keys.push(segment[1]);\n        }\n    }\n\n    // If there's a remainder, just add whatever is left\n\n    if (segment) {\n        keys.push('[' + key.slice(segment.index) + ']');\n    }\n\n    return internals.parseObject(keys, val, options);\n};\n\n\nmodule.exports = function (str, options) {\n\n    if (str === '' ||\n        str === null ||\n        typeof str === 'undefined') {\n\n        return {};\n    }\n\n    options = options || {};\n    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;\n    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;\n    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;\n    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;\n\n    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;\n    var obj = {};\n\n    // Iterate over the keys and setup the new object\n\n    var keys = Object.keys(tempObj);\n    for (var i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        var newObj = internals.parseKeys(key, tempObj[key], options);\n        obj = Utils.merge(obj, newObj);\n    }\n\n    return Utils.compact(obj);\n};\n\n},{\"./utils\":4}],3:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    indices: true\n};\n\n\ninternals.stringify = function (obj, prefix, options) {\n\n    if (Utils.isBuffer(obj)) {\n        obj = obj.toString();\n    }\n    else if (obj instanceof Date) {\n        obj = obj.toISOString();\n    }\n    else if (obj === null) {\n        obj = '';\n    }\n\n    if (typeof obj === 'string' ||\n        typeof obj === 'number' ||\n        typeof obj === 'boolean') {\n\n        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];\n    }\n\n    var values = [];\n\n    if (typeof obj === 'undefined') {\n        return values;\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        if (!options.indices &&\n            Array.isArray(obj)) {\n\n            values = values.concat(internals.stringify(obj[key], prefix, options));\n        }\n        else {\n            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', options));\n        }\n    }\n\n    return values;\n};\n\n\nmodule.exports = function (obj, options) {\n\n    options = options || {};\n    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;\n    options.indices = typeof options.indices === 'boolean' ? options.indices : internals.indices;\n\n    var keys = [];\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return '';\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        keys = keys.concat(internals.stringify(obj[key], key, options));\n    }\n\n    return keys.join(delimiter);\n};\n\n},{\"./utils\":4}],4:[function(require,module,exports){\n// Load modules\n\n\n// Declare internals\n\nvar internals = {};\n\n\nexports.arrayToObject = function (source) {\n\n    var obj = {};\n    for (var i = 0, il = source.length; i < il; ++i) {\n        if (typeof source[i] !== 'undefined') {\n\n            obj[i] = source[i];\n        }\n    }\n\n    return obj;\n};\n\n\nexports.merge = function (target, source) {\n\n    if (!source) {\n        return target;\n    }\n\n    if (typeof source !== 'object') {\n        if (Array.isArray(target)) {\n            target.push(source);\n        }\n        else {\n            target[source] = true;\n        }\n\n        return target;\n    }\n\n    if (typeof target !== 'object') {\n        target = [target].concat(source);\n        return target;\n    }\n\n    if (Array.isArray(target) &&\n        !Array.isArray(source)) {\n\n        target = exports.arrayToObject(target);\n    }\n\n    var keys = Object.keys(source);\n    for (var k = 0, kl = keys.length; k < kl; ++k) {\n        var key = keys[k];\n        var value = source[key];\n\n        if (!target[key]) {\n            target[key] = value;\n        }\n        else {\n            target[key] = exports.merge(target[key], value);\n        }\n    }\n\n    return target;\n};\n\n\nexports.decode = function (str) {\n\n    try {\n        return decodeURIComponent(str.replace(/\\+/g, ' '));\n    } catch (e) {\n        return str;\n    }\n};\n\n\nexports.compact = function (obj, refs) {\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return obj;\n    }\n\n    refs = refs || [];\n    var lookup = refs.indexOf(obj);\n    if (lookup !== -1) {\n        return refs[lookup];\n    }\n\n    refs.push(obj);\n\n    if (Array.isArray(obj)) {\n        var compacted = [];\n\n        for (var i = 0, il = obj.length; i < il; ++i) {\n            if (typeof obj[i] !== 'undefined') {\n                compacted.push(obj[i]);\n            }\n        }\n\n        return compacted;\n    }\n\n    var keys = Object.keys(obj);\n    for (i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        obj[key] = exports.compact(obj[key], refs);\n    }\n\n    return obj;\n};\n\n\nexports.isRegExp = function (obj) {\n    return Object.prototype.toString.call(obj) === '[object RegExp]';\n};\n\n\nexports.isBuffer = function (obj) {\n\n    if (obj === null ||\n        typeof obj === 'undefined') {\n\n        return false;\n    }\n\n    return !!(obj.constructor &&\n        obj.constructor.isBuffer &&\n        obj.constructor.isBuffer(obj));\n};\n\n},{}],\"qs\":[function(require,module,exports){\nmodule.exports = require('./lib/');\n\n},{\"./lib/\":1}]},{},[])(\"qs\")\n});\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "Launcher\n========\n\nLaunch a package from a json url.\n\n    {extend} = require \"util\"\n    QueryString = require \"./lib/qs\"\n\n    global.ENV ?= {}\n\n    extend ENV, QueryString.parse(document.location.search.substr(1))\n\n    # if PACKAGE.name is \"ROOT\"\n    #   ENV.PACKAGE_URL = \"https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/data/1fd5d1704c461b3ae6845fa7c0dd4a4181fc4b3f?duder\"\n\n    $.getJSON(ENV.PACKAGE_URL)\n    .then (pkg) ->\n      new Promise (resolve, reject) ->\n        # Load deps\n        loadedCount = 0\n        onload = ->\n          loadedCount += 1\n          if loadedCount is scriptCount\n            resolve(pkg)\n\n        scriptCount = 0\n        loadDep = (src) ->\n          scriptCount += 1\n          script = document.createElement(\"script\")\n          script.onload = onload\n          document.head.appendChild script\n          script.src = src\n\n        (pkg.remoteDependencies || []).forEach loadDep\n\n    .then (promise) -> # Bad dog jQuery, BAD DOG!\n      promise.then require\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.1.0\"\nremoteDependencies: [\n  \"http://code.jquery.com/jquery-2.1.3.min.js\"\n]\ndependencies:\n  util: \"distri/util:v0.1.1\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/qs.coffee": {
      "path": "test/qs.coffee",
      "content": "QueryString = require \"../lib/qs\"\n\ndescribe \"QueryString\", ->\n  it \"should parse\", ->\n    JSON.stringify QueryString.parse(document.location.search.substr(1))\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "lib/qs": {
      "path": "lib/qs",
      "content": "!function(e){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=e();else if(\"function\"==typeof define&&define.amd)define([],e);else{var f;\"undefined\"!=typeof window?f=window:\"undefined\"!=typeof global?f=global:\"undefined\"!=typeof self&&(f=self),f.QS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n// Load modules\n\nvar Stringify = require('./stringify');\nvar Parse = require('./parse');\n\n\n// Declare internals\n\nvar internals = {};\n\n\nmodule.exports = {\n    stringify: Stringify,\n    parse: Parse\n};\n\n},{\"./parse\":2,\"./stringify\":3}],2:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    depth: 5,\n    arrayLimit: 20,\n    parameterLimit: 1000\n};\n\n\ninternals.parseValues = function (str, options) {\n\n    var obj = {};\n    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);\n\n    for (var i = 0, il = parts.length; i < il; ++i) {\n        var part = parts[i];\n        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;\n\n        if (pos === -1) {\n            obj[Utils.decode(part)] = '';\n        }\n        else {\n            var key = Utils.decode(part.slice(0, pos));\n            var val = Utils.decode(part.slice(pos + 1));\n\n            if (!obj.hasOwnProperty(key)) {\n                obj[key] = val;\n            }\n            else {\n                obj[key] = [].concat(obj[key]).concat(val);\n            }\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseObject = function (chain, val, options) {\n\n    if (!chain.length) {\n        return val;\n    }\n\n    var root = chain.shift();\n\n    var obj = {};\n    if (root === '[]') {\n        obj = [];\n        obj = obj.concat(internals.parseObject(chain, val, options));\n    }\n    else {\n        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;\n        var index = parseInt(cleanRoot, 10);\n        var indexString = '' + index;\n        if (!isNaN(index) &&\n            root !== cleanRoot &&\n            indexString === cleanRoot &&\n            index >= 0 &&\n            index <= options.arrayLimit) {\n\n            obj = [];\n            obj[index] = internals.parseObject(chain, val, options);\n        }\n        else {\n            obj[cleanRoot] = internals.parseObject(chain, val, options);\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseKeys = function (key, val, options) {\n\n    if (!key) {\n        return;\n    }\n\n    // The regex chunks\n\n    var parent = /^([^\\[\\]]*)/;\n    var child = /(\\[[^\\[\\]]*\\])/g;\n\n    // Get the parent\n\n    var segment = parent.exec(key);\n\n    // Don't allow them to overwrite object prototype properties\n\n    if (Object.prototype.hasOwnProperty(segment[1])) {\n        return;\n    }\n\n    // Stash the parent if it exists\n\n    var keys = [];\n    if (segment[1]) {\n        keys.push(segment[1]);\n    }\n\n    // Loop through children appending to the array until we hit depth\n\n    var i = 0;\n    while ((segment = child.exec(key)) !== null && i < options.depth) {\n\n        ++i;\n        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\\[|\\]/g, ''))) {\n            keys.push(segment[1]);\n        }\n    }\n\n    // If there's a remainder, just add whatever is left\n\n    if (segment) {\n        keys.push('[' + key.slice(segment.index) + ']');\n    }\n\n    return internals.parseObject(keys, val, options);\n};\n\n\nmodule.exports = function (str, options) {\n\n    if (str === '' ||\n        str === null ||\n        typeof str === 'undefined') {\n\n        return {};\n    }\n\n    options = options || {};\n    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;\n    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;\n    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;\n    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;\n\n    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;\n    var obj = {};\n\n    // Iterate over the keys and setup the new object\n\n    var keys = Object.keys(tempObj);\n    for (var i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        var newObj = internals.parseKeys(key, tempObj[key], options);\n        obj = Utils.merge(obj, newObj);\n    }\n\n    return Utils.compact(obj);\n};\n\n},{\"./utils\":4}],3:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    indices: true\n};\n\n\ninternals.stringify = function (obj, prefix, options) {\n\n    if (Utils.isBuffer(obj)) {\n        obj = obj.toString();\n    }\n    else if (obj instanceof Date) {\n        obj = obj.toISOString();\n    }\n    else if (obj === null) {\n        obj = '';\n    }\n\n    if (typeof obj === 'string' ||\n        typeof obj === 'number' ||\n        typeof obj === 'boolean') {\n\n        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];\n    }\n\n    var values = [];\n\n    if (typeof obj === 'undefined') {\n        return values;\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        if (!options.indices &&\n            Array.isArray(obj)) {\n\n            values = values.concat(internals.stringify(obj[key], prefix, options));\n        }\n        else {\n            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', options));\n        }\n    }\n\n    return values;\n};\n\n\nmodule.exports = function (obj, options) {\n\n    options = options || {};\n    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;\n    options.indices = typeof options.indices === 'boolean' ? options.indices : internals.indices;\n\n    var keys = [];\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return '';\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        keys = keys.concat(internals.stringify(obj[key], key, options));\n    }\n\n    return keys.join(delimiter);\n};\n\n},{\"./utils\":4}],4:[function(require,module,exports){\n// Load modules\n\n\n// Declare internals\n\nvar internals = {};\n\n\nexports.arrayToObject = function (source) {\n\n    var obj = {};\n    for (var i = 0, il = source.length; i < il; ++i) {\n        if (typeof source[i] !== 'undefined') {\n\n            obj[i] = source[i];\n        }\n    }\n\n    return obj;\n};\n\n\nexports.merge = function (target, source) {\n\n    if (!source) {\n        return target;\n    }\n\n    if (typeof source !== 'object') {\n        if (Array.isArray(target)) {\n            target.push(source);\n        }\n        else {\n            target[source] = true;\n        }\n\n        return target;\n    }\n\n    if (typeof target !== 'object') {\n        target = [target].concat(source);\n        return target;\n    }\n\n    if (Array.isArray(target) &&\n        !Array.isArray(source)) {\n\n        target = exports.arrayToObject(target);\n    }\n\n    var keys = Object.keys(source);\n    for (var k = 0, kl = keys.length; k < kl; ++k) {\n        var key = keys[k];\n        var value = source[key];\n\n        if (!target[key]) {\n            target[key] = value;\n        }\n        else {\n            target[key] = exports.merge(target[key], value);\n        }\n    }\n\n    return target;\n};\n\n\nexports.decode = function (str) {\n\n    try {\n        return decodeURIComponent(str.replace(/\\+/g, ' '));\n    } catch (e) {\n        return str;\n    }\n};\n\n\nexports.compact = function (obj, refs) {\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return obj;\n    }\n\n    refs = refs || [];\n    var lookup = refs.indexOf(obj);\n    if (lookup !== -1) {\n        return refs[lookup];\n    }\n\n    refs.push(obj);\n\n    if (Array.isArray(obj)) {\n        var compacted = [];\n\n        for (var i = 0, il = obj.length; i < il; ++i) {\n            if (typeof obj[i] !== 'undefined') {\n                compacted.push(obj[i]);\n            }\n        }\n\n        return compacted;\n    }\n\n    var keys = Object.keys(obj);\n    for (i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        obj[key] = exports.compact(obj[key], refs);\n    }\n\n    return obj;\n};\n\n\nexports.isRegExp = function (obj) {\n    return Object.prototype.toString.call(obj) === '[object RegExp]';\n};\n\n\nexports.isBuffer = function (obj) {\n\n    if (obj === null ||\n        typeof obj === 'undefined') {\n\n        return false;\n    }\n\n    return !!(obj.constructor &&\n        obj.constructor.isBuffer &&\n        obj.constructor.isBuffer(obj));\n};\n\n},{}],\"qs\":[function(require,module,exports){\nmodule.exports = require('./lib/');\n\n},{\"./lib/\":1}]},{},[])(\"qs\")\n});\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var QueryString, extend;\n\n  extend = require(\"util\").extend;\n\n  QueryString = require(\"./lib/qs\");\n\n  if (global.ENV == null) {\n    global.ENV = {};\n  }\n\n  extend(ENV, QueryString.parse(document.location.search.substr(1)));\n\n  $.getJSON(ENV.PACKAGE_URL).then(function(pkg) {\n    return new Promise(function(resolve, reject) {\n      var loadDep, loadedCount, onload, scriptCount;\n      loadedCount = 0;\n      onload = function() {\n        loadedCount += 1;\n        if (loadedCount === scriptCount) {\n          return resolve(pkg);\n        }\n      };\n      scriptCount = 0;\n      loadDep = function(src) {\n        var script;\n        scriptCount += 1;\n        script = document.createElement(\"script\");\n        script.onload = onload;\n        document.head.appendChild(script);\n        return script.src = src;\n      };\n      return (pkg.remoteDependencies || []).forEach(loadDep);\n    });\n  }).then(function(promise) {\n    return promise.then(require);\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.1.0\",\"remoteDependencies\":[\"http://code.jquery.com/jquery-2.1.3.min.js\"],\"dependencies\":{\"util\":\"distri/util:v0.1.1\"}};",
      "type": "blob"
    },
    "test/qs": {
      "path": "test/qs",
      "content": "(function() {\n  var QueryString;\n\n  QueryString = require(\"../lib/qs\");\n\n  describe(\"QueryString\", function() {\n    return it(\"should parse\", function() {\n      return JSON.stringify(QueryString.parse(document.location.search.substr(1)));\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "version": "0.1.0",
  "entryPoint": "main",
  "remoteDependencies": [
    "http://code.jquery.com/jquery-2.1.3.min.js"
  ],
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "distri/launcher",
    "homepage": null,
    "description": "",
    "html_url": "https://github.com/distri/launcher",
    "url": "https://api.github.com/repos/distri/launcher",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "util": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "util\n====\n\nSmall utility methods for JS\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Util\n====\n\n    module.exports =\n      approach: (current, target, amount) ->\n        (target - current).clamp(-amount, amount) + current\n\nApply a stylesheet idempotently.\n\n      applyStylesheet: (style, id=\"primary\") ->\n        styleNode = document.createElement(\"style\")\n        styleNode.innerHTML = style\n        styleNode.id = id\n\n        if previousStyleNode = document.head.querySelector(\"style##{id}\")\n          previousStyleNode.parentNode.removeChild(previousStyleNode)\n\n        document.head.appendChild(styleNode)\n\n      defaults: (target, objects...) ->\n        for object in objects\n          for name of object\n            unless target.hasOwnProperty(name)\n              target[name] = object[name]\n\n        return target\n\n      extend: (target, sources...) ->\n        for source in sources\n          for name of source\n            target[name] = source[name]\n\n        return target\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.1\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "content": "{applyStylesheet} = require \"../main\"\n\ndescribe \"util\", ->\n  it \"should apply stylesheets\", ->\n    applyStylesheet(\"body { background-color: red; }\", \"test\")\n    applyStylesheet(\"body { background-color: #EEE; }\", \"test\")\n",
          "mode": "100644"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    approach: function(current, target, amount) {\n      return (target - current).clamp(-amount, amount) + current;\n    },\n    applyStylesheet: function(style, id) {\n      var previousStyleNode, styleNode;\n      if (id == null) {\n        id = \"primary\";\n      }\n      styleNode = document.createElement(\"style\");\n      styleNode.innerHTML = style;\n      styleNode.id = id;\n      if (previousStyleNode = document.head.querySelector(\"style#\" + id)) {\n        previousStyleNode.parentNode.removeChild(previousStyleNode);\n      }\n      return document.head.appendChild(styleNode);\n    },\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.1\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var applyStylesheet;\n\n  applyStylesheet = require(\"../main\").applyStylesheet;\n\n  describe(\"util\", function() {\n    return it(\"should apply stylesheets\", function() {\n      applyStylesheet(\"body { background-color: red; }\", \"test\");\n      return applyStylesheet(\"body { background-color: #EEE; }\", \"test\");\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/more-cleanup/"
      },
      "version": "0.1.1",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.1.1",
        "default_branch": "master",
        "full_name": "distri/util",
        "homepage": null,
        "description": "Small utility methods for JS",
        "html_url": "https://github.com/distri/util",
        "url": "https://api.github.com/repos/distri/util",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});
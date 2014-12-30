window["distri/launcher:master"]({
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
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.1.0\"\nremoteDependencies: [\n  \"https://code.jquery.com/jquery-1.11.2.min.js\"\n]\ndependencies:\n  runner: \"distri/runner:v0.3.0\"\n  util: \"distri/util:v0.1.1\"\n",
      "mode": "100644"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "Launcher\n========\n\nLaunch a package from a json url.\n\n    {extend} = require \"util\"\n    Runner = require \"runner\"\n    QueryString = require \"./lib/qs\"\n\n    global.ENV ?= {}\n\n    extend global.ENV, QueryString.parse(document.location.search.substr(1))\n\n    alert ENV.PACKAGE_URL\n\n    $.getJSON(ENV.PACKAGE_URL)\n    .then require\n",
      "mode": "100644"
    },
    "lib/qs.js": {
      "path": "lib/qs.js",
      "content": "!function(e){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=e();else if(\"function\"==typeof define&&define.amd)define([],e);else{var f;\"undefined\"!=typeof window?f=window:\"undefined\"!=typeof global?f=global:\"undefined\"!=typeof self&&(f=self),f.QS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n// Load modules\n\nvar Stringify = require('./stringify');\nvar Parse = require('./parse');\n\n\n// Declare internals\n\nvar internals = {};\n\n\nmodule.exports = {\n    stringify: Stringify,\n    parse: Parse\n};\n\n},{\"./parse\":2,\"./stringify\":3}],2:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    depth: 5,\n    arrayLimit: 20,\n    parameterLimit: 1000\n};\n\n\ninternals.parseValues = function (str, options) {\n\n    var obj = {};\n    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);\n\n    for (var i = 0, il = parts.length; i < il; ++i) {\n        var part = parts[i];\n        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;\n\n        if (pos === -1) {\n            obj[Utils.decode(part)] = '';\n        }\n        else {\n            var key = Utils.decode(part.slice(0, pos));\n            var val = Utils.decode(part.slice(pos + 1));\n\n            if (!obj.hasOwnProperty(key)) {\n                obj[key] = val;\n            }\n            else {\n                obj[key] = [].concat(obj[key]).concat(val);\n            }\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseObject = function (chain, val, options) {\n\n    if (!chain.length) {\n        return val;\n    }\n\n    var root = chain.shift();\n\n    var obj = {};\n    if (root === '[]') {\n        obj = [];\n        obj = obj.concat(internals.parseObject(chain, val, options));\n    }\n    else {\n        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;\n        var index = parseInt(cleanRoot, 10);\n        var indexString = '' + index;\n        if (!isNaN(index) &&\n            root !== cleanRoot &&\n            indexString === cleanRoot &&\n            index >= 0 &&\n            index <= options.arrayLimit) {\n\n            obj = [];\n            obj[index] = internals.parseObject(chain, val, options);\n        }\n        else {\n            obj[cleanRoot] = internals.parseObject(chain, val, options);\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseKeys = function (key, val, options) {\n\n    if (!key) {\n        return;\n    }\n\n    // The regex chunks\n\n    var parent = /^([^\\[\\]]*)/;\n    var child = /(\\[[^\\[\\]]*\\])/g;\n\n    // Get the parent\n\n    var segment = parent.exec(key);\n\n    // Don't allow them to overwrite object prototype properties\n\n    if (Object.prototype.hasOwnProperty(segment[1])) {\n        return;\n    }\n\n    // Stash the parent if it exists\n\n    var keys = [];\n    if (segment[1]) {\n        keys.push(segment[1]);\n    }\n\n    // Loop through children appending to the array until we hit depth\n\n    var i = 0;\n    while ((segment = child.exec(key)) !== null && i < options.depth) {\n\n        ++i;\n        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\\[|\\]/g, ''))) {\n            keys.push(segment[1]);\n        }\n    }\n\n    // If there's a remainder, just add whatever is left\n\n    if (segment) {\n        keys.push('[' + key.slice(segment.index) + ']');\n    }\n\n    return internals.parseObject(keys, val, options);\n};\n\n\nmodule.exports = function (str, options) {\n\n    if (str === '' ||\n        str === null ||\n        typeof str === 'undefined') {\n\n        return {};\n    }\n\n    options = options || {};\n    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;\n    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;\n    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;\n    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;\n\n    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;\n    var obj = {};\n\n    // Iterate over the keys and setup the new object\n\n    var keys = Object.keys(tempObj);\n    for (var i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        var newObj = internals.parseKeys(key, tempObj[key], options);\n        obj = Utils.merge(obj, newObj);\n    }\n\n    return Utils.compact(obj);\n};\n\n},{\"./utils\":4}],3:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    indices: true\n};\n\n\ninternals.stringify = function (obj, prefix, options) {\n\n    if (Utils.isBuffer(obj)) {\n        obj = obj.toString();\n    }\n    else if (obj instanceof Date) {\n        obj = obj.toISOString();\n    }\n    else if (obj === null) {\n        obj = '';\n    }\n\n    if (typeof obj === 'string' ||\n        typeof obj === 'number' ||\n        typeof obj === 'boolean') {\n\n        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];\n    }\n\n    var values = [];\n\n    if (typeof obj === 'undefined') {\n        return values;\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        if (!options.indices &&\n            Array.isArray(obj)) {\n\n            values = values.concat(internals.stringify(obj[key], prefix, options));\n        }\n        else {\n            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', options));\n        }\n    }\n\n    return values;\n};\n\n\nmodule.exports = function (obj, options) {\n\n    options = options || {};\n    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;\n    options.indices = typeof options.indices === 'boolean' ? options.indices : internals.indices;\n\n    var keys = [];\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return '';\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        keys = keys.concat(internals.stringify(obj[key], key, options));\n    }\n\n    return keys.join(delimiter);\n};\n\n},{\"./utils\":4}],4:[function(require,module,exports){\n// Load modules\n\n\n// Declare internals\n\nvar internals = {};\n\n\nexports.arrayToObject = function (source) {\n\n    var obj = {};\n    for (var i = 0, il = source.length; i < il; ++i) {\n        if (typeof source[i] !== 'undefined') {\n\n            obj[i] = source[i];\n        }\n    }\n\n    return obj;\n};\n\n\nexports.merge = function (target, source) {\n\n    if (!source) {\n        return target;\n    }\n\n    if (typeof source !== 'object') {\n        if (Array.isArray(target)) {\n            target.push(source);\n        }\n        else {\n            target[source] = true;\n        }\n\n        return target;\n    }\n\n    if (typeof target !== 'object') {\n        target = [target].concat(source);\n        return target;\n    }\n\n    if (Array.isArray(target) &&\n        !Array.isArray(source)) {\n\n        target = exports.arrayToObject(target);\n    }\n\n    var keys = Object.keys(source);\n    for (var k = 0, kl = keys.length; k < kl; ++k) {\n        var key = keys[k];\n        var value = source[key];\n\n        if (!target[key]) {\n            target[key] = value;\n        }\n        else {\n            target[key] = exports.merge(target[key], value);\n        }\n    }\n\n    return target;\n};\n\n\nexports.decode = function (str) {\n\n    try {\n        return decodeURIComponent(str.replace(/\\+/g, ' '));\n    } catch (e) {\n        return str;\n    }\n};\n\n\nexports.compact = function (obj, refs) {\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return obj;\n    }\n\n    refs = refs || [];\n    var lookup = refs.indexOf(obj);\n    if (lookup !== -1) {\n        return refs[lookup];\n    }\n\n    refs.push(obj);\n\n    if (Array.isArray(obj)) {\n        var compacted = [];\n\n        for (var i = 0, il = obj.length; i < il; ++i) {\n            if (typeof obj[i] !== 'undefined') {\n                compacted.push(obj[i]);\n            }\n        }\n\n        return compacted;\n    }\n\n    var keys = Object.keys(obj);\n    for (i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        obj[key] = exports.compact(obj[key], refs);\n    }\n\n    return obj;\n};\n\n\nexports.isRegExp = function (obj) {\n    return Object.prototype.toString.call(obj) === '[object RegExp]';\n};\n\n\nexports.isBuffer = function (obj) {\n\n    if (obj === null ||\n        typeof obj === 'undefined') {\n\n        return false;\n    }\n\n    return !!(obj.constructor &&\n        obj.constructor.isBuffer &&\n        obj.constructor.isBuffer(obj));\n};\n\n},{}],\"qs\":[function(require,module,exports){\nmodule.exports = require('./lib/');\n\n},{\"./lib/\":1}]},{},[])(\"qs\")\n});",
      "mode": "100644"
    },
    "test/qs.coffee": {
      "path": "test/qs.coffee",
      "content": "QueryString = require \"../lib/qs\"\n\ndescribe \"QueryString\", ->\n  it \"should parse\", ->\n    JSON.stringify QueryString.parse(document.location.search.substr(1))\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.1.0\",\"remoteDependencies\":[\"https://code.jquery.com/jquery-1.11.2.min.js\"],\"dependencies\":{\"runner\":\"distri/runner:v0.3.0\",\"util\":\"distri/util:v0.1.1\"}};",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var QueryString, Runner, extend;\n\n  extend = require(\"util\").extend;\n\n  Runner = require(\"runner\");\n\n  QueryString = require(\"./lib/qs\");\n\n  if (global.ENV == null) {\n    global.ENV = {};\n  }\n\n  extend(global.ENV, QueryString.parse(document.location.search.substr(1)));\n\n  alert(ENV.PACKAGE_URL);\n\n  $.getJSON(ENV.PACKAGE_URL).then(require);\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/qs": {
      "path": "lib/qs",
      "content": "!function(e){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=e();else if(\"function\"==typeof define&&define.amd)define([],e);else{var f;\"undefined\"!=typeof window?f=window:\"undefined\"!=typeof global?f=global:\"undefined\"!=typeof self&&(f=self),f.QS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n// Load modules\n\nvar Stringify = require('./stringify');\nvar Parse = require('./parse');\n\n\n// Declare internals\n\nvar internals = {};\n\n\nmodule.exports = {\n    stringify: Stringify,\n    parse: Parse\n};\n\n},{\"./parse\":2,\"./stringify\":3}],2:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    depth: 5,\n    arrayLimit: 20,\n    parameterLimit: 1000\n};\n\n\ninternals.parseValues = function (str, options) {\n\n    var obj = {};\n    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);\n\n    for (var i = 0, il = parts.length; i < il; ++i) {\n        var part = parts[i];\n        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;\n\n        if (pos === -1) {\n            obj[Utils.decode(part)] = '';\n        }\n        else {\n            var key = Utils.decode(part.slice(0, pos));\n            var val = Utils.decode(part.slice(pos + 1));\n\n            if (!obj.hasOwnProperty(key)) {\n                obj[key] = val;\n            }\n            else {\n                obj[key] = [].concat(obj[key]).concat(val);\n            }\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseObject = function (chain, val, options) {\n\n    if (!chain.length) {\n        return val;\n    }\n\n    var root = chain.shift();\n\n    var obj = {};\n    if (root === '[]') {\n        obj = [];\n        obj = obj.concat(internals.parseObject(chain, val, options));\n    }\n    else {\n        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;\n        var index = parseInt(cleanRoot, 10);\n        var indexString = '' + index;\n        if (!isNaN(index) &&\n            root !== cleanRoot &&\n            indexString === cleanRoot &&\n            index >= 0 &&\n            index <= options.arrayLimit) {\n\n            obj = [];\n            obj[index] = internals.parseObject(chain, val, options);\n        }\n        else {\n            obj[cleanRoot] = internals.parseObject(chain, val, options);\n        }\n    }\n\n    return obj;\n};\n\n\ninternals.parseKeys = function (key, val, options) {\n\n    if (!key) {\n        return;\n    }\n\n    // The regex chunks\n\n    var parent = /^([^\\[\\]]*)/;\n    var child = /(\\[[^\\[\\]]*\\])/g;\n\n    // Get the parent\n\n    var segment = parent.exec(key);\n\n    // Don't allow them to overwrite object prototype properties\n\n    if (Object.prototype.hasOwnProperty(segment[1])) {\n        return;\n    }\n\n    // Stash the parent if it exists\n\n    var keys = [];\n    if (segment[1]) {\n        keys.push(segment[1]);\n    }\n\n    // Loop through children appending to the array until we hit depth\n\n    var i = 0;\n    while ((segment = child.exec(key)) !== null && i < options.depth) {\n\n        ++i;\n        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\\[|\\]/g, ''))) {\n            keys.push(segment[1]);\n        }\n    }\n\n    // If there's a remainder, just add whatever is left\n\n    if (segment) {\n        keys.push('[' + key.slice(segment.index) + ']');\n    }\n\n    return internals.parseObject(keys, val, options);\n};\n\n\nmodule.exports = function (str, options) {\n\n    if (str === '' ||\n        str === null ||\n        typeof str === 'undefined') {\n\n        return {};\n    }\n\n    options = options || {};\n    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;\n    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;\n    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;\n    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;\n\n    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;\n    var obj = {};\n\n    // Iterate over the keys and setup the new object\n\n    var keys = Object.keys(tempObj);\n    for (var i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        var newObj = internals.parseKeys(key, tempObj[key], options);\n        obj = Utils.merge(obj, newObj);\n    }\n\n    return Utils.compact(obj);\n};\n\n},{\"./utils\":4}],3:[function(require,module,exports){\n// Load modules\n\nvar Utils = require('./utils');\n\n\n// Declare internals\n\nvar internals = {\n    delimiter: '&',\n    indices: true\n};\n\n\ninternals.stringify = function (obj, prefix, options) {\n\n    if (Utils.isBuffer(obj)) {\n        obj = obj.toString();\n    }\n    else if (obj instanceof Date) {\n        obj = obj.toISOString();\n    }\n    else if (obj === null) {\n        obj = '';\n    }\n\n    if (typeof obj === 'string' ||\n        typeof obj === 'number' ||\n        typeof obj === 'boolean') {\n\n        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];\n    }\n\n    var values = [];\n\n    if (typeof obj === 'undefined') {\n        return values;\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        if (!options.indices &&\n            Array.isArray(obj)) {\n\n            values = values.concat(internals.stringify(obj[key], prefix, options));\n        }\n        else {\n            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', options));\n        }\n    }\n\n    return values;\n};\n\n\nmodule.exports = function (obj, options) {\n\n    options = options || {};\n    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;\n    options.indices = typeof options.indices === 'boolean' ? options.indices : internals.indices;\n\n    var keys = [];\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return '';\n    }\n\n    var objKeys = Object.keys(obj);\n    for (var i = 0, il = objKeys.length; i < il; ++i) {\n        var key = objKeys[i];\n        keys = keys.concat(internals.stringify(obj[key], key, options));\n    }\n\n    return keys.join(delimiter);\n};\n\n},{\"./utils\":4}],4:[function(require,module,exports){\n// Load modules\n\n\n// Declare internals\n\nvar internals = {};\n\n\nexports.arrayToObject = function (source) {\n\n    var obj = {};\n    for (var i = 0, il = source.length; i < il; ++i) {\n        if (typeof source[i] !== 'undefined') {\n\n            obj[i] = source[i];\n        }\n    }\n\n    return obj;\n};\n\n\nexports.merge = function (target, source) {\n\n    if (!source) {\n        return target;\n    }\n\n    if (typeof source !== 'object') {\n        if (Array.isArray(target)) {\n            target.push(source);\n        }\n        else {\n            target[source] = true;\n        }\n\n        return target;\n    }\n\n    if (typeof target !== 'object') {\n        target = [target].concat(source);\n        return target;\n    }\n\n    if (Array.isArray(target) &&\n        !Array.isArray(source)) {\n\n        target = exports.arrayToObject(target);\n    }\n\n    var keys = Object.keys(source);\n    for (var k = 0, kl = keys.length; k < kl; ++k) {\n        var key = keys[k];\n        var value = source[key];\n\n        if (!target[key]) {\n            target[key] = value;\n        }\n        else {\n            target[key] = exports.merge(target[key], value);\n        }\n    }\n\n    return target;\n};\n\n\nexports.decode = function (str) {\n\n    try {\n        return decodeURIComponent(str.replace(/\\+/g, ' '));\n    } catch (e) {\n        return str;\n    }\n};\n\n\nexports.compact = function (obj, refs) {\n\n    if (typeof obj !== 'object' ||\n        obj === null) {\n\n        return obj;\n    }\n\n    refs = refs || [];\n    var lookup = refs.indexOf(obj);\n    if (lookup !== -1) {\n        return refs[lookup];\n    }\n\n    refs.push(obj);\n\n    if (Array.isArray(obj)) {\n        var compacted = [];\n\n        for (var i = 0, il = obj.length; i < il; ++i) {\n            if (typeof obj[i] !== 'undefined') {\n                compacted.push(obj[i]);\n            }\n        }\n\n        return compacted;\n    }\n\n    var keys = Object.keys(obj);\n    for (i = 0, il = keys.length; i < il; ++i) {\n        var key = keys[i];\n        obj[key] = exports.compact(obj[key], refs);\n    }\n\n    return obj;\n};\n\n\nexports.isRegExp = function (obj) {\n    return Object.prototype.toString.call(obj) === '[object RegExp]';\n};\n\n\nexports.isBuffer = function (obj) {\n\n    if (obj === null ||\n        typeof obj === 'undefined') {\n\n        return false;\n    }\n\n    return !!(obj.constructor &&\n        obj.constructor.isBuffer &&\n        obj.constructor.isBuffer(obj));\n};\n\n},{}],\"qs\":[function(require,module,exports){\nmodule.exports = require('./lib/');\n\n},{\"./lib/\":1}]},{},[])(\"qs\")\n});",
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
    "https://code.jquery.com/jquery-1.11.2.min.js"
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
    "runner": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "runner\n======\n\nRunner manages running apps in sandboxed windows and passing messages back and forth from the parent to the running instances.\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Runner\n======\n\nExpose some runners.\n\n    Sandbox = require \"sandbox\"\n\n    module.exports =\n      Sandbox: Sandbox\n      PackageRunner: require \"./package_runner\"\n\nRun some code in a sandboxed popup window. We need to popup the window immediately\nin response to user input to prevent pop-up blocking so we also pass a promise\nthat will contain the content to render in the window. If the promise fails we\nauto-close the window.\n\n      openWindowWithContent: (config, contentPromise) ->\n        sandbox = Sandbox config\n\n        contentPromise.then(\n          (content) ->\n            sandbox.document.open()\n            sandbox.document.write(content)\n            sandbox.document.close()\n\n            sandbox\n          , (error) ->\n            sandbox.close()\n\n            throw error\n        )\n",
          "mode": "100644",
          "type": "blob"
        },
        "package_runner.coffee.md": {
          "path": "package_runner.coffee.md",
          "content": "Package Runner\n==============\n\nRun a package in an iframe.\n\nThe `launch` command will get the state of the app, replace the iframe with a clean\none, boot the new package and reload the app state. You can also optionally pass\nin an app state to launch into.\n\nA primary reason for wrapping the running iframe with a shim window is that we\ncan dispose of timeouts and everything else very cleanly, while still keeping the\nsame opened window.\n\nOne example use of hot reloading is if you are modifying your css you can run\nseveral instances of your app and navigate to different states. Then you can see\nin real time how the css changes affect each one.\n\nThe package runner assumes that it has total control over the document so you\nprobably won't want to give it the one in your own window.\n\n    {extend} = require \"util\"\n\n    Sandbox = require \"sandbox\"\n\n    module.exports = (config={}) ->\n      sandbox = Sandbox(config)\n      document = sandbox.document\n\n      applyStylesheet document, require \"./style\"\n      runningInstance = null\n\n      self =\n        launch: (pkg, data) ->\n          # Get data from running instance\n          data ?= runningInstance?.contentWindow?.appData?()\n\n          # Remove Running instance\n          runningInstance?.remove()\n\n          # Create new instance\n          runningInstance = document.createElement \"iframe\"\n          document.body.appendChild runningInstance\n\n          proxyCalls document, runningInstance\n\n          # Pass in app state\n          extend runningInstance.contentWindow.ENV ?= {},\n            APP_STATE: data\n\n          runningInstance.contentWindow.document.write html(pkg)\n\n          return self\n\nMake RPC calls to running a package that is using `Postmaster`.\n\nReturns a promise that is fulfilled with the results of the successful\ninvocation of the call, or rejected with an error object.\n\n        send: do ->\n          incId = -1\n\n          handlers = {}\n\n          addEventListener \"message\", ({source, data}) ->\n            if source is runningInstance?.contentWindow\n              {type, id, success, error} = data\n\n              if type is \"response\"\n                if success\n                  handlers[id][0](success)\n                else if error\n                  handlers[id][1](error)\n\n                delete handlers[id]\n\n          (method, params...) ->\n            new Promise (resolve, reject) ->\n              incId += 1\n              handlers[incId] = [resolve, reject]\n\n              runningInstance.contentWindow.postMessage\n                id: incId\n                method: method\n                params: params\n              , \"*\"\n\n        window: sandbox\n\n        close: ->\n          sandbox.close()\n\n        eval: (code) ->\n          runningInstance.contentWindow.eval(code)\n\nA standalone html page for a package.\n\n    html = (pkg) ->\n      \"\"\"\n        <!DOCTYPE html>\n        <html>\n        <head>\n        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n        #{dependencyScripts(pkg.remoteDependencies)}\n        </head>\n        <body>\n        <script>\n        #{require('require').executePackageWrapper(pkg)}\n        <\\/script>\n        </body>\n        </html>\n      \"\"\"\n\nHelpers\n-------\n\nProxy calls from the iframe to the top window. Currently just proxying logging,\nbut may add others as needed.\n\n    proxyCalls = (document, iframe) ->\n      [\n        \"opener\"\n        \"console\"\n      ].forEach (name) ->\n        iframe.contentWindow[name] = document.defaultView[name]\n\n`makeScript` returns a string representation of a script tag that has a src\nattribute.\n\n    makeScript = (src) ->\n      \"<script src=#{JSON.stringify(src)}><\\/script>\"\n\n`dependencyScripts` returns a string containing the script tags that are\nthe remote script dependencies of this build.\n\n    dependencyScripts = (remoteDependencies=[]) ->\n      remoteDependencies.map(makeScript).join(\"\\n\")\n\n    applyStylesheet = (document, style, id=\"primary\") ->\n      styleNode = document.createElement(\"style\")\n      styleNode.innerHTML = style\n      styleNode.id = id\n\n      if previousStyleNode = document.head.querySelector(\"style##{id}\")\n        previousStyleNode.parentNode.removeChild(prevousStyleNode)\n\n      document.head.appendChild(styleNode)\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.3.0\"\nentryPoint: \"main\"\ndependencies:\n  postmaster: \"distri/postmaster:v0.2.3\" # Just for testing\n  require: \"distri/require:v0.5.0\"\n  sandbox: \"distri/sandbox:v0.2.4\"\n  util: \"distri/util:v0.1.0\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "style.styl": {
          "path": "style.styl",
          "content": "body\n  height: 100%\n  margin: 0\n\nhtml\n  height: 100%\n\niframe\n  border: none\n  height: 100%\n  width: 100%\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/runner.coffee": {
          "path": "test/runner.coffee",
          "content": "{PackageRunner} = Runner = require \"../main\"\n\ndescribe \"Runner\", ->\n  it \"should be able to open a window with content\", (done) ->\n    p = new Promise (resolve) ->\n      setTimeout ->\n        resolve \"some content\"\n\n    Runner.openWindowWithContent({}, p)\n    .then (sandbox) ->\n      assert.equal sandbox.document.body.innerText, \"some content\"\n      sandbox.close()\n      done()\n    .catch (err) ->\n      console.log err\n\ndescribe \"PackageRunner\", ->\n  it \"should be separate from the popup\", (done) ->\n    launcher = PackageRunner()\n\n    launcher.launch(PACKAGE)\n\n    assert launcher.eval(\"window !== top\")\n\n    launcher.close()\n    done()\n\n  it \"should have a window\", (done) ->\n    launcher = PackageRunner()\n\n    assert launcher.window\n    assert launcher.window != window\n\n    launcher.close()\n    done()\n\n  it \"should share console with the popup\", (done) ->\n    launcher = PackageRunner()\n\n    launcher.launch(PACKAGE)\n\n    assert launcher.eval(\"console === top.console\")\n\n    launcher.close()\n    done()\n\n  it \"should share opener with the popup\", (done) ->\n    launcher = PackageRunner()\n\n    launcher.launch(PACKAGE)\n\n    assert launcher.eval(\"opener === top.opener\")\n\n    launcher.close()\n    done()\n\n  it \"should be able to make RPC calls to the a package that runs `Postmaster`\", (done) ->\n    pkg =\n      distribution:\n        main:\n          content: \"\"\"\n            pm = require(\"postmaster\")();\n            pm.successRPC = function() {\n              return \"success\";\n            };\n            pm.failRPC = function() {\n              throw new Error(\"I am error\");\n            };\n            pm.echo = function(a) {\n              return a;\n            };\n          \"\"\"\n      dependencies: PACKAGE.dependencies\n      entryPoint: \"main\"\n\n    launcher = PackageRunner()\n    launcher.launch(pkg)\n\n    Promise.all [\n      launcher.send \"successRPC\"\n      .then (result) ->\n        assert.equal result, \"success\"\n\n      launcher.send \"failRPC\"\n      .catch (e) ->\n        assert.equal e.message, \"I am error\"\n\n      launcher.send(\"echo\", 5)\n      .then (result) ->\n        assert.equal result, 5\n    ]\n    .then ->\n      launcher.close()\n      done()\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var Sandbox;\n\n  Sandbox = require(\"sandbox\");\n\n  module.exports = {\n    Sandbox: Sandbox,\n    PackageRunner: require(\"./package_runner\"),\n    openWindowWithContent: function(config, contentPromise) {\n      var sandbox;\n      sandbox = Sandbox(config);\n      return contentPromise.then(function(content) {\n        sandbox.document.open();\n        sandbox.document.write(content);\n        sandbox.document.close();\n        return sandbox;\n      }, function(error) {\n        sandbox.close();\n        throw error;\n      });\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "package_runner": {
          "path": "package_runner",
          "content": "(function() {\n  var Sandbox, applyStylesheet, dependencyScripts, extend, html, makeScript, proxyCalls,\n    __slice = [].slice;\n\n  extend = require(\"util\").extend;\n\n  Sandbox = require(\"sandbox\");\n\n  module.exports = function(config) {\n    var document, runningInstance, sandbox, self;\n    if (config == null) {\n      config = {};\n    }\n    sandbox = Sandbox(config);\n    document = sandbox.document;\n    applyStylesheet(document, require(\"./style\"));\n    runningInstance = null;\n    return self = {\n      launch: function(pkg, data) {\n        var _base, _ref;\n        if (data == null) {\n          data = runningInstance != null ? (_ref = runningInstance.contentWindow) != null ? typeof _ref.appData === \"function\" ? _ref.appData() : void 0 : void 0 : void 0;\n        }\n        if (runningInstance != null) {\n          runningInstance.remove();\n        }\n        runningInstance = document.createElement(\"iframe\");\n        document.body.appendChild(runningInstance);\n        proxyCalls(document, runningInstance);\n        extend((_base = runningInstance.contentWindow).ENV != null ? _base.ENV : _base.ENV = {}, {\n          APP_STATE: data\n        });\n        runningInstance.contentWindow.document.write(html(pkg));\n        return self;\n      },\n      send: (function() {\n        var handlers, incId;\n        incId = -1;\n        handlers = {};\n        addEventListener(\"message\", function(_arg) {\n          var data, error, id, source, success, type;\n          source = _arg.source, data = _arg.data;\n          if (source === (runningInstance != null ? runningInstance.contentWindow : void 0)) {\n            type = data.type, id = data.id, success = data.success, error = data.error;\n            if (type === \"response\") {\n              if (success) {\n                handlers[id][0](success);\n              } else if (error) {\n                handlers[id][1](error);\n              }\n              return delete handlers[id];\n            }\n          }\n        });\n        return function() {\n          var method, params;\n          method = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n          return new Promise(function(resolve, reject) {\n            incId += 1;\n            handlers[incId] = [resolve, reject];\n            return runningInstance.contentWindow.postMessage({\n              id: incId,\n              method: method,\n              params: params\n            }, \"*\");\n          });\n        };\n      })(),\n      window: sandbox,\n      close: function() {\n        return sandbox.close();\n      },\n      \"eval\": function(code) {\n        return runningInstance.contentWindow[\"eval\"](code);\n      }\n    };\n  };\n\n  html = function(pkg) {\n    return \"<!DOCTYPE html>\\n<html>\\n<head>\\n<meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\" />\\n\" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n</head>\\n<body>\\n<script>\\n\" + (require('require').executePackageWrapper(pkg)) + \"\\n<\\/script>\\n</body>\\n</html>\";\n  };\n\n  proxyCalls = function(document, iframe) {\n    return [\"opener\", \"console\"].forEach(function(name) {\n      return iframe.contentWindow[name] = document.defaultView[name];\n    });\n  };\n\n  makeScript = function(src) {\n    return \"<script src=\" + (JSON.stringify(src)) + \"><\\/script>\";\n  };\n\n  dependencyScripts = function(remoteDependencies) {\n    if (remoteDependencies == null) {\n      remoteDependencies = [];\n    }\n    return remoteDependencies.map(makeScript).join(\"\\n\");\n  };\n\n  applyStylesheet = function(document, style, id) {\n    var previousStyleNode, styleNode;\n    if (id == null) {\n      id = \"primary\";\n    }\n    styleNode = document.createElement(\"style\");\n    styleNode.innerHTML = style;\n    styleNode.id = id;\n    if (previousStyleNode = document.head.querySelector(\"style#\" + id)) {\n      previousStyleNode.parentNode.removeChild(prevousStyleNode);\n    }\n    return document.head.appendChild(styleNode);\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.3.0\",\"entryPoint\":\"main\",\"dependencies\":{\"postmaster\":\"distri/postmaster:v0.2.3\",\"require\":\"distri/require:v0.5.0\",\"sandbox\":\"distri/sandbox:v0.2.4\",\"util\":\"distri/util:v0.1.0\"}};",
          "type": "blob"
        },
        "style": {
          "path": "style",
          "content": "module.exports = \"body {\\n  height: 100%;\\n  margin: 0;\\n}\\n\\nhtml {\\n  height: 100%;\\n}\\n\\niframe {\\n  border: none;\\n  height: 100%;\\n  width: 100%;\\n}\";",
          "type": "blob"
        },
        "test/runner": {
          "path": "test/runner",
          "content": "(function() {\n  var PackageRunner, Runner;\n\n  PackageRunner = (Runner = require(\"../main\")).PackageRunner;\n\n  describe(\"Runner\", function() {\n    return it(\"should be able to open a window with content\", function(done) {\n      var p;\n      p = new Promise(function(resolve) {\n        return setTimeout(function() {\n          return resolve(\"some content\");\n        });\n      });\n      return Runner.openWindowWithContent({}, p).then(function(sandbox) {\n        assert.equal(sandbox.document.body.innerText, \"some content\");\n        sandbox.close();\n        return done();\n      })[\"catch\"](function(err) {\n        return console.log(err);\n      });\n    });\n  });\n\n  describe(\"PackageRunner\", function() {\n    it(\"should be separate from the popup\", function(done) {\n      var launcher;\n      launcher = PackageRunner();\n      launcher.launch(PACKAGE);\n      assert(launcher[\"eval\"](\"window !== top\"));\n      launcher.close();\n      return done();\n    });\n    it(\"should have a window\", function(done) {\n      var launcher;\n      launcher = PackageRunner();\n      assert(launcher.window);\n      assert(launcher.window !== window);\n      launcher.close();\n      return done();\n    });\n    it(\"should share console with the popup\", function(done) {\n      var launcher;\n      launcher = PackageRunner();\n      launcher.launch(PACKAGE);\n      assert(launcher[\"eval\"](\"console === top.console\"));\n      launcher.close();\n      return done();\n    });\n    it(\"should share opener with the popup\", function(done) {\n      var launcher;\n      launcher = PackageRunner();\n      launcher.launch(PACKAGE);\n      assert(launcher[\"eval\"](\"opener === top.opener\"));\n      launcher.close();\n      return done();\n    });\n    return it(\"should be able to make RPC calls to the a package that runs `Postmaster`\", function(done) {\n      var launcher, pkg;\n      pkg = {\n        distribution: {\n          main: {\n            content: \"pm = require(\\\"postmaster\\\")();\\npm.successRPC = function() {\\n  return \\\"success\\\";\\n};\\npm.failRPC = function() {\\n  throw new Error(\\\"I am error\\\");\\n};\\npm.echo = function(a) {\\n  return a;\\n};\"\n          }\n        },\n        dependencies: PACKAGE.dependencies,\n        entryPoint: \"main\"\n      };\n      launcher = PackageRunner();\n      launcher.launch(pkg);\n      return Promise.all([\n        launcher.send(\"successRPC\").then(function(result) {\n          return assert.equal(result, \"success\");\n        }), launcher.send(\"failRPC\")[\"catch\"](function(e) {\n          return assert.equal(e.message, \"I am error\");\n        }), launcher.send(\"echo\", 5).then(function(result) {\n          return assert.equal(result, 5);\n        })\n      ]).then(function() {\n        launcher.close();\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.3.0",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.3.0",
        "default_branch": "master",
        "full_name": "distri/runner",
        "homepage": null,
        "description": "Runner manages running apps in sandboxed windows and passing messages back and forth from the parent to the running instances.",
        "html_url": "https://github.com/distri/runner",
        "url": "https://api.github.com/repos/distri/runner",
        "publishBranch": "gh-pages"
      },
      "dependencies": {
        "postmaster": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "content": "postmaster\n==========\n\nSend and receive postMessage commands.\n",
              "mode": "100644",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "content": "Postmaster\n==========\n\nPostmaster allows a child window that was opened from a parent window to\nreceive method calls from the parent window through the postMessage events.\n\nFigure out who we should be listening to.\n\n    dominant = opener or ((parent != window) and parent) or undefined\n\nBind postMessage events to methods.\n\n    module.exports = (I={}, self={}) ->\n      # Only listening to messages from `opener`\n      addEventListener \"message\", (event) ->\n        if event.source is dominant\n          {method, params, id} = event.data\n\n          try\n            result = self[method](params...)\n\n            send\n              type: \"response\"\n              id: id\n              success: result \n          catch error\n            send\n              type: \"response\"\n              id: id\n              error:\n                message: error.message\n                stack: error.stack\n\n      addEventListener \"unload\", ->\n        send\n          status: \"unload\"\n\n      # Tell our opener that we're ready\n      send\n        status: \"ready\"\n\n      self.sendToParent = send\n\n      return self\n\n    send = (data) ->\n      dominant?.postMessage data, \"*\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "version: \"0.2.3\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/postmaster.coffee": {
              "path": "test/postmaster.coffee",
              "content": "Postmaster = require \"../main\"\n\ndescribe \"Postmaster\", ->\n  it \"should allow sending messages to parent\", ->\n    postmaster = Postmaster()\n\n    postmaster.sendToParent\n      radical: \"true\"\n",
              "mode": "100644",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var dominant, send;\n\n  dominant = opener || ((parent !== window) && parent) || void 0;\n\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    addEventListener(\"message\", function(event) {\n      var error, id, method, params, result, _ref;\n      if (event.source === dominant) {\n        _ref = event.data, method = _ref.method, params = _ref.params, id = _ref.id;\n        try {\n          result = self[method].apply(self, params);\n          return send({\n            type: \"response\",\n            id: id,\n            success: result\n          });\n        } catch (_error) {\n          error = _error;\n          return send({\n            type: \"response\",\n            id: id,\n            error: {\n              message: error.message,\n              stack: error.stack\n            }\n          });\n        }\n      }\n    });\n    addEventListener(\"unload\", function() {\n      return send({\n        status: \"unload\"\n      });\n    });\n    send({\n      status: \"ready\"\n    });\n    self.sendToParent = send;\n    return self;\n  };\n\n  send = function(data) {\n    return dominant != null ? dominant.postMessage(data, \"*\") : void 0;\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.3\"};",
              "type": "blob"
            },
            "test/postmaster": {
              "path": "test/postmaster",
              "content": "(function() {\n  var Postmaster;\n\n  Postmaster = require(\"../main\");\n\n  describe(\"Postmaster\", function() {\n    return it(\"should allow sending messages to parent\", function() {\n      var postmaster;\n      postmaster = Postmaster();\n      return postmaster.sendToParent({\n        radical: \"true\"\n      });\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://www.danielx.net/editor/"
          },
          "version": "0.2.3",
          "entryPoint": "main",
          "repository": {
            "branch": "v0.2.3",
            "default_branch": "master",
            "full_name": "distri/postmaster",
            "homepage": null,
            "description": "Send and receive postMessage commands.",
            "html_url": "https://github.com/distri/postmaster",
            "url": "https://api.github.com/repos/distri/postmaster",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        },
        "require": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "content": "require\n=======\n\nRequire system for self replicating client side apps\n\n[Docs](http://distri.github.io/require/docs)\n",
              "mode": "100644",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "content": "Require\n=======\n\nA Node.js compatible require implementation for pure client side apps.\n\nEach file is a module. Modules are responsible for exporting an object. Unlike\ntraditional client side JavaScript, Ruby, or other common languages the module\nis not responsible for naming its product in the context of the requirer. This\nmaintains encapsulation because it is impossible from within a module to know\nwhat external name would be correct to prevent errors of composition in all\npossible uses.\n\nUses\n----\n\nFrom a module require another module in the same package.\n\n>     require \"./soup\"\n\nRequire a module in the parent directory\n\n>     require \"../nuts\"\n\nRequire a module from the root directory in the same package.\n\nNOTE: This could behave slightly differently under Node.js if your package does\nnot have it's own isolated filesystem.\n\n>     require \"/silence\"\n\nFrom a module within a package, require a dependent package.\n\n>     require \"console\"\n\nThe dependency could be delcared in pixie.cson as follows:\n\n>     dependencies:\n>       console: \"http://strd6.github.io/console/v1.2.2.json\"\n\nYou can require a package directly from its JSON representation as well.\n\n>     $.getJSON(packageURL)\n>     .then (pkg) ->\n>       require pkg\n\nImplementation\n--------------\n\nFile separator is '/'\n\n    fileSeparator = '/'\n\nIn the browser `global` is `self`.\n\n    global = self\n\nDefault entry point\n\n    defaultEntryPoint = \"main\"\n\nA sentinal against circular requires.\n\n    circularGuard = {}\n\nA top-level module so that all other modules won't have to be orphans.\n\n    rootModule =\n      path: \"\"\n\nRequire a module given a path within a package. Each file is its own separate\nmodule. An application is composed of packages.\n\n    loadPath = (parentModule, pkg, path) ->\n      if startsWith(path, '/')\n        localPath = []\n      else\n        localPath = parentModule.path.split(fileSeparator)\n\n      normalizedPath = normalizePath(path, localPath)\n\n      cache = cacheFor(pkg)\n\n      if module = cache[normalizedPath]\n        if module is circularGuard\n          throw \"Circular dependency detected when requiring #{normalizedPath}\"\n      else\n        cache[normalizedPath] = circularGuard\n\n        try\n          cache[normalizedPath] = module = loadModule(pkg, normalizedPath)\n        finally\n          delete cache[normalizedPath] if cache[normalizedPath] is circularGuard\n\n      return module.exports\n\nTo normalize the path we convert local paths to a standard form that does not\ncontain an references to current or parent directories.\n\n    normalizePath = (path, base=[]) ->\n      base = base.concat path.split(fileSeparator)\n      result = []\n\nChew up all the pieces into a standardized path.\n\n      while base.length\n        switch piece = base.shift()\n          when \"..\"\n            result.pop()\n          when \"\", \".\"\n            # Skip\n          else\n            result.push(piece)\n\n      return result.join(fileSeparator)\n\n`loadPackage` Loads a dependent package at that packages entry point.\n\n    loadPackage = (pkg) ->\n      path = pkg.entryPoint or defaultEntryPoint\n\n      loadPath(rootModule, pkg, path)\n\nLoad a file from within a package.\n\n    loadModule = (pkg, path) ->\n      unless (file = pkg.distribution[path])\n        throw \"Could not find file at #{path} in #{pkg.name}\"\n\n      unless (content = file.content)?\n        throw \"Malformed package. No content for file at #{path} in #{pkg.name}\"\n\n      program = annotateSourceURL content, pkg, path\n      dirname = path.split(fileSeparator)[0...-1].join(fileSeparator)\n\n      module =\n        path: dirname\n        exports: {}\n\nThis external context provides some variable that modules have access to.\n\nA `require` function is exposed to modules so they may require other modules.\n\nAdditional properties such as a reference to the global object and some metadata\nare also exposed.\n\n      context =\n        require: generateRequireFn(pkg, module)\n        global: global\n        module: module\n        exports: module.exports\n        PACKAGE: pkg\n        __filename: path\n        __dirname: dirname\n\n      args = Object.keys(context)\n      values = args.map (name) -> context[name]\n\nExecute the program within the module and given context.\n\n      Function(args..., program).apply(module, values)\n\n      return module\n\nHelper to detect if a given path is a package.\n\n    isPackage = (path) ->\n      if !(startsWith(path, fileSeparator) or\n        startsWith(path, \".#{fileSeparator}\") or\n        startsWith(path, \"..#{fileSeparator}\")\n      )\n        path.split(fileSeparator)[0]\n      else\n        false\n\nGenerate a require function for a given module in a package.\n\nIf we are loading a package in another module then we strip out the module part\nof the name and use the `rootModule` rather than the local module we came from.\nThat way our local path won't affect the lookup path in another package.\n\nLoading a module within our package, uses the requiring module as a parent for\nlocal path resolution.\n\n    generateRequireFn = (pkg, module=rootModule) ->\n      pkg.name ?= \"ROOT\"\n      pkg.scopedName ?= \"ROOT\"\n\n      (path) ->\n        if typeof path is \"object\"\n          loadPackage(path)\n        else if isPackage(path)\n          unless otherPackage = pkg.dependencies[path]\n            throw \"Package: #{path} not found.\"\n\n          otherPackage.name ?= path\n          otherPackage.scopedName ?= \"#{pkg.scopedName}:#{path}\"\n\n          loadPackage(otherPackage)\n        else\n          loadPath(module, pkg, path)\n\nBecause we can't actually `require('require')` we need to export it a little\ndifferently.\n\n    publicAPI =\n      generateFor: generateRequireFn\n\nWrap a package as a string that will bootstrap `require` and execute the package.\nThis can be used for generating standalone HTML pages, scripts, and tests.\n\n      packageWrapper: (pkg, code) ->\n        \"\"\"\n          ;(function(PACKAGE) {\n            var oldRequire = self.Require;\n            #{PACKAGE.distribution.main.content}\n            var require = Require.generateFor(PACKAGE);\n            #{code};\n            self.Require = oldRequire;\n          })(#{JSON.stringify(pkg, null, 2)});\n        \"\"\"\n\nWrap a package as a string that will execute its entry point.\n\n      executePackageWrapper: (pkg) ->\n        publicAPI.packageWrapper pkg, \"require('./#{pkg.entryPoint}')\"\n\n    if exports?\n      module.exports = publicAPI\n    else\n      global.Require = publicAPI\n\nNotes\n-----\n\nWe have to use `pkg` as a variable name because `package` is a reserved word.\n\nNode needs to check file extensions, but because we only load compiled products\nwe never have extensions in our path.\n\nSo while Node may need to check for either `path/somefile.js` or `path/somefile.coffee`\nthat will already have been resolved for us and we will only check `path/somefile`\n\nCircular dependencies are not allowed and raise an exception when detected.\n\nHelpers\n-------\n\nDetect if a string starts with a given prefix.\n\n    startsWith = (string, prefix) ->\n      string.lastIndexOf(prefix, 0) is 0\n\nCreates a cache for modules within a package. It uses `defineProperty` so that\nthe cache doesn't end up being enumerated or serialized to json.\n\n    cacheFor = (pkg) ->\n      return pkg.cache if pkg.cache\n\n      Object.defineProperty pkg, \"cache\",\n        value: {}\n\n      return pkg.cache\n\nAnnotate a program with a source url so we can debug in Chrome's dev tools.\n\n    annotateSourceURL = (program, pkg, path) ->\n      \"\"\"\n        #{program}\n        //# sourceURL=#{pkg.scopedName}/#{path}\n      \"\"\"\n\nDefinitions\n-----------\n\n### Module\n\nA module is a file.\n\n### Package\n\nA package is an aggregation of modules. A package is a json object with the\nfollowing properties:\n\n- `distribution` An object whose keys are paths and properties are `fileData`\n- `entryPoint` Path to the primary module that requiring this package will require.\n- `dependencies` An object whose keys are names and whose values are packages.\n\nIt may have additional properties such as `source`, `repository`, and `docs`.\n\n### Application\n\nAn application is a package which has an `entryPoint` and may have dependencies.\nAdditionally an application's dependencies may have dependencies. Dependencies\nmust be bundled with the package.\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "version: \"0.5.0\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "samples/circular.coffee": {
              "path": "samples/circular.coffee",
              "content": "# This test file illustrates a circular requirement and should throw an error.\n\nrequire \"./circular\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "samples/random.coffee": {
              "path": "samples/random.coffee",
              "content": "# Returns a random value, used for testing caching\n\nmodule.exports = Math.random()\n",
              "mode": "100644",
              "type": "blob"
            },
            "samples/terminal.coffee": {
              "path": "samples/terminal.coffee",
              "content": "# A test file for requiring a file that has no dependencies. It should succeed.\n\nexports.something = true\n",
              "mode": "100644",
              "type": "blob"
            },
            "samples/throws.coffee": {
              "path": "samples/throws.coffee",
              "content": "# A test file that throws an error.\n\nthrow \"yolo\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/require.coffee.md": {
              "path": "test/require.coffee.md",
              "content": "Testing out this crazy require thing\n\n    # Load our latest require code for testing\n    # NOTE: This causes the root for relative requires to be at the root dir, not the test dir\n    latestRequire = require('/main').generateFor(PACKAGE)\n\n    describe \"PACKAGE\", ->\n      it \"should be named 'ROOT'\", ->\n        assert.equal PACKAGE.name, \"ROOT\"\n\n    describe \"require\", ->\n      it \"should not exist globally\", ->\n        assert !global.require\n\n      it \"should be able to require a file that exists with a relative path\", ->\n        assert latestRequire('/samples/terminal')\n\n      it \"should get whatever the file exports\", ->\n        assert latestRequire('/samples/terminal').something\n\n      it \"should not get something the file doesn't export\", ->\n        assert !latestRequire('/samples/terminal').something2\n\n      it \"should throw a descriptive error when requring circular dependencies\", ->\n        assert.throws ->\n          latestRequire('/samples/circular')\n        , /circular/i\n\n      it \"should throw a descriptive error when requiring a package that doesn't exist\", ->\n        assert.throws ->\n          latestRequire \"does_not_exist\"\n        , /not found/i\n\n      it \"should throw a descriptive error when requiring a relative path that doesn't exist\", ->\n        assert.throws ->\n          latestRequire \"/does_not_exist\"\n        , /Could not find file/i\n\n      it \"should recover gracefully enough from requiring files that throw errors\", ->\n        assert.throws ->\n          latestRequire \"/samples/throws\"\n\n        assert.throws ->\n          latestRequire \"/samples/throws\"\n        , (err) ->\n          !/circular/i.test err\n\n      it \"should cache modules\", ->\n        result = latestRequire(\"/samples/random\")\n\n        assert.equal latestRequire(\"/samples/random\"), result\n\n      it \"should be able to require a JSON package object\", ->\n        SAMPLE_PACKAGE =\n          entryPoint: \"main\"\n          distribution:\n            main:\n              content: \"module.exports = require('./other')\"\n            other:\n              content: \"module.exports = 'TEST'\"\n\n        result = latestRequire SAMPLE_PACKAGE\n\n        assert.equal \"TEST\", result\n\n    describe \"package wrapper\", ->\n      it \"should be able to generate a package wrapper\", ->\n        assert require('/main').executePackageWrapper(PACKAGE)\n\n      it \"should be able to execute code in the package context\", ->\n        assert require('/main').packageWrapper(PACKAGE, \"my_codezz\")\n\n    describe \"module context\", ->\n      it \"should know __dirname\", ->\n        assert.equal \"test\", __dirname\n\n      it \"should know __filename\", ->\n        assert __filename\n\n      it \"should know its package\", ->\n        assert PACKAGE\n\n    describe \"malformed package\", ->\n      malformedPackage =\n        distribution:\n          yolo: \"No content!\"\n\n      it \"should throw an error when attempting to require a malformed file in a package distribution\", ->\n        r = require('/main').generateFor(malformedPackage)\n\n        assert.throws ->\n          r.require \"yolo\"\n        , (err) ->\n          !/malformed/i.test err\n\n    describe \"dependent packages\", ->\n      PACKAGE.dependencies[\"test-package\"] =\n        distribution:\n          main:\n            content: \"module.exports = PACKAGE.name\"\n\n      PACKAGE.dependencies[\"strange/name\"] =\n        distribution:\n          main:\n            content: \"\"\n\n      it \"should raise an error when requiring a package that doesn't exist\", ->\n        assert.throws ->\n          latestRequire \"nonexistent\"\n        , (err) ->\n          /nonexistent/i.test err\n\n      it \"should be able to require a package that exists\", ->\n        assert latestRequire(\"test-package\")\n\n      it \"Dependent packages should know their names when required\", ->\n        assert.equal latestRequire(\"test-package\"), \"test-package\"\n\n      it \"should be able to require by pretty much any name\", ->\n        assert latestRequire(\"strange/name\")\n",
              "mode": "100644",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,\n    __slice = [].slice;\n\n  fileSeparator = '/';\n\n  global = self;\n\n  defaultEntryPoint = \"main\";\n\n  circularGuard = {};\n\n  rootModule = {\n    path: \"\"\n  };\n\n  loadPath = function(parentModule, pkg, path) {\n    var cache, localPath, module, normalizedPath;\n    if (startsWith(path, '/')) {\n      localPath = [];\n    } else {\n      localPath = parentModule.path.split(fileSeparator);\n    }\n    normalizedPath = normalizePath(path, localPath);\n    cache = cacheFor(pkg);\n    if (module = cache[normalizedPath]) {\n      if (module === circularGuard) {\n        throw \"Circular dependency detected when requiring \" + normalizedPath;\n      }\n    } else {\n      cache[normalizedPath] = circularGuard;\n      try {\n        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);\n      } finally {\n        if (cache[normalizedPath] === circularGuard) {\n          delete cache[normalizedPath];\n        }\n      }\n    }\n    return module.exports;\n  };\n\n  normalizePath = function(path, base) {\n    var piece, result;\n    if (base == null) {\n      base = [];\n    }\n    base = base.concat(path.split(fileSeparator));\n    result = [];\n    while (base.length) {\n      switch (piece = base.shift()) {\n        case \"..\":\n          result.pop();\n          break;\n        case \"\":\n        case \".\":\n          break;\n        default:\n          result.push(piece);\n      }\n    }\n    return result.join(fileSeparator);\n  };\n\n  loadPackage = function(pkg) {\n    var path;\n    path = pkg.entryPoint || defaultEntryPoint;\n    return loadPath(rootModule, pkg, path);\n  };\n\n  loadModule = function(pkg, path) {\n    var args, content, context, dirname, file, module, program, values;\n    if (!(file = pkg.distribution[path])) {\n      throw \"Could not find file at \" + path + \" in \" + pkg.name;\n    }\n    if ((content = file.content) == null) {\n      throw \"Malformed package. No content for file at \" + path + \" in \" + pkg.name;\n    }\n    program = annotateSourceURL(content, pkg, path);\n    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);\n    module = {\n      path: dirname,\n      exports: {}\n    };\n    context = {\n      require: generateRequireFn(pkg, module),\n      global: global,\n      module: module,\n      exports: module.exports,\n      PACKAGE: pkg,\n      __filename: path,\n      __dirname: dirname\n    };\n    args = Object.keys(context);\n    values = args.map(function(name) {\n      return context[name];\n    });\n    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);\n    return module;\n  };\n\n  isPackage = function(path) {\n    if (!(startsWith(path, fileSeparator) || startsWith(path, \".\" + fileSeparator) || startsWith(path, \"..\" + fileSeparator))) {\n      return path.split(fileSeparator)[0];\n    } else {\n      return false;\n    }\n  };\n\n  generateRequireFn = function(pkg, module) {\n    if (module == null) {\n      module = rootModule;\n    }\n    if (pkg.name == null) {\n      pkg.name = \"ROOT\";\n    }\n    if (pkg.scopedName == null) {\n      pkg.scopedName = \"ROOT\";\n    }\n    return function(path) {\n      var otherPackage;\n      if (typeof path === \"object\") {\n        return loadPackage(path);\n      } else if (isPackage(path)) {\n        if (!(otherPackage = pkg.dependencies[path])) {\n          throw \"Package: \" + path + \" not found.\";\n        }\n        if (otherPackage.name == null) {\n          otherPackage.name = path;\n        }\n        if (otherPackage.scopedName == null) {\n          otherPackage.scopedName = \"\" + pkg.scopedName + \":\" + path;\n        }\n        return loadPackage(otherPackage);\n      } else {\n        return loadPath(module, pkg, path);\n      }\n    };\n  };\n\n  publicAPI = {\n    generateFor: generateRequireFn,\n    packageWrapper: function(pkg, code) {\n      return \";(function(PACKAGE) {\\n  var oldRequire = self.Require;\\n  \" + PACKAGE.distribution.main.content + \"\\n  var require = Require.generateFor(PACKAGE);\\n  \" + code + \";\\n  self.Require = oldRequire;\\n})(\" + (JSON.stringify(pkg, null, 2)) + \");\";\n    },\n    executePackageWrapper: function(pkg) {\n      return publicAPI.packageWrapper(pkg, \"require('./\" + pkg.entryPoint + \"')\");\n    }\n  };\n\n  if (typeof exports !== \"undefined\" && exports !== null) {\n    module.exports = publicAPI;\n  } else {\n    global.Require = publicAPI;\n  }\n\n  startsWith = function(string, prefix) {\n    return string.lastIndexOf(prefix, 0) === 0;\n  };\n\n  cacheFor = function(pkg) {\n    if (pkg.cache) {\n      return pkg.cache;\n    }\n    Object.defineProperty(pkg, \"cache\", {\n      value: {}\n    });\n    return pkg.cache;\n  };\n\n  annotateSourceURL = function(program, pkg, path) {\n    return \"\" + program + \"\\n//# sourceURL=\" + pkg.scopedName + \"/\" + path;\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.5.0\"};",
              "type": "blob"
            },
            "samples/circular": {
              "path": "samples/circular",
              "content": "(function() {\n  require(\"./circular\");\n\n}).call(this);\n",
              "type": "blob"
            },
            "samples/random": {
              "path": "samples/random",
              "content": "(function() {\n  module.exports = Math.random();\n\n}).call(this);\n",
              "type": "blob"
            },
            "samples/terminal": {
              "path": "samples/terminal",
              "content": "(function() {\n  exports.something = true;\n\n}).call(this);\n",
              "type": "blob"
            },
            "samples/throws": {
              "path": "samples/throws",
              "content": "(function() {\n  throw \"yolo\";\n\n}).call(this);\n",
              "type": "blob"
            },
            "test/require": {
              "path": "test/require",
              "content": "(function() {\n  var latestRequire;\n\n  latestRequire = require('/main').generateFor(PACKAGE);\n\n  describe(\"PACKAGE\", function() {\n    return it(\"should be named 'ROOT'\", function() {\n      return assert.equal(PACKAGE.name, \"ROOT\");\n    });\n  });\n\n  describe(\"require\", function() {\n    it(\"should not exist globally\", function() {\n      return assert(!global.require);\n    });\n    it(\"should be able to require a file that exists with a relative path\", function() {\n      return assert(latestRequire('/samples/terminal'));\n    });\n    it(\"should get whatever the file exports\", function() {\n      return assert(latestRequire('/samples/terminal').something);\n    });\n    it(\"should not get something the file doesn't export\", function() {\n      return assert(!latestRequire('/samples/terminal').something2);\n    });\n    it(\"should throw a descriptive error when requring circular dependencies\", function() {\n      return assert.throws(function() {\n        return latestRequire('/samples/circular');\n      }, /circular/i);\n    });\n    it(\"should throw a descriptive error when requiring a package that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"does_not_exist\");\n      }, /not found/i);\n    });\n    it(\"should throw a descriptive error when requiring a relative path that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"/does_not_exist\");\n      }, /Could not find file/i);\n    });\n    it(\"should recover gracefully enough from requiring files that throw errors\", function() {\n      assert.throws(function() {\n        return latestRequire(\"/samples/throws\");\n      });\n      return assert.throws(function() {\n        return latestRequire(\"/samples/throws\");\n      }, function(err) {\n        return !/circular/i.test(err);\n      });\n    });\n    it(\"should cache modules\", function() {\n      var result;\n      result = latestRequire(\"/samples/random\");\n      return assert.equal(latestRequire(\"/samples/random\"), result);\n    });\n    return it(\"should be able to require a JSON package object\", function() {\n      var SAMPLE_PACKAGE, result;\n      SAMPLE_PACKAGE = {\n        entryPoint: \"main\",\n        distribution: {\n          main: {\n            content: \"module.exports = require('./other')\"\n          },\n          other: {\n            content: \"module.exports = 'TEST'\"\n          }\n        }\n      };\n      result = latestRequire(SAMPLE_PACKAGE);\n      return assert.equal(\"TEST\", result);\n    });\n  });\n\n  describe(\"package wrapper\", function() {\n    it(\"should be able to generate a package wrapper\", function() {\n      return assert(require('/main').executePackageWrapper(PACKAGE));\n    });\n    return it(\"should be able to execute code in the package context\", function() {\n      return assert(require('/main').packageWrapper(PACKAGE, \"my_codezz\"));\n    });\n  });\n\n  describe(\"module context\", function() {\n    it(\"should know __dirname\", function() {\n      return assert.equal(\"test\", __dirname);\n    });\n    it(\"should know __filename\", function() {\n      return assert(__filename);\n    });\n    return it(\"should know its package\", function() {\n      return assert(PACKAGE);\n    });\n  });\n\n  describe(\"malformed package\", function() {\n    var malformedPackage;\n    malformedPackage = {\n      distribution: {\n        yolo: \"No content!\"\n      }\n    };\n    return it(\"should throw an error when attempting to require a malformed file in a package distribution\", function() {\n      var r;\n      r = require('/main').generateFor(malformedPackage);\n      return assert.throws(function() {\n        return r.require(\"yolo\");\n      }, function(err) {\n        return !/malformed/i.test(err);\n      });\n    });\n  });\n\n  describe(\"dependent packages\", function() {\n    PACKAGE.dependencies[\"test-package\"] = {\n      distribution: {\n        main: {\n          content: \"module.exports = PACKAGE.name\"\n        }\n      }\n    };\n    PACKAGE.dependencies[\"strange/name\"] = {\n      distribution: {\n        main: {\n          content: \"\"\n        }\n      }\n    };\n    it(\"should raise an error when requiring a package that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"nonexistent\");\n      }, function(err) {\n        return /nonexistent/i.test(err);\n      });\n    });\n    it(\"should be able to require a package that exists\", function() {\n      return assert(latestRequire(\"test-package\"));\n    });\n    it(\"Dependent packages should know their names when required\", function() {\n      return assert.equal(latestRequire(\"test-package\"), \"test-package\");\n    });\n    return it(\"should be able to require by pretty much any name\", function() {\n      return assert(latestRequire(\"strange/name\"));\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://www.danielx.net/editor/"
          },
          "version": "0.5.0",
          "entryPoint": "main",
          "repository": {
            "branch": "v0.5.0",
            "default_branch": "master",
            "full_name": "distri/require",
            "homepage": null,
            "description": "Require system for self replicating client side apps",
            "html_url": "https://github.com/distri/require",
            "url": "https://api.github.com/repos/distri/require",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        },
        "sandbox": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "content": "sandbox\n=======\n\nRun code in a popup window filled with sand.\n",
              "mode": "100644",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "content": "Sandbox\n=======\n\nSandbox creates a popup window in which you can run code.\n\nYou can pass in a width and a height to set the size of the window.\n\n    module.exports = ({name, width, height, methods}={}) ->\n      name ?= \"sandbox-#{Math.random()}\"\n      width ?= 800\n      height ?= 600\n      methods ?= {}\n\n      sandbox = window.open(\n        \"\"\n        name\n        \"width=#{width},height=#{height}\"\n      )\n\nPass in functions to attach to the running window. Useful for things like\n`onerror` or other utilities if you would like the running code to be able to\ncommunicate back to the parent.\n\n      extend sandbox, methods\n\n      autoClose(sandbox)\n\nThe newly created window is returned.\n\n      return sandbox\n\nHelpers\n-------\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nClose sandbox when closing our window.\n\n    autoClose = (sandbox) ->\n      closer = ->\n        window.removeEventListener \"unload\", closer\n        sandbox.close()\n\n      sandbox.addEventListener \"unload\", closer\n      window.addEventListener \"unload\", closer\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "version: \"0.2.4\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/sandbox.coffee": {
              "path": "test/sandbox.coffee",
              "content": "Sandbox = require \"../main\"\n\ndescribe \"sandbox\", ->\n  it \"should be able to open a window\", ->\n    sandbox = Sandbox()\n\n    assert sandbox\n\n    assert sandbox != window, \"Popup should not be this window\"\n\n    sandbox.close()\n",
              "mode": "100644",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var autoClose, extend,\n    __slice = [].slice;\n\n  module.exports = function(_arg) {\n    var height, methods, name, sandbox, width, _ref;\n    _ref = _arg != null ? _arg : {}, name = _ref.name, width = _ref.width, height = _ref.height, methods = _ref.methods;\n    if (name == null) {\n      name = \"sandbox-\" + (Math.random());\n    }\n    if (width == null) {\n      width = 800;\n    }\n    if (height == null) {\n      height = 600;\n    }\n    if (methods == null) {\n      methods = {};\n    }\n    sandbox = window.open(\"\", name, \"width=\" + width + \",height=\" + height);\n    extend(sandbox, methods);\n    autoClose(sandbox);\n    return sandbox;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  autoClose = function(sandbox) {\n    var closer;\n    closer = function() {\n      window.removeEventListener(\"unload\", closer);\n      return sandbox.close();\n    };\n    sandbox.addEventListener(\"unload\", closer);\n    return window.addEventListener(\"unload\", closer);\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.4\"};",
              "type": "blob"
            },
            "test/sandbox": {
              "path": "test/sandbox",
              "content": "(function() {\n  var Sandbox;\n\n  Sandbox = require(\"../main\");\n\n  describe(\"sandbox\", function() {\n    return it(\"should be able to open a window\", function() {\n      var sandbox;\n      sandbox = Sandbox();\n      assert(sandbox);\n      assert(sandbox !== window, \"Popup should not be this window\");\n      return sandbox.close();\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://www.danielx.net/editor/"
          },
          "version": "0.2.4",
          "entryPoint": "main",
          "repository": {
            "branch": "v0.2.4",
            "default_branch": "master",
            "full_name": "distri/sandbox",
            "homepage": null,
            "description": "Run code in a popup window filled with sand.",
            "html_url": "https://github.com/distri/sandbox",
            "url": "https://api.github.com/repos/distri/sandbox",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        },
        "util": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "util\n====\n\nSmall utility methods for JS\n",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "mode": "100644",
              "content": "Util\n====\n\n    module.exports =\n      approach: (current, target, amount) ->\n        (target - current).clamp(-amount, amount) + current\n\nApply a stylesheet idempotently.\n\n      applyStylesheet: (style, id=\"primary\") ->\n        styleNode = document.createElement(\"style\")\n        styleNode.innerHTML = style\n        styleNode.id = id\n\n        if previousStyleNode = document.head.querySelector(\"style##{id}\")\n          previousStyleNode.parentNode.removeChild(prevousStyleNode)\n\n        document.head.appendChild(styleNode)\n\n      defaults: (target, objects...) ->\n        for object in objects\n          for name of object\n            unless target.hasOwnProperty(name)\n              target[name] = object[name]\n\n        return target\n\n      extend: (target, sources...) ->\n        for source in sources\n          for name of source\n            target[name] = source[name]\n\n        return target\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.1.0\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    approach: function(current, target, amount) {\n      return (target - current).clamp(-amount, amount) + current;\n    },\n    applyStylesheet: function(style, id) {\n      var previousStyleNode, styleNode;\n      if (id == null) {\n        id = \"primary\";\n      }\n      styleNode = document.createElement(\"style\");\n      styleNode.innerHTML = style;\n      styleNode.id = id;\n      if (previousStyleNode = document.head.querySelector(\"style#\" + id)) {\n        previousStyleNode.parentNode.removeChild(prevousStyleNode);\n      }\n      return document.head.appendChild(styleNode);\n    },\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.1.0\"};",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.1.0",
          "entryPoint": "main",
          "repository": {
            "id": 18501018,
            "name": "util",
            "full_name": "distri/util",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
              "gravatar_id": "192f3f168409e79c42107f081139d9f3",
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/util",
            "description": "Small utility methods for JS",
            "fork": false,
            "url": "https://api.github.com/repos/distri/util",
            "forks_url": "https://api.github.com/repos/distri/util/forks",
            "keys_url": "https://api.github.com/repos/distri/util/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/util/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/util/teams",
            "hooks_url": "https://api.github.com/repos/distri/util/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/util/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/util/events",
            "assignees_url": "https://api.github.com/repos/distri/util/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/util/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/util/tags",
            "blobs_url": "https://api.github.com/repos/distri/util/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/util/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/util/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/util/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/util/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/util/languages",
            "stargazers_url": "https://api.github.com/repos/distri/util/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/util/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/util/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/util/subscription",
            "commits_url": "https://api.github.com/repos/distri/util/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/util/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/util/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/util/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/util/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/util/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/util/merges",
            "archive_url": "https://api.github.com/repos/distri/util/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/util/downloads",
            "issues_url": "https://api.github.com/repos/distri/util/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/util/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/util/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/util/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/util/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/util/releases{/id}",
            "created_at": "2014-04-06T22:42:56Z",
            "updated_at": "2014-04-06T22:42:56Z",
            "pushed_at": "2014-04-06T22:42:56Z",
            "git_url": "git://github.com/distri/util.git",
            "ssh_url": "git@github.com:distri/util.git",
            "clone_url": "https://github.com/distri/util.git",
            "svn_url": "https://github.com/distri/util",
            "homepage": null,
            "size": 0,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": null,
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
              "gravatar_id": "192f3f168409e79c42107f081139d9f3",
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 2,
            "branch": "v0.1.0",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        }
      }
    },
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
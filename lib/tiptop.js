(function() {
  var scope = this;
  (function (global, factory) {
    /*global define*/
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return factory(global);
      });
    } else if (typeof exports !== 'undefined') {
      module.exports = factory(global);
    } else {
      global.fn = factory(global);
    }
  }(scope, function (global) {
    'use strict';
    var fn;

    var _fn = global.fn
      , _reParams = /^\s*function\s*\(\s*([^\)]*)\s*\)/i
      , _reParams2 = /\s*,\s*/
      , _reType = /^\s*(.*)\$(.*)\s*$/;

    function typed(fn) {
      if (arguments.length !== 1) {
        throw new Error('Invalid argument length');
      }

      if (typeof arguments[0] !== 'function') {
        throw new Error('Type passed was not a function');
      }

      var signature = _parse(fn)
        , wrapped = function() {
            if (arguments.length !== signature.length) {
              throw new Error('Arguments do not match signature');
            }

            for (var i=0; i < signature.length; i++) {
              _assertParam.call(this, signature[i], arguments[i]);
            }

            // TODO: Add typed return
            return fn.apply(this, arguments);
          };

      wrapped.__fnSignature = signature.length === 0 ? 'void' : signature.join(':');

      return wrapped;
    }

    function overloaded() {
      if (arguments.length === 0) {
        throw new Error('Expects at least one argument');
      }

      var routes = {}
        , args = arguments.length === 1 && typeof arguments[0] !== 'function' ? arguments[0] : arguments; // funcs can be passed as arguments or an function[]

      for (var i=0; i < args.length; i++) {
        var func = typed(args[i]);
        if (typeof routes[func.__fnSignature] === 'undefined') {
          routes[func.__fnSignature] = func;
        }
        else {
          throw new Error('Duplicate signature detected for overload');
        }
      }

      // router
      return function() {
        var signature;

        if (0 === arguments.length) {
          signature = ['void'];
        }
        else {
          signature = [];
          for (var j=0; j < arguments.length; j++) {
            signature.push(_getClass(arguments[j]));
          }
        }

        return routes[signature.join(':')].apply(this, arguments);
      };
    }

    function _getClass(v) {
      if (typeof v === 'undefined' || null === v) {
        throw new Error('Undefined and null arguments are not currently supported');
      }

      var ctor = v.constructor;
      if (typeof ctor.name === 'undefined') {
        throw new Error('Argument must have constructor to infer type');
      }
      else {
        return ctor.name;
      }
    }

    function _assertParam(paramType, param) {
      if (typeof param === 'undefined') {
        throw new Error('Parameter type does not exist');
      }

      if (typeof param === 'undefined' || null === param) {
        throw new Error('Undefined and null values are not currently supported');
      }

      if ('' === _getClass(param)) {
        throw new Error('User object does not have name set');
      }

      if (_getClass(param) !== paramType) {
        throw new Error('Parameter type does not match');
      }
    }

    function _parse(fn) {
      // FIXME: iterate chrs for perf boost (maybe?)
      var sfn = fn.toString()
        , m = sfn.match(_reParams)
        , params = (null !== m && typeof m[1] !== 'undefined' ? m[1] : '').trim()
        , signature = [];

      if ('' !== params) {
        params.split(_reParams2).forEach(function(param) {
          var paramMatches = param.match(_reType) || []
            , paramType = paramMatches[2];

          signature.push(paramType);
        });
      }

      return signature;
    }

    function noConflict() {
      global.fn = _fn;
      return fn;
    }

    fn = {
        typed: typed
      , overloaded: overloaded
      , noConflict: noConflict
      , _parse: _parse
      , _assertParam: _assertParam
      , _getClass: _getClass
      , _re: {
            params: _reParams
          , sep: _reParams2
          , argType: _reType
        }
    };

    return fn;
  }));
})();

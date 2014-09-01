/*! tiptop - v0.0.0
 *  Release on: 2014-08-11
 *  Copyright (c) 2014 Cory Mawhorter
 *  Licensed MIT */
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

    var _reSplitParams = /\s*,\s*/
      , _reType = /^\s*(.*)\$(.*)\s*$/
      , _fn = global.fn
      , nullablePrefixChr = '_' // type prefix to identify nullable arguments
      , nullablePrefixChrLength = nullablePrefixChr.length
      , fn;

    /**
     * Wraps a function with stricter typing shtuff.
     *
     * @param {Function} the function to be wrapped.
     * @return {Function} the spiffified function.
     * @throws {TiptopError} on invalid argument length.
     * @throws {TiptopError} on invalid argument type.
     */
    function typed(fn) {
      if (1 !== arguments.length) {
        throw new ArgumentMismatchError('Invalid argument length');
      }

      if (!(fn instanceof Function)) {
        throw new ArgumentMismatchError('Type passed was not a function');
      }

      var signature = _parse(fn)
        , wrapped = function() {
            if (arguments.length !== signature.nonNullable.length) {
              throw new ArgumentMismatchError('Arguments do not match signature <' + signature.nonNullable.join(', ') + '>');
            }

            for (var i=0; i < signature.nonNullable.length; i++) {
              _assertParam.call(this, signature.defined[i], arguments[i]);
            }

            return fn.apply(this, arguments);
          };

      wrapped.__fnSignature = 0 === signature.nonNullable.length ? 'void' : signature.nonNullable.join(':');
      wrapped.__fnNullableSignature = signature.nullable ? signature.nullable.join(':') : null;

      return wrapped;
    }

    function overload() {
      var args = arguments
        , hasNullableRoutes = false
        , routes = {}
        , fns = null;

      if (1 === args.length && args[0] instanceof Array) {
        fns = args[0];
      }
      else if (args.length && args[0] instanceof Function) {
        fns = args;
      }
      else {
        throw new ArgumentMismatchError('Invalid arguments passed; type mismatch');
      }

      if (null === fns || fns.length < 2) {
        throw new ArgumentMismatchError('Invalid arguments passed; length mismatch');
      }

      for (var i=0; i < fns.length; i++) {
        var func = typed(fns[i]);
        if (routes[func.__fnSignature] || (func.__fnNullableSignature && routes[func.__fnNullableSignature])) {
          console.log('routes', Object.keys(routes))
          console.log('sig', func.__fnSignature);
          console.log('nullable', func.__fnNullableSignature);
          throw new TiptopError('Duplicate signature detected for overload');
        }
        else {
          routes[func.__fnSignature] = func;
          if (func.__fnNullableSignature) {
            routes[func.__fnNullableSignature] = routes[func.__fnSignature];
            hasNullableRoutes = true;
          }
        }
      }

      console.log('routes', Object.keys(routes));

      // router
      return function() {
        var signature
          , method;

        if (0 === arguments.length) {
          signature = ['void'];
        }
        else {
          signature = [];
          for (var j=0; j < arguments.length; j++) {
            var arg = arguments[j];
            if (hasNullableRoutes && null === arg) {
              signature.push(nullablePrefixChr);
            }
            else {
              signature.push(_getClass(arg));
            }
          }
        }

        console.log('signature', signature);

        method = routes[signature.join(':')];
        if (!method) {
          throw new SignatureNotFoundError('No method found for signature <' + signature.join(', ') + '>');
        }

        return method.apply(this, arguments);
      };
    }

    // TODO: is this correct?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    function TiptopError(message) {
      this.name = 'TiptopError';
      this.message = message || 'An unknown error occurred';
    }
    TiptopError.prototype = new Error();
    TiptopError.prototype.constructor = TiptopError;

    function SignatureNotFoundError(message) {
      this.name = 'SignatureNotFoundError';
      this.message = message || 'Method signature not found';
    }
    SignatureNotFoundError.prototype = new TiptopError();
    SignatureNotFoundError.prototype.constructor = SignatureNotFoundError;

    function ArgumentMismatchError(message) {
      this.name = 'ArgumentMismatchError';
      this.message = message || 'Arguments do not match method signature';
    }
    ArgumentMismatchError.prototype = new TiptopError();
    ArgumentMismatchError.prototype.constructor = ArgumentMismatchError;

    function UnnamedObjectError(message) {
      this.name = 'UnnamedObjectError';
      this.message = message || 'Object constructor is unnamed';
    }
    UnnamedObjectError.prototype = new TiptopError();
    UnnamedObjectError.prototype.constructor = UnnamedObjectError;

    // FIXME: Privates should not throw, and should handle some other way.  Return enum?

    function _getClass(v) {
      if (v === void 0 || null === v) {
        throw new TiptopError('Undefined and null arguments are not currently supported');
      }

      var ctor = v.constructor;
      if (!ctor || ctor.name === void 0 || !ctor.name.length) {
        throw new UnnamedObjectError('Argument must have constructor name to infer type');
      }
      else {
        return ctor.name;
      }
    }

    function _assertParam(paramType, param) {
      var className;

      if (paramType === void 0 || null === paramType) {
        throw new TiptopError('Parameter type does not exist');
      }

      if (nullablePrefixChr === paramType[0]) {
        if (null === param) {
          return;
        }

        paramType = paramType.substr(nullablePrefixChrLength);
      }

      try {
        className = _getClass(param);
      }
      catch (err) {
        if (err instanceof UnnamedObjectError) {
          throw new UnnamedObjectError('User object does not have name set');
        }
        else {
          throw err;
        }
      }

      if (className !== paramType) {
        throw new ArgumentMismatchError(paramType + ' does not match ' + className);
      }
    }

    function _between(str, a, b) {
      var idxA = str.indexOf(a)
        , idxB = str.indexOf(b);

      if (idxA < 0 || idxB < 0) {
        return false;
      }

      return str.substring(idxA + 1, idxB);
    }

    function _parse(fn) {
      var sfn = fn.toString()
        , params = _between(sfn, '(', ')').trim()
        , definedSignature = []
        , nonNullableSignature = []
        , nullableSignature = []
        , containsNulls = false;

      if (params.length) {
        params.split(_reSplitParams).forEach(function(param) {
          var paramMatches = param.match(_reType)
            , paramType;

          if (!paramMatches || !paramMatches.length) {
            throw new TiptopError('Parameter "' + param + '" does not have type defined.');
          }

          paramType = paramMatches[2];
          definedSignature.push(paramType);
          if (paramType.length && nullablePrefixChr === paramType[0]) {
            containsNulls = true;
            nullableSignature.push(nullablePrefixChr);
            nonNullableSignature.push(paramType.substr(nullablePrefixChrLength));
          }
          else {
            nullableSignature.push(paramType);
            nonNullableSignature.push(paramType);
          }
        });
      }

      return {
          defined: definedSignature
        , nullable: containsNulls ? nullableSignature : null
        , nonNullable: nonNullableSignature
      }
    }

    function noConflict() {
      global.fn = _fn;
      return fn;
    }

    fn = {
        typed: typed
      , overload: overload
      , errors: {
            TiptopError: TiptopError
          , SignatureNotFoundError: SignatureNotFoundError
          , ArgumentMismatchError: ArgumentMismatchError
          , UnnamedObjectError: UnnamedObjectError
        }
      , setNullablePrefixCharacter: function(v) { // not really supported... use at your own risk
          nullablePrefixChr = v;
          nullablePrefixChrLength = v.length;
        }
      , 'yar, these be me privates': {
            _parse: _parse
          , _between: _between
          , _assertParam: _assertParam
          , _getClass: _getClass
        }
      , noConflict: noConflict
    };

    return fn;
  }));
})();

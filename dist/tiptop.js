/*! tiptop - v0.0.0
 *  Release on: 2014-08-31
 *  Copyright (c) 2014 Cory Mawhorter
 *  Licensed MIT */
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
      , fn;

    /**
     * Wraps a function with stricter typing shtuff.
     *
     * @param {Function} the function to be wrapped.
     * @return {Function} the spiffified function.
     * @throws {TiptopError} on invalid argument length.
     * @throws {TiptopError} on invalid argument type.
     */
    function typed() {
      var nullOk = false
        , fn;

      switch (arguments.length) {
        case 1:
          fn = arguments[0];
        break;

        case 2:
          nullOk = arguments[0];
          fn = arguments[1];
        break;

        default:
          throw new ArgumentMismatchError('Invalid arguments passed; length mismatch');
      }

      if (nullOk === void 0 || (nullOk !== true && nullOk !== false) || !(fn instanceof Function)) {
        throw new ArgumentMismatchError('Invalid arguments passed; type mismatch');
      }

      var signature = _parse(fn)
        , wrapped = function() {
            if (arguments.length !== signature.length) {
              throw new ArgumentMismatchError('Arguments do not match signature <' + signature.join(', ') + '>');
            }

            for (var i=0; i < signature.length; i++) {
              _assertParam.call(this, signature[i], arguments[i], nullOk);
            }

            return fn.apply(this, arguments);
          };

      wrapped.__fnSignature = 0 === signature.length ? 'void' : signature.join(':');

      return wrapped;
    }

    function overload() {
      var args = Array.prototype.slice.call(arguments, 0)
        , routes = {}
        , nullOk = false
        , fns = null;

      if (true === args[0] || false === args[0]) {
        nullOk = args.shift();
      }

      if (1 === args.length && args[0] instanceof Array) {
        fns = args[0];
      }
      else if (args[0] instanceof Function) {
        fns = args;
      }

      if (null === fns || fns.length < 2) {
        throw new ArgumentMismatchError('Invalid arguments passed; length mismatch');
      }
      else if (nullOk === void 0 || (nullOk !== true && nullOk !== false)) {
        throw new ArgumentMismatchError('Invalid arguments passed; type mismatch');
      }

      for (var i=0; i < fns.length; i++) {
        var func = typed(nullOk, fns[i]);
        if (!routes[func.__fnSignature]) {
          routes[func.__fnSignature] = func;
        }
        else {
          throw new TiptopError('Duplicate signature detected for overload');
        }
      }

      // router
      return function() {
        var signature, method;

        if (0 === arguments.length) {
          signature = ['void'];
        }
        else {
          signature = [];
          for (var j=0; j < arguments.length; j++) {
            signature.push(_getClass(arguments[j]));
          }
        }

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

    function _assertParam(paramType, param, nullOk) {
      if (paramType === void 0) {
        throw new TiptopError('Parameter type does not exist');
      }

      if (true === nullOk && null === param) {
        return true;
      }

      var className;
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
        , signature = [];

      if (params.length) {
        params.split(_reSplitParams).forEach(function(param) {
          var paramMatches = param.match(_reType);
          if (!paramMatches || !paramMatches.length) {
            throw new TiptopError('Parameter "' + param + '" does not have type defined.');
          }
          signature.push(paramMatches[2]);
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
      , overload: overload
      , errors: {
            TiptopError: TiptopError
          , SignatureNotFoundError: SignatureNotFoundError
          , ArgumentMismatchError: ArgumentMismatchError
          , UnnamedObjectError: UnnamedObjectError
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

'use strict'

var assert = require('assert')
  , fn = require('../lib/tiptop');

describe('TipTop Internals', function() {
  var privs = fn['yar, these be me privates'];

  describe('#_getClass()', function() {
    it('should throw TiptopError if argument is null or undefined', function() {
      assert.throws(function() {
        privs._getClass();
      }, fn.errors.TiptopError);

      assert.throws(function() {
        privs._getClass(null);
      }, fn.errors.TiptopError);
    });

    it('should throw TiptopError if object does not have a constructor', function() {
      assert.throws(function() {
        privs._getClass({ constructor: null });
      }, fn.errors.TiptopError);

      assert.doesNotThrow(function() {
        privs._getClass({});
      });
    });

    it('should throw UnnamedObjectError if object does not have a constructor.name', function() {
      var namedObject = function MyObject(){}
        , unnamedObject = function(){};

      assert.throws(function() {
        privs._getClass(new unnamedObject());
      }, fn.errors.UnnamedObjectError);

      assert.doesNotThrow(function() {
        privs._getClass(new namedObject());
      }, fn.errors.UnnamedObjectError);
    });

    (function() {
      var customObject = function MyObject() {};
      var map = [
          { object: '', expected: 'String' }
        , { object: 'abcd', expected: 'String' }
        , { object: new String(), expected: 'String' }
        , { object: String(), expected: 'String' }

        , { object: 0, expected: 'Number' }
        , { object: -0, expected: 'Number' }
        , { object: 1, expected: 'Number' }
        , { object: -1, expected: 'Number' }
        , { object: new Number(), expected: 'Number' }
        , { object: Number(), expected: 'Number' }
        , { object: Number.MAX_VALUE, expected: 'Number' }
        , { object: Number.MIN_VALUE, expected: 'Number' }
        , { object: Infinity, expected: 'Number' }
        , { object: -Infinity, expected: 'Number' }
        , { object: NaN, expected: 'Number' } // in js, NaN is a Number ;] -- we'll fix this with custom types

        , { object: true, expected: 'Boolean' }
        , { object: false, expected: 'Boolean' }
        , { object: new Boolean(), expected: 'Boolean' }
        , { object: Boolean(), expected: 'Boolean' }

        , { object: {}, expected: 'Object' }
        , { object: new Object(), expected: 'Object' }
        , { object: Object(), expected: 'Object' }

        , { object: [], expected: 'Array' }
        , { object: new Array(), expected: 'Array' }
        , { object: Array(), expected: 'Array' }

        , { object: function(){}, expected: 'Function' }
        , { object: new Function(), expected: 'Function' }
        , { object: Function(), expected: 'Function' }

        , { object: new customObject(), expected: 'MyObject' }
      ];

      map.forEach(function(typeTest, index) {
        it('should return accurate classnames for ' + typeTest.expected + ' (map[' + index + '])', function() {
          assert.strictEqual(privs._getClass(typeTest.object), typeTest.expected);
        });
      });
    })();
  });

  describe('#_assertParam()', function() {
    it('should throw TiptopError when arguments are null or undefined', function() {
      assert.throws(function() {
        privs._assertParam();
      }, fn.errors.TiptopError);

      assert.throws(function() {
        privs._assertParam(null);
      }, fn.errors.TiptopError);

      assert.throws(function() {
        privs._assertParam('');
      }, fn.errors.TiptopError);

      assert.throws(function() {
        privs._assertParam('', null);
      }, fn.errors.TiptopError);
    });

    it('should not throw TiptopError when argument is flagged as nullable', function() {
      assert.doesNotThrow(function() {
        privs._assertParam('_String', '');
      });

      assert.doesNotThrow(function() {
        privs._assertParam('_String', null);
      });
    });

    it('should throw UnnamedObjectError when passed object does not have a constructor name', function() {
      var unnamedObject = function(){}
        , namedObject = function MyObject(){};

      assert.throws(function() {
        privs._assertParam('', new unnamedObject());
      }, fn.errors.UnnamedObjectError);

      assert.doesNotThrow(function() {
        privs._assertParam('MyObject', new namedObject());
      });
    });

    it('should throw TiptopError when passed object does not match supplied type', function() {
      var unnamedObject = function(){}
        , namedObject = function MyObject(){};

      assert.throws(function() {
        privs._assertParam('NotMyObject', new namedObject());
      }, fn.errors.ArgumentMismatchError);

      assert.doesNotThrow(function() {
        privs._assertParam('MyObject', new namedObject());
      }, fn.errors.ArgumentMismatchError);
    });
  });

  describe('#_between()', function() {
    var str = 'fuck is the greatest word in the english language';

    it('should return substring between two strings (exclsive)', function() {
      assert.strictEqual(privs._between(str, 'k', 'w'), ' is the greatest ');
    });

    it('should return false if either index is not found', function() {
      assert.strictEqual(privs._between('a', 'b', 'a'), false);
      assert.strictEqual(privs._between('a', 'a', 'b'), false);
      assert.notStrictEqual(privs._between('a', 'a', 'a'), false);
    });
  });

  describe('#_parse()', function() {
    it('should parse a function parameters', function() {
      assert.deepEqual(privs._parse(function() { }).nonNullable, []);
      assert.deepEqual(privs._parse(function(x$Number, y$String) { }).nonNullable, ['Number','String']);
      assert.deepEqual(privs._parse(function(x$Number, y$Number) { }).nonNullable, ['Number','Number']);
      assert.deepEqual(privs._parse(function(x$MyObject) { }).nonNullable, ['MyObject']);
      assert.deepEqual(privs._parse(function(x$MyObject, y$Number) { }).nonNullable, ['MyObject','Number']);
      assert.notDeepEqual(privs._parse(function(x$Number, y$String, z$Number) { }).nonNullable, ['Number','String']);
      assert.deepEqual(privs._parse(
        function
        (
          x$Number,
          y$String
        )
        {
        }).nonNullable, ['Number','String']);

      // TODO: do _parse().nullable
      // TODO: do _parse().defined
    });

    it('should parse named functions', function() {
      assert.deepEqual(privs._parse(function MyFunction() { }).nonNullable, []);
      assert.deepEqual(privs._parse(function MyFunction(x$Number, y$Number) { }).nonNullable, ['Number','Number']);
      assert.deepEqual(privs._parse(function MyFunction(x$Number, y$String) { }).nonNullable, ['Number','String']);
      assert.deepEqual(privs._parse(
        function MyFunction
        (
          x$Number,
          y$String
        )
        {
        }).nonNullable, ['Number','String']);

      // TODO: do _parse().nullable
      // TODO: do _parse().defined

    });

    it('should throw TiptopError when parameter does not have type', function() {
      assert.throws(function() {
        privs._parse(function(x) { });
      }, fn.errors.TiptopError)

      assert.doesNotThrow(function() {
        privs._parse(function(x$String) { });
        privs._parse(function() { });
      });
    });
  });
});

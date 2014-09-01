'use strict'

var assert = require('assert')
  , fn = require('../lib/tiptop');

describe('TipTop', function() {
  describe('#typed()', function() {
    it('should wrap a function', function() {
      assert.strictEqual(fn.typed(function(){}) instanceof Function, true);
    });

    it('should error if invalid arguments passed', function() {
      assert.throws(function() { fn.typed(); }, fn.errors.ArgumentMismatchError);
      assert.throws(function() { fn.typed(null); }, fn.errors.ArgumentMismatchError);
      assert.throws(function() { fn.typed(void 0); }, fn.errors.ArgumentMismatchError);

      assert.throws(function() { fn.typed(function(){}, function(){}); }, fn.errors.ArgumentMismatchError);
      assert.throws(function() { fn.typed(true, true); }, fn.errors.ArgumentMismatchError);

      assert.throws(function() { fn.typed(null, null); }, fn.errors.ArgumentMismatchError);
      assert.throws(function() { fn.typed(void 0, void 0); }, fn.errors.ArgumentMismatchError);

      assert.throws(function() { fn.typed(null, function(){}); }, fn.errors.ArgumentMismatchError);
      assert.throws(function() { fn.typed(void 0, function(){}); }, fn.errors.ArgumentMismatchError);
    });

    it('should wrap a function with arguments', function() {
      var testFunc = function(id$Number){};
      assert.strictEqual(fn.typed(testFunc) instanceof Function, true);
    });

    it('should wrap a function with arguments and optionally allow null', function() {
      var testFunc = function(id$_Number){};
      assert.strictEqual(fn.typed(testFunc) instanceof Function, true);
    });

    it('should return a signature attached to wrapped function', function() {
      var testFunc = fn.typed(function(id$Number){});
      assert.strictEqual(testFunc.__fnSignature, 'Number');
    });

    it('should return a signature attached to wrapped function with multiple parameters', function() {
      var testFunc = fn.typed(function(id$Number, name$String){});
      assert.strictEqual(testFunc.__fnSignature, 'Number:String');
    });

    it('should return a void signature attached to wrapped function when no parameters exist', function() {
      var testFunc = fn.typed(function(){});
      assert.strictEqual(testFunc.__fnSignature, 'void');
    });

    it('should allow wrapped function to be called', function() {
      var i = 0
        , testFunc = fn.typed(function(id$Number){ i = id$Number; });
      testFunc(5);
      assert.strictEqual(i, 5);
    });

    it('should error when an invalid type is passed', function() {
      var i = 0
        , testFunc = fn.typed(function(id$Number){ i = id$Number; });

      assert.throws(function() {
        testFunc('blah');
      }, fn.errors.ArgumentMismatchError);
    });

    it('should error when not enough arguments passed', function() {
      var i = 0
        , testFunc = fn.typed(function(id$Number){ i = id$Number; });

      assert.throws(function() {
        testFunc('blah');
      }, fn.errors.ArgumentMismatchError);
    });

    it('should error when too many arguments passed', function() {
      var i = 0
        , testFunc = fn.typed(function(id$Number){ i = id$Number; });

      assert.throws(function() {
        testFunc(1, 2);
      }, fn.errors.ArgumentMismatchError);
    });

    it('should work with multiple arguments of different types', function() {
      var i = 0
        , n = null
        , testFunc = fn.typed(function(id$Number, name$String){ i = id$Number; n = name$String; });

      testFunc(5, 'blah');
      assert.strictEqual(i, 5);
      assert.strictEqual(n, 'blah');
    });

    it('should error with null and undefined values', function() {
      var testFunc = fn.typed(function(id$Number){ i = id$Number; })
        , undf;

      assert.throws(function() {
        testFunc(null);
      }, 'Undefined and null values are not currently supported');

      assert.throws(function() {
        testFunc(undf);
      }, 'Undefined and null values are not currently supported');
    });

    it('should not error with null when optionally allowed', function() {
      assert.doesNotThrow(function() {
        fn.typed(function(id$_Number){ })(null);
      });

      assert.throws(function() {
        fn.typed(function(id$Number){ })(null);
      });
    });

    it('should blah blah with nullable collisions', function() {
      // TODO: create test to handle the case where two signatures collide with nullables
    });

    it('should work with objects', function() {
      var v = null
        , t = {}
        , testFunc = fn.typed(function(obj$Object){ v = obj$Object; });
      testFunc(t);
      assert.strictEqual(t, v);
    });

    it('should work with complex user objects', function() {
      var MyObj = function MyObj(a){ this.a = a; };
      var AnotherMyObj = function AnotherMyObj(a){ this.a = a; };

      var v = null
        , t = new MyObj('blah')
        , testFunc = fn.typed(function(obj$MyObj){ v = obj$MyObj; });

      testFunc(t);
      assert.strictEqual(t, v);
      assert.throws(function() {
        testFunc(new AnotherMyObj('a'));
      }, fn.errors.ArgumentMismatchError);
    });

    it('should get the return value', function() {
      var testFunc = fn.typed(function(){ return true; });
      assert.strictEqual(true, testFunc());
    });

    it('should get an undefined return value if wrapped function does not return', function() {
      var testFunc = fn.typed(function(){ })
        , undf;
      assert.strictEqual(undf, testFunc());
    });

    it('should error if user object does not have name set', function() {
      var MyObj = function(a){ this.a = a; };

      var v = null
        , t = new MyObj('blah')
        , testFunc = fn.typed(function(obj$MyObj){ v = obj$MyObj; });

      assert.throws(function() {
        testFunc(t);
      }, 'User object does not have name set');
    });

    it('should work as a method', function() {
      var MyObj = function MyObj() {};

      MyObj.prototype.blah = fn.typed(function(){
        return true;
      });

      assert.strictEqual(true, new MyObj().blah());
    });

    it('should work as a method and optionally allow nulls', function() {
      var MyObj = function MyObj() {};

      MyObj.prototype.blah = fn.typed(function(x$_Boolean){
        return x$_Boolean;
      });

      assert.strictEqual(null, new MyObj().blah(null));
      assert.strictEqual(true, new MyObj().blah(true));
      assert.strictEqual(false, new MyObj().blah(false));
    });

    it('should work as a method with parameters', function() {
      var MyObj = function MyObj() {
        this.i = 0;
      };

      MyObj.prototype.blah = fn.typed(function(id$Number){
        this.i = id$Number;
      });

      var obj = new MyObj();
      obj.blah(5);
      assert.strictEqual(5, obj.i);
    });

    it('should work via bind when not a method', function() {
      var self = this;
      var testFunc = fn.typed(function(){
        assert.strictEqual(true, self === this);
      }).bind(self);
      testFunc();
    });
  });
});

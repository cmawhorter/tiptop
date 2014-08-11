'use strict'

var assert = require('assert')
  , fn = require('../lib/tiptop');

describe('TipTop', function() {
  describe('#overloaded()', function() {
    it('should wrap a function', function() {
      assert.strictEqual(typeof fn.overloaded(function(){}), 'function');
    });

    it('should error if no function is passed', function() {
      assert.throws(function() {
        fn.overloaded();
      }, 'Expects at least one argument');
    });

    it('should error if null passed', function() {
      assert.throws(function() {
        fn.overloaded(null);
      }, 'Type passed was not a function');
    });

    it('should error if undefined passed', function() {
      assert.throws(function() {
        fn.overloaded();
      }, 'Type passed was not a function');
    });

    it('should wrap a function with arguments', function() {
      var testFunc = function(id$Number){};
      assert.strictEqual(typeof fn.overloaded(testFunc), 'function');
    });

    it('should work with an array of functions', function() {
      assert.strictEqual(typeof fn.overloaded([function(){},function(id$Number){}]), 'function');
    });

    it('should work with multiple functions as arguments', function() {
      assert.strictEqual(typeof fn.overloaded(function(){},function(id$Number){}), 'function');
    });

    it('should error if dupe signature detected', function() {
      assert.throws(function() {
        fn.overloaded(function(){},function(){});
      }, 'Duplicate signature detected for overload');
    });

    it('should work as a method', function() {
      var MyObj = function MyObj() {};

      MyObj.prototype.blah = fn.overloaded(
        function(){
          return true;
        },

        function(id$Number){
          return false;
        }
      );

      assert.strictEqual(true, new MyObj().blah());
      assert.strictEqual(false, new MyObj().blah(1));
    });

    it('should get the correct scope as a method', function() {
      var MyObj = function MyObj() {}
        , obj;

      MyObj.prototype.blah = fn.overloaded(
        function(){
          assert.strictEqual(this, obj);
        },

        function(id$Number){
          assert.strictEqual(this, obj);
        }
      );

      obj = new MyObj();
      obj.blah();
      obj.blah(1);
    });

    it('should work as a method with parameters', function() {
      var MyObj = function MyObj() {
        this.i = 0;
      };

      MyObj.prototype.blah = fn.overloaded(
        function(){
          this.i = 5;
        },

        function(id$Number){
          this.i = id$Number;
        }
      );

      var obj = new MyObj();
      obj.blah()
      assert.strictEqual(5, obj.i);
      obj.blah(6)
      assert.strictEqual(6, obj.i);
    });

    it('should work via bind when not a method', function() {
      var self = this;
      var testFunc = fn.overloaded(function(){
        assert.strictEqual(true, self === this);
      }).bind(self);
      testFunc();
    });
  });
});

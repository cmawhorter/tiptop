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

    it('should work on a method and be able to call itself with other signatures', function() {
      var MyObj = function MyObj() {}
        , db = null
        , DB_Save = function(row) {
            db = row;
          }
        , id = 5
        , name = 'weee'
        , dt = new Date();

      MyObj.prototype.save = fn.overloaded(
        function() {
          return this.save(id);
        },

        function(id$Number) {
          return this.save(id$Number, name);
        },

        function(id$Number, name$String) {
          return this.save(id$Number, name$String, dt);
        },

        function(id$Number, name$String, dt$Date) {
          return DB_Save({
              id: id$Number
            , name: name$String
            , dt: dt$Date
          });
        }
      );

      var obj = new MyObj();
      obj.save();
      assert.strictEqual(db.id, id);
      assert.strictEqual(db.name, name);
      assert.strictEqual(db.dt, dt);
    });
  });
});

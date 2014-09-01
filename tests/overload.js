'use strict'

var assert = require('assert')
  , fn = require('../lib/tiptop');

describe('TipTop', function() {
  describe('#overload()', function() {
    it('should take functions as function[] or <function, ...function>', function() {
      assert.doesNotThrow(function() {
        fn.overload(function(){}, function(blah$Number){});
        fn.overload([function(){}, function(blah$Number){}]);
      });

      assert.strictEqual(fn.overload(function(){}, function(blah$Number){}) instanceof Function, true);
      assert.strictEqual(fn.overload([function(){}, function(blah$Number){}]) instanceof Function, true);
    });

    it('should throw if less than 2 functions passed', function() {
      assert.throws(function() {
        fn.overload(function(){});
      }, fn.errors.ArgumentMismatchError);

      assert.throws(function() {
        fn.overload([function(){}]);
      }, fn.errors.ArgumentMismatchError);
    });

    it('should error if no function is passed', function() {
      assert.throws(function() {
        fn.overload();
      }, 'Expects at least one argument');
    });

    it('should error if null or undefined passed', function() {
      assert.throws(function() {
        fn.overload(null);
      }, 'Type passed was not a function');

      assert.throws(function() {
        fn.overload();
      }, 'Type passed was not a function');
    });

    it('should error if undefined passed', function() {
      assert.throws(function() {
        fn.overload();
      }, 'Type passed was not a function');
    });

    it('should throw SignatureNotFoundError if matching signature not found', function() {
      var wrapped = fn.overload([function(){},function(id$Number){}]);
      assert.throws(function() {
        wrapped('No signature match');
      }, fn.errors.SignatureNotFoundError);

      assert.doesNotThrow(function() {
        wrapped();
        wrapped(1);
      });
    });

    it('should work with an array of functions', function() {
      assert.strictEqual(fn.overload([function(){},function(id$Number){}]) instanceof Function, true);
    });

    it('should work with multiple functions as arguments', function() {
      assert.strictEqual(fn.overload(function(){},function(id$Number){}) instanceof Function, true);
    });

    it('should error if dupe signature detected', function() {
      assert.throws(function() {
        fn.overload(function(){},function(){});
      }, 'Duplicate signature detected for overload');
    });

    it('should work as a method', function() {
      var MyObj = function MyObj() {};

      MyObj.prototype.blah = fn.overload(
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

      MyObj.prototype.blah = fn.overload(
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

      MyObj.prototype.blah = fn.overload(
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
      var testFunc = fn.overload(function(){
        assert.strictEqual(true, self === this);
      }, function(id$Number){}).bind(self);
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

      MyObj.prototype.save = fn.overload(
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

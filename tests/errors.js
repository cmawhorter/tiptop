'use strict'

var assert = require('assert')
  , fn = require('../lib/tiptop');

describe('TipTop Errors', function() {
  describe('TiptopError', function() {
    it('should expose', function() {
      assert.strictEqual(fn.errors.TiptopError instanceof Function, true);
    });

    it('should be instanceof Error', function() {
      assert.strictEqual(new fn.errors.TiptopError() instanceof Error, true);
    });
  });

  describe('SignatureNotFoundError', function() {
    it('should expose', function() {
      assert.strictEqual(fn.errors.SignatureNotFoundError instanceof Function, true);
    });

    it('should be instanceof TiptopError', function() {
      assert.strictEqual(new fn.errors.SignatureNotFoundError() instanceof fn.errors.TiptopError, true);
    });

    it('should be instanceof Error', function() {
      assert.strictEqual(new fn.errors.SignatureNotFoundError() instanceof Error, true);
    });
  });

  describe('ArgumentMismatchError', function() {
    it('should expose', function() {
      assert.strictEqual(fn.errors.ArgumentMismatchError instanceof Function, true);
    });

    it('should be instanceof TiptopError', function() {
      assert.strictEqual(new fn.errors.ArgumentMismatchError() instanceof fn.errors.TiptopError, true);
    });

    it('should be instanceof Error', function() {
      assert.strictEqual(new fn.errors.ArgumentMismatchError() instanceof Error, true);
    });
  });

  describe('UnnamedObjectError', function() {
    it('should expose', function() {
      assert.strictEqual(fn.errors.UnnamedObjectError instanceof Function, true);
    });

    it('should be instanceof TiptopError', function() {
      assert.strictEqual(new fn.errors.UnnamedObjectError() instanceof fn.errors.TiptopError, true);
    });

    it('should be instanceof Error', function() {
      assert.strictEqual(new fn.errors.UnnamedObjectError() instanceof Error, true);
    });
  });
});

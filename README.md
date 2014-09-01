tiptop
======

A small library that bolts on to Javascript strong(er) typing and support for overloaded methods.  

Currently, only JS primitives and user objects are supported. (So... Number, not integer or float -- but MyCustomObject will work).  It hasn't been tested in the browser, but it _should_ work in modern browsers.  

## Why?

I like javascript.  I didn't create this because I think js is broken or that I think it should behave more like [insert language].  I created this to eliminate and streamline repetition in my own code.  

Should you wrap every function with this?  No.  I find it particularly useful when tacked on to my personal API lib in node or when writing reusable objects.

## Getting Started

To add typing to a function you pass it to TipTop#typed().  To specific types, add `$[type]` after the param name.  e.g. `function(id$Number)` instead of `function(id)`.

This works pretty well, but is a little annoying as you then have to refer to it by that long name in your function.

### Typing with a single function

```javascript
var fn = require('tiptop');

var MyFunc = fn.typed(function(id$Number) {
  console.log('The ID is: ', id$Number);
});

// OR

function MyObj() {
  this.id = null;
}

MyObj.prototype.save = fn.typed(function(id$Number) {
  this.id = id$Number;
});

var obj = new MyObj();
obj.save(1); // works
obj.save('1'); // error
```

### Overloading

Typing is alright... but overloading is the good stuff.

```javascript
var fn = require('tiptop');

function MyObj() {
  
}

MyObj.prototype.save = fn.overload(
  function() {
    console.log('one');
  },

  function(id$Number) {
    console.log('two');
  },

  function(id$Number, name$String) {
    console.log('three');
  },

  function(id$String, name$String) {
    console.log('four');
  },

  function(name$String) {
    console.log('five');
  }
);

var obj = new MyObj();
obj.save(); // one
obj.save(1); // two
obj.save(1, 'blah'); // three
obj.save('1', 'blah'); // four
obj.save('blah'); // five
```

## How it works

The TL;DR; is it works by parsing out your function parameters and wrapping the function with validation. 

## Tests

There are some tests but this has received limited testing.  I mainly wrote it as a POC.  For this to become widely useful/reliable, I think some refinement (and profiling) is needed.

That said, I'll probably be using it in production in my next project cuz I'm crazy like that.

## Caveats

* Null and undefined are not supported. 
* Optional parameters are not supported
* Definitely room for performance enhancements, though it should be pretty good for most scenarios as-is
* When using custom objects, you *must* give them a name. Example:

Good:
```javascript
var MyObj = function MyObj() { // notice the extra "function MyObj()"
  
};

// OR

function MyObj() {
  
}

var myFunc = fn.typed(function(obj$MyObj) { });
myFunc(new MyObj());
```

Bad:
```javascript
var MyObj = function() { // notice the lack of the superflous "function MyObj()"

};

// will error with a message about the object not having a name
var myFunc = fn.typed(function(obj$MyObj) { });
myFunc(new MyObj());
```

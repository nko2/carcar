if(typeof Array.prototype.add == "undefined") {
  Array.prototype.add = function(item) {
      this[this.length] = item;
      return this;
  }
}

if(typeof Array.prototype.last == "undefined") {
  Array.prototype.last = function() {
    return (this.length > 0) ? this[this.length - 1] : -1;
  };
}

if(typeof Array.prototype.first == "undefined") {
  Array.prototype.first = function() {
    return this[0];
  };
}

if(typeof Array.prototype.each == "undefined") {
  Array.prototype.each = function(fn) {
    for(var index = 0; index < this.length; index++) {
      fn(this[index], index);
    }
    return this;
  }
}

/*
 Implementação da Mozilla
 https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
 Navegadores defasados e antigos como o IE8/9 não possuem
 Production steps of ECMA-262, Edition 5, 15.4.4.19
 Reference: http://es5.github.com/#x15.4.4.19
 */
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {
    var T, A, k;
    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }
    if (thisArg) {
      T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while(k < len) {
      var kValue, mappedValue;
      if (k in O) {
        kValue = O[ k ];
        mappedValue = callback.call(T, kValue, k, O);
        A[ k ] = mappedValue;
      }
      k++;
    }
    return A;
  };      
}


/*
  Implementação da Mozilla
 https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
 
 */
if ( !Array.prototype.reduce ) {
  Array.prototype.reduce = function reduce(accumlator){
        var i, l = this.length, curr;
        
        if(typeof accumlator !== "function")
          throw new TypeError("First argument is not callable");

        if((l == 0 || l === null) && (arguments.length <= 1))
          throw new TypeError("Array length is 0 and no second argument");
        
        if(arguments.length <= 1){
          curr = this[0];
          i = 1;
        }
        else{
          curr = arguments[1];
        }
        
        for(i = i || 0 ; i < l ; ++i){
          if(i in this)
            curr = accumlator.call(undefined, curr, this[i], i, this);
        }
        
        return curr;
      };
  }

/* 
  Implementação da Mozilla
  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
  Navegadores defasados e antigos como o IE8/9 não possuem
*/
if(typeof Array.prototype.filter == "undefined") {
  Array.prototype.filter = function(fun)
    {
      "use strict";

      if (this === void 0 || this === null)
        throw new TypeError();

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== "function")
        throw new TypeError();

      var res = [];
      var thisp = arguments[1];
      for (var i = 0; i < len; i++)
      {
        if (i in t)
        {
          var val = t[i]; // in case fun mutates this
          if (fun.call(thisp, val, i, t))
            res.push(val);
        }
      }

      return res;
    };

}
const addTap = receiver =>
  Object.defineProperty(receiver.prototype, "tap", {
    value: function(intercept) {
      let val = this.valueOf ? this.valueOf() : this;
      intercept(val);
      return this;
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

const addLog = receiver =>
  Object.defineProperty(receiver.prototype, "log", {
    value: function(intercept) {
      //if (process.env.NODE_ENV == 'production') return this;
      let val = this.valueOf ? this.valueOf() : this;
      if (intercept) {
        console.log(`${intercept} `, val || "");
      } else {
        console.log(val);
      }
      return this;
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

const addDebug = receiver =>
  Object.defineProperty(receiver.prototype, "debug", {
    value: function(intercept) {
      let val = this.valueOf ? this.valueOf() : this;
      val.tap(x => {
        debugger;
      });
      return this;
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

const addChain = receiver =>
  Object.defineProperty(receiver.prototype, "chain", {
    value: function(intercept) {
      let val = this.valueOf ? this.valueOf() : this;
      return intercept(val);
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

[Object, String, Number, Boolean].map(receiver => {
  addTap(receiver);
  addLog(receiver);
  addDebug(receiver);
  addChain(receiver);
});

// Deferred
// thanks http://stackoverflow.com/questions/18096715/implement-deferred-object-without-using-jquery
function Deferred() {
  this._done = [];
  this._fail = [];
}
Deferred.prototype = {
  execute(list, args) {
    let i = list.length;
    args = Array.prototype.slice.call(args);
    while (i--) {
      list[i].apply(null, args);
    }
  },
  resolve() {
    this.execute(this._done, arguments);
  },
  reject() {
    this.execute(this._fail, arguments);
  },
  done(callback) {
    this._done.push(callback);
  },
  fail(callback) {
    this._fail.push(callback);
  },
};

export default Deferred;
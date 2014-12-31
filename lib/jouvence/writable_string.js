(function() {
    "use strict";

    var Writable = require('stream').Writable;
    var util = require('util');
    util.inherits(WritableString, Writable);

    var Stream = require('stream');

    function WritableString(opt) {
        this._data = "";
        Writable.call(this, opt);
    }

    WritableString.prototype._write = function(chunk, encoding, done) {
        this._data = this._data + chunk.toString();
        done();
    };

    WritableString.prototype.toString = function() {
        return this._data;
    };

    WritableString.prototype.clearString = function() {
        this._data = "";
    };

    module.exports = WritableString;
}());
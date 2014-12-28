(function() {
    "use strict";

    var Writable = require('stream').Writable;
    var util = require('util');
    util.inherits(WritableString, Writable);

    var Stream = require('stream');

    function WritableString(opt) {
        Writable.call(this, opt);
    }

    WritableString.prototype._write = function(chunk, encoding, done) {
        console.log(chunk.toString());
        done();
    };

    module.exports = WritableString;
}());
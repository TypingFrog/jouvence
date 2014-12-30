(function() {
    "use strict";

    var Readable = require('stream').Readable;
    var util = require('util');
    util.inherits(ReadableString, Readable);

    var Stream = require('stream');

    function ReadableString(text, opt) {
        Readable.call(this, opt);
        this._text = text;
        this._complete = false;
    }

    ReadableString.prototype._read = function() {
        if (this._complete) {
            this.push(null);
        } else {
            if (this._text.length === 0) {
                this.push(null);
            } else {
                var buf = new Buffer(this._text, 'utf8');
                this.push(buf);
            }
            this._complete = true;
        }
    };

    module.exports = ReadableString;
}());
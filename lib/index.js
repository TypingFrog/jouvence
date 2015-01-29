'use strict';

var Jouvence = require('./jouvence/jouvence');
var ReadableString = require('./jouvence/readable_string');
var WritableString = require('./jouvence/writable_string');

module.exports = {
    jouvence: new Jouvence(),
    ReadableString: ReadableString,
    WritableString: WritableString,
    version: "0.4"
}
//module.exports.Jouvence = Jouvence;

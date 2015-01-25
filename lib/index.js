'use strict';

var Jouvence = require('./jouvence/jouvence');
var toHTML = require('./converter/toHTML');
var toJSON = require('./converter/toJSON');
var ReadableString = require('./jouvence/readable_string');
var WritableString = require('./jouvence/writable_string');

module.exports = {
    jouvence: new Jouvence(),
    convert: toHTML, // deprecated
    toHTML: toHTML,
    toJSON: toJSON,
    ReadableString: ReadableString,
    WritableString: WritableString,
    version: "0.4"
}
//module.exports.Jouvence = Jouvence;

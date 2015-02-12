'use strict';

var Jouvence = require('./jouvence/jouvence');
var ReadableString = require('./jouvence/readable_string');
var WritableString = require('./jouvence/writable_string');
var jouvenceNotification = require('./jouvence/jouvence_notification');
var parseEmphasis = require('./jouvence/parse.emphasis');

module.exports = {
    jouvence: new Jouvence(),
    parseEmphasis: parseEmphasis,
    jouvenceNotification: jouvenceNotification,
    ReadableString: ReadableString,
    WritableString: WritableString,
    version: "0.6.0"
}

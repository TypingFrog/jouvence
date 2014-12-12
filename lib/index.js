'use strict';

var Jouvence = require('./jouvence/jouvence');
var convert = require('./converter/converter');

module.exports = {
    jouvence: new Jouvence(),
    convert: convert
    
}
//module.exports.Jouvence = Jouvence;

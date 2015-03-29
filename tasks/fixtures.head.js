(function() {
    "use strict";
    var fs = require('fs');
    var path = require('path');
    
    var Readable = require('stream').Readable;
    var util = require('util');
    util.inherits(ReadableString, Readable);

    var Stream = require('stream')

    var fixtures = 

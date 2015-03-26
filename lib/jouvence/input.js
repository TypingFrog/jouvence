(function() {
    "use strict";

    var ReadableString = require('./readable_string');
    var fs = require('fs');

    // this class provides the input the jouvence parser can read from
    // it creates a stream.Readable instance from different source
    var Input = (function() {
        function Input() {

        }
        Input.prototype = {
            fromString: function(text, options) {
                return new ReadableString(text, options);
            },
            
            fromFile: function(path, options) {
                return fs.createReadStream(path, options);
            },
            
            fromReadStream:function(rs) {
                return rs;
            }
        };

        return Input;
    })();

    module.exports = Input;
})();
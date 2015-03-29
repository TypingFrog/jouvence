(function() {
    "use strict";

    var Jouvence = require('./jouvence/jouvence');
    var Input = require('./jouvence/input');
    var jouvenceNotification = require('./jouvence/jouvence_notification');
    var EmphasisParser = require('./jouvence/parse.emphasis');

    module.exports = {
        parser: function() {
            return new Jouvence();
        },
        
        input: function() {
            return new Input();
        },
        
        dummyNotification: function() {
            return jouvenceNotification;
        },
        
        parseEmphasis: function() {
            return new EmphasisParser();
        },
        
        version: "1.0.1"
    };

})();
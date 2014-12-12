(function() {
    "use strict";
    
    // this module is about converting a fountain document into something else
    
    var jouvence = require("..").jouvence;
    var Promise = require('es6-promise').Promise;
    
    function convert(input, output, configuration) {
        var notif = convertNotification(output, configuration);
         return new Promise(function(resolve, reject) {
            jouvence.read(input, notif).then(function() {
                resolve();
            }, function(error) {
                reject(error);
            });
             
         });
    }
    
    function convertNotification(output, configuration) {
        var notif = {
            startOfDocument: function() {
                console.log("startOfDocument");
            },
            titlePage: function(metaInformation) {
                console.log("titlePage:", metaInformation);
            },
            sceneHeading: function(sceneHeading) {
                console.log("sceneHeading:<" + sceneHeading + ">");
            },
            action: function(action, blocks, options) {
                console.log("action:<" + action + "> options:", options);
            },
            pageBreak: function() {
                console.log("pageBreak");
            },
            character: function(character, option) {
                if (option.extension) {
                    console.log("character:<" + character + "> option:", option);
                }
                else {
                    console.log("character:<" + character + ">");
                }
            },
            parenthetical: function(parenthetical) {
                console.log("parenthetical:<" + parenthetical + ">");
            },
            dialogue: function(dialogue) {
                console.log("dialogue:<" + dialogue + ">");
            },
            transition: function(transition) {
                console.log("transition:<" + transition + ">");
            },
            section: function(section, level) {
                console.log("section:" + level + "<" + section + ">");
            },
            synopsis: function(synopsis) {
                console.log("synopsis:<" + synopsis + ">");
            },
            endOfDocument: function() {
                console.log("endOfDocument");
            },

        };
        return notif;
    };

}());
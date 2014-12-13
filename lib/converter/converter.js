(function() {
    "use strict";

    // this module is about converting a fountain document into something else

    var Jouvence = require("../jouvence/jouvence");
    var Promise = require('es6-promise').Promise;

    function convert(input, output, configuration) {
        var jouvence = new Jouvence();
        var notif = convertNotification(output, configuration);
        return new Promise(function(resolve, reject) {
            jouvence.read(input, notif).then(function() {
                output.end(function(){
                    resolve();
                });
            }, function(error) {
                reject(error);
            });

        });
    }

    function convertNotification(output, configuration) {
        function optionsToCss(options) {
            var css = "";
            if (! options) {
                return css;
            }
            for(var key in options) {
                var opts = configuration.options[key];
                if (! opts) {
                    throw(new Error("No style for option:" + key));
                }
                var value = opts[options[key]];
                if (! value) {
                    throw(new Error("No style in option:" + key +", for:" + options[key]));
                }
                css = css + " " + value;
            }
            return css;
        }
        
        function out(type, text, options) {
            var css = configuration.styles[type];
            if (! css) {
                throw(new Error("No style for element:" + type));
            }
            output.write("<div class=\""+css+optionsToCss(options)+"\">");
            
            if (text) {
                output.write(text);
                output.write("</div>");
            }
            output.write("\n");
        }
        var notif = {
            startOfDocument: function() {
                out("document");
            },
            titlePage: function(metaInformation) {
                console.log("titlePage:", metaInformation);
            },
            sceneHeading: function(sceneHeading) {
                out("heading", sceneHeading);
            },
            action: function(action, blocks, options) {
                out("action", action, options);
            },
            pageBreak: function() {
                console.log("pageBreak");
            },
            character: function(character, option) {
                if (option.extension) {
                    out("character", character +" ("+option.extension+")");
                }
                else {
                    out("character", character);
                }
            },
            parenthetical: function(parenthetical) {
                out("parenthetical", "("+parenthetical+")");
            },
            dialogue: function(dialogue) {
                out("dialogue", dialogue);
            },
            transition: function(transition) {
                out("transition", transition);
            },
            section: function(section, level) {
                console.log("section:" + level + "<" + section + ">");
            },
            synopsis: function(synopsis) {
                console.log("synopsis:<" + synopsis + ">");
            },
            endOfDocument: function() {
                output.write("</div>\n");
            },

        };
        return notif;
    };

    module.exports = convert;
}());
(function() {
    "use strict";

    // this module is about converting a fountain document into something else

    var Jouvence = require('../jouvence/jouvence');
    var Promise = require('es6-promise').Promise;
    var WritableString = require('../jouvence/writable_string');


    // if defined, linenoForScene is used to limit the generation
    // to the scene containing the corrsponding line number 
    function convert(input, output, configuration, linenoForScene) {
        // set linenoForScene to -1 if undefined
        linenoForScene = typeof linenoForScene !== 'undefined' ? linenoForScene : -1;
        var convertOutput;

        if (linenoForScene >= 0) {
            convertOutput = new WritableString();
        } else {
            convertOutput = output;
        }

        var jouvence = new Jouvence();
        var notif = convertNotification(convertOutput, configuration, linenoForScene);
        return new Promise(function(resolve, reject) {
            jouvence.read(input, notif).then(function() {
                if (linenoForScene >= 0) {
                    convertOutput.end(function() {
                        output.write(convertOutput.toString());
                        output.end(function() {
                            resolve();
                        });
                    });
                } else {
                    output.end(function() {
                        resolve();
                    });
                }
            }, function(error) {
                reject(error);
            });

        });
    }

    function convertNotification(output, configuration, linenoForScene) {
        var doIgnore = false;

        function optionsToCss(options) {
            var css = "";
            if (!options) {
                return css;
            }
            for (var key in options) {
                var opts = configuration.options[key];
                if (!opts) {
                    throw (new Error("No style for option:" + key));
                }
                var value = opts[options[key]];
                if (!value) {
                    throw (new Error("No style in option:" + key + ", for:" + options[key]));
                }
                css = css + " " + value;
            }
            return css;
        }

        function out(type, text, options) {
            if (! doIgnore) {
                doOut(type, text, options);
            }
        }

        function doOut(type, text, options) {
            var css = configuration.styles[type];
            if (!css) {
                throw (new Error("No style for element:" + type));
            }
            output.write("<div class=\"" + css + optionsToCss(options) + "\">");

            if (text) {
                output.write(text);
                output.write("</div>");
            }
            output.write("\n");
        }


        var notif = {
            startOfDocument: function() {
                doOut("document");
            },
            titlePage: function(metaInformation) {
                console.log("titlePage:", metaInformation);
            },
            sceneHeading: function(sceneHeading, extra) {
                if (linenoForScene >= 0) {
                    if (extra.lineno <= linenoForScene) {
                        output.clearString();
                        // as we cleared the string, we need to reoutput
                        // what is needed to start the string with
                        notif.startOfDocument();
                    } else if (extra.lineno > linenoForScene) {
                        doIgnore = true;
                    }
                }
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
                    out("character", character + " (" + option.extension + ")");
                } else {
                    out("character", character);
                }
            },
            parenthetical: function(parenthetical) {
                out("parenthetical", "(" + parenthetical + ")");
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
(function() {
    "use strict";

    // this module is about converting a fountain document into JSON

    var Jouvence = require('../jouvence/jouvence');
    var Promise = require('es6-promise').Promise;


    // if defined, linenoForScene is used to limit the generation
    // to the scene containing the corresponding line number 
    function toJSON(input, linenoForScene, withNavigation) {
        // set linenoForScene to -1 if undefined
        linenoForScene = typeof linenoForScene !== 'undefined' ? linenoForScene : -1;
        // boolean to define if we want to grab the navigation information during parsing
        withNavigation = typeof withNavigation !== 'undefined' ? withNavigation : false;

        var navigation = withNavigation ? [] : undefined;
        var json = {
            content: []
        }

        var jouvence = new Jouvence();
        var notif = convertNotification(json, linenoForScene, navigation);
        return new Promise(function(resolve, reject) {
            jouvence.read(input, notif).then(function() {
                resolve({
                    json: json,
                    navigation: navigation
                });
            }, function(error) {
                reject(error);
            });

        });
    }

    function convertNotification(json, linenoForScene, navigation) {
        var doIgnore = false;

        function out(type, text, options) {
            if (!doIgnore) {
                doOut(type, text, options);
            }
        }

        function doOut(type, text, options) {
            json.content.push({
                type: type,
                text: text,
                options: options
            });
        }


        var notif = {
            startOfDocument: function() {},
            titlePage: function(metaInformation) {
                json.titlePage = metaInformation;
            },
            sceneHeading: function(sceneHeading, extra) {
                if (navigation) {
                    navigation.push({
                        type: "scene",
                        lineno: extra.lineno,
                        text: sceneHeading
                    });
                }
                if (linenoForScene >= 0) {
                    if (extra.lineno <= linenoForScene) {
                        // the content already stored was not in the scene we wanted
                        json.content.length = 0;
                    }
                    else if (extra.lineno > linenoForScene) {
                        // we are passed the scene we want to keep
                        doIgnore = true;
                    }
                }
                out("heading", sceneHeading);
            },
            action: function(action, blocks, options) {
                out("action", action, options);
            },
            pageBreak: function() {},
            character: function(character, option) {
                if (option.extension) {
                    out("character", character + " (" + option.extension + ")");
                }
                else {
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
            section: function(section, level, extra) {
                if (navigation) {
                    navigation.push({
                        type: "section_" + level,
                        lineno: extra.lineno,
                        text: section
                    });
                }
            },
            synopsis: function(synopsis) {},
            endOfDocument: function() {},

        };
        return notif;
    };

    module.exports = toJSON;
}());
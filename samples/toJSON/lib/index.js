(function() {
    "use strict";

    var jouvence = require('jouvence');
    var util = require('util');
    
    
    var args = process.argv.slice(2);

    if (args.length !== 1) {
        console.log("Usage: node lib/index.js <fountain file>");
        process.exit(1);
    }

    var fountainFile = args[0];

    toJSON(fountainFile, function(err, result) {
        if (err) {
            console.log("ERROR:" + err);
            process.exit(1);
        }

        console.log(util.inspect(result, { depth: null, colors: true }));
    });


    function toJSON(fountainFile, done) {
        var result = {};
        var input = jouvence.input().fromFile(fountainFile);
        var parser = jouvence.parser();

        parser.parse(input, jouvenceNotification(result))
            .then(function() {
                return done(null, result);
            })
            .catch(function(err) {
                return done(err, result);
            });

    }

    function jouvenceNotification(json) {
        var currentPart;
        return {
            startOfDocument: function() {
                json.parts = [];
                currentPart = {
                    type: "front",
                    elements: []
                }
                json.parts.push(currentPart);
            },
            titlePage: function(metaInformation) {
                json.titlePage = metaInformation;
            },
            sceneHeading: function(sceneHeading, extra) {
                currentPart = {
                    type: "scene",
                    scene: sceneHeading,
                    elements: []  
                };
                if (extra) {
                    currentPart.extra = extra;
                }
                json.parts.push(currentPart);
            },
            action: function(action, blocks, options) {
                var element = {
                    type: "action",
                    action: action
                };
                if (options) {
                    element.options = options;   
                }
                currentPart.elements.push(element);
            },
            pageBreak: function() {
                // ignored 
            },
            dualDialogueStart: function() {
                console.log("dualDialogueStart");
            },
            dualDialogueEnd: function() {
                console.log("dualDialogueEnd");
            },
            dialogueStart: function() {
                console.log("dialogueStart");
            },
            dialogueEnd: function() {
                console.log("dialogueEnd");
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
            section: function(section, level, extra) {
                console.log("section:" + level + "<" + section + ">", extra);
            },
            synopsis: function(synopsis) {
                console.log("synopsis:<" + synopsis + ">");
            },
            block: function(blocks) {
                console.log("block:<" + blocks + ">");
            },
            endOfDocument: function() {
                console.log("endOfDocument");
            }
        };
    }

    module.exports = toJSON;

})();
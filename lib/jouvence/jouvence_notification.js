(function() {
    "use strict";
    
    // this is a default implementation of a jouvence notification
    // you can copy and paste this code to use as a starting point for
    // an application specific implementation

    var jouvenceNotification = {
        startOfDocument: function() {
            console.log("startOfDocument");
        },
        titlePage: function(metaInformation) {
            console.log("titlePage:", metaInformation);
        },
        sceneHeading: function(sceneHeading, extra) {
            console.log("sceneHeading:<" + sceneHeading + ">", extra);
        },
        action: function(action, blocks, options) {
            console.log("action:<" + action + "> options:", options);
        },
        pageBreak: function() {
            console.log("pageBreak");
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
        endOfDocument: function() {
            console.log("endOfDocument");
        }
    };
    
    module.exports = jouvenceNotification;

})();
(function() {
    "use strict";

    var Promise = require('es6-promise').Promise;
    var parseBlock = require("./parse.block").parseBlock;
    var parseEmphasis = require('./parse.emphasis');
    
    // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    var whiteSpaces = " \f\n\r\t\v\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000";
    
    var reUnicodeLetterRanges = new RegExp("[A-Za-z]"); // TODO: add other UTF-8 characters

    var SCENE_HEADING_PREFIXES = ["INT", "EXT", "EST", "INT./EXT", "INT/EXT", "I/E"];

    // the specification of the fountain format can be found at:
    // http://fountain.io/syntax
    //
    // TODO:
    // - externalize words which can start a heading
    // - blank lines between actions are actions?
    // - handle other ending than "TO:" for transition

    function Jouvence() {}

    Jouvence.prototype.init = function(options) {
        options = options || {};
    };

    // as the fountain syntax requires to know wether the
    // next line is empty or not, we need to keep
    // a buffer of 2 lines. This allows us to pass as a parameter
    // to the actual processing whether the next (and also the previous) line was empty
    function processLine(context, line) {
        // we update the line number
        context.lineno++;

        // we preprocess the line in case it contains 
        // notes or comments
        var state = parseBlock(context.blockContext, line, context.lineno);
        if (state === 0) {
            // TODO: if we want to use the comments and/or notes,
            // we need to extract them from the state here
            line = context.blockContext.line;
        }
        else {
            // the line contains a pending comment or note
            // we can't parse it for now!
            return;
        }
        
        // we need to asociate the block context to the line
        // so that we can later process the actual content
        // of the line (emphasis + blocks)
        var lineInfo = {
            line: line,
            info: context.blockContext
        }

        // if slot 0 is occupied, then we fill slot 1
        // if not we initialize slot 0
        if (typeof context.line0 !== "undefined") {
            context.line1 = lineInfo;
        }
        else {
            context.line0 = lineInfo;
            context.line1 = undefined;
        }

        // we need slot 1 to be filled to perform the actual processing
        if (typeof context.line1 !== "undefined") {
            context.nextLineBlank = (context.line1.line.trim().length === 0);
            var lineParsed = false;


            while (!lineParsed) {
                lineParsed = parseLine(context, context.line0);
            }
            // we memorize the state of the current line
            context.previousLineBlank = (context.line0.line.trim().length === 0);
            context.line0 = context.line1;
            context.line1 = undefined;
        }

        // we reset the preprocess state
        context.blockContext = {
            state: 0
        };
    }
    
    function trimString(str) {
        var i = 0;
        var c;
        var result = {
            trim: "",
            start: 0,
            end: 0
        }
        
        for (i = 0; i < str.length; i++) {
            c = str.charAt(i);
            if (whiteSpaces.indexOf(c) < 0) {
                result.start = i;
                break;
            }
        }
        
        for (i = str.length - 1; i >=0 ; i--) {
            c = str.charAt(i);
            if (whiteSpaces.indexOf(c) < 0) {
                result.end = i;
                break;
            }
        }
        result.trim = str.substring(result.start, result.end + 1);
        
        return result;
    }

    // the parse method should return false
    // to indicate that the line should be parsed
    // again
    function parseLine(context, lineInfo) {
        var line = lineInfo.line;
        var trimInfo = trimString(line);
        var trim = trimInfo.trim;
        var currentLineBlank = (trim.length === 0);
        var colonPosition;

        if (context.state === 0) {
            // beginning of the file... we can have a title page
            if (currentLineBlank) {
                return true;
            }
            colonPosition = line.indexOf(':');
            if (colonPosition < 0) {
                // no ':' in the first non empty line
                // that means that we don't have any Title page
                // we update the state and reprocess the line
                context.state = 10;
                return false;
            }
            else {
                // we do have a property definition
                // meaning we have a Title page
                context.state = 2;
                context.metaInformation = {};

                extractKeyValue(context, line, colonPosition);
            }
        }
        else if (context.state == 2) {
            // we are inside a title page
            if ((line.charAt(0) === '\t') || (line.substring(0, 3) === "   ")) {
                // a value is there
                context.metaInformation[context.currentKey].push(line.trim());
            }
            else {
                colonPosition = line.indexOf(':');
                if (colonPosition > 0) {
                    extractKeyValue(context, line, colonPosition);
                }
                else {
                    // no value, no key ... we are in the content of the script
                    // we public the content of the meta information,
                    // update the state and reprocess the line
                    context.notif.titlePage(context.metaInformation);
                    context.state = 10;
                    return false;
                }
            }
        }
        else if (context.state == 10) {
            if (!currentLineBlank) {
                // we catch the "centered action text"
                var result = extractTextBetweenDelims(trim, 0, "><");
                if (result && (result.before.trim().length === 0) && (result.after.trim().length === 0)) {
                    context.notif.action(result.between.trim(), {
                        aligment: 'centered'
                    });
                }
                else if ((trim.charAt(0) === '=') && (trim.length >= 3) && (trim.charAt(1) === '=') && (trim.charAt(2) === '=')) {
                    context.notif.pageBreak();
                }
                else if ((trim.charAt(0) === '#') && processSection(context, trim)) {
                    // we had a section
                }
                else if ((trim.charAt(0) === '=') && processSynopsis(context, trim)) {
                    // we had a synopsis
                }
                else if (((context.previousLineBlank && context.nextLineBlank) || (line.charAt(0) === '>')) && processTransition(context, line)) {
                    // we had a transition
                }
                else if (context.previousLineBlank && processSceneHeading(context, trim)) {
                    // we had a scene heading
                }
                else if (context.previousLineBlank && !context.nextLineBlank && processCharacter(context, trim)) {
                    // we had a character
                }
                else if (!context.previousLineBlank && ((context.lastElementNature === "character") ||
                        (context.lastElementNature === "dialogue") || (context.lastElementNature === "parenthetical"))) {
                    processDialogElement(context, trim);
                }
                else {
                    // the fallback mode is: action
                    context.notif.action(trim);
                }
            }
        }
        else {
            throw new Error("Invalid state:" + context.state);
        }

        // we consider the line as being parsed
        return true;
    }



    function extractKeyValue(context, line, colonPosition) {
        var key = line.substring(0, colonPosition).trim();
        // edge case: what if the key is of length 0?
        context.currentKey = key;
        context.metaInformation[context.currentKey] = [];

        if (colonPosition < line.length) {
            var value = line.substring(colonPosition + 1).trim();
            if (value.length > 0) {
                context.metaInformation[context.currentKey].push(value);
            }
        }
    }

    // this method extracts the text between 2 delimiters
    // and returns the textBefore, the textBetween, and the textAfter
    function extractTextBetweenDelims(line, startPosition, delims) {
        var state = 0;
        var result = {
            before: "",
            between: "",
            after: ""
        };
        for (var i = startPosition; i < line.length; i++) {
            var c = line.charAt(i);
            if ((state === 0) && (c === delims[0])) {
                result.before = line.substring(startPosition, i);
                state = 1;
            }
            else if ((state === 1) && (c === delims[1])) {
                result.after = line.substring(i + 1);
                state = 3;
                break;
            }
            else if (state === 1) {
                result.between = result.between + c;
            }
        }

        if (state === 3) {
            return result;
        }
        else {
            return false;
        }
    }

    function processSceneHeading(context, line) {
        var sceneHeading = false;
        if ((line.charAt(0) === '.') && (line.length > 1) && (line.charAt(1) !== '.')) {
            // power user mode
            sceneHeading = line.substring(1).trim();
        }
        else {
            var firstWord = getWord(line, 0, " .");

            //console.log("FirstWord:", firstWord);
            if (SCENE_HEADING_PREFIXES.indexOf(firstWord.toUpperCase()) >= 0) {
                sceneHeading = line.trim();
            }
        }

        if (sceneHeading) {
            // TODO: extract scene number
            context.notif.sceneHeading(sceneHeading);
            return true;
        }
        else {
            return false;
        }
    }

    function processCharacter(context, line) {
        var character = false;
        if (line.charAt(0) === '@') {
            // power user mode
            character = line.substring(1).trim();
        }
        else {
            var name = getWord(line, 0, "(").trim();

            if (name.length > 0) {
                if (name.toUpperCase() === name) {
                    // name needs to be all upper-case
                    // and must contain at least one letter
                    for (var i = 0; i < name.length; i++) {
                        if (isCharacter(name.charAt(i))) {
                            character = line;
                            break;
                        }
                    }
                }
            }
        }

        if (character) {
            // TODO: extract character extensions
            var extension;
            var result = extractTextBetweenDelims(character, 0, "()");
            if (result) {
                character = result.before.trim();
                extension = result.between.trim();
            }
            context.notif.character(character, {
                extension: extension
            });
            return true;
        }
        else {
            return false;
        }

    }

    function processDialogElement(context, line) {
        if (line.charAt(0) === '(') {
            var cp = line.indexOf(')');
            if (cp > 0) {
                context.notif.parenthetical(line.substring(1, cp));
                // we allow to have dialogue after the closing parenthesis
                var remaining = line.substring(cp + 1).trim();
                if (remaining.length > 0) {
                    context.notif.dialogue(remaining);
                }
            }
            else {
                context.notif.parenthetical(line.substring(1));
            }
        }
        else {
            context.notif.dialogue(line);
        }
    }

    function processTransition(context, line) {
        var transition = false;

        if (line.charAt(0) == '>') {
            transition = line.substring(1).trim();
        }
        else if (line.substring(line.length - 3) === "TO:") {
            if (line.toUpperCase() === line) {
                // we are all upper case
                transition = line.trim();
            }
        }
        if (transition) {
            context.notif.transition(transition);
            return true;
        }
        else {
            return false;
        }
    }

    function processSection(context, line) {
        var level = 0;
        var i = 0;

        for (i = 0; i < line.length; i++) {
            var c = line.charAt(i);
            if (c == '#') {
                level++;
            }
            else if ((c != ' ') && (c != '\t')) {
                break;
            }
        }
        var section = line.substring(i).trim();
        context.notif.section(section, level);
        return true;
    }

    function processSynopsis(context, line) {
        var synopsis = line.substring(1).trim();
        context.notif.synopsis(synopsis);
        return true;
    }

    function getWord(line, from, delim) {
        for (var i = from; i < line.length; i++) {
            var c = line.charAt(i);
            if (delim.indexOf(c) >= 0) {
                return line.substring(from, i);
            }
        }
        return line.substring(from);
    }

    function isCharacter(c) {
        return reUnicodeLetterRanges.test(c);
    }

    /*
     * input is a readable stream
     * notif is the interface receiving the notification during parsing
     */
    Jouvence.prototype.read = function(input, notif) {
        var countData = 0;
        var eolMatcher = /\r?\n/;
        var pendingInput = '';
        var self = this;

        // initiailize instance variables
        var context = {
            state: 0,
            blockContext: {
                state: 0
            },
            metaInformation: undefined,
            lastElementNature: undefined,
            currentKey: undefined,
            previousLineBlank: true,
            nextLineBlank: undefined,
            notif: undefined,
            line0: undefined, // slot #0: current line
            line1: undefined, // slot #1: next line
            lineno: 0
        };
        context.notif = doNotification(context, notif, false);

        return new Promise(function(resolve, reject) {

            // we want to get the data as utf8 strings
            input.setEncoding('utf8');

            // Readable streams emit 'data' events once a listener is added
            input.on('data', function(chunk) {
                if (countData === 0) {
                    context.notif.startOfDocument();
                }
                countData++;

                var pieces = (pendingInput + chunk).split(eolMatcher);
                pendingInput = pieces.pop();

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];
                    processLine(context, piece);
                }
            });

            input.on('end', function() {
                // first we handle 'flushing' conditions

                // if no content was read (empty file)
                // we still need to notify that we started the reading
                if (countData === 0) {
                    context.notif.startOfDocument();
                }

                if (pendingInput.length > 0) {
                    processLine(context, pendingInput);
                }
                // we flush the last line by passing an empty line
                processLine(context, "");

                if (context.state === 2) {
                    // only the title page was provided
                    context.notif.titlePage(context.metaInformation);
                }
                context.notif.endOfDocument();
                resolve();
            });
        });
    };

    function doNotification(context, notif, debug) {
        return {
            startOfDocument: function() {
                if (debug) {
                    console.log("startOfDocument");
                }
                notif.startOfDocument();
                context.lastElementNature = "startOfDocument";
            },
            titlePage: function(metaInformation) {
                if (debug) {
                    console.log("titlePage:", metaInformation);
                }
                notif.titlePage(metaInformation);
                context.lastElementNature = "titlePage";
            },
            sceneHeading: function(sceneHeading) {
                if (debug) {
                    console.log("sceneHeading:<" + sceneHeading + ">");
                }
                notif.sceneHeading(sceneHeading);
                context.lastElementNature = "sceneHeading";
            },
            action: function(action, options) {
                if (debug) {
                    console.log("action:<" + action + "> options:", options);
                }
                notif.action(action, options);
                context.lastElementNature = "action";
            },
            pageBreak: function() {
                if (debug) {
                    console.log("pageBreak");
                }
                notif.pageBreak();
                context.lastElementNature = "pageBreak";
            },
            character: function(character, option) {
                if (debug) {
                    console.log("character:<" + character + "> option:", option);
                }
                notif.character(character, option);
                context.lastElementNature = "character";
            },
            parenthetical: function(parenthetical) {
                if (debug) {
                    console.log("parenthetical:<" + parenthetical + ">");
                }
                notif.parenthetical(parenthetical);
                context.lastElementNature = "parenthetical";
            },
            dialogue: function(dialogue) {
                if (debug) {
                    console.log("dialogue:<" + dialogue + ">");
                }
                notif.dialogue(dialogue);
                context.lastElementNature = "dialogue";
            },
            transition: function(transition) {
                if (debug) {
                    console.log("transition:<" + transition + ">");
                }
                notif.transition(transition);
                context.lastElementNature = "transition";
            },
            section: function(section, level) {
                if (debug) {
                    console.log("section:" + level + "<" + section + ">");
                }
                notif.section(section, level);
                context.lastElementNature = "section";
            },
            synopsis: function(synopsis) {
                if (debug) {
                    console.log("synopsis:<" + synopsis + ">");
                }
                notif.synopsis(synopsis);
                context.lastElementNature = "synopsis";
            },
            endOfDocument: function() {
                if (debug) {
                    console.log("endOfDocument");
                }
                notif.endOfDocument();
                context.lastElementNature = "endOfDocument";
            }
        };
    };


    Jouvence.prototype.dummyNotification = function() {
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
            action: function(action, options) {
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

    module.exports = Jouvence;

}());
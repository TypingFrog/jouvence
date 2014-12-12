(function() {
    "use strict";

    var Promise = require('es6-promise').Promise;
    var reUnicodeLetterRanges = new RegExp("[A-Za-z]"); // TODO: add other UTF-8 characters


    var SCENE_HEADING_PREFIXES = ["INT", "EXT", "EST", "INT./EXT", "INT/EXT", "I/E", "", "", "", "", ""];

    // the specification of the fountain format can be found at:
    // http://fountain.io/syntax
    //
    // TODO:
    // - externalize words which can start a heading
    // - blank lines between actions are actions?
    // - handle other ending than "TO:" for transition

    function Jouvence() {}

    Jouvence.prototype.testMode = function() {
        // we add to the instance the private method we want to test
        // in unit tests
        this.__preprocessLine = preprocessLine;
        this.__parseEmphasis = parseEmphasis;
        return this;
    }

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
        var state = preprocessLine(context.preprocessContext, line, context.lineno);
        if (state === 0) {
            // TODO: if we want to use the comments and/or notes,
            // we need to extract them from the state here
            line = context.preprocessContext.line;
        }
        else {
            // the line contains a pending comment or note
            // we can't parse it for now!
            return;
        }

        // if slot 0 is occupied, then we fill slot 1
        // if not we initialize slot 0
        if (typeof context.line0 !== "undefined") {
            context.line1 = line;
        }
        else {
            context.line0 = line;
            context.line1 = undefined;
        }

        // we need slot 1 to be filled to perform the actual processing
        if (typeof context.line1 !== "undefined") {
            context.nextLineBlank = (context.line1.trim().length === 0);
            var lineParsed = false;


            while (!lineParsed) {
                lineParsed = parseLine(context, context.line0);
            }
            // we memorize the state of the current line
            context.previousLineBlank = (context.line0.trim().length === 0);
            context.line0 = context.line1;
            context.line1 = undefined;
        }

        // we reset the preprocess state
        context.preprocessContext = {
            state: 0
        };
    }

    // the parse method should return false
    // to indicate that the line should be parsed
    // again
    function parseLine(context, line) {
        var trim = line.trim();
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
                    // se had a section
                }
                else if ((trim.charAt(0) === '=') && processSynopsis(context, trim)) {
                    // se had a section
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


    // this method is in charge of extractiong the [[ notes ]] and
    // /* comments */ from a line, or set of lines
    //
    // multiple possible results after that processing
    // - line does not contain any notes or comments
    // - line contains inlined closed n/c and can be further processed
    // - line contains a starting n/c which is not closed (the line can't be processed up until the block is closed)
    // - line contains only a n/c which can be closed or not
    // - line is part of an ongoing n/c
    // - line is ending a n/c and contains an extra piece of content
    //
    // This method will extract blocks, which are identified by:
    // - nature: note or comment
    // - starting position (line,column)
    // - ending position (line,column)
    // - content: array of strings
    // - content before (string)
    //
    // this method relies on the preprocessContext object inside the context object
    // to maintain its state.
    // parseLineState is
    // 0 : if there is no pending blocks being parsed
    // 10 : we are inside a comment
    // 20 : we are inside a note
    //
    // Takes a context as an input parameter and updates it
    // return the state of the processing - if 0 that means that the 
    // processing is complete
    // The context is :
    // {
    //    state : 0,10 or 20
    //    line : the resulting line after processing - this will be set by the method once the state is 0
    //    blocks [] : list of blocks encountered during processing (see above for structure of a block 
    //    nestedDepth : for internal use -- level of nested elements of a given type
    // }

    function preprocessLine(context, line, lineno) {
        // we look for comments /* */ and notes [[ ]]
        var i = 0;
        var state = context.state;
        var previousIsBackslash = false;
        var nestedDepth = (context.nestedDepth ? context.nestedDepth : 0);
        var currentBlock;
        var ixFirstCharState0 = -1;
        var ixFirstCharBlock = -1;

        if (state === 0) {
            // no pending block
            currentBlock = undefined;
            context.blocks = [];
        }
        else {
            // we consider the last block inserted
            currentBlock = context.blocks[context.blocks.length - 1];
            ixFirstCharBlock = 0;
        }

        for (i = 0; i < line.length; i++) {
            if (previousIsBackslash) {
                previousIsBackslash = false;
                continue;
            }
            var c = line.charAt(i);
            if (state === 0) {
                // we 'mark' the column of the first character in state 0
                if (ixFirstCharState0 < 0) {
                    ixFirstCharState0 = i;
                }
                if (c === '/') {
                    state = 1;
                }
                else if (c === '[') {
                    state = 2;
                }
            }
            else if (state === 1) {
                if (c === '*') {
                    currentBlock = {
                        nature: 'comment',
                        before: line.substring(ixFirstCharState0, i - 1).trim(),
                        start: {
                            lineno: lineno,
                            column: i - 1
                        },
                        content: []
                    }
                    context.blocks.push(currentBlock);
                    ixFirstCharState0 = -1;
                    ixFirstCharBlock = i + 1;

                    state = 100;
                }
                else if (c === '[') {
                    state = 2;
                }
                else {
                    state = 0;
                }
            }
            else if (state === 2) {
                if (c === '[') {
                    currentBlock = {
                        nature: 'note',
                        before: line.substring(ixFirstCharState0, i - 1).trim(),
                        start: {
                            lineno: lineno,
                            column: i - 1
                        },
                        content: []
                    }
                    context.blocks.push(currentBlock);
                    ixFirstCharState0 = -1;
                    ixFirstCharBlock = i + 1;

                    state = 200;
                }
                else if (c === '/') {
                    state = 1;
                }
                else {
                    state = 0;
                }
            }
            else if (state === 100) {
                if (c === '*') {
                    state = 101;
                }
                else if (c == '/') {
                    state = 105;
                }
            }
            else if (state === 101) {
                if (c === '/') {
                    // we have a full comment!
                    if (nestedDepth === 0) {
                        currentBlock.end = {
                            lineno: lineno,
                            column: i
                        };
                        currentBlock.content.push(line.substring(ixFirstCharBlock, i - 1).trim());
                        state = 0;
                    }
                    else {
                        nestedDepth--;
                        state = 100;
                    }
                }
                else {
                    state = 100;
                }
            }
            else if (state === 105) {
                if (c === '*') {
                    // we have an embedded comment
                    nestedDepth++;
                }
                else {
                    state = 100;
                }
            }
            else if (state === 200) {
                if (c === ']') {
                    state = 201;
                }
                else if (c === '[') {
                    state = 205;
                }
            }
            else if (state === 201) {
                if (c === ']') {
                    // we have a full note!
                    if (nestedDepth === 0) {
                        currentBlock.end = {
                            lineno: lineno,
                            column: i
                        };
                        currentBlock.content.push(line.substring(ixFirstCharBlock, i - 1).trim());
                        state = 0;
                    }
                    else {
                        nestedDepth--;
                        state = 200;
                    }
                }
                else {
                    state = 200;
                }
            }
            else if (state === 205) {
                if (c === '[') {
                    // we have an embedded note
                    nestedDepth++;
                }
                else {
                    state = 200;
                }
            }

            previousIsBackslash = (c == '\\');
        }

        // we need to reset to state 0, any state which were 
        // an attempt to find the begining of a block
        if ((state == 1) || (state == 2)) {
            state = 0;
        }

        if (state === 0) {
            if (context.blocks.length === 0) {
                // usual situation: no comment nor notes in the line
                context.line = line;
            }
            else {
                context.line = "";
                // we ned to concatenate all the before strings of the blocks
                context.blocks.forEach(function(block, index, array) {
                    context.line += block.before + " ";
                });
                if (ixFirstCharState0 >= 0) {
                    context.line += line.substring(ixFirstCharState0).trim();
                }
                context.line = context.line.trim();
            }
            context.nestedDepth = 0;
        }
        else {
            context.nestedDepth = nestedDepth;

            // we normalize the states assocaiated to block parsing
            // as the processing don't carry over the following lines
            if ((state >= 100) && (state < 200)) {
                // we are in a comment
                state = 100;
                currentBlock.content.push(line.substring(ixFirstCharBlock).trim());
            }
            if ((state >= 200) && (state < 300)) {
                // we are in a note
                state = 200;
                currentBlock.content.push(line.substring(ixFirstCharBlock).trim());
            }
        }
        context.state = state;

        return state;
    }

    function parseEmphasis(line) {
        var part = {
            type: '.',
            parts: []
        };
        parsePart(line, 0, part);
        return part;
    }

    function parsePart(line, index0, part) {
        var i = index0;
        var length = line.length;
        var buffer = "";
        var delim = part.type;
        var hasDelim = (delim[0] !== '.');
        var result;

        function append(c) {
            buffer = buffer + c;
        }

        function next(delta) {
            if ((i + delta) < length) {
                return line.charAt(i + delta);
            }
            else {
                return '';
            }
        }

        function tryPart(type) {
            var newPart = {
                type: type,
                parts: []
            };
            var result = parsePart(line, i + type.length, newPart);
            if (result >= 0) {
                if (buffer.length > 0) {
                    part.parts.push({
                        type: '.',
                        text: buffer
                    });
                    buffer = "";
                }
                part.parts.push(newPart);
            }
            return result;

        }

        for (i = index0; i < length; i++) {
            var c = line.charAt(i);

            if (c === '\\') {
                append(next(1));
                i++;
                continue;
            }

            // check if we have a matching closing delimiter
            if (hasDelim && (c === delim[0])) {
                var match = true;
                for (var delta = 0; delta < delim.length; delta++) {
                    if (next(delta) !== delim[delta]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    // end of parse here as we have our match
                    part.parts.push({
                        type: '.',
                        text: buffer
                    });
                    buffer = "";
                    return i + delim.length - 1;
                }
            }

            if (c === '_') {
                result = tryPart("_");
                if (result < 0) {
                    append(c);
                }
                else {
                    i = result;
                }

            }
            else if (c === '*') {
                if (next(1) === '*') {
                    if (next(2) === '*') {
                        result = tryPart("***");
                        if (result < 0) {
                            append(c);
                        }
                        else {
                            i = result;
                        }

                    }
                    else {
                        result = tryPart("**");
                        if (result < 0) {
                            append(c);
                        }
                        else {
                            i = result;
                        }

                    }

                }
                else {
                    result = tryPart("*");
                    if (result < 0) {
                        append(c);
                    }
                    else {
                        i = result;
                    }

                }
            }
            else {
                append(c);
            }
        }

        // we could not find the closing delimiter
        if (hasDelim) {
            return -1;
        }

        if (buffer.length > 0) {
            part.parts.push({
                type: '.',
                text: buffer
            });
            buffer = "";
        }

        return i;
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
            preprocessContext: {
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
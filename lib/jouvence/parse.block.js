(function() {
    "use strict";


    // this method is in charge of extractiong blocks
    // ( [[ notes ]] and /* comments */ )
    // from a line, or set of lines
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

    function parseBlock(context, line, lineno) {
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
            context.lineno = lineno;
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
                        before: line.substring(ixFirstCharState0, i - 1),
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
                        before: line.substring(ixFirstCharState0, i - 1),
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
                context.lastChunk = "";
            }
            else {
                context.line = "";
                // we ned to concatenate all the before strings of the blocks
                context.blocks.forEach(function(block, index, array) {
                    context.line += block.before;
                });
                if (ixFirstCharState0 >= 0) {
                    context.lastChunk = line.substring(ixFirstCharState0);
                    context.line += context.lastChunk;
                }
                context.line = context.line.trim();
            }
            context.nestedDepth = 0;
        }
        else {
            context.nestedDepth = nestedDepth;

            // we normalize the states associated to block parsing
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
    
    function extractBlocks(blocks) {
        var result = [];
        var position = 0;
        
        for(var i = 0; i < blocks.length ; i++ ) {
            var block = blocks[i];
            position += block.before.length;
            result.push({
                nature: block.nature,
                position: position,
                content: block.content
            });
        }
        return result;
    }

    module.exports = {
        parseBlock: parseBlock,
        extractBlocks: extractBlocks
    };
}());
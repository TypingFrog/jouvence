/*global describe, it */

var chai = require('chai');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var should = chai.should();
var expect = chai.expect;
var util = require('util');

var parseBlock = require("../lib/jouvence/parse.block").parseBlock;
var extractBlocks = require("../lib/jouvence/parse.block").extractBlocks;

describe('parse.block', function() {
    describe('process regular lines', function() {
        it('should parse a regular line', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo");
            expect(context.blocks).to.be.empty;
            done();
        });
        it('should parse a line with special characters (1)', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo / how are you?", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo / how are you?");
            expect(context.blocks).to.be.empty;
            done();
        });
        it('should parse a line with special characters (2)', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo */ how are you?", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo */ how are you?");
            expect(context.blocks).to.be.empty;
            done();
        });
        it('should parse a line with special characters (3)', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo \\/* how are you?", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo \\/* how are you?");
            expect(context.blocks).to.be.empty;
            done();
        });
        it('should parse a line with special characters (4)', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo [how] are you?", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo [how] are you?");
            expect(context.blocks).to.be.empty;
            done();
        });
        it('should parse a line with special characters (5)', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo ]] are you?", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo ]] are you?");
            expect(context.blocks).to.be.empty;
            done();
        });
        it('should parse a line with special characters (6)', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo \\[[ are you?", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo \\[[ are you?");
            expect(context.blocks).to.be.empty;
            done();
        });
    });
    describe('process single lines with comments', function() {
        it('should parse a line with a comment at the end', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo /* this is a comment */", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: 'allo ',
                start: {
                    lineno: 1,
                    column: 5
                },
                content: ['this is a comment'],
                end: {
                    lineno: 1,
                    column: 27
                }
            });
            done();
        });
        it('should parse a line with a comment at the beginning', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "/* this is a comment */ allo ", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: '',
                start: {
                    lineno: 1,
                    column: 0
                },
                content: ['this is a comment'],
                end: {
                    lineno: 1,
                    column: 22
                }
            });

            done();
        });
        it('should parse a line with a comment in the middle', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "I am /* this is a comment */ very happy  ", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("I am  very happy");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: 'I am ',
                start: {
                    lineno: 1,
                    column: 5
                },
                content: ['this is a comment'],
                end: {
                    lineno: 1,
                    column: 27
                }
            });

            done();
        });
        it('should parse a line containing only a comment', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "/* this is a comment */", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: '',
                start: {
                    lineno: 1,
                    column: 0
                },
                content: ['this is a comment'],
                end: {
                    lineno: 1,
                    column: 22
                }
            });

            // console.log(util.inspect(context, {
            //     showHidden: false,
            //     depth: null
            // }));
            done();
        });
        it('should parse a line containing only a comment with a nested comment', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "/* this is /* a */ comment */", 1);
            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: '',
                start: {
                    lineno: 1,
                    column: 0
                },
                content: ['this is /* a */ comment'],
                end: {
                    lineno: 1,
                    column: 28
                }
            });

            done();
        });
    });

    describe('process single lines with non ending comments', function() {
        it('should parse a line with a non ending comment at the end', function(done) {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "well /* this is a", 1);

            expect(state).to.equal(100);
            expect(context.state).to.equal(100);
            expect(context.line).to.be.empty;
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: 'well ',
                start: {
                    lineno: 1,
                    column: 5
                },
                content: ['this is a'],
            });

            done();

        });
    });

    describe("multi-line comments", function() {
        it("should parse multi-lines comment (1)", function(done) {
            var context = {
                state: 0
            };

            var state;

            state = parseBlock(context, "allo /* this is a ", 1);
            state = parseBlock(context, "comment */ ", 2);

            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: 'allo ',
                start: {
                    lineno: 1,
                    column: 5
                },
                content: ['this is a', 'comment'],
                end: {
                    lineno: 2,
                    column: 9
                }
            });

            done();

        });
        it("should parse multi-lines comment (2)", function(done) {
            var context = {
                state: 0
            };

            var state;

            state = parseBlock(context, "allo [[ this is a ", 1);
            state = parseBlock(context, "note ]] end", 2);

            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo  end");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'note',
                before: 'allo ',
                start: {
                    lineno: 1,
                    column: 5
                },
                content: ['this is a', 'note'],
                end: {
                    lineno: 2,
                    column: 6
                }
            });

            done();

        });
        it("should parse multi-lines comment (3)", function(done) {
            var context = {
                state: 0
            };

            var state;

            state = parseBlock(context, "allo [[ this is a ", 1);
            state = parseBlock(context, " very long ", 2);
            state = parseBlock(context, "note ]] end", 3);

            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("allo  end");
            expect(context.blocks).to.have.length(1);
            expect(context.blocks[0]).to.eql({
                nature: 'note',
                before: 'allo ',
                start: {
                    lineno: 1,
                    column: 5
                },
                content: ['this is a', 'very long', 'note'],
                end: {
                    lineno: 3,
                    column: 6
                }
            });

            done();

        });
    });

    describe("multi blocks in one line", function() {
        it("should parse 2 blocks in one line", function(done) {
            var context = {
                state: 0
            };

            var state;

            state = parseBlock(context, "hello, /* one */ how /* two */ are you?", 1);

            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("hello,  how  are you?");
            expect(context.blocks).to.have.length(2);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: 'hello, ',
                start: {
                    lineno: 1,
                    column: 7
                },
                content: ['one'],
                end: {
                    lineno: 1,
                    column: 15
                }
            });
            expect(context.blocks[1]).to.eql({
                nature: 'comment',
                before: ' how ',
                start: {
                    lineno: 1,
                    column: 21
                },
                content: ['two'],
                end: {
                    lineno: 1,
                    column: 29
                }
            });

            done();

        });
        it("should parse 2 blocks across multiple lines", function(done) {
            var context = {
                state: 0
            };

            var state;

            state = parseBlock(context, "hello, /* one */ how [[ this is", 1);
            state = parseBlock(context, "a note]] are you?", 2);

            expect(state).to.equal(0);
            expect(context.state).to.equal(0);
            expect(context.line).to.equal("hello,  how  are you?");
            expect(context.blocks).to.have.length(2);
            expect(context.blocks[0]).to.eql({
                nature: 'comment',
                before: 'hello, ',
                start: {
                    lineno: 1,
                    column: 7
                },
                content: ['one'],
                end: {
                    lineno: 1,
                    column: 15
                }
            });
            expect(context.blocks[1]).to.eql({
                nature: 'note',
                before: ' how ',
                start: {
                    lineno: 1,
                    column: 21
                },
                content: ['this is', 'a note'],
                end: {
                    lineno: 2,
                    column: 7
                }
            });

            done();

        });
    });

    describe("extractBlocks", function() {
        it("should extract blocks (1)", function() {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "allo", 1);
            var blocks = extractBlocks(context.blocks);
            expect(blocks).to.be.empty;
        });

        it("should extract blocks (2)", function() {
            var context = {
                state: 0
            };

            var state = parseBlock(context, "how are you /* really */doing?", 1);
            var blocks = extractBlocks(context.blocks);
            expect(blocks).to.eql([{
                nature: "comment",
                position: 12,
                content: ["really"]
            }]);
        });

        it("should extract blocks (2)", function() {
            var context = {
                state: 0
            };
            var state;

            state = parseBlock(context, "hello, /* one */ how [[ this is", 1);
            state = parseBlock(context, "a note]] are you?", 2);
            var blocks = extractBlocks(context.blocks);
            
            expect(blocks).to.eql([{
                nature: "comment",
                position: 7,
                content: ["one"]
            },{
                nature: "note",
                position: 12,
                content: ["this is","a note"]
            }]);

        });

        it("should extract blocks (3)", function() {
            var context = {
                state: 0
            };
            var state;

            state = parseBlock(context, "hello, /* one */ how [[ this is", 1);
            state = parseBlock(context, "a very long", 2);
            state = parseBlock(context, "note]] are you?", 3);
            var blocks = extractBlocks(context.blocks);
            
            expect(blocks).to.eql([{
                nature: "comment",
                position: 7,
                content: ["one"]
            },{
                nature: "note",
                position: 12,
                content: ["this is","a very long" , "note"]
            }]);

        });

        it("should extract blocks (4)", function() {
            var context = {
                state: 0
            };
            var state;

            state = parseBlock(context, "hello, /* one */ how [[ this is", 1);
            state = parseBlock(context, "a very long", 2);
            state = parseBlock(context, "note]] are /* I don't really care*/you?", 3);
            var blocks = extractBlocks(context.blocks);
            
            expect(blocks).to.eql([{
                nature: "comment",
                position: 7,
                content: ["one"]
            },{
                nature: "note",
                position: 12,
                content: ["this is","a very long" , "note"]
            },{
                nature: "comment",
                position: 17,
                content: ["I don't really care"]
            }]);

        });    });

})
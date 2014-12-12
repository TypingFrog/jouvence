/*global describe, it */

var chai = require('chai');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var should = chai.should();
var expect = chai.expect;
var util = require('util');

var jouvence = require("../lib").testMode();

describe('Jouvence - emphasis parsing', function() {
    describe('simple string parsing', function() {
        it('should parse a regular line (1)', function() {
            var part = jouvence.__parseEmphasis("allo");
            var parts = part.parts;
            expect(parts).to.be.an('array');
            expect(parts.length).to.equal(1);
            expect(parts[0].text).to.equal("allo");
            expect(parts[0].type).to.equal(".");
        });

        it('should parse a regular line (2)', function() {
            var part = jouvence.__parseEmphasis("how are you doing ?");
            var parts = part.parts;
            expect(parts).to.be.an('array');
            expect(parts.length).to.equal(1);
            expect(parts[0].text).to.equal("how are you doing ?");
            expect(parts[0].type).to.equal(".");
        });

        it('should parse a line with "*"', function() {
            var part = jouvence.__parseEmphasis("how are *you* doing ?");

            expect(part).to.eql({
                type: '.',
                parts: [{
                    type: '.',
                    text: "how are "
                }, {
                    type: '*',
                    parts: [{
                        type: '.',
                        text: 'you'
                    }]
                }, {
                    type: '.',
                    text: " doing ?"
                }, ]
            });
        });
        it('should parse a line with "**"', function() {
            var part = jouvence.__parseEmphasis("how are **you** doing ?");

            expect(part).to.eql({
                type: '.',
                parts: [{
                    type: '.',
                    text: "how are "
                }, {
                    type: '**',
                    parts: [{
                        type: '.',
                        text: 'you'
                    }]
                }, {
                    type: '.',
                    text: " doing ?"
                }, ]
            });
        });
        it('should parse a line with "***"', function() {
            var part = jouvence.__parseEmphasis("how are ***you*** doing ?");

            expect(part).to.eql({
                type: '.',
                parts: [{
                    type: '.',
                    text: "how are "
                }, {
                    type: '***',
                    parts: [{
                        type: '.',
                        text: 'you'
                    }]
                }, {
                    type: '.',
                    text: " doing ?"
                }, ]
            });
        });
        it('should parse a line with "_"', function() {
            var part = jouvence.__parseEmphasis("how are _you_ doing ?");

            expect(part).to.eql({
                type: '.',
                parts: [{
                    type: '.',
                    text: "how are "
                }, {
                    type: '_',
                    parts: [{
                        type: '.',
                        text: 'you'
                    }]
                }, {
                    type: '.',
                    text: " doing ?"
                }, ]
            });
        });
    });

    describe("embedded parsing", function() {
        it("should parse emphasis inside emphasis", function() {
            var part = jouvence.__parseEmphasis("how *are _you_ doing* ?");
            expect(part).to.eql({
                type: '.',
                parts: [{
                    type: '.',
                    text: "how "
                }, {
                    type: '*',
                    parts: [{
                        type: '.',
                        text: 'are '
                    }, {
                        type: '_',
                        parts: [{
                            type: '.',
                            text: "you"
                        }]
                    }, {
                        type: '.',
                        text: ' doing'
                    }]
                }, {
                    type: '.',
                    text: " ?"
                }, ]
            });
        });
        it("should parse 2 non embedded emphasis", function() {
            var part = jouvence.__parseEmphasis("how *are* _you_ doing ?");
            expect(part).to.eql({
                type: '.',
                parts: [{
                    type: '.',
                    text: "how "
                }, {
                    type: '*',
                    parts: [{
                        type: '.',
                        text: 'are'
                    }]
                }, {
                    type: '.',
                    text: ' '
                }, {
                    type: '_',
                    parts: [{
                        type: '.',
                        text: "you"
                    }]
                }, {
                    type: '.',
                    text: ' doing ?'
                }]
            });
        });
    });
    describe("incomplete emphasis", function() {
        it("should parse non closed emphasis", function() {
            var part = jouvence.__parseEmphasis("how *are you doing ?");
            expect(part).to.eql({
                type: '.',
                parts: [{
                    type: '.',
                    text: "how *are you doing ?"
                }]
            });

        });
    });
});
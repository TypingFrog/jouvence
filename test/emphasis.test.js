/*global describe, it */

var chai = require('chai');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var should = chai.should();
var expect = chai.expect;
var util = require('util');

var jouvence = require("../lib").testMode();

describe('Jouvence', function() {
    describe('emphasis parsing', function() {
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
    });
});
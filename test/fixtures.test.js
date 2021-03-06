/*global describe, it */

var chai = require('chai');
var fs = require('fs');
var path = require('path');
var fixtures = require("./fixtures");
chai.should();
var expect = chai.expect;


var jouvence = require("../lib");
var notifDescription = require("./notifDescriptionParser");

describe('fixtures', function() {
    describe('parsing files', function() {
        ["t10", "t11", "t12", "t13", "t15", "t20", "t25", "t30", "t40", "t45", "t50", "t55", "t56", "t57", "t58", "t60"].forEach(function(item) {
            it('should process file ' + item + '.fountain', function(done) {
                var r = fixtures.readStream(item + '.fountain');
                var parser = jouvence.parser();
                var input = jouvence.input();

                var nd = new notifDescription(item + '.notif', function(err, notif) {
                    if (err) return done(err);
                    parser.parse(input.fromReadStream(r), notif).then(function() {
                        expect(nd.verify()).to.be.true;
                        done();
                    }, function(error) {
                        done(error);
                    });


                });
            });
        });
    });
});

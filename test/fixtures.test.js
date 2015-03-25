/*global describe, it */

var chai = require('chai');
var fs = require('fs');
var path = require('path');
var fixtures = require("./fixtures");
chai.should();
var expect = chai.expect;


var jouvence = require("../lib").jouvence;
var notifDescription = require("./notifDescriptionParser");
var notif = require("../lib").jouvenceNotification;

describe.only('fixtures', function() {
    describe('parsing files', function() {
        ["t10", "t11", "t12", "t13", "t15", "t20", "t25", "t30", "t40", "t45", "t50", "t55", "t56", "t57", "t58"].forEach(function(item) {
            it('should process file ' + item + '.fountain', function(done) {
                var r = fixtures.readStream(item + '.fountain');

                var nd = new notifDescription(item + '.notif', function(err, notif) {
                    if (err) return done(err);
                    jouvence.read(r, notif).then(function() {
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

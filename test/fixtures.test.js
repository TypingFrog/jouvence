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
        it('should process file t10.fountain', function(done) {
            var r = fixtures.readStream('t10.fountain');

            var nd = new notifDescription('t10.notif', function(err, notif) {
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

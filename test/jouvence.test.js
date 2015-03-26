/*global describe, it */

var chai = require('chai');
var sinon = require('sinon');
var fixtures = require("./fixtures");
chai.should();

var jouvence = require("../lib");
var parser = jouvence.parser();
var notif = jouvence.dummyNotification();
var input = jouvence.input();

describe('Jouvence', function() {
    describe('files with no content', function() {
        it('should read an empty file', function(done) {
            var r = fixtures.readStream('t01.fountain');
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("titlePage").never();
            mock.expects("endOfDocument").once();

            parser.parse(input.fromReadStream(r), notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
        it('should read a document with blank lines', function(done) {
            var r = fixtures.readStream('t02.fountain');
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("titlePage").never();
            mock.expects("endOfDocument").once();

            parser.parse(input.fromReadStream(r), notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
    });

    describe.skip("complete fountain file", function() {
        it('should should read a file', function(done) {
            var r = fixtures.readStream('BrickAndSteel.fountain');
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("titlePage").once();
            //mock.expects("sceneHeading").exactly(8);
            mock.expects("sceneHeading").once().withArgs("EXT. BRICK'S PATIO - DAY");
            mock.expects("sceneHeading").once().withArgs("INT. TRAILER HOME - DAY");
            mock.expects("sceneHeading").once().withArgs("EXT. BRICK'S POOL - DAY");
            mock.expects("sceneHeading").once().withArgs("SNIPER SCOPE POV");
            mock.expects("sceneHeading").once().withArgs("OPENING TITLES");
            mock.expects("sceneHeading").once().withArgs("EXT. WOODEN SHACK - DAY");
            mock.expects("sceneHeading").once().withArgs("INT. GARAGE - DAY");
            mock.expects("sceneHeading").once().withArgs("EXT. PALATIAL MANSION - DAY");

            mock.expects("transition").twice().withArgs("SMASH CUT TO:");
            mock.expects("transition").exactly(4).withArgs("CUT TO:");
            mock.expects("transition").once().withArgs("BURN TO PINK.");

            mock.expects("endOfDocument").once();

            parser.parse(input.fromReadStream(r), notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        })
    })
})
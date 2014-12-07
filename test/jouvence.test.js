/*global describe, it */

var chai = require('chai');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var fixtures = require("./fixtures");
chai.should();

var jouvence = require("../lib");

describe('Jouvence', function() {
    describe('files with no content', function() {
        it('should read an empty file', function(done) {
            var r = fixtures.readStream('t01.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("titlePage").never();
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
        it('should read a document with blank lines', function(done) {
            var r = fixtures.readStream('t02.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("titlePage").never();
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
    });

    describe("title page parsing", function() {
        it("should read a simple title page", function(done) {
//            var r = fs.createReadStream(path.join(__dirname, 'fixtures/t10.fountain'));
            var r = fixtures.readStream('t10.fountain');

            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            var tpExpecation = mock.expects("titlePage").once().withArgs({
                Title: ['the title']
            });
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
        it("should read a simple title page (2)", function(done) {
            var r = fixtures.readStream('t11.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            var tpExpecation = mock.expects("titlePage").once().withArgs({
                Title: ['the title'],
                Another: ["line 1", "line 2", "line 3"]
            });
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
        it("should read a simple title page (3)", function(done) {
            var r = fixtures.readStream('t12.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            var tpExpecation = mock.expects("titlePage").once().withArgs({
                Title: ['the title'],
                Another: ["line 1", "line 2", "line 3"]
            });
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
        it("should read a simple title page (4)", function(done) {
            var r = fixtures.readStream('t13.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("titlePage").once().withArgs({
                Title: ['the title'],
                Empty: [],
                'Yet Another': ["line 1", "line 2", "line 3"]
            });
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
    });

    describe('scene heading parsing', function() {
        it("should read headings", function(done) {
            var r = fixtures.readStream('t15.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("sceneHeading").once().withArgs("EXT. BRICK'S POOL - DAY");
            mock.expects("sceneHeading").once().withArgs("SNIPER SCOPE POV");
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        });
    });

    describe('character parsing', function() {
        it("should read character names", function(done) {
            var r = fixtures.readStream('t20.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("character").once().withArgs("STEEL");
            mock.expects("dialogue").once().withArgs("The man's a myth!");
            mock.expects("character").once().withArgs("MOM", {
                extension: 'O. S.'
            });
            mock.expects("dialogue").once().withArgs("Luke! Come down for supper!");
            mock.expects("character").once().withArgs("HANS", {
                extension: 'on the radio'
            });
            mock.expects("dialogue").once().withArgs("What was it you said?");
            mock.expects("character").once().withArgs("McCLANE");
            mock.expects("dialogue").once().withArgs("Yippie ki-yay! I got my lower-case C back!");
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });

        });
    });

    describe("section parsing", function() {
        it("should parse sections", function(done) {
            var r = fixtures.readStream('t25.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("section").once().withArgs("Act", 1);
            mock.expects("section").once().withArgs("Sequence", 2);
            mock.expects("section").once().withArgs("Scene", 3);
            mock.expects("section").once().withArgs("Another Sequence", 2);
            mock.expects("section").once().withArgs("Another Act", 1);
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });

        });
    });

    describe("synopsis parsing", function() {
        it("should parse synopses", function(done) {
            var r = fixtures.readStream('t30.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("section").once().withArgs("ACT I", 1);
            mock.expects("synopsis").once().withArgs("Set up the characters and the story.");
            mock.expects("sceneHeading").once().withArgs("EXT. BRICK'S PATIO - DAY");
            mock.expects("synopsis").once().withArgs("This scene sets up Brick & Steel's new life as retirees. Warm sun, cold beer, and absolutely nothing to do.");
            mock.expects("action").once().withArgs("A gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.")
            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });

        });
    });

    describe("note parsing", function() {
        it("should parse notes", function(done) {
            var r = fixtures.readStream('t40.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("sceneHeading").once().withArgs("INT. TRAILER HOME - DAY");
            mock.expects("action").once().withArgs("This is the home of THE BOY BAND, AKA DAN and JACK . They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.");
            mock.expects("character").once().withArgs("JACK");
            mock.expects("parenthetical").once().withArgs("in Vietnamese, subtitled");
            mock.expects("dialogue").once().withArgs("Did you know Brick and Steel are retired?");

            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });

        });
        it("should parse comments", function(done) {
            var r = fixtures.readStream('t45.fountain');
            var notif = jouvence.dummyNotification();
            var mock = sinon.mock.create(notif);
            mock.expects("startOfDocument").once();
            mock.expects("character").once().withArgs("COGNITO");
            mock.expects("dialogue").once().withArgs("Everyone's coming after you mate!  Scorpio, The Boy Band, Sparrow, Point Blank Sniper...");
            mock.expects("action").once().withArgs("As he rattles off the long list, Brick and Steel share a look.  This is going to be BAD.");
            mock.expects("transition").once().withArgs("CUT TO:");
            mock.expects("sceneHeading").once().withArgs("EXT. PALATIAL MANSION - DAY");
            mock.expects("action").once().withArgs("An EXTREMELY HANDSOME MAN drinks a beer.  Shirtless, unfortunately.");

            mock.expects("endOfDocument").once();

            jouvence.read(r, notif).then(function() {
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
            var notif = jouvence.dummyNotification();
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

            jouvence.read(r, notif).then(function() {
                mock.verify();
                done();
            }, function(error) {
                done(error);
            });
        })
    })
})
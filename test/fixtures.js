(function() {
    "use strict";
    var fs = require('fs');
    var path = require('path');
    
    var Readable = require('stream').Readable;
    var util = require('util');
    util.inherits(ReadableString, Readable);

    var Stream = require('stream')

    var fixtures = 
{
    "BrickAndSteel.fountain": "Title:\n\t_**BRICK & STEEL**_\n\t_**FULL RETIRED**_\nCredit: Written by\nAuthor: Stu Maschwitz\nSource: Story by KTM\nDraft date: 1/27/2012\nContact:\n\tNext Level Productions\n\t1588 Mission Dr.\n\tSolvang, CA 93463\n\nEXT. BRICK'S PATIO - DAY\n\nA gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.\n\nThe SCREEN DOOR slides open and DICK STEEL, his former partner and fellow retiree, emerges with two cold beers.\n\nSTEEL\nBeer's ready!\n\nBRICK\nAre they cold?\n\nSTEEL\nDoes a bear crap in the woods?\n\nSteel sits.  They laugh at the dumb joke.\n\nSTEEL\n(beer raised)\nTo retirement.\n\nBRICK\nTo retirement.\n\nThey drink long and well from the beers.\n\nAnd then there's a long beat.\nLonger than is funny.\nLong enough to be depressing.\n\nThe men look at each other.\n\nSTEEL\nScrew retirement.\n\nBRICK ^\nScrew retirement.\n\nSMASH CUT TO:\n\nINT. TRAILER HOME - DAY\n\nThis is the home of THE BOY BAND, AKA DAN and JACK.  They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.\n\n\t\t\tJACK\n\t\t(in Vietnamese, subtitled)\n\t*Did you know Brick and Steel are retired?*\n\n\t\t\tDAN\n\tThen let's retire them.\n\t_Permanently_.\n\nJack begins to argue vociferously in Vietnamese (?), But mercifully we...\n\n\t\t\t\tCUT TO:\n\nEXT. BRICK'S POOL - DAY\n\nSteel, in the middle of a heated phone call:\n\nSTEEL\nThey're coming out of the woodwork!\n(pause)\nNo, everybody we've put away!\n(pause)\nPoint Blank Sniper?\n\n.SNIPER SCOPE POV\n\nFrom what seems like only INCHES AWAY.  _Steel's face FILLS the *Leupold Mark 4* scope_.\n\nSTEEL\nThe man's a myth!\n\nSteel turns and looks straight into the cross-hairs.\n\nSTEEL\n(oh crap)\nHello...\n\nCUT TO:\n\n.OPENING TITLES\n\n> BRICK BRADDOCK <\n> & DICK STEEL IN <\n\n> BRICK & STEEL <\n> FULL RETIRED <\n\nSMASH CUT TO:\n\nEXT. WOODEN SHACK - DAY\n\nCOGNITO, the criminal mastermind, is SLAMMED against the wall.\n\nCOGNITO\nWoah woah woah, Brick and Steel!\n\nSure enough, it's Brick and Steel, roughing up their favorite usual suspect.\n\nCOGNITO\nWhat is it you want with me, DICK?\n\nSteel SMACKS him.\n\nSTEEL\nWho's coming after us?\n\nCOGNITO\nEveryone's coming after you mate!  Scorpio, The Boy Band, Sparrow, Point Blank Sniper...\n\nAs he rattles off the long list, Brick and Steel share a look.  This is going to be BAD.\n\nCUT TO:\n\nINT. GARAGE - DAY\n\nBRICK and STEEL get into Mom's PORSCHE, Steel at the wheel.  They pause for a beat, the gravity of the situation catching up with them.\n\nBRICK\nThis is everybody we've ever put away.\n\nSTEEL\n(starting the engine)\nSo much for retirement!\n\nThey speed off.  To destiny!\n\nCUT TO:\n\nEXT. PALATIAL MANSION - DAY\n\nAn EXTREMELY HANDSOME MAN drinks a beer.  Shirtless, unfortunately.\n\nHis minion approaches offscreen:\n\nMINION\nWe found Brick and Steel!\n\nHANDSOME MAN\nI want them dead.  DEAD!\n\nBeer flies.\n\n> BURN TO PINK.\n\n> THE END <",
    "t01.fountain": "",
    "t02.fountain": "\n\n",
    "t10.fountain": "Title: the title",
    "t10.notif": "startOfDocument\ntitlePage||{ \"Title\": [\"the title\"] }\nendOfDocument\n",
    "t11.fountain": "Title: the title\nAnother: line 1\n   line 2\n   line 3\n",
    "t11.notif": "startOfDocument\ntitlePage||{ \"Title\": [\"the title\"], \"Another\" : [\"line 1\" , \"line 2\" , \"line 3\"] }\nendOfDocument\n",
    "t12.fountain": "Title: \n   the title\nAnother: line 1\n   line 2\n   line 3",
    "t12.notif": "startOfDocument\ntitlePage||{ \"Title\": [\"the title\"], \"Another\" : [\"line 1\" , \"line 2\" , \"line 3\"] }\nendOfDocument\n",
    "t13.fountain": "Title: \n   the title\nEmpty:\nYet Another: line 1\n   line 2\n   line 3\n\n",
    "t13.notif": "startOfDocument\ntitlePage||{ \"Title\": [\"the title\"], \"Yet Another\" : [\"line 1\" , \"line 2\" , \"line 3\"] , \"Empty\" : []}\nendOfDocument\n",
    "t15.fountain": "EXT. BRICK'S POOL - DAY\n\n.SNIPER SCOPE POV\n\n",
    "t15.notif": "startOfDocument\nsceneHeading|EXT. BRICK'S POOL - DAY| { \"lineno\" : 1}\nsceneHeading|SNIPER SCOPE POV| { \"lineno\" : 3}\nendOfDocument\n",
    "t20.fountain": "STEEL\nThe man's a myth!\n\nMOM (O. S.)\nLuke! Come down for supper!\nPlease!\n\n   HANS (on the radio)\nWhat was it you said?\n\n  @McCLANE\n Yippie ki-yay! I got my lower-case C back!    ",
    "t20.notif": "startOfDocument\ndialogueStart\ncharacter|STEEL\ndialogue|The man's a myth!\ndialogueEnd\ndialogueStart\ncharacter|MOM|{ \"extension\":\"O. S.\" }\ndialogue|Luke! Come down for supper!\ndialogue|Please!\ndialogueEnd\ndialogueStart\ncharacter|HANS|{ \"extension\":\"on the radio\" }\ndialogue|What was it you said?\ndialogueEnd\ndialogueStart\ncharacter|McCLANE\ndialogue|Yippie ki-yay! I got my lower-case C back!\ndialogueEnd\nendOfDocument\n",
    "t25.fountain": "# Act\n\n## Sequence\n\n### Scene\n\n## Another Sequence\n\n# Another Act",
    "t25.notif": "startOfDocument\nsection_1|Act|{\"lineno\":1}\nsection_2|Sequence|{\"lineno\":3}\nsection_3|Scene|{\"lineno\":5}\nsection_2|Another Sequence|{\"lineno\":7}\nsection_1|Another Act|{\"lineno\":9}\nendOfDocument\n",
    "t30.fountain": "# ACT I\n\n= Set up the characters and the story.\n\nEXT. BRICK'S PATIO - DAY\n\n= This scene sets up Brick & Steel's new life as retirees. Warm sun, cold beer, and absolutely nothing to do.\n\nA gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.",
    "t30.notif": "startOfDocument\nsection_1|ACT I|{\"lineno\":1}\nsynopsis|Set up the characters and the story.\nsceneHeading|EXT. BRICK'S PATIO - DAY|{ \"lineno\": 5 }\nsynopsis|This scene sets up Brick & Steel's new life as retirees. Warm sun, cold beer, and absolutely nothing to do.\naction|A gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.\nendOfDocument\n",
    "t40.fountain": "INT. TRAILER HOME - DAY\n\nThis is the home of THE BOY BAND, AKA DAN and JACK[[Or did we think of actual names for these guys?]]. They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.\n\n[[It was supposed to be Vietnamese, right?]]\n\nJACK\n(in Vietnamese, subtitled)\nDid you know Brick and Steel are retired?",
    "t40.notif": "startOfDocument\nsceneHeading|INT. TRAILER HOME - DAY|{ \"lineno\": 1 }\naction|This is the home of THE BOY BAND, AKA DAN and JACK. They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.\nblock||[{ \"nature\":\"note\",\"position\":0,\"content\":[\"It was supposed to be Vietnamese, right?\"]}]\ndialogueStart\ncharacter|JACK\nparenthetical|in Vietnamese, subtitled\ndialogue|Did you know Brick and Steel are retired?\ndialogueEnd\nendOfDocument\n",
    "t45.fountain": "COGNITO\nEveryone's coming after you mate!  Scorpio, The Boy Band, Sparrow, Point Blank Sniper...\n\nAs he rattles off the long list, Brick and Steel share a look.  This is going to be BAD.\n\nCUT TO:\n/*\nINT. GARAGE - DAY\n\nBRICK and STEEL get into Mom's PORSCHE, Steel at the wheel.  They pause for a beat, the gravity of the situation catching up with them.\n\nBRICK\nThis is everybody we've ever put away.\n\nSTEEL\n(starting the engine)\nSo much for retirement!\n\nThey speed off.  To destiny!\n\nCUT TO:\n*/\nEXT. PALATIAL MANSION - DAY\n\nAn EXTREMELY HANDSOME MAN drinks a beer.  Shirtless, unfortunately.",
    "t45.notif": "startOfDocument\ndialogueStart\ncharacter|COGNITO\ndialogue|Everyone's coming after you mate!  Scorpio, The Boy Band, Sparrow, Point Blank Sniper...\ndialogueEnd\naction|As he rattles off the long list, Brick and Steel share a look.  This is going to be BAD.\ntransition|CUT TO:\nblock||*\nsceneHeading|EXT. PALATIAL MANSION - DAY|{\"lineno\":23}\naction|An EXTREMELY HANDSOME MAN drinks a beer.  Shirtless, unfortunately.\nendOfDocument\n",
    "t50.fountain": "BRICK\nScrew my retirement.\n\nSTEEL ^\nScrew your retirement.",
    "t50.notif": "startOfDocument\ndualDialogueStart\ndialogueStart\ncharacter|BRICK\ndialogue|Screw my retirement.\ndialogueEnd\ndialogueStart\ncharacter|STEEL\ndialogue|Screw your retirement.\ndialogueEnd\ndualDialogueEnd\nendOfDocument\n",
    "t55.fountain": "INT. BASEMENT\n\nThis is the action\n\nBRICK\nScrew my retirement.\n\nSTEEL ^\nScrew your retirement.\n\nANOTHER GUY ^\nWhatever\n",
    "t55.notif": "startOfDocument\nsceneHeading|INT. BASEMENT|{\"lineno\":1}\naction|This is the action\ndualDialogueStart\ndialogueStart\ncharacter|BRICK\ndialogue|Screw my retirement.\ndialogueEnd\ndialogueStart\ncharacter|STEEL\ndialogue|Screw your retirement.\ndialogueEnd\ndualDialogueEnd\ndialogueStart\ncharacter|ANOTHER GUY\ndialogue|Whatever\ndialogueEnd\nendOfDocument\n",
    "t56.fountain": "INT. BASEMENT\n\nThis is the action\n\nBRICK\nScrew my retirement.\n\nSTEEL ^\nScrew your retirement.\n\nEXT. ELSEWHERE\nWhatever\n",
    "t56.notif": "startOfDocument\nsceneHeading|INT. BASEMENT|{\"lineno\":1}\naction|This is the action\ndualDialogueStart\ndialogueStart\ncharacter|BRICK\ndialogue|Screw my retirement.\ndialogueEnd\ndialogueStart\ncharacter|STEEL\ndialogue|Screw your retirement.\ndialogueEnd\ndualDialogueEnd\nsceneHeading|EXT. ELSEWHERE|{\"lineno\":11}\naction|Whatever\nendOfDocument\n",
    "t57.fountain": "INT. BASEMENT\n\nThis is the action\n\nBRICK\nScrew my retirement.\n\nSTEEL ^\nScrew your retirement.\n\nANOTHER GUY\nWhatever\n",
    "t57.notif": "startOfDocument\nsceneHeading|INT. BASEMENT|{\"lineno\":1}\naction|This is the action\ndualDialogueStart\ndialogueStart\ncharacter|BRICK\ndialogue|Screw my retirement.\ndialogueEnd\ndialogueStart\ncharacter|STEEL\ndialogue|Screw your retirement.\ndialogueEnd\ndualDialogueEnd\ndialogueStart\ncharacter|ANOTHER GUY\ndialogue|Whatever\ndialogueEnd\nendOfDocument\n",
    "t58.fountain": "INT. BASEMENT\n\nThis is the action\n\nBRICK\nScrew my retirement.\n\nSTEEL ^\nScrew your retirement.\n\nANOTHER GUY\nWhatever\n\nOTHER GUY ^\nAgreed!",
    "t58.notif": "startOfDocument\nsceneHeading|INT. BASEMENT|{\"lineno\":1}\naction|This is the action\ndualDialogueStart\ndialogueStart\ncharacter|BRICK\ndialogue|Screw my retirement.\ndialogueEnd\ndialogueStart\ncharacter|STEEL\ndialogue|Screw your retirement.\ndialogueEnd\ndualDialogueEnd\ndualDialogueStart\ndialogueStart\ncharacter|ANOTHER GUY\ndialogue|Whatever\ndialogueEnd\ndialogueStart\ncharacter|OTHER GUY\ndialogue|Agreed!\ndialogueEnd\ndualDialogueEnd\nendOfDocument\n",
    "t60.fountain": "DEALER\nTen.\nFour.\nDealer gets a seven.\n  \nHit or stand sir?\n\nMONKEY\nDude, I’m a monkey.",
    "t60.notif": "startOfDocument\ndialogueStart\ncharacter|DEALER\ndialogue|Ten.\ndialogue|Four.\ndialogue|Dealer gets a seven.\ndialogue||\ndialogue|Hit or stand sir?\ndialogueEnd\ndialogueStart\ncharacter|MONKEY\ndialogue|Dude, I’m a monkey.\ndialogueEnd\nendOfDocument\n\n"
}
    function ReadableString(text, name, opt) {
        Readable.call(this, opt);
        this._text = text;
        this._name = name;
        this._complete = false;
    }

    ReadableString.prototype._read = function() {
        if (this._complete) {
            this.push(null);
        } else {
            if (this._text.length === 0) {
                this.push(null);
            } else {
                var buf = new Buffer(this._text, 'utf8');
                this.push(buf);
            }
            this._complete = true;
        }
    };

    module.exports = {
        readStream: function(name) {
            var text = fixtures[name];
            if (typeof text === 'undefined') {
                console.log("-- no static fixtures with name:" + name);
                return fs.createReadStream(path.join(__dirname, 'fixtures',name));
            }
            return new ReadableString(text, name);
        }
    };
}());
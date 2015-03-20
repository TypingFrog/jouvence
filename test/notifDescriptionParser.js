(function() {
  "use strict";

  var fs = require('fs');
  var path = require('path');
  var _ = require('lodash');

  var NotifDescriptionParser = (function() {

    function NotifDescriptionParser(file, done) {
      this.lines = [];
      this.ixLine = 0;
      this.errors = [];
      this.fileName = file;

      var self = this;
      var filePath = path.join(__dirname, 'fixtures', file);

      var rl = require('readline').createInterface({
        input: fs.createReadStream(filePath),
        terminal: false
      });

      rl.on('line', function(line) {
        line = line.trim();
        if ((line.length > 0) && (line.charAt(0) !== '#')) {
          self.lines.push(line);
        }
      });

      rl.on('close', function() {
        return done(null, self.getNotif());
      });
    }



    function splitDescription(description) {
      var state = 0;
      var result = [];
      var temp = "";
      for (var i = 0; i < description.length; i++) {
        var c = description.charAt(i);

        if (c === ':') {
          result.push(temp);
          temp = "";
          state += 1;
          if (state == 2) {
            result.push(description.substring(i + 1));
            return result;
          }
        }
        else {
          temp += c;
        }
      }
      result.push(temp);
      return result;
    }


    NotifDescriptionParser.prototype = {
      verify: function() {
        if (this.errors.length > 0) {
          console.log("Errors for:" + this.fileName);
        }
        this.errors.forEach(function(error) {
          console.log(error);
        });
        return this.errors.length === 0;
      },

      addError: function(error) {
        this.errors.push(error);
      },

      check: function(notifName, value, extra) {
        value = value || "";
        extra = extra || {};
        if (this.ixLine >= this.lines.length) {
          this.addError("Overflow error for:" + notifName);
          return false;
        }
        var line = this.lines[this.ixLine];
        this.ixLine++;
        var items = splitDescription(line);
        var expectedNotifName = items[0];
        if (expectedNotifName !== notifName) {
          this.addError("wrong notif at line:" + this.ixLine + ": (" + notifName + ") vs (" + expectedNotifName + ")");
          return false;
        }
        var expectedValue = items[1] || "";
        if (expectedValue !== value) {
          this.addError("wrong value at line:" + this.ixLine + ": (" + value + ") vs (" + expectedValue + ")");
          return false;
        }
        var expectedExtraString = items[2] || "{}";
        var expectedExtra = JSON.parse(expectedExtraString);

        if (!_.isEqual(extra, expectedExtra)) {
          console.log("@@ so?:" + _.isEqual({ a : ["1", "2"]},{a : ["1", "2"]}));
          console.log("@@@ extra:", require('util').inspect(extra, {
            showHidden: true,
            depth: null
          }));
          console.log("@@@ expectedExtra:", require('util').inspect(expectedExtra, {
            showHidden: true,
            depth: null
          }));
          this.addError("wrong extra at line:" + this.ixLine + ": (" + JSON.stringify(extra) + ") vs (" + expectedExtraString + ")");
          return false;
        }

        return true;
      },

      getNotif: function() {
        var self = this;
        return {
          startOfDocument: function() {
            self.check("startOfDocument");
          },
          titlePage: function(metaInformation) {
            self.check("titlePage", "", metaInformation);
          },
          sceneHeading: function(sceneHeading, extra) {
            self.check("sceneHeading", sceneHeading, extra);
          },
          action: function(action, blocks, options) {
            self.check("action", action, options, blocks);
            //console.log("@@@ blocks:" +  require('util').inspect(blocks, { showHidden: true, depth: null }));
          },
          pageBreak: function() {
            self.check("pageBreak");
          },
          dualDialogueStart: function() {
            self.check("dualDialogueStart");
          },
          dualDialogueEnd: function() {
            self.check("dualDialogueEnd");
          },
          dialogueStart: function() {
            self.check("dialogueStart");
          },
          dialogueEnd: function() {
            self.check("dialogueEnd");
          },
          character: function(character, option) {
            self.check("character", character, option);
          },
          parenthetical: function(parenthetical) {
            self.check("parenthetical", parenthetical);
          },
          dialogue: function(dialogue) {
            self.check("dialogue", dialogue);
          },
          transition: function(transition) {
            self.check("transition", transition);
          },
          section: function(section, level, extra) {
            self.check("section_" + level, section, extra);
          },
          synopsis: function(synopsis) {
            self.check("synopsis", synopsis);
          },
          block: function(blocks) {
            self.check("block","",blocks);
          },
          endOfDocument: function() {
            self.check("endOfDocument");
          }
        };

      }
    };

    return NotifDescriptionParser;
  })();

  module.exports = NotifDescriptionParser;
})();
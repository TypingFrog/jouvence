(function() {
  "use strict";

  var fs = require('fs');
  var path = require('path');
  var _ = require('lodash');

  var NotifDescriptionParser = (function() {
    var lines = [];
    var ixLine = 0;
    var errors = [];

    function NotifDescriptionParser(file, done) {
      var self = this;
      var filePath = path.join(__dirname, 'fixtures', file);

      var rl = require('readline').createInterface({
        input: fs.createReadStream(filePath),
        terminal: false
      });

      rl.on('line', function(line) {
        line = line.trim();
        if ((line.length > 0) && (line.charAt(0) !== '#')) {
          lines.push(line);
        }
      });

      rl.on('close', function() {
        return done(null, self.getNotif());
      });
    }

    function addError(error) {
      errors.push(error);
    }

    function check(notifName, value, extra) {
      value = value || "";
      extra = extra || {};
      if (ixLine >= lines.length) {
        addError("Overflow error for:" + notifName);
        return false;
      }
      var line = lines[ixLine];
      ixLine++;
      var items = splitDescription(line);
      var expectedNotifName = items[0];
      if (expectedNotifName !== notifName) {
        addError("wrong notif at line:" + ixLine + ": (" + notifName + ") vs (" + expectedNotifName + ")");
        return false;
      }
      var expectedValue = items[1] || "";
      if (expectedValue !== value) {
        addError("wrong value at line:" + ixLine + ": (" + value + ") vs (" + expectedValue + ")");
        return false;
      }
      var expectedExtraString = items[2] || "{}";
      var expectedExtra = JSON.parse(expectedExtraString);
      
      if (! _.isEqual(extra, expectedExtra)) {
        addError("wrong extra at line:" + ixLine + ": (" + JSON.stringify(extra) + ") vs (" + expectedExtraString + ")");
        return false;
      }

      return true;
    }
    
    function splitDescription(description) {
      var state = 0;
      var result = [];
      var temp = "";
      for(var i = 0; i < description.length; i++) {
        var c = description.charAt(i);
        
        if (c === ':') {
          result.push(temp);
          temp = "";
          state += 1;
          if (state == 2) {
            result.push(description.substring(i + 1));
            return result;
          }
        } else {
          temp += c;
        }
      }
      result.push(temp);
      return result;
    }


    NotifDescriptionParser.prototype = {
      verify: function() {
        errors.forEach(function(error) {
          console.log(error);
        });
        return errors.length === 0;
      },

      getNotif: function() {
        return {
          startOfDocument: function() {
            check("startOfDocument");
          },
          titlePage: function(metaInformation) {
            check("titlePage", "", metaInformation);
          },
          sceneHeading: function(sceneHeading, extra) {
            check("sceneHeading", sceneHeading, extra);
          },
          action: function(action, blocks, options) {
            check("action", action, options, blocks);
          },
          pageBreak: function() {
            check("pageBreak");
          },
          dualDialogueStart: function() {
            check("dualDialogueStart");
          },
          dualDialogueEnd: function() {
            check("dualDialogueEnd");
          },
          dialogueStart: function() {
            check("dialogueStart");
          },
          dialogueEnd: function() {
            check("dialogueEnd");
          },
          character: function(character, option) {
            check("character", character, option);
          },
          parenthetical: function(parenthetical) {
            check("parenthetical", parenthetical);
          },
          dialogue: function(dialogue) {
            check("dialogue", dialogue);
          },
          transition: function(transition) {
            check("transition", transition);
          },
          section: function(section, level, extra) {
            check("section_" + level, section, extra);
          },
          synopsis: function(synopsis) {
            check("synopsis", synopsis);
          },
          endOfDocument: function() {
            check("endOfDocument");
          }
        };

      }
    };

    return NotifDescriptionParser;
  })();

  module.exports = NotifDescriptionParser;
})();
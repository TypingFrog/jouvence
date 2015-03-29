[![Build Status](https://travis-ci.org/TypingFrog/jouvence.svg?branch=master)](https://travis-ci.org/TypingFrog/jouvence)

# Jouvence (version 1.0.1)

Jouvence is a javascript library to parse a screenplay written in Fountain.

Fountain is a text format, similar to Markdown, but designed specifically to write screenplays.

To quote from the [Fountain web site](http://fountain.io/):

> Fountain allows you to write screenplays in any text editor on any device. Because it’s just text, it’s portable and future-proof.

## Jouvence is an event driven parser

Jouvence is an event-driven parser: it operates on each piece of the Fountain input sequentially and reports each parsing event as it happens.

Jouvence sends notification while it is parsing the content instead of providing a model of the content of the Fountain document at the end of the parsing.

# Installation

To install the jouvence package, just type:

```shell
npm install jouvence
```
if you want to update your `package.json` file:

```shell
npm install --save jouvence
```

# Usage

If you have a Fountain file, like the sample file BrickAndSteel.fountain that you can find on the [Fountain website](http://fountain.io/), you can parse it with this simple code:

```javascript
var jouvence = require('jouvence');

var input = jouvence.input().fromFile('BrickAndSteel.fountain');
var parser = jouvence.parser();

parser.parse(input, jouvence.dummyNotification())
  .then(function(){
    console.log("Done");
  })
  .catch(function(err){
    console.log("Error:", err);
  });
```

## API details

Once you have imported the jouvence API with `require('jouvence'), you then have access to 3 classes:

### Input : jouvence.input()

This class allows you to define the way you want to inject your fountain screenplay into the parser.

You have 3 options:

* you can provide a file (like the example above): `jouvence.input().fromFile(<path of the file>)`
* you can provide a string: `jouvence.input().fromString('<your fountain data>')`
* you can provide a regular (node/Stream) Readable: `jouvence.input().fromReadStream(<readable instance>)`

All those methods return an object which can be parsed by the Fountain parser:

### Fountain parser: jouvence.parser()

This parser has a single method `parse()` which takes 2 parameters:

* the `input` as returned from the `jouvence.input()` class
* a class which will provide all the callbacks require to process the parsing events (see next section).

As the parsing is asynchronous, the `parse()` method returns a Promise : when the processing is over, the `then()` method is called.

### parsing notification callbacks

As mentioned above, the parser expects a class which will provide all the callbacks methods to receive the parsing events.

There is a helper class, returned by `jouvence.dummyNotification()` which will provide a starting point for your own implementation.

With the example above, this class outputs the events it receives from the parser:

```bash
tartOfDocument
titlePage: { Title: [ '_**BRICK & STEEL**_', '_**FULL RETIRED**_' ],
  Credit: [ 'Written by' ],
  Author: [ 'Stu Maschwitz' ],
  Source: [ 'Story by KTM' ],
  'Draft date': [ '1/27/2012' ],
  Contact:
   [ 'Next Level Productions',
     '1588 Mission Dr.',
     'Solvang, CA 93463' ] }
sceneHeading:<EXT. BRICK'S PATIO - DAY> { lineno: 13 }
action:<A gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.> options: undefined
```

The easiest way to create your own callback class is to copy and paste the code from [this sample notification class](lib/jouvence/jouvence_notification.js) and provide your own implementation.


#### Callbacks description

Callback name | Description
------------- | -------------
`startOfDocument  | called when the parsing starts
`titlePage (metainformation)  | called when the [title page information](http://fountain.io/syntax#section-titlepage) is parsed. `metainformation` contains is a map containing all the information from the title page
`sceneHeading(sceneHeading, extra)` | called when a [scene heading](http://fountain.io/syntax#section-slug) is parsed. `extra.lineno` contains the line number of the input.
`action(action, blocks, options)` | called when an [action](http://fountain.io/syntax#section-action) is parsed. `blocks` contains the [comments](http://fountain.io/syntax#section-bone) or [notes](http://fountain.io/syntax#section-notes) which may have been inserted in the action
`pageBreak` | called when a [page break](http://fountain.io/syntax#section-pagebreaks) is parsed
`dualDialogueStart` | called when a [dual dialogue](http://fountain.io/syntax#section-dual) is about to start
`dualDialogueEnd` | called when a dual dialogue ends
`dialogueStart`  | called when a  dialogue is about to start
`dialogueEnd` | called when a  dialogue ends
`character(character, option)` | called when a character is parsed. `option.extension` contains the optional extension
`parenthetical(parenthetical)` | called when a [parenthetical](http://fountain.io/syntax#section-paren) is parsed
`dialogue(dialogue)` | called when a [dialogue](http://fountain.io/syntax#section-dialogue) is parsed
`transition(transition)` | called when a [transition](http://fountain.io/syntax#section-trans) is parsed
`section(section, level, extra)`  (optional) Called when a [section](http://fountain.io/syntax#section-sections) is parsed.
`synopsis(synopsis)` | (optional) Called when a [synopsis](http://fountain.io/syntax#section-sections) is parsed.
`block(blocks)` | Called when a [comments](http://fountain.io/syntax#section-bone) or [notes](http://fountain.io/syntax#section-notes) have been parsed
`endOfDocument` | Called when the end of the input is reached

### emphasis parser: jouvence.parseEmphasis()

This last class allows you to parse the emphasis in the strings returned in the API parsing events.

This is a synchronous parser which returns a data structure describing the different parts of the string:

```javascript

var parts = emParser.parse("This is *italics* and that is **bold**");

console.log("Parts :" + require('util').inspect(parts, { showHidden: false, depth: null }));
```

The result is:

```bash
Parts :{ type: '.',
  parts:
   [ { type: '.', text: 'This is ' },
     { type: '*', parts: [ { type: '.', text: 'italics' } ] },
     { type: '.', text: ' and that is ' },
     { type: '**', parts: [ { type: '.', text: 'bold' } ] } ] }
```
 
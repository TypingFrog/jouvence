# Jouvence (version 0.3)

Javascript library to parse Fountain file. (SAX based evented streaming parser).

Fountain is a text format, similar to Markdown, but designed specifically
to write screenplays.

To quote from the [Fountain web site](http://fountain.io/):

> Fountain allows you to write screenplays in any text editor on any device. Because it’s just text, it’s portable and future-proof.

Jouvence is a node based, javascript library to read Fountain files or stream:

* it is a streaming library: Jouvence reads the data as a stream and start the parsing as soon as possible.
* it SAX based: Jouvence sends notification while it is parsing the content instead of providing a model of the content of Fountain document at the end of the parsing.

# Installation

## Building Prerequisites
As a prerequisite, you need to install:

* node (and npm), available at http://nodejs.org/download/
* gulp, available at http://gulpjs.com/

## Installation testing

The first step is to update the dependencies :

    npm install
    
Then you can test that everything is ready to go with:

    gulp test

This command should end with something like this:

```bash
  30 passing (321ms)
  1 pending

[17:24:35] Finished 'test' after 444 ms
```

## TODO

* handle dual dialogues
* internationalization:
  * words which can start a heading
  *  other ending than "TO:" for transitions
* blank lines between actions are actions?

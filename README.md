# Jouvence (version 0.7)

[![Build Status](https://travis-ci.org/TypingFrog/jouvence.svg?branch=dev%2F0.7)](https://travis-ci.org/TypingFrog/jouvence)

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
  50 passing (136ms)
  1 pending
```

## TODO

* internationalization:
  * words which can start a heading
  * other ending than "TO:" for transitions
* blank lines between actions are actions?
* handle blocks (note and comments in every piece of the screenplay (only actions for now).
* scene number in scene heading
* add testing of blocks inside actions
* make some notification/callback methods optional
* make test for BrickAndSteel.fountain file


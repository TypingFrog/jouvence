# Jouvence

Javascript library to parse Fountain file. (SAX based evented streaming parser).

Fountain is a text format, similar to Markdown, but designed specifically
to write screenplays.

To quote from the [Fountain web site](http://fountain.io/):

    Fountain allows you to write screenplays in any text editor on any device. Because it’s just text, it’s portable and future-proof.

Jouvence is a node based, javascript library to read this kind of file:

* it is a streaming library: Jouvence doesn't read the entire instead of reading the entire file in memory and then parse it.
* it SAX based: Jouvence sends notification while it is parsing the content instead of providing a model of the content of Fountain document.

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


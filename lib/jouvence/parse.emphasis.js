(function() {
    "use strict";

    function parseEmphasis(line) {
        var part = {
            type: '.',
            parts: []
        };
        parsePart(line, 0, part);
        return part;
    }

    function parsePart(line, index0, part) {
        var i = index0;
        var length = line.length;
        var buffer = "";
        var delim = part.type;
        var hasDelim = (delim[0] !== '.');
        var result;

        function append(c) {
            buffer = buffer + c;
        }

        function next(delta) {
            if ((i + delta) < length) {
                return line.charAt(i + delta);
            }
            else {
                return '';
            }
        }

        function tryPart(type) {
            var newPart = {
                type: type,
                parts: []
            };
            var result = parsePart(line, i + type.length, newPart);
            if (result >= 0) {
                if (buffer.length > 0) {
                    part.parts.push({
                        type: '.',
                        text: buffer
                    });
                    buffer = "";
                }
                part.parts.push(newPart);
            }
            return result;

        }

        for (i = index0; i < length; i++) {
            var c = line.charAt(i);

            if (c === '\\') {
                append(next(1));
                i++;
                continue;
            }

            // check if we have a matching closing delimiter
            if (hasDelim && (c === delim[0])) {
                var match = true;
                for (var delta = 0; delta < delim.length; delta++) {
                    if (next(delta) !== delim[delta]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    // end of parse here as we have our match
                    part.parts.push({
                        type: '.',
                        text: buffer
                    });
                    buffer = "";
                    return i + delim.length - 1;
                }
            }

            if (c === '_') {
                result = tryPart("_");
                if (result < 0) {
                    append(c);
                }
                else {
                    i = result;
                }

            }
            else if (c === '*') {
                if (next(1) === '*') {
                    if (next(2) === '*') {
                        result = tryPart("***");
                        if (result < 0) {
                            append(c);
                        }
                        else {
                            i = result;
                        }

                    }
                    else {
                        result = tryPart("**");
                        if (result < 0) {
                            append(c);
                        }
                        else {
                            i = result;
                        }

                    }

                }
                else {
                    result = tryPart("*");
                    if (result < 0) {
                        append(c);
                    }
                    else {
                        i = result;
                    }

                }
            }
            else {
                append(c);
            }
        }

        // we could not find the closing delimiter
        if (hasDelim) {
            return -1;
        }

        if (buffer.length > 0) {
            part.parts.push({
                type: '.',
                text: buffer
            });
            buffer = "";
        }

        return i;
    }



    module.exports = parseEmphasis;
}());
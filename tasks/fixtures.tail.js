
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
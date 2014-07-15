uTransformers
=============

[![Build Status](https://travis-ci.org/uProxy/uTransformers.svg?branch=master)](https://travis-ci.org/uProxy/uTransformers) [![devDependency Status](https://david-dm.org/uProxy/uTransformers/dev-status.svg)](https://david-dm.org/uProxy/uTransformers#info=devDependencies)

uTransformers is a transport-layer obfuscation library for uProxy.

This library currently builds two uTransformers modules:

* **uTransformers.rabbit**: based on http://en.wikipedia.org/wiki/Rabbit_(cipher)
* **uTransformers.fte**: based on https://github.com/uproxy/libfte

See "Example Usage" below for more details.

Installation
------------

```bash
npm install uTransformers
```

Example Usage
-------------

### FTE

```javascript
var fte = require('uTransformers/src/transformers/uTransformers.fte.js');
var regex2dfa = require('regex2dfa/regex2dfa.js');

var transformer = new fte.Transformer();

var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
var ab_key = str2ab(key);
transformer.setKey(ab_key);

var json_obj = {
  'plaintext_dfa': regex2dfa.regex2dfa("^.+$"),
  'plaintext_max_len': 128,
  'ciphertext_dfa': regex2dfa.regex2dfa("^.+$"),
  'ciphertext_max_len': 128
};
        
var json_str = JSON.stringify(json_obj);
transformer.configure(json_str);

var input_plaintext = "Hello, World!";
var ab_plaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(ab_plaintext);
var ab_output_plaintext = transformer.restore(ciphertext);
var output_plaintext = ab2str(ab_output_plaintext);
```

### Rabbit

```javascript
var rabbit = require('uTransformers/src/transformers/uTransformers.rabbit.js');
var transformer = new rabbit.Transformer();

var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
var ab_key = str2ab(key);
transformer.setKey(ab_key);

var input_plaintext = "Hello, World!";
var ab_plaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(ab_plaintext);
var ab_output_plaintext = transformer.restore(ciphertext);
var output_plaintext = ab2str(ab_output_plaintext);
```

Building
--------

There are two stages to the build process:

* The first stage is the process of building ```uTransformers.fte.js``` and ```uTransformers.rabbit.js``` using emscripten. This is done in a vagrant virutal machine. See ```vagrant/README.md``` for details. To ease the build process, these artifacts are checked into git when the their cc files change.
* The second step of the build process runs jasmine tests with grunt. This produces artifacts in ```build/```. 

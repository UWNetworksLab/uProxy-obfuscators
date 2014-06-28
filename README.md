uTransformers
=============

[![Build Status](https://travis-ci.org/uProxy/uTransformers.svg?branch=master)](https://travis-ci.org/uProxy/uTransformers) [![devDependency Status](https://david-dm.org/uProxy/uTransformers/dev-status.svg)](https://david-dm.org/uProxy/uTransformers#info=devDependencies)

uTransformers is a transport-layer obfuscation library for uProxy.

This library currently builds two uTransformers modules:

* **uTransformers.rabbit**: based on http://en.wikipedia.org/wiki/Rabbit_(cipher)
* **uTransformers.fte**: based on https://github.com/uproxy/libfte

See "Example Usage" below for more details.

Example Usage
-------------

### FTE

Then one can invoke the FTE transformer as follows.

```javascript
var fte = require('uTransformers/transformers/uTransformers.fte.js');
var regex2dfa = require('regex2dfa/regex2dfa.js');

var transformer = new fte.Transformer();

var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
var ab_key = str2ab(key);
transformer.setKey(ab_key);
        
// The plaintext_dfa and ciphertext_dfa strings are AT&T-formatted DFAs.
// The plaintext_max_len and ciphertext_max_len are the largest strings
//   we'll encrypt/decrypt.
var json_obj = {
  'plaintext_dfa': regex2dfa("^.+$"),
  'plaintext_max_len': 128,
  'ciphertext_dfa': regex2dfa.regex2dfa("^.+$"),,
  'ciphertext_max_len': 128
        
var json_str = JSON.stringify(json_obj);
transformer.configure(json_str);

var ab_plaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(ab_plaintext);
var ab_output_plaintext = transformer.restore(ciphertext);
var output_plaintext = ab2str(ab_output_plaintext);
```

### Rabbit

Then one can invoke the Rabbit transformer as follows.

```javascript
var rabbit = require('uTransformers/transformers/uTransformers.rabbit.js');
var transformer = new rabbit.Transformer();

var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
var ab_key = str2ab(key);
transformer.setKey(ab_key);

var ab_plaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(ab_plaintext);
var ab_output_plaintext = transformer.restore(ciphertext);
var output_plaintext = ab2str(ab_output_plaintext);
```

Building
--------

See ```vagrant/README.md``` for details.

uProxy uTransformers
====================

The uProxy uTransformers layer provides resistance against large-scale DPI attempts to passively detect uProxy. This obfsucation layer does not protect against active adversaries, or adversaries that can throw expensive resources (such as people) at identifying connection properties.

This library builds two uTransformers modules:

* **rabbit**: based on http://en.wikipedia.org/wiki/Rabbit_(cipher)
* **fte**: based on https://github.com/uproxy/libfte

See "Example Usage" below for more details.

Dependencies
------------

* build tools: autoconf, automake, m4
* node.js: http://nodejs.org/
* emscripten: https://github.com/kripken/emscripten
* emscripten-fastcomp: https://github.com/kripken/emscripten-fastcomp
* emscripten-fastcomp-clang: https://github.com/kripken/emscripten-fastcomp-clang
* GMP: http://libgmp.org/
* libfte: https://github.com/uProxy/libfte

Compiling
---------

See ```vagrant/README.md``` for details.

Building formats for FTE
------------------------

If you wish to build formats for FTE.

```
make clean
```

Update ```src/fte_regexes.conf```, with one regex per line. Then:

```
make html/js/regex2dfa.js
```

Example Usage
-------------

### FTE

Include the following scripts on your page.

```html
<!-- Provides str2ab and ab2str functions. -->
<script src="js/common.js"></script>
<!-- Provides regex2dfa. -->
<script src="js/regex2dfa.js"></script>
<!-- Provides the emscripten-compiled FteTransformer. -->
<script src="js/utransformers.fte.js"></script>
```

Then one can invoke the FTE transformer as follows.

```javascript
var transformer = new fte.Transformer();

var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
transformer.setKey(ab_key);
        
// The plaintext_dfa and ciphertext_dfa strings are AT&T-formatted DFAs.
// The plaintext_max_len and ciphertext_max_len are the largest strings
//   we'll encrypt/decrypt.
var jsonObj = {
  'plaintext_dfa': regex2dfa("^.+$"),
  'plaintext_max_len': 128,
  'ciphertext_dfa': regex2dfa("^.+$"),,
  'ciphertext_max_len': 128
        
var json_str = JSON.stringify(jsonObj);
var ab_json_str = str2ab(json_str);
transformer.configure(ab_json_str);

var ab_plaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(ab_plaintext);
var ab_output_plaintext = transformer.restore(ciphertext);
var output_plaintext = ab2str(ab_output_plaintext);
```

### Rabbit

Include the following scripts on your page.

```html
<!-- Provides str2ab and ab2str functions. -->
<script src="js/common.js"></script>
<!-- Provides the emscripten-compiled RabbitTransformer. -->
<script src="js/utransformers.rabbit.js"></script>
```

Then one can invoke the Rabbit transformer as follows.

```javascript
var transformer = new rabbit.Transformer();

var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
transformer.setKey(ab_key);

var ab_plaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(ab_plaintext);
var ab_output_plaintext = transformer.restore(ciphertext);
var output_plaintext = ab2str(ab_output_plaintext);
```

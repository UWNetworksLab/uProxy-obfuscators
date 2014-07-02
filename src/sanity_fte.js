var regex2dfa = require('regex2dfa/regex2dfa.js');
var fte = require('uTransformers/src/transformers/uTransformers.fte.js');

describe("sanity_fte", function() {
  var input_plaintext = "Hello, World!";
  it("uTransformers.fte", function() {
    var transformer = new fte.Transformer();

    var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
    var ab_key = str2ab(key);
    transformer.setKey(ab_key);

    // The plaintext_dfa and ciphertext_dfa strings are AT&T-formatted DFAs.
    // The plaintext_max_len and ciphertext_max_len are the largest strings
    //   we'll encrypt/decrypt.
    var json_obj = {
      'plaintext_dfa': regex2dfa.regex2dfa("^.+$"),
      'plaintext_max_len': 128,
      'ciphertext_dfa': regex2dfa.regex2dfa("^.+$"),
      'ciphertext_max_len': 128
    };

    var json_str = JSON.stringify(json_obj);
    transformer.configure(json_str);

    var ab_plaintext = str2ab(input_plaintext);
    var ciphertext = transformer.transform(ab_plaintext);
    var ab_output_plaintext = transformer.restore(ciphertext);
    var output_plaintext = ab2str(ab_output_plaintext);
  });

});

var rabbit = require('utransformers/dist/utransformers.rabbit.js');

describe("sanity_rabbit", function() {
  var input_plaintext = "Hello, World!";

  it("uTransformers.rabbit", function() {
    var transformer = new rabbit.Transformer();

    var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
    var ab_key = str2ab(key);
    transformer.setKey(ab_key);

    var ab_plaintext = str2ab(input_plaintext);
    var ciphertext = transformer.transform(ab_plaintext);
    var ab_output_plaintext = transformer.restore(ciphertext);
    var output_plaintext = ab2str(ab_output_plaintext);
  });
});
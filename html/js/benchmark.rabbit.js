function do_rabbit_benchmark(plaintext_len) {
  var transformer = new rabbit.Transformer();

  var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
  var ab_key = str2ab(key);
  transformer.setKey(ab_key);

  var input_plaintext = "";
  for (var i = 0; i < plaintext_len; ++i) {
    input_plaintext += "x";
  }
  var ab_plaintext = str2ab(input_plaintext);
  var ciphertext = transformer.transform(ab_plaintext);
  var ab_output_plaintext = transformer.restore(ciphertext);
  var output_plaintext = ab2str(ab_output_plaintext);

  var success = (output_plaintext === input_plaintext);

  var trials = 100;
  var start = new Date().getTime();
  for (var i = 0; i < trials; i++) {
    transformer.transform(ab_plaintext);
  }
  var end = new Date().getTime();
  var elapsed = end - start;
  elapsed = elapsed / trials;
  transformer.dispose();


  return [success, elapsed];
}

function do_fte_benchmark(plaintext_regex, plaintext_max_len,
  ciphertext_regex, ciphertext_max_len) {

  var input_plaintext = "HelloWorld";

  var plaintext_dfa = regex2dfa(plaintext_regex);
  var ciphertext_dfa = regex2dfa(ciphertext_regex);

  var transformer = new fte.Transformer();

  var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
  var ab_key = str2ab(key);
  transformer.setKey(ab_key);

  var json_obj = {
    'plaintext_dfa': plaintext_dfa,
    'plaintext_max_len': plaintext_max_len,
    'ciphertext_dfa': ciphertext_dfa,
    'ciphertext_max_len': ciphertext_max_len
  };

  var json_str = JSON.stringify(json_obj);
  transformer.configure(json_str);

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

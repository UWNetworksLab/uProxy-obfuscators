function doBenchmark(plaintext_dfa, plaintext_max_len,
                     ciphertext_dfa, ciphertext_max_len,
                     key, input_plaintext) {

        var transformer = new Transformer();
        
        var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
        var ab_key = str2ab8(key);
        transformer.setKey(ab_key);

        var json_obj = {
            'plaintext_dfa': plaintext_dfa,
            'plaintext_max_len': plaintext_max_len,
            'ciphertext_dfa': ciphertext_dfa,
            'ciphertext_max_len': ciphertext_max_len
        };
        
        var json_str = JSON.stringify(json_obj);
        var ab_json_str = str2ab8(json_str);
        transformer.configure(ab_json_str);

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

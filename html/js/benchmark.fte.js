function doBenchmark(plaintext_dfa, plaintext_max_len,
    ciphertext_dfa, ciphertext_max_len,
    key, input_plaintext) {

    try {
        var key = new Uint8Array(16);
        for (var i = 0; i < 16; i++) {
            key[i] = 0xFF;
        }

        var transformer = new Transformer();
        
        var jsonObj = {
            'plaintext_dfa': plaintext_dfa,
            'plaintext_max_len': plaintext_max_len,
            'ciphertext_dfa': ciphertext_dfa,
            'ciphertext_max_len': ciphertext_max_len
        };
        
        var jsonStr = JSON.stringify(jsonObj);
        var abJsonStr = str2ab8(jsonStr);
        transformer.configure(abJsonStr);
        transformer.setKey(key);

        var abPlaintext = str2ab(input_plaintext);
        var ciphertext = transformer.transform(abPlaintext);
        var abOutputPlaintext = transformer.restore(ciphertext);
        var outputPlaintext = ab2str(abOutputPlaintext);

        var success = (outputPlaintext === input_plaintext);

        var trials = 100;
        var start = new Date().getTime();
        for (var i = 0; i < trials; i++) {
            transformer.transform(abPlaintext);
        }
        var end = new Date().getTime();
        var elapsed = end - start;
        elapsed = elapsed / trials;
    } catch (err) {
        alert(err);
    } finally {
        transformer.dispose();
    }
    transformer.dispose();


    return [success, elapsed];
}

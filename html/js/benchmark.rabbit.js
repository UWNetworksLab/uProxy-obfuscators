function doBenchmark(key, input_plaintext) {
        var transformer = new Transformer();

        var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
        var ab_key = str2ab8(key);
        transformer.setKey(ab_key);

        var abPlaintext = str2ab(input_plaintext);
        var ciphertext = transformer.transform(abPlaintext);
        transformer.setKey(key);
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
    transformer.dispose();


    return [success, elapsed];
}

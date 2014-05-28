function doBenchmark(key, input_plaintext) {
var success = true;
var elapsed = 0.1;
        var key = new Uint8Array(16);
        for (var i = 0; i < 16; i++) {
            key[i] = 0xFF;
        }

        var transformer = new Transformer();
        transformer.setKey(key);
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

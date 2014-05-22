// Utility function to convert Uint8Array to string.
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf.buffer));
}

// Utility function to convert string to Uint8Array.
function str2ab(str) {
    var buf = new Uint8Array(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf.buffer);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function str2ab8(str) {
    var buf = new Uint8Array(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf.buffer);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function doBenchmark(inputLanguage, inputMaxLen,
    outputLanguage, outputMaxLen,
    key, inputPlaintext) {

    try {
        var key = new Uint8Array(16);
        for (var i = 0; i < 16; i++) {
            key[i] = 0xFF;
        }

        var transformer = new FteTransformer();
        
        var jsonObj = {
            'input_dfa': inputLanguage,
            'input_max_len': inputMaxLen,
            'output_dfa': outputLanguage,
            'output_max_len': outputMaxLen
        };
        
        var jsonStr = JSON.stringify(jsonObj);
        var abJsonStr = str2ab8(jsonStr);
        transformer.configure(abJsonStr);
        transformer.setKey(key);

        var abPlaintext = str2ab(inputPlaintext);
        var ciphertext = transformer.transform(abPlaintext);
        var abOutputPlaintext = transformer.restore(ciphertext);
        var outputPlaintext = ab2str(abOutputPlaintext);

        var success = (outputPlaintext === inputPlaintext);

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

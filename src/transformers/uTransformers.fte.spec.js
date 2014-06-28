var fte = require('./uTransformers.fte.js');
var benchmarks = require('./benchmarks.js');
var regex2dfa = require('regex2dfa/regex2dfa.js');

var test_languages = [{
  'plaintext_regex': '^.+$',
  'plaintext_max_len': 128,
  'ciphertext_regex': '^.+$',
  'ciphertext_max_len': 128
}, {
  'plaintext_regex': '^.+$',
  'plaintext_max_len': 256,
  'ciphertext_regex': '^.+$',
  'ciphertext_max_len': 256
}, {
  'plaintext_regex': '^.+$',
  'plaintext_max_len': 512,
  'ciphertext_regex': '^.+$',
  'ciphertext_max_len': 512
}, {
  'plaintext_regex': '^.+$',
  'plaintext_max_len': 1024,
  'ciphertext_regex': '^.+$',
  'ciphertext_max_len': 1024 
}, {
  'plaintext_regex': '^.*$',
  'plaintext_max_len': 512,
  'ciphertext_regex': '^.*$',
  'ciphertext_max_len': 512
}, {
  'plaintext_regex': '^[a-zA-Z0-9]+$',
  'plaintext_max_len': 512,
  'ciphertext_regex': '^[a-zA-Z0-9]+$',
  'ciphertext_max_len': 512
}, {
  'plaintext_regex': '^.+$',
  'plaintext_max_len': 64,
  'ciphertext_regex': '^[a-zA-Z0-9]+$',
  'ciphertext_max_len': 512
}];

describe("uTransformers.fte", function() {
  it('basic', function() {
  for (var i = 0; i < test_languages.length; i++) {
    var plaintext_dfa = regex2dfa.regex2dfa(test_languages[i][
      'plaintext_regex'
    ]);
    var ciphertext_dfa = regex2dfa.regex2dfa(test_languages[i][
      'ciphertext_regex'
    ]);
    retval = benchmarks.do_fte_benchmark(plaintext_dfa,
      test_languages[i]['plaintext_max_len'],
      ciphertext_dfa,
      test_languages[i]['ciphertext_max_len']);
    var success = retval[0];
    expect(success).toBe(true);
  }
  });

  it('issue12', function () {
  // This test cases is in support of issue uProxy/uTransformers#12.
  //   link: https://github.com/uProxy/uTransformers/issues/12
  var transformer = new fte.Transformer();
  var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
  var ab_key = str2ab(key);
  transformer.setKey(ab_key);
  var json_obj = {
    'plaintext_dfa': regex2dfa.regex2dfa('^.+$'),
    'plaintext_max_len': 250,
    'ciphertext_dfa': regex2dfa.regex2dfa('^[a-zA-Z0-9]+$'),
    'ciphertext_max_len': 1000
  }
  var json_str = JSON.stringify(json_obj);
  transformer.configure(json_str);

  // These bytes were taken from a STUN message
  // that couldn't be recovered.
  var ab_plaintext = new Uint8Array([0x0, 0x3, 0x0, 0x64, 0x21, 0x12, 0xa4, 0x42,
    0x32, 0xef, 0x10, 0x97, 0x9, 0x3e, 0x8a, 0x86, 0x8c, 0x88, 0xbc, 0x63,
    0x0, 0x19, 0x0, 0x4, 0x11, 0x0, 0x0, 0x0, 0x0, 0xd, 0x0, 0x4, 0x0, 0x0,
    0x3, 0x20, 0x0, 0x18, 0x0, 0x1, 0x80, 0x0, 0x0, 0x0, 0x0, 0x6, 0x0, 0x4,
    0x74, 0x65, 0x73, 0x74, 0x0, 0x15, 0x0, 0x5, 0x6e, 0x6f, 0x6e, 0x63,
    0x65, 0x0, 0x0, 0x0, 0x0, 0x14, 0x0, 0x7, 0x6d, 0x79, 0x72, 0x65, 0x61,
    0x6c, 0x6d, 0x0, 0x0, 0x8, 0x0, 0x14, 0x3b, 0xb6, 0xe1, 0x22, 0x9d,
    0x51, 0x2a, 0x2d, 0x2f, 0x47, 0x9d, 0x4, 0x4c, 0x7d, 0x80, 0xf3, 0x32,
    0xc8, 0xae, 0x5a, 0x80, 0x28, 0x0, 0x4, 0x76, 0xe6, 0xfb, 0xd0, 0xee,
    0xff, 0x0, 0x8, 0x0, 0x1, 0xe8, 0x2a, 0x5e, 0x12, 0xa4, 0x43
  ]);
  var input_plaintext = ab2str(ab_plaintext);
  var ciphertext = transformer.transform(ab_plaintext);
  var ab_output_plaintext = transformer.restore(ciphertext);
  var output_plaintext = ab2str(ab_output_plaintext);

  expect(input_plaintext == output_plaintext).toBe(true);
  });
});

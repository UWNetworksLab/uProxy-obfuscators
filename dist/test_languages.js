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


if(typeof exports == 'undefined'){
    var exports = this['mymodule'] = {};
}

exports.test_languages = test_languages;

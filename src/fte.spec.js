// our npm packages
var regex2dfa = require('regex2dfa/regex2dfa.js');
var fte = require('utransformers/src/transformers/uTransformers.fte.js');

// our local helper files
var regexes = require('./regexes.js');
var udp_client = require('./udp_client.js')
var udp_server = require('./udp_server.js')


var fte_transformer = function () {
  this.init_transformer = function (plaintext_regex, plaintext_max_len, ciphertext_regex, ciphertext_max_len) {
    this.transformer_ = new fte.Transformer();

    var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
    var ab_key = str2ab(key);
    this.transformer_.setKey(ab_key);

    var json_obj = {
      'plaintext_dfa': regex2dfa.regex2dfa(plaintext_regex),
      'plaintext_max_len': plaintext_max_len,
      'ciphertext_dfa': regex2dfa.regex2dfa(ciphertext_regex),
      'ciphertext_max_len': ciphertext_max_len
    };

    var json_str = JSON.stringify(json_obj);
    this.transformer_.configure(json_str);

    return this.transformer_;
  }
}


describe("fte", function () {
  this.server_ = null;
  this.transformer_ = null;

  var regex_struct = regexes.regexes;
  for (var dpi_device in regex_struct) {
    for (var protocol in regex_struct[dpi_device]) {
      it(dpi_device + '.' + protocol, function () {

        // initialize transformer
        runs(function () {
          this.transformer_ = new fte_transformer();
          var plaintext_regex = "^.+$"; // default, allow any input
          var plaintext_max_len = 100;
          var ciphertext_regex = regex_struct[dpi_device][protocol];
          var ciphertext_max_len = 150;
          this.transformer_.init_transformer(plaintext_regex, plaintext_max_len, ciphertext_regex, ciphertext_max_len);

          this.server_ = new udp_server.udp_server();
          this.server_.start(this.transformer_);
        });


        waitsFor(function () {
          return this.server_.ready();
        });


        runs(function () {
          var dst = this.server_.address();
          this.plaintext = "Hello, World!";
          
          var client = new udp_client.udp_client();
          var localhost = '127.0.0.1';
          client.send_message(localhost, dst['port'], this.transformer_, this.plaintext);

        });


        waitsFor(function () {
          return (this.server_.message_received() == this.plaintext);
        });


        runs(function () {
          this.server_.stop();
        });
      });
    }
  }

});

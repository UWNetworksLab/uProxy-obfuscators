// our npm packages
var rabbit = require('utransformers/src/transformers/uTransformers.rabbit.js');

// our local helper files
var udp_client = require('./udp_client.js')
var udp_server = require('./udp_server.js')


var rabbit_transformer = function () {
  this.init_transformer = function () {
    this.transformer_ = new rabbit.Transformer();

    var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
    var ab_key = str2ab(key);
    this.transformer_.setKey(ab_key);

    return this.transformer_;
  }
}


describe("rabbit", function () {
  this.server_ = null;
  this.transformer_ = null;

      it("default", function () {

        runs(function () {
          this.transformer_ = new rabbit_transformer();
          this.transformer_.init_transformer();

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

});

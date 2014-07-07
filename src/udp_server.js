var dgram = require('dgram');

var utils = require('./utils.js');


var udp_server = function () {
  this.server_ = null;
  this.server_up_ = false;
  this.transformer = null;
  this.message_received_ = null;

  this.ready = function () {
    return this.server_.server_up_;
  }

  this.message_received = function () {
    return this.server_.message_received_;
  }

  this.start = function (transformer) {
    this.transformer = transformer;
    var server = dgram.createSocket("udp4");

    server.on("error", function (err) {
      console.log("server error:\n" + err.stack);
    });

    server.on("message", function (b_ciphertext, rinfo) {
      var ab_ciphertext = utils.toArrayBuffer(b_ciphertext);
      var ab_plaintext = transformer.transformer_.restore(ab_ciphertext);
      this.message_received_ = ab2str(ab_plaintext);
    });

    server.on("listening", function (err) {
      this.server_up_ = true;
    });

    server.bind(0); // bind to any open port

    this.server_ = server;
  }

  this.stop = function () {
    return this.server_.close();
  }

  this.address = function () {
    return this.server_.address();
  }
}

exports.udp_server = udp_server;
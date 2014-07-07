var dgram = require('dgram');

var utils = require('./utils.js');

var udp_client = function () {

  // send a udpv4 message to ip:port, using specified transformer
  this.send_message = function (ip, port, transformer, msg) {
    var client = dgram.createSocket("udp4");
    var message = str2ab(msg);
    var ciphertext = transformer.transformer_.transform(message);
    var datagram = utils.toBuffer(ciphertext);
    client.send(datagram, 0, datagram.length, port, ip,
      function () {
        client.close();
      });
  }

}

exports.udp_client = udp_client;
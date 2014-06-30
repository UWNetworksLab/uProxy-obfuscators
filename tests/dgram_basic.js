var dgram = require('dgram');

describe("dgram_basic", function() {
  var server_;
  var family_ = "udp4";
  var message_sent_ = "Some bytes";
  var message_received_ = "";

  beforeEach(function() {
    server_ = dgram.createSocket(family_);

    server_.on("error", function (err) {
      console.log("server error:\n" + err.stack);
      server_.close();
    });

    server_.on("message", function (msg, rinfo) {
      message_received_ = msg.toString();
      server_.close();
    });

    server_.bind(0); // bind to any open port
  });

  afterEach(function() {
    expect(message_sent_).toBe(message_received_);
  });

  it("no_transformations", function() {

    runs(function() {
      var client = dgram.createSocket(family_);
      var server_address = server_.address();
      var port = server_address['port'];
      var message = new Buffer(message_sent_);
      client.send(message, 0, message.length, port, '127.0.0.1', function () {
        client.close();
      });
    });

    waitsFor(function () {
      return (message_received_ != '');
    }, 1000);

  });
});

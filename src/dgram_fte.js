var dgram = require('dgram');
var fte = require('utransformers/dist/utransformers.fte.js');
var regex2dfa = require('regex2dfa/regex2dfa.js');

function toBuffer(ab) {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

describe("dgram_basic", function() {
  var client_ = null;
  var server_ = null;
  var transformer_ = null;
  var server_up_ = false;
  var family_ = "udp4";
  var message_sent_ = "Some bytes";
  var message_received_ = "";

  beforeEach(function() {
    server_ = dgram.createSocket(family_);

    server_.on("error", function(err) {
      console.log("server error:\n" + err.stack);
    });

    server_.on("message", function(b_ciphertext, rinfo) {
      var ab_ciphertext = toArrayBuffer(b_ciphertext);
      var ab_plaintext = transformer_.restore(ab_ciphertext);
      message_received_ = ab2str(ab_plaintext);
    });

    server_.on("listening", function(err) {
      server_up_ = true;
    });

    server_.bind(0); // bind to any open port

    transformer_ = new fte.Transformer();

    var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
    var ab_key = str2ab(key);
    transformer_.setKey(ab_key);

    // The plaintext_dfa and ciphertext_dfa strings are AT&T-formatted DFAs.
    // The plaintext_max_len and ciphertext_max_len are the largest strings
    //   we'll encrypt/decrypt.
    var json_obj = {
      'plaintext_dfa': regex2dfa.regex2dfa("^.+$"),
      'plaintext_max_len': 128,
      'ciphertext_dfa': regex2dfa.regex2dfa("^.+$"),
      'ciphertext_max_len': 128
    };

    var json_str = JSON.stringify(json_obj);
    transformer_.configure(json_str);
  });

  afterEach(function() {
    server_.close();
    expect(message_sent_).toBe(message_received_);
  });

  it("uTransformers.fte", function() {

    waitsFor(function() {
      return server_up_;
    });

    runs(function() {
      client_ = dgram.createSocket(family_);
      var server_address = server_.address();
      var port = server_address['port'];
      var message = str2ab(message_sent_);
      var ciphertext = transformer_.transform(message);
      var datagram = toBuffer(ciphertext);
      client_.send(datagram, 0, datagram.length, port, '127.0.0.1', function() {
        client_.close();
      });
    });

    waitsFor(function() {
      return (message_received_ != '');
    });

    waitsFor(function() {
      server_.unref();
      return true;
    });

  });
});
exports.str2ab = function(str) {
  var buf = new Uint8Array(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf.buffer);
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf.buffer;
}

exports.ab2str = function(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf.buffer));
}

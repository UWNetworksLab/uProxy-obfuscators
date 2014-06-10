// Utility function to convert ArrayBuffer to string.
// The function has limitation, it won't convert non-ascii utf8 or
// utf16 binary representation to readable string. 
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// Utility function to convert string to ArrayBuffer.
// This function can only deal with ascii character.
function str2ab(str) {
  var buf = new Uint8Array(str.length);
  var bufView = new Uint8Array(buf.buffer);
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf.buffer;
}

if (typeof exports == 'undefined') {
  var exports = {};
}

exports.ab2str = ab2str;
exports.str2ab = str2ab;

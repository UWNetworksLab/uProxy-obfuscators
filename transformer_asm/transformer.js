
var Transformer = (function() {
  var IV_SIZE = 8;

  var create_transformer = Module.cwrap('create_transformer', 'number', []);
  var Transformer = function() {
    this.handle = create_transformer();
  };

  var set_key = Module.cwrap('set_key', 'number',
                             ['number', 'number', 'number']);

  // key : Uint8Array
  Transformer.prototype.setKey = function(key) {
    var ptr = Module._malloc(key.byteLength);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, ptr, key.byteLength);
    dataHeap.set(key);
    var ret = set_key(this.handle, dataHeap.byteOffset, key.byteLength);
    Module._free(dataHeap.byteOffset);
    return ret;
  };

  var transform = Module.cwrap('transform', 'number',
                               ['number', 'number', 'number', 'number', 'number']);

  // plain_text : Uint8Array
  Transformer.prototype.transform = function(plain_text) {
    var len = plain_text.byteLength;
    var ptr = Module._malloc(len);
    var dataHeap1 = new Uint8Array(Module.HEAPU8.buffer, ptr, len);
    dataHeap1.set(new Uint8Array(plain_text.buffer));

    ptr = Module._malloc(len + IV_SIZE);
    var dataHeap2 = new Uint8Array(Module.HEAPU8.buffer, ptr, len + IV_SIZE);

    ptr = Module._malloc(4);
    var dataHeap3 = new Uint8Array(Module.HEAPU8.buffer, ptr, 4);
    var data = new Uint32Array([plain_text.byteLength + IV_SIZE]);
    dataHeap3.set(new Uint8Array(data.buffer));

    var ret = transform(this.handle,
                        dataHeap1.byteOffset, plain_text.byteLength,
                        dataHeap2.byteOffset, dataHeap3.byteOffset);
    if (ret != 0) {
      return null;
    }
    var length = (new Uint32Array(dataHeap3.buffer, dataHeap3.byteOffset, 4))[0];
    var result = new Uint8Array(length);
    result.set(new Uint8Array(dataHeap2.buffer, dataHeap2.byteOffset, length));

    Module._free(dataHeap1.byteOffset);
    Module._free(dataHeap2.byteOffset);
    Module._free(dataHeap3.byteOffset);
    return result;
  }

  // cipher_text: Uint8Array
  Transformer.prototype.restore = function(cipher_text) {
    var restore = Module.cwrap('restore', 'number',
                                 ['number', 'number', 'number', 'number', 'number']);
    var len = cipher_text.byteLength;
    var ptr = Module._malloc(len);
    var dataHeap1 = new Uint8Array(Module.HEAPU8.buffer, ptr, len);
    dataHeap1.set(new Uint8Array(cipher_text.buffer, 0, len));

    ptr = Module._malloc(len);
    var dataHeap2 = new Uint8Array(Module.HEAPU8.buffer, ptr, len);

    ptr = Module._malloc(4);
    var dataHeap3 = new Uint8Array(Module.HEAPU8.buffer, ptr, 4);
    var data = new Uint32Array([len]);
    dataHeap3.set(new Uint8Array(data.buffer));

    var ret = restore(this.handle,
                      dataHeap1.byteOffset, cipher_text.byteLength,
                      dataHeap2.byteOffset, dataHeap3.byteOffset);
    if (ret != 0) {
      return null;
    }
    var length = (new Uint32Array(dataHeap3.buffer, dataHeap3.byteOffset, 4))[0];
    var result = new Uint8Array(length);
    result.set(new Uint8Array(dataHeap2.buffer, dataHeap2.byteOffset, length));
    Module._free(dataHeap1.byteOffset);
    Module._free(dataHeap2.byteOffset);
    Module._free(dataHeap3.byteOffset);
    return result;
  };

  return Transformer;
}());





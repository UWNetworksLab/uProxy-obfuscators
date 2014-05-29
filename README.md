uProxy obfuscation
==================

[summary]

Dependencies
------------

### Required for building/testing

* libfte: https://github.com/uProxy/libfte
* emscripten: https://github.com/kripken/emscripten
* vagrant: https://vagrantup.com/
* ubuntu vagrant image: https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-i386-vagrant-disk1.box


### Libraries Included

* rapidjson: https://code.google.com/p/rapidjson/


Building
--------

A vagrant script is provided that builds the 

### Add an Ubuntu 14.04 32-bit vagrant box

```shell
vagrant box add ubuntu-14.04-i386 https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-i386-vagrant-disk1.box
```

### Install the vagrant vbguest plugin

```shell
vagrant plugin install vagrant-vbguest
```

### Start the vagrant script

```
cd vagrant 
vagrant up
```

wait roughly 1-2 hours, then

```shell
$ ls build/html/
benchmark.fte.html  benchmark.rabbit.html  js
$ ls build/html/js/
benchmark.data.js  benchmark.fte.js  benchmark.rabbit.js  common.js  transformer.js transformer.fte.js transformer.rabbit.js
```

Example Usage
-------------

### FTE

```html
<script src="js/common.js"></script>
<script src="js/transformer.fte.js"></script>
<script src="js/transformer.js"></script>
```

```javascript
var transformer = new Transformer();

var key = new Uint8Array(16);
for (var i = 0; i < 16; i++) {
  key[i] = 0xFF;
}
transformer.setKey(key);
        
var jsonObj = {
  'plaintext_dfa': plaintext_dfa,
  'plaintext_max_len': plaintext_max_len,
  'ciphertext_dfa': ciphertext_dfa,
  'ciphertext_max_len': ciphertext_max_len
};
        
var jsonStr = JSON.stringify(jsonObj);
var abJsonStr = str2ab8(jsonStr);
transformer.configure(abJsonStr);

var abPlaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(abPlaintext);
var abOutputPlaintext = transformer.restore(ciphertext);
var outputPlaintext = ab2str(abOutputPlaintext);
```

### Rabbit

```html
<script src="js/common.js"></script>
<script src="js/transformer.rabbit.js"></script>
<script src="js/transformer.js"></script>
```

```javascript
var transformer = new Transformer();

var key = new Uint8Array(16);
for (var i = 0; i < 16; i++) {
  key[i] = 0xFF;
}
transformer.setKey(key);

var abPlaintext = str2ab(input_plaintext);
var ciphertext = transformer.transform(abPlaintext);
var abOutputPlaintext = transformer.restore(ciphertext);
var outputPlaintext = ab2str(abOutputPlaintext);
```

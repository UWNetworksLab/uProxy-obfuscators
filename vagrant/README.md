Building uTransformers
======================

Dependencies
------------

* build tools: autoconf, automake, m4
* node.js: http://nodejs.org/
* emscripten: https://github.com/kripken/emscripten
* clang: http://clang.llvm.org/
* GMP: http://libgmp.org/
* libfte: https://github.com/uProxy/libfte

Building
--------

### Required software 

* Vagrant: https://vagrantup.com/
* Ubuntu Vagrant image: https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-i386-vagrant-disk1.box

### Add an Ubuntu 14.04 32-bit vagrant box

```shell
vagrant box add ubuntu-14.04-i386 https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-i386-vagrant-disk1.box
```

### Install the vagrant vbguest plugin

```shell
vagrant plugin install vagrant-vbguest
```

### Run the vagrant script

```
cd vagrant 
vagrant up
```

This will produce a directory ```uTransformers``` in vagrant. In this directory ```npm publish``` can be executed to update uTransformers on npm. There is also a ```demo``` directory with a simple HTML page that can be run to evaluate the performance of the uTransformers.

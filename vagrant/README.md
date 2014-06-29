Building uTransformers
======================

This directory contains a vagrant-powered build environment for uTransformers.

Once you have vagrant and a 32-bit vagrant Linux VM installed named ```ubuntu-14.04-i386``` you can type ```vagrant up``` in this directory and it will kick off the full build process. The result of this build process is a directory in ```vagrant/uTransformers``` with a fully-build version of this software.

### Why use vagrant?

* Building uTransformers currently does not work on 64-bit systems. Specifically, GMP does not build. 
* Emscripten requires a lot of special flags, and changes to the software in order to get all uTransformers dependencies to build correclty.
* Reproducibility.

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

This will produce a directory ```uTransformers``` in ```vagrant```. In ```vagrant/uTransformers``` ```npm publish``` can be executed to update uTransformers on npm. There is also a ```uTransformers/demo``` directory with a simple HTML page that can be run to evaluate the performance of the uTransformers.

Testing
-------

There are two ways to test uTransformers:

* *Command line:* run ```grunt clean && grunt build && grunt test``` in the generated ```vagrant/uTransformers``` directory.
* *Browser:* open ```demo/html/benchmarks.html``` in your browser. Success is when all rows in all tables are green.

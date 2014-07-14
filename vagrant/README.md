Building uTransformers
======================

This directory contains a vagrant-powered build environment for uTransformers.

Once you have vagrant and a 32-bit vagrant Linux VM installed named ```ubuntu-14.04-i386``` you can type ```vagrant up``` in this directory to start the build process. The product of this build process is the directory ```vagrant/uTransformers```.

### Why use vagrant?

* Building uTransformers is difficult on 64-bit systems. Specifically, GMP does not successfully compile on 64-bit systems with emscripten. This requires further investigation.
* Emscripten requires special hacks. As an example, we have to build everything from source, and we have to have special compile/configure flags for all dependencies. 
* Vagrant makes it easy to document and reproduce the build process.

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

Doing a release
---------------

* Check-in all changes to uTransformers.
* Ensure all ```*_VERSION``` variables in ```uTransformers/vagrant/set_env.sh``` are correct.
* Update ```UTRANSFORMERS_VERSION``` in ```uTransformers/vagrant/set_env.sh``` to ```master```.
* Do the uTransformers build as described above, which will generate ```vagrant/uTransformers```.
* Update the version number in ```vagrant/uTransformers/package.json```.
* In the generated directory in ```vagrant/uTransformers``` commit ```src/transformers/uTransformers.*.js``` and ```package.json```.
* Run ```npm publish``` in ```vagrant/uTransformers```.
* Update ```UTRANSFORMERS_VERSION``` in ```uTransformers/vagrant/set_env.sh``` to the latest version and commit.

Testing
-------

There are two ways to test uTransformers:

* *Command line:* run ```grunt clean && grunt build && grunt test``` in the generated ```vagrant/uTransformers``` directory.
* *Browser:* open ```demo/html/benchmarks.html``` in your browser. If all rows in all tables are green, then you have success.

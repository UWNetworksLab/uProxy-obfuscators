Building uProxy obfuscation
===========================

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

wait roughly 10 minutes, then

```shell
$ ls build/
demo transformer.fte.js transformer.rabbit.js
```

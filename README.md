uTransformers Integration Tests
-------------------------------

[![Build Status](https://travis-ci.org/uProxy/uTransformers.svg?branch=integration-tests)](https://travis-ci.org/uProxy/uTransformers)
[![devDependency Status](https://david-dm.org/uProxy/turn-relay/dev-status.svg?branch=integration-tests)](https://david-dm.org/uProxy/turn-relay#info=devDependencies)

### Overview

This branch contains integration tests for uTransformers. Specifically, the goal is to test that uTransformers works under a range of configurations.

For each test, a UDP client and server are spawned. A message is transformed, sent to the server, then restored by the server. The test passes iff the plaintext can be recovered.

For the regular expressions used in the libfte tests, see ```src/regexes.js```.

### Running the tests

```console
$ npm install
...
$ grunt test
Running "jasmine_node:all" (jasmine_node) task

fte
    l7.bittorrent
    l7.dns
    l7.ntp
    l7.skypeout
    l7.skypetoskype
    l7.whois
    appid.bittorrent
    appid.ntp
    appid.rip
    appid.sip

rabbit
    default

Finished in 47.566 seconds
11 tests, 0 assertions, 0 failures



Done, without errors.
```

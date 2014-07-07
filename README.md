uTransformers Integration Tests
-------------------------------

[![Build Status](https://travis-ci.org/uProxy/uTransformers.svg?branch=integration-tests)](https://travis-ci.org/uProxy/uTransformers)
[![devDependency Status](https://david-dm.org/uProxy/turn-relay/dev-status.svg?branch=integration-tests)](https://david-dm.org/uProxy/turn-relay#info=devDependencies)

This branch contains integration tests for uTransformers.

### Running the tests

```bash
$ npm install
npm http GET https://registry.npmjs.org/regex2dfa
npm http GET https://registry.npmjs.org/uproxy-build-tools
...
├── findup-sync@0.1.3 (glob@3.2.11, lodash@2.4.1)
├── js-yaml@2.0.5 (esprima@1.0.4, argparse@0.1.15)
└── grunt-legacy-log@0.1.1 (underscore.string@2.3.3, lodash@2.4.1)

regex2dfa@0.1.5-1 node_modules/regex2dfa
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

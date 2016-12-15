# events-emitter

events-emitter

[![npm version](https://badge.fury.io/js/events-emitter.png)](https://badge.fury.io/js/events-emitter)
[![build status](https://travis-ci.org/twobin/events-emitter.svg)](https://travis-ci.org/twobin/events-emitter)
[![npm downloads](https://img.shields.io/npm/dt/events-emitter.svg?style=flat-square)](https://www.npmjs.com/package/events-emitter)

## usage

```
$ npm i -S events-emitter
```

## docs

### eventCenter

```
import { eventCenter } from 'events-emitter';

eventCenter.emit('event', { value: 1 });

eventCenter.on('event', this.handleEvent);
```

# event-emitter

event-emitter

[![npm version](https://badge.fury.io/js/event-emitter.png)](https://badge.fury.io/js/event-emitter)
[![build status](https://travis-ci.org/twobin/event-emitter.svg)](https://travis-ci.org/twobin/event-emitter)
[![npm downloads](https://img.shields.io/npm/dt/event-emitter.svg?style=flat-square)](https://www.npmjs.com/package/event-emitter)

## usage

```
$ npm i -S event-emitter
```

## docs

### eventCenter

```
import { eventCenter } from 'event-emitter';

eventCenter.emit('event', { value: 1 });

eventCenter.on('event', this.handleEvent);
```

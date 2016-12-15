/**
 * 一个简易的 log 方法，根据环境判断是否将错误、警告等输出到 console 中
 */
const IS_DEV = typeof process === 'object' ?
  process.env.NODE_ENV === 'development' :
  true; // 若读不到 process 中的信息，默认不输出日志

const logger = {};

function createLog(type) {
  if (IS_DEV || (typeof window === 'object' && typeof console === 'object' && console &&
    (window.location.search.indexOf('useDebug') > -1 || window.location.search.indexOf('forceLog') > -1)
  )) {
    return typeof console[type] === 'function' ?
      console[type].bind(console) :
      () => {};
  }
  return () => {};
}

['warn', 'info', 'log', 'trace', 'error'].forEach(method => {
  logger[method] = createLog(method);
});

/**
 * functional
 */
const PREFIX = '#{';
const SUFFIX = '}';

function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]';
};

function capitalizeFirstLetter(str) {
  const input = isString(str) ? str : str.toString();

  return `${input[0].toUpperCase()}${input.slice(1)}`;
};

function isFunction(arg) {
  return typeof arg === 'function';
};

function isNumber(arg) {
  return typeof arg === 'number';
};

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
};

function isUndefined(arg) {
  return arg === void 0;
};

function isNull(arg) {
  return arg === null;
};

function isEmpty(arg) {
  return isUndefined(arg) || isNull(arg);
};

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};

function stopPolling(stopFn) {
  if (isArray(stopFn) && stopFn.length) {
    for (let i = 0, len = stopFn.length; i < len; i++) {
      if (isFunction(stopFn[i])) {
        stopFn[i]();
      }
    }

    return true;
  } else if (isFunction(stopFn)) {
    stopFn();

    return true;
  }

  return false;
};

function isEqualSingleLevelTabCode(str1, str2) {
  if (!str1 && !str2) { return true; }
  if ((str1 && !str2) || (!str1 && str2)) { return false; }
  if (str1.length !== str2.length) { return false; }

  const arr1 = str1.split(',');
  const arr2 = str2.split(',');

  if (arr1.length !== arr2.length) { return false; }

  for (let i = 0, len = arr1.length; i < len; i++) {
    if (arr2.indexOf(arr1[i]) < 0) {
      return false;
    }
  }

  return true;
};

function isContainSingleLevelTabCode(str1, str2) {
  if (str1 === str2) { return true; }
  if (!str1 && !str2) { return true; }
  if (str1 && !str2) { return true; }
  if (!str1 && str2) { return false; }

  const arr1 = str1.split(',');
  const arr2 = str2.split(',');

  if (arr1.length < arr2.length) { return false; }

  for (let i = 0, len = arr2.length; i < len; i++) {
    if (arr1.indexOf(arr2[i]) < 0) {
      return false;
    }
  }

  return true;
};
/**
 * 判断两个tabCode是否相同，需要忽略同一级下code的顺序， 即 a,b>c,d和b,a>c,d为同一code
 * @param  {String} str1 一个tabCode，格式为: a,b>c,d
 * @param  {String} str2 一个tabCode，格式为: a,b>c,d
 * @return {Boolean}     两个tabCode是否相等
 */
function isEqualTabCode(str1, str2) {
  if (str1 === str2) { return true; }
  if (!str1 && !str2) { return true; }
  if ((str1 && !str2) || (!str1 && str2)) { return false; }
  if (str1.length !== str2.length) { return false; }

  const arr1 = str1.split('>');
  const arr2 = str2.split('>');

  if (arr1.length !== arr2.length) { return false; }

  for (let i = 0, len = arr1.length; i < len; i++) {
    if (!isEqualSingleLevelTabCode(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
};

/**
 * 判断某个tabCode是否包含另一个tabCode
 * @param  {String} str1 一个tabCode，格式为: a,b>c,d
 * @param  {String} str2 一个tabCode，格式为: a,b
 * @return {Boolean}     str1是否包含str2
 */
function isContainTabCode(str1, str2) {
  if (str1 === str2) { return true; }
  if (!str1 && !str2) { return true; }
  if (str1 && !str2) { return true; }
  if (!str1 && str2) { return false; }

  const arr1 = str1.split('>');
  const arr2 = str2.split('>');

  if (arr1.length < arr2.length) { return false; }

  for (let i = arr2.length - 1; i >= 0; i--) {
    if (!isContainSingleLevelTabCode(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
};

function hasIntersection(arr1, arr2) {
  if (!arr1 || !arr1.length || !arr2 || !arr2.length) { return false; }
  let source;
  let target;

  if (arr1.length < arr2.length) {
    source = arr1;
    target = arr2;
  } else {
    source = arr2;
    target = arr1;
  }

  for (let i = 0, len = source.length; i < len; i++) {
    if (target.indexOf(source[i]) >= 0) {
      return true;
    }
  }

  return false;
};

function getNewTabCode(tabCode, nextState, target) {
  if (!tabCode || !nextState || !target) { return tabCode; }

  const keys = Object.keys(nextState);
  let newTabCode = tabCode;

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];

    if (target[key] && target[key].isTab) {
      const index = newTabCode.indexOf(key);

      if (index >= 0) {
        const sepIndex1 = newTabCode.indexOf('>', index + 1);
        const sepIndex2 = newTabCode.indexOf(',', index + 1);
        const sepIndex = sepIndex1 >= 0 && sepIndex2 >= 0 ?
          Math.min(sepIndex1, sepIndex2) :
          Math.max(sepIndex1, sepIndex2);
        const originStr = newTabCode.slice(index, sepIndex > index ? sepIndex : newTabCode.length);
        const newStr = `${key}=${nextState[key] || ''}`;

        newTabCode = newTabCode.replace(originStr, newStr);
      }
    }
  }

  return newTabCode;
};

function getValue(obj, path, defaultValue) {
  if (!isObject(obj) || !path) { return defaultValue; }

  return isEmpty(obj[path]) ? defaultValue : obj[path];
};

function parseString(str, obj) {
  if (!str || !isString(str)) { return str; }
  const len = str.length;
  let startIndex = str.indexOf(PREFIX);
  let result = str;

  while (startIndex < len && startIndex >= 0) {
    const endIndex = str.indexOf(SUFFIX, startIndex + 1);

    if (endIndex >= 0) {
      const subStr = str.substring(startIndex, endIndex + 1);
      const key = str.substring(startIndex + 2, endIndex);
      const value = getValue(obj, key, '');

      result = result.replace(subStr, value);

      startIndex = str.indexOf(PREFIX, endIndex + 1);
    } else {
      break;
    }
  }

  return result;
};

function runHandler(context, handler, args) {
  if (!context || !isFunction(handler) || !args || !args.length) { return false; }

  switch (args.length) {
    // fast cases
    case 1:
      handler.call(context);
      break;
    case 2:
      handler.call(context, args[1]);
      break;
    case 3:
      handler.call(context, args[1], args[2]);
      break;
    // slower
    default:
      handler.apply(context, Array.prototype.slice.call(args, 1));
      break;
  }

  return true;
}

export default class EventEmitter {
  // 超过 10 个 listeners 时会有 warning，防止内存泄漏
  static defaultMaxListeners = 10;

  events = undefined;
  maxListeners = undefined;
  // 通过缓存解决（事件触发和捕获）异步的情况
  eventsCache = undefined;

  // 手动增加 listeners 的上限个数
  setMaxListeners(n) {
    if (!isNumber(n) || n < 0 || isNaN(n)) {
      throw TypeError('n must be a positive number');
    }

    this.maxListeners = n;

    return this;
  }

  emit(...args) {
    if (!this.events) { this.events = {}; }
    if (!this.eventsCache) { this.eventsCache = {}; }

    const type = args[0];
    // 如果没有 'error' event listener 则 throw.
    if (type === 'error') {
      if (!this.events.error ||
          (isObject(this.events.error) && !this.events.error.length)) {
        const er = args[1];

        if (er instanceof Error) {
          // 没有绑定 'error' event
          throw er;
        } else {
          // 一些上下文信息
          const err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
      }
    }

    // 缓存事件触发的参数
    this.eventsCache[type] = args;

    const handler = this.events[type];
    if (isUndefined(handler)) { return false; }

    if (isFunction(handler)) {
      runHandler(this, handler, args);
    } else if (isObject(handler)) {
      const listeners = handler.slice();
      const len = listeners.length;

      for (let i = 0; i < len; i++) {
        runHandler(this, listeners[i], args);
      }
    }

    return true;
  }

  on(type, listener) {
    if (!isFunction(listener)) {
      throw TypeError('listener must be a function');
    }

    if (!this.events) {
      this.events = {};
    }

    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this.events.newListener) {
      this.emit('newListener', type,
        isFunction(listener.listener) ? listener.listener : listener
      );
    }

    if (!this.events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this.events[type] = listener;
    } else if (isObject(this.events[type])) {
      // If we've already got an array, just append.
      this.events[type].push(listener);
    } else {
      // Adding the second element, need to change to array.
      this.events[type] = [this.events[type], listener];
    }

    // Check for listener leak
    if (isObject(this.events[type]) && !this.events[type].warned) {
      let m;
      if (!isUndefined(this.maxListeners)) {
        m = this.maxListeners;
      } else {
        m = EventEmitter.defaultMaxListeners;
      }

      if (m && m > 0 && this.events[type].length > m) {
        this.events[type].warned = true;
        logger.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this.events[type].length);
        if (typeof logger.trace === 'function') {
          // not supported in IE 10
          logger.trace();
        }
      }
    }

    if (this.eventsCache && this.eventsCache[type]) {
      runHandler(this, listener, this.eventsCache[type]);
    }

    return this;
  }

  once(...args) {
    const type = args[0];
    const listener = args[1];
    if (!isFunction(listener)) {
      throw TypeError('listener must be a function');
    }

    let fired = false;

    function g() {
      this.removeListener(type, g);

      if (!fired) {
        fired = true;
        listener.apply(this, args);
      }
    }

    g.listener = listener;
    this.on(type, g);

    return this;
  }

  // emits a 'removeListener' event if the listener was removed
  removeListener(type, listener) {
    if (!isFunction(listener)) {
      throw TypeError('listener must be a function');
    }

    if (!this.events || !this.events[type]) {
      return this;
    }

    const list = this.events[type];
    const length = list.length;
    let position = -1;

    if (list === listener || (isFunction(list.listener) &&
      list.listener === listener)) {
      if (this.events) {
        delete this.events[type];
      }

      if (this.eventsCache) {
        delete this.eventsCache[type];
      }

      if (this.events.removeListener) {
        this.emit('removeListener', type, listener);
      }
    } else if (isObject(list)) {
      for (let i = length; i-- > 0;) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }

      if (position < 0) { return this; }

      if (list.length === 1) {
        list.length = 0;

        if (this.events) {
          delete this.events[type];
        }

        if (this.eventsCache) {
          delete this.eventsCache[type];
        }
      } else {
        list.splice(position, 1);
      }

      if (this.events.removeListener) {
        this.emit('removeListener', type, listener);
      }
    }

    return this;
  }

  removeAllListeners(...args) {
    if (!this.events) { return this; }

    // not listening for removeListener, no need to emit
    if (!this.events.removeListener) {
      if (args.length === 0) {
        this.events = {};
      } else {
        if (this.events[args[0]]) {
          delete this.events[args[0]];
        }

        if (this.eventsCache && this.eventsCache[args[0]]) {
          delete this.eventsCache[args[0]];
        }
      }

      return this;
    }

    // emit removeListener for all listeners on all events
    if (args.length === 0) {
      const keys = Object.keys(this.events);

      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];

        if (key === 'removeListener') { continue; }

        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this.events = {};
      this.eventsCache = {};
      return this;
    }
    const type = args[0];
    const listeners = this.events[type];

    if (isFunction(listeners)) {
      this.removeListener(type, listeners);
    } else if (listeners) {
      // LIFO order
      while (listeners.length) {
        this.removeListener(type, listeners[listeners.length - 1]);
      }
    }

    if (this.events[type]) {
      delete this.events[type];
    }
    if (this.eventsCache && this.eventsCache[type]) {
      delete this.eventsCache[type];
    }

    return this;
  }

  listeners(type) {
    if (!this.events || !this.events[type]) {
      return [];
    } else if (isFunction(this.events[type])) {
      return [this.events[type]];
    }


    return this.events[type].slice();
  }

  listenerCount(type) {
    if (this.events) {
      const evlistener = this.events[type];

      if (isFunction(evlistener)) {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }
}

export const eventCenter = new EventEmitter();
eventCenter.setMaxListeners(40);

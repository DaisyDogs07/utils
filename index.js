const utils = {
  DateUtils: (function DateUtils() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function parseDate(isoDate = new Date().toISOString(), offset = 0) {
      if (isoDate instanceof Date)
        isoDate = isoDate.toISOString();
      if (typeof isoDate === 'number')
        isoDate = new Date(isoDate).toISOString();
      if (offset)
        isoDate = new Date(new Date(isoDate).getTime() + (36e5 * offset)).toISOString();
      const date = isoDate.split('T')[0].split('-'),
        time = isoDate.split('T')[1].replace('Z', '').split(':'),
        amOrPm = +time[0] >= 12 ? 'PM' : 'AM',
        hour = (amOrPm === 'AM' ? +time[0] : time[0] - 12) || 12;
      return `${months[date[1] - 1]} ${date[2]}, ${date[0]} ${hour}:${time[1]}:${time[2]} ${amOrPm}`;
    }

    return {
      parseDate
    };
  })(),
  FunctionUtils: (function FunctionUtils() {
    const {
      apply,
      bind,
      call
    } = Function.prototype;

    return {
      applyBind: bind.bind(apply),
      uncurryThis: bind.bind(call)
    };
  })(),
  MathUtils: (function MathUtils() {
    function average() {
      let avg = 0;
      if (Array.isArray(arguments[0])) {
        for (let i = 0; i < arguments[0].length; i++)
          avg += arguments[0][i];
        return avg / arguments[0].length;
      }
      for (let i = 0; i < arguments.length; i++)
        avg += arguments[i];
      return avg / arguments.length;
    }

    function clamp(value, min = 0, max = 1) {
      if (value < min)
        return min;
      if (value > max)
        return max;
      return value;
    }

    function distance() {
      let dist = 0;
      if (Array.isArray(arguments[0]) &&
          Array.isArray(arguments[1])) {
        for (let i = 0; i < arguments[0].length && i < arguments[1].length; i++)
          dist += (arguments[0][i] - arguments[1][i]) ** 2;
        return dist ** 0.5;
      }
      for (let i = 1; i < arguments.length; i += 2)
        dist += (arguments[i - 1] - arguments[i]) ** 2;
      return dist ** 0.5;
    }

    function lerp(min, max, t = 0) {
      return t * (max - min) + min;
    }

    function normalize(value, min = 0, max = 1) {
      return (value - min) / (max - min);
    }

    return {
      average,
      clamp,
      distance,
      lerp,
      normalize
    };
  })(),
  NumberUtils: (function NumberUtils() {
    function numberWithCommas(num = 0) {
      const arr = num.toString().split('.');
      arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return arr.join('.');
    }

    function random(min = 0, max = 1) {
      return Math.random() * (max - min) + min;
    }

    return {
      numberWithCommas,
      random
    };
  })(),
  ObjectUtils: (function ObjectUtils() {
    // This function works best with plain objects
    function clone(obj) {
      const objClone = {},
        objProps = [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)],
        length = objProps.length,
        proto = Object.getPrototypeOf(obj);
      if (proto !== null)
        Object.setPrototypeOf(objClone, clone(proto));
      for (let i = 0; i < length; i++)
        Object.defineProperty(objClone, objProps[i], Object.getOwnPropertyDescriptor(obj, objProps[i]));
      return objClone;
    }

    function getProperties(obj) {
      const properties = [];
      if (obj !== undefined)
        for (let i = obj; i !== null; i = Object.getPrototypeOf(i))
          properties.push(
            ...Object.getOwnPropertyNames(i).filter(v => !properties.includes(v)),
            ...Object.getOwnPropertySymbols(i).filter(v => !properties.includes(v))
          );
      return properties;
    }

    function getPropertyDescriptor(obj, prop) {
      if (obj !== undefined)
        for (let i = obj; i !== null; i = Object.getPrototypeOf(i))
          if (i.hasOwnProperty(prop))
            return Object.getOwnPropertyDescriptor(i, prop);
    }

    function getPropertyNames(obj) {
      const names = [];
      if (obj !== undefined)
        for (let i = obj; i !== null; i = Object.getPrototypeOf(i))
          names.push(...Object.getOwnPropertyNames(i).filter(v => !names.includes(v)));
      return names;
    }

    function getPropertySymbols(obj) {
      const symbols = [];
      if (obj !== undefined)
        for (let i = obj; i !== null; i = Object.getPrototypeOf(i))
          symbols.push(...Object.getOwnPropertySymbols(i).filter(v => !symbols.includes(v)));
      return symbols;
    }

    function getPrototypeChain(obj) {
      const chain = [];
      if (obj !== undefined)
        for (let i = obj; i !== null; i = Object.getPrototypeOf(i))
          chain[chain.length] = i.hasOwnProperty('constructor')
            ? i.constructor.name
            : typeof i === 'function'
              ? i.name
              : undefined;
      return chain;
    }

    function hasProperty(obj, prop) {
      if (obj !== undefined)
        for (let i = obj; i !== null; i = Object.getPrototypeOf(i))
          if (i.hasOwnProperty(prop))
            return true;
      return false;
    }

    return {
      clone,
      getProperties,
      getPropertyDescriptor,
      getPropertyNames,
      getPropertySymbols,
      getPrototypeChain,
      hasProperty
    };
  })(),
  StringUtils: (function StringUtils() {
    function toArgs(str = '') {
      return str.split(/ |\n/).filter(v => v);
    }

    return {
      toArgs
    };
  })()
};

if (typeof window !== 'undefined')
  Object.assign(window, utils);
else module.exports = utils;

module.exports = {
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
  NumberUtils: (function NumberUtils() {
    function numberWithCommas(num = 0) {
      const arr = num.toString().split('.');
      arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return arr.join('.');
    }

    return {
      numberWithCommas
    };
  })(),
  ObjectUtils: (function ObjectUtils() {
    // Functions exactly like Object::Clone in the v8 C++ api... Mostly
    function clone(obj) {
      const objClone = {},
        objProps = [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)],
        length = objProps.length,
        proto = Object.getPrototypeOf(obj);
      if (proto !== null)
        Object.setPrototypeOf(objClone, clone(proto));
      for (let i = 0; i < length; i++) {
        Object.defineProperty(objClone, objProps[i], Object.getOwnPropertyDescriptor(obj, objProps[i]));
      }
      return objClone;
    }

    function getProperties(obj) {
      let properties = [];
      for (let i = obj; i !== undefined && i !== null; i = Object.getPrototypeOf(i)) {
        properties.push(
          ...Object.getOwnPropertyNames(i).filter(v => !properties.includes(v)),
          ...Object.getOwnPropertySymbols(i).filter(v => !properties.includes(v))
        );
      }
      return properties;
    }

    function getPropertyDescriptor(obj, prop) {
      for (let i = obj; i !== undefined && i !== null; i = Object.getPrototypeOf(i)) {
        if (i.hasOwnProperty(prop))
          return Object.getOwnPropertyDescriptor(i, prop);
      }
    }

    function getPropertyNames(obj) {
      const names = [];
      for (let i = obj; i !== undefined && i !== null; i = Object.getPrototypeOf(i)) {
        names.push(...Object.getOwnPropertyNames(i).filter(v => !names.includes(v)));
      }
      return names;
    }

    function getPropertySymbols(obj) {
      const symbols = [];
      for (let i = obj; i !== undefined && i !== null; i = Object.getPrototypeOf(i)) {
        symbols.push(...Object.getOwnPropertySymbols(i).filter(v => !symbols.includes(v)));
      }
      return symbols;
    }

    function getPrototypeChain(obj) {
      const chain = [];
      for (let i = obj; i !== undefined && i !== null; i = Object.getPrototypeOf(i)) {
        chain[chain.length] = i.hasOwnProperty('constructor')
          ? i.constructor.name
          : undefined;
      }
      return chain;
    }

    function hasProperty(obj, prop) {
      for (let i = obj; i !== undefined && i !== null; i = Object.getPrototypeOf(i)) {
        if (i.hasOwnProperty(prop))
          return true;
      }
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
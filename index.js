module.exports = {
  DateUtils: (function DateUtils() {
    function parseDate(isoDate = new Date().toISOString(), offset = 0) {
      if (isoDate instanceof Date)
        isoDate = isoDate.toISOString();
      if (typeof isoDate === 'number')
        isoDate = new Date(isoDate).toISOString();
      if (offset)
        isoDate = new Date(new Date(isoDate).getTime() + (36e5 * offset)).toISOString();
      let date = isoDate.split('T')[0].split('-'),
        time = isoDate.split('T')[1].replace('Z', '').split(':'),
        amOrPm = Number(time[0]) >= 12 ? 'PM' : 'AM',
        hour = amOrPm === 'AM' ? (+time[0] || 12) : ((time[0] - 12) || 12),
        minute = time[1],
        seconds = time[2],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date[1] - 1]} ${date[2]}, ${date[0]} ${hour}:${minute}:${seconds} ${amOrPm}`;
    }

    return {
      parseDate
    };
  })(),
  NumberUtils: (function NumberUtils() {
    function numberWithCommas(num = 0) {
      let arr = num.toString().split('.');
      arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return arr.join('.');
    }

    return {
      numberWithCommas
    };
  })(),
  ObjectUtils: (function ObjectUtils() {
    function getPropertyNames(obj) {
      if (obj === undefined || obj === null)
        throw new TypeError('Cannot convert undefined or null to object');
      obj = Object(obj);
      let names = [];
      for (let i = obj; i; i = Object.getPrototypeOf(i)) {
        names.push(...Object.getOwnPropertyNames(i).filter(v => !names.includes(v)));
      }
      return names;
    }

    function getPropertySymbols(obj) {
      if (obj === undefined || obj === null)
        throw new TypeError('Cannot convert undefined or null to object');
      obj = Object(obj);
      let symbols = [];
      for (let i = obj; i; i = Object.getPrototypeOf(i)) {
        symbols.push(...Object.getOwnPropertySymbols(i).filter(v => !symbols.includes(v)));
      }
      return symbols;
    }

    function getProperties(obj) {
      if (obj === undefined || obj === null)
        throw new TypeError('Cannot convert undefined or null to object');
      obj = Object(obj);
      let properties = [];
      for (let i = obj; i; i = Object.getPrototypeOf(i)) {
        properties.push(
          ...Object.getOwnPropertyNames(i).filter(v => !properties.includes(v)),
          ...Object.getOwnPropertySymbols(i).filter(v => !properties.includes(v))
        );
      }
      return properties;
    }

    function getPrototypeChain(obj) {
      if (obj === undefined || obj === null)
        throw new TypeError('Cannot convert undefined or null to object');
      obj = Object(obj);
      let chain = [];
      for (let i = obj; i; i = Object.getPrototypeOf(i)) {
        chain[chain.length] = i.hasOwnProperty('constructor')
          ? i.constructor.name
          : undefined;
      }
      return chain;
    }

    function hasProperty(obj, prop) {
      if (obj === undefined || obj === null)
        throw new TypeError('Cannot convert undefined or null to object');
      obj = Object(obj);
      for (let i = obj; i; i = Object.getPrototypeOf(i)) {
        if (i.hasOwnProperty(prop))
          return true;
      }
      return false;
    }

    return {
      getPropertyNames,
      getPropertySymbols,
      getProperties,
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

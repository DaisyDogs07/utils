const utils = {
  FunctionUtils: (function() {
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
  MathUtils: {
    average() {
      let avg = 0;
      for (const n of arguments)
        avg += +n;
      return avg / arguments.length;
    },
    clamp(value, min = 0, max = 1) {
      if (value < min)
        return min;
      if (value > max)
        return max;
      return value;
    },
    distance() {
      let dist = 0;
      for (let i = 0; i < arguments.length; ++i)
        dist += (+arguments[i] - +arguments[++i]) ** 2;
      return dist ** 0.5;
    },
    lerp(min, max, t = 0) {
      return t * (max - min) + min;
    },
    normalize(value, min, max) {
      return (value - min) / (max - min);
    },
    random(min = 0, max = 1) {
      return Math.random() * (max - min) + min;
    }
  },
  ObjectUtils: {
    clone(obj) {
      if (typeof obj.clone === 'function')
        return obj.clone();
      return Object.create(
        Object.getPrototypeOf(obj),
        Object.getOwnPropertyDescriptors(obj)
      );
    }
  }
};

if (typeof window !== 'undefined')
  Object.assign(window, utils);
else module.exports = utils;
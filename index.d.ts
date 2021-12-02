declare module 'utils' {
  export const DateUtils: {
    parseDate(isoDate: string | number | Date, offset?: number): string;
  }

  export const FunctionUtils: {
    applyBind<T extends (...args: any[]) => void>(fn: T): (thisArg?: ThisType<T>, argsArray?: Parameters<T>) => ReturnType<T>;
    uncurryThis<T extends (...args: any[]) => void>(fn: T): (thisArg?: ThisType<T>, ...args: Parameters<T>) => ReturnType<T>;
  }

  export const MathUtils: {
    average(...numbers: number[]): number;
    average(numbers: number[]): number;
    clamp(value: number, min?: number, max?: number): number;

    distance(x1: number, x2: number): number;
    distance(point1: number[], point2: number[]): number;
    distance(x1: number, x2: number, y1: number, y2: number): number;
    distance(x1: number, x2: number, y1: number, y2: number, z1: number, z2: number): number;
    distance(...pairs: number[]): number;

    lerp(min: number, max: number, t?: number): number;
    normalize(value: number, min?: number, max?: number): number;
  }

  export const NumberUtils: {
    numberWithCommas(num?: number): string;
    random(min?: number, max?: number): number;
    realNumber(num?: number): string;
  }

  export const ObjectUtils: {
    clone<T>(obj: T): T;
    getProperties(obj: any): (string | symbol)[];
    getPropertyDescriptor(obj: any, prop: PropertyKey): PropertyDescriptor;
    getPropertyDescriptors(obj: any): {
      [x: string]: PropertyDescriptor;
    };
    getPropertyNames(obj: any): string[];
    getPropertySymbols(obj: any): symbol[];
    getPrototypeChain(obj: any): string[];
    hasOwn(obj: any, prop: PropertyKey): boolean;
    hasProperty(obj: any, prop: PropertyKey): boolean;
  }

  export const StringUtils: {
    toArgs(str?: string): string[];
  }
}

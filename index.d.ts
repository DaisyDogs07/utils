declare module 'utils' {
  export const DateUtils: {
    parseDate(isoDate: string | number | Date, offset?: number): string;
  }

  export const FunctionUtils: {
    applyBind<T extends (...args: any[]) => void>(fn: T): (thisArg?: ThisType<T>, argsArray?: Parameters<T>) => ReturnType<T>;
    uncurryThis<T extends (...args: any[]) => void>(fn: T): (thisArg?: ThisType<T>, ...args: Parameters<T>) => ReturnType<T>;
  }

  export const MathUtils: {
    clamp(value: number, min?: number, max?: number): number;

    distance(a: number, b: number): number;
    distance(x1: number, y1: number, x2: number, y2: number): number;
    distance(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;
    distance(...pairs: number[]): number;

    lerp(min: number, max: number, t?: number): number;
    normalize(value: number, min?: number, max?: number): number;
  }

  export const NumberUtils: {
    numberWithCommas(num?: number): string;
    random(min?: number, max?: number): number;
  }

  export const ObjectUtils: {
    clone<T>(obj: T): T;
    getProperties(obj: any): PropertyKey[];
    getPropertyDescriptor(obj: any, prop: PropertyKey): PropertyDescriptor;
    getPropertyNames(obj: any): string[];
    getPropertySymbols(obj: any): symbol[];
    getPrototypeChain(obj: any): string[];
    hasProperty(obj: any, prop: PropertyKey): boolean;
  }

  export const StringUtils: {
    toArgs(str?: string): string[];
  }
}

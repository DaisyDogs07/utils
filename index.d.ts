declare module 'utils' {
  interface DateUtils {
    parseDate(isoDate: string | number | Date, offset?: number): string;
  }

  interface FunctionUtils {
    applyBind<T extends (this: unknown, ...args: unknown[]) => unknown>(fn: T, ...argsArray: Parameters<T>[]): (thisArg?: ThisParameterType<T>, argsArray?: Parameters<T>) => ReturnType<T>;
    uncurryThis<T extends (this: unknown, ...args: unknown[]) => unknown>(fn: T, ...argsArray: Parameters<T>[]): (thisArg?: ThisParameterType<T>, ...args: Parameters<T>) => ReturnType<T>;
  }

  interface NumberUtils {
    numberWithCommas(num?: number): string;
  }

  interface ObjectUtils {
    clone<T>(obj: T): T;
    getProperties(obj: any): PropertyKey[];
    getPropertyDescriptor(obj: any, prop: PropertyKey): PropertyDescriptor;
    getPropertyNames(obj: any): string[];
    getPropertySymbols(obj: any): symbol[];
    getPrototypeChain(obj: any): (string | undefined)[];
    hasProperty(obj: any, prop: PropertyKey): boolean;
  }

  interface StringUtils {
    toArgs(str?: string): string[];
  }

  export {
    DateUtils,
    FunctionUtils,
    NumberUtils,
    ObjectUtils,
    StringUtils
  }
}
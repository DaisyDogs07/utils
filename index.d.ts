declare module 'utils' {
  export interface DateUtils {
    parseDate(isoDate: string | number | Date, offset?: number): string;
  }

  export interface FunctionUtils {
    applyBind<T extends (this: any, ...args: any[]) => void>(fn: T, ...argsArray: Parameters<T>): (thisArg?: ThisParameterType<T>, argsArray?: Parameters<T>) => ReturnType<T>;
    uncurryThis<T extends (this: any, ...args: any[]) => void>(fn: T, ...argsArray: Parameters<T>): (thisArg?: ThisParameterType<T>, ...args: Parameters<T>) => ReturnType<T>;
  }

  export interface NumberUtils {
    numberWithCommas(num?: number): string;
  }

  export interface ObjectUtils {
    clone<T>(obj: T): T;
    getProperties(obj: any): PropertyKey[];
    getPropertyDescriptor(obj: any, prop: PropertyKey): PropertyDescriptor;
    getPropertyNames(obj: any): string[];
    getPropertySymbols(obj: any): symbol[];
    getPrototypeChain(obj: any): string[];
    hasProperty(obj: any, prop: PropertyKey): boolean;
  }

  export interface StringUtils {
    toArgs(str?: string): string[];
  }
}
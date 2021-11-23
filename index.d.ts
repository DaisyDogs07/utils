declare module 'utils' {
  export const DateUtils: {
    parseDate(isoDate: string | number | Date, offset?: number): string;
  }

  export const FunctionUtils: {
    applyBind<T extends (...args: any[]) => void>(fn: T, ...argsArray: Parameters<T>): (thisArg?: ThisType<T>, argsArray?: Parameters<T>) => ReturnType<T>;
    uncurryThis<T extends (...args: any[]) => void>(fn: T, ...argsArray: Parameters<T>): (thisArg?: ThisType<T>, ...args: Parameters<T>) => ReturnType<T>;
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
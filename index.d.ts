declare module 'utils' {
  export const FunctionUtils: {
    applyBind<T extends (...args: any[]) => void>(fn: T): (thisArg?: any, argsArray?: Parameters<T>) => ReturnType<T>;
    uncurryThis<T extends (...args: any[]) => void>(fn: T): (thisArg?: any, ...args?: Parameters<T>) => ReturnType<T>;
  }

  export const MathUtils: {
    average(...numbers: number[]): number;
    clamp(value: number, min?: number, max?: number): number;

    distance(x2: number, x1: number): number;
    distance(x2: number, x1: number, y2: number, y1: number): number;
    distance(x2: number, x1: number, y2: number, y1: number, z2: number, z1: number): number;

    middlePoint(x1: number, x2: number): number[];
    middlePoint(x1: number, x2: number, y1: number, y2: number): number[];
    middlePoint(x1: number, x2: number, y1: number, y2: number, z1: number, z2: number): number[];

    lerp(min: number, max: number, t?: number): number;
    normalize(value: number, min: number, max: number): number;
    random(min?: number, max?: number): number;
  }

  export const ObjectUtils: {
    clone<T>(obj: T): {
      [P in keyof T]: T[P];
    };
  }
}
import { Awaitable } from "./types";
declare function toArrayMap<OBJECT, KEY, VALUE = OBJECT>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper?: (object: OBJECT) => VALUE): Map<KEY, VALUE[]>;
declare function toObjectMap<OBJECT, KEY, VALUE = OBJECT>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper?: (object: OBJECT) => VALUE): Map<KEY, VALUE>;
declare function batch<T>(functions: (() => Awaitable<T>)[], batchSize?: number): Promise<T[]>;
declare function sequential<T>(functions: (() => Promise<T>)[]): Promise<T[]>;
declare function clone<T>(value: T): T;
export { batch, clone, sequential, toArrayMap, toObjectMap };

import { Awaitable } from "./types";

function toArrayMap<OBJECT, KEY, VALUE = OBJECT>(
  objects: OBJECT[],
  keyMapper: (object: OBJECT) => KEY,
  valueMapper: (object: OBJECT) => VALUE = (o) => o as unknown as VALUE
): Map<KEY, VALUE[]> {
  return objects.reduce((map, object) => {
    const key = keyMapper(object);
    const value = valueMapper(object);
    const array = map.get(key) ?? new Array<VALUE>();
    array.push(value);
    map.set(key, array);
    return map;
  }, new Map<KEY, VALUE[]>());
}

function toObjectMap<OBJECT, KEY, VALUE = OBJECT>(
  objects: OBJECT[],
  keyMapper: (object: OBJECT) => KEY,
  valueMapper: (object: OBJECT) => VALUE = (o) => o as unknown as VALUE
): Map<KEY, VALUE> {
  return new Map(objects.map((o) => [keyMapper(o), valueMapper(o)]));
}

async function batch<T>(
  functions: (() => Awaitable<T>)[],
  batchSize?: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < functions.length; i += batchSize ?? functions.length) {
    const batch = functions.slice(i, i + (batchSize ?? functions.length));
    const batchResult = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResult);
  }
  return results;
}

async function sequential<T>(functions: (() => Promise<T>)[]): Promise<T[]> {
  return await batch(functions, 1);
}

export { batch, sequential, toArrayMap, toObjectMap };

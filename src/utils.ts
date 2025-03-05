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

async function sequential<T>(functions: (() => Promise<T>)[]): Promise<T[]> {
  const results = new Array();
  for (const f of functions) {
    const result = await f();
    results.push(result);
  }
  return results;
}

export { sequential, toArrayMap, toObjectMap };

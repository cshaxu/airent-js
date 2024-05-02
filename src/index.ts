import AsyncLock from "async-lock";

// https://stackoverflow.com/questions/34098023
// type EntityConstructor<T> = new (...args: any[]) => T;
type EntityConstructor<MODEL, CONTEXT, ENTITY> = {
  new (
    model: MODEL,
    context: CONTEXT,
    group: ENTITY[],
    lock: AsyncLock
  ): ENTITY;
};

type LoadKey = Record<string, any>;

type LoadConfig<ENTITY, LOADED> = {
  name: string;
  filter: (one: ENTITY) => boolean;
  getter?: (sources: ENTITY[]) => LoadKey[];
  loader?: (keys: LoadKey[]) => Promise<LOADED[]>;
  setter?: (sources: ENTITY[], targets: LOADED[]) => void;
};

// Note: it selects field when you set the field key to either true or false.
type Select<RESPONSE, FIELD_REQUEST> = FIELD_REQUEST extends Record<string, any>
  ? /* select fields */ {
      [KEY in keyof FIELD_REQUEST as FIELD_REQUEST[KEY] extends
        | boolean
        | Record<string, any>
        ? KEY
        : never]: KEY extends keyof RESPONSE
        ? /* valid type key */ FIELD_REQUEST[KEY] extends Record<string, any>
          ? /* nest-select inner type */ RESPONSE[KEY] extends
              | Array<infer INNER>
              | undefined
            ? /* type is array */ INNER extends Record<string, any>
              ? /* inner type is object */ Array<
                  Select<INNER, FIELD_REQUEST[KEY]>
                >
              : /* inner type is primitive */ never
            : /* type is single */ null extends RESPONSE[KEY]
            ? /* type is nullable */ RESPONSE[KEY] extends
                | Record<string, any>
                | null
                | undefined
              ? /* type is object */ Select<
                  NonNullable<RESPONSE[KEY]>,
                  FIELD_REQUEST[KEY]
                > | null
              : /* type is primitive */ never
            : /* type is non-nullable */ RESPONSE[KEY] extends
                | Record<string, any>
                | undefined
            ? /* type is object */ Select<
                NonNullable<RESPONSE[KEY]>,
                FIELD_REQUEST[KEY]
              >
            : /* type is primitive */ never
          : /* otherwise */ FIELD_REQUEST[KEY] extends boolean
          ? /* gross-select field */ Exclude<RESPONSE[KEY], undefined>
          : /* invalid selection */ never
        : /* invalid type key */ never;
    }
  : /* otherwise */ FIELD_REQUEST extends boolean
  ? /* original response */ RESPONSE
  : /* invalid selection */ never;

class BaseEntity<
  MODEL,
  CONTEXT = unknown,
  FIELD_REQUEST = unknown,
  RESPONSE = MODEL
> {
  public context: CONTEXT;
  protected _group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[];
  protected _lock: AsyncLock;

  protected constructor(
    context: CONTEXT,
    group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[],
    lock: AsyncLock
  ) {
    this.context = context;
    this._group = group;
    this._lock = lock;
  }

  protected initialize(_model: MODEL, _context: CONTEXT): void {}

  protected async beforePresent<S extends FIELD_REQUEST>(
    _fieldRequest: S
  ): Promise<void> {}

  protected async afterPresent<S extends FIELD_REQUEST>(
    _fieldRequest: S,
    _response: Select<RESPONSE, S>
  ): Promise<void> {}

  public async present<S extends FIELD_REQUEST>(
    _fieldRequest: S
  ): Promise<Select<RESPONSE, S>> {
    throw new Error("not implemented");
  }

  protected async load<
    ENTITY extends BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>,
    LOADED
  >(config: LoadConfig<ENTITY, LOADED>): Promise<void> {
    const { name, getter: getterRaw, loader, setter: setterRaw } = config;
    const filter = config.filter as (
      one: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>
    ) => boolean;

    if (!getterRaw) {
      throw new Error(`${name} getter not implemented`);
    }
    const getter = getterRaw as (
      sources: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[]
    ) => LoadKey[];

    if (!loader) {
      throw new Error(`${name} loader not implemented`);
    }

    if (!setterRaw) {
      throw new Error(`${name} setter not implemented`);
    }
    const setter = setterRaw as (
      sources: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[],
      targets: LOADED[]
    ) => void;

    await this._lock.acquire(name, async () => {
      const sources = this._group.filter(filter);
      if (!sources.length) {
        return;
      }
      const keys = getter(sources);
      const targets = await loader(keys);
      setter(sources, targets);
    });
  }

  /** factories */

  public static fromOne<MODEL, CONTEXT, ENTITY>(
    this: EntityConstructor<MODEL, CONTEXT, ENTITY>,
    model: MODEL,
    context: CONTEXT
  ): ENTITY {
    return (this as any).fromArray([model], context)[0];
  }

  public static fromArray<MODEL, CONTEXT, ENTITY>(
    this: EntityConstructor<MODEL, CONTEXT, ENTITY>,
    models: MODEL[],
    context: CONTEXT
  ): ENTITY[] {
    const group = new Array<ENTITY>();
    const lock = new AsyncLock({ maxPending: Infinity, domainReentrant: true });
    models.forEach((model) =>
      group.push(new this(model, context, group, lock))
    );
    return group;
  }
}

function toArrayMap<OBJECT, KEY, VALUE>(
  objects: OBJECT[],
  keyMapper: (object: OBJECT) => KEY,
  valueMapper: (object: OBJECT) => VALUE
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

function toObjectMap<OBJECT, KEY, VALUE>(
  objects: OBJECT[],
  keyMapper: (object: OBJECT) => KEY,
  valueMapper: (object: OBJECT) => VALUE
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

export {
  AsyncLock,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
  sequential,
  toArrayMap,
  toObjectMap,
};

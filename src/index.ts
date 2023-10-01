import AsyncLock from "async-lock";

// https://stackoverflow.com/questions/34098023
type Constructor<MODEL, ENTITY> = {
  new (model: MODEL, group: ENTITY[], lock: AsyncLock): ENTITY;
};

type LoadParams<ENTITY, LOADED> = {
  name: string;
  filter: (one: ENTITY) => boolean;
  loader?: (array: ENTITY[]) => Promise<LOADED[]>;
  setter?: (array: ENTITY[], loaded: LOADED[]) => void;
};

class BaseEntity<MODEL, FIELD_REQUEST = undefined, RESPONSE = MODEL> {
  protected _group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[];
  protected _lock: AsyncLock;

  protected constructor(
    group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[],
    lock: AsyncLock
  ) {
    this._group = group;
    this._lock = lock;
  }

  protected initialize(): void {}

  public async present(_request?: FIELD_REQUEST | boolean): Promise<RESPONSE> {
    throw new Error("not implemented");
  }

  protected async load<
    ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>,
    LOADED
  >(params: LoadParams<ENTITY, LOADED>): Promise<void> {
    const { name, loader: loaderRaw, setter: setterRaw } = params;
    const filter = params.filter as (
      one: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>
    ) => boolean;

    if (!loaderRaw) {
      throw new Error(`${name} loader not implemented`);
    }
    const loader = loaderRaw as (
      array: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[]
    ) => Promise<LOADED[]>;

    if (!setterRaw) {
      throw new Error(`${name} setter not implemented`);
    }
    const setter = setterRaw as (
      array: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[],
      loaded: LOADED[]
    ) => void;

    await this._lock.acquire(name, async () => {
      const array = this._group.filter(filter);
      if (!array.length) {
        return;
      }
      const loaded = await loader(array);
      setter(array, loaded);
    });
  }

  /** factories */

  public static fromOne<MODEL, ENTITY>(
    this: Constructor<MODEL, ENTITY>,
    model: MODEL
  ): ENTITY {
    const group = new Array<ENTITY>();
    const lock = new AsyncLock();
    const entity = new this(model, group, lock);
    group.push(entity);
    return entity;
  }

  public static fromArray<MODEL, ENTITY>(
    this: Constructor<MODEL, ENTITY>,
    models: MODEL[]
  ): ENTITY[] {
    const group = new Array<ENTITY>();
    const lock = new AsyncLock({ domainReentrant: true });
    models.forEach((model) => group.push(new this(model, group, lock)));
    return group;
  }

  public static async presentMany<
    MODEL,
    FIELD_REQUEST,
    RESPONSE,
    ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>
  >(entities: ENTITY[], request?: FIELD_REQUEST | boolean): Promise<any[]> {
    return await Promise.all(entities.map((one) => one.present(request)));
  }
}

function exists(object: any) {
  return object !== undefined && object !== null;
}

function nonNull<T>(array: T[]): NonNullable<T>[] {
  return array.filter(exists).map((o) => o!);
}

function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
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

export {
  AsyncLock,
  BaseEntity,
  LoadParams,
  exists,
  nonNull,
  toArrayMap,
  toObjectMap,
  unique,
};

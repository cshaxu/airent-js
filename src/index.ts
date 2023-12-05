import AsyncLock from "async-lock";

// https://stackoverflow.com/questions/34098023
// type EntityConstructor<T> = new (...args: any[]) => T;
type EntityConstructor<MODEL, ENTITY> = {
  new (model: MODEL, group: ENTITY[], lock: AsyncLock): ENTITY;
};

type LoadKey = Record<string, any>;

type LoadConfig<ENTITY, LOADED> = {
  name: string;
  filter: (one: ENTITY) => boolean;
  getter?: (sources: ENTITY[]) => LoadKey[];
  loader?: (keys: LoadKey[]) => Promise<LOADED[]>;
  setter?: (sources: ENTITY[], targets: LOADED[]) => void;
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
  >(config: LoadConfig<ENTITY, LOADED>): Promise<void> {
    const { name, getter: getterRaw, loader, setter: setterRaw } = config;
    const filter = config.filter as (
      one: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>
    ) => boolean;

    if (!getterRaw) {
      throw new Error(`${name} getter not implemented`);
    }
    const getter = getterRaw as (
      sources: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[]
    ) => LoadKey[];

    if (!loader) {
      throw new Error(`${name} loader not implemented`);
    }

    if (!setterRaw) {
      throw new Error(`${name} setter not implemented`);
    }
    const setter = setterRaw as (
      sources: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[],
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

  public static fromOne<MODEL, ENTITY>(
    this: EntityConstructor<MODEL, ENTITY>,
    model: MODEL
  ): ENTITY {
    return (this as any).fromArray([model])[0];
  }

  public static fromArray<MODEL, ENTITY>(
    this: EntityConstructor<MODEL, ENTITY>,
    models: MODEL[]
  ): ENTITY[] {
    const group = new Array<ENTITY>();
    const lock = new AsyncLock({ maxPending: Infinity, domainReentrant: true });
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
  EntityConstructor,
  LoadConfig,
  LoadKey,
  toArrayMap,
  toObjectMap,
};

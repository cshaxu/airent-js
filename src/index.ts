import AsyncLock from "async-lock";

// https://stackoverflow.com/questions/34098023
type Constructor<MODEL, ENTITY> = {
  new (model: MODEL, group: ENTITY[], lock: AsyncLock): ENTITY;
};

type LoadParams<ENTITY, LOADED> = {
  name: string;
  filter?: (one: ENTITY) => boolean;
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

  public async present(_request?: FIELD_REQUEST | boolean): Promise<RESPONSE> {
    throw new Error("not implemented");
  }

  protected async load<LOADED>(
    params: LoadParams<BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>, LOADED>
  ): Promise<void> {
    const { name, filter, loader, setter } = params;
    if (!filter || !loader || !setter) {
      throw new Error(`${name} loadParams not implemented`);
    }
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
}

export { AsyncLock, BaseEntity };

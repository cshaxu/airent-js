import {
  AsyncLock,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
} from "./types";

class BaseEntity<
  MODEL,
  CONTEXT = unknown,
  FIELD_REQUEST = unknown,
  RESPONSE = MODEL
> {
  public context: CONTEXT;
  protected _id: string;
  protected _group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[];
  protected _lock: AsyncLock;

  protected constructor(
    context: CONTEXT,
    group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[],
    lock: AsyncLock
  ) {
    this.context = context;
    this._id = crypto.randomUUID();
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
    return [...group];
  }
}

export { BaseEntity };

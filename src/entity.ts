import {
  AsyncLock,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
} from "./types";

class BaseEntity<
  MODEL extends Record<string, any>,
  CONTEXT = unknown,
  FIELD_REQUEST = unknown,
  RESPONSE = MODEL
> {
  public context: CONTEXT;

  protected _id: string;
  protected _group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[];
  protected _lock: AsyncLock;
  protected _originalModel: Partial<MODEL>;
  protected _aliasMapFromModel: Record<string, string> = {};
  protected _aliasMapToModel: Record<string, string> = {};

  protected constructor(
    context: CONTEXT,
    group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[],
    lock: AsyncLock
  ) {
    this.context = context;
    this._id = crypto.randomUUID();
    this._originalModel = {};
    this._group = group;
    this._lock = lock;
  }

  protected initialize(_model: MODEL, _context: CONTEXT): void {}

  public fromModel(model: Partial<MODEL>): void {
    this.fromModelInner(model, false);
  }

  protected fromModelInner(
    model: Partial<MODEL>,
    isResetOriginalModel: boolean
  ): void {
    Object.entries(model)
      .filter(([k, v]) => k in this._aliasMapFromModel && v !== undefined)
      .forEach(([modelKey, modelValue]) => {
        const entityKey = this._aliasMapFromModel[modelKey];
        const value =
          typeof modelValue === "object"
            ? structuredClone(modelValue)
            : modelValue;
        if (isResetOriginalModel) {
          (this._originalModel as any)[modelKey] = value;
        }
        (this as any)[entityKey] = value;
      });
  }

  public toModel(): Partial<MODEL> {
    return this.toModelInner(false);
  }

  public toDirtyModel(): Partial<MODEL> {
    return this.toModelInner(true);
  }

  private toModelInner(isDirtyOnly: boolean): Partial<MODEL> {
    return Object.entries(this._aliasMapToModel).reduce(
      (acc, [entityKey, modelKey]) => {
        const modelValue = this._originalModel[modelKey];
        const entityValue = (this as any)[entityKey];
        const isObject = typeof entityValue === "object";
        const shouldInclude =
          !isDirtyOnly ||
          (isObject
            ? JSON.stringify(entityValue) !== JSON.stringify(modelValue)
            : entityValue !== modelValue);
        if (shouldInclude) {
          (acc as any)[modelKey] = isObject
            ? structuredClone(entityValue)
            : entityValue;
        }
        return acc;
      },
      {} as Partial<MODEL>
    );
  }

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

  public static fromOne<MODEL extends Record<string, any>, CONTEXT, ENTITY>(
    this: EntityConstructor<MODEL, CONTEXT, ENTITY>,
    model: MODEL,
    context: CONTEXT
  ): ENTITY {
    return (this as any).fromArray([model], context)[0];
  }

  public static fromArray<MODEL extends Record<string, any>, CONTEXT, ENTITY>(
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

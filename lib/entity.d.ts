import { AsyncLock, EntityConstructor, LoadConfig, Select } from "./types";
declare class BaseEntity<MODEL extends Record<string, any>, CONTEXT = unknown, FIELD_REQUEST = unknown, RESPONSE = MODEL> {
    context: CONTEXT;
    protected _id: string;
    protected _group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[];
    protected _lock: AsyncLock;
    protected _originalModel: Partial<MODEL>;
    protected _aliasMapFromModel: Record<string, string>;
    protected _aliasMapToModel: Record<string, string>;
    protected constructor(context: CONTEXT, group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[], lock: AsyncLock);
    protected initialize(_model: MODEL, _context: CONTEXT): void;
    fromModel(model: Partial<MODEL>): void;
    protected fromModelInner(model: Partial<MODEL>, isResetOriginalModel: boolean): void;
    toModel(): Partial<MODEL>;
    toDirtyModel(): Partial<MODEL>;
    private toModelInner;
    protected beforePresent<S extends FIELD_REQUEST>(_fieldRequest: S): Promise<void>;
    protected afterPresent<S extends FIELD_REQUEST>(_fieldRequest: S, _response: Select<RESPONSE, S>): Promise<void>;
    present<S extends FIELD_REQUEST>(_fieldRequest: S): Promise<Select<RESPONSE, S>>;
    protected load<ENTITY extends BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>, LOADED>(config: LoadConfig<ENTITY, LOADED>): Promise<void>;
    /** factories */
    static fromOne<MODEL extends Record<string, any>, CONTEXT, ENTITY>(this: EntityConstructor<MODEL, CONTEXT, ENTITY>, model: MODEL, context: CONTEXT): ENTITY;
    static fromArray<MODEL extends Record<string, any>, CONTEXT, ENTITY>(this: EntityConstructor<MODEL, CONTEXT, ENTITY>, models: MODEL[], context: CONTEXT): ENTITY[];
}
export { BaseEntity };

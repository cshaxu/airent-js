import AsyncLock from "async-lock";
type EntityConstructor<MODEL, CONTEXT, ENTITY> = {
    new (model: MODEL, context: CONTEXT, group: ENTITY[], lock: AsyncLock): ENTITY;
};
type LoadKey = Record<string, any>;
type LoadConfig<ENTITY, LOADED> = {
    name: string;
    filter: (one: ENTITY) => boolean;
    getter?: (sources: ENTITY[]) => LoadKey[];
    loader?: (keys: LoadKey[]) => Promise<LOADED[]>;
    setter?: (sources: ENTITY[], targets: LOADED[]) => void;
};
type Select<RESPONSE, FIELD_REQUEST> = FIELD_REQUEST extends Record<string, any> ? {
    [KEY in keyof FIELD_REQUEST as FIELD_REQUEST[KEY] extends boolean | Record<string, any> ? KEY : never]: KEY extends keyof RESPONSE ? FIELD_REQUEST[KEY] extends Record<string, any> ? RESPONSE[KEY] extends Array<infer INNER> | undefined ? INNER extends Record<string, any> ? Array<Select<INNER, FIELD_REQUEST[KEY]>> : never : null extends RESPONSE[KEY] ? RESPONSE[KEY] extends Record<string, any> | null | undefined ? /* type is object */ Select<NonNullable<RESPONSE[KEY]>, FIELD_REQUEST[KEY]> | null : never : RESPONSE[KEY] extends Record<string, any> | undefined ? Select<NonNullable<RESPONSE[KEY]>, FIELD_REQUEST[KEY]> : never : FIELD_REQUEST[KEY] extends boolean ? Exclude<RESPONSE[KEY], undefined> : never : never;
} : FIELD_REQUEST extends boolean ? RESPONSE : never;
declare class BaseEntity<MODEL, CONTEXT = unknown, FIELD_REQUEST = unknown, RESPONSE = MODEL> {
    context: CONTEXT;
    protected _group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[];
    protected _lock: AsyncLock;
    protected constructor(context: CONTEXT, group: BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>[], lock: AsyncLock);
    protected initialize(_model: MODEL, _context: CONTEXT): void;
    protected beforePresent<S extends FIELD_REQUEST>(_fieldRequest: S): Promise<void>;
    protected afterPresent<S extends FIELD_REQUEST>(_fieldRequest: S, _response: Select<RESPONSE, S>): Promise<void>;
    present<S extends FIELD_REQUEST>(_fieldRequest: S): Promise<Select<RESPONSE, S>>;
    protected load<ENTITY extends BaseEntity<MODEL, CONTEXT, FIELD_REQUEST, RESPONSE>, LOADED>(config: LoadConfig<ENTITY, LOADED>): Promise<void>;
    /** factories */
    static fromOne<MODEL, CONTEXT, ENTITY>(this: EntityConstructor<MODEL, CONTEXT, ENTITY>, model: MODEL, context: CONTEXT): ENTITY;
    static fromArray<MODEL, CONTEXT, ENTITY>(this: EntityConstructor<MODEL, CONTEXT, ENTITY>, models: MODEL[], context: CONTEXT): ENTITY[];
}
declare function toArrayMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE[]>;
declare function toObjectMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE>;
declare function sequential<T>(functions: (() => Promise<T>)[]): Promise<T[]>;
export { AsyncLock, BaseEntity, EntityConstructor, LoadConfig, LoadKey, Select, sequential, toArrayMap, toObjectMap, };

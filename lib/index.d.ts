import AsyncLock from "async-lock";
type Constructor<MODEL, ENTITY> = {
    new (model: MODEL, group: ENTITY[], lock: AsyncLock): ENTITY;
};
type LoadParams<ENTITY, LOADED> = {
    name: string;
    filter: (one: ENTITY) => boolean;
    loader?: (array: ENTITY[]) => Promise<LOADED[]>;
    setter?: (array: ENTITY[], loaded: LOADED[]) => void;
};
declare class BaseEntity<MODEL, FIELD_REQUEST = undefined, RESPONSE = MODEL> {
    protected _group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[];
    protected _lock: AsyncLock;
    protected constructor(group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[], lock: AsyncLock);
    protected initialize(): void;
    present(_request?: FIELD_REQUEST | boolean): Promise<RESPONSE>;
    protected load<ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>, LOADED>(params: LoadParams<ENTITY, LOADED>): Promise<void>;
    /** factories */
    static fromOne<MODEL, ENTITY>(this: Constructor<MODEL, ENTITY>, model: MODEL): ENTITY;
    static fromArray<MODEL, ENTITY>(this: Constructor<MODEL, ENTITY>, models: MODEL[]): ENTITY[];
    static presentMany<MODEL, FIELD_REQUEST, RESPONSE, ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>>(entities: ENTITY[], request?: FIELD_REQUEST | boolean): Promise<any[]>;
}
declare function exists(object: any): boolean;
declare function nonNull<T>(array: T[]): NonNullable<T>[];
declare function unique<T>(array: T[]): T[];
declare function toArrayMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE[]>;
declare function toObjectMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE>;
export { AsyncLock, BaseEntity, LoadParams, exists, nonNull, toArrayMap, toObjectMap, unique, };

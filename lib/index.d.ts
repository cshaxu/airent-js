import AsyncLock from "async-lock";
type EntityConstructor<T> = new (...args: any[]) => T;
type LoadKey = {
    [key: string]: any;
};
type LoadConfig<ENTITY, LOADED> = {
    name: string;
    filter: (one: ENTITY) => boolean;
    getter?: (sources: ENTITY[]) => LoadKey[];
    loader?: (keys: LoadKey[]) => Promise<LOADED[]>;
    setter?: (sources: ENTITY[], targets: LOADED[]) => void;
};
declare class BaseEntity<MODEL, FIELD_REQUEST = undefined, RESPONSE = MODEL> {
    protected _group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[];
    protected _lock: AsyncLock;
    protected constructor(group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[], lock: AsyncLock);
    protected initialize(): void;
    present(_request?: FIELD_REQUEST | boolean): Promise<RESPONSE>;
    protected load<ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>, LOADED>(config: LoadConfig<ENTITY, LOADED>): Promise<void>;
    /** factories */
    static fromOne<MODEL, ENTITY>(this: EntityConstructor<ENTITY>, model: MODEL): ENTITY;
    static fromArray<MODEL, ENTITY>(this: EntityConstructor<ENTITY>, models: MODEL[]): ENTITY[];
    static presentMany<MODEL, FIELD_REQUEST, RESPONSE, ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>>(entities: ENTITY[], request?: FIELD_REQUEST | boolean): Promise<any[]>;
}
declare function toArrayMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE[]>;
declare function toObjectMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE>;
export { AsyncLock, BaseEntity, EntityConstructor, LoadConfig, LoadKey, toArrayMap, toObjectMap, };

import AsyncLock from "./async-lock";
type Constructor<MODEL, ENTITY> = {
    new (model: MODEL, group: ENTITY[], lock: AsyncLock): ENTITY;
};
type LoadParams<ENTITY, LOADED> = {
    name?: string;
    before?: () => Promise<void>;
    filter?: (one: ENTITY) => boolean;
    loader?: (array: ENTITY[]) => Promise<LOADED[]>;
    setter?: (array: ENTITY[], loaded: LOADED[]) => void;
    after?: () => Promise<void>;
};
export default class BaseEntity<MODEL, FIELD_REQUEST = undefined, RESPONSE = MODEL> {
    protected _group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[];
    protected _lock: AsyncLock;
    protected constructor(group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[], lock: AsyncLock);
    present(_request?: FIELD_REQUEST | boolean): Promise<RESPONSE>;
    protected load<LOADED>(params: LoadParams<BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>, LOADED>): Promise<void>;
    /** factories */
    static fromOne<MODEL, ENTITY>(this: Constructor<MODEL, ENTITY>, model: MODEL): ENTITY;
    static fromArray<MODEL, ENTITY>(this: Constructor<MODEL, ENTITY>, models: MODEL[]): ENTITY[];
}
export {};

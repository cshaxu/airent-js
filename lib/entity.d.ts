/// <reference types="async-lock" />
import { AsyncLock, EntityConstructor, LoadConfig, Select } from "./types";
declare class BaseEntity<MODEL, CONTEXT = unknown, FIELD_REQUEST = unknown, RESPONSE = MODEL> {
    context: CONTEXT;
    protected _id: string;
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
export { BaseEntity };

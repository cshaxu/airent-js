import { AsyncLock } from "./async-lock.js";
export class BaseEntity {
    _group;
    _lock;
    constructor(group, lock) {
        this._group = group;
        this._lock = lock;
    }
    async present(_format) {
        throw new Error("not implemented");
    }
    async load(params) {
        if (params.before) {
            await params.before();
        }
        this._lock.acquire();
        try {
            const array = this._group.filter(params.filter);
            if (!array.length) {
                return;
            }
            const loaded = await params.loader(array);
            params.setter(array, loaded);
        }
        finally {
            this._lock.release();
        }
        if (params.after) {
            await params.after();
        }
    }
    /** factories */
    static fromOne(model) {
        const group = new Array();
        const lock = new AsyncLock();
        const entity = new this(model, group, lock);
        group.push(entity);
        return entity;
    }
    static fromArray(models) {
        const group = new Array();
        const lock = new AsyncLock();
        models.forEach((model) => group.push(new this(model, group, lock)));
        return group;
    }
}
//# sourceMappingURL=base-entity.js.map
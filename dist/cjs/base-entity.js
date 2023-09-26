"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
const async_lock_js_1 = require("./async-lock.js");
class BaseEntity {
    constructor(group, lock) {
        this._group = group;
        this._lock = lock;
    }
    present(_format) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("not implemented");
        });
    }
    load(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.before) {
                yield params.before();
            }
            this._lock.acquire();
            try {
                const array = this._group.filter(params.filter);
                if (!array.length) {
                    return;
                }
                const loaded = yield params.loader(array);
                params.setter(array, loaded);
            }
            finally {
                this._lock.release();
            }
            if (params.after) {
                yield params.after();
            }
        });
    }
    /** factories */
    static fromOne(model) {
        const group = new Array();
        const lock = new async_lock_js_1.AsyncLock();
        const entity = new this(model, group, lock);
        group.push(entity);
        return entity;
    }
    static fromArray(models) {
        const group = new Array();
        const lock = new async_lock_js_1.AsyncLock();
        models.forEach((model) => group.push(new this(model, group, lock)));
        return group;
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base-entity.js.map
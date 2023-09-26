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
exports.AsyncLock = void 0;
// https://betterprogramming.pub/implementing-lock-using-promise-d7ed4ce19207
class AsyncLock {
    constructor() {
        this.promise = Promise.resolve();
        this.resolve = undefined;
    }
    acquire() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.promise;
            this.promise = new Promise((resolve) => (this.resolve = resolve));
        });
    }
    release() {
        if (this.resolve) {
            this.resolve();
        }
    }
}
exports.AsyncLock = AsyncLock;
//# sourceMappingURL=async-lock.js.map
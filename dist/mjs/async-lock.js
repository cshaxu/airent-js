// https://betterprogramming.pub/implementing-lock-using-promise-d7ed4ce19207
export class AsyncLock {
    promise;
    resolve;
    constructor() {
        this.promise = Promise.resolve();
        this.resolve = undefined;
    }
    async acquire() {
        await this.promise;
        this.promise = new Promise((resolve) => (this.resolve = resolve));
    }
    release() {
        if (this.resolve) {
            this.resolve();
        }
    }
}
//# sourceMappingURL=async-lock.js.map
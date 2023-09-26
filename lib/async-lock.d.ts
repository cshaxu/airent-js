export default class AsyncLock {
    private promise;
    private resolve;
    constructor();
    acquire(): Promise<void>;
    release(): void;
}

export declare class AsyncLock {
    private promise;
    private resolve;
    constructor();
    acquire(): Promise<void>;
    release(): void;
}

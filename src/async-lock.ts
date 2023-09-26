// https://betterprogramming.pub/implementing-lock-using-promise-d7ed4ce19207
export default class AsyncLock {
  private promise: Promise<void>;

  private resolve: (() => void) | undefined;

  constructor() {
    this.promise = Promise.resolve();
    this.resolve = undefined;
  }

  async acquire() {
    await this.promise;
    this.promise = new Promise<void>((resolve) => (this.resolve = resolve));
  }

  release() {
    if (this.resolve) {
      this.resolve();
    }
  }
}

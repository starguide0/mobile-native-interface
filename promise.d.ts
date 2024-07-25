export interface PromiseResolveFunction<T> {
  (value: T | PromiseLike<T>): void;
}

export interface PromiseRejectFunction {
  (reason?: any): void;
}

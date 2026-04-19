export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  if (ms <= 0) {
    return promise;
  }
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`timeout after ${ms}ms`));
    }, ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

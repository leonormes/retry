export function retryer(fn: () => any) {
  try {
    return fn();
  } catch (error) {}
}

import { Ipolicy } from './Ipolicy';

export function retryer(fn: () => any, policy: Ipolicy) {
    while (true) {
        try {
            policy.incrementTry();
            return fn();
        } catch (error) {
            if (!policy.canRetry()) {
                return;
            }
        }
    }
}

import { Ipolicy } from './Ipolicy';
import { Command } from './callAxios';

export async function retryer(command: Command, policy: Ipolicy) {
    while (true) {
        try {
            policy.incrementTry();
            return await command.execute();
        } catch (error) {
            if (policy.shouldRetry()) {
                await delay(policy.currentWait());
            } else {
                return;
            }
        }
    }
}

/**
 * Wait for a number of specified miliseconds.
 * Returns a Promise that resolves after this time.
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

import { Ipolicy } from './Ipolicy';
import { AsyncCommand } from './command';
import { delay } from './delay';

export async function retryer(command:AsyncCommand<Promise<unknown>>, policy: Ipolicy) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            policy.incrementTry();
            return await command.execute();
        } catch (error) {
            if (policy.shouldRetry(error)) {
                await delay(policy.currentWait());
            } else {
                return;
            }
        }
    }
}

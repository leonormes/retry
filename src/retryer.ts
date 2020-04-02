import { Ipolicy } from './Ipolicy';
import { ICommand } from './command';
import { delay } from './delay';

export async function retryer(command: ICommand, policy: Ipolicy) {
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

import { Ipolicy } from './Ipolicy';
import { ICommand } from './command';
import { delay } from './delay';

export async function retryer(command: ICommand, policy: Ipolicy) {
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



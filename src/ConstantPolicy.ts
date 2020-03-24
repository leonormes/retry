import { Ipolicy } from './Ipolicy';
export class ConstantPolicy implements Ipolicy {
    public maxTime: number;
    private retryCount: number;
    constructor(public maxTries: number = 5, private initWaitTime: number = 500) {
        this.maxTime = maxTries * initWaitTime;
        this.retryCount = 0;
    }
    currentWait() {
        return this.initWaitTime;
    }
    shouldRetry() {
        if (this.retryCount < this.maxTries) {
            return true;
        }
        return false;
    }
    incrementTry() {
        this.retryCount++;
    }
}

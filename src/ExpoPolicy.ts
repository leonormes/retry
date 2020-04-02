import { Ipolicy } from './Ipolicy';
export class ExpoPolicy implements Ipolicy {
    public maxTime: number;
    private retryCount: number;
    constructor(public maxTries: number = 5, private initWaitTime: number = 500) {
        this.maxTime = maxTries * initWaitTime;
        this.retryCount = 0;
    }
    currentWait() {
        return Math.pow(this.initWaitTime, this.retryCount);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shouldRetry(err: any) {
        if (err && err.response && err.response.status >= 400) {
            return false;
        } else if (this.retryCount < this.maxTries) {
            return true;
        }
        return false;
    }
    incrementTry() {
        this.retryCount++;
    }
}

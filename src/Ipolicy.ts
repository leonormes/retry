export interface Ipolicy {
    maxTime: number;
    maxTries: number;
    currentWait: () => number;
    shouldRetry: (err: unknown) => boolean;
    incrementTry: () => void;
}

export class SLAPolicy implements Ipolicy {
    public maxTime: number;
    private retryCount: number;
    constructor(public maxTries: number = 5, private initWaitTime: number = 500) {
        this.maxTime = maxTries * initWaitTime;
        this.retryCount = 0;
    }
    currentWait() {
        return Math.pow(this.initWaitTime, this.retryCount);
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

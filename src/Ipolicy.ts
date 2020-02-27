interface Ipolicy {
  maxTime: number;
  maxTries: number;
  currentWait: () => number;
  canRetry: () => boolean;
  incrementTry: () => void;
}

export class ConstantPolicy implements Ipolicy {
  public maxTries: number;
  public maxTime: number;
  private initWaitTime: number;
  private retryCount: number;
  constructor(maxTries = 5, initWaitTime = 500) {
    this.maxTries = maxTries;
    this.initWaitTime = initWaitTime;
    this.maxTime = maxTries * initWaitTime;
    this.retryCount = 0;
  }
  currentWait() {
    return this.initWaitTime;
  }
  canRetry() {
    if (this.retryCount < this.maxTries) {
      return true;
    }
    return false;
  }
  incrementTry() {
    this.retryCount++;
  }
}

export class ExpoPolicy implements Ipolicy {
  public maxTries: number;
  public maxTime: number;
  private initWaitTime: number;
  private retryCount: number;
  constructor(maxTries = 5, initWaitTime = 500) {
    this.maxTries = maxTries;
    this.initWaitTime = initWaitTime;
    this.maxTime = maxTries * initWaitTime;
    this.retryCount = 0;
  }
  currentWait() {
    return Math.pow(this.initWaitTime, this.retryCount);
  }
  canRetry() {
    if (this.retryCount < this.maxTries) {
      return true;
    }
    return false;
  }
  incrementTry() {
    this.retryCount++;
  }
}

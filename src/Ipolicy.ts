export interface Ipolicy {
  maxTime: number;
  maxTries: number;
  currentWait: () => number;
  shouldRetry: () => boolean;
  incrementTry: () => void;
}

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

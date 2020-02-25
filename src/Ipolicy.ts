interface Ipolicy {
    max_time: number;
    max_tries: number;
    current_wait: () => number
    can_retry: () => boolean
    increment_try: () => void
}

class linearPolicy implements Ipolicy {
    public max_tries: number
    public max_time: number
    private init_wait_time: number
    private retry_count: number
    constructor(max_tries: number = 5, init_wait_time: number = 500) {
        this.max_tries = max_tries
        this.init_wait_time = init_wait_time
        this.max_time = max_tries * init_wait_time
        this.retry_count = 0
    }
    current_wait() {
        return this.init_wait_time
    }
    can_retry() {
        if (this.retry_count < this.max_tries) {
            return true
        }
        return false
    }
    increment_try() {
        this.retry_count++
    }
}

class expoPolicy implements Ipolicy {
    public max_tries: number
    public max_time: number
    private init_wait_time: number
    private retry_count: number
    constructor(max_tries: number = 5, init_wait_time: number = 500) {
        this.max_tries = max_tries
        this.init_wait_time = init_wait_time
        this.max_time = max_tries * init_wait_time
        this.retry_count = 0
    }
    current_wait() {
        return Math.pow(this.init_wait_time, this.retry_count)
    }
    can_retry() {
        if (this.retry_count < this.max_tries) {
            return true
        }
        return false
    }
    increment_try() {
        this.retry_count++
    }
}

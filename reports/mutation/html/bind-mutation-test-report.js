document.querySelector('mutation-test-report-app').report = {"files":{"/home/leon.ormes/Documents/git/retrier/src/Ipolicy.ts":{"language":"typescript","mutants":[{"id":"0","location":{"end":{"column":6,"line":19},"start":{"column":70,"line":14}},"mutatorName":"BlockStatement","replacement":"{}","status":"CompileError"},{"id":"2","location":{"end":{"column":6,"line":22},"start":{"column":20,"line":20}},"mutatorName":"BlockStatement","replacement":"{}","status":"CompileError"},{"id":"3","location":{"end":{"column":6,"line":28},"start":{"column":17,"line":23}},"mutatorName":"BlockStatement","replacement":"{}","status":"CompileError"},{"id":"1","location":{"end":{"column":36,"line":17},"start":{"column":35,"line":17}},"mutatorName":"ArithmeticOperator","replacement":"/","status":"Killed"},{"id":"5","location":{"end":{"column":46,"line":24},"start":{"column":13,"line":24}},"mutatorName":"ConditionalExpression","replacement":"false","status":"Killed"},{"id":"4","location":{"end":{"column":46,"line":24},"start":{"column":13,"line":24}},"mutatorName":"ConditionalExpression","replacement":"true","status":"Killed"},{"id":"6","location":{"end":{"column":31,"line":24},"start":{"column":30,"line":24}},"mutatorName":"EqualityOperator","replacement":"<=","status":"Killed"},{"id":"8","location":{"end":{"column":10,"line":26},"start":{"column":48,"line":24}},"mutatorName":"BlockStatement","replacement":"{}","status":"Killed"},{"id":"7","location":{"end":{"column":31,"line":24},"start":{"column":30,"line":24}},"mutatorName":"EqualityOperator","replacement":">=","status":"Killed"},{"id":"9","location":{"end":{"column":24,"line":25},"start":{"column":20,"line":25}},"mutatorName":"BooleanLiteral","replacement":"false","status":"Killed"},{"id":"10","location":{"end":{"column":21,"line":27},"start":{"column":16,"line":27}},"mutatorName":"BooleanLiteral","replacement":"true","status":"Killed"},{"id":"13","location":{"end":{"column":6,"line":44},"start":{"column":70,"line":39}},"mutatorName":"BlockStatement","replacement":"{}","status":"CompileError"},{"id":"11","location":{"end":{"column":6,"line":31},"start":{"column":21,"line":29}},"mutatorName":"BlockStatement","replacement":"{}","status":"Killed"},{"id":"15","location":{"end":{"column":6,"line":47},"start":{"column":20,"line":45}},"mutatorName":"BlockStatement","replacement":"{}","status":"CompileError"},{"id":"16","location":{"end":{"column":6,"line":53},"start":{"column":17,"line":48}},"mutatorName":"BlockStatement","replacement":"{}","status":"CompileError"},{"id":"14","location":{"end":{"column":36,"line":42},"start":{"column":35,"line":42}},"mutatorName":"ArithmeticOperator","replacement":"/","status":"Killed"},{"id":"12","location":{"end":{"column":27,"line":30},"start":{"column":9,"line":30}},"mutatorName":"UpdateOperator","replacement":"this.retry_count--","status":"Killed"},{"id":"17","location":{"end":{"column":46,"line":49},"start":{"column":13,"line":49}},"mutatorName":"ConditionalExpression","replacement":"true","status":"Killed"},{"id":"18","location":{"end":{"column":46,"line":49},"start":{"column":13,"line":49}},"mutatorName":"ConditionalExpression","replacement":"false","status":"Killed"},{"id":"20","location":{"end":{"column":31,"line":49},"start":{"column":30,"line":49}},"mutatorName":"EqualityOperator","replacement":">=","status":"Killed"},{"id":"19","location":{"end":{"column":31,"line":49},"start":{"column":30,"line":49}},"mutatorName":"EqualityOperator","replacement":"<=","status":"Killed"},{"id":"22","location":{"end":{"column":24,"line":50},"start":{"column":20,"line":50}},"mutatorName":"BooleanLiteral","replacement":"false","status":"Killed"},{"id":"23","location":{"end":{"column":21,"line":52},"start":{"column":16,"line":52}},"mutatorName":"BooleanLiteral","replacement":"true","status":"Killed"},{"id":"21","location":{"end":{"column":10,"line":51},"start":{"column":48,"line":49}},"mutatorName":"BlockStatement","replacement":"{}","status":"Killed"},{"id":"24","location":{"end":{"column":6,"line":56},"start":{"column":21,"line":54}},"mutatorName":"BlockStatement","replacement":"{}","status":"Killed"},{"id":"25","location":{"end":{"column":27,"line":55},"start":{"column":9,"line":55}},"mutatorName":"UpdateOperator","replacement":"this.retry_count--","status":"Killed"}],"source":"interface Ipolicy {\n    max_time: number;\n    max_tries: number;\n    current_wait: () => number\n    can_retry: () => boolean\n    increment_try: () => void\n}\n\nexport class constantPolicy implements Ipolicy {\n    public max_tries: number\n    public max_time: number\n    private init_wait_time: number\n    private retry_count: number\n    constructor(max_tries: number = 5, init_wait_time: number = 500) {\n        this.max_tries = max_tries\n        this.init_wait_time = init_wait_time\n        this.max_time = max_tries * init_wait_time\n        this.retry_count = 0\n    }\n    current_wait() {\n        return this.init_wait_time\n    }\n    can_retry() {\n        if (this.retry_count < this.max_tries) {\n            return true\n        }\n        return false\n    }\n    increment_try() {\n        this.retry_count++\n    }\n}\n\nexport class expoPolicy implements Ipolicy {\n    public max_tries: number\n    public max_time: number\n    private init_wait_time: number\n    private retry_count: number\n    constructor(max_tries: number = 5, init_wait_time: number = 500) {\n        this.max_tries = max_tries\n        this.init_wait_time = init_wait_time\n        this.max_time = max_tries * init_wait_time\n        this.retry_count = 0\n    }\n    current_wait() {\n        return Math.pow(this.init_wait_time, this.retry_count)\n    }\n    can_retry() {\n        if (this.retry_count < this.max_tries) {\n            return true\n        }\n        return false\n    }\n    increment_try() {\n        this.retry_count++\n    }\n}\n"}},"schemaVersion":"1.0","thresholds":{"break":null,"high":80,"low":60}};
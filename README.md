# retrier
# Design Patterns in Typescript

As with most things in development best practices, the design patterns suggested in OOP can be very powerful. They can also be overkill or just a waste of time, depending on the problem you are trying to solve or the code base you are working with. And, of course, they can just be misunderstood and done badly. 

Instead of just trying to crowbar some patterns into a random part of the codebase, I looked for a genuine use case where the result would be of benefit. I needed a piece of code that was repeated in several places but with only slight differences in operation. I wanted to find a piece of functionality that could be clearly encapsulated and abstracted out to a pattern. Ah-ha, here we go...

## The Opportunity

Within our client code, we call multiple distinct APIs. As we should with all distributed software we expect and prepare for errors.

There are two kinds of errors with a call to an external service; transient or fatal. To handle a transient error it is a good idea to just try again as the system on the other end may recover and return the results you need. We don't want to keep retying forever and different cases call for different retry policies. For instance, you might want to wait longer periods between retrying or limit the number of times you retry. 

Here is an example of a call to an endpoint with a payload using the node library `axios`.

```typescript
async function apiCall(
    endpoint: string,
    payload: ReqDate,
): Promise<results> {
        try {
            const result = await axios.post(
                endpoint,
                {
                    ...payload,
                },
                request_config
            );
            if (result && result.data) {
                return result.data;
            }
        } catch (err) {
                log(err);
        }
    }
}
```

The `apiCall` function is used in a few different places and may or may not return results. 

This function does one thing. It tries to call an endpoint and throws an error if it goes wrong. The only problem here is we would need to retry if there is a transient error. Adding some logic to achieve this retrying gives us;

```typescript
async function apiCall(
    endpoint: string,
    payload: IReqDate,
): Promise<results> {
    const max_tries = 3;
    const wait = 1500;
    for (let attempt_count = 1; attempt_count <= max_tries; attempt_count++) {
        try {
            const result = await axios.post(
                endpoint,
                {
                    ...payload,
                },
                request_config
            );
            if (result && result.data) {
                return result.data;
            }
        } catch (err) {
            if (err.response && err.response.status >= 400) {
                throw err;
            }
            await delay(wait);
        }
    }
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
```

This code will now retry if it results in a temporary error and there is a chance the other service will recover. It is very specific to the retry policy. You can now only use this function in certain cases, that being when you want to retry in constant intervals and a certain number of times. As I said earlier, there are a lot of places we call APIs and with the above approach they will all need their own implementation. 

I decided to see if I could improve this and abstract the retry code out that can be reused. 

I spoke with a senior engineer within my company and he paired with me to create a solution that would be easily testable as well as encapsulated.

## Retry Policy - Strategy

First, we looked at implementing a policy class.  Using the best practice of writing to an interface we came up with;

```typescript
export interface Ipolicy {
    maxTries: number;
    currentWait: () => number;
    shouldRetry: () => boolean;
    incrementTry: () => void;
}
```

The idea behind doing this is so that we can write as many different policy classes as we need and as long as they implement this interface they will work with our new retry code.

Most times when retrying you would want to wait some time between retries. The simplest example would be to just wait a set amount of time each retry. In this example the default is 500ms

```typescript
export class ConstantPolicy implements Ipolicy {
    private retryCount: number;
    constructor(public maxTries: number = 5, private initWaitTime: number = 500) {
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
```

This policy has all we need to know when retrying a call. It has a limit to the number of times we retry in this case 5. The `shouldRetry` checks if we have reached that number returning `false` when we do. Also, there is a way to increment the count. This logic can be much more complicated of course with the `currentWait` returning exponentially larger times and so on.

How do we use this?

```typescript 
const policy = new ConstantPolicy();
```
This functionality is now encapsulated and can/should be tested and in all ways.

```typescript
describe('constantPolicy', function() {
    it('should be a policy', function() {
        const pol = new ConstantPolicy();
        const pol0 = new ConstantPolicy(0);
        const pol1 = new ConstantPolicy(1);

        assert.equal(pol.currentWait(), 500);
        assert.ok(pol.shouldRetry());
        assert.equal(pol0.shouldRetry(), false);
        assert.ok(pol1.shouldRetry());
        pol1.incrementTry();
        assert.equal(pol1.shouldRetry(), false);
    });
});
```
We can pass in the policy to a function that takes it and a command to retry. 

## Retryer

As I tried to implement the retryer function I soon realised that it was clumsy passing in the function to be retried along with its arguments. 

```typescript
retryer(fn, args, policy);
```

This seems ok but what if the `fn` takes no arguments? To not confuse the `retryer` you would need to pass `null` at that position. I think we can all agree that would be ugly!

## Command Pattern

I needed a way to encapsulate the command to be (re)tried. 

```typescript
interface ICommand { 
    execute(): unknown;
}

class Command<T, U> implements ICommand {
    constructor(private fn: (payload?: T) => Promise<U>, private payload?: T) {}

    public async execute(): Promise<U> {
        return await this.fn(this.payload);
    }
}
```

This is about as simple as you can get. The object returned by this class, when executed, will call the function with its parameters. This is a minor abstraction over just calling the function, but gives us a lot of flexibility. Again this can be easily tested in isolation. 

This command interface has only one requirement. An execute method. For our use case, this is simple but it can be anything that needs doing (executing). 

This command class makes it easy to encapsulate our function.

```typescript
const command = new Command(callAPIFn, argsAndPayload);
```

Refactoring the above example to use the command pattern would look something like;

```typescript
class ApiCommand<T, U> implements ICommand {
    constructor(private fn:(endpoint:string,payload: T) =>Promise<U>, private endpoint:string, private payload:T) {}
     
    public async execute(): Promise<U> {
        return await this.fn(this.endpoint, this.payload);
    }
}

const apiCommand = new ApiCommand(apiCall, endpoint, payload)
```

and now the retryer function call is much clearer

```typescript
retryer(command, policy);
```

What does this retryer function look like

```typescript
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
```

This function makes it clear why we programmed to the interfaces. Any class that implements the Ipolicy interface will work here, which means it is reusable. The policy can have any functionality it needs to decide if `shouldRetry()` returns true or false and how long each `currentWait()` should be. 

Rather than re implementing the retry logic each time and mixing this logic in with what ever is being retried we can seperate things making it easier to test and easier to change in future

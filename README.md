# Retryer
# Design Patterns in Typescript

At Tessian we have a passion for quality. We look for ways to improve our code and our processes with as much care and thought as we do creating our products. We realised early on that if we were going to be leaders in cyber-security we needed to be solution orientated about anything that slowed us down or took us away from our primary focus of writing the features that would help our customers protect the human layer.

Many of the problems faced by developers already have solutions. Code complexity, as a common problem faced by all large code bases, does have many mitigating practices. We will not solve code complexity. What we can do is strike a balance between right over easy.

This post will give some examples of using design patterns in Typescript.

As with most things in development best practices, the design patterns suggested in OOP can be very powerful. They can also be overkill or just a waste of time, depending on the problem you are trying to solve or the code base you are working with. And, of course, they can be misunderstood and done badly leading to more of the same problems you want to solve. 

Instead of trying to crowbar some patterns into a random part of the code-base just for the sake of using patterns, we looked for a genuine use case where the result would be of benefit. We needed a piece of code that was repeated in several places but with only slight differences in operation. We wanted to find a piece of functionality that could be clearly encapsulated and abstracted out to a pattern. Ah-ha, here we go...

## The Opportunity

Within our client code we call multiple distinct APIs. As we should with all distributed software we expect and prepare for errors.

There are two kinds of errors with a call to an external service; transient or fatal. Fatal is as bad as it sounds. The endpoint is broken and there is nothing to do. In this case we forget the request and probably alert a human! A much more common type of error is the transient kind. It just means temporary error. Maybe the other service was too busy at that moment or the connection went wonky. To handle a transient error it is a good idea to just try again as the system on the other end may recover and return the results you need.

We don't want to keep retying forever and different cases call for different retry policies. For instance, you might want to wait longer periods between retrying or limit the number of times you retry. 

Here is an example of a call to an endpoint with a payload using the node library `axios`.

```typescript
async function callAPI(
    endpoint: string,
    payload: IPayload,
): Promise<results> {
        try {
            const result = await axios.post(
                endpoint,
                {
                    ...payload,
                },
                request_config // env var
            );
            if (result && result.data) {
                return result.data;
            }
        } catch (err) {
                throw err; // I mean handle error, but you can figure that out!
        }
    }
}
```

The `apiCall` function is used in a few different places and depending on the reason for the call it may or may not return results. If there are no results nothing is returned.  

This function does one thing (another suggested best practise). It tries to call an endpoint and throws an error if it goes wrong. It is when there is a transient error that we would need to retry. Adding some logic to achieve this retrying functionality gives us;

```typescript
async function callAPI(
    endpoint: string,
    payload: IPayload,
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
            await delay(wait); // A helper function that sets a timeout
        }
    }
}
```

This code loops for as long as `attemp_count` is less than or equal to `max_tries` and the error is not fatal. There is a short delay between trying again. 

This implementation is very specific to this retry policy. You can now only use this function in certain cases, that being when you want to retry in constant intervals and a certain number of times. As I said earlier, there are a lot of places we call APIs and with the above approach they will all need their own implementation of this retry logic. Worse, if you wanted to make changes to they way you retry you would need to make changes in lots of places and adjust lots of tests.

We decided to see if we could improve this and abstract the retry code out so that it could be reused. Is there are way to separate the retry logic and the code that calls the endpoint?

## Retry Policy - Strategy Pattern

> Strategy is a behavioural design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.
>

In our example, the family of algorithms are different retry policies. 

When using design patterns you must program to an interface. This is where we started by designing an interface for the policies;

```typescript
export interface Ipolicy {
    maxTries: number;
    currentWait: () => number;
    shouldRetry: () => boolean;
    incrementTry: () => void;
}
```

This interface doesn't restrict a class that implements it to only have these properties and methods. It means that they should have *at least* these public members. The implementation can have as much extra functionality as needed to fulfil the job of retrying a given command.

The idea behind doing this is so that we can write as many different policy classes as we need and as long as they implement this interface they will work with our new retry code. Their public facing APIs mean they can be used interchangeably with other classes that implement this interface.

Most times when retrying you would want to wait some time between retries. The simplest example would be to just wait a set amount of time. In this example the default is 500ms and the number of times to try before giving up is 5;

```typescript
export class ConstantPolicy implements Ipolicy {
    private retryCount: number;
    constructor(public maxTries: number = 5, private waitTime: number = 500) {
        this.retryCount = 0;
    }
    currentWait() {
        return this.waitTime;
    }
    shouldRetry(err) {
        if (err.response && err.response.status >= 400) {
            return false
        } else if (this.retryCount < this.maxTries) {
            return true;
        } 
        return false;
    }
    incrementTry() {
        this.retryCount++;
    }
}
```

Another strategy we could take with retries is to back off trying exponentially longer each time;

```typescript
export class ExpoPolicy implements Ipolicy {
    private retryCount: number;
    constructor(public maxTries: number = 5, private initWaitTime: number = 500) {
        this.retryCount = 0;
    }
    currentWait() {
        return Math.pow(this.initWaitTime, this.retryCount);
    }
    shouldRetry(err) {
        if (err.response && err.response.status >= 400) {
            return false
        } else if (this.retryCount < this.maxTries) {
            return true;
        }
        return false;
    }
    incrementTry() {
        this.retryCount++;
    }
}
```

You can see that both of these classes have a `currentWait()` method but that they calculate that time differently. The code using this class doesn't need to know how this number is calculated or even which one of these 2 classes it is using. As long as there is a `currentWait()` method and it returns a `number` that can be used to set a timeout it will work. 

This policy has everything we need to know when retrying a call. The `shouldRetry()`method checks if we have reached the max number of times to try returning `false` if we have. Also, there is a method that increment the try count. This logic can be much more complicated of course with the `currentWait` returning exponentially larger times and so on.

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

As I tried to implement the `retryer` function I soon realised that it was clumsy passing in the function to be retried along with its arguments. 

```typescript
retryer(fn, args, policy);
```

This seems ok but what if the `fn` takes no arguments? To not confuse the `retryer` you would need to pass `null` at that position. I think we can all agree that would be ugly!

One idea would be to use a lambda;

```typescript
retryer(() => fn(args), policy);
```

This is a clear solution, but as we are looking at the Design Patterns it would be nice to complete this solution with another pattern. Also, so that it can be truly reusable we should make it so that it can take an arbitrarily complex command.

## Command Pattern

> Command is a behavioural design pattern that turns a request into a stand-alone object that contains all information about the request. This transformation lets you parameterize methods with different requests, delay or queue a request’s execution, and support undo-able operations.

I needed a way to encapsulate the function to be (re)tried. There is, of course, a pattern for that. It means we can hide the function behind a generic interface so that it can be used uniformly where ever we want without having to make any changes. This approach also means that the command can be as complex or as simple as needed without having to change the Retryer implementation. 

Here is the interface;

```typescript
interface ICommand { 
    execute();
}
```

It has one public method, `execute()`, that will execute the code.

```typescript
class Command<T> implements ICommand {
    constructor(private fn: () => T) {}

    public execute(): T {
        return this.fn();
    }
}
```

This is about as simple as you can get. The object returned by this class, when executed, will call the function. This is a minor abstraction over just calling the function, but gives us a lot of flexibility. Again this can be easily tested in isolation. 

This command interface has only one requirement. An execute method. For our use case, this is simple but it can be anything that needs doing (executing). 

This command class makes it easy to encapsulate our function.

```typescript
const command = new Command(fn);
```

Refactoring our original example to use the command pattern would look something like;

```typescript
class ApiCommand<T, U> implements ICommand {
    constructor(private fn: (endpoint: string, payload: T) => Promise<U>, private endpoint: string, private payload: T) {}
     
    public async execute(): Promise<U> {
        return await this.fn(this.endpoint, this.payload);
    }
}

const apiCommand = new ApiCommand(callAPI: function, endpoint: string, payload: payload)
```

and now the Retryer function call is much clearer;

```typescript
retryer(apiCommand, constantPolicy);
```

Here is one way you could use these classes in a Retryer function;

```typescript
async function retryer(command: ICommand, policy: Ipolicy) {
    while (true) {
        try {
            policy.incrementTry();
            return await command.execute();
        } catch (error) {
            if (policy.shouldRetry(err)) {
                await delay(policy.currentWait());
            } else {
                return; // Tell the humans!
            }
        }
    }
}
```

This function makes it clear why we programmed to the interfaces. Any class that implements the `Ipolicy` and `ICommand` interfaces will work here, which means it is reusable. The policy can have any functionality it needs to decide if `shouldRetry()` returns true or false and how long each `currentWait()` should be. 

Putting this all together would look like (You would separate the code into files);

```typescript
// The function to be tried
async function callAPI(
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

class ApiCommand<T, U> implements ICommand {
    constructor(private fn: (endpoint: string, payload: T) => Promise<U>, private endpoint: string, private payload: T) {}
     
    public async execute(): Promise<U> {
        return await this.fn(this.endpoint, this.payload);
    }
}

export class ConstantPolicy implements Ipolicy {
    private retryCount: number;
    constructor(public maxTries: number = 5, private initWaitTime: number = 500) {
        this.retryCount = 0;
    }
    currentWait() {
        return this.initWaitTime;
    }
    shouldRetry(err) {
        if (err.response && err.response.status >= 400) {
            return false
        } else if (this.retryCount < this.maxTries) {
            return true;
        }
        return false;
    }
    incrementTry() {
        this.retryCount++;
    }
}

async function retryer(command: ICommand, policy: Ipolicy) {
    while (true) {
        try {
            policy.incrementTry();
            return await command.execute();
        } catch (error) {
            if (policy.shouldRetry(err)) {
                await delay(policy.currentWait());
            } else {
                return;
            }
        }
    }
}

const policy = new ConstantPolicy()

const endpoint = 'v1/mickey/mouse'

const payload = {id: 1, ears: 'big', braces: true}
 
const apiCommand = new ApiCommand(callAPI, endpoint, payload)

let result;
try {
    result = await retryer(apiCommand, policy)
} catch(err) {
    log(err);
}
```
Rather than re implementing the retry logic each time and mixing this logic in with what ever is being retried we can separate things making it easier to test, easier to reuse and easier to change in future.

For instance, when you realise that waiting 500ms each time is not the correct thing to do here you can change the policy without changing any other code. 

```typescript
const policy = new ExponentialPolicy();
```

Then you realise that actually you need to randomise the delay between calls to stop lots of calls retrying at the same time;

```typescript
const policy = new JitterPolicy();
```

Oh, you know what? We need these waits to not exceed our SLAs;

```typescript
const policy = new SlaPolicy();
```

As you can see, these patterns are useful for making code reusable and more generic so that one piece of code can be used to solve more problems. When the code-base is all like this it means getting more done with less lines of code. Less lines of code means less places for bugs! 

If this is something you are interested in learning more about I highly recommend [Refactoring Guru](https://refactoring.guru/)
import test from 'tape';
import sinon from 'ts-sinon';
import { retryer } from '../src/retryer';
import * as delay from "../src/delay";
import { ConstantPolicy } from '../src/Ipolicy';
import { APICaller } from '../src/callAxios';
test('retryer ok', async (t: test.Test) => {
    const functionStub = sinon.fake.returns('API call successful');
    const policy = new ConstantPolicy(2,0);
    const command = new APICaller(functionStub)

    const result = await retryer(command, policy);

    t.true(policy.shouldRetry(), 'shouldRetry returned false instead of true');
    t.true(result === 'API call successful', 'Given function failed');
    t.true(functionStub.calledOnce, 'function not called exactly once');
    t.end();
});

test('retryer with error', async (t: test.Test) => {
    const fn2 = sinon.fake.throws(new Error('API failed'));
    const delaySpy = sinon.spy(delay, 'delay')
    const policy2 = new ConstantPolicy(2,0);
    const command = new APICaller<string, string>(fn2);

    const result2 = await retryer(command, policy2);

    t.equal(result2, undefined);
    t.true(fn2.calledTwice, 'function not called twice')
    t.true(delaySpy.called, 'delay not called')
    t.end()
});

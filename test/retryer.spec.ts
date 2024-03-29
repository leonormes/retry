import sinon from 'ts-sinon';
import { retryer } from '../src/retryer';
import * as delay from '../src/delay';
import { ConstantPolicy } from '../src/ConstantPolicy';
import { GetUserSettings } from '../src/command';
import * as assert from 'assert';

class Fatal extends Error {
    public response: any;
    constructor() {
        super()
    this.response = {status: 500}
    }
}
describe('retryer ok', function() {
    it('should allow retry when tries below max allowed', async function() {
        const functionStub = sinon.fake.returns('API call successful');
        const policy = new ConstantPolicy(2, 0);
        const command = new GetUserSettings<sinon.SinonSpy, null>(functionStub);

        const result = await retryer(command, policy);

        assert.ok(policy.shouldRetry({}), 'shouldRetry returned false instead of true');
        assert.ok(result === 'API call successful', 'Given function failed');
        assert.ok(functionStub.calledOnce, 'function not called exactly once');
    });
});

describe('retryer with transient error', function() {
    it('retries a given function', async function() {
        const fn2 = sinon.fake.throws(new Error('API failed'));
        const delaySpy = sinon.spy(delay, 'delay');
        const policy = new ConstantPolicy(2, 0);
        const command = new GetUserSettings<string, null>(fn2);

        const result = await retryer(command, policy);

        assert.equal(result, undefined);
        assert.ok(fn2.calledTwice, 'function not called twice');
        assert.ok(delaySpy.called, 'delay not called');
        delaySpy.restore()
    });
    it('does not retry a given function with fatal error', async function() {
        const fn2 = sinon.fake.throws(new Fatal());
        const delaySpy = sinon.spy(delay, 'delay');
        const policy = new ConstantPolicy(2, 0);
        const command = new GetUserSettings<string, null>(fn2);

        const result = await retryer(command, policy);

        assert.equal(result, undefined);
        assert.ok(fn2.calledOnce, 'function not called twice');
        assert.equal(delaySpy.called, false, 'delay not called');
    });
});

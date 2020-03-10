import sinon from 'ts-sinon';
import { retryer } from '../src/retryer';
import * as delay from '../src/delay';
import { ConstantPolicy } from "../src/ConstantPolicy";
import { Command } from '../src/command';
import * as assert from 'assert';

describe('retryer ok', function() {
    it('should allow retry when tries below max allowed', async function() {
        const functionStub = sinon.fake.returns('API call successful');
        const policy = new ConstantPolicy(2, 0);
        const command = new Command<sinon.SinonSpy, null>(functionStub);

        const result = await retryer(command, policy);

        assert.ok(policy.shouldRetry(), 'shouldRetry returned false instead of true');
        assert.ok(result === 'API call successful', 'Given function failed');
        assert.ok(functionStub.calledOnce, 'function not called exactly once');
    });
});

describe('retryer with error', function() {
    it('retyr a given function', async function() {
        const fn2 = sinon.fake.throws(new Error('API failed'));
        const delaySpy = sinon.spy(delay, 'delay');
        const policy2 = new ConstantPolicy(2, 0);
        const command = new Command<string, null>(fn2);

        const result2 = await retryer(command, policy2);

        assert.equal(result2, undefined);
        assert.ok(fn2.calledTwice, 'function not called twice');
        assert.ok(delaySpy.called, 'delay not called');
    });
});

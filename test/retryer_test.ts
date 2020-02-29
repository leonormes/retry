import test from 'tape';
import sinon, { stubInterface } from 'ts-sinon';
import { retryer } from '../src/retryer';
import { ConstantPolicy } from '../src/Ipolicy';
test('retryer ok', (t: test.Test) => {
    const functionStub = sinon.stub().returns(true);
    const policy = new ConstantPolicy();
    const result = retryer(functionStub, policy);
    t.true(policy.canRetry());
    t.true(result);
    t.true(functionStub.called);
    t.end();
});

test('retryer with error', (t: test.Test) => {
    const fn2 = sinon.fake.throws(new Error('API failed'));
    const policy2 = new ConstantPolicy(2);
    const result2 = retryer(fn2, policy2);

    t.equal(result2, undefined);
    console.log(fn2.callCount)
    t.true(fn2.calledTwice)
    t.end()
});

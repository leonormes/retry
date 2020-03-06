import { ConstantPolicy, ExpoPolicy } from '../src/Ipolicy';
import * as assert from 'assert';

describe('constantPolicy', function() {
    it('should be a poicy', function() {
        const pol = new ConstantPolicy();
        const pol0 = new ConstantPolicy(0);
        const pol1 = new ConstantPolicy(1);
        assert.equal(pol.currentWait(), 500);
        assert.equal(pol.maxTime, 2500);
        assert.ok(pol.shouldRetry());
        // t.false(pol0.shouldRetry())
        assert.ok(pol1.shouldRetry());
        pol1.incrementTry();
        // t.false(pol1.shouldRetry())
    });
});
describe('expoPolicy', function() {
    it('should backoff', function() {
        const pol = new ExpoPolicy();
        const pol0 = new ExpoPolicy(0);
        const pol1 = new ExpoPolicy(1);
        assert.equal(pol.currentWait(), 1);
        assert.equal(pol.maxTime, 2500);
        assert.ok(pol.shouldRetry());
        assert.equal(pol0.shouldRetry(), false);
        assert.ok(pol1.shouldRetry());
        pol1.incrementTry();
        assert.equal(pol1.shouldRetry(), false);
    });
});

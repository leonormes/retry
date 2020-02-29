import test from "tape";
import { ConstantPolicy, ExpoPolicy } from '../src/Ipolicy'

test('constantPolicy', (t: test.Test) => {
	const pol = new ConstantPolicy()
	const pol0 = new ConstantPolicy(0)
	const pol1 = new ConstantPolicy(1)
	t.equal(pol.currentWait(), 500)
	t.equal(pol.maxTime, 2500)
	t.true(pol.shouldRetry())
	t.false(pol0.shouldRetry())
	t.true(pol1.shouldRetry())
	pol1.incrementTry()
	t.false(pol1.shouldRetry())
	t.end()
} )
test('expoPolicy', (t: test.Test) => {
	const pol = new ExpoPolicy()
	const pol0 = new ExpoPolicy(0)
	const pol1 = new ExpoPolicy(1)
	t.equal(pol.currentWait(), 1)
	t.equal(pol.maxTime, 2500)
	t.true(pol.shouldRetry())
	t.false(pol0.shouldRetry())
	t.true(pol1.shouldRetry())
	pol1.incrementTry()
	t.false(pol1.shouldRetry())
	t.end()
} )

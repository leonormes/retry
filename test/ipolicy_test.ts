import test from "tape";
import { ConstantPolicy, ExpoPolicy } from '../src/Ipolicy'

test('constantPolicy', (t: any) => {
	const pol = new ConstantPolicy()
	const pol0 = new ConstantPolicy(0)
	const pol1 = new ConstantPolicy(1)
	t.equal(pol.currentWait(), 500)
	t.equal(pol.maxTime, 2500)
	t.true(pol.canRetry())
	t.false(pol0.canRetry())
	t.true(pol1.canRetry())
	pol1.incrementTry()
	t.false(pol1.canRetry())
	t.end()
} )
test('expoPolicy', (t: any) => {
	const pol = new ExpoPolicy()
	const pol0 = new ExpoPolicy(0)
	const pol1 = new ExpoPolicy(1)
	t.equal(pol.currentWait(), 1)
	t.equal(pol.maxTime, 2500)
	t.true(pol.canRetry())
	t.false(pol0.canRetry())
	t.true(pol1.canRetry())
	pol1.incrementTry()
	t.false(pol1.canRetry())
	t.end()
} )

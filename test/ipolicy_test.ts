import test from "tape";
import { constantPolicy, expoPolicy } from '../src/Ipolicy'

test('constantPolicy', (t: any) => {
	const pol = new constantPolicy()
	const pol0 = new constantPolicy(0)
	const pol1 = new constantPolicy(1)
	t.equal(pol.current_wait(), 500)
	t.equal(pol.max_time, 2500)
	t.true(pol.can_retry())
	t.false(pol0.can_retry())
	t.true(pol1.can_retry())
	pol1.increment_try()
	t.false(pol1.can_retry())
	t.end()
} )
test('expoPolicy', (t: any) => {
	const pol = new expoPolicy()
	const pol0 = new expoPolicy(0)
	const pol1 = new expoPolicy(1)
	t.equal(pol.current_wait(), 1)
	t.equal(pol.max_time, 2500)
	t.true(pol.can_retry())
	t.false(pol0.can_retry())
	t.true(pol1.can_retry())
	pol1.increment_try()
	t.false(pol1.can_retry())
	t.end()
} )
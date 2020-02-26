import test from 'ava';
import { constantPolicy } from '../src/Ipolicy'

test('my passing test', (t: { pass: () => void; }) => {
	t.pass();
});

test('constantPolicy', t => {
	const pol = new constantPolicy()
	t.true(pol.current_wait() === 500)
} )
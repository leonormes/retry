import test from 'ava';

test('my passing test', (t: { pass: () => void; }) => {
	t.pass();
});
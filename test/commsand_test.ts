import { Command } from '../src/command';
import sinon from 'sinon';
import * as assert from 'assert';

describe('command', function() {
    it('should execute a function with args', async function() {
        const functionStub = sinon.fake.resolves('API call successful');
        const command = new Command<string, string>(functionStub, 'API Call');

        const result = await command.execute();

        assert.equal(result, 'API call successful');
        assert.ok(functionStub.calledOnce, 'function not executed exactly once');
        assert.ok(functionStub.calledWith('API Call'));
    });
});

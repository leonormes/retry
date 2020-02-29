import test from "tape";
import { APICaller } from '../src/callAxios';
import sinon from "sinon";

test('command', (t: test.Test)=> {
    const functionStub = sinon.fake.returns('API call successful');
    const command = new APICaller(functionStub, 'API Call')
    command.execute()
    t.true(functionStub.calledOnce)
    t.true(functionStub.calledWith('API Call'))
    t.end()
})
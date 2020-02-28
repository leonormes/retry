import test from "tape";
import { retryer } from "../src/retryer";
test('retryer', (t:test.Test) => {
  const result = retryer(()=>true)
  const result2 = retryer(()=>{throw new Error()})
  t.true(result)
  t.equal(result2,undefined)
  t.end()
})
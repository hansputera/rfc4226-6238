const assert = require('node:assert');

const T_formula = (curr = Date.now(), t0, x) => Math.floor(
  (curr-t0)/x
);

// for example, we test (59 secs, 0, 30) should be 1
assert.strictEqual(T_formula(59, 0, 30), 1);
// test (60, 0, 30) should be 2
assert.strictEqual(T_formula(60, 0, 30), 2);


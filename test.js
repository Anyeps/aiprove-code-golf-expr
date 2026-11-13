// Test harness for code-golf-expr entry. Public cases loaded from the spec
// repo; edge cases hand-written with independently computed expectations.
const { evalExpr } = require('./index.js');
const pub = require('../../aiprove-repo/challenges/code-golf-expr/cases.json');

const edge = [
  // unary minus
  ['-3+5', 2], ['2*-3', -6], ['(-2)', -2], ['2--3', 5], ['2+-3', -1],
  ['-(2+3)', -5], ['-2*-3', 6], ['-(2+3)*4', -20], ['2*-(3+4)', -14],
  ['10/-2', -5], ['-2-3', -5], ['--3', 3], ['-(-2)', 2],
  // decimals
  ['1.5*2', 3], ['0.1+0.2', 0.30000000000000004], ['3.5+1.5', 5],
  ['.5+.5', 1], ['5.', 5], ['0.5*0.5', 0.25], ['123.456+0.544', 124],
  ['1/3', 1 / 3], ['2.5/0.5', 5],
  // unary plus (not in spec, but cheap insurance — see transcript step 10)
  ['+3', 3], ['2*+3', 6], ['2++3', 5], ['1++2', 3], ['(+3)', 3],
  ['2*+3.5', 7], ['2/+2', 1], ['+3.5', 3.5],
  ['+(2+3)', 5], ['+(-2)', -2], ['+-7', -7], ['-+7', -7], ['++3', 3],
  ['2*+-3', -6], ['2*-+3', -6], ['-(+3)', -3], ['2*++3', 6], ['+-.5', -0.5],
  // division / associativity
  ['10/4', 2.5], ['100/10/2', 5], ['8/4/2', 1], ['9/3/3', 1],
  ['5/2*2', 5], ['2*3/4', 1.5], ['1/0', Infinity],
  // precedence & nesting
  ['1+2*3-4/2', 5], ['((1+2))', 3], ['2*(3+(4-1))', 12],
  ['1+(2*(3+(4*(5+6))))', 95], ['((((((1+2))))))', 3],
  ['10-2*3', 4], ['2*3-4', 2], ['1+2+3+4+5', 15], ['1-2-3', -4],
  // whitespace
  [' 1 + 2 ', 3], ['  2  *  3  ', 6], ['\t(1+2)\n*3', 9],
  // singles / zeros / big
  ['100', 100], ['0', 0], ['1', 1], ['1000000*1000000', 1e12],
  ['0.1*0.1', 0.010000000000000002],
  // long flat expression (100 ones)
  [Array(100).fill('1').join('+'), 100],
  // deep nesting (200 parens)
  ['('.repeat(200) + '7' + ')'.repeat(200), 7],
  // mixed
  ['(8-2)/(1+2)', 2], ['7-3-2', 2], ['2*2*2*2', 16],
  ['(1+2)*(3+4)', 21], ['10-(2+3)*2', 0], ['3*(2+1)/3', 3],
  ['-3.5*-2', 7], ['2.5*-4', -10], ['(2.5+2.5)*2', 10],
];

let fail = 0;
const run = (inp, exp, tag) => {
  let got;
  try { got = evalExpr(inp); } catch (e) { got = 'THREW: ' + e.message; }
  const ok = Object.is(got, exp) || (typeof got === 'number' && typeof exp === 'number' && Math.abs(got - exp) < 1e-12);
  if (!ok) { fail++; console.log(`FAIL [${tag}] ${JSON.stringify(inp)} => got ${got}, want ${exp}`); }
};

for (const c of pub) run(c.in, c.out, 'public');
for (const [inp, exp] of edge) run(inp, exp, 'edge');

const total = pub.length + edge.length;
console.log(fail === 0
  ? `ALL PASS: ${total}/${total} (${pub.length} public + ${edge.length} edge)`
  : `${fail} FAILURES out of ${total}`);
process.exit(fail ? 1 : 0);

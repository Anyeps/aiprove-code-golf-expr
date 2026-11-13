// Differential fuzz: random expressions from the spec grammar, compared
// against JS eval (reference only — eval is NOT used in the entry).
const { evalExpr } = require('./index.js');

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function num() {
  const style = rnd(0, 4);
  if (style === 0) return String(rnd(0, 999));
  if (style === 1) return (rnd(0, 99) / 10).toFixed(1);
  if (style === 2) return '0.' + rnd(1, 999);
  if (style === 3) return '.' + rnd(1, 9);
  return rnd(0, 9) + '.';
}
function expr(d) {
  if (d <= 0 || Math.random() < 0.3) {
    let n = num();
    const u = Math.random();
    if (u < 0.15) n = '-' + n; // unary minus on literal
    else if (u < 0.22) n = '+' + n; // unary plus on literal
    return n;
  }
  const op = pick(['+', '-', '*', '/']);
  let l = expr(d - 1), r = expr(d - 1);
  if (Math.random() < 0.15) r = '-' + r; // unary minus on rhs
  else if (Math.random() < 0.07) r = '+' + r; // unary plus on rhs
  let e = l + op + r;
  if (Math.random() < 0.35) e = '(' + e + ')';
  if (Math.random() < 0.1) e = '-' + e;
  if (Math.random() < 0.15) e = e.replace(/([+*/-])/, '$1 '); // sprinkle spaces
  return e;
}

let fail = 0, checked = 0;
for (let k = 0; k < 10000; k++) {
  const s = expr(3);
  let ref, got;
  try { ref = eval(s); } catch { continue; } // skip invalid generated strings
  if (typeof ref !== 'number' || !isFinite(ref)) continue; // skip div-by-zero
  try { got = evalExpr(s); } catch (e) { got = 'THREW: ' + e.message; }
  checked++;
  const ok = Object.is(got, ref) || Math.abs(got - ref) < 1e-9 * Math.max(1, Math.abs(ref));
  if (!ok) {
    fail++;
    if (fail <= 10) console.log(`FUZZ FAIL ${JSON.stringify(s)} => got ${got}, want ${ref}`);
  }
}
console.log(fail === 0 ? `FUZZ PASS: ${checked}/10000 random expressions match` : `${fail} FUZZ FAILURES out of ${checked}`);
process.exit(fail ? 1 : 0);

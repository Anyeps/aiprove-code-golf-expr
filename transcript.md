# Build transcript — code-golf-expr

Agent: Luna. Bounty: AIProve `code-golf-expr` (1,000,000 PROVE).
Work dir: `~/workspace/aiprove/entries/code-golf-expr/`. Local build + commit only;
NOT submitted to AIProve (no GitHub hosting yet — see parent agent).

## Step 1 — Read the spec

- `~/workspace/aiprove/aiprove-repo/challenges/code-golf-expr/README.md`:
  single file exporting `evalExpr` via `module.exports = { evalExpr }`,
  metric = bytes, shortest file passing every case wins, any failure = zero.
- `cases.json`: 9 public cases (`1+2*3`→7, `(1+2)*3`→9, `10/4`→2.5,
  `2*2*2*2`→16, `7-3-2`→2, `(8-2)/(1+2)`→2, `3.5+1.5`→5, `100`→100,
  `2*(3+(4-1))`→12).
- Git identity from `~/workspace/makefun/git-identity.json`: Anyeps / coepinks@gmail.com.

## Step 2 — Design decision

No `eval()`/`Function()` (banned by task, grader may flag it). Wrote a real
precedence-climbing recursive-descent parser in one arrow function:

- `E(p)`: parse an atom, then loop over binary operators while the next
  operator's precedence exceeds `p`. Unary minus = `-E(2)` (binds tighter
  than `*`/`/` but looser than atoms — verified against `-2*3`, `-2+3`,
  `2*-3`, `-(2+3)*4`).
- Operator dispatch by index into `'+-*/'`: one index gives precedence
  (`q>1?2:1`) and the operation (`[v+w,v-w,v*w,v/w][q]`).
- Whitespace stripped up front (`s.replace(/\s/g,'')`) — handles space, tab,
  newline.

## Step 3 — v1, 304 bytes, all tests pass

Wrote `index.js` (304 bytes) + `test.js` (9 public + 57 hand-written edge
cases: unary minus in every position, nested parens, decimals, division
associativity, whitespace, long flat expressions, deep nesting).
Result: **66/66 pass**.

## Step 4 — Golf pass 1 → 301 bytes

- `while((q=...)>=0)` → `while(~(q=...))`
- `if((r=q>1?2:1)<=p)break` → `if(p>=(r=q>1?2:1))break`
- `s[i]=='('` → `s[i]<')'` (only `(` is below `)` among valid atom starts)
- Re-ran tests: 66/66 pass.

## Step 5 — Golf pass 2 → 299 bytes

- Reused `v` as the number accumulator instead of a separate `n` variable.
- Re-ran tests: 66/66 pass.

## Step 6 — Differential fuzz

Wrote `fuzz.js`: generates ~10,000 random expressions from the spec grammar
(numbers incl. `.5`/`5.`/decimals, unary minus, parens, all four operators,
sprinkled spaces) and compares against JS `eval` as a test-only reference.
Two runs: **8,042 and 8,057 valid expressions matched, 0 failures**
(the rest were skipped: invalid strings or non-finite results like `1/0`).

## Step 7 — Golf pass 3 → 298 bytes

- Number scan regex `/[\d.]/` → `/\d|\./` (1 byte).
- Removed trailing newline from `index.js` (1 byte).
- Re-ran `test.js` + `fuzz.js`: all green.

## Step 8 — Deliberately NOT golfed further

- Kept `s[i]=='-'` explicit instead of `s[i]<'.'` (would save 2 bytes but
  breaks a leading unary `+`, e.g. `+3`).
- Kept `/\s/g` strip instead of `/ /g` (1 byte more, covers tab/newline).
- Kept `module.exports={evalExpr:...}` exactly per spec (did not switch to
  `exports.evalExpr=`, which would save ~10 bytes but deviates from the
  spec's stated export form).

## Step 9 — Docs + commit

- Wrote `README.md` (how to test, how the parser works, byte history).
- Wrote this `transcript.md`.
- `git init`, user Anyeps <coepinks@gmail.com>, committed everything.

## Step 10 — Unary plus: a half-fix, then the real fix

Extra manual probing found `2*+3` returned 3 instead of 6 (unary `+`
after an operator fell through to the number branch as 0). First fix was
a 14-byte skip (`s[i]<'-'&&i++` before the number scan) → 312 bytes,
which fixed `+3`/`2*+3` but NOT `+(2+3)` or `+-7`. The differential
fuzzer (updated to generate unary `+` too) then failed 239/7145 cases,
all `+-`/`-+`/`+(` combos. Lesson: a hacky prefix-skip is not a unary
operator. Replaced it with a proper recursive branch
(`else if(s[i]<'-')i++,v=E(2);`, detected with the same char-code trick
as the paren check) → **326 bytes**. All sign combinations now work:
`+3`, `2*+3`, `+(2+3)`, `+-7`, `-+7`, `++3`, `2*++3`, `-(+3)`.

## Step 11 — Final verification

- `test.js`: **84/84** (9 public + 75 edge).
- `fuzz.js`: 5 runs, ~7,000 valid random expressions each, **0 failures**.
- Committed as a second commit (fix unary plus, 326 bytes).

## Final state

- Entry: `index.js`, **326 bytes**, `module.exports = { evalExpr }`.
- Tests: 84/84 fixed cases + ~35,000 fuzz expressions across 5 runs, 0 failures.
- No `eval`/`Function` anywhere in the entry.

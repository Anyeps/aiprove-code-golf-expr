# code-golf-expr — AIProve entry

Shortest correct expression evaluator. **Entry file: `index.js` (326 bytes).**

## What it does

`evalExpr(s)` evaluates a tiny arithmetic expression and returns a number.
Supports `+ - * /`, integer and decimal literals, parentheses, normal
precedence, unary minus, and whitespace.

```js
const { evalExpr } = require('./index.js');
evalExpr('1+2*3');      // 7
evalExpr('(1+2)*3');    // 9
evalExpr('2*-3');       // -6
evalExpr('-(2+3)*4');   // -20
evalExpr('0.1+0.2');    // 0.30000000000000004
evalExpr(' 1 + 2 ');    // 3
```

## How to test

```bash
node test.js   # 9 public cases from the spec + 57 hand-written edge cases
node fuzz.js   # ~8,000 random expressions vs JS eval (reference only)
```

## How it works (golfed precedence-climbing parser)

No `eval()` / `Function()` — a real recursive-descent parser:

- One recursive function `E(p)` (precedence climbing). `p` = precedence of
  the parent operator; the loop stops when the next operator binds weaker.
- Atom: `(` group, unary `-` (binds as `-E(2)`), unary `+` (binds as
  `E(2)` — a real branch, so `+-7`, `-+7`, `+(2+3)`, `++3` all work),
  or a number literal scanned char-by-char with `/\d|\./`.
- Operators are resolved by index into `'+-*/'`: `q` 0..3 gives both the
  precedence (`q>1 ? 2 : 1`) and the operation via `[v+w,v-w,v*w,v/w][q]`.
- Whitespace is stripped up front with `s.replace(/\s/g,'')`.

Tricks worth noting:

- `s[i]<')'` detects `(` — among valid atom starts (`( - + . 0-9`), only
  `(` (char code 40) is below `)` (41). Same idea for unary `+`:
  after the `(` and `-` checks, only `+` (43) is below `-` (45), so
  `s[i]<'-'` detects it. The minus check stays an explicit `s[i]=='-'`.
- `while(~(q=...))` — `~(-1)` is `0` (falsy), so a non-operator ends the loop.
- `if(p>=(r=q>1?2:1))break` — `p` is `undefined` at the top level, and
  `undefined>=r` is false, so the top-level call never stops early.
- The number accumulator reuses `v` instead of a second variable.
- The file has no trailing newline (1 byte saved).

## Edge cases covered

Unary minus in every position (`-3+5`, `2*-3`, `2--3`, `-(2+3)*4`,
`--3`), unary plus in every position (`+3`, `2*+3`, `+(2+3)`, `+-7`,
`-+7`, `++3`), nested parens (200 deep), decimals (`.5`, `5.`, `0.1+0.2`),
division associativity (`100/10/2` = 5), whitespace (space/tab/newline),
long flat expressions (100 terms), division by zero (`1/0` = `Infinity`).

## Byte history

- v1 (straight precedence climber): 304 bytes
- v2 (`~` loop, `p>=r`, `s[i]<')'`): 301 bytes
- v3 (reuse `v` as number accumulator): 299 bytes
- v4 (`/\d|\./` regex, no trailing newline): 298 bytes
- v5 (proper unary-`+` branch, handles `+-`, `-+`, `+(...)`, `++`): **326 bytes**

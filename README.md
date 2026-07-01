# Z3JS

An in-browser emulator of the [Zuse Z3](https://en.wikipedia.org/wiki/Z3_(computer)) — the electromechanical computer Konrad Zuse completed in Berlin in May 1941, generally credited as the first working, programmable, fully automatic digital computer.

![CI](https://github.com/SSMGAlt/Z3JS/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

**[Live demo →](https://z3js.ssmg4.dpdns.org)**

## What's actually emulated

- The real 22-bit **semi-logarithmic word format** — 1 sign bit, 7-bit exponent, 14-bit mantissa — encoded and decoded bit-for-bit.
- The real **64-word memory**.
- The real **arithmetic unit**: add, subtract, multiply, divide, and hardware square root — including genuine ±infinity / "undefined" exception values on divide-by-zero or √(negative), instead of just crashing.
- The real **absence of conditional branching**. Programs run straight through, top to bottom, exactly like a punch tape from 1941 — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for why that's more interesting than it sounds.
- A small **assembler** turning readable mnemonics into the binary tape format the machine actually reads.
- A lamp-panel UI so you can watch registers and memory flip bits live.

## Getting started

```bash
git clone https://github.com/SSMGAlt/Z3JS.git
cd Z3JS
npm install
npm test
npx serve .
```

Open the printed local URL. (Loading `index.html` directly via `file://` can fail in some browsers due to ES module CORS restrictions — use a local server, or the live demo above.)

## Writing a program

```
LOADI1 7
LOADI2 5
ADD
PRINT
HALT
```

Full opcode reference in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Example programs live in [`examples/`](examples/) and are also loadable from the dropdown in the UI.

## Project structure

```
src/core/     the machine itself — memory, ALU, CPU, assembler (no DOM dependency)
src/ui/       browser UI wiring
styles/       CSS
tests/        node --test unit tests
examples/     sample .z3asm programs
docs/         architecture & opcode reference
```

## Scope note

The numeric format, memory size, and lack of branching are historically accurate. The exact instruction encoding is this project's own design, since the original 1941 punch-tape bit format isn't preserved in accessible public archives. Details in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## License

MIT — see [LICENSE](LICENSE).

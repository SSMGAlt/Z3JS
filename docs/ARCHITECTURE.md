# Architecture

## The real machine

The Zuse Z3 was completed by Konrad Zuse in Berlin in May 1941 — built from roughly 2,600 telephone relays (600 for arithmetic and control, 2,000 for memory), running at a clock frequency of around 5–10 Hz. It's widely credited as the world's first working, programmable, fully automatic digital computer, using genuine binary floating-point arithmetic at a time when every other calculating machine on Earth was decimal. Numbers went in via a decimal keyboard, converted internally to binary; results came back out on a field of lamps. Programs were read from punched, discarded 35mm film stock. It was destroyed in an Allied bombing raid on Berlin in December 1943; a faithful working replica, built later under Zuse's supervision, is on permanent display at the Deutsches Museum in Munich. (As with most "first computer" claims, the title is debated — the Atanasoff–Berry computer and Colossus were built around the same period — but the Z3 is the earliest known machine that was both freely programmable and fully automatic.)

This project reproduces the machine's real numeric format, memory size, and — deliberately — its limitations.

## Word format

Every value in Z3JS is a 22-bit word, matching the original exactly: 1 sign bit, 7 exponent bits, 14 mantissa bits.

```
 1 bit      7 bits             14 bits
[sign] [exponent, bias 63] [mantissa, leading 1 implied]
```

- **Sign** — 0 positive, 1 negative.
- **Exponent** — stored with a bias of 63, so the 7-bit range 0–127 represents actual exponents −63 to +64.
- **Mantissa** — 14 bits. A normalized value is always in `[1, 2)`, so the leading `1.` is never stored — the same trick IEEE 754 uses decades later.
- **Zero** — the all-zero word, since a normalized mantissa can't represent zero directly.
- **±Infinity and "undefined"** — the Z3 genuinely had exception handling: dividing by zero or taking the square root of a negative number produced a real infinity or "undefined" value that could pass through further operations instead of crashing. Z3JS reserves the maximum exponent field (127) for this, exactly like the original: mantissa `0` means ±infinity, any other mantissa means undefined — the same reserved-exponent trick modern IEEE 754 uses for `Inf`/`NaN`.

This gives roughly 4–5 significant decimal digits of precision.

See `src/core/float22.js` for the implementation and `tests/float22.test.js` for round-trip, arithmetic, and exception-value tests.

## Memory

64 words, addressed 0–63 — no more, no less, exactly as in 1941. `src/core/memory.js`.

## Registers

Two working registers, `R1` and `R2`, feed the arithmetic unit — a simplified model of how operands reached the Z3's relay-based ALU. Results land back in `R1`.

## Instruction set

| Mnemonic | Opcode | Operand | Effect |
|---|---|---|---|
| `NOP` | `0x00` | — | do nothing |
| `LOAD1` | `0x01` | address | `R1 = memory[addr]` |
| `LOAD2` | `0x02` | address | `R2 = memory[addr]` |
| `LOADI1` | `0x03` | immediate | `R1 = encode(imm)` |
| `LOADI2` | `0x04` | immediate | `R2 = encode(imm)` |
| `STORE` | `0x05` | address | `memory[addr] = R1` |
| `ADD` | `0x06` | — | `R1 = R1 + R2` |
| `SUB` | `0x07` | — | `R1 = R1 − R2` |
| `MUL` | `0x08` | — | `R1 = R1 × R2` |
| `DIV` | `0x09` | — | `R1 = R1 ÷ R2` (÷0 → infinity, not a crash) |
| `SQRT` | `0x0A` | — | `R1 = √R1`, the Z3's real hardware square root |
| `NEG` | `0x0B` | — | `R1 = −R1` |
| `INPUT` | `0x0C` | — | `R1 = next value from the input queue` (models the decimal keyboard) |
| `PRINT` | `0x0D` | — | append `R1` to output (models the lamp field) |
| `INPUT2` | `0x0E` | — | `R2 = next value from the input queue` |
| `HALT` | `0xFF` | — | stop execution |

`LOADI1`/`LOADI2` are a modern convenience — the original relied on the keyboard for constants — included so small programs don't need to pre-populate memory by hand.

## Binary tape format

A program is a flat sequence of 2-byte instructions: `[opcode][operand]`. `operand` is an unsigned 0–63 address for `LOAD1`/`LOAD2`/`STORE`, a signed 8-bit immediate (−128 to 127) for `LOADI1`/`LOADI2`, and is ignored otherwise. `src/core/assembler.js` turns mnemonics into this binary form and back.

## Original 1941 syntax

Z3JS also accepts the Z3's own instruction mnemonics directly, so archived programs can run unmodified alongside ones written in the modern syntax above — the two can even be mixed in the same file.

| Original | Modern equivalent | Effect |
|---|---|---|
| `Pr z` | `LOAD1`/`LOAD2` | load `memory[z]` into R1 or R2 |
| `Ps z` | `STORE` | store R1 into `memory[z]` |
| `Ls1` / `La` | `ADD` | add |
| `Ls2` / `Ls` | `SUB` | subtract |
| `Lm` | `MUL` | multiply |
| `Li` | `DIV` | divide |
| `Lw` | `SQRT` | square root |
| `Lu` | `INPUT`/`INPUT2` | keyboard input into R1 or R2 |
| `Ld` | `PRINT` | display R1 |

Nine instructions, no control flow — the complete original language.

`Pr` and `Lu` don't name a register because the real machine didn't need them to: it tracked whether R1 already held a value and filled R1 if it was free, R2 otherwise. Arithmetic clears R2 once it's consumed (R1 keeps the result); storing or printing R1 frees it again. Z3JS resolves this the same way, at assemble time, by tracking register occupancy through the instruction sequence — which works cleanly precisely because there's no branching, so that sequence is always fully known in advance. A period assembly listing for evaluating a cubic polynomial by Horner's method (`Pr`/`Lu` alternating cleanly between R1 and R2 across ten-plus lines with no explicit register names anywhere) is what confirmed this model — see `src/core/assembler.js`.

## Custom examples

The `save`/`load`/`delete` controls in the UI let you name and keep programs beyond the three built-in examples: **save** stores the current editor contents under a name (both in the browser via `localStorage` and as a downloaded `.z3asm` file), **load** reads a `.z3asm` file back in, and **delete** removes a saved entry. See `src/ui/library.js`.

## No conditional branching — on purpose

This is the real machine's defining limitation, not a gap in this emulator. The Z3 read instructions straight off a punched tape with no mechanism to branch on a computed condition — a program ran start to finish, once, in order. It *could* loop, but only unconditionally: since the tape was a physical loop of film, its two ends could literally be spliced together so a calculation repeated indefinitely. There was no way to make that repetition depend on a result.

For decades this was treated as disqualifying the Z3 from Turing-completeness. In 1998, Raúl Rojas showed otherwise: a conditional "if flag then A else B" can be built from pure arithmetic as `flag × A + (1 − flag) × B`, where `flag` is 0 or 1 — no branch instruction required. Extended far enough, this can simulate an arbitrary Turing machine, at the cost of a program that computes every possible path through every branch and arithmetically cancels out the ones it doesn't need — a kind of brute-force speculative execution. Turing-complete in principle, wildly impractical in practice — exactly the spirit Z3JS tries to preserve. The flag trick works here too, given enough of the 64 words to store branch results in.

One pleasant consequence of having no branch instruction: every Z3JS program is guaranteed to halt (or hit an explicit `HALT`). Infinite loops are structurally impossible — there's nowhere for the program counter to jump back to.

## Scope note

The numeric engine and hardware constraints above — the 22-bit format (including real exception values), 64-word memory, and the absence of branching — are historically accurate and are the heart of what makes this a Z3 emulator rather than a generic calculator. The original-syntax mnemonics and the register-occupancy model they rely on are also grounded in documented sources (see above). What's this project's own design is the *modern* instruction set's binary tape encoding — the exact 1941 punch-tape bit-level format isn't preserved in accessible public archives (the machine and most of Zuse's early records were destroyed in the 1943 bombing), so the modern opcodes are a working encoding built around the machine's real, documented capabilities rather than a byte-exact reconstruction of lost tape data.

## References

- [Z3 (computer) — Wikipedia](https://en.wikipedia.org/wiki/Z3_(computer))
- [Konrad Zuse — Wikipedia](https://en.wikipedia.org/wiki/Konrad_Zuse)
- Raúl Rojas, "How to Make Zuse's Z3 a Universal Computer" (1998)
- [Turing-Completeness of the Zuse Z3 — mrob.com](https://mrob.com/pub/comp/zuse-z3.html)
- Documentation and source of the open-source `pipZuseZ3` Z3 simulator, and a university course document showing a worked Horner's-method program — both independently describe the same Pr/Lu register-occupancy behavior, which is what this project's implementation follows
- Deutsches Museum, Munich — working Z3 replica

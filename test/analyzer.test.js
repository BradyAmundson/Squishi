import util from "util"
import assert from "assert/strict"
import analyze, { error } from "../src/analyzer.js"

// const semanticChecks = [
//   ["variables can be printed", "let x = 1; print x;"],
//   ["variables can be reassigned", "let x = 1; x = x * 5 / ((-3) + x);"],
//   [
//     "all predefined identifiers",
//     "print ln(sqrt(sin(cos(hypot(π,1) + exp(5.5E2)))));",
//   ],
// ]

// const semanticErrors = [
//   ["a variable used as function", "x = 1; x(2);", /Expected "="/],
//   ["a function used as variable", "print(sin + 1);", /expected/],
//   [
//     "re-declared identifier",
//     "let x = 1; let x = 2;",
//     /x has already been declared/,
//   ],
//   ["an attempt to write a read-only var", "π = 3;", /π is read only/],
//   ["too few arguments", "print(sin());", /Expected 1 arg\(s\), found 0/],
//   ["too many arguments", "print(sin(5, 10));", /Expected 1 arg\(s\), found 2/],
// ]

const sample = `speak("abc");
    pencil z = x and [4+2];
    if 7>x : x=1; stop else x=2**5; stop`

const expected = `   1 | Program statement=[#2,#3,#6]
   2 | PrintStatement 
   3 | VariableDeclaration variable='z' initializer=#4
   4 | BinaryExpression op='and' left='x' right=#5
   5 | BinaryExpression op='+' left=4 right=2
   6 | IfStatement test=#7 consequence=[#8] alternate=[#9]
   7 | BinaryExpression op='>' left=7 right='x'
   8 | AssignmentStatement target='x' source=1
   9 | AssignmentStatement target='x' source=#10
  10 | BinaryExpression op='**' left=2 right=5`

describe("The analyzer", () => {
  //   for (const [scenario, source] of semanticChecks) {
  //     it(`recognizes ${scenario}`, () => {
  //       assert.ok(analyze(source))
  //     })
  //   }
  //   for (const [scenario, source, errorMessagePattern] of semanticErrors) {
  //     it(`throws on ${scenario}`, () => {
  //       assert.throws(() => analyze(source), errorMessagePattern)
  //     })
  //   }
  it(`produces the expected graph for the simple sample program`, () => {
    assert.deepEqual(util.format(analyze(sample)), expected)
  })
  it(`can call the error function with no node`, () => {
    assert.throws(error)
  })
  it(`can call the error function with a node`, () => {
    assert.throws(() => error("sdjhkfksd", {}))
  })
})

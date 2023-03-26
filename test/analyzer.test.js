import util from "util"
import assert from "assert/strict"
import analyze, { error } from "../src/analyzer.js"

const semanticChecks = [
  ["variables can be printed", "pencil x = 1; speak(x);"],
  ["variable reassignment", "pencil x = 3; x = 2;"],
  ["short return", "f shortReturn: return; stop"],
  ["long return", "f multiply x, y: pencil z = x * y; return z; stop"],
  [
    "return in nested if",
    "f nestedIfReturn: if true: return; else return; stop stop",
  ],
  ["break in nested if", "while false: if true: break; else break; stop stop"],
  ["long if", "if true: speak(1); else speak(3); stop"],
  [
    "global variables",
    'pencil globalZ = "hello"; f globalFunction: speak(globalZ); stop',
  ],
  ["integer loop", "10.loop item: speak(item); stop"],
  ["string loop", '"what up".loop item: speak(item); stop'],
  ["outer variable", "pencil x=1; while false: speak(x); stop"],
  [
    "for statement",
    "pencil j = 1; for pencil k = 4; stop k > 3 fastfwd k = k + 1; j = j + 2; stop",
  ],
  ["unary not", "speak(!false);"],
  [
    "ternary expression",
    "pencil x = 0; pencil y = 1; pencil z = 2; z = x if true otherwise y;",
  ],
  ["while", "pencil x = 2; while x > 0 or x < 20: x = x ** 2; stop"],
  ["and", "speak(true and false);"],
  ["short if", "pencil x = 2; if x == 2: x = 3; stop"],
  ["array", 'pencil x = ["hello"];'],

  //   ["variables can be reassigned", "let x = 1; x = x * 5 / ((-3) + x);"],
  //   [
  //     "all predefined identifiers",
  //     "print ln(sqrt(sin(cos(hypot(π,1) + exp(5.5E2)))));",
  //   ],
]

const semanticErrors = [
  [
    "undeclared variables",
    "pencil x = 1; speak(y);",
    /Identifier y not declared/,
  ],
  [
    "variable declared twice",
    "pencil x = 1; pencil x = 2;",
    /Identifier x already declared/,
  ],
  ["break outside loop", "break;", /Break can only appear in a loop/],
  [
    "break inside function",
    "while true: f breakFunction: break; stop stop",
    /Break can only appear in a loop/,
  ],
  [
    "if statement no boolean",
    'pencil y = 5; if y: speak("hi"); stop',
    /Expected a boolean/,
  ],
  [
    "mismatched types",
    "speak(5 > true);",
    /Operands do not have the same type/,
  ],
  [
    "bad types for +",
    "pencil x = false; speak(x + 1);",
    /Expected a number or string/,
  ],
  ["bad types for not", 'speak(!"hello");', /Expected a boolean/],
  ["bad types for -", "speak(false - 1);", /Expected a number/],
  ["bad types for <", "speak(false<1);", /Operands do not have the same type/],
  [
    "Too many args",
    "f multiply x, y: pencil z = x * y; return z; stop\npencil p = 11; pencil q = 2; pencil r = 3; multiply: p, q, r;",
    /2 argument\(s\) required but 3 passed/,
  ],

  //f breakFunction: break; stop stop
  // [
  //   "return outside function",
  //   "return;",
  //   /Return can only appear in a function/,
  // ],

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
]

const sample = `speak("abc");
pencil z = x and [4+2];
if 7>x : x=1; stop else x=2**5; stop
y = -2;
z = x if true otherwise y;

while x or y:
     x = y*2;
stop

for pencil z = 4; stop z > 3 fastfwd z = z + 1;
    x = x + 2;
stop
`

const expected = `   1 | Program statement=[#2,#4,#7,#12,#14,#16,#20]
   2 | PrintStatement argument=#3
   3 | StringLiteral chars='abc'
   4 | VariableDeclaration variable='z' initializer=#5
   5 | BinaryExpression op='and' left='x' right=#6
   6 | BinaryExpression op='+' left=4 right=2
   7 | IfStatement test=#8 consequence=[#9] alternate=[#10]
   8 | BinaryExpression op='>' left=7 right='x'
   9 | AssignmentStatement target='x' source=1
  10 | AssignmentStatement target='x' source=#11
  11 | BinaryExpression op='**' left=2 right=5
  12 | AssignmentStatement target='y' source=#13
  13 | BinaryExpression op='-' left=2 right=undefined
  14 | AssignmentStatement target='z' source=#15
  15 | BinaryExpression op='x' left='true' right='y'
  16 | WhileStatement test=#17 consequence=[#18]
  17 | BinaryExpression op='or' left='x' right='y'
  18 | AssignmentStatement target='x' source=#19
  19 | BinaryExpression op='*' left='y' right=2
  20 | ForStatement varDec=#21 test=#22 increment=#23 consequence=[#25]
  21 | VariableDeclaration variable='z' initializer=4
  22 | BinaryExpression op='>' left='z' right=3
  23 | AssignmentStatement target='z' source=#24
  24 | BinaryExpression op='+' left='z' right=1
  25 | AssignmentStatement target='x' source=#26
  26 | BinaryExpression op='+' left='x' right=2`

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(source))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(source), errorMessagePattern)
    })
  }
  // it(`produces the expected graph for the simple sample program`, () => {
  //   assert.deepEqual(util.format(analyze(sample)), expected)
  // })
  it(`can call the error function with no node`, () => {
    assert.throws(error)
  })
  it(`can call the error function with a node`, () => {
    assert.throws(() => error("sdjhkfksd", {}))
  })
})

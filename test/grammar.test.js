import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"

const syntaxChecks = [
  ["all numeric literal forms", "speak 8 * 89.123;"],
  ["complex expressions", "speak 83 * ((((-((((13 / 21)))))))) + 1 - 0;"],
  ["all unary operators", "speak  -3; speak  !false;"],
  ["all binary operators", "speak  x and y or z * 1 / 2 ** 3 + 4 < 5;"],
  ["all arithmetic operators", "pencil x = (!3) * 2 + 4 - (-7.3) * 8 ** 13 / 1;"],
  ["all relational operators", "pencil x = 1<(2<=(3==(4!=(5 >= (6>7)))));"],
  ["all logical operators", "pencil x = true and false or (!false);"],
  ["the conditional operator", "speak  x if y otherwise z;"],
  ["end of program inside comment", "speak (0); // yay"],
  ["comments with no text are ok", "speak (1);//\nspeak (0);//"],
  ["non-Latin letters in identifiers", "コンパイラ = 100;"],
  ["how to assign a variable", "pencil x = 3;"],
  ["how to do an assignment statement", "x = 3;"],
]

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  ["a non-operator", "speak (7 * ((2 _ 3)", /Line 1, col 16/],
  ["an expression starting with a )", "x = );", /Line 1, col 5/],
  ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  ["an illegal statement on line 2", "speak (5);\nx * 5;", /Line 2, col 3/],
  ["a statement starting with a )", "speak (5);\n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
  ["a variable declaration without semicolon", "pencil varX = \"yup\"", /Line 1, col 20/],
  ["an expression without a closed bracket", "z = x * [4+2", /Line 1, col 13/],
]

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/squishi.ohm"))
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded())
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source)
      assert(!match.succeeded())
      assert(new RegExp(errorMessagePattern).test(match.message))
    })
  }
})
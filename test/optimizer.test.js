import assert from "node:assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

const x = new core.Variable("x", core.Type.INT)
const y = new core.Variable("y", core.Type.INT)
const z = new core.Variable("z", core.Type.INT)
const a = new core.Variable("a", core.Type.BOOLEAN)
const emptyString = new core.StringLiteral("", core.Type.STRING)
const onePlusTwo = new core.BinaryExpression("+", 1, 2, core.Type.INT)
const xpp = new core.AssignmentStatement(
  x,
  new core.BinaryExpression("+", x, 1, core.Type.INT)
)
const opo = new core.BinaryExpression("+", 1, 1, core.Type.INT)
const neg = (x) => new core.BinaryExpression("-", x)
const less = (x, y) => new core.BinaryExpression("<", x, y, core.Type.BOOLEAN)
const or = (...d) =>
  d.reduce((x, y) => new core.BinaryExpression("or", x, y, core.Type.BOOLEAN))
const array = (...elements) => new core.ArrayExpression(elements)

const returnX = new core.ReturnStatement(x)

const forLoop = [
  new core.ForStatement(
    new core.VariableDeclaration(z, 0),
    new core.BinaryExpression("<", z, 3, core.Type.INT),
    new core.AssignmentStatement(
      z,
      new core.BinaryExpression("+", z, 1, core.Type.INT)
    ),
    [
      new core.AssignmentStatement(
        x,
        new core.BinaryExpression("+", x, 1, core.Type.INT)
      ),
    ]
  ),
]
const forLoop_partialUnroll = [
  new core.ForStatement(
    new core.VariableDeclaration(z, 0),
    new core.BinaryExpression("<", z, 3, core.Type.INT),
    new core.AssignmentStatement(
      z,
      new core.BinaryExpression("+", z, 1, core.Type.INT)
    ),
    [new core.VariableDeclaration(y, 0)]
  ),
]

const intFun = (body) =>
  new core.FunctionDeclaration(new core.Function("func", []), [], [body])
const tests = [
  ["optimizes +0", new core.BinaryExpression("+", x, 0), x],
  ["optimizes -0", new core.BinaryExpression("-", x, 0), x],
  ["optimizes *1", new core.BinaryExpression("*", x, 1), x],
  ["optimizes /1", new core.BinaryExpression("/", x, 1), x],
  ["optimizes *0", new core.BinaryExpression("*", x, 0), 0],
  ["optimizes 0*", new core.BinaryExpression("*", 0, x), 0],
  ["optimizes 0/", new core.BinaryExpression("/", 0, x), 0],
  ["optimizes 0+", new core.BinaryExpression("+", 0, x), x],
  ["optimizes 0-", new core.BinaryExpression("-", 0, x), neg(x)],
  ["optimizes 1*", new core.BinaryExpression("*", 1, x), x],
  ["optimizes 1**", new core.BinaryExpression("**", 1, x), 1],
  ["optimizes **0", new core.BinaryExpression("**", x, 0), 1],
  ["optimizes while-false", [new core.WhileStatement(false, opo)], []],
  ["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
  [
    "optimizes empty String loop",
    [new core.LoopStatement(x, emptyString, opo)],
    [],
  ],

  ["folds +", new core.BinaryExpression("+", 5, 8), 13],
  ["folds -", new core.BinaryExpression("-", 5, 8), -3],
  ["folds *", new core.BinaryExpression("*", 5, 8), 40],
  ["folds /", new core.BinaryExpression("/", 5, 8), 0.625],
  ["folds **", new core.BinaryExpression("**", 5, 8), 390625],
  ["folds <", new core.BinaryExpression("<", 5, 8), true],
  ["folds <=", new core.BinaryExpression("<=", 5, 8), true],
  ["folds ==", new core.BinaryExpression("==", 5, 8), false],
  ["folds !=", new core.BinaryExpression("!=", 5, 8), true],
  ["folds >=", new core.BinaryExpression(">=", 5, 8), false],
  ["folds >", new core.BinaryExpression(">", 5, 8), false],

  ["removes x=x", new core.AssignmentStatement(x, x), []],
  ["removes left false from or", or(false, less(x, 1)), less(x, 1)],
  ["removes right false from or", or(less(x, 1), false), less(x, 1)],
  [
    "removes x=x at beginning",
    [new core.AssignmentStatement(x, x), xpp],
    [xpp],
  ],

  [
    "unrolls a for loop",
    forLoop[0],
    new core.ForStatement(
      new core.VariableDeclaration(z, 0),
      new core.BinaryExpression("<", z, 3, core.Type.INT),
      new core.AssignmentStatement(
        z,
        new core.BinaryExpression("+", z, 1, core.Type.INT)
      ),
      [
        new core.AssignmentStatement(z, 0),
        new core.AssignmentStatement(
          x,
          new core.BinaryExpression("+", x, 1, core.Type.INT)
        ),
        new core.AssignmentStatement(z, 1),
        new core.AssignmentStatement(
          x,
          new core.BinaryExpression("+", x, 1, core.Type.INT)
        ),
        new core.AssignmentStatement(z, 2),
        new core.AssignmentStatement(
          x,
          new core.BinaryExpression("+", x, 1, core.Type.INT)
        ),
      ]
    ),
  ],
  [
    "partially unrolls a for loop",
    forLoop_partialUnroll[0],
    new core.ForStatement(
      new core.VariableDeclaration(z, 0),
      new core.BinaryExpression("<", z, 3, core.Type.INT),
      new core.AssignmentStatement(
        z,
        new core.BinaryExpression("+", z, 1, core.Type.INT)
      ),
      [
        new core.AssignmentStatement(z, 0),
        new core.VariableDeclaration(y, 0),
        new core.AssignmentStatement(z, 1),
        new core.VariableDeclaration(y, 0),
        new core.AssignmentStatement(z, 2),
        new core.VariableDeclaration(y, 0),
      ]
    ),
  ],
  [
    "optimizes in functions",
    intFun(new core.ReturnStatement(opo)),
    intFun(new core.ReturnStatement(opo)),
  ],

  [
    "passes through nonoptimizable constructs",
    ...Array(2).fill([
      new core.Program([new core.ShortReturnStatement()]),
      new core.Program([new core.ReturnStatement(5)]),
      new core.VariableDeclaration(z, 0),
      new core.AssignmentStatement(
        x,
        new core.BinaryExpression("+", x, 1, core.Type.INT)
      ),
      new core.WhileStatement(true, [new core.BreakStatement()]),
      new core.LoopStatement(
        x,
        new core.StringLiteral("hello world", core.Type.String),
        opo
      ),
      new core.PrintStatement("hello"),
      new core.IfStatementShort(x, []),
      new core.IfStatement(x, [], []),
      new core.Conditional(
        new core.PrintStatement(x),
        new core.Variable("a", core.Type.BOOLEAN),
        new core.PrintStatement(x)
      ),
      new core.ArrayCall(array, 3),
    ]),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})

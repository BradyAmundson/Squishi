import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const squishiGrammar = ohm.grammar(fs.readFileSync("src/squishi.ohm"))

const INT = core.Type.INT
const FLOAT = core.Type.FLOAT
const STRING = core.Type.STRING
const BOOLEAN = core.Type.BOOLEAN

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}

function must(condition, message, errorLocation) {
  if (!condition) core.error(message, errorLocation)
}

function mustNotAlreadyBeDeclared(context, name) {
  must(!context.sees(name), `Identifier ${name} already declared`)
}

function mustHaveBeenFound(entity, name) {
  must(entity, `Identifier ${name} not declared`)
}

function mustHaveNumericType(e, at) {
  must([INT, FLOAT].includes(e.type), "Expected a number", at)
}

function mustHaveNumericOrStringType(e, at) {
  must([INT, FLOAT, STRING].includes(e.type), "Expected a number or string", at)
}

function mustHaveBooleanType(entity) {
  must(entity.type === core.Type.BOOLEAN, "Expected a boolean")
}

function mustBeTheSameType(entity1, entity2) {
  must(entity1.type === entity2.type, "Operands do not have the same type") //add equivalent method
}

function mustBeInLoop(context, at) {
  must(context.inLoop, "Break can only appear in a loop", at)
}

function mustBeIterable(e, at) {
  must(
    [INT, FLOAT, STRING].includes(e.type),
    `Cannot loop through type ${e.type}`,
    at
  )
}

function argumentsMustMatch(args, target, at) {
  const targetParams = target.params
  must(
    targetParams.length === args.length,
    `${targetParams.length} argument(s) required but ${args.length} passed`,
    at
  )
  // targetTypes.forEach((type, i) => mustBeAssignable(args[i], { toType: type }))
}

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    mustNotAlreadyBeDeclared(this, name)
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name) || this.parent?.lookup(name)
    mustHaveBeenFound(entity, name)
    return entity
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  }
}

export default function analyze(sourceCode) {
  let context = new Context({})

  const analyzer = squishiGrammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return new core.Program(statements.rep())
    },
    PrintStatement(_speak, argument, _semicolon) {
      return new core.PrintStatement(argument.rep())
    },
    VarDeclaration(_pencil, id, _equal, initializer, _semicolon) {
      const variable = new core.Variable(id.rep(), initializer.rep().type) // fix this later
      context.add(id.rep(), variable)
      return new core.VariableDeclaration(variable, initializer.rep())
    },
    AssignStmt(target, _equals, source, _semicolon) {
      context.lookup(target.rep())
      return new core.AssignmentStatement(target.rep(), source.rep())
    },
    IfStmt_short(_if, test, _colon, consequent, _stop) {
      mustHaveBooleanType(test.rep())
      return new core.IfStatementShort(test.rep(), consequent.rep())
    },
    IfStmt_long(_if, test, _colon, consequent, _else, alternate, _stop2) {
      mustHaveBooleanType(test.rep())
      return new core.IfStatement(test.rep(), consequent.rep(), alternate.rep())
    },
    WhileStmt(_while, test, _colon, body, _stop) {
      mustHaveBooleanType(test.rep())
      context = context.newChildContext({ inLoop: true })
      const b = body.rep()
      context = context.parent
      return new core.WhileStatement(test.rep(), b)
    },
    ForStmt(
      _for,
      varDec,
      _stop,
      test,
      _fastfwd,
      increment,
      consequent,
      _stop2
    ) {
      return new core.ForStatement(
        varDec.rep(),
        test.rep(),
        increment.rep(),
        consequent.rep()
      )
    },
    LoopStmt(iterable, _loop, id, _colon, body, _stop) {
      mustBeIterable(iterable.rep())
      let iterableObj
      if (iterable.rep().type === core.Type.INT) {
        iterableObj = new core.Variable(id.rep(), iterable.rep().type)
      } else if (iterable.rep().type === core.Type.STRING) {
        iterableObj = new core.Variable(id.rep(), iterable.rep().type)
      } else if (iterable.rep().type === core.Type.ARRAY) {
        iterableObj = new core.Variable(id.rep(), iterable.rep().type.baseType)
      }
      context = context.newChildContext({ inLoop: true })
      context.add(id.rep(), iterableObj)
      const b = body.rep()
      context = context.parent
      return new core.LoopStatement(iterableObj, iterable.rep(), b)
    },
    Function(_f, id, params, _colon, body, _stop) {
      const paramReps = params.asIteration().rep()
      const func = new core.Function(id.rep(), paramReps)
      context.add(id.rep(), func)
      context = context.newChildContext({ inLoop: false, function: func })
      for (const p of paramReps) context.add(p.name, p)
      // console.log(context)
      const b = body.rep()
      context = context.parent
      // console.log(context)
      return new core.FunctionDeclaration(id.rep(), paramReps, b)
    },
    Param(id) {
      return new core.Variable(id.rep(), core.Type.ANY)
    },
    Statement_call(call, _semicolon) {
      return call.rep()
    },
    Call(id, _colon, args) {
      // context.lookup(id.rep())
      // console.log(context.locals.get(id.rep()).params)
      const argumentReps = args.rep()
      argumentsMustMatch(argumentReps, context.locals.get(id.rep()))
      return new core.Call(id.rep(), argumentReps)
    },
    Arguments(args) {
      return args.asIteration().rep()
    },
    Statement_break(_break, _semicolon) {
      mustBeInLoop(context)
      return new core.BreakStatement()
    },
    Statement_return(_return, expression, _semicolon) {
      // mustBeInAFunction(context, returnKeyword)
      // mustReturnSomething(context.function)
      const e = expression.rep()
      // mustBeReturnable({ expression: e, from: context.function })
      return new core.ReturnStatement(e)
    },

    Statement_shortreturn(_return, _semicolon) {
      // mustBeInAFunction(context)
      // mustNotReturnAnything(context.function)
      return new core.ShortReturnStatement()
    },
    id(chars) {
      return chars.sourceString
    },
    Var(id) {
      const entity = context.lookup(id.rep())
      // mustHaveBeenFound(entity, id.rep())
      return entity
    },
    Exp_unary(op, right) {
      let type
      if (op.sourceString === "!") {
        mustHaveBooleanType(right.rep())
        type = BOOLEAN
      }
      if (op === "-") mustHaveNumericType(right.rep()), (type = x.type)
      return new core.BinaryExpression(op.rep(), right.rep(), type)
    },
    Exp1_ternary(consequent, _if, test, _otherwise, alternate) {
      return new core.BinaryExpression(
        consequent.rep(),
        test.rep(),
        alternate.rep(),
        BOOLEAN
      )
    },
    Exp2_or(left, _or, right) {
      let [x, y] = [left.rep(), right.rep()]
      mustHaveBooleanType(x)
      mustHaveBooleanType(y)
      x = new core.BinaryExpression("or", x, y, BOOLEAN)
      return x
      // return new core.BinaryExpression("or", left.rep(), right.rep())
    },
    Exp3_and(left, _and, right) {
      let [x, y] = [left.rep(), right.rep()]
      mustHaveBooleanType(x)
      mustHaveBooleanType(y)
      x = new core.BinaryExpression("and", x, y, BOOLEAN)
      return x
      // return new core.BinaryExpression("and", left.rep(), right.rep())
    },
    Exp4_op(left, op, right) {
      mustBeTheSameType(left.rep(), right.rep())
      return new core.BinaryExpression(
        op.rep(),
        left.rep(),
        right.rep(),
        BOOLEAN
      )
    },
    Exp5_plusminus(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()]
      if (o === "+") {
        mustHaveNumericOrStringType(x)
      } else {
        mustHaveNumericType(x)
      }
      mustBeTheSameType(x, y)
      return new core.BinaryExpression(o, x, y, x.type)
      // return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp6_multdivmod(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()]
      // mustHaveNumericType(x)
      left.parent?.right.parent?.mustBeTheSameType(x, y)
      // mustBeTheSameType(x, y)
      return new core.BinaryExpression(o, x, y, x.type)
      // return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp7_exponent(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()]
      mustHaveNumericType(x)
      mustBeTheSameType(x, y)
      return new core.BinaryExpression(o, x, y, x.type)
      // return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp8_brackets(_open, expression, _close) {
      return expression.rep()
    },
    Exp9_parens(_open, expression, _close) {
      return expression.rep()
    },
    numeral(_leading, _dot, _fractional) {
      return Number(this.sourceString)
    },
    stringliteral(_open, chars, _close) {
      return new core.StringLiteral(chars.sourceString)
    },
    BooleanVal(bool) {
      return bool.rep()
    },
    true(_) {
      return true
    },
    false(_) {
      return false
    },
    _terminal() {
      return this.sourceString
    },
    _iter(...children) {
      return children.map((child) => child.rep())
    },
  })

  const match = squishiGrammar.match(sourceCode)
  if (!match.succeeded()) error(match.message)
  return analyzer(match).rep()
}

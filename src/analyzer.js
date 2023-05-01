import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const squishiGrammar = ohm.grammar(fs.readFileSync("src/squishi.ohm"))

const INT = core.Type.INT
const FLOAT = core.Type.FLOAT
const STRING = core.Type.STRING
const BOOLEAN = core.Type.BOOLEAN
const ARRAY = core.ArrayType.ARRAY

export function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}

function must(condition, message, errorLocation) {
  if (!condition) core.error(message, errorLocation)
}

function mustNotAlreadyBeDeclared(context, name, at) {
  must(!context.sees(name), `Identifier ${name} already declared`, at)
}

function mustHaveBeenFound(entity, name, at) {
  must(entity, `Identifier ${name} not declared`, at)
}

function mustHaveNumericType(e, at) {
  must([INT, FLOAT].includes(e.type), "Expected a number", at)
}

function mustHaveNumericOrStringType(e, at) {
  must([INT, FLOAT, STRING].includes(e.type), "Expected a number or string", at)
}

function mustHaveBooleanType(entity, at) {
  must(entity.type === core.Type.BOOLEAN, "Expected a boolean", at)
}

function mustBeTheSameType(entity1, entity2, at) {
  must(entity1.type === entity2.type, "Operands do not have the same type", at)
}

function mustBeInLoop(context, at) {
  must(context.inLoop, "Break can only appear in a loop", at)
}

function mustBeIterable(e, at) {
  if (e.type.constructor.name != "Type") {
    must(
      e.type.constructor.name === "ArrayType",
      `Cannot loop throuhg type ${e.type.constructor.name}`
    )
  } else {
    must(
      [INT, FLOAT, STRING].includes(e.type),
      `Cannot loop through type ${e.type}`,
      at
    )
  }
}

function argumentsMustMatch(args, target, at) {
  const targetParams = target.params
  must(
    targetParams.length === args.length,
    `${targetParams.length} argument(s) required but ${args.length} passed`,
    at
  )
}

function mustHaveCorrectType(target, source, at) {
  must(
    target.type === source.type,
    `${target.name} is not of type ${source.type.description}`,
    at
  )
}

function mustBeInAFunction(context, at) {
  must(context.function !== null, "Return statement must be in a function", at)
}

function mustReturnSomething(expression, at) {
  must(expression !== undefined, "Must return something", at)
}

function functionMustExist(entity, at) {
  must(entity, `Identifier not declared`, at)
  must(entity instanceof core.Function, `${entity.name} is not a function`, at)
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
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    mustNotAlreadyBeDeclared(this, name, { at: name })
    this.locals.set(name, entity)
  }
  lookup(name) {
    const nameRep = name.rep()
    const entity = this.locals.get(nameRep) || this.parent?.lookup(name)
    mustHaveBeenFound(entity, nameRep, { at: name })
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
      mustNotAlreadyBeDeclared(context, id.rep(), { at: id })
      const variable = new core.Variable(id.rep(), initializer.rep().type)
      context.add(id.rep(), variable)
      return new core.VariableDeclaration(variable, initializer.rep())
    },
    AssignStmt(target, _equals, source, _semicolon) {
      let targetLookup = context.lookup(target)
      if (context.function === null) {
        mustHaveCorrectType(targetLookup, source.rep(), { at: source })
      }
      return new core.AssignmentStatement(targetLookup, source.rep())
    },
    IfStmt_short(_if, test, _colon, consequent, _stop) {
      if (context.function === null) {
        mustHaveBooleanType(test.rep(), { at: test })
      }
      return new core.IfStatementShort(test.rep(), consequent.rep())
    },
    IfStmt_long(_if, test, _colon, consequent, _else, alternate, _stop2) {
      if (context.function === null) {
        mustHaveBooleanType(test.rep(), { at: test })
      }
      return new core.IfStatement(test.rep(), consequent.rep(), alternate.rep())
    },
    IfStmt_elseIf(_if, test, _colon, consequent, _else, trailingIfStatement) {
      if (context.function === null) {
        mustHaveBooleanType(test.rep(), { at: test })
      }
      const alternate = trailingIfStatement.rep()
      return new core.IfStatement(test.rep(), consequent.rep(), alternate)
    },
    WhileStmt(_while, test, _colon, body, _stop) {
      if (context.function === null) {
        mustHaveBooleanType(test.rep(), { at: test })
      }
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
      mustBeIterable(iterable.rep(), { at: iterable })
      let iterableObj
      if (iterable.rep().type === core.Type.INT) {
        iterableObj = new core.Variable(id.rep(), iterable.rep().type)
      } else if (iterable.rep().type === core.Type.STRING) {
        iterableObj = new core.Variable(id.rep(), iterable.rep().type)
      } else if (iterable.rep().type.constructor.name === "ArrayType") {
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
      const b = body.rep()
      context = context.parent
      return new core.FunctionDeclaration(id.rep(), paramReps, b)
    },
    Param(id) {
      return new core.Variable(id.rep(), core.Type.ANY)
    },
    Statement_call(call, _semicolon) {
      return call.rep()
    },
    Call(id, _colon, args) {
      const entity = context.lookup(id)
      functionMustExist(entity, { at: id })
      const argumentReps = args.rep()
      argumentsMustMatch(argumentReps, context.locals.get(id.rep()), {
        at: args,
      })
      return new core.Call(id.rep(), argumentReps)
    },
    Arguments(args) {
      return args.asIteration().rep()
    },
    Statement_break(_break, _semicolon) {
      mustBeInLoop(context, { at: _break })
      return new core.BreakStatement()
    },
    Statement_return(_return, expression, _semicolon) {
      mustBeInAFunction(context, { at: _return })
      mustReturnSomething(expression, { at: expression })
      const e = expression.rep()
      return new core.ReturnStatement(e)
    },

    Statement_shortreturn(_return, _semicolon) {
      mustBeInAFunction(context, { at: _return })
      return new core.ShortReturnStatement()
    },
    id(chars) {
      return chars.sourceString
    },
    Var(id) {
      const entity = context.lookup(id)
      return entity
    },
    Exp_unary(op, right) {
      let type
      if (op.sourceString === "!") {
        if (context.function === null) {
          mustHaveBooleanType(right.rep(), { at: right })
        }
        type = BOOLEAN
      }
      return new core.BinaryExpression(op.rep(), right.rep(), type)
    },
    Exp1_ternary(consequent, _if, test, _otherwise, alternate) {
      return new core.Conditional(consequent.rep(), test.rep(), alternate.rep())
    },
    Exp2_or(left, _or, right) {
      let [x, y] = [left.rep(), right.rep()]
      if (context.function === null) {
        mustHaveBooleanType(x, { at: left })
        mustHaveBooleanType(y, { at: right })
      }
      x = new core.BinaryExpression("or", x, y, BOOLEAN)
      return x
    },
    Exp3_and(left, _and, right) {
      let [x, y] = [left.rep(), right.rep()]
      if (context.function === null) {
        mustHaveBooleanType(x, { at: left })
        mustHaveBooleanType(y, { at: right })
      }
      x = new core.BinaryExpression("and", x, y, BOOLEAN)
      return x
    },
    Exp4_op(left, op, right) {
      if (context.function === null) {
        mustBeTheSameType(left.rep(), right.rep(), { at: right })
      }
      return new core.BinaryExpression(
        op.rep(),
        left.rep(),
        right.rep(),
        BOOLEAN
      )
    },
    Exp5_plusminus(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()]
      if (context.function === null) {
        if (o === "+") {
          mustHaveNumericOrStringType(x, { at: left })
        } else {
          mustHaveNumericType(x, { at: left })
        }
        mustBeTheSameType(x, y, { at: left })
      }
      return new core.BinaryExpression(o, x, y, x.type)
    },
    Exp6_multdivmod(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()]
      if (context.function === null) {
        mustHaveNumericType(x, { at: left })
        mustBeTheSameType(x, y, { at: left })
      }
      return new core.BinaryExpression(o, x, y, x.type)
    },
    Exp7_exponent(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()]
      if (context.function === null) {
        mustHaveNumericType(x, { at: left })
        mustBeTheSameType(x, y, { at: left })
      }
      return new core.BinaryExpression(o, x, y, x.type)
    },
    Exp8_brackets(_open, expression, _close) {
      return expression.rep()
    },
    Exp9_parens(_open, expression, _close) {
      return expression.rep()
    },
    numeral(_negative, _leading, _dot, _fractional) {
      return Number(this.sourceString)
    },
    stringliteral(_open, chars, _close) {
      return new core.StringLiteral(chars.sourceString)
    },
    Array(_open, args, _close) {
      const elements = args.asIteration().children.map((e) => e.rep())
      return new core.ArrayExpression(elements)
    },
    ArrayCall(id, _open, index, _close) {
      return new core.ArrayCall(id.rep(), index.rep())
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

import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const squishiGrammar = ohm.grammar(fs.readFileSync("src/squishi.ohm"))

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

function mustHaveBooleanType(entity) {
  must(entity.type === core.Type.BOOLEAN, "Expected a boolean")
}

function mustBeTheSameType(entity1, entity2) {
  must(entity1.type === entity2.type, "Operands do not have the same type") //add equivalent method
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
    IfStmt(_if, test, _colon, consequent, _stop, _else, alternate, _stop2) {
      mustHaveBooleanType(test.rep())
      return new core.IfStatement(test.rep(), consequent.rep(), alternate.rep())
    },
    WhileStmt(_while, test, _colon, consequent, _stop) {
      mustHaveBooleanType(test.rep())
      return new core.WhileStatement(test.rep(), consequent.rep())
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
    Function(_f, id, params, _colon, body, _stop){
      const paramReps = params.asIteration().rep()
      const func = new core.Function(id.rep())
      context.add(id.rep(), func)
      context = context.newChildContext({ inLoop: false, function: func })
      for(const p of paramReps) context.add(p.name, p)
      // console.log(context)
      const b = body.rep()
      context = context.parent
      // console.log(context)
      return new core.FunctionDeclaration(id.rep(), paramReps, b)
    },
    Param(id){
      return new core.Variable(id.rep(), core.Type.ANY)
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
      return new core.BinaryExpression(op.rep(), right.rep())
    },
    Exp1_ternary(consequent, _if, test, _otherwise, alternate) {
      return new core.BinaryExpression(
        consequent.rep(),
        test.rep(),
        alternate.rep()
      )
    },
    Exp2_or(left, _or, right) {
      return new core.BinaryExpression("or", left.rep(), right.rep())
    },
    Exp3_and(left, _and, right) {
      return new core.BinaryExpression("and", left.rep(), right.rep())
    },
    Exp4_op(left, op, right) {
      mustBeTheSameType(left.rep(), right.rep())
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp5_plusminus(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp6_multdivmod(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp7_exponent(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
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
    BooleanVal(bool){
      return bool.rep()
    },
    true(_){
      return true
    },
    false(_){
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

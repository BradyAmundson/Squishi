import util from "util"

export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class VariableDeclaration {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer })
  }
}

export class AssignmentStatement {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class IfStatement {
  constructor(test, consequence, alternate) {
    Object.assign(this, { test, consequence, alternate })
  }
}

export class IfStatementShort {
  constructor(test, consequence) {
    Object.assign(this, { test, consequence })
  }
}

export class WhileStatement {
  constructor(test, consequence) {
    Object.assign(this, { test, consequence })
  }
}

export class ForStatement {
  constructor(varDec, test, increment, consequence) {
    Object.assign(this, { varDec, test, increment, consequence })
  }
}

export class LoopStatement {
  constructor(iterator, collection, body) {
    Object.assign(this, { iterator, collection, body })
  }
}

export class FunctionDeclaration {
  constructor(name, params, body) {
    Object.assign(this, { name, params, body })
  }
}

export class Function {
  constructor(name, params) {
    Object.assign(this, { name, params })
  }
}

export class Call {
  constructor(name, args) {
    Object.assign(this, { name, args })
  }
}

export class BreakStatement {
  // Intentionally empty
}

export class ReturnStatement {
  constructor(expression) {
    this.expression = expression
  }
}

export class ShortReturnStatement {
  // Intentionally empty
}

export class BinaryExpression {
  constructor(op, left, right, type) {
    Object.assign(this, { op, left, right, type })
  }
}

export class Conditional {
  constructor(consequent, test, alternate) {
    Object.assign(this, { consequent, test, alternate })
    this.type = consequent.type
  }
}

export class StringLiteral {
  constructor(chars) {
    this.chars = chars
    this.type = Type.STRING
  }
}

export class Variable {
  constructor(name, type) {
    this.name = name
    this.type = type
  }
}

export class ArrayExpression {
  constructor(elements) {
    this.elements = elements
    this.type = new ArrayType(elements[0].type)
  }
}

export class ArrayCall {
  constructor(name, index) {
    this.name = name
    this.index = index
    this.type = name.type
  }
}

export class Type {
  static BOOLEAN = new Type("boolean")
  static INT = new Type("int")
  static FLOAT = new Type("float")
  static STRING = new Type("string")

  static VOID = new Type("void")
  static ANY = new Type("any")
  constructor(description) {
    Object.assign(this, { description })
  }
}

export class ArrayType extends Type {
  static ARRAY = new ArrayType(Type.ANY)
  constructor(baseType) {
    super(`[${baseType.description}]`)
    this.baseType = baseType
  }
}

Program.prototype[util.inspect.custom] = function () {
  const tags = new Map()

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    tags.set(node, tags.size + 1)
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child)
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node.constructor.name
      let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`)
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`
    }
  }

  tag(this)
  return [...lines()].join("\n")
}

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, node) {
  throw new Error(`${node.at.source.getLineAndColumnMessage()}${message}`)
}

Number.prototype.type = Type.INT
Boolean.prototype.type = Type.BOOLEAN
Array.prototype.type = Type.ARRAY

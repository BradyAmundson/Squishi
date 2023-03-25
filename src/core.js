import util from "util"

export class Program {
  constructor(statements) {
    this.statement = statements
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

export class FunctionDeclaration {
  constructor(name, params, body) {
    Object.assign(this, { name, params, body })
  }
}

export class Function {
  // Generated when processing a function declaration
  constructor(name) {
    Object.assign(this, { name })
  }
}

export class ReturnStatement {
  // Example: return c[5]
  constructor(expression) {
    this.expression = expression
  }
}

export class ShortReturnStatement {
  // Intentionally empty
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
    this.type = Type.BOOLEAN
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

export class Type {
  // Type of all basic type int, float, string, etc. and superclass of others
  static BOOLEAN = new Type("boolean")
  static INT = new Type("int")
  static FLOAT = new Type("float")
  static STRING = new Type("string")
  static VOID = new Type("void")
  static ANY = new Type("any")
  constructor(description) {
    // The description is a convenient way to view the type. For basic
    // types or structs, it will just be the names. For arrays, you will
    // see "[T]". For optionals, "T?". For functions "(T1,...Tn)->T0".
    Object.assign(this, { description })
  }
}

// Return a compact and pretty string representation of the node graph,
// taking care of cycles. Written here from scratch because the built-in
// inspect function, while nice, isn't nice enough. Defined properly in
// the root class prototype so that it automatically runs on console.log.
Program.prototype[util.inspect.custom] = function () {
  const tags = new Map()

  // Attach a unique integer tag to every node
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
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}


// String.prototype.type = Type.STRING
Number.prototype.type = Type.INT
// BigInt.prototype.type = Type.INT
Boolean.prototype.type = Type.BOOLEAN
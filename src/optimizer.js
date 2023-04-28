// Supported optimizations:
//   - constant folding
//   - some strength reductions (+0, -0, *0, *1, etc.)

import * as core from "./core.js"
export default function optimize(node) {
  console.log(node)
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  VariableDeclaration(d) {
    d.variable = optimize(d.variable.name)
    d.initializer = optimize(d.initializer)
    return d
  },
  TypeDeclaration(d) {
    d.type = optimize(d.type)
    return d
  },
  AssignmentStatement(s) {
    s.source = optimize(s.source)
    s.target = optimize(s.target)
    if (s.source === s.target) {
      return []
    }
    return s
  },
  BinaryExpression(e) {
    e.op = optimize(e.op)
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    if (e.op === "or") {
      if (e.left === false) return e.right
      else if (e.right === false) return e.left
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right
        else if (e.op === "-") return e.left - e.right
        else if (e.op === "*") return e.left * e.right
        else if (e.op === "/") return e.left / e.right
        else if (e.op === "**") return e.left ** e.right
        else if (e.op === "<") return e.left < e.right
        else if (e.op === "<=") return e.left <= e.right
        else if (e.op === "==") return e.left === e.right
        else if (e.op === "!=") return e.left !== e.right
        else if (e.op === ">=") return e.left >= e.right
        else if (e.op === ">") return e.left > e.right
      } else if (e.left === 0 && e.op === "+") return e.right
      else if (e.left === 1 && e.op === "*") return e.right
      else if (e.left === 0 && e.op === "-")
        return new core.BinaryExpression("-", e.right)
      else if (e.left === 1 && e.op === "**") return 1
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
    } else if (e.right.constructor === Number) {
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left
      else if (e.op === "*" && e.right === 0) return 0
      else if (e.op === "**" && e.right === 0) return 1
    }
    return e
  },
  WhileStatement(s) {
    s.test = optimize(s.test)
    if (s.test === false) {
      // while false is a no-op
      return []
    }
    s.body = optimize(s.body)
    return s
  },
  LoopStatement(s) {
    console.log("\n\n")
    s.iterator = optimize(s.iterator)
    console.log("\nITERABLE")
    // console.log('iterator')
    s.collection = optimize(s.collection)
    console.log(s.collection)
    s.body = optimize(s.body)
    return s
  },
  ArrayExpression(e) {
    e.elements = optimize(e.elements)
    return e
  },
  Variable(v) {
    return v
  },
  Number(e) {
    return e
  },
  Boolean(e) {
    return e
  },
  String(e) {
    // console.log(e)
    return e
  },
  StringLiteral(e) {
    // console.log(e)
    return e
  },
  Array(a) {
    // Flatmap since each element can be an array
    return a.flatMap(optimize)
  },
}

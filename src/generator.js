import { IfStatementShort, IfStatement } from "./core.js"

export default function generate(program) {
  const output = []

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`
    }
  })(new Map())

  function gen(node) {
    // console.log(node)
    // console.log(node.constructor.name)
    return generators[node.constructor.name](node)
  }

  const generators = {
    Program(p) {
      p.statements.forEach((statement) => gen(statement))
    },
    PrintStatement(s) {
      const argument = gen(s.argument)
      output.push(`console.log(${argument});`)
    },
    VariableDeclaration(d) {
      // console.log(`variable: ${d.variable}`)
      output.push(`let ${gen(d.variable)} = ${d.initializer};`)
    },
    AssignmentStatement(s) {
      output.push(`${gen(s.target)} = ${s.source};`)
    },
    IfStatementShort(s) {
      output.push(`if (${gen(s.test)}) {`)
      s.consequence.forEach((consequent) => gen(consequent))
      // gen(s.consequent)
      output.push("}")
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      s.consequence.forEach((consequent) => gen(consequent))
      if (
        s.alternate instanceof IfStatementShort ||
        s.alternate instanceof IfStatement
      ) {
        output.push("} else")
        gen(s.alternate)
      } else {
        output.push("} else {")
        s.alternate.forEach((statement) => gen(statement))
        output.push("}")
      }
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`)
      s.consequence.forEach((consequent) => gen(consequent))
      output.push("}")
    },
    ForStmt(s) {
      output.push(`for (${s.varDec}; ${s.test}; ${s.increment}) {`)
      gen(s.consequent)
      output.push("}")
    },
    LoopStatement(l) {
      output.push(`for (const ${gen(l.iterator)} of ${l.collection}) {`)
      l.body.forEach((bodyItem) => gen(bodyItem))
      output.push("}")
    },
    Function(f) {
      output.push(`function ${gen(f.name)}(${gen(f.params).join(", ")}) {`)
      gen(f.body)
      output.push("}")
    },
    Call(c) {
      const args = gen(c.args)
      const callee = gen(c.name)
      return `${callee}(${args.join(",")})`
    },
    Arguments(args) {
      return args.asIteration().rep()
    },
    BreakStatement(s) {
      output.push("break;")
    },
    ReturnStatement(s) {
      output.push(`return ${gen(s.expression)};`)
    },
    Statement_shortreturn(s) {
      output.push("return;")
    },
    id(chars) {
      return chars.sourceString
    },
    Var(id) {
      return targetName(id)
    },
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op
      return `(${gen(e.left)} ${op} ${gen(e.right)})`
    },
    Variable(e) {
      return targetName(e)
    },
    Number(e) {
      return e
    },
    StringLiteral(e) {
      return `\"${e.chars}\"`
    },
    Boolean(e) {
      return e
    },
  }

  let randomCalled = false
  gen(program)
  if (randomCalled)
    output.push("function _r(a){return a[~~(Math.random()*a.length)]}")
  return output.join("\n")
}

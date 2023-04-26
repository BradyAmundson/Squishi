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
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
    },
    AssignmentStatement(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`)
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
    ForStatement(s) {
      gen(s.varDec)
      output.push(`while (${gen(s.test)}) {`)
      s.consequence.forEach((consequent) => gen(consequent))
      gen(s.increment)
      output.push("}")
    },
    LoopStatement(l) {
      output.push(`for (const ${gen(l.iterator)} of ${gen(l.collection)}) {`)
      l.body.forEach((bodyItem) => gen(bodyItem))
      output.push("}")
    },
    FunctionDeclaration(f) {
      let genParams = []
      f.params.forEach((param) => genParams.push(gen(param)))
      output.push(`function ${f.name}(${genParams.join(", ")}) {`)
      f.body.forEach((bodyItem) => gen(bodyItem))
      output.push("}")
    },
    Call(c) {
      const args = []
      c.args.forEach((arg) => args.push(gen(arg)))
      output.push(`${c.name}(${args.join(",")});`)
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
    Conditional(e) {
      return `${gen(e.test)} ? ${gen(e.consequent)} : ${gen(e.alternate)}`
    },
    ArrayExpression(e){
      return `[${e.elements}]`
    },
    ArrayCall(e){
      return `${gen(e.name)}[${gen(e.index)}]`
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

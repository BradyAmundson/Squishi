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
    return generators[node.constructor.name](node)
  }

  const generators = {
    Program(p) {
      p.statements.forEach((statement) => gen(statement))
      // gen(p.statements)
    },
    PrintStatement(s) {
      const argument = gen(s.argument)
      output.push(`console.log(${argument});`)
    },
    VariableDeclaration(d) {
      // console.log(`variable: ${d.variable}`)
      output.push(`let ${gen(d.variable)} = ${d.initializer};`)
    },
    AssignStmt(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`)
    },
    IfStmt_short(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      output.push("}")
    },
    IfStmt_long(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      if (s.alternate instanceof IfStmt_long) {
        output.push("} else")
        gen(s.alternate)
      } else {
        output.push("} else {")
        gen(s.alternate)
        output.push("}")
      }
    },
    WhileStmt(s) {
      output.push(`while (${gen(s.test)}) {`)
      gen(s.consequent)
      output.push("}")
    },
    ForStmt(s) {
      output.push(`for (${s.varDec}; ${s.test}; ${s.increment}) {`)
      gen(s.consequent)
      output.push("}")
    },
    LoopStmt(l) {
      output.push(`for (const ${l.iterable} of ${l.collection}) {`)
      gen(l.body)
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
    Statement_break(s) {
      output.push("break;")
    },
    Statement_return(s) {
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
    numeral(e) {
      return e
    },
    stringliteral(e) {
      return e
    },
    BooleanVal(e) {
      return e
    },
  }

  let randomCalled = false
  gen(program)
  if (randomCalled)
    output.push("function _r(a){return a[~~(Math.random()*a.length)]}")
  return output.join("\n")
}

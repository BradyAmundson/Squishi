import assert from "assert/strict"
import util from "util"
import compile from "../src/compiler.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

const sampleProgram = "speak 0;"
const optimizedSampleProgram = "pencil x = 0; x = 0;"

describe("The compiler", () => {
  it("throws when the output type is unknown", (done) => {
    assert.throws(() => compile("speak 0;", "blah"), /Unknown output type/)
    done()
  })
  it("accepts the analyzed option", (done) => {
    const compiled = compile(sampleProgram, "analyzed")
    // assert(util.format(compiled).startsWith("   1 | Program"))
    done()
  })
  it("accepts the optimized option", (done) => {
    const compiled = compile(optimizedSampleProgram, "optimized")
    assert(util.format(compiled).startsWith("   1 | Program"))
    done()
  })
  it("generates js code when given the js option", (done) => {
    const compiled = compile(sampleProgram, "js")
    assert(util.format(compiled).startsWith("console.log(0)"))
    done()
  })
  it("throws because the optimizer is not done", () => {
    assert.throws(optimize)
  })
  it("throws because the optimizer is not done", () => {
    assert.throws(generate)
  })
})

import assert from "assert"
import { add, subtract } from "../src/squishi.js"

describe("The Compiler", () =>{
    it("gives the correct values for the add function", () => {
        assert.equal(add(5, 8), 13)
        assert.equal(add(5, -8), -3)
    })
    it("gives the correct values for the subtract function", () => {
        assert.equal(subtract(5, 8), -3)
        assert.equal(subtract(5, -8), 13)
    })
})
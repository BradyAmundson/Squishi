import assert from "node:assert/strict"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "very small",
    source: `
      pencil x = 3 * 7;
      x = x;
    `,
    expected: dedent`
      let x_1 = 21;
    `,
  },
  {
    name: "loopi",
    source: `
    10.loop item:
      speak(item);
    stop
    `,
    expected: dedent`
      for (const item_1 of 10) {
        console.log(item_1);
      }
    `,
  },
  {
    name: "while and if",
    source: `
    while true:
      if true:
        break;
      else
        break;
      stop
    stop
    `,
    expected: dedent`
      while (true) {
        if (true) {
          break;
        } else {
          break;
        }
      }
    `,
  },
  {
    name: "string",
    source: `
    pencil word = "heyyy";
    `,
    expected: dedent`
      let word_1 = "heyyy";
    `,
  },
  {
    name: "more ifss",
    source: `
    if 4 > 3:
      speak("hi");
    stop

    pencil x = 4;

    if x != 4:
      speak(x);
    else if x!= 5:
      speak("NO!");
    stop
    `,
    expected: dedent`
      if ((4 > 3)) {
        console.log("hi");
      }

      let x_1 = 4;

      if ((x_1 !== 4)) {
        console.log(x_1);
      } else
      if ((x_1 !== 5)) {
        console.log("NO!");
      }
    `,
  },
  {
    name: "function and call and return",
    source: `
    f coolFunction x, y:
      pencil z = x + y;
      if z > 7:
        return;
      else
        return z;
      stop
    stop

    coolFunction: 4, 7;
    `,
    expected: dedent`
      function coolFunction(x_1, y_2) {
        let z_3 = (x_1 + y_2);
        if ((z_3 > 7)) {
          return;
        } else {
          return z_3;
        }
      }

      coolFunction(4,7);
    `,
  },
  {
    name: "array",
    source: `
      pencil anArray = [2, 5, 9];
      pencil z = anArray[2];
    `,
    expected: dedent`
      let anArray_1 = [2,5,9];
      let z_2 = anArray_1[2];
    `,
  },
  {
    name: "for statement",
    source: `
      pencil x = 0;
      for pencil z = 4; stop z > 3 fastfwd z = z - 1;
        x = x + z;
        speak("hey");
      stop
    `,
    expected: dedent`
      let x_1 = 0;
      let z_2 = 4;
      while ((z_2 > 3)) {
        x_1 = (x_1 + z_2);
        console.log("hey");
        z_2 = (z_2 - 1);
      }
    `,
  },
  {
    name: "conditional",
    source: `
      pencil x = 4;
      pencil z = 7 if x > 2 otherwise 9;
    `,
    expected: dedent`
      let x_1 = 4;
      let z_2 = (x_1 > 2) ? 7 : 9;
    `,
  },
  {
    name: "loopi array",
    source: `
    pencil anArray = [2, 5, 9];
    anArray.loop item:
      speak(item);
    stop
    `,
    expected: dedent`
      let anArray_1 = [2,5,9];
      for (const item_2 of anArray_1) {
        console.log(item_2);
      }
    `,
  },
  // {
  //   name: "array",
  //   source: `
  //     pencil anArray = [2, 5, 9];
  //     pencil z = anArray[2];
  //   `,
  //   expected: dedent`
  //     let anArray_1 = [2,5,9];
  //     let z_2 = anArray_1[2];
  //   `,
  // },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(fixture.source)))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})

# [Squishi](https://bradyamundson.github.io/Squishi/)

![](./assets/squishi_logo.jpeg)

Makena Robison, Brady Amundson, Tori Wei

## A Squishi Story

Squish all you need to know into less lines of code! Squishi is designed to be simple and concise, yet exciting and expressive. The syntax is partly inspired by physical actions and commands to make our language easy to learn, especially for beginners. Squishi's simplicity means you'll spend less time typing and more time actually programming! After using Squishi, you'll be as happy as our logo's emojis 😁

View our grammar [here](https://github.com/BradyAmundson/Squishi/blob/main/src/squishi.ohm).

## Squishi Basics

Features:

- Action-like keywords
- Hybrid typing: static, except functions are dynamic
- Strong typing
- Type inference
- Loopi: Simple looping for integers, Strings, and arrays

Optimizations

- constant folding
- strength reductions (+0, -0, *0, *1, etc.)
- for-loop unrolling (only with assignments and '<' operator)
- Loopi over empty string is no-op
- assignments to self (x = x) turn into no-ops

## We All Makes Mistakes – Types of Static Semantic Errors

- Declared an already existing variable
- Used non-initialized variables
- Type mismatch
- Comparing non-boolean values
- Loopi iteration with incorrect type
- Break outside a loop
- Return outside of function
- Incorrect number of arguments

## Using Squishi – Syntax Guide

### Variable Declaration and Assignment

<table>
<tr> <th>JavaScript</th><th>Squishi</th><tr>
</tr>
<td>

```javascript
let x = "Squish"
x = "Squishi"
```

</td>

<td>

```
pencil x = "Squish";
x = "Squishi";
```

</td>
</table>

### Print Statements

<table>
<tr> <th>JavaScript</th><th>Squishi</th><tr>
</tr>
<td>

```javascript
console.log(“Hello world!”)
```

</td>

<td>

```
speak(“Hello world!”);
```

</td>
</table>

### Functions

<table>
<tr> <th>JavaScript</th><th>Squishi</th><tr>
</tr>
<td>

```javascript
function determineEven(x) {
  return x % 2 === 0
}
determineEven(5)
```

</td>

<td>

```
f determineEven x:
  return x % 2 == 0;
stop
determineEven: 5;
```

</td>
</table>

### Loops

<table>
<tr> <th>JavaScript</th><th>Squishi</th><tr>
</tr>
<td>

```javascript
let x = 0
while (x < 3) {
  x = x + 1
}
```

</td>

<td>

```
pencil x = 0;
while x < 3:
  x = x + 1;
stop
```

</td>
</table>

</td>
</table>

<table>
<tr> <th>JavaScript</th><th>Squishi</th><tr>
</tr>
<td>

```javascript
for (let i = 0; i < 5; i = i + 1) {
  console.log(i)
}
```

</td>

<td>

```
for pencil i = 0; stop i < 5 fastfwd i = i + 1;
    speak(i);
stop
```

</td>
</table>

<table>
<tr> <th>JavaScript</th><th>Squishi</th><tr>
</tr>
<td>

```javascript
for (const item of ["hello", "world"]) {
  console.log(item)
}
```

</td>

<td>

```
["hello", "world"].loop item:
  speak(item);
stop
```

</td>
</table>

## Using Squishi - More Example Programs

### Prime Numbers

JavaScript

```
function isPrime(number) {
  if ((number > 1)) {
    let i = 2;
    while (i < number_1) {
      if ((number % i) === 0) {
        console.log("not prime");
        return;
      }
      i = (i + 1);
    }
  }
  console.log("prime");
  return;
}

isPrime(5);
isPrime(15);
```

Squishi

```
f isPrime number:
  if number > 1:
    for pencil i = 2; stop i < number fastfwd i = i + 1;
      if number % i == 0:
        speak("not prime");
        return;
      stop
    stop
  stop
  speak("prime");
  return;
stop

isPrime: 5;
isPrime: 15;
```

### Binary Search

JavaScript

```
function binarySearch(arr, toFind, arrLength) {
  let left = 0;
  let right = arrLength / 2;
  while (left <= right) {
    let mid = (left + right) / 2;
    mid = mid - (mid % 1);
    let midVal = arr[mid];
    if (midVal === toFind) {
      return mid;
    } else {
      if (midVal < toFind) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}
```

Squishi

```
f binarySearch arr, toFind, arrLength:
    pencil left = 0;
    pencil right = arrLength / 2;

    while(left <= right):
        pencil mid = (left + right) / 2;
        mid = mid - (mid % 1);
        pencil midVal = arr[mid];

        if( midVal == toFind ):
            return mid;
        else if( midVal < toFind ):
            left = mid + 1;
        else
            right = mid - 1;
        stop
        stop
    stop

    return -1;
stop
```

## Building

Nodejs is required to build and run this project. Make sure you have a recent version of Node, since the source code uses a fair amount of very modern JavaScript.

Clone the repo, then run `npm install`.

You can then run `npm test`.

## Usage

To run from the command line:

```
node src/squishi.js <filename> <outputType>
```

The `outputType` indicates what you wish to print to standard output:

<table>
<tr><th>Option</th><th>Description</th></tr>
<tr><td>analyzed</td><td>The decorated AST</td></tr>
<tr><td>optimized</td><td>The optimized decorated AST</td></tr>
<tr><td>js</td><td>The translation of the program to JavaScript</td></tr>
</table>

Example runs:

Running `isPrime`, a sample program featured above:

```
$ node src/squishi.js examples/isPrime.squishi analyzed
   1 | Program statements=[#2,#25,#26]
   2 | FunctionDeclaration name='isPrime' params=[#3] body=[#5,#22,#24]
   3 | Variable name='number' type=#4
   4 | Type description='any'
   5 | IfStatementShort test=#6 consequence=[#8]
   6 | BinaryExpression op='>' left=#3 right=1 type=#7
   7 | Type description='boolean'
   8 | ForStatement varDec=#9 test=#12 increment=#13 consequence=[#15]
   9 | VariableDeclaration variable=#10 initializer=2
  10 | Variable name='i' type=#11
  11 | Type description='int'
  12 | BinaryExpression op='<' left=#10 right=#3 type=#7
  13 | AssignmentStatement target=#10 source=#14
  14 | BinaryExpression op='+' left=#10 right=1 type=#11
  15 | IfStatementShort test=#16 consequence=[#18,#21]
  16 | BinaryExpression op='==' left=#17 right=0 type=#7
  17 | BinaryExpression op='%' left=#3 right=#10 type=#4
  18 | PrintStatement argument=#19
  19 | StringLiteral chars='not prime' type=#20
  20 | Type description='string'
  21 | ShortReturnStatement
  22 | PrintStatement argument=#23
  23 | StringLiteral chars='prime' type=#20
  24 | ShortReturnStatement
  25 | Call name='isPrime' args=[5]
  26 | Call name='isPrime' args=[15]
```

```
$ node src/squishi.js examples/isPrime.squishi optimized
   1 | Program statements=[#2,#25,#26]
   2 | FunctionDeclaration name='isPrime' params=[#3] body=[#5,#22,#24]
   3 | Variable name='number' type=#4
   4 | Type description='any'
   5 | IfStatementShort test=#6 consequence=[#8]
   6 | BinaryExpression op='>' left=#3 right=1 type=#7
   7 | Type description='boolean'
   8 | ForStatement varDec=#9 test=#12 increment=#13 consequence=[#15]
   9 | VariableDeclaration variable=#10 initializer=2
  10 | Variable name='i' type=#11
  11 | Type description='int'
  12 | BinaryExpression op='<' left=#10 right=#3 type=#7
  13 | AssignmentStatement target=#10 source=#14
  14 | BinaryExpression op='+' left=#10 right=1 type=#11
  15 | IfStatementShort test=#16 consequence=[#18,#21]
  16 | BinaryExpression op='==' left=#17 right=0 type=#7
  17 | BinaryExpression op='%' left=#3 right=#10 type=#4
  18 | PrintStatement argument=#19
  19 | StringLiteral chars='not prime' type=#20
  20 | Type description='string'
  21 | ShortReturnStatement
  22 | PrintStatement argument=#23
  23 | StringLiteral chars='prime' type=#20
  24 | ShortReturnStatement
  25 | Call name='isPrime' args=[5]
  26 | Call name='isPrime' args=[15]

```

```
$ node src/squishi.js examples/isPrime.squishi js
function isPrime(number_1) {
if ((number_1 > 1)) {
let i_2 = 2;
while ((i_2 < number_1)) {
if (((number_1 % i_2) === 0)) {
console.log("not prime");
return;
}
i_2 = (i_2 + 1);
}
}
console.log("prime");
return;
}
isPrime(5);
isPrime(15);

```

Pipe the output back into node to compile and run on the same line:

```
$ node src/squishi.js examples/isPrime.squishi js | node
prime
not prime
```

Another example run with `optimizationPlayground`, found [here](https://github.com/BradyAmundson/Squishi/blob/main/examples/opt.squishi), to demo the optimizer:

```
$ node src/squishi.js examples/isPrime.squishi analyzed

   1 | Program statements=[#2,#5,#7,#16,#18,#19,#21,#27,#29,#32,#34,#36,#38]
   2 | VariableDeclaration variable=#3 initializer=0
   3 | Variable name='x' type=#4
   4 | Type description='int'
   5 | VariableDeclaration variable=#6 initializer=1
   6 | Variable name='y' type=#4
   7 | ForStatement varDec=#8 test=#10 increment=#12 consequence=[#14]
   8 | VariableDeclaration variable=#9 initializer=0
   9 | Variable name='z' type=#4
  10 | BinaryExpression op='<' left=#9 right=3 type=#11
  11 | Type description='boolean'
  12 | AssignmentStatement target=#9 source=#13
  13 | BinaryExpression op='+' left=#9 right=1 type=#4
  14 | AssignmentStatement target=#3 source=#15
  15 | BinaryExpression op='+' left=#3 right=1 type=#4
  16 | VariableDeclaration variable=#17 initializer=10
  17 | Variable name='a' type=#4
  18 | AssignmentStatement target=#17 source=#17
  19 | VariableDeclaration variable=#20 initializer=1
  20 | Variable name='i' type=#4
  21 | LoopStatement iterator=#22 collection=#24 body=[#25]
  22 | Variable name='item' type=#23
  23 | Type description='string'
  24 | StringLiteral chars='' type=#23
  25 | AssignmentStatement target=#20 source=#26
  26 | BinaryExpression op='+' left=#20 right=1 type=#4
  27 | WhileStatement test=false consequence=[#28]
  28 | BreakStatement
  29 | VariableDeclaration variable=#30 initializer=#31
  30 | Variable name='foldingBool' type=#11
  31 | BinaryExpression op='<' left=5 right=8 type=#11
  32 | VariableDeclaration variable=#33 initializer=10
  33 | Variable name='number' type=#4
  34 | AssignmentStatement target=#33 source=#35
  35 | BinaryExpression op='+' left=#33 right=0 type=#4
  36 | AssignmentStatement target=#33 source=#37
  37 | BinaryExpression op='+' left=0 right=4 type=#4
  38 | AssignmentStatement target=#33 source=#39
  39 | BinaryExpression op='/' left=20 right=4 type=#4

```

```
$ node src/squishi.js examples/isPrime.squishi optimized

   1 | Program statements=[#2,#5,#7,#21,#23,#25,#27,#29,#30]
   2 | VariableDeclaration variable=#3 initializer=0
   3 | Variable name='x' type=#4
   4 | Type description='int'
   5 | VariableDeclaration variable=#6 initializer=1
   6 | Variable name='y' type=#4
   7 | ForStatement varDec=#8 test=#10 increment=#12 consequence=[#14,#15,#17,#18,#19,#20]
   8 | VariableDeclaration variable=#9 initializer=0
   9 | Variable name='z' type=#4
  10 | BinaryExpression op='<' left=#9 right=3 type=#11
  11 | Type description='boolean'
  12 | AssignmentStatement target=#9 source=#13
  13 | BinaryExpression op='+' left=#9 right=1 type=#4
  14 | AssignmentStatement target=#9 source=0
  15 | AssignmentStatement target=#3 source=#16
  16 | BinaryExpression op='+' left=#3 right=1 type=#4
  17 | AssignmentStatement target=#9 source=1
  18 | AssignmentStatement target=#3 source=#16
  19 | AssignmentStatement target=#9 source=2
  20 | AssignmentStatement target=#3 source=#16
  21 | VariableDeclaration variable=#22 initializer=10
  22 | Variable name='a' type=#4
  23 | VariableDeclaration variable=#24 initializer=1
  24 | Variable name='i' type=#4
  25 | VariableDeclaration variable=#26 initializer=true
  26 | Variable name='foldingBool' type=#11
  27 | VariableDeclaration variable=#28 initializer=10
  28 | Variable name='number' type=#4
  29 | AssignmentStatement target=#28 source=4
  30 | AssignmentStatement target=#28 source=5
```

```
$ node src/squishi.js examples/optimizationPlayground.squishi js

let x_1 = 0;
let y_2 = 1;
let z_3 = 0;
while ((z_3 < 3)) {
z_3 = 0;
x_1 = (x_1 + 1);
z_3 = 1;
x_1 = (x_1 + 1);
z_3 = 2;
x_1 = (x_1 + 1);
z_3 = (z_3 + 1);
}
let a_4 = 10;
let i_5 = 1;
let foldingBool_6 = true;
let number_7 = 10;
number_7 = 4;
number_7 = 5;

```

Errors are displayed with a little bit of context, like in `missingFunction.squishi`, found [here](https://github.com/BradyAmundson/Squishi/blob/main/examples/missingFunction.squishi):

```
node src/squishi.js examples/missingFunction.squishi js

Error: Line 3, col 1:
  2 |
> 3 | ppppppp: 4, 7;
      ^~~~~~~
Identifier ppppppp not declared
```

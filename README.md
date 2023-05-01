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

### isPrime

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

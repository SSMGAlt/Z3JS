export const EXAMPLES = {
  'add two numbers': `; adds two constants and prints the result
LOADI1 7
LOADI2 5
ADD
PRINT
HALT`,

  'average of inputs': `; reads two values from the input queue and prints their average
INPUT
STORE 0
INPUT
LOAD2 0
ADD
LOADI2 2
DIV
PRINT
HALT`,

  'hardware square root': `; the Z3 had a genuine hardware square root operation
LOADI1 2
SQRT
PRINT
HALT`,
};

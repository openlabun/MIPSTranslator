/**
 * @jest-environment jsdom
 */

const { sum, translateInstructionToMIPS } = require('../script.js');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
});

test('translates hexadecimal to MIPS instruction, add', () => {
  // Example hexadecimal input and expected MIPS output
  const hexInput = "014B4820";
  const expectedMIPSInstruction = "add t1 t2 t3"; // Example expected output

  const result = translateInstructionToMIPS(hexInput);
  expect(result).toBe(expectedMIPSInstruction);
});

//create test functions for for sub, and, or, lw, sw, beq, bnq, j, add
test('translates hexadecimal to MIPS instruction, sub', () => {
  const hexInput = "014B4822";
  const expectedMIPSInstruction = "sub t1 t2 t3";

  const result = translateInstructionToMIPS(hexInput);
  expect(result).toBe(expectedMIPSInstruction);
});

test('translates hexadecimal to MIPS instruction, and', () => {
  const hexInput = "014B4824";
  const expectedMIPSInstruction = "and t1 t2 t3";

  const result = translateInstructionToMIPS(hexInput);
  expect(result).toBe(expectedMIPSInstruction);
});

test('translates hexadecimal to MIPS instruction, or', () => {
  const hexInput = "014B4825";
  const expectedMIPSInstruction = "or t1 t2 t3";

  const result = translateInstructionToMIPS(hexInput);
  expect(result).toBe(expectedMIPSInstruction);
});

// test('translates hexadecimal to MIPS instruction, lw', () => {
//   const hexInput = "014B4820";
//   const expectedMIPSInstruction = "lw t1 t2 32";

//   const result = translateInstructionToMIPS(hexInput);
//   expect(result).toBe(expectedMIPSInstruction);
// });

// test('translates hexadecimal to MIPS instruction, sw', () => {
//   const hexInput = "014B4820";
//   const expectedMIPSInstruction = "sw t1 t2 32";

//   const result = translateInstructionToMIPS(hexInput);
//   expect(result).toBe(expectedMIPSInstruction);
// });

// test('translates hexadecimal to MIPS instruction, beq', () => {
//   const hexInput = "014B4820";
//   const expectedMIPSInstruction = "beq t1 t2 label";

//   const result = translateInstructionToMIPS(hexInput);
//   expect(result).toBe(expectedMIPSInstruction);
// });

// test('translates hexadecimal to MIPS instruction, bnq', () => {
//   const hexInput = "014B4820";
//   const expectedMIPSInstruction = "bnq t1 t2 label";

//   const result = translateInstructionToMIPS(hexInput);
//   expect(result).toBe(expectedMIPSInstruction);
// });

// test('translates hexadecimal to MIPS instruction, j', () => {
//   const hexInput = "014B4820";
//   const expectedMIPSInstruction = "j label";

//   const result = translateInstructionToMIPS(hexInput);
//   expect(result).toBe(expectedMIPSInstruction);
// });




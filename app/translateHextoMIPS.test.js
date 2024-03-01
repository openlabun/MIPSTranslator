/**
 * @jest-environment jsdom
 */

const translateHextoMIPS = require('./script.js');

test('translates hexadecimal to MIPS instruction', () => {
    // Example hexadecimal input and expected MIPS output
    const hexInput = "00400033";
    const expectedMIPSInstruction = "add $t2, $t0, $t1"; // Example expected output
    
    const result = translateHextoMIPS(hexInput);
    expect(result).toBe(expectedMIPSInstruction);
  });
  
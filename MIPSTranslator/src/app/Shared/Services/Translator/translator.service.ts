import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {

  operationToFunctionCode(op: string): string {
    const functCodes: { [key: string]: string } = {
      'add': '100000',
      'sub': '100010',
      'and': '100100',
      'or': '100101',
      'slt': '101010',
  };
  return functCodes[op] || 'unknown';
  }

  convertOpCodeNameToCode(opcodeName: string): string {
    const opcodeMap: { [key: string]: string } = {
      "add": "000000", "sub": "000000", "slt": "000000", "and": "000000", "or": "000000",
      "addi": "001000", "lw": "100011", "sw": "101011",
      "beq": "000100", "bne": "000101",
      "j": "000010"
  };
  return opcodeMap[opcodeName] || 'unknown';
  }

  translateInstructionToHex(instruction: string): string {
    const funcMap: { [key: string]: string } = {
      "add": "100000", "sub": "100010", "slt": "101010", "and": "100100", "or": "100101",
    };
  

    const regMap: { [key: string]: string } = {
      "zero": "00000", "at": "00001", "v0": "00010", "v1": "00011",
      "a0": "00100", "a1": "00101", "a2": "00110", "a3": "00111",
      "t0": "01000", "t1": "01001", "t2": "01010", "t3": "01011",
      "t4": "01100", "t5": "01101", "t6": "01110", "t7": "01111",
      "s0": "10000", "s1": "10001", "s2": "10010", "s3": "10011",
      "s4": "10100", "s5": "10101", "s6": "10110", "s7": "10111",
      "t8": "11000", "t9": "11001", "k0": "11010", "k1": "11011",
      "gp": "11100", "sp": "11101", "fp": "11110", "ra": "11111"
    };

    instruction = instruction.replace(/\$/g, ''); 
    const parts = instruction.split(' ');

    const opcode = this.convertOpCodeNameToCode(parts[0]);
    if (!opcode) return "Unknown Instruction";

    let binaryInstruction = opcode;
    if (["add", "sub", "slt", "and", "or"].includes(parts[0])) {
        
        const rd = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const rt = regMap[parts[3]];
        if (!rd || !rs || !rt) return "Invalid Registers";
        binaryInstruction += rs + rt + rd + "00000" + funcMap[parts[0]];
    } else if (["lw", "sw"].includes(parts[0])) {
 
        const rt = regMap[parts[1]];
        const rs = regMap[parts[3].split(',')[0]];
        const immediate = parseInt(parts[2]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["addi"].includes(parts[0])) {

        const rt = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const immediate = parseInt(parts[3]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["beq", "bne"].includes(parts[0])) {

        const rs = regMap[parts[1]];
        const rt = regMap[parts[2]];
        const label = parts[3];
        if (!rs || !rt) return "Invalid Registers";
        // For simplicity, assuming label is an immediate value (offset)
        const offset = parseInt(label);
        if (isNaN(offset)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (offset >>> 0).toString(2).padStart(16, '0');
    } else if (["j"].includes(parts[0])) {
        // J-type instruction
        const address = parseInt(parts[1]);
        if (isNaN(address)) return "Invalid Syntax";
        binaryInstruction += (address >>> 0).toString(2).padStart(26, '0');
    } else {
        return "Unsupported Instruction";
    }

    // Convert binary instruction to hexadecimal
    const hexInstruction = parseInt(binaryInstruction, 2).toString(16).toUpperCase().padStart(8, '0');
    return hexInstruction;
  }

  convertRegisterToName(registerBinary: string): string {
    const regMap: { [key: string]: string } = {
      "00000": "zero", "00001": "at", "00010": "v0", "00011": "v1",
      "00100": "a0", "00101": "a1", "00110": "a2", "00111": "a3",
      "01000": "t0", "01001": "t1", "01010": "t2", "01011": "t3",
      "01100": "t4", "01101": "t5", "01110": "t6", "01111": "t7",
      "10000": "s0", "10001": "s1", "10010": "s2", "10011": "s3",
      "10100": "s4", "10101": "s5", "10110": "s6", "10111": "s7",
      "11000": "t8", "11001": "t9", "11010": "k0", "11011": "k1",
      "11100": "gp", "11101": "sp", "11110": "fp", "11111": "ra"
    };
    return regMap[registerBinary] || 'unknown';
  }

  
  convertFunctToName(functBinary: string): string {
    const funcMap: { [key: string]: string } = {
      "100000": "add",
      "100010": "sub",
      "101010": "slt",
      "100100": "and",
      "100101": "or",
    };
  
    return funcMap[functBinary] || 'unknown';
  }

  
  convertOpcodeToName(opcodeBinary: string): string {
    
    const opcodeMap: { [key: string]: string } = {
     
      "000000": "add",
      // @ts-ignore
      "000000": "sub", "000000": "slt", "000000": "and", "000000": "or",
      "001000": "addi",
      "100011": "lw",
      "101011": "sw",
      "000100": "beq",
      "000101": "bne",
      "000010": "j"
    };
    return opcodeMap[opcodeBinary] || 'unknown';
  }

  // Función para traducir de Hex a MIPS
   translateInstructionToMIPS(hexInstruction: string): string {
    console.log("hexInstruction", hexInstruction);  
    const binaryInstruction = this.hexToBinary(hexInstruction);
    console.log('Binary Instruction:', binaryInstruction);
    const opcode = binaryInstruction.slice(0, 6);
    console.log(opcode);
    const opcodeMIPS = this.convertOpcodeToName(opcode);
    console.log('Opcode:', opcode, 'Opcode MIPS:', opcodeMIPS);

    if (!opcodeMIPS) return "Unknown Instruction, opcode null";

    let mipsInstruction = opcodeMIPS + " ";

    if (["add", "sub", "slt", "and", "or"].includes(opcodeMIPS)) {
      //R-type instruction
        const func = binaryInstruction.slice(26, 32);
        console.log("Instruction func ", func);

        const funcMIPS = this.convertFunctToName(func);
        console.log('Func:', func, 'Func MIPS:', funcMIPS);

        if (!funcMIPS) return "Unknown Instruction (function)";
        mipsInstruction = funcMIPS + " ";
        const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
        const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
        const rd = this.convertRegisterToName(binaryInstruction.slice(16, 21));
        console.log('Registers:', { rs, rt, rd });
        if (!rs || !rt || !rd) return "Invalid Registers";
        mipsInstruction += rd + " " + rs + " " + rt;
    } else if (["lw", "sw"].includes(opcodeMIPS)) {
        const rt = this.convertRegisterToName(binaryInstruction.slice(6, 11));
        const rs = this.convertRegisterToName(binaryInstruction.slice(11, 16));
        const offset = binaryInstruction.slice(16, 32);
        if (!rt || !rs || isNaN(parseInt(offset, 2))) return "Invalid Syntax";
        mipsInstruction += rs + " " + rt + " " + parseInt(offset, 2);
    } else if (["addi"].includes(opcodeMIPS)) {
        const rt = this.convertRegisterToName(binaryInstruction.slice(6, 11));
        const rs = this.convertRegisterToName(binaryInstruction.slice(11, 16));
        const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));
        if (!rt || !rs || !immediate) return "Invalid Syntax";
        mipsInstruction += rs + " " + rt + " " + immediate;
    } else if (["beq", "bne"].includes(opcodeMIPS)) {
        const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
        const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
        const offset = parseInt(binaryInstruction.slice(16, 32), 2);
        if (!rs || !rt || isNaN(offset)) return "Invalid Syntax";
        mipsInstruction += rs + " " + rt + " " + offset;
    } else if (["j"].includes(opcodeMIPS)) {
        const address = parseInt(binaryInstruction.slice(6, 32), 2);
        if (isNaN(address)) return "Invalid Syntax";
        mipsInstruction += address;
    } else {
        return "Unsupported Instruction, aqui ";
    }

    return mipsInstruction;
  }

  // Utilidades


  binaryToHex(binaryString: string): string {
    // Pad the binary string with leading zeros to ensure it's a multiple of 4
    while (binaryString.length % 4 !== 0) {
        binaryString = '0' + binaryString;
    }

    // Initialize an empty string to store the hexadecimal representation
    let hexString = '';

    // Convert each group of 4 bits to its hexadecimal equivalent
    for (let i = 0; i < binaryString.length; i += 4) {
        const binaryChunk = binaryString.substring(i, i + 4); // Get a chunk of 4 bits
        const hexDigit = parseInt(binaryChunk, 2).toString(16); // Convert the chunk to hexadecimal
        hexString += hexDigit; // Append the hexadecimal digit to the result
    }

    // Return the hexadecimal representation
    return "0x" + hexString.toUpperCase(); // Convert to uppercase for consistency
  }

  hexToBinary(hex: string): string {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
        let bin = parseInt(hex[i], 16).toString(2);
        binary += bin.padStart(4, '0');
    }
    return binary;
  }
  sum(a: number, b: number): number {
    return a + b;
  }
  translateHextoMIPS(hexInput: HTMLTextAreaElement, mipsInput: HTMLTextAreaElement): void {
    const instructions: string[] = hexInput.value.trim().split('\n');

    // Translate each hexadecimal instruction to MIPS
    const translatedInstructions: string[] = instructions.map(instruction => {
        return this.translateInstructionToMIPS(instruction.trim());
    });

    // Join the translated instructions with a newline character
    const formattedInstructions: string = translatedInstructions.join('\n');

    // Set the value of the input textarea to the formatted instructions
    mipsInput.value = formattedInstructions;
  }

  translateMIPStoHex(mipsInput: HTMLTextAreaElement, hexInput: HTMLTextAreaElement): void {
    const instructions: string[] = mipsInput.value.trim().split('\n');

    // Translate each MIPS instruction to hexadecimal
    const translatedInstructions: string[] = instructions.map(instruction => {
        return this.translateInstructionToHex(instruction.trim());
    });

    // Join the translated instructions with a newline character
    const formattedInstructions: string = translatedInstructions.join('\n');

    // Set the value of the inputHex textarea to the formatted instructions
    hexInput.value = formattedInstructions;
}
  
}

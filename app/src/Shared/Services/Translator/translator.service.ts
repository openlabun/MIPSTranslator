import { Injectable } from '@angular/core';
import instructionsData from '../../../data/mips-instructions.json';

export interface Instruction {
  mnemonic: string;
  type: 'R' | 'I' | 'J';
  version: string;
  opcode: string;
  funct?: string;
  description: string;
  example?: string;
  args: string[];
  template?: string;
  rt?: string;
}



export const registerMap: { [key: string]: string } = {
  "00000": "zero", "00001": "at", "00010": "v0", "00011": "v1",
  "00100": "a0", "00101": "a1", "00110": "a2", "00111": "a3",
  "01000": "t0", "01001": "t1", "01010": "t2", "01011": "t3",
  "01100": "t4", "01101": "t5", "01110": "t6", "01111": "t7",
  "10000": "s0", "10001": "s1", "10010": "s2", "10011": "s3",
  "10100": "s4", "10101": "s5", "10110": "s6", "10111": "s7",
  "11000": "t8", "11001": "t9", "11010": "k0", "11011": "k1",
  "11100": "gp", "11101": "sp", "11110": "fp", "11111": "ra"
};

@Injectable({
  providedIn: 'root',
})

export class TranslatorService {

  registerMap = registerMap;
  instructions: Instruction[] = instructionsData as Instruction[];


  instructionMap: { [key: string]: Instruction } = {};

  constructor() {
  this.instructions.forEach(instr => {
    this.instructionMap[instr.mnemonic] = instr; // guarda todo
  });
}


 getOpcode(name: string): string {
  return this.instructionMap[name]?.opcode || 'unknown';
}

  getFunctCode(name: string): string {
    return this.instructionMap[name]?.funct || 'unknown';
  }

  convertOpCodeNameToCode(opcodeName: string): string {
    return this.getOpcode(opcodeName);
  }

  convertFunctToName(functBinary: string): string {
  const name = Object.keys(this.instructionMap).find(
    key => this.instructionMap[key].funct === functBinary
  );
  return name || 'unknown';
}

  convertOpcodeToName(opcodeBinary: string): string {
  const name = Object.keys(this.instructionMap).find(
    key => this.instructionMap[key].opcode === opcodeBinary
  );
  return name || 'unknown';
}

  convertRegisterToBinary(registerName: string): string {
    const binary = Object.keys(registerMap).find(key => registerMap[key] === registerName);
    return binary || 'unknown';
  }

  convertRegisterToName(registerBinary: string): string {
    return registerMap[registerBinary] ? `$${registerMap[registerBinary]}` : 'unknown';
  }

  toLowerCaseString(text: string): string {
    return text.toLowerCase();
  }

  translateInstructionToHex(instruction: string): string {
    instruction = this.toLowerCaseString(instruction.replace(/\$/g, ''));
    const parts = instruction.split(' ');
    const opcode = this.getOpcode(parts[0]);
    if (opcode === 'unknown') return `Unknown Opcode for "${parts[0]}"`;

    let binaryInstruction = opcode;

    if (["add", "sub", "slt", "and", "or", "nor", "addu", "sllv", "srlv", "subu", "srav", "xor"].includes(parts[0])) {
      const rd = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const rt = this.convertRegisterToBinary(parts[3]);
      if (!rd || !rs || !rt) return `Missing ${!rd ? ' rd' : ''}${!rs ? ' rs' : ''}${!rt ? ' rt' : ''}`;
      binaryInstruction += rs + rt + rd + "00000" + this.getFunctCode(parts[0]);
    } else if (["div", "divu", "mult", "multu"].includes(parts[0])) {
      const rs = this.convertRegisterToBinary(parts[1]);
      const rt = this.convertRegisterToBinary(parts[2]);
      if (!rs || !rt) return "Invalid Registers";
      binaryInstruction += rs + rt + "00000" + "00000" + this.getFunctCode(parts[0]);
    } else if (["mfhi", "mflo"].includes(parts[0])) {
      const rd = this.convertRegisterToBinary(parts[1]);
      if (!rd) return "Invalid Registers";
      binaryInstruction += "00000" + "00000" + rd + "00000" + this.getFunctCode(parts[0]);
    } else if (["mthi", "mtlo"].includes(parts[0])) {
      const rs = this.convertRegisterToBinary(parts[1]);
      if (!rs) return "Invalid Registers";
      binaryInstruction += rs + "00000" + "00000" + "00000" + this.getFunctCode(parts[0]);
    } else if (["lw", "sw", "lb", "lbu", "lh", "lhu", "sb", "sh"].includes(parts[0])) {
      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[3].split(',')[0]);
      const immediate = parseInt(parts[2]);
      if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
      binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["addi", "addiu", "andi", "ori", "xori"].includes(parts[0])) {
      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const immediate = parseInt(parts[3]);
      if (!rt || !rs || isNaN(immediate)) {
        return `Missing${!rt ? ' rt' : ''}${isNaN(immediate) ? ' immediate (hex)' : ''}${!rs ? ' rs' : ''}`;
      }
      binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["sll", "srl", "sra"].includes(parts[0])) {
      const rd = this.convertRegisterToBinary(parts[1]);
      const rt = this.convertRegisterToBinary(parts[2]);
      const shamt = parseInt(parts[3]);
      if (!rd || !rt || isNaN(shamt)) return "Invalid Syntax";
      const shamtBin = shamt.toString(2).padStart(5, '0');
      binaryInstruction += "00000" + rt + rd + shamtBin + this.getFunctCode(parts[0]);
    } else if (["beq", "bne", "bgtz", "blez"].includes(parts[0])) {
      const rs = this.convertRegisterToBinary(parts[1]);
      const rt = ["beq", "bne"].includes(parts[0]) ? this.convertRegisterToBinary(parts[2]) : "00000";
      const label = parts[parts.length - 1];
      if (!rs || (["beq", "bne"].includes(parts[0]) && !rt)) return "Invalid Registers";
      const offset = parseInt(label);
      if (isNaN(offset)) return "Invalid Syntax";
      const offsetBinary = (offset >>> 0).toString(2).padStart(16, '0');
      binaryInstruction += rs + rt + offsetBinary;
    } else if (["j", "jal"].includes(parts[0])) {
      const address = parseInt(parts[1]);
      if (isNaN(address)) return "Invalid Syntax";
      binaryInstruction += (address >>> 0).toString(2).padStart(26, '0');
    } else if (["jalr"].includes(parts[0])) {
      const rs = this.convertRegisterToBinary(parts.length === 2 ? parts[1] : parts[2]);
      const rd = parts.length === 3 ? this.convertRegisterToBinary(parts[1]) : "11111";
      if (!rs || !rd) return "Invalid Registers";
      binaryInstruction += rs + "00000" + rd + "00000" + this.getFunctCode(parts[0]);
    } else if (["jr"].includes(parts[0])) {
      const rs = this.convertRegisterToBinary(parts[1]);
      if (!rs) return "Missing rs";
      binaryInstruction += rs + "00000" + "00000" + "00000" + this.getFunctCode(parts[0]);
    } else if (["teq", "tge", "tgeu", "tlt", "tltu", "tne"].includes(parts[0])) {
      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      let code = parseInt(parts[3]);
      if (!rs || !rt) return "Invalid Registers";
      if (isNaN(code) || code < 0 || code > 1023) return "Invalid Code";
      const codeBinary = code.toString(2).padStart(10, '0');
      binaryInstruction += rs + rt + codeBinary + this.getFunctCode(parts[0]);
    } else if (["syscall", "break"].includes(parts[0])) {
      binaryInstruction = opcode + "00000000000000000000" + this.getFunctCode(parts[0]);
    } else if (["bltz", "bgez"].includes(parts[0])) {
      const rs = this.convertRegisterToBinary(parts[1]);
      const offset = parseInt(parts[2]);
      if (!rs || isNaN(offset)) return "Invalid Syntax";
      binaryInstruction += rs + this.instructionMap[parts[0]].rt + (offset >>> 0).toString(2).padStart(16, '0');
    } else if (["slti", "sltiu"].includes(parts[0])) {
      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const immediate = parseInt(parts[3]);    
      
      if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
      
      // Estructura I-Type: opcode + rs + rt + immediate
      binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["lui"].includes(parts[0])) {
      const rt = this.convertRegisterToBinary(parts[1]);
      const immediate = parseInt(parts[2]);
      if (!rt || isNaN(immediate)) return "Invalid Syntax";
      binaryInstruction += "00000" + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["tgei", "tgeiu", "tlti", "tltiu", "teqi", "tnei"].includes(parts[0])) {
      const rs = this.convertRegisterToBinary(parts[1]);
      const immediate = parseInt(parts[2]);
      if (!rs || isNaN(immediate)) return "Invalid Syntax";
      const immediateBinary = (immediate >>> 0).toString(2).padStart(16, '0');
      binaryInstruction += rs + this.getOpcode(parts[0]) + immediateBinary;
    } else {
      return "Unsupported Instruction";
    }

    const hexInstruction = parseInt(binaryInstruction, 2).toString(16).toUpperCase().padStart(8, '0');
    return hexInstruction;
  }

  translateInstructionToMIPS(hexInstruction: string): string {
    if (hexInstruction.startsWith("0x")) {
      hexInstruction = hexInstruction.substring(2);
    }
    const binaryInstruction = this.hexToBinary(hexInstruction);
    const opcode = binaryInstruction.slice(0, 6);
    const opcodeMIPS = this.convertOpcodeToName(opcode);
    if (!opcodeMIPS) return "Unknown Instruction, opcode null";

    let mipsInstruction = opcodeMIPS + " ";

    if (opcode === "000001") {
      const rt = binaryInstruction.slice(11, 16);
      const offset = this.binaryToHex(binaryInstruction.slice(16, 32));
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      
      if (rt === "00000") {
        mipsInstruction = `bltz ${rs} ${offset}`;
      } else if (rt === "00001") {
        mipsInstruction = `bgez ${rs} ${offset}`;
      } 
    } else if (["add", "sub", "slt", "and", "or", "jr", "jalr", "mfhi", "mflo", "mthi", "mtlo", "tge", "tgeu", "tlt", "tltu", "teq", "tne", "addu", 
      "subu", "xor", "nor", "sll", "srl", "mult", "div", "sra", "srav", "srlv", "divu", "multu", "sllv"].includes(opcodeMIPS)) {
      const func = binaryInstruction.slice(26, 32);
      const funcMIPS = this.convertFunctToName(func);
      if (!funcMIPS) return "Unknown Instruction (function)";

      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const rd = this.convertRegisterToName(binaryInstruction.slice(16, 21));

      if (["add", "sub", "slt", "and", "or", "addu", "subu", "xor", "nor", "srlv", "sllv", "srav"].includes(funcMIPS)) {
        mipsInstruction = funcMIPS + " " + rd + " " + rs + " " + rt;
      } else if (funcMIPS === "jr") {
        mipsInstruction = "jr " + rs;
      } else if (funcMIPS === "jalr") {
        mipsInstruction = "jalr " + rs + " " + rd;
      } else if (["sll", "srl", "sra"].includes(funcMIPS)) {
        const shamt = this.binaryToHex(binaryInstruction.slice(21, 26));
        mipsInstruction = funcMIPS + " " + rd + " " + rt + " " + shamt;
      } else if (["mult", "div", "multu", "divu"].includes(funcMIPS)) {
        mipsInstruction = funcMIPS + " " + rs + " " + rt;
      } else if (["mfhi", "mflo"].includes(funcMIPS)) {
        mipsInstruction = funcMIPS + " " + rd;
      } else if (["mthi", "mtlo"].includes(funcMIPS)) {
        mipsInstruction = funcMIPS + " " + rs;
      } else if (["tge", "tgeu", "tlt", "tltu", "teq", "tne"].includes(funcMIPS)) {
        const code = this.binaryToHex(binaryInstruction.slice(16, 26));
        mipsInstruction = funcMIPS + " " + rt + " " + rs + " " + code;
      } else if (funcMIPS === "syscall" || funcMIPS === "break") {
        mipsInstruction = funcMIPS; 
      }
    } else if (["tgei", "tgeiu", "tlti", "tltiu", "teqi", "tnei"].includes(opcodeMIPS)) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = binaryInstruction.slice(11, 16);
      const rtMap: { [key: string]: string } = {
        "01000": "tgei", "01001": "tgeiu", "01010": "tlti",
        "01011": "tltiu", "01100": "teqi", "01110": "tnei"
      };
      const instructionName = rtMap[rt];
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));
      if (!instructionName || !rs || !immediate) return "Invalid Syntax";
      mipsInstruction = instructionName + " " + rs + " " + immediate;
    } else if (["lw", "sw", "lb", "lbu", "lh", "lhu", "sb", "sh"].includes(opcodeMIPS)) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const offset = this.binaryToHex(binaryInstruction.slice(16, 32));
      if (!rt || !rs || !offset) return "Invalid Syntax";
      mipsInstruction += rt + " " + offset + " " + rs;
    } else if (["addi", "addiu", "andi", "ori", "xori"].includes(opcodeMIPS)) {
      const rt = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rs = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));
      if (!rt || !rs || !immediate) return "Invalid Syntax";
      mipsInstruction += rs + " " + rt + " " + immediate;
    } else if (["slti", "sltiu"].includes(opcodeMIPS)) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));
      
      if (!rt || !rs || !immediate) return "Invalid Syntax";
      mipsInstruction = `${opcodeMIPS} ${rt} ${rs} ${immediate}`;
    } else if (opcodeMIPS === "lui") {
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));
      mipsInstruction = `lui ${rt} ${immediate}`;
    } else if (["beq", "bne", "bgtz", "blez"].includes(opcodeMIPS)) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = ["beq", "bne"].includes(opcodeMIPS) ? this.convertRegisterToName(binaryInstruction.slice(11, 16)) : "00000";
      const offset = this.binaryToHex(binaryInstruction.slice(16, 32));
      if (!rs || !offset) return "Invalid Registers or Syntax";
      if (opcodeMIPS === "bgtz" || opcodeMIPS === "blez") {
        mipsInstruction += rs + " " + offset;
      } else {
        mipsInstruction += rs + " " + rt + " " + offset;
      }
    } else if (["j", "jal"].includes(opcodeMIPS)) {
      const address = this.binaryToHex(binaryInstruction.slice(6, 32));
      if (!address) return "Invalid Syntax";
      mipsInstruction += address;
    } else {
      return "Unsupported Instruction";
    }

    return mipsInstruction;
  }

  binaryToHex(binaryString: string): string {
    while (binaryString.length % 4 !== 0) {
      binaryString = '0' + binaryString;
    }
    let hexString = '';
    for (let i = 0; i < binaryString.length; i += 4) {
      const binaryChunk = binaryString.substring(i, i + 4);
      const hexDigit = parseInt(binaryChunk, 2).toString(16);
      hexString += hexDigit;
    }
    return "0x" + hexString.toUpperCase();
  }

  hexToBinary(hex: string): string {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
      let bin = parseInt(hex[i], 16).toString(2);
      binary += bin.padStart(4, '0');
    }
    return binary;
  }

  translateHextoMIPS(textInput: string): string {
    const instructions: string[] = textInput.trim().split('\n');
    const translatedInstructions: string[] = instructions.map(instruction => {
      return this.translateInstructionToMIPS(instruction.trim());
    });
    const formattedInstructions: string = translatedInstructions.join('\n');
    return formattedInstructions;
  }

  translateMIPStoHex(textInput: string): string {
    const instructions: string[] = textInput.trim().split('\n');
    const translatedInstructions: string[] = instructions.map(instruction => {
      return this.translateInstructionToHex(instruction.trim());
    });
    const formattedInstructions: string = translatedInstructions.join('\n');
    return formattedInstructions;
  }

  isValidHex(text: string): boolean {
    return /^[0-9A-Fa-f\s]{8}$/.test(text);
  }

  isValidMIPS(text: string): boolean {
    const instructions: string[] = text.trim().split('\n');

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i].trim();
      const parts = instruction.split(' ');
      const opcode = parts[0];
      if (!this.instructionMap[opcode]) {
        return false;
      }
    }

    return true;
  }
}

import { Injectable } from '@angular/core';
import {
  getRequiredFunctArguments,
  getRequiredImmArguments,
  rtToImmediateTrap,
} from '../../lib/mips/args';
import { encodeInstruction } from '../../lib/mips/encoding';
import { FunctionCode } from '../../lib/mips/funct';
import {
  DecodedInstruction,
  ImmediateInstruction,
  isImm,
  isJump,
  isReg,
  JumpInstruction,
  RegisterInstruction,
} from '../../lib/mips/instruction';
import {
  ImmediateInstructionOpcode,
  JumpInstructionOpcode,
  KnownInstructionOpcode,
  RegisterInstructionOpcode,
} from '../../lib/mips/op';
import { parsePartialInstruction } from '../../lib/mips/parse';
import { Register } from '../../lib/mips/reg';
import { inEnum } from '../../lib/util/enum';

export type ParsingStage = 'operation' | 'args' | 'complete';

export type ParsingResultBase = {
  missing: string[];
};

export type OperationStageResult = ParsingResultBase & {
  stage: 'operation';
};

export type ArgsStageResult = ParsingResultBase & {
  stage: 'args';
  instruction: Partial<DecodedInstruction>;
};

export type CompleteResult = ParsingResultBase & {
  stage: 'complete';
  instruction: DecodedInstruction;
};

export type ParsingResult =
  | OperationStageResult
  | ArgsStageResult
  | CompleteResult;

@Injectable({
  providedIn: 'root',
})
export class TranslatorService {
  getFunctCode(name: string): string {
    if (inEnum(name, FunctionCode)) {
      return FunctionCode[name].toString(2).padStart(6, '0');
    }
    return 'unknown';
  }

  convertFunctToName(functBinary: string): string {
    const num = parseInt(functBinary, 2);
    if (inEnum(num, FunctionCode)) {
      return FunctionCode[num];
    } else if (inEnum(num, KnownInstructionOpcode)) {
      return KnownInstructionOpcode[num];
    }

    return 'unknown';
  }

  tryParse(instruction: string): ParsingResult {
    const inst = parsePartialInstruction(instruction);
    if (!('op' in inst) || inst.op === undefined) {
      return { stage: 'operation', missing: ['op'] };
    }

    if (inst.op === RegisterInstructionOpcode.REG) {
      if ('rs' in inst && 'rt' in inst && 'rd' in inst && 'shamt' in inst) {
        return {
          stage: 'complete',
          instruction: inst as DecodedInstruction,
          missing: [],
        };
      }

      return {
        stage: 'args',
        instruction: inst,
        missing: getRequiredFunctArguments(inst.funct!),
      };
    }

    if (inEnum(inst.op, ImmediateInstructionOpcode)) {
      if ('rs' in inst && 'rt' in inst && 'imm' in inst) {
        return {
          stage: 'complete',
          instruction: inst as DecodedInstruction,
          missing: [],
        };
      }

      return {
        stage: 'args',
        instruction: inst,
        missing: getRequiredImmArguments(inst.op as ImmediateInstructionOpcode),
      };
    }

    if (inEnum(inst.op, JumpInstructionOpcode) && 'imm' in inst) {
      return {
        stage: 'complete',
        instruction: inst as DecodedInstruction,
        missing: [],
      };
    }
    return { stage: 'args', instruction: inst, missing: ['imm'] };
  }

  private makeRDisplay(
    inst: RegisterInstruction,
    ...regs: Exclude<keyof RegisterInstruction, 'op' | 'funct'>[]
  ) {
    const vals = [FunctionCode[inst.funct]];
    for (const key of regs) {
      vals.push(
        key === 'shamt'
          ? `0x${inst.shamt.toString(16).padStart(2, '0').toUpperCase()}`
          : `$${Register[inst[key]]}`
      );
    }
    return vals.join(' ');
  }

  private makeIDisplay(
    inst: ImmediateInstruction,
    ...regs: Exclude<keyof ImmediateInstruction, 'op'>[]
  ) {
    const vals = [
      inst.op === 1
        ? rtToImmediateTrap(inst.rt)
        : ImmediateInstructionOpcode[inst.op],
    ];

    for (const key of regs) {
      vals.push(
        key === 'imm'
          ? `0x${inst.imm.toString(16).padStart(4, '0').toUpperCase()}`
          : `$${Register[inst[key]]}`
      );
    }
    return vals.join(' ');
  }

  private makeJDisplay(inst: JumpInstruction) {
    return `${JumpInstructionOpcode[inst.op]} 0x${inst.imm
      .toString(16)
      .padStart(7, '0')
      .toUpperCase()}`;
  }

  toAsm(instruction: DecodedInstruction): string {
    if (isReg(instruction)) {
      if (
        instruction.funct === FunctionCode.jalr &&
        instruction.rd !== Register.ra
      ) {
        return this.makeRDisplay(instruction, 'rd', 'rs');
      }

      const args = getRequiredFunctArguments(instruction.funct);
      return this.makeRDisplay(instruction, ...args);
    } else if (isImm(instruction)) {
      const args = getRequiredImmArguments(instruction.op);
      return this.makeIDisplay(instruction, ...args);
    } else if (isJump(instruction)) {
      return this.makeJDisplay(instruction);
    }
    throw new TypeError('The provided instruction is not valid.');
  }

  toHex(instruction: DecodedInstruction): string {
    const hex = encodeInstruction(instruction);
    return hex.toString(16).toUpperCase().padStart(8, '0');
  }

  translateInstructionToHex(instruction: string): string {
    const inst = parsePartialInstruction(instruction) as DecodedInstruction;
    try {
      return this.toHex(inst);
    } catch {
      return 'Unsupported Instruction';
    }
  }

  translateInstructionToMIPS(hexInstruction: string): string {
    const inst = parsePartialInstruction(hexInstruction) as DecodedInstruction;
    try {
      return this.toAsm(inst);
    } catch {
      return 'Unsupported Instruction';
    }
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
    return '0x' + hexString.toUpperCase();
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
    const translatedInstructions: string[] = instructions.map((instruction) => {
      return this.translateInstructionToMIPS(instruction.trim());
    });
    const formattedInstructions: string = translatedInstructions.join('\n');
    return formattedInstructions;
  }

  translateMIPStoHex(textInput: string): string {
    const instructions: string[] = textInput.trim().split('\n');
    const translatedInstructions: string[] = instructions.map((instruction) => {
      return this.translateInstructionToHex(instruction.trim());
    });
    const formattedInstructions: string = translatedInstructions.join('\n');
    return formattedInstructions;
  }
}

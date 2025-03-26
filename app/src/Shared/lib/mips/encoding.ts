import { FunctionCode } from './funct';
import { DecodedInstruction, isImm, isJump, isReg } from './instruction';
import {
  ImmediateInstructionOpcode,
  JumpInstructionOpcode,
  RegisterInstructionOpcode,
} from './op';

/**
 * Decodes the provided instruction into a strongly typed representation.
 *
 * @param instruction The instruction to decode.
 * @returns The decoded instruction.
 * @throws {RangeError} If the instruction's opcode or function code is invalid.
 * @throws {TypeError} If the instruction does not fit 32-bit unsigned range.
 */

export function decodeInstruction(instruction: number): DecodedInstruction {
  // Value must be within 32-bit unsigned range
  if (instruction < 0 || instruction > 4294967295) {
    throw new TypeError(
      `The provided instruction is too large - it must fall within 32-bit unsigned range.`
    );
  }

  const op = instruction >>> 26;
  if (op === RegisterInstructionOpcode.REG) {
    const funct = instruction & 63; // 6 bits
    if (funct in FunctionCode) {
      return {
        op,
        rs: (instruction >>> 21) & 31, // 5 bits
        rt: (instruction >>> 16) & 31, // 5 bits
        rd: (instruction >>> 11) & 31, // 5 bits
        shamt: (instruction >>> 6) & 31, // 5 bits
        funct,
      };
    }

    throw new RangeError(
      `The provided register instruction's function code (${funct}) is not valid.`
    );
  }

  if (op in JumpInstructionOpcode) {
    return {
      op,
      imm: instruction & 67108863, // 26 bits
    };
  }

  if (op in ImmediateInstructionOpcode) {
    return {
      op,
      rs: (instruction >>> 21) & 31, // 5 bits
      rt: (instruction >>> 16) & 31, // 5 bits
      imm: instruction & 65535, // 16 bits
    };
  }

  throw new RangeError(
    `The provided instruction's opcode (${op}) is not valid.`
  );
}
/**
 * Encodes the provided instruction into a number.
 *
 * @param instruction The instruction to Encode.
 * @returns The encoded instruction.
 * @throws {TypeError} If the instruction is not valid.
 */

export function encodeInstruction(instruction: DecodedInstruction): number {
  if (isReg(instruction)) {
    return (
      instruction.rs * 2 ** 21 +
      instruction.rt * 2 ** 16 +
      instruction.rd * 2 ** 11 +
      instruction.shamt * 2 ** 6 +
      instruction.funct
    );
  }

  if (isJump(instruction)) {
    return instruction.op * 2 ** 26 + instruction.imm;
  }

  if (isImm(instruction)) {
    return (
      instruction.op * 2 ** 26 +
      instruction.rs * 2 ** 21 +
      instruction.rt * 2 ** 16 +
      instruction.imm
    );
  }

  throw new TypeError(`The provided instruction is not valid.`);
}

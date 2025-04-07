// Reference taken from:
// https://student.cs.uwaterloo.ca/~isg/res/mips/opcodes

import { FunctionCode } from './funct';
import {
  type KnownInstructionOpcode,
  ImmediateInstructionOpcode,
  JumpInstructionOpcode,
  RegisterInstructionOpcode,
} from './op';
import { Register } from './reg';

/**
 * Represents a base for all MIPS instructions.
 */
export type InstructionBase<TOpCode extends number = KnownInstructionOpcode> = {
  /**
   * A 6 bit number representing the instruction's opcode.
   */
  op: TOpCode;
};

/**
 * Represents an instruction encoded as a register instruction.
 */
export type RegisterInstruction = InstructionBase<RegisterInstructionOpcode> & {
  /**
   * A 5 bit number representing the instruction's first source register.
   */
  rs: Register;

  /**
   * A 5 bit number representing the instruction's second source register.
   */
  rt: Register;

  /**
   * A 5 bit number representing the instruction's destination register.
   */
  rd: Register;

  /**
   * A 5 bit number representing the instruction's shift amount.
   */
  shamt: number;

  /**
   * A 6 bit number representing the instruction's function code.
   */
  funct: FunctionCode;
};

/**
 * Represents an instruction that uses the immediate encoding.
 */
export type ImmediateInstruction =
  InstructionBase<ImmediateInstructionOpcode> & {
    /**
     * A 5 bit number representing the instruction's first register.
     */
    rs: Register;

    /**
     * A 5 bit number representing the instruction's second register.
     */
    rt: Register;

    /**
     * A 16 bit number representing the instruction's immediate data.
     */
    imm: number;
  };

/**
 * Represents an instruction that uses the jump encoding.
 */
export type JumpInstruction = InstructionBase<JumpInstructionOpcode> & {
  /**
   * A 26 bit number representing the instruction's immediate offset.
   */
  imm: number;
};

/**
 * Strongly typed representation of a MIPS instruction.
 */
export type DecodedInstruction =
  | RegisterInstruction
  | ImmediateInstruction
  | JumpInstruction;

/**
 * Checks whether the provided instruction is an R-type.
 *
 * @param instruction The instruction to check.
 * @returns `true` if the instruction is an R-type, `false` otherwise.
 */
export function isReg(
  instruction: DecodedInstruction
): instruction is RegisterInstruction {
  return instruction.op === RegisterInstructionOpcode.REG;
}

/**
 * Checks whether the provided instruction is an I-type.
 *
 * @param instruction The instruction to check.
 * @returns `true` if the instruction is an I-type, `false` otherwise.
 */
export function isImm(
  instruction: DecodedInstruction
): instruction is ImmediateInstruction {
  return instruction.op in ImmediateInstructionOpcode;
}

/**
 * Checks whether the provided instruction is a J-type.
 *
 * @param instruction The instruction to check.
 * @returns `true` if the instruction is a J-type, `false` otherwise.
 */
export function isJump(
  instruction: DecodedInstruction
): instruction is JumpInstruction {
  return instruction.op in JumpInstructionOpcode;
}

/**
 * Represents the opcode used by all MIPS register instructions.
 */
export enum RegisterInstructionOpcode {
  REG = 0,
}

/**
 * Represents the valid opcodes for MIPS jump instructions.
 */
export enum JumpInstructionOpcode {
  j = 2,
  jal = 3,
}

/**
 * Represents the valid opcodes for MIPS immediate arithmetic instructions.
 * These follow the format `op rt, rs, imm`
 */
export enum ImmediateArithmeticOpcode {
  addi = 8,
  addiu = 9,
  andi = 12,
  ori = 13,
  xori = 14,

  slti = 10,
  sltiu = 11,
}

/**
 * Represents the valid opcodes for MIPS immediate load instructions.
 * These follow the format `op rt, imm`
 */
export enum ImmediateLoadOpcode {
  llo = 24,
  lhi = 25,
}

/**
 * Represents the valid opcodes for MIPS immediate branch instructions.
 * These follow the format `op rs, rt, label`
 */
export enum ImmediateBranchOpcode {
  beq = 4,
  bne = 5,
}

/**
 * Represents the valid opcodes for MIPS immediate branch with zero instructions.
 * These follow the format `op rs, label`
 */
export enum ImmediateBranchZOpcode {
  blez = 6,
  bgtz = 7,
}

/**
 * Represents the valid opcodes for MIPS immediate trap instructions.
 * These follow the format `op rs, imm`
 */
export enum ImmediateTrapOpcode {
  teqi = 1,
  tnei = 1,
  tgei = 1,
  tgeiu = 1,
  tlti = 1,
  tltiu = 1,
}

/**
 * Represents the valid opcodes for MIPS immediate load/store instructions.
 * These follow the format `op rt, imm(rs)`
 */
export enum ImmediateLoadStoreOpcode {
  lb = 32,
  lh = 33,
  lw = 35,
  lbu = 36,
  lhu = 37,

  sb = 40,
  sh = 41,
  sw = 43,
}

/**
 * Represents the valid opcodes for MIPS immediate instructions.
 */
export const ImmediateInstructionOpcode = {
  ...ImmediateArithmeticOpcode,
  ...ImmediateLoadOpcode,
  ...ImmediateBranchOpcode,
  ...ImmediateBranchZOpcode,
  ...ImmediateLoadStoreOpcode,
  ...ImmediateTrapOpcode,
};

export type ImmediateInstructionOpcode =
  | ImmediateArithmeticOpcode
  | ImmediateLoadOpcode
  | ImmediateBranchOpcode
  | ImmediateBranchZOpcode
  | ImmediateLoadStoreOpcode
  | ImmediateTrapOpcode;

/**
 * Represents all valid MIPS instruction opcodes.
 */
export const KnownInstructionOpcode = {
  ...RegisterInstructionOpcode,
  ...ImmediateInstructionOpcode,
  ...JumpInstructionOpcode,
};

export type KnownInstructionOpcode =
  | RegisterInstructionOpcode
  | ImmediateInstructionOpcode
  | JumpInstructionOpcode;

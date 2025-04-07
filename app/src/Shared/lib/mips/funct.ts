/**
 * Represents the valid function codes for MIPS arithmetic register instructions.
 * These follow the format `funct rd, rs, rt`
 */
export enum ArithmeticFunctionCode {
  add = 32,
  addu = 33,
  sub = 34,
  subu = 35,
  and = 36,
  or = 37,
  xor = 38,
  nor = 39,
  slt = 42,
  sltu = 43,
}

/**
 * Represents the valid function codes for MIPS multiplication/division register instructions.
 * These follow the format `funct rs, rt`
 */
export enum MultiplicationFunctionCode {
  mult = 24,
  multu = 25,
  div = 26,
  divu = 27,
}

/**
 * Represents the valid function codes for MIPS shift register instructions.
 * These follow the format `funct rd, rt, a`
 */
export enum ShiftFunctionCode {
  sll = 0,
  srl = 2,
  sra = 3,
}

/**
 * Represents the valid function codes for MIPS shift register instructions.
 * These follow the format `funct rd, rt, rs`
 */
export enum ShiftVFunctionCode {
  sllv = 4,
  srlv = 6,
  srav = 7,
}

/**
 * Represents the valid function codes for MIPS jump register instructions.
 * These follow the format `funct rs`
 */
export enum JumpFunctionCode {
  jr = 8,
  jalr = 9,
}

/**
 * Represents the valid function codes for MIPS move from register instructions.
 * These follow the format `funct rd`
 */
export enum MoveFromFunctionCode {
  mfhi = 16,
  mflo = 18,
}

/**
 * Represents the valid function codes for MIPS move to register instructions.
 * These follow the format `funct rs`
 */
export enum MoveToFunctionCode {
  mthi = 17,
  mtlo = 19,
}

/**
 * Represents the valid function codes for MIPS trap register instructions.
 * These follow the format `funct rs, rt`
 */
export enum TrapFunctionCode {
  teq = 52,
  tne = 54,
  tge = 48,
  tgeu = 49,
  tlt = 50,
  tltu = 51,
}

/**
 * Represents the valid function codes for MIPS register instructions.
 */
export const FunctionCode = {
  ...ArithmeticFunctionCode,
  ...MultiplicationFunctionCode,
  ...ShiftFunctionCode,
  ...ShiftVFunctionCode,
  ...JumpFunctionCode,
  ...MoveFromFunctionCode,
  ...MoveToFunctionCode,
  ...TrapFunctionCode,
};

export type FunctionCode =
  | ArithmeticFunctionCode
  | MultiplicationFunctionCode
  | ShiftFunctionCode
  | ShiftVFunctionCode
  | JumpFunctionCode
  | MoveFromFunctionCode
  | MoveToFunctionCode
  | TrapFunctionCode;

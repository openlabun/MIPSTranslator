import { inEnum } from '../util/enum';
import {
  getRequiredArguments,
  immediateTrapToRt,
  InstructionType,
  ValidArgument,
} from './args';
import { decodeInstruction } from './encoding';
import { FunctionCode } from './funct';
import {
  DecodedInstruction,
  ImmediateInstruction,
  JumpInstruction,
  RegisterInstruction,
} from './instruction';
import {
  ImmediateInstructionOpcode,
  ImmediateLoadStoreOpcode,
  ImmediateTrapOpcode,
  JumpInstructionOpcode,
  RegisterInstructionOpcode,
} from './op';
import { Register } from './reg';

type ValidOp<TType extends InstructionType> = TType extends 'reg'
  ? FunctionCode
  : TType extends 'imm'
  ? ImmediateInstructionOpcode
  : JumpInstructionOpcode;

function tryParseRegister(val: string) {
  let radix = 10;
  if (val.startsWith('0x')) {
    val = val.slice(2);
    radix = 16;
  } else if (val.startsWith('$')) {
    val = val.slice(1);
  }

  if (inEnum(val, Register)) {
    return Register[val];
  }

  if (
    (radix === 10 && /^[0-9]{1,2}$/.test(val)) ||
    (radix === 16 && /^[0-9A-F]{1,2}$/.test(val))
  ) {
    return parseInt(val, radix);
  }

  return undefined;
}

function getSkipped(type: InstructionType, keys: string[]) {
  if (type === 'reg') {
    return ['rd', 'rs', 'rt', 'shamt'].filter((k) => !keys.includes(k));
  }

  if (type === 'imm') {
    return ['rs', 'rt', 'imm'].filter((k) => !keys.includes(k));
  }

  return ['imm'].filter((k) => !keys.includes(k));
}

function makeInstImpl<TType extends InstructionType>(
  type: TType,
  op: ValidOp<TType>,
  input: string[],
  keys: ValidArgument<TType>[]
): Partial<DecodedInstruction> {
  let inst: Record<string, unknown>;

  if (type === 'reg') {
    inst = {
      op: RegisterInstructionOpcode.REG,
      funct: op,
    };
  } else {
    inst = {
      op,
    };
  }

  for (const key of getSkipped(type, keys)) {
    inst[key] = 0;
  }

  for (const key of keys) {
    let val = input.shift();
    if (!val) {
      // Could just be empty string, so breaking would be wrong
      continue;
    }

    switch (key) {
      case 'rd':
      case 'rs':
      case 'rt':
        inst[key] = tryParseRegister(val);
        break;

      case 'imm':
      case 'shamt': {
        let radix = 10;
        if (val.startsWith('0x')) {
          val = val.slice(2);
          radix = 16;
        }

        inst[key] = parseInt(val, radix);
        break;
      }

      default:
        throw new Error(`The provided key was not valid: ${key}`);
    }
  }

  return inst;
}

function makeR(
  funct: Exclude<keyof typeof FunctionCode, number>,
  input: string[],
  keys: ValidArgument<'reg'>[]
): Partial<RegisterInstruction> {
  return makeInstImpl(
    'reg',
    FunctionCode[funct],
    input,
    keys
  ) as Partial<RegisterInstruction>;
}

function makeI(
  op: Exclude<keyof typeof ImmediateInstructionOpcode, number>,
  input: string[],
  keys: ValidArgument<'imm'>[]
): Partial<ImmediateInstruction> {
  return makeInstImpl(
    'imm',
    ImmediateInstructionOpcode[op],
    input,
    keys
  ) as Partial<ImmediateInstruction>;
}

function makeLS(
  op: Exclude<keyof typeof ImmediateLoadStoreOpcode, number>,
  input: string[]
): Partial<ImmediateInstruction> {
  // Handle imm(rs) and imm (rs)
  const second = input.at(2);

  if (second?.includes('(') && second?.endsWith(')')) {
    const [imm, rs] = second.split('(');
    input = [...input.slice(0, 2), imm, rs.slice(0, -1)];
  } else {
    let rsIn = input.at(3);
    if (rsIn) {
      if (rsIn.startsWith('(') && rsIn.endsWith(')')) {
        rsIn = rsIn.slice(1, -1);
      }

      input = [...input.slice(0, 3), rsIn];
    }
  }

  return makeInstImpl('imm', ImmediateLoadStoreOpcode[op], input, [
    'rt',
    'imm',
    'rs',
  ]) as Partial<ImmediateInstruction>;
}

function makeJ(
  op: Exclude<keyof typeof JumpInstructionOpcode, number>,
  input: string[],
  keys: ValidArgument<'jump'>[]
): Partial<JumpInstruction> {
  return makeInstImpl(
    'jump',
    JumpInstructionOpcode[op],
    input,
    keys
  ) as Partial<JumpInstruction>;
}

/**
 * Parses the provided input into a partial decoded instruction.
 *
 * @param input The input to parse.
 * @returns The decoded instruction. It may be missing certain fields.
 */
export function parsePartialInstruction(
  input: string
): Partial<DecodedInstruction> {
  if (input.startsWith('0x')) {
    input = input.slice(2);
  }

  // If we receive hex input, parse it directly
  if (/^[0-9A-F]{1,8}$/.test(input)) {
    try {
      return decodeInstruction(parseInt(input, 16));
    } catch {
      return {};
    }
  }

  // Otherwise, split and parse the input
  const [first, ...rest] = input.split(/\s*,\s*|\s+/);
  if (!first) {
    return {};
  }

  // Load/store has some special semantics
  if (inEnum(first, ImmediateLoadStoreOpcode)) {
    return makeLS(first, rest);
  }

  // jalr may be called with one or two registers:
  // https://stackoverflow.com/questions/23225990/what-is-the-proper-behavior-of-jalr-a0-a0
  if (first === 'jalr') {
    const inst = makeR(first, rest, ['rd', 'rs']);
    if (inst.rd && !inst.rs) {
      return { ...inst, rs: inst.rd, rd: Register.ra };
    }

    return inst;
  }

  // Immediate traps require special rt values:
  // https://www.math.unipd.it/~sperduti/ARCHITETTURE-1/mips32.pdf
  if (inEnum(first, ImmediateTrapOpcode)) {
    const inst = makeI(first, rest, ['rs', 'imm']);
    return { ...inst, rt: immediateTrapToRt(first) };
  }

  const args = getRequiredArguments(first);
  if (!args) {
    return {};
  }

  if (args.type === 'reg') {
    return makeR(
      first as Exclude<keyof typeof FunctionCode, number>,
      rest,
      args.arguments
    );
  }

  if (args.type === 'imm') {
    return makeI(
      first as Exclude<keyof typeof ImmediateInstructionOpcode, number>,
      rest,
      args.arguments
    );
  }

  return makeJ(
    first as Exclude<keyof typeof JumpInstructionOpcode, number>,
    rest,
    args.arguments
  );
}

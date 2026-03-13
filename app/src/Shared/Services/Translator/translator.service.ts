import { Injectable } from '@angular/core';
import instructionsDataLegacy from '../../../data/mips-instructions.json';
import instructionsDataR6 from '../../../data/mips-r6-instructions.json';

export type MipsVersion = 'legacy' | 'r6';

export interface Instruction {
  mnemonic: string;
  type: 'R' | 'I' | 'J';
  version: string;
  opcode: string;
  funct?: string;
  shamt?: string;
  description: string;
  example?: string;
  args: string[];
  template?: string;
  rt?: string;
}

export const registerMap: { [key: string]: string } = {
  '00000': 'zero',
  '00001': 'at',
  '00010': 'v0',
  '00011': 'v1',
  '00100': 'a0',
  '00101': 'a1',
  '00110': 'a2',
  '00111': 'a3',
  '01000': 't0',
  '01001': 't1',
  '01010': 't2',
  '01011': 't3',
  '01100': 't4',
  '01101': 't5',
  '01110': 't6',
  '01111': 't7',
  '10000': 's0',
  '10001': 's1',
  '10010': 's2',
  '10011': 's3',
  '10100': 's4',
  '10101': 's5',
  '10110': 's6',
  '10111': 's7',
  '11000': 't8',
  '11001': 't9',
  '11010': 'k0',
  '11011': 'k1',
  '11100': 'gp',
  '11101': 'sp',
  '11110': 'fp',
  '11111': 'ra',
};

@Injectable({
  providedIn: 'root',
})
export class TranslatorService {
  // Versión actual (por defecto R6)
  private currentVersion: MipsVersion = 'r6';

  registerMap = registerMap;

  // Instrucciones para cada versión
  private instructionsLegacy: Instruction[] =
    instructionsDataLegacy as Instruction[];
  private instructionsR6: Instruction[] = instructionsDataR6 as Instruction[];

  // Mapa de instrucciones actual
  public instructionMap: { [key: string]: Instruction } = {};

  constructor() {
    this.loadInstructions(this.currentVersion);
  }

  /**
   * Cambia la versión de MIPS
   */
  setVersion(version: MipsVersion): void {
    this.currentVersion = version;
    this.loadInstructions(version);
  }

  /**
   * Obtiene la versión actual
   */
  getVersion(): MipsVersion {
    return this.currentVersion;
  }

  /**
   * Carga las instrucciones según la versión
   */
  private loadInstructions(version: MipsVersion): void {
    this.instructionMap = {};
    const instructions =
      version === 'r6' ? this.instructionsR6 : this.instructionsLegacy;

    instructions.forEach((instr) => {
      this.instructionMap[instr.mnemonic] = instr;
    });
  }

  /**
   * Obtiene todas las instrucciones de la versión actual
   */
  getInstructions(): Instruction[] {
    return this.currentVersion === 'r6'
      ? this.instructionsR6
      : this.instructionsLegacy;
  }

  getOpcode(name: string): string {
    return this.instructionMap[name]?.opcode || 'unknown';
  }

  getFunctCode(name: string): string {
    return this.instructionMap[name]?.funct || 'unknown';
  }

  getShamt(name: string): string {
    return this.instructionMap[name]?.shamt || '00000';
  }

  convertFunctToName(functBinary: string, shamtBinary?: string): string {
    // Para R6, algunas instrucciones necesitan shamt para diferenciarse
    const name = Object.keys(this.instructionMap).find((key) => {
      const instr = this.instructionMap[key];
      if (instr.funct === functBinary) {
        if (instr.shamt && shamtBinary) {
          return instr.shamt === shamtBinary;
        }
        return !instr.shamt || shamtBinary === '00000';
      }
      return false;
    });
    return name || 'unknown';
  }

  convertOpcodeToName(opcodeBinary: string): string {
    const name = Object.keys(this.instructionMap).find(
      (key) => this.instructionMap[key].opcode === opcodeBinary,
    );
    return name || 'unknown';
  }

  convertRegisterToBinary(registerName: string): string {
    const binary = Object.keys(registerMap).find(
      (key) => registerMap[key] === registerName,
    );
    return binary || 'unknown';
  }

  convertRegisterToName(registerBinary: string): string {
    return registerMap[registerBinary]
      ? `$${registerMap[registerBinary]}`
      : 'unknown';
  }

  translateInstructionToHex(instruction: string): string {
    instruction = instruction.trim();
    if (!instruction) return 'Empty instruction';

    instruction = instruction.replace(/\$/g, '').toLowerCase();
    const parts = instruction.split(/\s+/).filter((p) => p);

    if (parts.length === 0) return 'Empty instruction';

    const mnemonic = parts[0];

    if (!this.instructionMap[mnemonic]) {
      return `Unknown instruction: "${mnemonic}" (version: ${this.currentVersion})`;
    }

    const opcode = this.getOpcode(mnemonic);
    if (opcode === 'unknown') return `Unknown Opcode for "${mnemonic}"`;

    let binaryInstruction = opcode;

    // ========== R-TYPE: ADD, SUB, AND, OR, XOR, NOR, SLT, etc. ==========
    if (
      [
        'add',
        'addu',
        'sub',
        'subu',
        'and',
        'or',
        'nor',
        'xor',
        'slt',
        'sltu',
        'sllv',
        'srlv',
        'srav',
      ].includes(mnemonic)
    ) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rd = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const rt = this.convertRegisterToBinary(parts[3]);

      if (!rd || rd === 'unknown') return `Invalid register rd: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[3]}`;

      binaryInstruction += rs + rt + rd + '00000' + this.getFunctCode(mnemonic);

      // ========== R6: MUL, MUH, MULU, MUHU, DIV, MOD, DIVU, MODU ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['mul', 'muh', 'mulu', 'muhu', 'div', 'mod', 'divu', 'modu'].includes(
        mnemonic,
      )
    ) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rd = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const rt = this.convertRegisterToBinary(parts[3]);

      if (!rd || rd === 'unknown') return `Invalid register rd: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[3]}`;

      const shamt = this.getShamt(mnemonic);
      binaryInstruction += rs + rt + rd + shamt + this.getFunctCode(mnemonic);

      // ========== LEGACY: MULT, MULTU, DIV, DIVU ==========
    } else if (
      this.currentVersion === 'legacy' &&
      ['mult', 'multu', 'div', 'divu'].includes(mnemonic)
    ) {
      if (parts.length < 3) return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(parts[1]);
      const rt = this.convertRegisterToBinary(parts[2]);

      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[1]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[2]}`;

      binaryInstruction +=
        rs + rt + '00000' + '00000' + this.getFunctCode(mnemonic);

      // ========== LEGACY: MFHI, MFLO ==========
    } else if (
      this.currentVersion === 'legacy' &&
      ['mfhi', 'mflo'].includes(mnemonic)
    ) {
      if (parts.length < 2) return `Insufficient arguments for ${mnemonic}`;

      const rd = this.convertRegisterToBinary(parts[1]);
      if (!rd || rd === 'unknown') return `Invalid register rd: ${parts[1]}`;

      binaryInstruction +=
        '00000' + '00000' + rd + '00000' + this.getFunctCode(mnemonic);

      // ========== LEGACY: MTHI, MTLO ==========
    } else if (
      this.currentVersion === 'legacy' &&
      ['mthi', 'mtlo'].includes(mnemonic)
    ) {
      if (parts.length < 2) return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(parts[1]);
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[1]}`;

      binaryInstruction +=
        rs + '00000' + '00000' + '00000' + this.getFunctCode(mnemonic);

      // ========== R6: SELEQZ, SELNEZ ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['seleqz', 'selnez'].includes(mnemonic)
    ) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rd = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const rt = this.convertRegisterToBinary(parts[3]);

      if (!rd || rd === 'unknown') return `Invalid register rd: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[3]}`;

      binaryInstruction += rs + rt + rd + '00000' + this.getFunctCode(mnemonic);

      // ========== R6: LSA ==========
    } else if (this.currentVersion === 'r6' && mnemonic === 'lsa') {
      if (parts.length < 5) return `Insufficient arguments for ${mnemonic}`;

      const rd = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const rt = this.convertRegisterToBinary(parts[3]);
      const sa = parseInt(parts[4]);

      if (!rd || rd === 'unknown') return `Invalid register rd: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[3]}`;
      if (isNaN(sa) || sa < 1 || sa > 4)
        return `Invalid sa (must be 1-4): ${parts[4]}`;

      const saBin = (sa - 1).toString(2).padStart(2, '0');
      binaryInstruction +=
        rs + rt + rd + saBin + '000' + this.getFunctCode(mnemonic);

      // ========== LOADS/STORES ==========
    } else if (
      ['lw', 'sw', 'lb', 'lbu', 'lh', 'lhu', 'sb', 'sh'].includes(mnemonic)
    ) {
      if (parts.length < 3) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);

      let offset: number;
      let rs: string;

      if (parts[2].includes('(') && parts[2].includes(')')) {
        const match = parts[2].match(/^(-?\d+|0x[0-9a-fA-F]+)\(([^)]+)\)$/);
        if (!match) return `Invalid memory address format: ${parts[2]}`;

        const offsetStr = match[1];
        const rsName = match[2];

        if (offsetStr.startsWith('0x') || offsetStr.startsWith('0X')) {
          offset = parseInt(offsetStr, 16);
        } else {
          offset = parseInt(offsetStr, 10);
        }

        rs = this.convertRegisterToBinary(rsName);
      } else if (parts.length >= 4) {
        const offsetStr = parts[2];

        if (offsetStr.startsWith('0x') || offsetStr.startsWith('0X')) {
          offset = parseInt(offsetStr, 16);
        } else {
          offset = parseInt(offsetStr, 10);
        }

        rs = this.convertRegisterToBinary(parts[3].replace(/[()]/g, ''));
      } else {
        return `Invalid syntax for ${mnemonic}`;
      }

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs`;
      if (isNaN(offset)) return `Invalid offset`;

      binaryInstruction +=
        rs + rt + (offset >>> 0).toString(2).padStart(16, '0');

      // ========== I-TYPE: ADDIU, ANDI, ORI, XORI ==========
    } else if (['addiu', 'andi', 'ori', 'xori'].includes(mnemonic)) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const immediate = parseInt(parts[3]);

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (isNaN(immediate)) return `Invalid immediate: ${parts[3]}`;

      binaryInstruction +=
        rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');

      // ========== LEGACY: ADDI ==========
    } else if (this.currentVersion === 'legacy' && mnemonic === 'addi') {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const immediate = parseInt(parts[3]);

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (isNaN(immediate)) return `Invalid immediate: ${parts[3]}`;

      binaryInstruction +=
        rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');

      // ========== R6: AUI ==========
    } else if (this.currentVersion === 'r6' && mnemonic === 'aui') {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const immediate = parseInt(parts[3]);

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (isNaN(immediate)) return `Invalid immediate: ${parts[3]}`;

      binaryInstruction +=
        rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');

      // ========== SLL, SRL, SRA ==========
    } else if (['sll', 'srl', 'sra'].includes(mnemonic)) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rd = this.convertRegisterToBinary(parts[1]);
      const rt = this.convertRegisterToBinary(parts[2]);
      const shamt = parseInt(parts[3]);

      if (!rd || rd === 'unknown') return `Invalid register rd: ${parts[1]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[2]}`;
      if (isNaN(shamt)) return `Invalid shamt: ${parts[3]}`;

      const shamtBin = shamt.toString(2).padStart(5, '0');
      binaryInstruction +=
        '00000' + rt + rd + shamtBin + this.getFunctCode(mnemonic);

      // ========== BRANCHES: BEQ, BNE, BGTZ, BLEZ ==========
    } else if (['beq', 'bne', 'bgtz', 'blez'].includes(mnemonic)) {
      const minArgs = ['bgtz', 'blez'].includes(mnemonic) ? 3 : 4;
      if (parts.length < minArgs)
        return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(parts[1]);
      const rt = ['beq', 'bne'].includes(mnemonic)
        ? this.convertRegisterToBinary(parts[2])
        : '00000';
      const label = parts[parts.length - 1];

      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[1]}`;
      if (['beq', 'bne'].includes(mnemonic) && (!rt || rt === 'unknown')) {
        return `Invalid register rt: ${parts[2]}`;
      }

      const offset = parseInt(label);
      if (isNaN(offset)) return `Invalid offset: ${label}`;

      const offsetBinary = (offset >>> 0).toString(2).padStart(16, '0');
      binaryInstruction += rs + rt + offsetBinary;

      // ========== J, JAL ==========
    } else if (['j', 'jal'].includes(mnemonic)) {
      if (parts.length < 2) return `Insufficient arguments for ${mnemonic}`;

      const address = parseInt(parts[1]);
      if (isNaN(address)) return `Invalid address: ${parts[1]}`;

      binaryInstruction += (address >>> 0).toString(2).padStart(26, '0');

      // ========== LEGACY: JR ==========
    } else if (this.currentVersion === 'legacy' && mnemonic === 'jr') {
      if (parts.length < 2) return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(parts[1]);
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[1]}`;

      binaryInstruction +=
        rs + '00000' + '00000' + '00000' + this.getFunctCode(mnemonic);

      // ========== JALR ==========
    } else if (mnemonic === 'jalr') {
      if (parts.length < 2) return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(
        parts.length === 2 ? parts[1] : parts[2],
      );
      const rd =
        parts.length === 3 ? this.convertRegisterToBinary(parts[1]) : '11111';

      if (!rs || rs === 'unknown') return `Invalid register rs`;
      if (!rd || rd === 'unknown') return `Invalid register rd`;

      binaryInstruction +=
        rs + '00000' + rd + '00000' + this.getFunctCode(mnemonic);

      // ========== LEGACY: TEQ, TGE, TGEU, TLT, TLTU, TNE ==========
    } else if (
      this.currentVersion === 'legacy' &&
      ['teq', 'tge', 'tgeu', 'tlt', 'tltu', 'tne'].includes(mnemonic)
    ) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      let code = parseInt(parts[3]);

      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (isNaN(code) || code < 0 || code > 1023)
        return `Invalid code: ${parts[3]}`;

      const codeBinary = code.toString(2).padStart(10, '0');
      binaryInstruction += rs + rt + codeBinary + this.getFunctCode(mnemonic);

      // ========== SYSCALL, BREAK ==========
    } else if (['syscall', 'break'].includes(mnemonic)) {
      binaryInstruction =
        opcode + '00000000000000000000' + this.getFunctCode(mnemonic);

      // ========== BLTZ, BGEZ, BAL, NAL ==========
    } else if (['bltz', 'bgez', 'bal', 'nal'].includes(mnemonic)) {
      const needsRs = ['bltz', 'bgez'].includes(mnemonic);
      if (needsRs && parts.length < 3)
        return `Insufficient arguments for ${mnemonic}`;
      if (!needsRs && mnemonic === 'bal' && parts.length < 2)
        return `Insufficient arguments for ${mnemonic}`;

      const rs = needsRs ? this.convertRegisterToBinary(parts[1]) : '00000';
      const offset = needsRs
        ? parseInt(parts[2])
        : mnemonic === 'bal'
          ? parseInt(parts[1])
          : 0;

      if (needsRs && (!rs || rs === 'unknown'))
        return `Invalid register rs: ${parts[1]}`;
      if (isNaN(offset)) return `Invalid offset`;

      const rtField = this.instructionMap[mnemonic].rt;
      if (!rtField) return `Missing rt field for ${mnemonic}`;

      binaryInstruction +=
        rs + rtField + (offset >>> 0).toString(2).padStart(16, '0');

      // ========== SLTI, SLTIU ==========
    } else if (['slti', 'sltiu'].includes(mnemonic)) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const rs = this.convertRegisterToBinary(parts[2]);
      const immediate = parseInt(parts[3]);

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[2]}`;
      if (isNaN(immediate)) return `Invalid immediate: ${parts[3]}`;

      binaryInstruction +=
        rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');

      // ========== LUI ==========
    } else if (mnemonic === 'lui') {
      if (parts.length < 3) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const immediate = parseInt(parts[2]);

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (isNaN(immediate)) return `Invalid immediate: ${parts[2]}`;

      binaryInstruction +=
        '00000' + rt + (immediate >>> 0).toString(2).padStart(16, '0');

      // ========== LEGACY: TGEI, TGEIU, TLTI, TLTIU, TEQI, TNEI ==========
    } else if (
      this.currentVersion === 'legacy' &&
      ['tgei', 'tgeiu', 'tlti', 'tltiu', 'teqi', 'tnei'].includes(mnemonic)
    ) {
      if (parts.length < 3) return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(parts[1]);
      const immediate = parseInt(parts[2]);

      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[1]}`;
      if (isNaN(immediate)) return `Invalid immediate: ${parts[2]}`;

      const immediateBinary = (immediate >>> 0).toString(2).padStart(16, '0');
      const rtField = this.getOpcode(mnemonic);
      binaryInstruction += rs + rtField + immediateBinary;

      // ========== R6 COMPACT BRANCHES: BC, BALC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['bc', 'balc'].includes(mnemonic)
    ) {
      if (parts.length < 2) return `Insufficient arguments for ${mnemonic}`;

      const offset = parseInt(parts[1]);
      if (isNaN(offset)) return `Invalid offset: ${parts[1]}`;

      binaryInstruction += (offset >>> 0).toString(2).padStart(26, '0');

      // ========== R6 COMPACT BRANCHES: BEQZC, BNEZC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['beqzc', 'bnezc'].includes(mnemonic)
    ) {
      if (parts.length < 3) return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(parts[1]);
      const offset = parseInt(parts[2]);

      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[1]}`;
      if (isNaN(offset)) return `Invalid offset: ${parts[2]}`;

      // 21-bit offset
      binaryInstruction += rs + (offset >>> 0).toString(2).padStart(21, '0');

      // ========== R6 COMPACT BRANCHES: BEQC, BNEC, BLTC, BGEC, BLTUC, BGEUC ==========
    } else if (
      this.currentVersion === 'r6' &&
      [
        'beqc',
        'bnec',
        'bltc',
        'bgec',
        'bltuc',
        'bgeuc',
        'bovc',
        'bnvc',
      ].includes(mnemonic)
    ) {
      if (parts.length < 4) return `Insufficient arguments for ${mnemonic}`;

      const rs = this.convertRegisterToBinary(parts[1]);
      const rt = this.convertRegisterToBinary(parts[2]);
      const offset = parseInt(parts[3]);

      if (!rs || rs === 'unknown') return `Invalid register rs: ${parts[1]}`;
      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[2]}`;
      if (isNaN(offset)) return `Invalid offset: ${parts[3]}`;

      binaryInstruction +=
        rs + rt + (offset >>> 0).toString(2).padStart(16, '0');

      // ========== R6 COMPACT BRANCHES: BLTZC, BGEZC, BGTZC, BLEZC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['bltzc', 'bgezc', 'bgtzc', 'blezc'].includes(mnemonic)
    ) {
      if (parts.length < 3) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const offset = parseInt(parts[2]);

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (isNaN(offset)) return `Invalid offset: ${parts[2]}`;

      // Para estas instrucciones compactas, rt va en el campo rs
      binaryInstruction +=
        rt + rt + (offset >>> 0).toString(2).padStart(16, '0');

      // ========== R6: JIC, JIALC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['jic', 'jialc'].includes(mnemonic)
    ) {
      if (parts.length < 3) return `Insufficient arguments for ${mnemonic}`;

      const rt = this.convertRegisterToBinary(parts[1]);
      const offset = parseInt(parts[2]);

      if (!rt || rt === 'unknown') return `Invalid register rt: ${parts[1]}`;
      if (isNaN(offset)) return `Invalid offset: ${parts[2]}`;

      binaryInstruction += rt + (offset >>> 0).toString(2).padStart(21, '0');

      // ========== INSTRUCCIÓN NO SOPORTADA ==========
    } else {
      return `Unsupported instruction: ${mnemonic} (version: ${this.currentVersion})`;
    }

    // Convertir binario a hexadecimal
    const hexInstruction = parseInt(binaryInstruction, 2)
      .toString(16)
      .toUpperCase()
      .padStart(8, '0');
    return hexInstruction;
  }

  translateInstructionToMIPS(hexInstruction: string): string {
    if (hexInstruction.startsWith('0x')) {
      hexInstruction = hexInstruction.substring(2);
    }

    const binaryInstruction = this.hexToBinary(hexInstruction);
    const opcode = binaryInstruction.slice(0, 6);
    const opcodeMIPS = this.convertOpcodeToName(opcode);

    if (!opcodeMIPS || opcodeMIPS === 'unknown') {
      return 'Unknown Instruction, opcode not found';
    }

    let mipsInstruction = opcodeMIPS + ' ';

    // ========== OPCODE 000001: BLTZ, BGEZ, BAL, NAL ==========
    if (opcode === '000001') {
      const rt = binaryInstruction.slice(11, 16);
      const offset = this.binaryToHex(binaryInstruction.slice(16, 32));
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));

      if (rt === '00000') {
        mipsInstruction = `bltz ${rs} ${offset}`;
      } else if (rt === '00001') {
        if (rs === '$zero') {
          mipsInstruction = `bal ${offset}`;
        } else {
          mipsInstruction = `bgez ${rs} ${offset}`;
        }
      } else {
        return `Unknown REGIMM instruction with rt=${rt}`;
      }

      // ========== OPCODE 000000: SPECIAL (R-Type) ==========
    } else if (opcode === '000000') {
      const func = binaryInstruction.slice(26, 32);
      const shamt = binaryInstruction.slice(21, 26);
      const funcMIPS = this.convertFunctToName(func, shamt);

      if (!funcMIPS || funcMIPS === 'unknown') {
        return 'Unknown R-Type instruction (function)';
      }

      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const rd = this.convertRegisterToName(binaryInstruction.slice(16, 21));

      // ADD, SUB, AND, OR, XOR, NOR, SLT, SLTU, ADDU, SUBU
      if (
        [
          'add',
          'addu',
          'sub',
          'subu',
          'and',
          'or',
          'xor',
          'nor',
          'slt',
          'sltu',
          'sllv',
          'srlv',
          'srav',
          'seleqz',
          'selnez',
        ].includes(funcMIPS)
      ) {
        mipsInstruction = `${funcMIPS} ${rd} ${rs} ${rt}`;

        // R6: MUL, MUH, MULU, MUHU, DIV, MOD, DIVU, MODU
      } else if (
        this.currentVersion === 'r6' &&
        ['mul', 'muh', 'mulu', 'muhu', 'div', 'mod', 'divu', 'modu'].includes(
          funcMIPS,
        )
      ) {
        mipsInstruction = `${funcMIPS} ${rd} ${rs} ${rt}`;

        // LEGACY: MULT, MULTU, DIV, DIVU
      } else if (
        this.currentVersion === 'legacy' &&
        ['mult', 'multu', 'div', 'divu'].includes(funcMIPS)
      ) {
        mipsInstruction = `${funcMIPS} ${rs} ${rt}`;

        // JR
      } else if (funcMIPS === 'jr') {
        mipsInstruction = `jr ${rs}`;

        // JALR
      } else if (funcMIPS === 'jalr') {
        if (rd === '$ra') {
          mipsInstruction = `jalr ${rs}`;
        } else {
          mipsInstruction = `jalr ${rd} ${rs}`;
        }

        // SLL, SRL, SRA
      } else if (['sll', 'srl', 'sra'].includes(funcMIPS)) {
        const shamtValue = this.binaryToHex(shamt);
        mipsInstruction = `${funcMIPS} ${rd} ${rt} ${shamtValue}`;

        // LSA (R6)
      } else if (this.currentVersion === 'r6' && funcMIPS === 'lsa') {
        const sa = parseInt(shamt.slice(0, 2), 2) + 1;
        mipsInstruction = `lsa ${rd} ${rs} ${rt} ${sa}`;

        // LEGACY: MFHI, MFLO
      } else if (
        this.currentVersion === 'legacy' &&
        ['mfhi', 'mflo'].includes(funcMIPS)
      ) {
        mipsInstruction = `${funcMIPS} ${rd}`;

        // LEGACY: MTHI, MTLO
      } else if (
        this.currentVersion === 'legacy' &&
        ['mthi', 'mtlo'].includes(funcMIPS)
      ) {
        mipsInstruction = `${funcMIPS} ${rs}`;

        // LEGACY: TEQ, TGE, TGEU, TLT, TLTU, TNE
      } else if (
        this.currentVersion === 'legacy' &&
        ['teq', 'tge', 'tgeu', 'tlt', 'tltu', 'tne'].includes(funcMIPS)
      ) {
        const code = this.binaryToHex(binaryInstruction.slice(16, 26));
        mipsInstruction = `${funcMIPS} ${rt} ${rs} ${code}`;

        // SYSCALL, BREAK
      } else if (['syscall', 'break'].includes(funcMIPS)) {
        mipsInstruction = funcMIPS;
      } else {
        return `Unsupported R-Type instruction: ${funcMIPS}`;
      }

      // ========== LEGACY: TGEI, TGEIU, TLTI, TLTIU, TEQI, TNEI ==========
    } else if (
      this.currentVersion === 'legacy' &&
      ['tgei', 'tgeiu', 'tlti', 'tltiu', 'teqi', 'tnei'].includes(opcodeMIPS)
    ) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = binaryInstruction.slice(11, 16);

      const rtMap: { [key: string]: string } = {
        '01000': 'tgei',
        '01001': 'tgeiu',
        '01010': 'tlti',
        '01011': 'tltiu',
        '01100': 'teqi',
        '01110': 'tnei',
      };

      const instructionName = rtMap[rt];
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));

      if (!instructionName || !rs || !immediate) return 'Invalid Syntax';
      mipsInstruction = `${instructionName} ${rs} ${immediate}`;

      // ========== LOADS/STORES: LW, SW, LB, LBU, LH, LHU, SB, SH ==========
    } else if (
      ['lw', 'sw', 'lb', 'lbu', 'lh', 'lhu', 'sb', 'sh'].includes(opcodeMIPS)
    ) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const offsetBinary = binaryInstruction.slice(16, 32);

      // Convertir a signed integer (complemento a 2)
      let offset = parseInt(offsetBinary, 2);
      if (offset >= 32768) {
        offset = offset - 65536;
      }

      if (!rt || !rs) return 'Invalid Syntax';
      mipsInstruction = `${opcodeMIPS} ${rt} ${offset}(${rs})`;

      // ========== I-TYPE: ADDI, ADDIU, ANDI, ORI, XORI ==========
    } else if (['addi', 'addiu', 'andi', 'ori', 'xori'].includes(opcodeMIPS)) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));

      if (!rt || !rs || !immediate) return 'Invalid Syntax';
      mipsInstruction = `${opcodeMIPS} ${rt} ${rs} ${immediate}`;

      // ========== R6: AUI ==========
    } else if (this.currentVersion === 'r6' && opcodeMIPS === 'aui') {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));

      if (rs === '$zero') {
        // LUI es un caso especial de AUI con rs=$zero
        mipsInstruction = `lui ${rt} ${immediate}`;
      } else {
        mipsInstruction = `aui ${rt} ${rs} ${immediate}`;
      }

      // ========== SLTI, SLTIU ==========
    } else if (['slti', 'sltiu'].includes(opcodeMIPS)) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));

      if (!rt || !rs || !immediate) return 'Invalid Syntax';
      mipsInstruction = `${opcodeMIPS} ${rt} ${rs} ${immediate}`;

      // ========== LUI (Legacy) ==========
    } else if (this.currentVersion === 'legacy' && opcodeMIPS === 'lui') {
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const immediate = this.binaryToHex(binaryInstruction.slice(16, 32));

      if (!rt || !immediate) return 'Invalid Syntax';
      mipsInstruction = `lui ${rt} ${immediate}`;

      // ========== BRANCHES: BEQ, BNE, BGTZ, BLEZ ==========
    } else if (['beq', 'bne', 'bgtz', 'blez'].includes(opcodeMIPS)) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = ['beq', 'bne'].includes(opcodeMIPS)
        ? this.convertRegisterToName(binaryInstruction.slice(11, 16))
        : '$zero';
      const offset = this.binaryToHex(binaryInstruction.slice(16, 32));

      if (!rs || !offset) return 'Invalid Registers or Syntax';

      if (opcodeMIPS === 'bgtz' || opcodeMIPS === 'blez') {
        mipsInstruction = `${opcodeMIPS} ${rs} ${offset}`;
      } else {
        mipsInstruction = `${opcodeMIPS} ${rs} ${rt} ${offset}`;
      }

      // ========== R6 COMPACT BRANCHES: BC, BALC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['bc', 'balc'].includes(opcodeMIPS)
    ) {
      const offset = this.binaryToHex(binaryInstruction.slice(6, 32));
      mipsInstruction = `${opcodeMIPS} ${offset}`;

      // ========== R6 COMPACT BRANCHES: BEQZC, BNEZC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['beqzc', 'bnezc'].includes(opcodeMIPS)
    ) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const offset = this.binaryToHex(binaryInstruction.slice(11, 32));

      mipsInstruction = `${opcodeMIPS} ${rs} ${offset}`;

      // ========== R6 COMPACT BRANCHES: BEQC, BNEC, etc ==========
    } else if (
      this.currentVersion === 'r6' &&
      [
        'beqc',
        'bnec',
        'bltc',
        'bgec',
        'bltuc',
        'bgeuc',
        'bovc',
        'bnvc',
      ].includes(opcodeMIPS)
    ) {
      const rs = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const offset = this.binaryToHex(binaryInstruction.slice(16, 32));

      mipsInstruction = `${opcodeMIPS} ${rs} ${rt} ${offset}`;

      // ========== R6 COMPACT BRANCHES: BLTZC, BGEZC, BGTZC, BLEZC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['bltzc', 'bgezc', 'bgtzc', 'blezc'].includes(opcodeMIPS)
    ) {
      const rt = this.convertRegisterToName(binaryInstruction.slice(11, 16));
      const offset = this.binaryToHex(binaryInstruction.slice(16, 32));

      mipsInstruction = `${opcodeMIPS} ${rt} ${offset}`;

      // ========== R6: JIC, JIALC ==========
    } else if (
      this.currentVersion === 'r6' &&
      ['jic', 'jialc'].includes(opcodeMIPS)
    ) {
      const rt = this.convertRegisterToName(binaryInstruction.slice(6, 11));
      const offset = this.binaryToHex(binaryInstruction.slice(11, 32));

      mipsInstruction = `${opcodeMIPS} ${rt} ${offset}`;

      // ========== J, JAL ==========
    } else if (['j', 'jal'].includes(opcodeMIPS)) {
      const address = this.binaryToHex(binaryInstruction.slice(6, 32));
      if (!address) return 'Invalid Syntax';
      mipsInstruction = `${opcodeMIPS} ${address}`;

      // ========== INSTRUCCIÓN NO SOPORTADA ==========
    } else {
      return `Unsupported instruction: ${opcodeMIPS} (version: ${this.currentVersion})`;
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
    const instructions: string[] = textInput
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '');

    const translatedInstructions: string[] = instructions.map((instruction) => {
      const trimmed = instruction.trim();
      if (!trimmed) return 'Empty instruction';
      return this.translateInstructionToMIPS(trimmed);
    });

    const formattedInstructions: string = translatedInstructions.join('\n');
    return formattedInstructions;
  }

  translateMIPStoHex(textInput: string): string {
    const instructions: string[] = textInput
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '');

    const translatedInstructions: string[] = instructions.map((instruction) => {
      const trimmed = instruction.trim();
      if (!trimmed) return 'Empty instruction';
      return this.translateInstructionToHex(trimmed);
    });

    const formattedInstructions: string = translatedInstructions.join('\n');
    return formattedInstructions;
  }

  isValidHex(text: string): boolean {
    return /^(0x)?[0-9A-Fa-f]{8}$/.test(text.trim());
  }

  isValidMIPS(text: string): boolean {
    const instructions: string[] = text.trim().split('\n');

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i].trim();
      if (!instruction) continue; // Skip empty lines

      const parts = instruction.replace(/\$/g, '').toLowerCase().split(/\s+/);
      const opcode = parts[0];

      if (!this.instructionMap[opcode]) {
        return false;
      }
    }

    return true;
  }
}

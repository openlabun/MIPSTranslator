import { Injectable, inject } from '@angular/core';
import { TranslatorService, instructionMap, registerMap } from '../Translator/translator.service';

export interface ParseResult {
  instructions: string[];
  errors: string[];
}

interface LabelInfo {
  name: string;
  address: number;
  lineNumber: number;
}

interface ParsedLine {
  originalLineNumber: number;
  label: string | null;
  mnemonic: string | null;
  rawOperands: string[];
  cleanedInstructionText: string;
}

interface ValidatedInstruction {
  originalLineNumber: number;
  address: number;
  mnemonic: string;
  validatedOperands: ValidatedOperand[];
}

type ValidatedOperand =
  | { type: 'register'; name: string }
  | { type: 'immediate'; value: number }
  | { type: 'label'; name: string }
  | { type: 'loadStore'; offset: number; baseRegister: string };

type OperandExpectation = 'register' | 'immediate16s' | 'immediate16u' | 'shamt5u' | 'label' | 'loadStore';

@Injectable({
  providedIn: 'root'
})
export class AssemblyParserService {
  private translator = inject(TranslatorService);
  private registerMapByName: Map<string, string>;
  private readonly BASE_ADDRESS = 0x00400000;

  constructor() {
    this.registerMapByName = new Map();
    for (const numBin in registerMap) {
      this.registerMapByName.set(registerMap[numBin], numBin);
    }
  }

parseAssembly(assemblyCode: string): ParseResult {
  const errors: string[] = [];
  const labelMap = new Map<string, LabelInfo>();
  const parsedLines: ParsedLine[] = [];
  let instructionCounter = 0;

  if (!assemblyCode || assemblyCode.trim() === '') {
    errors.push('No se proporcionó código ensamblador.');
    return { instructions: [], errors };
  }

  const rawLines = assemblyCode.split('\n');

  rawLines.forEach((line, index) => {
    const lineNumber = index + 1;
    const commentMatch = line.indexOf('#');
    const lineWithoutComment = commentMatch === -1 ? line : line.substring(0, commentMatch);
    const trimmedLine = lineWithoutComment.trim();

    if (trimmedLine.length === 0) return;

    if (trimmedLine.startsWith('.')) {
        console.log(`Línea ${lineNumber}: Ignorando directiva de ensamblador '${trimmedLine}'`);
        return;
    }

    let label: string | null = null;
    let instructionText = trimmedLine;

    const labelRegex = /^([a-zA-Z_][a-zA-Z0-9_]*):(.*)/;
    const match = trimmedLine.match(labelRegex);

    if (match) {
      label = match[1];
      instructionText = match[2].trim();

      if (!/^[a-zA-Z_]/.test(label)) {
        errors.push(`Línea ${lineNumber}: Nombre de etiqueta inválido '${label}'.`);
      } else {
        const lowerLabel = label.toLowerCase();
        if (labelMap.has(lowerLabel)) {
          errors.push(`Línea ${lineNumber}: Etiqueta duplicada '${label}'.`);
        } else {
          labelMap.set(lowerLabel, {
            name: label,
            address: this.BASE_ADDRESS + instructionCounter * 4,
            lineNumber: lineNumber
          });
           console.log(`Etiqueta '${label}' mapeada a índice ${instructionCounter}`);
        }
      }
    }

    if (instructionText.length > 0) {
      const parts = instructionText.split(/\s+/);
      const mnemonic = parts[0].toLowerCase();
      const rawOperands = instructionText.substring(parts[0].length)
                                    .split(',')
                                    .map(op => op.trim())
                                    .filter(op => op.length > 0);

      parsedLines.push({
        originalLineNumber: lineNumber,
        label: label,
        mnemonic: mnemonic,
        rawOperands: rawOperands,
        cleanedInstructionText: instructionText,
      });
      instructionCounter++;
    }
  });

  console.log("Mapa de Etiquetas (Nombre -> Índice):", labelMap);
  if (errors.length > 0) return { instructions: [], errors };

  const validatedInstructions: ValidatedInstruction[] = [];
  const pass2Errors: string[] = [];

  parsedLines.forEach((line, index) => {
    if (!line.mnemonic) return;
    const instructionAddress = this.BASE_ADDRESS + index * 4;

    const { validatedOps, validationErrors } = this._validateInstructionAndOperands(
        line.mnemonic,
        line.rawOperands,
        line.originalLineNumber
    );

    if (validationErrors.length > 0) {
        pass2Errors.push(...validationErrors);
    } else {
       validatedInstructions.push({
           originalLineNumber: line.originalLineNumber,
           address: instructionAddress,
           mnemonic: line.mnemonic,
           validatedOperands: validatedOps
       });
    }
  });

   const finalInstructions: string[] = [];
   const pass3Errors: string[] = [];

   validatedInstructions.forEach((inst) => {
       const { resolvedOperands, jumpBranchErrors } = this._resolveJumpBranchTargets(
           inst.mnemonic,
           inst.validatedOperands,
           inst.address,
           labelMap,
           inst.originalLineNumber
       );

       if (jumpBranchErrors.length > 0) {
           pass3Errors.push(...jumpBranchErrors);
       } else {
            finalInstructions.push(`${inst.mnemonic} ${resolvedOperands.join(' ')}`.trim());
       }
   });

  errors.push(...pass2Errors, ...pass3Errors);

  return {
    instructions: errors.length === 0 ? finalInstructions : [],
    errors
  };
}

private _getOperandExpectation(mnemonic: string): OperandExpectation[] {
  // Instrucciones sin operandos
  if (['nop', 'syscall', 'break'].includes(mnemonic)) {
    return [];
  }

  const info = this.translator.instructionMap[mnemonic];
  if (!info) {
    return [];
  }

  // R-type puro (funct existe)
  if (info.funct) {
    if (mnemonic === 'sll' || mnemonic === 'srl' || mnemonic === 'sra') {
      return ['register', 'register', 'shamt5u'];
    }
    if (mnemonic === 'sllv' || mnemonic === 'srlv' || mnemonic === 'srav') {
      return ['register', 'register', 'register'];
    }
    if (mnemonic === 'jr') {
      return ['register'];
    }
    if (mnemonic === 'jalr') {
      return ['register', 'register'];
    }
    if (['mult', 'div', 'multu', 'divu'].includes(mnemonic)) {
      return ['register', 'register'];
    }
    if (['mfhi', 'mflo', 'mthi', 'mtlo'].includes(mnemonic)) {
      return ['register'];
    }
    // Default R-type: rd, rs, rt
    return ['register', 'register', 'register'];
  }

  // I-types especiales añadidos
  if (mnemonic === 'lui') {
    return ['register', 'immediate16u'];
  }
  if (mnemonic === 'slti' || mnemonic === 'sltiu') {
    return ['register', 'register', 'immediate16s'];
  }
  if (mnemonic === 'bltz' || mnemonic === 'bgez') {
    return ['register', 'label'];
  }

  // I-type genéricos
  if (['lw', 'sw', 'lb', 'lbu', 'lh', 'lhu', 'sb', 'sh'].includes(mnemonic)) {
    return ['register', 'loadStore'];
  }
  if (mnemonic === 'beq' || mnemonic === 'bne') {
    return ['register', 'register', 'label'];
  }
  if (mnemonic === 'blez' || mnemonic === 'bgtz') {
    return ['register', 'label'];
  }
  if (['addi', 'addiu', 'andi', 'ori', 'xori'].includes(mnemonic)) {
    return ['register', 'register', 'immediate16u'];
  }

  // J-type
  if (mnemonic === 'j' || mnemonic === 'jal') {
    return ['label'];
  }

  console.warn(`Formato de operandos no definido explícitamente para ${mnemonic}`);
  return [];
}

   private _validateInstructionAndOperands(mnemonic: string, rawOperands: string[], lineNumber: number): { validatedOps: ValidatedOperand[], validationErrors: string[] } {
       const validationErrors: string[] = [];
       const validatedOps: ValidatedOperand[] = [];

       if (!this.translator.instructionMap[mnemonic]) {
           validationErrors.push(`Línea ${lineNumber}: Instrucción desconocida '${mnemonic}'.`);
           return { validatedOps, validationErrors };
       }

       const expectedFormat = this._getOperandExpectation(mnemonic);

       if (rawOperands.length !== expectedFormat.length) {
           validationErrors.push(`Línea ${lineNumber}: '${mnemonic}' espera ${expectedFormat.length} operandos, recibió ${rawOperands.length} ('${rawOperands.join(', ')}').`);
           return { validatedOps, validationErrors };
       }

       for (let i = 0; i < expectedFormat.length; i++) {
           const expected = expectedFormat[i];
           const actualRaw = rawOperands[i];
           let validated: ValidatedOperand | null = null;

           switch (expected) {
              case 'register':
                  const regName = this._parseRegister(actualRaw);
                  if (regName) {
                      validated = { type: 'register', name: regName };
                  } else {
                      validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un registro MIPS válido.`);
                  }
                  break;
              case 'immediate16s':
              case 'immediate16u':
                  const imm16 = this._parseImmediate(actualRaw);
                  if (imm16 !== null) {
                      const isSigned = expected === 'immediate16s';
                      const min = isSigned ? -32768 : 0;
                      const max = isSigned ? 32767 : 65535;
                      if (imm16 < min || imm16 > max) {
                          validationErrors.push(`Línea ${lineNumber}: Inmediato '${actualRaw}' (${imm16}) fuera de rango para '${mnemonic}' (${min} a ${max}).`);
                      } else {
                          validated = { type: 'immediate', value: imm16 };
                      }
                  } else {
                      validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un número inmediato válido.`);
                  }
                  break;
              case 'shamt5u':
                  const shamt = this._parseImmediate(actualRaw);
                  if (shamt !== null) {
                      if (shamt < 0 || shamt > 31) {
                          validationErrors.push(`Línea ${lineNumber}: Valor de shift ('${actualRaw}') fuera de rango para '${mnemonic}' (0 a 31).`);
                      } else {
                          validated = { type: 'immediate', value: shamt };
                      }
                  } else {
                      validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un inmediato válido para shamt.`);
                  }
                  break;
              case 'loadStore':
                  const memOp = this._parseLoadStoreOperand(actualRaw);
                  if (memOp) {
                      if (memOp.offset < -32768 || memOp.offset > 32767) {
                          validationErrors.push(`Línea ${lineNumber}: Offset '${memOp.offset}' fuera de rango para '${mnemonic}' (-32768 a 32767).`);
                      } else {
                          validated = { type: 'loadStore', offset: memOp.offset, baseRegister: memOp.base };
                      }
                  } else {
                      validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no tiene el formato offset(base) válido.`);
                  }
                  break;
              case 'label':
                  if (this._isPotentialLabel(actualRaw)) {
                      validated = { type: 'label', name: actualRaw.toLowerCase() };
                  } else if (this._parseImmediate(actualRaw) !== null){
                      validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un nombre de etiqueta válido para '${mnemonic}'.`);
                  } else {
                      validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un nombre de etiqueta válido para '${mnemonic}'.`);
                  }
                  break;
           }

           if (validationErrors.length > 0) break;
           if (validated) {
               validatedOps.push(validated);
           } else {
                validationErrors.push(`Línea ${lineNumber}: Error interno procesando operando #${i+1} para '${mnemonic}'.`);
                break;
           }
       }

       return { validatedOps, validationErrors };
   }

   private _resolveJumpBranchTargets(
    mnemonic: string,
    validatedOperands: ValidatedOperand[],
    currentAddress: number,
    labelMap: Map<string, LabelInfo>,
    lineNumber: number
  ): { resolvedOperands: string[]; jumpBranchErrors: string[] } {
    const jumpBranchErrors: string[] = [];
    let resolvedOperands = [...validatedOperands];
    const isJump = ['j', 'jal'].includes(mnemonic);
    const isBranch = ['beq', 'bne', 'bgtz', 'blez', 'bltz', 'bgez'].includes(mnemonic);
  
    for (let i = 0; i < resolvedOperands.length; i++) {
      const op = resolvedOperands[i];
      if (op.type === 'label' && ((isJump && i === 0) || (isBranch && i === resolvedOperands.length - 1))) {
        const labelName = op.name;
        const info = labelMap.get(labelName);
        if (!info) {
          jumpBranchErrors.push(`Línea ${lineNumber}: Etiqueta no definida '${labelName}'.`);
          break;
        }
        const targetAddr = info.address;
        if (isBranch) {
          const relativeBytes = targetAddr - (currentAddress + 4);
          if (relativeBytes % 4 !== 0) {
            jumpBranchErrors.push(`Línea ${lineNumber}: Branch offset no alineado para '${labelName}'.`);
            break;
          }
          const offset = relativeBytes >> 2;
          if (offset < -32768 || offset > 32767) {
            jumpBranchErrors.push(`Línea ${lineNumber}: Branch offset fuera de rango para '${labelName}'.`);
            break;
          }
          resolvedOperands[i] = { type: 'immediate', value: offset };
        } else if (isJump) {
          if (targetAddr % 4 !== 0) {
            jumpBranchErrors.push(`Línea ${lineNumber}: Jump target no alineado para '${labelName}'.`);
            break;
          }
          const regionPC = (currentAddress + 4) & 0xF0000000;
          const regionTgt = targetAddr & 0xF0000000;
          if (regionPC !== regionTgt) {
            jumpBranchErrors.push(
              `Línea ${lineNumber}: Jump fuera de región 256MB para '${labelName}'.`
            );
            break;
          }
          const imm26 = (targetAddr >>> 2) & 0x03FFFFFF;
          resolvedOperands[i] = { type: 'immediate', value: imm26 };
        }
      }
    }
  
    const finalOperandStrings = resolvedOperands.map(op => this._formatValidatedOperand(op));
    return { resolvedOperands: finalOperandStrings, jumpBranchErrors };
  }

   private _parseRegister(reg: string | undefined): string | null {
       if (!reg) return null;
       const cleanedReg = reg.toLowerCase().replace(/^\$/, '');
       if (this.registerMapByName.has(cleanedReg)) return cleanedReg;
       const regNum = parseInt(cleanedReg);
       if (!isNaN(regNum) && regNum >= 0 && regNum <= 31) {
           for (const [numBin, name] of Object.entries(registerMap)) {
               if (parseInt(numBin, 2) === regNum) return name;
           }
       }
       return null;
   }

   private _parseImmediate(imm: string | undefined): number | null {
        if (imm === undefined || imm === null || imm.trim() === '') return null;
        const cleanedImm = imm.toLowerCase().trim();
        let value: number;
        try {
            if (cleanedImm.startsWith('0x')) value = parseInt(cleanedImm.substring(2), 16);
            else if (cleanedImm.startsWith('-0x')) value = -parseInt(cleanedImm.substring(3), 16);
            else value = parseInt(cleanedImm, 10);
        } catch (e) { return null; }
        return isNaN(value) ? null : value;
   }

   private _parseLoadStoreOperand(operand: string | undefined): { offset: number, base: string } | null {
       if (!operand) return null;
       const loadStoreRegex = /^(-?(?:\d+|0x[0-9a-f]+))\s*\(\s*(\$[a-z0-9]+)\s*\)$/i;
       const match = operand.match(loadStoreRegex);
       if (!match) return null;

       const offset = this._parseImmediate(match[1]);
       const baseRegName = this._parseRegister(match[2]);

       if (offset === null || baseRegName === null) return null;
       return { offset, base: baseRegName };
   }

    private _isPotentialLabel(str: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str);
    }

    private _formatValidatedOperand(operand: ValidatedOperand): string {
        switch (operand.type) {
            case 'register': return `$${operand.name}`;
            case 'immediate': return operand.value.toString();
            case 'label': return operand.name;
            case 'loadStore': return `${operand.offset} $${operand.baseRegister}`;
        }
    }
}
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslatorService } from '../Translator/translator.service';
import { FormInputManagerService } from '../FormInputManager/form-input-manager.service';

@Injectable({
  providedIn: 'root',
})
export class TableInstructionService {
  converter = inject(TranslatorService);
  private selectedLineTextSubject = new BehaviorSubject<string>('');
  isHexToMips = inject(FormInputManagerService).isHexToMips;

  selectedLineText$ = this.selectedLineTextSubject.asObservable();
  selectedLineText = '';

  updateSelectedLineText(newText: string): void {
    this.selectedLineTextSubject.next(newText);
  }

  textContent = '';

  constructor() {}

  convertRegisterToName(registerBinary: string) {
    return this.converter.registerMap[registerBinary]
      ? `$${this.converter.registerMap[registerBinary]}`
      : 'unknown';
  }

  explainInstruction() {
    this.selectedLineText$.subscribe((text) => {
      if (!this.isHexToMips.value) {
        text = this.converter.translateMIPStoHex(text);
      }
      this.selectedLineText = text;
    });

    const instruction = this.selectedLineText.trim();
    return this.generateInstructionTable(instruction.trim());
  }

  produceRInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(
      this.selectedLineText,
    );
    const opcode = binaryInstruction.slice(0, 6);
    const funct = binaryInstruction.slice(26, 32);
    const shamt = binaryInstruction.slice(21, 26);

    // Obtener el nombre de la instrucción
    const instrName = this.converter.convertFunctToName(funct, shamt);

    return {
      opcode: opcode,
      rs: binaryInstruction.slice(6, 11),
      rt: binaryInstruction.slice(11, 16),
      rd: binaryInstruction.slice(16, 21),
      shamt: shamt,
      funct: funct,
      instrName: instrName,
      version: this.converter.getVersion(),
    };
  }

  produceIInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(instruction);
    const opcode = binaryInstruction.slice(0, 6);

    // Para BLTZ/BGEZ (opcode 000001)
    if (opcode === '000001') {
      const rt = binaryInstruction.slice(11, 16);
      let instrName = 'unknown';

      if (rt === '00000') {
        instrName = 'bltz';
      } else if (rt === '00001') {
        const rs = binaryInstruction.slice(6, 11);
        instrName = rs === '00000' ? 'bal' : 'bgez';
      }

      return {
        opcode: opcode,
        rs: binaryInstruction.slice(6, 11),
        rt: rt,
        immediate: binaryInstruction.slice(16, 32),
        instrName: instrName,
        version: this.converter.getVersion(),
      };
    }

    // Para AUI/LUI en R6 (opcode 001111)
    if (this.converter.getVersion() === 'r6' && opcode === '001111') {
      const rs = binaryInstruction.slice(6, 11);
      const instrName = rs === '00000' ? 'lui' : 'aui';

      return {
        opcode: opcode,
        rs: rs,
        rt: binaryInstruction.slice(11, 16),
        immediate: binaryInstruction.slice(16, 32),
        instrName: instrName,
        version: this.converter.getVersion(),
      };
    }

    // Instrucciones I-Type normales
    const instrName = this.converter.convertOpcodeToName(opcode);

    return {
      opcode: opcode,
      rs: binaryInstruction.slice(6, 11),
      rt: binaryInstruction.slice(11, 16),
      immediate: binaryInstruction.slice(16, 32),
      instrName: instrName,
      version: this.converter.getVersion(),
    };
  }

  produceJInstruction(instruction: string): any {
    const binaryInstruction: string = this.converter.hexToBinary(
      this.selectedLineText,
    );
    const opcode = binaryInstruction.slice(0, 6);
    const instrName = this.converter.convertOpcodeToName(opcode);

    return {
      opcode: opcode,
      address: binaryInstruction.slice(6, 32),
      instrName: instrName,
      version: this.converter.getVersion(),
    };
  }

  produceRTrapInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(
      this.selectedLineText,
    );
    const funct = binaryInstruction.slice(26, 32);
    const instrName = this.converter.convertFunctToName(funct);

    const result = {
      opcode: binaryInstruction.slice(0, 6),
      rs: binaryInstruction.slice(6, 11),
      rt: binaryInstruction.slice(11, 16),
      code: binaryInstruction.slice(16, 26),
      funct: funct,
      instrName: instrName,
      version: this.converter.getVersion(),
    };

    return result;
  }

  produceITrapInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(instruction);

    const rtMap: { [key: string]: string } = {
      '01000': 'tgei',
      '01001': 'tgeiu',
      '01010': 'tlti',
      '01011': 'tltiu',
      '01100': 'teqi',
      '01110': 'tnei',
    };

    const rtBinary = binaryInstruction.slice(11, 16);
    const rtName = rtMap[rtBinary];

    return {
      opcode: binaryInstruction.slice(0, 6),
      rs: binaryInstruction.slice(6, 11),
      rtBinary: rtBinary,
      rtName: rtName,
      immediate: binaryInstruction.slice(16, 32),
      version: this.converter.getVersion(),
    };
  }

  generateInstructionTable(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(
      this.selectedLineText,
    );
    const opCode: string = binaryInstruction.slice(0, 6);

    // Caso especial: R-Type (opcode 000000)
    if (opCode === '000000') {
      const funct = binaryInstruction.slice(26, 32);
      const shamt = binaryInstruction.slice(21, 26);
      const instrName = this.converter.convertFunctToName(funct, shamt);

      if (!instrName || instrName === 'unknown') {
        return { type: 'unknown', data: 'Unknown R-Type instruction', opCode };
      }

      // Verificar si es trap instruction
      if (
        this.converter.getVersion() === 'legacy' &&
        ['teq', 'tge', 'tgeu', 'tlt', 'tltu', 'tne'].includes(instrName)
      ) {
        return {
          type: 'R-Trap',
          data: this.produceRTrapInstruction(instruction),
        };
      }

      return { type: 'R', data: this.produceRInstruction(instruction) };
    }

    // Caso especial: BLTZ/BGEZ/BAL/NAL (opcode 000001)
    if (opCode === '000001') {
      const rt = binaryInstruction.slice(11, 16);

      // Verificar si es trap instruction con immediate
      if (
        this.converter.getVersion() === 'legacy' &&
        ['01000', '01001', '01010', '01011', '01100', '01110'].includes(rt)
      ) {
        return {
          type: 'I-Trap',
          data: this.produceITrapInstruction(instruction),
        };
      }

      return { type: 'I', data: this.produceIInstruction(instruction) };
    }

    // Buscar la instrucción por opcode
    const instrName = this.converter.convertOpcodeToName(opCode);

    if (!instrName || instrName === 'unknown') {
      return { type: 'unknown', data: 'Unknown instruction', opCode };
    }

    // Obtener el tipo desde la definición de la instrucción
    const instrDef = this.converter.instructionMap[instrName];

    if (!instrDef) {
      return {
        type: 'unknown',
        data: 'Instruction definition not found',
        opCode,
      };
    }

    const instrType = instrDef.type;

    switch (instrType) {
      case 'R':
        return { type: 'R', data: this.produceRInstruction(instruction) };
      case 'I':
        return { type: 'I', data: this.produceIInstruction(instruction) };
      case 'J':
        return { type: 'J', data: this.produceJInstruction(instruction) };
      default:
        return { type: 'unknown', data: 'Unknown instruction type', opCode };
    }
  }

  decodeInstruction(instruction: string) {
    const parts = instruction.replace(/\$/g, '').toLowerCase().split(/\s+/);
    const operation = parts[0];
    const info = this.converter.instructionMap[operation];

    if (!info)
      return `Unknown instruction: ${operation} (version: ${this.converter.getVersion()})`;

    const args = info.args;
    const details: any = { operation };

    args.forEach((arg, i) => {
      if (arg.includes('(')) {
        // extraer offset(rs)
        const match = parts[i + 1]?.match(
          /^(-?\d+|0x[0-9a-fA-F]+)\(([^)]+)\)$/,
        );
        if (match) {
          details['offset'] = match[1];
          details['rs'] = match[2];
        }
      } else {
        details[arg] = parts[i + 1];
      }
    });

    // Reemplazar placeholders en description
    let explanation = info.description.replace(
      /\{(\w+)\}/g,
      (_, key) => details[key] || '',
    );
    return explanation;
  }

  /**
   * Obtiene información detallada sobre una instrucción
   */
  getInstructionInfo(mnemonic: string) {
    const instr = this.converter.instructionMap[mnemonic];
    if (!instr) return null;

    return {
      ...instr,
      currentVersion: this.converter.getVersion(),
    };
  }
}

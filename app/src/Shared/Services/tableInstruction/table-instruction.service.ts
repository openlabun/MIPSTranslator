import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslatorService } from '../Translator/translator.service';
import { text } from 'stream/consumers';
import { FormInputManagerService } from '../FormInputManager/form-input-manager.service';

@Injectable({
  providedIn: 'root',
})
export class TableInstructionService {
  converter = inject(TranslatorService);
  private selectedLineTextSubject = new BehaviorSubject<string>('');
  isHexToMips = inject(FormInputManagerService).isHexToMips;
  // Esto es el observable al que otros componentes pueden suscribirse
  selectedLineText$ = this.selectedLineTextSubject.asObservable();
  selectedLineText = '';
  // Método para actualizar el valor
  updateSelectedLineText(newText: string): void {
    this.selectedLineTextSubject.next(newText);
  }
  textContent = '';

  constructor() {}

  convertRegisterToName(registerBinary: string) {
    const regMap: { [key: string]: string } = {
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
    return regMap[registerBinary] || 'unknown';
  }

  explainInstruction() {
    
    this.selectedLineText$.subscribe((text) => {
      if(!this.isHexToMips.value){
        text = this.converter.translateMIPStoHex(text);
      }
      this.selectedLineText = text;
    
    });
    const instruction = this.selectedLineText.trim();
    return this.generateInstructionTable(instruction.trim());
  }

  produceRInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(
      this.selectedLineText
    );
    return {
      opcode: binaryInstruction.slice(0, 6),
      rs: binaryInstruction.slice(6, 11),
      rt: binaryInstruction.slice(11, 16),
      rd: binaryInstruction.slice(16, 21),
      shamt: binaryInstruction.slice(21, 26),
      funct: binaryInstruction.slice(26, 32),
    };
  }

  produceIInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(instruction);
    const opcode = binaryInstruction.slice(0, 6);
    if (opcode === '000001') {
      return {
        opcode: opcode,
        rs: binaryInstruction.slice(6, 11),
        rt: binaryInstruction.slice(11, 16), // "00000" o "00001"
        immediate: binaryInstruction.slice(16, 32)
      };
    }
    return {
      opcode: opcode,
      rs: binaryInstruction.slice(6, 11),
      rt: binaryInstruction.slice(11, 16),
      immediate: binaryInstruction.slice(16, 32),
    };
  }

  produceJInstruction(instruction: string): { opcode: string; address: string } {
    const binaryInstruction: string = this.converter.hexToBinary(
      this.selectedLineText
    );
    return {
      opcode: binaryInstruction.slice(0, 6),
      address: binaryInstruction.slice(6, 32),
    };
  }
  

  produceRTrapInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(this.selectedLineText);

    const result = {
      opcode: binaryInstruction.slice(0, 6),
      rs: binaryInstruction.slice(6, 11),
      rt: binaryInstruction.slice(11, 16),
      code: binaryInstruction.slice(16, 26), // Code de 10 bits
      funct: binaryInstruction.slice(26, 32), // Funct de 6 bits
    };

    console.log("R-Trap Instruction", result); // Verifica los valores aquí
    return result;
  }
  produceITrapInstruction(instruction: string) {
    const binaryInstruction: string = this.converter.hexToBinary(instruction);

    const rtMap: { [key: string]: string } = {
      "01000": "tgei",
      "01001": "tgeiu",
      "01010": "tlti",
      "01011": "tltiu",
      "01100": "teqi",
      "01110": "tnei"
    };
  // Obtenemos el binario de rt y lo mapeamos
  const rtBinary = binaryInstruction.slice(11, 16); // Obtenemos el valor binario de rt
  const rtName = rtMap[rtBinary]; // Usamos el mapa para obtener el nombre correspondiente

    return {
      opcode: binaryInstruction.slice(0, 6),
      rs: binaryInstruction.slice(6, 11),
      rtBinary: rtBinary,  // Devolvemos el valor binario de rt
      rtName: rtName,      // Devolvemos el nombre mapeado
      immediate: binaryInstruction.slice(16, 32),
    };
  }

  generateInstructionTable(instruction: string) {
  const binaryInstruction: string = this.converter.hexToBinary(this.selectedLineText);
  const opCode: string = binaryInstruction.slice(0, 6);

  // Buscar la instrucción en TranslatorService por opcode
  const instrName = this.converter.convertOpcodeToName(opCode);

  if (!instrName || instrName === 'unknown') {
    return { type: 'unknown', data: 'Unknown instruction', opCode };
  }

  // Obtener el tipo desde la definición de la instrucción en el JSON
  const instrType = this.converter.instructionMap[instrName].type;

  switch (instrType) {
    case 'R':
      return { type: 'R', data: this.produceRInstruction(instruction) };
    case 'I':
      return { type: 'I', data: this.produceIInstruction(instruction) };
    case 'J':
      return { type: 'J', data: this.produceJInstruction(instruction) };
    default:
      return { type: 'unknown', data: 'Unknown instruction', opCode };
  }
}
  decodeInstruction(instruction: string) {
  const parts = instruction.split(/\s+/);
  const operation = parts[0];
  const info = this.converter.instructionMap[operation];

  if (!info) return "Unknown instruction";

  const args = info.args;
  const details: any = { operation };

  args.forEach((arg, i) => {
    if (arg.includes('(')) {
      // extraer offset(rs)
      const [offset, rs] = parts[i+1].split('(');
      details['offset'] = offset;
      details['rs'] = rs.replace(')', '');
    } else {
      details[arg] = parts[i+1];
    }
  });

  // remplazar placeholders en description
  let explanation = info.description.replace(/\{(\w+)\}/g, (_, key) => details[key] || '');
  return explanation;
}
}
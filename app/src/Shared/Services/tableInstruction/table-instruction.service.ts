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
    const binaryInstruction: string = this.converter.hexToBinary(
      this.selectedLineText
    );
    const opCode: string = binaryInstruction.slice(0, 6);

    switch (opCode) {
      case '000000':
        return { type: 'R', data: this.produceRInstruction(instruction) };
      case '001000': // addi
      case '100011': // lw
      case '101011': // sw
      case '000100': // beq
      case '000101': // bne
      case '000110': // blez
      case '000111': // bgtz
      case '001001': // addiu
      case '001100': // andi
      case '001101': // ori
      case '001110': // xori
      case '100000': // lb
      case '100100': // lbu
      case '100001': // lh
      case '100101': // lhu
      case '101000': // sb
      case '101001': // sh
      case '000001': // bltz / bgez (rt = 00000 ⇒ bltz; rt = 00001 ⇒ bgez)
      case '001111': // lui
      case '001010': // slti
      case '001011': // sltiu
        return { type: 'I', data: this.produceIInstruction(instruction) };
      case '000010':
      case '000011':
        return { type: 'J', data: this.produceJInstruction(instruction) };
      default:
        return { type: 'unknown', data: 'Unknown instruction', opCode: opCode };
    }
  }
  decodeInstruction(instruction: string) {
    let explanation = '';
    let details: any = {};

    // Assume `instruction` is a string like "add $t1, $t2, $t3"
    const parts = instruction.split(/\s+/);
    const operation = parts[0]; // e.g., "add"
    console.log('operation', operation);
    switch (operation) {
      case 'add':
      case 'sub':
      case 'and':
      case 'or':
      case 'slt':
        // R-type instructions
        details = {
          operation: operation,
          rs: parts[2], // e.g., "$t2"
          rt: parts[3], // e.g., "$t3"
          rd: parts[1], // e.g., "$t1"
          shamt: '0',
          funct: this.converter.getFunctCode(operation),
        };
        explanation = `This is an R-type instruction where ${details.rd} gets the result of ${details.operation} operation between ${details.rs} and ${details.rt}.`;
        break;
      // Add cases for I-type and J-type instructions
      case 'lw':
      case 'lb':
      case 'lbu':
      case 'lh':
      case 'lhu':
        details = {
          operation: operation,
          rt: parts[1], // e.g., "$t1"
          offset: parts[2], // e.g., "100($t2)"
          rs: parts[2].split('(')[1].replace(')', ''), // e.g., "$t2"
        };
        explanation = `This is an I-type instruction where ${details.rt} gets the value from memory at the address ${details.offset} offset from ${details.rs}.`;
        break;
      case 'sw':
      case 'sb':
      case 'sh':
        details = {
          operation: operation,
          rt: parts[1], // e.g., "$t1"
          offset: parts[2], // e.g., "100($t2)"
          rs: parts[2].split('(')[1].replace(')', ''), // e.g., "$t2"
        };
        explanation = `This is an I-type instruction where the value in ${details.rt} is stored in memory at the address ${details.offset} offset from ${details.rs}.`;
        break;
      case 'addi':
        details = {
          operation: operation,
          rt: parts[1], // e.g., "$t1"
          rs: parts[2], // e.g., "$t2"
          immediate: parts[3], // e.g., "100"
        };
        explanation = `This is an I-type instruction where ${details.rt} gets the result of adding the value in ${details.rs} and the immediate value ${details.immediate}.`;
        break;
      case 'beq':
        details = {
          operation: operation,
          rs: parts[1], // e.g., "$t1"
          rt: parts[2], // e.g., "$t2"
          offset: parts[3], // e.g., "100"
        };
        explanation = `This is an I-type instruction where the program jumps to the target address if the values in ${details.rs} and ${details.rt} are equal.`;
        break;
      case 'bne':
        details = {
          operation: operation,
          rs: parts[1], // e.g., "$t1"
          rt: parts[2], // e.g., "$t2"
          offset: parts[3], // e.g., "100"
        };
        explanation = `This is an I-type instruction where the program jumps to the target address if the values in ${details.rs} and ${details.rt} are not equal.`;
        break;
        case 'addiu':
          details = {
            operation: operation,
            rt: parts[1], // e.g., "$t1"
            rs: parts[2], // e.g., "$t2"
            immediate: parts[3], // e.g., "100"
          };
          explanation = `This is an I-type instruction where ${details.rt} get the result of adding the value in ${details.rs} and the immediate value ${details.immediate}, but without generating an overflow.`;
          break;
  
        case 'andi':
          details = {
            operation: operation,
            rt: parts[1], // e.g., "$t1"
            rs: parts[2], // e.g., "$t2"
            immediate: parts[3], // e.g., "100"
          };
          explanation = `This is an I-type instruction where ${details.rt} gets the result of a bitwise AND between the value in ${details.rs} and the immediate value ${details.immediate}.`;
          break;
  
        case 'ori':
          details = {
            operation: operation,
            rt: parts[1], // e.g., "$t1"
            rs: parts[2], // e.g., "$t2"
            immediate: parts[3], // e.g., "100"
          };
          explanation = `This is an I-type instruction where ${details.rt} gets the result of a bitwise OR between the value in ${details.rs} and the immediate value ${details.immediate}.`;
          break;
  
        case 'xori':
          details = {
            operation: operation,
            rt: parts[1], // e.g., "$t1"
            rs: parts[2], // e.g., "$t2"
            immediate: parts[3], // e.g., "100"
          };
          explanation = `This is an I-type instruction where ${details.rt} gets the result of a bitwise XOR between the value in ${details.rs} and the immediate value ${details.immediate}.`;
          break;

        case 'bltz':
        case 'bgez':
          details = {
            operation: operation,
            rs: parts[1],       // Ej: "$s0"
            offset: parts[2],   // Ej: "etiqueta"
          };
          explanation = `Branch if ${details.rs} is ${operation === 'bltz' ? 'less than zero' : 'greater or equal to zero'}`;
          break;
        
        case 'lui':
          details = {
            operation: operation,
            rt: parts[1],       // Ej: "$t0"
            immediate: parts[2],// Ej: "0x1000"
          };
          explanation = `Load upper immediate: ${details.rt} = ${details.immediate} << 16`;
          break;
        
        case 'slti':
        case 'sltiu':
          details = {
            operation: operation,
            rt: parts[1],       // Ej: "$t0"
            rs: parts[2],       // Ej: "$s1"
            immediate: parts[3],// Ej: "100"
          };
          explanation = `Set ${details.rt} to 1 if ${details.rs} < ${details.immediate} (${operation.includes('u') ? 'unsigned' : 'signed'})`;
          break;
    }
    return explanation;
  }
}
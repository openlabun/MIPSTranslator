import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { TranslatorService } from '../Translator/translator.service';
import { FormInputManagerService } from '../FormInputManager/form-input-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  translatorService = inject(TranslatorService);
  inputManager = inject(FormInputManagerService); // Inyección del servicio

  constructor() {}

  getSuggestions(value: string): string[] {
    const lowerValue = value.toLowerCase();
    const hasSpace = lowerValue.includes(' ');
    const firstWord = lowerValue.split(' ')[0];

    // Filtrar instrucciones que coincidan
    const filteredInstructions = Object.keys(this.translatorService['instructionMap']).filter((instruction) =>
      hasSpace ? instruction === firstWord : instruction.startsWith(firstWord)
    );

    // Generar ejemplos aleatorios
    const examples = filteredInstructions.map((instruction) => this.generateRandomExamples(instruction));

    return examples.flat().filter((example) => example.includes(firstWord));
  }

  generateRandomExamples(instruction: string): string[] {
    const params = this.translatorService['instructionMap'][instruction];
    if (!params) return [`${instruction} (Sin ejemplo disponible)`];

    const examples: string[] = [];
    const numExamples = 3; // Generar 3 ejemplos por instrucción

    for (let i = 0; i < numExamples; i++) {
      switch (instruction) {
        case 'add':
        case 'sub':
        case 'and':
        case 'or':
        case 'nor':
        case 'xor':
        case 'addu':
        case 'subu':
        case 'slt':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomRegister()} ${this.randomRegister()}`);
          break;

        case 'addi':
        case 'addiu':
        case 'andi':
        case 'ori':
        case 'xori':
        case 'slti':
        case 'sltiu':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomRegister()} ${this.randomImmediate()}`);
          break;

        case 'lw':
        case 'sw':
        case 'lb':
        case 'lbu':
        case 'lh':
        case 'lhu':
        case 'sb':
        case 'sh':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomImmediate()} ${this.randomRegister()}`);
          break;

        case 'beq':
        case 'bne':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomRegister()} etiqueta${this.randomImmediate()}`);
          break;

        case 'bgtz':
        case 'blez':
          examples.push(`${instruction} ${this.randomRegister()} etiqueta${this.randomImmediate()}`);
          break;

        case 'j':
        case 'jal':
          examples.push(`${instruction} ${this.randomImmediate()}`);
          break;

        case 'jr':
        case 'jalr':
          examples.push(`${instruction} ${this.randomRegister()}`);
          break;

        case 'mfhi':
        case 'mflo':
        case 'mthi':
        case 'mtlo':
          examples.push(`${instruction} ${this.randomRegister()}`);
          break;

        case 'div':
        case 'divu':
        case 'mult':
        case 'multu':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomRegister()}`);
          break;

        case 'sll':
        case 'srl':
        case 'sra':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomRegister()} ${this.randomImmediate(5)}`);
          break;

        case 'sllv':
        case 'srlv':
        case 'srav':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomRegister()} ${this.randomRegister()}`);
          break;

        case 'teq':
        case 'tge':
        case 'tgeu':
        case 'tlt':
        case 'tltu':
        case 'tne':
          examples.push(`${instruction} ${this.randomRegister()} ${this.randomRegister()} ${this.randomImmediate(10)}`);
          break;

        default:
          examples.push(`${instruction} (Formato no definido)`);
          break;
      }
    }

    return examples;
  }

  randomRegister(): string {
    const temporaryRegisters = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']; // Solo registros temporales
    const randomIndex = Math.floor(Math.random() * temporaryRegisters.length);
    return `$${temporaryRegisters[randomIndex]}`;
  }

  randomImmediate(bits: number = 16): number {
    return Math.floor(Math.random() * (2 ** bits)); // Generar un valor inmediato aleatorio
  }
}

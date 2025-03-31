import { Injectable } from '@angular/core';
import {
  allowsImmediateLabel,
  getRequiredArguments,
} from '../../lib/mips/args';
import { FunctionCode } from '../../lib/mips/funct';
import {
  ImmediateInstructionOpcode,
  JumpInstructionOpcode,
} from '../../lib/mips/op';

const knownInstructions = Object.keys({
  ...ImmediateInstructionOpcode,
  ...JumpInstructionOpcode,
  ...FunctionCode,
}).filter((k) => typeof k === 'string');

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  constructor() {}

  getSuggestions(value: string): string[] {
    const lowerValue = value.toLowerCase();
    const hasSpace = lowerValue.includes(' ');
    const firstWord = lowerValue.split(' ')[0];

    // Filtrar instrucciones que coincidan
    const filteredInstructions = knownInstructions.filter((instruction) =>
      hasSpace ? instruction === firstWord : instruction.startsWith(firstWord)
    );

    // Generar ejemplos aleatorios
    const examples = filteredInstructions.map((instruction) =>
      this.generateRandomExamples(instruction)
    );

    return examples.flat();
  }

  generateRandomExamples(instruction: string): string[] {
    const args = getRequiredArguments(instruction);
    if (!args) {
      return [];
    }

    const examples: string[] = [];
    const numExamples = 3; // Generar 3 ejemplos por instrucción

    for (let i = 0; i < numExamples; i++) {
      const example = [instruction];
      if (instruction === 'jalr') {
        example.push(this.randomRegister());
      }

      for (const arg of args.arguments) {
        if (arg === 'shamt') {
          example.push(this.randomImmediate(5).toString());
        } else if (arg === 'imm') {
          if (allowsImmediateLabel(instruction)) {
            example.push(`etiqueta${this.randomImmediate()}`);
          } else {
            example.push(this.randomImmediate().toString());
          }
        } else {
          example.push(this.randomRegister());
        }
      }

      examples.push(example.join(' '));
    }

    return examples;
  }

  randomRegister(): string {
    const temporaryRegisters = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']; // Solo registros temporales
    const randomIndex = Math.floor(Math.random() * temporaryRegisters.length);
    return `$${temporaryRegisters[randomIndex]}`;
  }

  randomImmediate(bits: number = 16): number {
    return Math.floor(Math.random() * 2 ** bits); // Generar un valor inmediato aleatorio
  }
}

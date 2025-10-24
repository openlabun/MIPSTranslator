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
  const instr = this.translatorService['instructionMap'][instruction];
  if (!instr) return [`${instruction} (Sin ejemplo disponible)`];

  const examples: string[] = [];
  const numExamples = 3; // Número de ejemplos por instrucción

  for (let i = 0; i < numExamples; i++) {
    const exampleArgs = instr.args.map(arg => {
      if (arg.includes('imm')) {
        // Si es un inmediato
        const bits = arg.includes('5') ? 5 : arg.includes('10') ? 10 : 16;
        return this.randomImmediate(bits);
      } else if (arg.includes('offset')) {
        // Offset como etiqueta + inmediato
        return `etiqueta${this.randomImmediate()}`;
      } else if (arg.includes('rs') || arg.includes('rt') || arg.includes('rd')) {
        // Registros
        return this.randomRegister();
      } else {
        return arg; // Por si hay algo literal
      }
    });

    examples.push(`${instruction} ${exampleArgs.join(' ')}`);
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

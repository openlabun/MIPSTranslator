import { Injectable } from '@angular/core';
import { getRequiredArguments } from '../../lib/mips/args';
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
      this.makeSuggestions(instruction)
    );

    return examples.flat();
  }

  makeSuggestions(instruction: string): string[] {
    const args = getRequiredArguments(instruction);
    if (!args) {
      return [];
    }

    if (instruction === 'jalr') {
      return [
        `${instruction} <${args.arguments.join('> <')}>`,
        `${instruction} <rd> <rs>`,
      ];
    }
    return [`${instruction} <${args.arguments.join('> <')}>`];
  }
}

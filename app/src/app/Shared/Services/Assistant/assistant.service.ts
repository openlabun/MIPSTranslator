import { Injectable } from '@angular/core';
import { FormInputManagerService } from '../FormInputManager/form-input-manager.service';
import { inject } from '@angular/core';
import { TranslatorService } from '../Translator/translator.service'; 
@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  inputManager = inject(FormInputManagerService);
  translatorService = inject(TranslatorService);

  private instructions: { [key: string]: string } = {
    "add": "000000", "sub": "000000", "slt": "000000", "and": "000000", "or": "000000",
    "addi": "001000", "lw": "100011", "sw": "101011",
    "beq": "000100", "bne": "000101",
    "bgtz": "000111", "blez": "000110", 
    "j": "000010", "jal": "000011",
    "jr": "000000", "jalr": "000000"
  };

  constructor() {}

  getSuggestions(value: string): string[] {
    const lowerValue = value.toLowerCase();
    const filteredInstructions = Object.keys(this.instructions).filter(instruction =>
      instruction.startsWith(lowerValue)
    );

    const examples = filteredInstructions.map(instruction => {
      switch (instruction) {
        case 'add':
          return ['add t1 t2 t3', 'add t0 t1 t2', 'add s1 s2 s3'];
        case 'sub':
          return ['sub t1 t2 t3', 'sub t0 t1 t2', 'sub s1 s2 s3'];
        case 'and':
          return ['and t1 t2 t3', 'and t0 t1 t2', 'and s1 s2 s3'];
        case 'or':
          return ['or t1 t2 t3', 'or t0 t1 t2', 'or s1 s2 s3'];
        case 'addi':
          return ['addi t1 t2 10', 'addi t0 t1 5', 'addi s1 s2 15'];
        case 'lw':
          return ['lw t1 0(t2)', 'lw t0 4(t1)', 'lw s1 8(s2)'];
        case 'sw':
          return ['sw t1 0(t2)', 'sw t0 4(t1)', 'sw s1 8(s2)'];
        case 'beq':
          return ['beq t1 t2 etiqueta', 'beq t0 t1 etiqueta', 'beq s1 s2 etiqueta'];
        case 'bne':
          return ['bne t1 t2 etiqueta', 'bne t0 t1 etiqueta', 'bne s1 s2 etiqueta'];
        case 'j':
          return ['j etiqueta1', 'j etiqueta2', 'j etiqueta3'];
        case 'jr':
          return ['jr ra', 'jr t1', 'jr s1'];
        case 'jal':
          return ['jal etiqueta1', 'jal etiqueta2', 'jal etiqueta3'];
        default:
          return [`${instruction} (Sin ejemplo disponible)`];
      }
    }).flat();

    return examples;
  }
}

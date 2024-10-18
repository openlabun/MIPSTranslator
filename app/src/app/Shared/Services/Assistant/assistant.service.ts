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
    "add": "000000", "addu": "000000", "addi": "001000", "addiu": "001001",
    "and": "000000", "andi": "001100", "div": "000000", "divu": "000000", 
    "mult": "000000", "multu": "000000", "nor": "000000", "or": "000000",
    "ori": "001101", "sll": "000000", "sllv": "000000", "sra": "000000",
    "srav": "000000", "srl": "000000", "srlv": "000000", "sub": "000000", 
    "subu": "000000", "xor": "000000", "xori": "001110",
    "lb": "100000", "lbu": "100100", "lh": "100001", "lhu": "100101", "lw": "100011",
    "sb": "101000", "sh": "101001", "sw": "101011",
    "mfhi": "010000", "mflo": "010010", "mthi": "010001", "mtlo": "010011",
    "slt": "101010", "sltu": "101001", "slti": "001010", "sltiu": "001001",
    "beq": "000100", "bgtz": "000111", "blez": "000110", "bne": "000101",
    "j": "000010", "jal": "000011", "jr": "000000", "jalr": "000000",
    "trap": "011010"
  };

  constructor() {}

  getSuggestions(value: string): string[] {
    const lowerValue = value.toLowerCase();
    const hasSpace = lowerValue.includes(' ');
    const firstWord = lowerValue.split(' ')[0];

    const filteredInstructions = Object.keys(this.instructions).filter(instruction =>
      hasSpace ? instruction === firstWord : instruction.startsWith(firstWord)
    );

    const examples = filteredInstructions.flatMap(instruction => {
      switch (instruction) {
        case 'add':
          return ['add t1 t2 t3', 'add t0 t1 t2', 'add s1 s2 s3'];
        case 'addu':
          return ['addu t1 t2 t3', 'addu t0 t1 t2', 'addu s1 s2 s3'];
        case 'addi':
          return ['addi t1 t2 10', 'addi t0 t1 5', 'addi s1 s2 15'];
        case 'addiu':
          return ['addiu t1 t2 10', 'addiu t0 t1 5', 'addiu s1 s2 15'];
        case 'and':
          return ['and t1 t2 t3', 'and t0 t1 t2', 'and s1 s2 s3'];
        case 'andi':
          return ['andi t1 t2 10', 'andi t0 t1 5', 'andi s1 s2 15'];
        case 'div':
          return ['div t1 t2', 'div t0 t1', 'div s1 s2'];
        case 'divu':
          return ['divu t1 t2', 'divu t0 t1', 'divu s1 s2'];
        case 'mult':
          return ['mult t1 t2', 'mult t0 t1', 'mult s1 s2'];
        case 'multu':
          return ['multu t1 t2', 'multu t0 t1', 'multu s1 s2'];
        case 'nor':
          return ['nor t1 t2 t3', 'nor t0 t1 t2', 'nor s1 s2 s3'];
        case 'or':
          return ['or t1 t2 t3', 'or t0 t1 t2', 'or s1 s2 s3'];
        case 'ori':
          return ['ori t1 t2 10', 'ori t0 t1 5', 'ori s1 s2 15'];
        case 'sll':
          return ['sll t1 t2 2', 'sll t0 t1 4', 'sll s1 s2 3'];
        case 'sllv':
          return ['sllv t1 t2 t3', 'sllv t0 t1 t2', 'sllv s1 s2 s3'];
        case 'sra':
          return ['sra t1 t2 2', 'sra t0 t1 3', 'sra s1 s2 4'];
        case 'srav':
          return ['srav t1 t2 t3', 'srav t0 t1 t2', 'srav s1 s2 s3'];
        case 'srl':
          return ['srl t1 t2 2', 'srl t0 t1 3', 'srl s1 s2 4'];
        case 'srlv':
          return ['srlv t1 t2 t3', 'srlv t0 t1 t2', 'srlv s1 s2 s3'];
        case 'sub':
          return ['sub t1 t2 t3', 'sub t0 t1 t2', 'sub s1 s2 s3'];
        case 'subu':
          return ['subu t1 t2 t3', 'subu t0 t1 t2', 'subu s1 s2 s3'];
        case 'xor':
          return ['xor t1 t2 t3', 'xor t0 t1 t2', 'xor s1 s2 s3'];
        case 'xori':
          return ['xori t1 t2 10', 'xori t0 t1 5', 'xori s1 s2 15'];
        case 'lb':
          return ['lb t1 0(t2)', 'lb t0 4(t1)', 'lb s1 8(s2)'];
        case 'lbu':
          return ['lbu t1 0(t2)', 'lbu t0 4(t1)', 'lbu s1 8(s2)'];
        case 'lh':
          return ['lh t1 0(t2)', 'lh t0 4(t1)', 'lh s1 8(s2)'];
        case 'lhu':
          return ['lhu t1 0(t2)', 'lhu t0 4(t1)', 'lhu s1 8(s2)'];
        case 'lw':
          return ['lw t1 0(t2)', 'lw t0 4(t1)', 'lw s1 8(s2)'];
        case 'sb':
          return ['sb t1 0(t2)', 'sb t0 4(t1)', 'sb s1 8(s2)'];
        case 'sh':
          return ['sh t1 0(t2)', 'sh t0 4(t1)', 'sh s1 8(s2)'];
        case 'sw':
          return ['sw t1 0(t2)', 'sw t0 4(t1)', 'sw s1 8(s2)'];
        case 'mfhi':
          return ['mfhi t1', 'mfhi t0', 'mfhi s1'];
        case 'mflo':
          return ['mflo t1', 'mflo t0', 'mflo s1'];
        case 'mthi':
          return ['mthi t1', 'mthi t0', 'mthi s1'];
        case 'mtlo':
          return ['mtlo t1', 'mtlo t0', 'mtlo s1'];
        case 'slt':
          return ['slt t1 t2 t3', 'slt t0 t1 t2', 'slt s1 s2 s3'];
        case 'sltu':
          return ['sltu t1 t2 t3', 'sltu t0 t1 t2', 'sltu s1 s2 s3'];
        case 'slti':
          return ['slti t1 t2 10', 'slti t0 t1 5', 'slti s1 s2 15'];
        case 'sltiu':
          return ['sltiu t1 t2 10', 'sltiu t0 t1 5', 'sltiu s1 s2 15'];
        case 'beq':
          return ['beq t1 t2 etiqueta', 'beq t0 t1 etiqueta', 'beq s1 s2 etiqueta'];
        case 'bgtz':
          return ['bgtz t1 etiqueta', 'bgtz t0 etiqueta', 'bgtz s1 etiqueta'];
        case 'blez':
          return ['blez t1 etiqueta', 'blez t0 etiqueta', 'blez s1 etiqueta'];
        case 'bne':
          return ['bne t1 t2 etiqueta', 'bne t0 t1 etiqueta', 'bne s1 s2 etiqueta'];
        case 'j':
          return ['j etiqueta1', 'j etiqueta2', 'j etiqueta3'];
        case 'jal':
          return ['jal etiqueta1', 'jal etiqueta2', 'jal etiqueta3'];
        case 'jr':
          return ['jr ra', 'jr t1', 'jr s1'];
        case 'jalr':
          return ['jalr t1', 'jalr t0', 'jalr s1'];
        case 'trap':
          return ['trap 1', 'trap 5', 'trap 10'];
        default:
          return [`${instruction} (Sin ejemplo disponible)`];
      }
    });

    return examples.filter(example => example.includes(firstWord));
  }
}

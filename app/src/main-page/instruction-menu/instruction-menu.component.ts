import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RV32I_INSTRUCTIONS } from '../../Shared/Constants/rv32i-instructions';

@Component({
  selector: 'app-instruction-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instruction-menu.component.html',
  styleUrls: ['./instruction-menu.component.css']
})
export class InstructionMenuComponent {
  @Output() instructionSelected = new EventEmitter<string>();
  
  objectKeys = Object.keys;
  
  instructionCategories: { [key: string]: string[] } = {
    'R-Type': ["add","sub","and","or","jalr","jr","slt","mfhi","mflo","mthi","mtlo","teq","tge","tgeu","tlt","tltu","tne","addu","div","divu","mult","multu","nor","sll","sllv","sra","srav","srl","srlv","subu","xor",],
    'I-Type': ["addi","addiu","andi","ori","xori","lw","sw","lb","lbu","lh","lhu","sb","sh","beq","bne","bgtz","blez",],
    'J-Type': ['jal', 'j'],
  };
  
  // Obtener descripción para una instrucción
  getDescription(inst: string): string {
    return RV32I_INSTRUCTIONS[inst] || '';
  }
  
  // Seleccionar instrucción
  selectInstruction(instruction: string): void {
    // Agrega "x1, x2, x3" como valores de ejemplo para los registros
    let formattedInstruction = '';
    
    // Formatear la instrucción según su tipo
    if (['add', 'sub', 'and', 'or', 'xor', 'subu', 'sllv', 'srlv', 'srav', 'slt', 'sltu', 'addu', 'nor'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 $t2 $t3`;
    } else if (['addi', 'slti', 'sltiu', 'xori', 'ori', 'andi', 'addiu'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 $t2 10`;
    } else if (['slli', 'srli', 'sll',  'srai', 'teq', 'tge', 'tgeu'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 $t2 2`;
    } else if (['div', 'divu', 'mult', 'multu'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 $t2`;
    } else if (['tlt', 'tltu', 'tne', 'sra', 'srl'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 $t2 100`;
    } else if (['lb', 'lh', 'lw', 'lbu', 'lhu'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 0x0001 $t2`;
    } else if (['sb', 'sh', 'sw'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 0x0001 $t2`;
    } else if (['beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 $t2 8`;
    } else if (['j', 'jal'].includes(instruction)) {
      formattedInstruction = `${instruction} 16`;
    } else if (['jalr', 'jr', 'mfhi', 'mflo', 'mthi', 'mtlo', ].includes(instruction)) {
      formattedInstruction = `${instruction} $t1`;
    } else if (['lui', 'auipc', 'blez', 'bgtz'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 1024`;
    } else {
      formattedInstruction = instruction;
    }

    this.instructionSelected.emit(formattedInstruction);
  }
}
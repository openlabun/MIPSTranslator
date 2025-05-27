import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RV32I_INSTRUCTIONS } from '../../Shared/Constants/rv32i-instructions';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instruction-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instruction-menu.component.html',
  styleUrls: ['./instruction-menu.component.css']
})
export class InstructionMenuComponent {
  @Output() instructionSelected = new EventEmitter<string>();

  objectKeys = Object.keys;
  filterText: string = '';

  instructionCategories: { [key: string]: string[] } = {
    'R-Type': [
      "add", "sub", "and", "or", "jalr", "jr", "slt", "mfhi", "mflo", 
      "mthi", "mtlo", "teq", "tge", "tgeu", "tlt", "tltu", "tne", "addu", 
      "div", "divu", "mult", "multu", "nor", "sll", "sllv", "sra", "srav", 
      "srl", "srlv", "subu", "xor", "syscall", "break"
    ],
    'I-Type': [
      "addi", "addiu", "andi", "ori", "xori", "lw", "sw", "lb", "lbu", 
      "lh", "lhu", "sb", "sh", "beq", "bne", "bgtz", "blez", "bltz", 
      "bgez", "lui", "slti", "sltiu"
    ],
    'J-Type': ['jal', 'j'],
  };

  // Método para filtrar las instrucciones según el texto ingresado
  getFilteredInstructions(category: string): string[] {
    const allInstructions = this.instructionCategories[category];
    if (!this.filterText.trim()) return allInstructions;

    const lowerFilter = this.filterText.toLowerCase();
    return allInstructions.filter(inst => inst.toLowerCase().includes(lowerFilter));
  }

  getDescription(inst: string): string {
    return RV32I_INSTRUCTIONS[inst] || '';
  }

  selectInstruction(instruction: string): void {
    let formattedInstruction = '';

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
    } else if (['jalr', 'jr', 'mfhi', 'mflo', 'mthi', 'mtlo'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1`;
    } else if (['lui', 'auipc', 'blez', 'bgtz'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 1024`;
    } else if (['syscall', 'break'].includes(instruction)) {
      formattedInstruction = instruction;
    } else if (['bltz', 'bgez'].includes(instruction)) {
      formattedInstruction = `${instruction} $t1 8`;
    } else {
      formattedInstruction = instruction;
    }

    this.instructionSelected.emit(formattedInstruction);
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RV32I_INSTRUCTIONS } from '../src/Shared/Constants/rv32i-instructions';

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
  
  // Agregamos una firma de índice para permitir acceso mediante string
  instructionCategories: { [key: string]: string[] } = {
    'R-Type': ['add', 'sub', 'sll', 'slt', 'sltu', 'xor', 'srl', 'sra', 'or', 'and'],
    'I-Type': ['jalr', 'lb', 'lh', 'lw', 'lbu', 'lhu', 'addi', 'slti', 'sltiu', 'xori', 'ori', 'andi', 'slli', 'srli', 'srai'],
    'S-Type': ['sb', 'sh', 'sw'],
    'B-Type': ['beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu'],
    'U-Type': ['lui', 'auipc'],
    'J-Type': ['jal'],
    'System': ['fence', 'ecall', 'ebreak']
  };
  
  // Obtener descripción para una instrucción
  getDescription(inst: string): string {
    return RV32I_INSTRUCTIONS[inst] || '';
  }
  
  // Seleccionar instrucción
  selectInstruction(instruction: string): void {
    this.instructionSelected.emit(instruction);
  }
}
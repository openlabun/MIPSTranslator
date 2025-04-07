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
  
  // Agregamos una firma de índice para permitir acceso mediante string
  
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
    this.instructionSelected.emit(instruction);
  }
}
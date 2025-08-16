import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RV32I_INSTRUCTIONS } from '../../Shared/Constants/rv32i-instructions';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import instructionsData from '../../data/mips-instructions.json';

interface Instruction {
  mnemonic: string;
  type: string;
  version: string;
  description: string;
  example: string;
}


@Component({
  selector: 'app-instruction-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instruction-menu.component.html',
  styleUrls: ['./instruction-menu.component.css']
})
export class InstructionMenuComponent {


  @Output() instructionSelected = new EventEmitter<{
    instruction: string;
    shouldTranslate: boolean;
    instructionType?: string;  // Add this new property
  }>();

  objectKeys = Object.keys;

  instructions: Instruction[] = instructionsData as Instruction[];
  filterText: string = '';

  getCategories(): string[] {
    return [...new Set(this.instructions.map(inst => inst.type))];
  }

  // Método para filtrar las instrucciones según el texto ingresado
  getFilteredInstructions(category: string): Instruction[] {
  const filteredByCategory = this.instructions.filter(inst => inst.type === category[0]); // "R", "I", "J"
  
  if (!this.filterText.trim()) return filteredByCategory;

  const lowerFilter = this.filterText.toLowerCase();
  return filteredByCategory.filter(inst =>
    inst.mnemonic.toLowerCase().includes(lowerFilter) ||
    inst.description.toLowerCase().includes(lowerFilter) ||
    inst.version.toLowerCase().includes(lowerFilter)
  );
}

  getDescription(instMnemonic: string): string {
  const inst = this.instructions.find(i => i.mnemonic === instMnemonic);
  return inst ? inst.description : '';
}

 selectInstruction(inst: Instruction): void {
  this.instructionSelected.emit({
    instruction: inst.example,
    shouldTranslate: true,
    instructionType: inst.type
  });
}

}

import { Component, inject, OnInit } from '@angular/core';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';

import instructionsData from '../../data/mips-instructions.json';

interface Instruction {
  mnemonic: string;
  type: string;
  version: string;
  opcode: string;
  funct?: string;
  rt?: string;
  description: string;
  example: string;
}

@Component({
  selector: 'app-instruction-table',
  standalone: true,
  imports: [],
  templateUrl: './instruction-table.component.html',
  styleUrl: './instruction-table.component.css',
})
export class InstructionTableComponent implements OnInit {
  instructionType: string = '';
  instructionData: any = null;
  tableService = inject(TableInstructionService);
  isHexToMips = inject(FormInputManagerService).isHexToMips;
  parts: any = null;
  currentInstruction: string = '';

  instructions: Instruction[] = instructionsData as Instruction[];

  showTooltip: boolean = false;
  tooltipText: string = '';
  tooltipPosition = { x: 0, y: 0 };

  constructor() {}

  ngOnInit() {
    this.tableService.selectedLineText$.subscribe((value) => {
      let draft = value;
      if (!this.isHexToMips.value) draft = this.tableService.converter.translateMIPStoHex(value);

      const result = this.tableService.explainInstruction();
      this.instructionType = result.type;
      this.instructionData = result.data;

      if (this.instructionType === 'R') {
        this.parts = this.tableService.produceRInstruction(draft);
        this.currentInstruction = this.resolveInstruction(this.parts.opcode, this.parts.rt, this.parts.funct);
      } else if (this.instructionType === 'I') {
        this.parts = this.tableService.produceIInstruction(draft);
        this.currentInstruction = this.resolveInstruction(this.parts.opcode, this.parts.rt);
      } else if (this.instructionType === 'J') {
        this.parts = this.tableService.produceJInstruction(draft);
        this.currentInstruction = this.resolveInstruction(this.parts.opcode);
      } else if (this.instructionType === 'RTrap') {
        this.parts = this.tableService.produceRTrapInstruction(draft);
        this.currentInstruction = this.resolveInstruction(this.parts.opcode, undefined, this.parts.funct);
      } else if (this.instructionType === 'ITrap') {
        this.parts = this.tableService.produceITrapInstruction(draft);
        this.currentInstruction = this.resolveInstruction(this.parts.opcode);
      }

      this.tooltipText = this.getInstructionDescription(this.currentInstruction);
    });
  }

  // Resuelve el nombre de la instrucción basado en el opcode
 private resolveInstruction(opcode: string, rt?: string, funct?: string): string {
    // Caso especial bltz/bgez
    if (opcode === '000001') {
      if (rt === '00000') return 'bltz';
      if (rt === '00001') return 'bgez';
    }

    // Buscar R-Type usando opcode + funct
    if (funct) {
      const rInstr = this.instructions.find(
        i => i.type === 'R' && i.opcode === opcode && i.funct === funct
      );
      if (rInstr) return rInstr.mnemonic;
    }

    // I o J-Type
    const instr = this.instructions.find(i => i.opcode === opcode);
    return instr?.mnemonic || `Unknown (${opcode})`;
  }

  getInstructionDescription(instruction: string): string {
    if (!instruction) return 'No instruction detected';
    const instr = this.instructions.find(i => i.mnemonic.toLowerCase() === instruction.toLowerCase());
    return instr ? `${instr.description}. Example: ${instr.example}` : `No description available for: ${instruction}`;
  }

  showDescription(event: MouseEvent, instructionName?: string) {
    const instructionToShow = instructionName || this.currentInstruction;
    if (!instructionToShow) return;

    this.tooltipText = this.getInstructionDescription(instructionToShow);
    
    if (this.tooltipText) {
      this.showTooltip = true;
      this.tooltipPosition = {
        x: event.clientX + 15,
        y: event.clientY + 20
      };
    }
  }

  hideDescription() {
    this.showTooltip = false;
  }
}
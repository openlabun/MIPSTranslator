import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';

@Component({
  selector: 'app-instruction-table',
  standalone: true,
  imports: [],
  templateUrl: './instruction-table.component.html',
  styleUrl: './instruction-table.component.css',
})

export class InstructionTableComponent implements OnChanges {
  @Input() instruction: string = ''; 
  instructionType: string = '';
  instructionData: any = null;
  tableService = inject(TableInstructionService);
  isHexToMips = inject(FormInputManagerService).isHexToMips;
  parts: any = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges detectado:', changes);
    if (changes['instruction'] && this.instruction) {
      this.processInstruction();
    }
  }

  processInstruction() {
    let draft = this.instruction;
    if (!this.isHexToMips.value) {
      draft = this.tableService.converter.translateMIPStoHex(this.instruction);
    }

    console.log('Instrucción seleccionada:', this.instruction);
    const result = this.tableService.explainInstruction();
    console.log('hdbvkcbfuybfes ',result)
    this.instructionType = result.type;
    console.log(result);
    this.instructionData = result.data;

    if (this.instructionType === 'R') {
      this.parts = this.tableService.produceRInstruction(draft);
    } else if (this.instructionType === 'I') {
      this.parts = this.tableService.produceIInstruction(draft);
    } else if (this.instructionType === 'J') {
      this.parts = this.tableService.produceJInstruction(draft);
    } else if (this.instructionType === 'RTrap') {
      this.parts = this.tableService.produceRTrapInstruction(draft);
    } else if (this.instructionType === 'ITrap') {
      this.parts = this.tableService.produceITrapInstruction(draft);
    }
  }
}



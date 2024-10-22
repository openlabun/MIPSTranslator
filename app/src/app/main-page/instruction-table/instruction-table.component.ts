import { Component, inject, OnInit } from '@angular/core';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';

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
  constructor() {}

  ngOnInit() {
    this.tableService.selectedLineText$.subscribe((value) => {
      let draft = value
      if (!this.isHexToMips.value) draft = this.tableService.converter.translateMIPStoHex(value);
      
      console.log('value', value);
      const result = this.tableService.explainInstruction();
      this.instructionType = result.type;
      console.log(result);
      this.instructionData = result.data;
      
     
      if (this.instructionType === 'R') {
        this.parts = this.tableService.produceRInstruction(draft);
      } else if (this.instructionType === 'I') {
        this.parts = this.tableService.produceIInstruction(draft);
      } else if (this.instructionType === 'J') {
        this.parts = this.tableService.produceJInstruction(draft);
      }else if (this.instructionType === 'RTrap') {
        this.parts = this.tableService.produceRTrapInstruction(draft);
      } else if (this.instructionType === 'ITrap') {
        this.parts = this.tableService.produceITrapInstruction(draft);        
      }
    });
  }
}

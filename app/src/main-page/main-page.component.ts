import { Component, inject } from '@angular/core';
import { TextboxComponent } from './textbox/textbox.component';
import { CommonModule } from '@angular/common';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { SwitchComponent } from './switch/switch.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';
import { InstructionMenuComponent } from '../../instruction-menu/instruction-menu.component';

interface Translation {
  mips: string;
  hex: string;
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    TextboxComponent,
    TranslateButtonComponent,
    CommonModule,
    SwitchComponent,
    TexboxOutputComponent,
    RamdropComponent,
    SaveRamButtonComponent,
    InstructionTableComponent,
    InstructionMenuComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'], 
})
export class MainPageComponent {
  
  inputText: string = '';
  output: string = '';
  parameter:string = '';
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  isHexToMIPS: boolean = false;
  tableManager = inject(TableInstructionService);
  selectedInstruction: string = '';
  isValidInstruction: boolean = true;
  translations: Translation[] = [];

  onTableValueChange(value: string): void {
    this.tableManager.updateSelectedLineText(value);
    
  }

  // Manejadores de eventos
  onToggle(isChecked: boolean): void {
    this.isHexToMIPS = isChecked;
    this.inputManagerIsHexToMips.setValue(isChecked);
    let draft = this.inputManager.value;
    this.inputManager.setValue(this.output);
    this.output = draft;

  }

  onInstructionClick(instruction: string){
    this.inputText=instruction
    this.detectInstructionType(instruction);
    
    let output = instruction;

    if (output !== this.selectedInstruction) {
      this.selectedInstruction = output;
      this.onTableValueChange(output);  // Llama al método con la instrucción
    }
  }

  onInput(input: string): void {
    this.isValidInstruction = true;
    this.inputText = input;
    this.detectInstructionType(input);
  }
  
  onTextFile(textFile: Promise<string[]>): void {
    
    textFile.then((instructions) => {
      const HEXs = instructions[0].split('\n');
      const MIPSs = instructions[1].split('\n');

      for (let i = 0; i < HEXs.length; i++) {
        const HEX = HEXs[i];
        const MIPS = MIPSs[i];

        this.translations.push({
          mips: MIPS,
          hex: HEX
        });
        this.parameter += HEX + '\n';
      }
      
    });
  }
  onTranslate(): void {
    let MIPS = '';
    let HEX = '';

    if (this.inputText === '' || !this.isValidInstruction ) return
    
    if (this.isHexToMIPS) {
      
      this.output = this.translator.translateHextoMIPS(this.inputText);
      this.parameter += this.inputText + '\n';
      MIPS = this.output;
      HEX = this.inputText;
    } else {
      this.output = this.translator.translateMIPStoHex(this.inputText);
      this.parameter += this.output + '\n'; 

      MIPS = this.inputText;
      HEX = this.output;
    }

    // Agregar la traducción a la lista de traducciones
    this.translations.push({
      mips: MIPS, // resultado MIPS
      hex: HEX // resultado HEX
    });
  }
  
  detectInstructionType(input: string): void {
    const isHEX = this.translator.isValidHex(input);
    const isMIPS = this.translator.isValidMIPS(input);

    if (isHEX) {
      this.isHexToMIPS = true;
      this.inputManagerIsHexToMips.setValue(true);
    } else if (isMIPS) {
      this.isHexToMIPS = false;
      this.inputManagerIsHexToMips.setValue(false);
    } else {
      this.isValidInstruction = false;
    }
  }

  // Método para Angular *ngFor en la plantilla HTML del menú
  objectKeys = Object.keys;

  onInstructionMenuSelect(instruction: string): void {
    // Agrega "x1, x2, x3" como valores de ejemplo para los registros
    let formattedInstruction = '';
    
    // Formatear la instrucción según su tipo
    if (['add', 'sub', 'and', 'or', 'xor', 'sll', 'srl', 'sra', 'slt', 'sltu'].includes(instruction)) {
      formattedInstruction = `${instruction} x1, x2, x3`;
    } else if (['addi', 'slti', 'sltiu', 'xori', 'ori', 'andi'].includes(instruction)) {
      formattedInstruction = `${instruction} x1, x2, 10`;
    } else if (['slli', 'srli', 'srai'].includes(instruction)) {
      formattedInstruction = `${instruction} x1, x2, 2`;
    } else if (['lb', 'lh', 'lw', 'lbu', 'lhu'].includes(instruction)) {
      formattedInstruction = `${instruction} x1, 0(x2)`;
    } else if (['sb', 'sh', 'sw'].includes(instruction)) {
      formattedInstruction = `${instruction} x1, 0(x2)`;
    } else if (['beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu'].includes(instruction)) {
      formattedInstruction = `${instruction} x1, x2, 8`;
    } else if (instruction === 'jal') {
      formattedInstruction = `${instruction} x1, 16`;
    } else if (instruction === 'jalr') {
      formattedInstruction = `${instruction} x1, 0(x2)`;
    } else if (['lui', 'auipc'].includes(instruction)) {
      formattedInstruction = `${instruction} x1, 1024`;
    } else {
      formattedInstruction = instruction;
    }
    
    // Establecer el valor en el input
    this.inputText = formattedInstruction;
    // Ejecutar cualquier otra lógica necesaria después de seleccionar una instrucción
    this.detectInstructionType(formattedInstruction);
  }
}
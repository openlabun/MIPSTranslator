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
    InstructionTableComponent
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
  selectedInstruction: string = ''; // ✅ Instrucción seleccionada para mostrar la tabla
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
      }
      
    });
  }
  onTranslate(): void {
    let MIPS = '';
    let HEX = '';

    if (this.inputText === '') return
    
    if (this.isHexToMIPS) {
      
      this.output = this.translator.translateHextoMIPS(this.inputText);
      this.parameter = this.inputText;
      MIPS = this.output;
      HEX = this.inputText;
    } else {
      this.output = this.translator.translateMIPStoHex(this.inputText);
      this.parameter = this.output

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
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { InstruccionesComponent } from './instrucciones/instrucciones.component';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    TextboxComponent,
    TranslateButtonComponent,
    TexboxOutputComponent,
    RamdropComponent,
    InstructionTableComponent,
    InstruccionesComponent,
    
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'], 
})
export class MainPageComponent {
  parameter: string = '';
  inputText: string = '';
  output: string = '';
  isHexToMIPS: boolean = false;
  tableManager = inject(TableInstructionService);
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  @ViewChild(TextboxComponent) textboxComponent!: TextboxComponent;
  controlStack: { original: string, translated: string, type: 'MIPS' | 'HEX' }[] = [];
  selectedInstruction: string = ''; 

  onTableValueChange(value: string): void {
    console.log('isHexToMips:', this.isHexToMIPS);
    console.log('value:', value);
    
    this.tableManager.updateSelectedLineText(value); 
  }

  //Maneja la selección de una instrucción de la pila para mostrar su tabla de opcodes
  onInstructionClick(instruction: string): void {
    console.log('Instrucción seleccionada hjbdbchkzhd:', instruction);
    this.selectedInstruction = instruction;
    this.inputText = instruction;
    this.detectFormatAndToggle();
    this.onTableValueChange(instruction);
  }
  
  // Detecta automáticamente si el input es HEX o MIPS
  private detectFormatAndToggle(): void {
    this.isHexToMIPS = this.isHex(this.inputText);
    this.inputManagerIsHexToMips.setValue(this.isHexToMIPS);
  }

  onInput(input: string): void {
    this.inputText = input;
    this.detectFormatAndToggle();
  }

  onTextFile(textFile: Promise<string[]>): void {
    textFile.then((instructions) => {
        this.inputText = instructions[1];
        this.output = instructions[0];

        const originalArray = this.inputText
            .split("\n")
            .map(line => line.trim())
            .filter(line => line !== "");

        const translatedArray = this.output
            .split("\n")
            .map(line => line.trim())
            .filter(line => line !== "");

        this.controlStack = originalArray.map((instr, index) => ({
            original: instr,
            translated: translatedArray[index] ?? "",
            type: "MIPS"
            
        }));
        console.log("📌 Control Stack Updated:", this.controlStack);
        this.output='';
    });
}

onTranslate(): void {
  if (this.inputText.includes('\n')) {
    return;}
  const translatedInstruction = this.isHexToMIPS
    ? this.translator.translateInstructionToMIPS(this.inputText.trim())
    : this.translator.translateInstructionToHex(this.inputText.trim());

  if (
    translatedInstruction.includes("Unknown") ||
    translatedInstruction.includes("Unsupported") ||
    translatedInstruction.includes("Invalid") || translatedInstruction == '00000000'
  ) {
    this.textboxComponent.texto('Sintaxis Incorrecta')
    console.log("El formato de la instrucción es inválido");
  } else {
    const instruction = this.inputText.trim();

    this.controlStack.push({
      original: instruction,
      translated: translatedInstruction,
      type: this.isHexToMIPS ? "HEX" : "MIPS",
    });

    this.inputText = '';
    this.textboxComponent.texto('');
  }
}

  //Verifica si el input es HEX
  private isHex(input: string): boolean {
    return /^0x[0-9A-Fa-f]+$/.test(input) || /^[0-9A-Fa-f]{8}$/.test(input);
  }

  onMipsGeneradoDesdeInstrucciones(mips: string): void {
    this.inputText = mips;
    this.detectFormatAndToggle();
    this.textboxComponent.texto(mips); 
  }  

}


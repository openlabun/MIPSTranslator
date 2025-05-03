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
import { InstructionMenuComponent } from './instruction-menu/instruction-menu.component';
import { ControlStackComponent } from './control-stack/control-stack.component';
import { assemblerTextboxComponent } from './assembler-textbox/assembler-textbox.component';
import { AssemblerTranslatorService } from '../Shared/Services/assemblerTranslator/assembler-Translator.service';
import { assemblerTranslateButtonComponent } from './assembler-translate-Button/assembler-translate-button.component';  
interface Translation {
  mips: string;
  hex: string;
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    assemblerTranslateButtonComponent,
    assemblerTextboxComponent,
    TextboxComponent,
    TranslateButtonComponent,
    CommonModule,
    SwitchComponent,
    TexboxOutputComponent,
    RamdropComponent,
    SaveRamButtonComponent,
    InstructionTableComponent,
    InstructionMenuComponent,
    ControlStackComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'], 
})
export class MainPageComponent {
  
  inputText: string = '';
  output: string = '';
  parameter:string = '';
  assemblerInputText: string = '';
  private translator = inject(TranslatorService);
  private assemblerTranslator = inject(AssemblerTranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  isHexToMIPS: boolean = false;
  tableManager = inject(TableInstructionService);
  selectedInstruction: string = '';
  isValidInstruction: boolean = true;
  translations: Translation[] = [];




  private _updateStateFromTranslationDict(translationDict: { [key: string]: string }): void {
    const loadedTranslations: Translation[] = [];
    const hexValues: string[] = [];

    // Iterate through the dictionary (MIPS instruction is the key)
    for (const mipsInstruction in translationDict) {
      // Ensure it's an own property and not from the prototype chain
      if (Object.prototype.hasOwnProperty.call(translationDict, mipsInstruction)) {
        const hexValue = translationDict[mipsInstruction];

        // Create the Translation object needed by the table
        loadedTranslations.push({
          mips: mipsInstruction,
          hex: hexValue
        });

        // Collect the HEX value for the parameter string
        hexValues.push(hexValue);
      }
    }

    // --- Update the component's properties ---
    // Replace the existing translations with the new ones from assembly
    this.translations = loadedTranslations;
    // Rebuild the parameter string from the new HEX values
    this.parameter = hexValues.join('\n');
  }

  // Handler for the assembler input changing
  onAssemblerInput(input: string): void {
    this.assemblerInputText = input;
  }

  // Handler for the "Assemble" button click
  onAssemblerTranslate(): void {
    if (!this.assemblerInputText.trim()) {
      // Handle empty input: Clear the table
      this.translations = [];
      this.parameter = '';
      return;
    }

    // Call the service to get the dictionary
    const assemblerOutput = this.assemblerTranslator.assembleTranslate(this.assemblerInputText);
    console.log("Assembler Output Received:", assemblerOutput); // Good for debugging

    // --- Process the output ---
    // Check if the service returned an error object
    if (assemblerOutput && assemblerOutput['error']) {
      console.error('Assembly failed:', assemblerOutput['error']);
    }
    // Check if the output is a valid, non-empty object (and not the error object)
    else if (assemblerOutput && typeof assemblerOutput === 'object' && Object.keys(assemblerOutput).length > 0) {
      // Call the helper function to update the state
      this._updateStateFromTranslationDict(assemblerOutput);
      console.log('Assembly successful. Translations array and parameter updated.');
    }
     else {
       // Handle cases where the assembler might return null, undefined, or an empty object unexpectedly
       console.warn("Assembler returned empty or invalid output.");
       this.translations = []; // Clear table
       this.parameter = '';
    }
  }

  // ... other methods like onDeleteInstruction, onTextFile, etc. ...

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

  /**
   * Este método permite agregar una instrucción a la tabla de instrucciones desde el código.
    * 
    * @param instruction - La instrucción que se desea agregar a la tabla. Puede ser una instrucción en formato MIPS o HEX.
    * 
    * Funcionamiento:
    * 1. Establece el valor de la instrucción en el campo de entrada (`inputText`).
    * 2. Detecta automáticamente el tipo de instrucción (MIPS o HEX) utilizando el método `detectInstructionType`.
    * 3. Si la instrucción es diferente a la última seleccionada, actualiza la instrucción seleccionada y
    *    llama al método `onTableValueChange` para agregarla a la tabla.
    * 
    * Este método es útil para programáticamente insertar instrucciones en la tabla sin necesidad de interacción directa del usuario.
    */
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
      this.parameter = '';

      for (let i = 0; i < HEXs.length; i++) {
        const HEX = HEXs[i];
        const MIPS = MIPSs[i];

        if (HEX === '') continue; // Ignorar líneas vacías
        if (MIPS === '') continue; // Ignorar líneas vacías

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

  onInstructionMenuSelect(instruction: string): void {
    this.inputText = instruction; // Establecer el valor en el input
    // Ejecutar cualquier otra lógica necesaria después de seleccionar una instrucción
    this.detectInstructionType(instruction);
  }

  onDeleteInstruction(translation: Translation): void {
    const index = this.translations.indexOf(translation);
    if (index !== -1) {
      this.translations.splice(index, 1);
    }

    this.parameter = this.translations.map(t => t.hex).join('\n');
  }
}

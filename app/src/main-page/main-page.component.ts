import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { SwitchComponent } from './switch/switch.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { InstructionMenuComponent } from './instruction-menu/instruction-menu.component';
import { ControlStackComponent } from './control-stack/control-stack.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';
import { AssemblyParserService, ParseResult } from '../Shared/Services/AssemblyParser/assembly-parser.service';

interface Translation {
  mips: string;
  hex: string;
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    TextboxComponent,
    TranslateButtonComponent,
    SwitchComponent,
    RamdropComponent,
    SaveRamButtonComponent,
    InstructionTableComponent,
    InstructionMenuComponent,
    ControlStackComponent,
    FormsModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})

export class MainPageComponent {
  inputText: string = '';
  output: string = '';
  parameter: string = '';
  isHexToMIPS: boolean = false;
  selectedInstruction: string = '';
  isValidInstruction: boolean = true;
  translations: Translation[] = [];
  parsingErrors: string[] = [];
  
  
  private editingStackIndex: number = -1;
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  tableManager = inject(TableInstructionService);
  private assemblyParser = inject(AssemblyParserService);

  detectInstructionType(input: string): void {
    const isHEX = /^[0-9a-fA-F]{8}$/.test(input.trim());
    const isMIPS = !isHEX;

    if (isHEX) {
      this.isHexToMIPS = true;
      this.isValidInstruction = this.translator.isValidHex(input);
    } else {
      this.isHexToMIPS = false;
      this.isValidInstruction = this.translator.isValidMIPS(input);
    }
    if (!this.translator.isValidHex(input) && !this.translator.isValidMIPS(input)){
        this.isValidInstruction = false;
    }
  }

  onTableValueChange(value: string): void {
    this.tableManager.updateSelectedLineText(value);
  }

  onToggle(isChecked: boolean): void {
    this.isHexToMIPS = isChecked;
  }

  // mod: Ahora se recibe el índice exacto del stack
  onInstructionClick(clickedIndex: number): void {
    if (clickedIndex < 0 || clickedIndex >= this.translations.length) {
      console.error(`Índice fuera de rango: ${clickedIndex}`);
      return;
    }

    // mod: Establecer el modo de edición con el índice exacto
    this.editingStackIndex = clickedIndex;
    const translation = this.translations[clickedIndex];
    const instruction = this.isHexToMIPS ? translation.hex : translation.mips;
    
    this.inputManager.setValue(instruction);
    this.detectInstructionType(instruction);
    this.inputText = instruction;
    
    if (instruction !== this.selectedInstruction) {
      this.selectedInstruction = instruction;
      this.onTableValueChange(instruction);
    }
  }

  onInput(input: string): void {
    this.isValidInstruction = true;
    this.inputText = input;
    this.detectInstructionType(input);
    
    // Si no estamos editando un elemento del stack, resetear el índice
    if (this.editingStackIndex === -1) {
      return;
    }
    
    // Si el input se vacía o cambia significativamente, cancelar la edición
    if (!input.trim()) {
      this.editingStackIndex = -1;
      return;
    }
  }

  onTextFile(textFile: Promise<string[]>): void {
    // Resetear modo de edición al cargar archivo
    this.editingStackIndex = -1;
    
    textFile.then((instructions) => {
      const HEXs = instructions[0].split('\n');
      const MIPSs = instructions[1].split('\n');
      this.translations = [];
      this.parameter = '';
      for (let i = 0; i < Math.min(HEXs.length, MIPSs.length); i++) {
        const HEX = HEXs[i].trim();
        const MIPS = MIPSs[i].trim();
        if (HEX === '' || MIPS === '') continue;
        this.translations.push({ mips: MIPS, hex: HEX });
        this.parameter += HEX + '\n';
      }
    });
  }

  onTranslate(): void {
    let MIPS = '';
    let HEX = '';
    this.detectInstructionType(this.inputText);
    
    if (this.inputText === '' || !this.isValidInstruction ) {
        alert("Instrucción inválida o vacía.");
        return;
    }

    try {
        if (this.isHexToMIPS) {
          MIPS = this.translator.translateHextoMIPS(this.inputText);
          HEX = this.inputText.startsWith("0x") ? this.inputText.substring(2).toUpperCase() : this.inputText.toUpperCase();
          HEX = HEX.padStart(8, '0');
          if (MIPS.includes("Unknown") || MIPS.includes("Invalid")) throw new Error(MIPS);
        } else {
          HEX = this.translator.translateMIPStoHex(this.inputText);
          MIPS = this.inputText;
          if (HEX.includes("Unknown") || HEX.includes("Invalid") || HEX.includes("Missing")) throw new Error(HEX);
        }
        
        const newTranslation = { mips: MIPS, hex: HEX };
        
        // Verificar si estamos editando un elemento existente usando el índice exacto
        if (this.editingStackIndex >= 0 && this.editingStackIndex < this.translations.length) {
          // Actualizar el elemento existente en el índice exacto
          this.translations[this.editingStackIndex] = newTranslation;
          
          // Actualizar la tabla con la nueva instrucción
          this.updateTableAfterStackEdit(newTranslation);
        } else {
          // Agregar nuevo elemento
          this.translations.push(newTranslation);
          
          // Actualizar la tabla con la nueva instrucción
          this.tableManager.updateSelectedLineText(this.inputText);
        }
        
        // Resetear el modo de edición
        this.editingStackIndex = -1;
        
        // Actualizar el parámetro
        this.parameter = this.translations.map(t => t.hex).join('\n');
        
    } catch(e: any) {
        alert(`Error de traducción: ${e.message}`);
    }
  }

  private updateTableAfterStackEdit(translation: Translation): void {
    // Actualizar la tabla con la instrucción modificada
    // Dependiendo de la dirección de traducción, usar MIPS o HEX
    const instructionToShow = this.isHexToMIPS ? translation.hex : translation.mips;
    this.tableManager.updateSelectedLineText(instructionToShow);
    
    // También actualizar el selectedInstruction para mantener consistencia
    this.selectedInstruction = instructionToShow;
  }

  loadMipsCode(assemblyCode: string): void {
    // Resetear modo de edición al cargar código ensamblador
    this.editingStackIndex = -1;
    this.parsingErrors = [];

    if (!assemblyCode || assemblyCode.trim() === '') {
        this.parsingErrors = ["Por favor, ingresa código ensamblador en el área de texto."];
        return;
    }

    try {
      const result: ParseResult = this.assemblyParser.parseAssembly(assemblyCode);

      if (result.errors && result.errors.length > 0) {
        console.error("Errores encontrados durante el parseo:", result.errors);
        this.parsingErrors = result.errors;
        return;
      }

      const newTranslations: Translation[] = [];
      let translationErrors: string[] = [];

      for (let i = 0; i < result.instructions.length; i++) {
          const mipsInstruction = result.instructions[i];
          try {
              const hexInstruction = this.translator.translateMIPStoHex(mipsInstruction);

              if (hexInstruction.includes("Unknown") || hexInstruction.includes("Invalid") || hexInstruction.includes("Missing") || hexInstruction.includes("Unsupported") || hexInstruction.includes("Error")) {
                  translationErrors.push(`Línea ${i + 1} ('${mipsInstruction}'): ${hexInstruction}`);
              } else {
                  newTranslations.push({ mips: mipsInstruction, hex: hexInstruction });
              }
          } catch (e: any) {
              translationErrors.push(`Línea ${i + 1} ('${mipsInstruction}'): Error interno de traducción - ${e.message}`);
          }
      }

      if (translationErrors.length > 0) {
          this.parsingErrors = ["Errores durante la traducción MIPS a HEX:", ...translationErrors];
          console.error("Errores durante la traducción MIPS a HEX:", translationErrors);
      } else {
          this.translations = newTranslations;
          this.parameter = this.translations.map(t => t.hex).join('\n');
          console.log("Instrucciones cargadas en la lista 'translations':", this.translations);
          alert(`¡${this.translations.length} instrucciones cargadas exitosamente en la pila de control!`);
      }

    } catch (error: any) {
      console.error("Error inesperado durante el parseo:", error);
      this.parsingErrors = [`Error inesperado al procesar: ${error.message || 'Error desconocido'}`];
    }
  }

  onInstructionMenuSelect(event: {instruction: string, shouldTranslate: boolean}): void {
    // Resetear modo de edición al seleccionar del menú
    this.editingStackIndex = -1;
    
    this.inputManager.setValue(event.instruction);
    this.inputText = event.instruction;
    this.detectInstructionType(event.instruction);
    
    // Force table update
    this.tableManager.updateSelectedLineText(event.instruction);
  }

  //Ahora recibe el índice exacto
  onDeleteInstruction(indexToDelete: number): void {
    if (indexToDelete < 0 || indexToDelete >= this.translations.length) {
      console.error(`Índice de eliminación fuera de rango: ${indexToDelete}`);
      return;
    }

    const deletedTranslation = this.translations[indexToDelete];
    this.translations.splice(indexToDelete, 1);
    this.parameter = this.translations.map(t => t.hex).join('\n');
    
    // Si estábamos editando el elemento eliminado, resetear el modo de edición y limpiar la tabla
    if (this.editingStackIndex === indexToDelete) {
      this.editingStackIndex = -1;
      this.inputText = '';
      this.inputManager.setValue('');
      this.selectedInstruction = '';
      this.tableManager.updateSelectedLineText(''); // Limpiar la tabla
    } else if (this.editingStackIndex > indexToDelete) {
      // Ajustar el índice si el elemento eliminado estaba antes del que estamos editando
      this.editingStackIndex--;
    }
  }

  //Manejar reordenamiento del stack
  onReorderInstructions(reorderedTranslations: Translation[]): void {
    // Si estamos editando un elemento, necesitamos actualizar el índice
    if (this.editingStackIndex >= 0) {
      const editingTranslation = this.translations[this.editingStackIndex];
      // Encontrar el nuevo índice del elemento que estábamos editando
      this.editingStackIndex = reorderedTranslations.findIndex(t => 
        t.mips === editingTranslation.mips && t.hex === editingTranslation.hex
      );
      console.log(`Elemento en edición movido al nuevo índice: ${this.editingStackIndex}`);
    }
    
    this.translations = reorderedTranslations;
    this.parameter = this.translations.map(t => t.hex).join('\n');
  }

  //verificar si estamos en modo de edición 
  isEditingStackItem(): boolean {
    return this.editingStackIndex >= 0;
  }

  //para obtener el índice del elemento siendo editado 
  getEditingIndex(): number {
    return this.editingStackIndex;
  }
}
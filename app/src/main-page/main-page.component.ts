import { Component, inject } from '@angular/core';
import { TextboxComponent } from './textbox/textbox.component';
import { CommonModule } from '@angular/common';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';
import { InstructionMenuComponent } from './instruction-menu/instruction-menu.component';
import { ControlStackComponent } from './control-stack/control-stack.component';
import { FormsModule } from '@angular/forms';

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
    FormsModule,
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
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  isHexToMIPS: boolean = false;
  tableManager = inject(TableInstructionService);
  selectedInstruction: string = '';
  isValidInstruction: boolean = true;
  translations: Translation[] = [];
  assemblerCode: string = '';

  onUploadAssemblerCode(): void {
    if (!this.assemblerCode) return;

    const lines = this.assemblerCode
      .split('\n')
      .map(line => line.split('#')[0].replace(/\s+/g, ' ').replace(/,/g, '').trim())
      .filter(line => line !== '');

    console.log(lines);

    for (let line of lines) {
      // 👉 Convertir formato tradicional (ej: lw $t1, 0x01($t2)) a personalizado (lw $t1 0x01 $t2)
      const traditionalRegex = /^(\w+)\s+(\$\w+),\s*([\w\d]+)\((\$\w+)\)$/;
      const match = traditionalRegex.exec(line);
      if (match) {
        const [, instr, rt, imm, rs] = match;
        line = `${instr} ${rt} ${imm} ${rs}`;
      }

      const isHex = this.translator.isValidHex(line);
      const isMIPS = this.translator.isValidMIPS(line);

      if (!isHex && !isMIPS) continue;

      try {
        const MIPS = isHex ? this.translator.translateHextoMIPS(line) : line;
        const HEX = isMIPS ? this.translator.translateMIPStoHex(line) : line;

        this.translations.push({
          mips: MIPS,
          hex: HEX
        });

        this.parameter += HEX + '\n';
      } catch (error) {
        console.error(`Error al traducir línea: "${line}"`, error);
      }
    }
  }

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

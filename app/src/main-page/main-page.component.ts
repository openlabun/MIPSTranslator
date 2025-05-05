import { Component, inject } from '@angular/core';
import { TextboxComponent } from './textbox/textbox.component';
import { CommonModule } from '@angular/common';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
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
  uploadErrors: string[] = [];

  onUploadAssemblerCode(): void {
    if (!this.assemblerCode) return;

    this.uploadErrors = [];
    this.translations = [];
    this.parameter = '';

    const originalLines = this.assemblerCode.split('\n');

    for (let i = 0; i < originalLines.length; i++) {
      let originalLine = originalLines[i];
      let line = originalLine.split('#')[0].trim();
      if (line === '') continue;

      if (/^\w+:$/.test(line)) continue;

      const traditionalRegex = /^(\w+)\s+(\$\w+),\s*(0x[0-9a-fA-F]+|\-?\d+)\((\$\w+)\)$/;
      const match = traditionalRegex.exec(line);
      if (match) {
        const [, instr, rt, imm, rs] = match;
        line = `${instr} ${rt} ${imm} ${rs}`;
      } else {
        line = line.replace(/,/g, '').replace(/\s+/g, ' ').trim();
      }

      const isHex = this.translator.isValidHex(line);
      const isMIPS = this.translator.isValidMIPS(line);
      const isMalformed = !this.isWellFormedInstruction(line);

      if ((!isHex && !isMIPS) || isMalformed) {
        this.uploadErrors.push(`Línea ${i + 1}: "${originalLine}" no tiene el formato correcto o usa registros inválidos.`);
        continue;
      }

      try {
        const MIPS = isHex ? this.translator.translateHextoMIPS(line) : line;
        const HEX = isMIPS ? this.translator.translateMIPStoHex(line) : line;

        this.translations.push({ mips: MIPS, hex: HEX });
        this.parameter += HEX + '\n';
      } catch (error) {
        console.error(`Error al traducir línea: "${line}"`, error);
        this.uploadErrors.push(`Línea ${i + 1}: error al traducir "${originalLine}".`);
      }
    }
  }

  onTableValueChange(value: string): void {
    this.tableManager.updateSelectedLineText(value);

  }

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
      this.onTableValueChange(output);
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

        if (HEX === '') continue;
        if (MIPS === '') continue;

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

    this.translations.push({
      mips: MIPS,
      hex: HEX
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
    this.inputText = instruction;
    this.detectInstructionType(instruction);
  }

  onDeleteInstruction(translation: Translation): void {
    const index = this.translations.indexOf(translation);
    if (index !== -1) {
      this.translations.splice(index, 1);
    }

    this.parameter = this.translations.map(t => t.hex).join('\n');
  }

  private isValidRegister(register: string): boolean {
    return /^\$\w+$/.test(register);
  }

  private isWellFormedInstruction(instruction: string): boolean {
    const tokens = instruction.trim().replace(',', '').split(/\s+/);
    const mnemonic = tokens[0].toLowerCase();
    console.log('mne' + mnemonic);

    const operands = tokens.slice(1);

    const isRegister = (reg: string) => /^\$\w+$/.test(reg);
    const isImmediate = (imm: string) => /^-?\d+$/.test(imm) || /^0x[0-9a-fA-F]+$/.test(imm);
    const isLabelOrAddress = (op: string) => /^[\w\d_]+$/.test(op);

    // Validación especial para instrucciones R tipo 'trap code'
    const trapInstructions = ['teq', 'tge', 'tgeu', 'tlt', 'tltu', 'tne'];
    if (trapInstructions.includes(mnemonic)) {
      return (
        operands.length === 3 &&
        this.isValidRegister(operands[0]) &&
        this.isValidRegister(operands[1]) &&
        /^-?\d+$/.test(operands[2])
      );
    }

    const threeReg = ['add', 'sub', 'and', 'or', 'slt', 'xor', 'addu', 'subu', 'nor', 'sllv', 'srav', 'srlv'];
    if (threeReg.includes(mnemonic)) {
      return operands.length === 3 && operands.every(isRegister);
    }

    const twoReg = ['div', 'divu', 'mult', 'multu', 'teq', 'tge', 'tgeu', 'tlt', 'tltu', 'tne'];
    if (twoReg.includes(mnemonic)) {
      return operands.length === 2 && operands.every(isRegister);
    }

    const oneReg = ['mfhi', 'mflo', 'mthi', 'mtlo', 'jr'];
    if (oneReg.includes(mnemonic)) {
      return operands.length === 1 && isRegister(operands[0]);
    }

    if (mnemonic === 'jalr') {
      return (operands.length === 1 || operands.length === 2) && operands.every(isRegister);
    }

    const shiftOps = ['sll', 'sra', 'srl'];
    if (shiftOps.includes(mnemonic)) {
      return (
        operands.length === 3 &&
        isRegister(operands[0]) &&
        isRegister(operands[1]) &&
        isImmediate(operands[2])
      );
    }

    const iTypeImmediate = ['addi', 'addiu', 'andi', 'ori', 'xori'];
    if (iTypeImmediate.includes(mnemonic)) {
      return operands.length === 3 && isRegister(operands[0]) && isRegister(operands[1]) && isImmediate(operands[2]);
    }

    const iTypeBranch = ['beq', 'bne'];
    if (iTypeBranch.includes(mnemonic)) {
      return operands.length === 3 && isRegister(operands[0]) && isRegister(operands[1]) && isLabelOrAddress(operands[2]);
    }

    const iTypeOneRegAndLabel = ['bgtz', 'blez'];
    if (iTypeOneRegAndLabel.includes(mnemonic)) {
      return operands.length === 2 && isRegister(operands[0]) && isLabelOrAddress(operands[1]);
    }

    const memoryAccess = ['lw', 'sw', 'lb', 'lbu', 'lh', 'lhu', 'sb', 'sh'];
    if (memoryAccess.includes(mnemonic)) {
      if (operands.length === 3) {
        return isRegister(operands[0]) && isImmediate(operands[1]) && isRegister(operands[2]);
      }
      // Soporte para formato offset(base) (lw $t1, 4($t2))
      if (operands.length === 2 && isRegister(operands[0])) {
        const match = operands[1].match(/^(-?\d+)\((\$\w+)\)$/);
        return match !== null;
      }
      return false;
    }

    const jumpInstructions = ['j', 'jal'];
    if (jumpInstructions.includes(mnemonic)) {
      return operands.length === 1 && isLabelOrAddress(operands[0]);
    }

    return false;
  }

}

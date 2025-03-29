import { Component, inject } from '@angular/core';
import {
  ListViewComponent,
  SelectionChangedEvent,
} from '../list-view/list-view.component';
import { DecodedInstruction } from '../Shared/lib/mips/instruction';
import { parsePartialInstruction } from '../Shared/lib/mips/parse';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { SwitchComponent } from './switch/switch.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    ListViewComponent,
    TextboxComponent,
    TranslateButtonComponent,
    SwitchComponent,
    TexboxOutputComponent,
    RamdropComponent,
    SaveRamButtonComponent,
    InstructionTableComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent {
  private inputTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly instructions: Partial<DecodedInstruction>[] = [];

  inputText: string = '';
  output: string = '';
  parameter: string = '';
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  isHexToMIPS: boolean = false;
  tableManager = inject(TableInstructionService);

  private processCommit(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const val = target.value.trim();
    const input = val.split('\n');

    this.instructions.splice(0, this.instructions.length);
    for (const inst of input) {
      const trimmed = inst.trim();
      if (trimmed) {
        const decoded = parsePartialInstruction(trimmed);
        this.instructions.push(decoded);
      }
    }
  }

  onInputUpdated(event: Event) {
    // Delay processing for the instruction pile...
    if (this.inputTimeout != null) {
      clearTimeout(this.inputTimeout);
    }
    this.inputTimeout = setTimeout(() => this.processCommit(event), 600);

    // ... and immediately process suggestions (TODO)
  }

  onInstructionSelected(args: SelectionChangedEvent) {
    console.log(args.selectedItem);
  }

  toAsm(instruction: Partial<DecodedInstruction>) {
    return this.translator.toAsm(instruction as DecodedInstruction);
  }

  toHex(instruction: Partial<DecodedInstruction>) {
    return this.translator.toHex(instruction as DecodedInstruction);
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

  onInput(input: string): void {
    this.inputText = input;
  }
  onTextFile(textFile: Promise<string[]>): void {
    textFile.then((instructions) => {
      if (this.isHexToMIPS) {
        this.inputManager.setValue(instructions[0]);
        this.output = instructions[1];
      } else {
        this.output = instructions[0];
        this.inputManager.setValue(instructions[1]);
      }
    });
  }
  onTranslate(): void {
    if (this.isHexToMIPS) {
      this.output = this.translator.translateHextoMIPS(this.inputText);
      this.parameter = this.inputText;
    } else {
      this.output = this.translator.translateMIPStoHex(this.inputText);
      this.parameter = this.output;
    }
  }
}

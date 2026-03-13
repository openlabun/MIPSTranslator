import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TranslatorService,
  MipsVersion,
  Instruction,
} from '../../Shared/Services/Translator/translator.service';

@Component({
  selector: 'app-instruction-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instruction-menu.component.html',
  styleUrls: ['./instruction-menu.component.css'],
})
export class InstructionMenuComponent {
  translatorService = inject(TranslatorService);

  @Output() instructionSelected = new EventEmitter<{
    instruction: string;
    shouldTranslate: boolean;
    instructionType?: string;
  }>();

  objectKeys = Object.keys;

  filterText: string = '';

  // Obtener instrucciones dinámicamente según la versión actual
  get instructions(): Instruction[] {
    return this.translatorService.getInstructions();
  }

  // Obtener versión actual
  get currentVersion(): MipsVersion {
    return this.translatorService.getVersion();
  }

  // Cambiar versión
  setVersion(version: MipsVersion): void {
    this.translatorService.setVersion(version);
  }

  getCategories(): string[] {
    return [...new Set(this.instructions.map((inst) => inst.type))];
  }

  getFilteredInstructions(category: string): Instruction[] {
    const filteredByCategory = this.instructions.filter(
      (inst) => inst.type === category[0],
    ); // "R", "I", "J"

    if (!this.filterText.trim()) return filteredByCategory;

    const lowerFilter = this.filterText.toLowerCase();
    return filteredByCategory.filter(
      (inst) =>
        inst.mnemonic.toLowerCase().includes(lowerFilter) ||
        inst.description.toLowerCase().includes(lowerFilter) ||
        inst.version.toLowerCase().includes(lowerFilter),
    );
  }

  getDescription(instMnemonic: string): string {
    const inst = this.instructions.find((i) => i.mnemonic === instMnemonic);
    return inst ? inst.description : '';
  }

  selectInstruction(inst: Instruction): void {
    this.instructionSelected.emit({
      instruction: inst.example || inst.mnemonic,
      shouldTranslate: true,
      instructionType: inst.type,
    });
  }

  // Contador de instrucciones por categoría
  getCategoryCount(category: string): number {
    return this.getFilteredInstructions(category).length;
  }

  // Obtener nombre legible de la versión
  getVersionLabel(version: MipsVersion): string {
    return version === 'r6' ? 'MIPS Release 6' : 'MIPS Legacy (I/II)';
  }
}

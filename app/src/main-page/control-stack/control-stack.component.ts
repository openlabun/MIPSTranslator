import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Translation {
  mips: string;
  hex: string;
}

@Component({
  selector: 'app-control-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-stack.component.html',
  styleUrls: ['./control-stack.component.css']
})
export class ControlStackComponent {
  @Input() translations: Translation[] = [];
  @Output() instructionClick = new EventEmitter<string>();
  @Output() deleteInstruction = new EventEmitter<Translation>();

  onInstructionClick(instruction: string): void {
    this.instructionClick.emit(instruction);
  }

  onDeleteInstruction(translation: Translation): void {
    const index = this.translations.indexOf(translation);
    if (index !== -1) {
      this.translations.splice(index, 1);
    }
    this.deleteInstruction.emit(translation);
  }
}

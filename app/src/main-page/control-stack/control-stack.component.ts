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
  @Output() instructionClick = new EventEmitter<number>();
  @Output() deleteInstruction = new EventEmitter<number>();
  @Output() reorderInstructions = new EventEmitter<Translation[]>();

  // mod: Ahora emite el índice exacto
  onInstructionClick(index: number): void {
    console.log(`Click en instrucción del stack, índice: ${index}`);
    this.instructionClick.emit(index);
  }

  // mod: Ahora emite el índice exacto
  onDeleteInstruction(index: number): void {
    console.log(`Solicitud de eliminación, índice: ${index}`);
    this.deleteInstruction.emit(index);
  }

  moveUp(index: number): void {
    if (index > 0) {
      // Intercambiamos el elemento con el anterior
      const temp = this.translations[index];
      this.translations[index] = this.translations[index - 1];
      this.translations[index - 1] = temp;
      
      // Emitimos el nuevo orden
      this.reorderInstructions.emit([...this.translations]);
    }
  }

  moveDown(index: number): void {
    if (index < this.translations.length - 1) {
      // Intercambiamos el elemento con el siguiente
      const temp = this.translations[index];
      this.translations[index] = this.translations[index + 1];
      this.translations[index + 1] = temp;
      
      // Emitimos el nuevo orden
      this.reorderInstructions.emit([...this.translations]);
    }
  }

  //comprueba si se puede hacer el movimiento.
  canMoveUp(index: number): boolean {
    return index > 0;
  }

  canMoveDown(index: number): boolean {
    return index < this.translations.length - 1;
  }
}
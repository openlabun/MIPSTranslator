import { Component, inject, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Importar CommonModule para NgIf y NgFor
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [
    ReactiveFormsModule,  // Para formularios reactivos
    CommonModule  // Para usar NgIf, NgFor y otras directivas comunes
  ],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.css'],  // corregido a styleUrls
})
export class TextboxComponent {
  inputChange = output<string>();
  userInput = inject(FormInputManagerService).inputApp;
  selectedLineText = output<string>();

  options: string[] = ['add s1 s2 s3', 'add t0 t1 t2', 'add t1 t2 t3', 'addi s1 s2 15', 'addi t0 t1 5', 'addi t1 t2 10', 'addiu s1 s2 15', 'addiu t0 t1 5', 'addiu t1 t2 10', 'addu s1 s2 s3', 'addu t0 t1 t2', 'addu t1 t2 t3', 'and s1 s2 s3', 'and t0 t1 t2', 'and t1 t2 t3', 'andi s1 s2 15', 'andi t0 t1 5', 'andi t1 t2 10', 'beq s1 s2 etiqueta', 'beq t0 t1 etiqueta', 'beq t1 t2 etiqueta', 'bgtz s1 etiqueta', 'bgtz t0 etiqueta', 'bgtz t1 etiqueta', 'blez s1 etiqueta', 'blez t0 etiqueta', 'blez t1 etiqueta', 'bne s1 s2 etiqueta', 'bne t0 t1 etiqueta', 'bne t1 t2 etiqueta', 'div s1 s2', 'div t0 t1', 'div t1 t2', 'divu s1 s2', 'divu t0 t1', 'divu t1 t2', 'j etiqueta1', 'j etiqueta2', 'j etiqueta3', 'jal etiqueta1', 'jal etiqueta2', 'jal etiqueta3', 'jalr s1', 'jalr t0', 'jalr t1', 'jr ra', 'jr s1', 'jr t1', 'lb s1 8(s2)', 'lb t0 4(t1)', 'lb t1 0(t2)', 'lbu s1 8(s2)', 'lbu t0 4(t1)', 'lbu t1 0(t2)', 'lh s1 8(s2)', 'lh t0 4(t1)', 'lh t1 0(t2)', 'lhu s1 8(s2)', 'lhu t0 4(t1)', 'lhu t1 0(t2)', 'lw s1 8(s2)', 'lw t0 4(t1)', 'lw t1 0(t2)', 'mfhi s1', 'mfhi t0', 'mfhi t1', 'mflo s1', 'mflo t0', 'mflo t1', 'mthi s1', 'mthi t0', 'mthi t1', 'mtlo s1', 'mtlo t0', 'mtlo t1', 'mult s1 s2', 'mult t0 t1', 'mult t1 t2', 'multu s1 s2', 'multu t0 t1', 'multu t1 t2', 'nor s1 s2 s3', 'nor t0 t1 t2', 'nor t1 t2 t3', 'or s1 s2 s3', 'or t0 t1 t2', 'or t1 t2 t3', 'sb s1 8(s2)', 'sb t0 4(t1)', 'sb t1 0(t2)', 'sh s1 8(s2)', 'sh t0 4(t1)', 'sh t1 0(t2)', 'sll s1 s2 3', 'sll t0 t1 4', 'sll t1 t2 2', 'sllv s1 s2 s3', 'sllv t0 t1 t2', 'sllv t1 t2 t3', 'slt s1 s2 s3', 'slt t0 t1 t2', 'slt t1 t2 t3', 'slti s1 s2 15', 'slti t0 t1 5', 'slti t1 t2 10', 'sltiu s1 s2 15', 'sltiu t0 t1 5', 'sltiu t1 t2 10', 'sltu s1 s2 s3', 'sltu t0 t1 t2', 'sltu t1 t2 t3', 'sra s1 s2 4', 'sra t0 t1 3', 'sra t1 t2 2', 'srav s1 s2 s3', 'srav t0 t1 t2', 'srav t1 t2 t3', 'srl s1 s2 4', 'srl t0 t1 3', 'srl t1 t2 2', 'srlv s1 s2 s3', 'srlv t0 t1 t2', 'srlv t1 t2 t3', 'sub s1 s2 s3', 'sub t0 t1 t2', 'sub t1 t2 t3', 'subu s1 s2 s3', 'subu t0 t1 t2', 'subu t1 t2 t3', 'sw s1 8(s2)', 'sw t0 4(t1)', 'sw t1 0(t2)', 'trap 1', 'trap 10', 'trap 5', 'xor s1 s2 s3', 'xor t0 t1 t2', 'xor t1 t2 t3', 'xori s1 s2 15', 'xori t0 t1 5', 'xori t1 t2 10'];
  suggestions: string[] = [];
  currentLineIndex: number = 0;

  constructor() {
    this.userInput.valueChanges.subscribe((value: string | null) => {
      if (value !== null) {
        this.inputChange.emit(value);
      }
    });
  }

  onSelect(event: Event, show: Boolean = false): void {
    const textarea = event.target as HTMLTextAreaElement;
    const text = textarea.value;

    // Obtener los índices de la selección
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Dividir el texto en líneas
    const lines = text.split('\n');
    let charCount = 0;

    // Iterar por cada línea y encontrar cuál contiene el texto seleccionado
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLength = line.length + 1;

      if (selectionStart >= charCount && selectionStart < charCount + lineLength) {
        this.currentLineIndex = i;
        // Verifica si la selección está en una sola línea
        if (selectionEnd <= charCount + lineLength) {
          this.selectedLineText.emit(line);
          if (show) {
            this.filterOptions(line);
          }
        } else {
          this.selectedLineText.emit(""); // Selección cruza varias líneas
          this.suggestions = [];
        }
        break;
      }

      charCount += lineLength;
    }
  }

  filterOptions(currentLine: string): void {
    if (currentLine) {
      this.suggestions = this.options.filter(option =>
        option.toLowerCase().includes(currentLine.toLowerCase()) && option.toLowerCase() != currentLine.toLowerCase()
      );
    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: string): void {
    const input = this.userInput.value || '';
    const lines = input.split('\n');
    lines[this.currentLineIndex] = suggestion;
    this.userInput.setValue(lines.join('\n'));
    this.suggestions = [];
  }
}

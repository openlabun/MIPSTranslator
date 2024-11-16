import { Component, inject, output} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { AssistantService } from '../../Shared/Services/Assistant/assistant.service';
import { AssistantComponent } from './assistant/assistant.component';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [ReactiveFormsModule, AssistantComponent],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.css',
})
export class TextboxComponent {
  inputChange = output<string>();
  userInput = inject(FormInputManagerService).inputApp;
  assistantService = inject(AssistantService);
  selectedLineText = output<string>();
  constructor() {
    this.userInput.valueChanges.subscribe((value: string | null) => {
      if (value !== null) {
        this.inputChange.emit(value); 
      }
    });
  }
  

  onSelect(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const text = textarea.value;

    // Obtener los índices de la selección
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Dividir el texto en líneas
    const lines = text.split('\n');

    let charCount = 0;

    // Iterar por cada línea y encontrar cuál contiene el texto seleccionado
    for (const line of lines) {
      const lineLength = line.length + 1; // +1 por el salto de línea (\n)

      if (
        selectionStart >= charCount && 
        selectionStart < charCount + lineLength
      ) {
        // Verifica si la selección está en una sola línea
        if (selectionEnd <= charCount + lineLength) {
          this.selectedLineText.emit(line);
        } else {
          this.selectedLineText.emit(""); // Selección cruza varias líneas
        }
        break;
      }
      
      charCount += lineLength;
      
    }
    
  }

 
}

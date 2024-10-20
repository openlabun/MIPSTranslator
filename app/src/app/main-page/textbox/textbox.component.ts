import { Component, inject, output} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { AssistantService } from '../../Shared/Services/Assistant/assistant.service';
//import { AssistantComponent } from './assistant/assistant.component';


@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.css',
})
export class TextboxComponent {
  inputChange = output<string>();
  userInput = inject(FormInputManagerService).inputApp;
  assistantService = inject(AssistantService);
  selectedLineText = output<string>();
  suggestions: string[] = [];
  instructions: string[] = ['add', 'addi', 'sub', 'and', 'or', 'load', 'store', 'beq', 'bne', 'j'];
  constructor() {
    this.userInput.valueChanges.subscribe((value: string | null) => {
      console.log("User input:", value);  // Verifica si se detecta el valor
      if (value !== null && value.length > 0) {
        this.suggestions = this.instructions.filter(instr =>
          instr.startsWith(value.toLowerCase())
        );
      } else {
        this.suggestions = [];
      }
      this.inputChange.emit(value || '');
    });
    
  }
  
  

  onSelectSuggestion(suggestion: string): void {
    this.userInput.setValue(suggestion); // Autocompletar
    this.suggestions = [];
  }

  onSelect(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const text = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    const lines = text.split('\n');
    let charCount = 0;

    for (const line of lines) {
      const lineLength = line.length + 1;
      if (selectionStart >= charCount && selectionStart < charCount + lineLength) {
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


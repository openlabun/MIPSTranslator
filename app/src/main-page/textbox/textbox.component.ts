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

  texto(word: String): void {
    this.userInput.setValue(word);
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
          this.selectedLineText.emit("");
        }
        break;
      }

      charCount += lineLength;
    }
  }
}

import { Component, inject, output} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';

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

  constructor() {
    this.userInput.valueChanges.subscribe((value: string | null) => {
      if (value !== null) {
        this.inputChange.emit(value); 
      }
    });
  }

 
}

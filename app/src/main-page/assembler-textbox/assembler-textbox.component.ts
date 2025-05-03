import { Component, inject, Output, EventEmitter} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';

@Component({
  selector: 'app-assembler-textbox',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './assembler-textbox.component.html',
  styleUrl: './assembler-textbox.component.css',
})
export class assemblerTextboxComponent {
    
    @Output() assemblerInputChange = new EventEmitter<string>();
    assemblerUserInput = inject(FormInputManagerService).assemblerInputApp;

    constructor() {
    this.assemblerUserInput.valueChanges.subscribe((value: string | null) => {
      if (value !== null) {
        this.assemblerInputChange.emit(value); 
      }
    });
  }
}

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-autocomplete-textbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autocomplete-textbox.component.html',
  styleUrls: ['./autocomplete-textbox.component.css']
})
export class AutocompleteTextboxComponent {
  @Output() inputChange = new EventEmitter<string>();
  userInput = '';
  suggestions: string[] = [];
  instructions: string[] = ['add', 'addi', 'sub', 'and', 'or', 'load', 'store', 'beq', 'bne', 'j'];

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.userInput = value;
    this.suggestions = this.instructions.filter(instr =>
      instr.startsWith(this.userInput.toLowerCase())
    );
    this.inputChange.emit(value);
  }
}

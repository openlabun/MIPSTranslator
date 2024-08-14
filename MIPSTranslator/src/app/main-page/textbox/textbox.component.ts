import { Component, EventEmitter, output, Output } from '@angular/core';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.css'
})
export class TextboxComponent {
  inputChange = output<string>();

  onInput(event: Event): void {
    const inputText = (event.target as HTMLTextAreaElement).value;
    this.inputChange.emit(inputText);
  }
}

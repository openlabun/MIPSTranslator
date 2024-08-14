import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.css'
})
export class TextboxComponent {
  @Output() inputChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const inputText = (event.target as HTMLTextAreaElement).value;
    this.inputChange.emit(inputText);
  }
}

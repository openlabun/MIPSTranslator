import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-textbox-output',
  standalone: true,
  imports: [],
  templateUrl: './textbox-output.component.html',
  styleUrl: './textbox-output.component.css'
})
export class TextboxOutputComponent {
  @Input() outputText: string = '';
}

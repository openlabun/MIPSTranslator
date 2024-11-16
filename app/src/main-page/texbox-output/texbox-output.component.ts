import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-texbox-output',
  standalone: true,
  imports: [],
  templateUrl: './texbox-output.component.html',
  styleUrl: './texbox-output.component.css'
})
export class TexboxOutputComponent {
  @Input() outputText: string = '';
}

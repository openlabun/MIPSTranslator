import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-assembler-translate-button',
  standalone: true,
  imports: [],
  templateUrl: './assembler-translate-button.component.html',
  styleUrl: './assembler-translate-button.component.css'
})
export class assemblerTranslateButtonComponent {
  @Output() translateAssemblertoMIPS = new EventEmitter<void>();

  onassemblerToMIPSClick(): void {
    this.translateAssemblertoMIPS.emit();
  }
}
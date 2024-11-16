import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-translate-button',
  standalone: true,
  imports: [],
  templateUrl: './translate-button.component.html',
  styleUrl: './translate-button.component.css'
})
export class TranslateButtonComponent {
  @Output() translateMIPStoHex = new EventEmitter<void>();
  @Output() translateHextoMIPS = new EventEmitter<void>();

  onMIPStoHex(): void {
    this.translateMIPStoHex.emit();
  }

  onHextoMIPS(): void {
    this.translateHextoMIPS.emit();
  }
}

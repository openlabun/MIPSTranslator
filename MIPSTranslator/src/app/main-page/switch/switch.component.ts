import { Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.css'
})
export class SwitchComponent {
  @Output() toggleChange = new EventEmitter<boolean>();

  isHexToMIPS: boolean = true; 

  onToggle(): void {
    this.isHexToMIPS = !this.isHexToMIPS;
    this.toggleChange.emit(this.isHexToMIPS);
  }
}

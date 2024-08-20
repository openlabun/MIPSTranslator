import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ramdrop',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ramdrop.component.html',
  styleUrl: './ramdrop.component.css'
})
export class RamdropComponent {
  file : File | null = null;
  fileForm = new FormControl(null, []);

  constructor() {
    this.fileForm.valueChanges.subscribe((value: File | null) => {
      if (value){
        this.file = value;
      }
      
    });
  }


  getFile(event: Event): void {
    event.preventDefault();
    const inputEvent = (event.target as HTMLInputElement);
    if (inputEvent.files && inputEvent.files.length > 0) {
      this.file = inputEvent.files[0];
      console.log(this.file);
    }

  }
}

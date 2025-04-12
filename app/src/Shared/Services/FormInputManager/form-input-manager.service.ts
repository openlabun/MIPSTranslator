import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormInputManagerService {
  public inputApp = new FormControl();
  public isHexToMips = new FormControl<boolean>(false, [Validators.required]);

  constructor() { 
    this.inputApp.valueChanges.subscribe((value) => {
      console.log('🧠 inputApp fue actualizado con:', value);
      console.trace(); // Esto muestra el origen de la llamada
    });
  }

  setInput(value: string, mostrar: boolean = true): void {
    if (mostrar) {
      this.inputApp.setValue(value);
    }
  }

  resetInput(): void {
    this.inputApp.reset();
  }
}


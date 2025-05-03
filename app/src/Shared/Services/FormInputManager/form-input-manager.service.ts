import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormInputManagerService {
  public inputApp = new FormControl();
  public assemblerInputApp = new FormControl();
  public isHexToMips = new FormControl<boolean>(false, [Validators.required]);
  constructor() { 

  }
}

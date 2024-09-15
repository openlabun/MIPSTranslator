import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormInputManagerService {
  public inputApp = new FormControl();
  constructor() { 

  }
}

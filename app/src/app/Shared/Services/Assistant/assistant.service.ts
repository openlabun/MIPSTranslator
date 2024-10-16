import { Injectable } from '@angular/core';
import { FormInputManagerService } from '../FormInputManager/form-input-manager.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  inputManager = inject(FormInputManagerService);

  private instructions: { [key: string]: string } = {
    "add": "000000", "sub": "000000", "slt": "000000", "and": "000000", "or": "000000",
    "addi": "001000", "lw": "100011", "sw": "101011",
    "beq": "000100", "bne": "000101",
    "bgtz": "000111", "blez": "000110", 
    "j": "000010", "jal": "000011",
    "jr": "000000", "jalr": "000000"
  };

  constructor() {
  }

  getSuggestions(value: string): string[] {
    const lowerValue = value.toLowerCase();
    return Object.keys(this.instructions).filter(instruction => 
      instruction.startsWith(lowerValue)
    );
  }
}
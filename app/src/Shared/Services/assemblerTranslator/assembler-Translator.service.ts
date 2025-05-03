import { Injectable } from '@angular/core';
import { assembleFull } from './assembler-logic';

@Injectable({
  providedIn: 'root'
})
export class AssemblerTranslatorService {
  assembleTranslate(input: string): { [key: string]: string } {
    try {
      const jsonString = assembleFull(input);
      return JSON.parse(jsonString); 
    } catch (error) {
      console.error('Error en ensamblado:', error);
      return { error: 'Error de ensamblado' };
    }
  }
}
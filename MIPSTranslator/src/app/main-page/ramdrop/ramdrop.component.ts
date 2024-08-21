import { Component, inject, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatorService } from '../../Shared/Services/Translator/translator.service';

@Component({
  selector: 'app-ramdrop',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ramdrop.component.html',
  styleUrls: ['./ramdrop.component.css']  // Cambiado styleUrl a styleUrls
})
export class RamdropComponent {
  file: File | null = null;
  fileForm = new FormControl<File | null>(null);
  translator = inject(TranslatorService);
  valueFile = output<Promise<string[]>>();
  constructor() {
    this.fileForm.valueChanges.subscribe((value: File | null) => {
      if (value && value instanceof File) {  // Ensure value is of type File
        this.file = value;
        this.valueFile.emit(this.processFiles(value));
      }
    });
  }

  getFile(event: Event): void {
    event.preventDefault();
    const inputEvent = event.target as HTMLInputElement;
    if (inputEvent.files && inputEvent.files.length > 0) {
      this.file = inputEvent.files[0];
      console.log(this.file);
      this.valueFile.emit(this.processFiles(this.file));  // Process the file once selected
    }
  }

  processFiles(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;

        const lines = fileContent.trim().split('\n');

        if (lines.length < 2) {
          console.error("Invalid file format. Expected at least two lines.");
          reject("Invalid file format. Expected at least two lines.");
          return;
        }

        const instructionsArray = lines[1].trim().split(/\s+/);

        let translatedInstructions = '';
        let originalInstructions = '';

        instructionsArray.forEach(instruction => {
          const translated = this.translator.translateInstructionToMIPS(instruction.trim());
          translatedInstructions += `${translated}\n`;
          originalInstructions += `${instruction.trim()}\n`;
        });
        console.log([originalInstructions, translatedInstructions]);
        resolve([originalInstructions, translatedInstructions]);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);  // Ensure 'file' is a File object
    });
  }
  

 
}

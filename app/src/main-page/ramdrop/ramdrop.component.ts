import { Component, inject, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatorService } from '../../Shared/Services/Translator/translator.service';

@Component({
  selector: 'app-ramdrop',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ramdrop.component.html',
  styleUrls: ['./ramdrop.component.css'],
})
export class RamdropComponent {
  file: File | null = null;
  fileForm = new FormControl<File | null>(null);
  translator = inject(TranslatorService);
  valueFile = output<Promise<string[]>>();

  constructor() {
    this.fileForm.valueChanges.subscribe((value: File | null) => {
      if (value && value instanceof File) {
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
      console.log('📄 Archivo seleccionado:', this.file.name);
      this.valueFile.emit(this.processFiles(this.file));
    }
  }

  processFiles(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;

        console.log('✅ Archivo leído');
        console.log('Contenido completo:\n', fileContent);

        // ✅ USAR translateHextoMIPS que limpia automáticamente
        const originalInstructions =
          this.translator.cleanInstructionText(fileContent);
        const translatedInstructions = this.translator.translateHextoMIPS(
          fileContent,
          true,
        );

        console.log(
          '📋 Instrucciones originales (limpias):\n',
          originalInstructions,
        );
        console.log('🔄 Instrucciones traducidas:\n', translatedInstructions);

        resolve([originalInstructions, translatedInstructions]);
      };

      reader.onerror = (error) => {
        console.error('❌ Error al leer archivo:', error);
        reject(error);
      };

      reader.readAsText(file);
    });
  }
}

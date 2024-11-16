import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-save-ram-button',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './save-ram-button.component.html',
  styleUrl: './save-ram-button.component.css',
})
export class SaveRamButtonComponent {
  hexInput = input<string>('');
  saveHexToFile() {
    
    if (this.hexInput) {
      // Get the value of the inputHex textarea
      const hexInstructions = this.hexInput().trim();

      // Check if hexInstructions is empty
      if (!hexInstructions) {
        console.error('No instructions found in inputHex textarea.');
        return;
      }

      // Split the hexInstructions by newline characters to get individual instructions
      const instructionsArray = hexInstructions.split('\n');

      // Join the instructions with a space to format them on the second line
      const instructionsLine = instructionsArray.join(' ');

      // Create a Blob with the hex instructions and instructions line
      const blob = new Blob(['v2.0 raw\n' + instructionsLine], {
        type: 'text/plain',
      });

      // Create a temporary anchor element to trigger the download
      const anchor = document.createElement('a');
      anchor.download = 'mips_instructions.hex';
      anchor.href = window.URL.createObjectURL(blob);
      anchor.click();
    }
  }
}

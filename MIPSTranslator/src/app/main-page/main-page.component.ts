import { Component, inject } from '@angular/core';
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { SwitchComponent } from './switch/switch.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    TextboxComponent,
    TranslateButtonComponent,
    SwitchComponent,
    TexboxOutputComponent,
    RamdropComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'], 
})
export class MainPageComponent {
  isHexToMIPS: boolean = true;
  inputText: string = '';
  output: string = '';
  private translator = inject(TranslatorService);
  
  // Manejadores de eventos
  onToggle(isChecked: boolean): void {
    this.isHexToMIPS = isChecked;
  }

  onInput(input: string): void {
    this.inputText = input;
    
  }

  onTranslate(): void {
    if (this.isHexToMIPS) {
      this.output = this.translator.translateInstructionToMIPS(this.inputText);
    } else {
      this.output = this.translator.translateInstructionToHex(this.inputText);
    }
  }
}

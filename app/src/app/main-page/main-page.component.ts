import { Component, inject } from '@angular/core';
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { SwitchComponent } from './switch/switch.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';


@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    TextboxComponent,
    TranslateButtonComponent,
    SwitchComponent,
    TexboxOutputComponent,
    RamdropComponent,
    SaveRamButtonComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'], 
})
export class MainPageComponent {
  isHexToMIPS: boolean = true;
  inputText: string = '';
  output: string = '';
  parameter:string = '';
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  // Manejadores de eventos
  onToggle(isChecked: boolean): void {
    this.isHexToMIPS = isChecked;
    let draft = this.inputManager.value;
    this.inputManager.setValue(this.output);
    this.output = draft;

  }

  onInput(input: string): void {
    this.inputText = input;
    
  }
  onTextFile(textFile: Promise<string[]>): void {
    
    textFile.then((instructions) => {
      
      if (this.isHexToMIPS) {
        
        this.inputManager.setValue(instructions[0]) ;
        this.output = instructions[1];
      } else {
        this.output = instructions[0];
        this.inputManager.setValue(instructions[1]) ;
      }
      
    });
  }
  onTranslate(): void {
    if (this.isHexToMIPS) {
      
      this.output = this.translator.translateHextoMIPS(this.inputText);
      this.parameter = this.inputText;
    } else {
      this.output = this.translator.translateMIPStoHex(this.inputText);
      this.parameter = this.output
    }
  }
  
 
  
}

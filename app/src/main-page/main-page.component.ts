import { Component, inject } from '@angular/core';
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { SwitchComponent } from './switch/switch.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';
import { AssemblyParserService, ParseResult } from '../Shared/Services/AssemblyParser/assembly-parser.service';
import { CommonModule } from '@angular/common';




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
    InstructionTableComponent,
    CommonModule
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'], 
})
export class MainPageComponent {
  
  inputText: string = '';
  output: string = '';
  parameter:string = '';
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  isHexToMIPS: boolean = false;
  tableManager = inject(TableInstructionService);
  parsingErrors: string[] = [];
  private assemblyParser = inject(AssemblyParserService); //iNYECCION DEL SERVICIO


  onTableValueChange(value: string): void {
    this.tableManager.updateSelectedLineText(value);
    



  }

  // Manejadores de eventos
  onToggle(isChecked: boolean): void {
    this.isHexToMIPS = isChecked;
    this.inputManagerIsHexToMips.setValue(isChecked);
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
  
  //ESTO ES PORQUE dependemos de ese componente del issue 37, pero ese grupo entrega en la misma fecha que nosotros asi que dudo lo cambiemos chicos
  mockLoadInstructionsToComponent(instructions: string[]): void {
    console.warn("SIMULACIÓN (Issue #37): Intentando cargar instrucciones...");
    if (instructions && instructions.length > 0) {
      console.log("Instrucciones parseadas listas:");
      instructions.forEach((inst, index) => console.log(`  ${index}: ${inst}`));

      // --- CAMBIO AQUÍ: Actualiza el FormControl del textbox original ---
      try {
        // Une el array de instrucciones en un solo string con saltos de línea
        const instructionsText = instructions.join('\n');

        // Establece el valor del FormControl que está vinculado al <app-textbox> original
        this.inputManager.setValue(instructionsText); // <--- ¡AQUÍ ESTÁ LA MAGIA!

        console.log("Instrucciones cargadas en el FormControl 'inputApp'.");
        alert(`Simulación: ${instructions.length} instrucciones MIPS cargadas en el campo de entrada MIPS original.`);

      } catch (e) {
         console.error("Error al intentar actualizar el FormControl 'inputApp':", e);
         alert("Error al intentar mostrar instrucciones en el campo original.");
      }
      // ---------------------------------------------------------------

    } else {
      console.warn("Simulación: No hay instrucciones válidas para cargar.");
      // Opcional: Limpiar el textbox si no hay instrucciones válidas
      // this.inputManager.setValue('');
      alert("Simulación: No se generaron instrucciones válidas a partir del código.");
    }
    // Limpiamos los errores de parseo solo si la operación (simulada) fue exitosa
    this.parsingErrors = [];
  }

 
  loadMipsCode(assemblyCode: string): void {
    console.log('Botón "Cargar y Procesar Código" presionado.');
    this.parsingErrors = []; // Limpiar errores anteriores al procesar

    if (!assemblyCode || assemblyCode.trim() === '') {
        this.parsingErrors = ["Por favor, ingresa código ensamblador en el área de texto."];
        return;
    }

    try {
      // Llama al servicio de parseo usando la propiedad inyectada
      const result: ParseResult = this.assemblyParser.parseAssembly(assemblyCode);

      // Manejo de Errores devueltos por el parser
      if (result.errors && result.errors.length > 0) {
         console.error("Errores encontrados durante el parseo:", result.errors);
         this.parsingErrors = result.errors; // Guarda los errores para mostrarlos en el HTML
         return; // No continuar si hay errores
      }

      // Si no hay errores, procede a "cargar" usando el MOCK
      console.log('Parseo exitoso. Instrucciones generadas:', result.instructions);
      // Llama al MOCK usando 'this' porque ahora es un método de esta clase
      this.mockLoadInstructionsToComponent(result.instructions);

    } catch (error: any) {
       // Captura errores inesperados (excepciones) que pueda lanzar el parser
       console.error("Error inesperado durante el parseo:", error);
       this.parsingErrors = [`Error inesperado al procesar: ${error.message || 'Error desconocido'}`];
    }
  }
  
}

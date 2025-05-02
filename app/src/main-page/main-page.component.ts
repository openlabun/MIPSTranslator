import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar una sola vez

// Imports de Componentes Originales + Nuevos (#37) + #39
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { SwitchComponent } from './switch/switch.component'; // Aunque comentado en HTML, mantener import por si acaso
// import { TexboxOutputComponent } from './texbox-output/texbox-output.component'; // Eliminado por #37
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { InstructionMenuComponent } from './instruction-menu/instruction-menu.component'; // Nuevo #37
import { ControlStackComponent } from './control-stack/control-stack.component'; // Nuevo #37

// Imports de Servicios Originales + Nuevos (#39)
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';
import { AssemblyParserService, ParseResult } from '../Shared/Services/AssemblyParser/assembly-parser.service'; // Nuevo #39

// Interfaz definida en #37
interface Translation {
  mips: string;
  hex: string;
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    // Combinar todos los imports necesarios una sola vez
    CommonModule,
    TextboxComponent,
    TranslateButtonComponent,
    SwitchComponent,
    // TexboxOutputComponent, // Eliminado
    RamdropComponent,
    SaveRamButtonComponent,
    InstructionTableComponent,
    InstructionMenuComponent, // Nuevo #37
    ControlStackComponent    // Nuevo #37
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent {

  // --- Propiedades ---
  // Mantener las originales y añadir las de ambas ramas (#37 y #39)
  inputText: string = '';
  output: string = ''; // Mantener por si se usa, aunque ControlStack es principal ahora
  parameter: string = ''; // Usado por save-ram-button, necesita actualizarse desde 'translations'
  isHexToMIPS: boolean = false;
  selectedInstruction: string = '';  // (#37) para la tabla de detalles?
  isValidInstruction: boolean = true; // (#37) gestionado por detectInstructionType
  translations: Translation[] = [];  // (#37) Array principal para ControlStack
  parsingErrors: string[] = [];      // (#39) Errores del parser de ensamblador

  // Inyecciones de Servicios (Originales + #39)
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;
  tableManager = inject(TableInstructionService);
  private assemblyParser = inject(AssemblyParserService); // (#39)


  // --- Métodos ---

  // Método de #37 (MANTENER)
  detectInstructionType(input: string): void {
    // Intenta validar como MIPS o HEX usando los métodos existentes en TranslatorService
    // Nota: isValidMIPS/isValidHex podrían necesitar ajustes para manejar múltiples líneas o la salida del parser
    const isHEX = /^[0-9a-fA-F]{8}$/.test(input.trim()); // Validación HEX simple (ajustar si es necesario)
    const isMIPS = !isHEX; // Asunción simple (mejorar con validación MIPS real si existe en translator)

    if (isHEX) {
      this.isHexToMIPS = true;
      this.isValidInstruction = this.translator.isValidHex(input); // Usar método del servicio si existe
      // this.inputManagerIsHexToMips.setValue(true); // ¿Se sigue usando esto?
    } else { // Asume MIPS si no es HEX 8-char
      this.isHexToMIPS = false;
      this.isValidInstruction = this.translator.isValidMIPS(input); // Usar método del servicio si existe
      // this.inputManagerIsHexToMips.setValue(false); // ¿Se sigue usando esto?
    }
    // Si ninguna es válida específicamente, marcar como inválida
    if (!this.translator.isValidHex(input) && !this.translator.isValidMIPS(input)){
        this.isValidInstruction = false;
    }
  }

  // Método Original (MANTENER)
  onTableValueChange(value: string): void {
    this.tableManager.updateSelectedLineText(value);
  }

  // Método Original (MANTENER, aunque switch esté comentado)
  onToggle(isChecked: boolean): void {
    this.isHexToMIPS = isChecked;
    // this.inputManagerIsHexToMips.setValue(isChecked); // ¿Se sigue usando esto?
    // La lógica de intercambio parece redundante con ControlStack
    // let draft = this.inputManager.value;
    // this.inputManager.setValue(this.output);
    // this.output = draft;
  }

  // Método Nuevo de #37 (MANTENER)
  onInstructionClick(instruction: string){
    // Podría poner la instrucción clickeada en el textbox original
    this.inputManager.setValue(instruction);
    this.detectInstructionType(instruction); // Re-detectar tipo
    this.inputText = instruction; // Actualizar inputText también

    // Actualizar tabla de detalles si es necesario
    if (instruction !== this.selectedInstruction) {
      this.selectedInstruction = instruction;
      this.onTableValueChange(instruction);
    }
  }

  // Método Modificado por #37 (MANTENER VERSIÓN #37)
  onInput(input: string): void {
    this.isValidInstruction = true; // Asumir válido hasta que se demuestre lo contrario
    this.inputText = input;
    this.detectInstructionType(input); // Detectar tipo al escribir
  }

  // Método Modificado por #37 (MANTENER VERSIÓN #37) - Carga archivo RAM a la lista
  onTextFile(textFile: Promise<string[]>): void {
    textFile.then((instructions) => {
      const HEXs = instructions[0].split('\n');
      const MIPSs = instructions[1].split('\n');
      this.translations = []; // Limpiar lista actual antes de cargar del archivo
      this.parameter = '';   // Limpiar parámetro de save-ram

      for (let i = 0; i < Math.min(HEXs.length, MIPSs.length); i++) { // Usar Math.min por seguridad
        const HEX = HEXs[i].trim();
        const MIPS = MIPSs[i].trim();
        if (HEX === '' || MIPS === '') continue;
        this.translations.push({ mips: MIPS, hex: HEX });
        this.parameter += HEX + '\n'; // Reconstruir parámetro hex
      }
       console.log("Instrucciones cargadas desde archivo RAM:", this.translations);
    });
  }

  // Método Modificado por #37 (MANTENER VERSIÓN #37) - Añade traducción individual a la lista
  onTranslate(): void {
    let MIPS = '';
    let HEX = '';

    this.detectInstructionType(this.inputText); // Asegurarse de tener el tipo correcto

    if (this.inputText === '' || !this.isValidInstruction ) {
        alert("Instrucción inválida o vacía.");
        return;
    }

    try {
        if (this.isHexToMIPS) {
          MIPS = this.translator.translateHextoMIPS(this.inputText);
          HEX = this.inputText.startsWith("0x") ? this.inputText.substring(2).toUpperCase() : this.inputText.toUpperCase(); // Normalizar HEX
          HEX = HEX.padStart(8, '0'); // Asegurar 8 dígitos
          if (MIPS.includes("Unknown") || MIPS.includes("Invalid")) throw new Error(MIPS);
        } else {
          HEX = this.translator.translateMIPStoHex(this.inputText);
          MIPS = this.inputText;
          if (HEX.includes("Unknown") || HEX.includes("Invalid") || HEX.includes("Missing")) throw new Error(HEX);
        }

        // Agregar la traducción individual a la lista 'translations'
        this.translations.push({ mips: MIPS, hex: HEX });
        this.parameter = this.translations.map(t => t.hex).join('\n'); // Actualizar parámetro

    } catch(e: any) {
        alert(`Error de traducción: ${e.message}`);
        console.error("Error en onTranslate:", e);
    }
  }

  // --- TU MÉTODO loadMipsCode (#39) - MODIFICADO PARA INTEGRAR CON #37 ---
  loadMipsCode(assemblyCode: string): void {
    console.log('Botón "Cargar y Procesar Código" presionado.');
    this.parsingErrors = []; // Limpiar errores anteriores

    if (!assemblyCode || assemblyCode.trim() === '') {
        this.parsingErrors = ["Por favor, ingresa código ensamblador en el área de texto."];
        return;
    }

    try {
      // 1. Llamar a tu parser
      const result: ParseResult = this.assemblyParser.parseAssembly(assemblyCode);

      // 2. Manejar Errores del Parser
      if (result.errors && result.errors.length > 0) {
         console.error("Errores encontrados durante el parseo:", result.errors);
         this.parsingErrors = result.errors; // Mostrar errores en HTML
         return; // No continuar
      }

      // 3. Si no hay errores, procesar la lista de instrucciones MIPS
      console.log('Parseo exitoso. Instrucciones MIPS generadas:', result.instructions);

      // --- INICIO INTEGRACIÓN CON #37 ---
      // Reemplazar la llamada al mock con la lógica para poblar this.translations

      const newTranslations: Translation[] = [];
      let translationErrors: string[] = [];

      for (let i = 0; i < result.instructions.length; i++) {
          const mipsInstruction = result.instructions[i];
          try {
              // Usar TranslatorService para obtener el HEX de cada instrucción MIPS
              const hexInstruction = this.translator.translateMIPStoHex(mipsInstruction);

              // Verificar si la traducción fue exitosa
              if (hexInstruction.includes("Unknown") || hexInstruction.includes("Invalid") || hexInstruction.includes("Missing") || hexInstruction.includes("Unsupported") || hexInstruction.includes("Error")) {
                  translationErrors.push(`Línea ${i + 1} ('${mipsInstruction}'): ${hexInstruction}`);
              } else {
                  newTranslations.push({ mips: mipsInstruction, hex: hexInstruction });
              }
          } catch (e: any) {
              translationErrors.push(`Línea ${i + 1} ('${mipsInstruction}'): Error interno de traducción - ${e.message}`);
          }
      }

      // Si hubo errores durante la traducción MIPS->HEX, mostrarlos
      if (translationErrors.length > 0) {
          this.parsingErrors = ["Errores durante la traducción MIPS a HEX:", ...translationErrors];
          console.error("Errores durante la traducción MIPS a HEX:", translationErrors);
      } else {
          // Si todo fue bien, REEMPLAZAR la lista de traducciones actual
          this.translations = newTranslations;
          this.parameter = this.translations.map(t => t.hex).join('\n'); // Actualizar parámetro para save-ram
          console.log("Instrucciones cargadas en la lista 'translations':", this.translations);
          alert(`¡${this.translations.length} instrucciones cargadas exitosamente en la pila de control!`);
      }
      // --- FIN INTEGRACIÓN CON #37 ---

    } catch (error: any) {
       // Captura errores inesperados del parser mismo
       console.error("Error inesperado durante el parseo:", error);
       this.parsingErrors = [`Error inesperado al procesar: ${error.message || 'Error desconocido'}`];
    }
  }
  // --- Fin de loadMipsCode ---

  // --- Métodos Nuevos de #37 (MANTENER) ---
  onInstructionMenuSelect(instruction: string): void {
    // Poner instrucción del menú en el input original para posible traducción individual
    this.inputManager.setValue(instruction);
    this.inputText = instruction;
    this.detectInstructionType(instruction);
  }

  onDeleteInstruction(translation: Translation): void {
    const index = this.translations.findIndex(t => t.mips === translation.mips && t.hex === translation.hex); // Buscar por valor
    if (index !== -1) {
      this.translations.splice(index, 1);
       // Actualizar 'parameter' usado por save-ram
      this.parameter = this.translations.map(t => t.hex).join('\n');
      console.log("Instrucción eliminada, lista actual:", this.translations);
    }
  }

} 
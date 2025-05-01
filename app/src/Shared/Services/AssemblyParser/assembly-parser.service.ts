import { Injectable, inject } from '@angular/core';
// Importa los mapas definidos en TranslatorService (asegúrate que estén exportados si es necesario)
import { TranslatorService, instructionMap, registerMap } from '../Translator/translator.service';

// --- Interfaces y Tipos Auxiliares ---
export interface ParseResult {
  instructions: string[]; // Lista de instrucciones MIPS limpias y normalizadas
  errors: string[];       // Lista de errores encontrados
}

// Guarda información sobre las etiquetas encontradas
interface LabelInfo {
  name: string;         // Nombre original (puede preservar mayúsculas si se quiere)
  address: number;      // Dirección simulada (BASE_ADDRESS + indice_instruccion * 4)
  lineNumber: number; // Línea original donde se definió
}

// Representa una línea después del 1er recorrido (limpieza básica y separación)
interface ParsedLine {
  originalLineNumber: number;
  label: string | null;             // Etiqueta definida en esta línea (si la hay)
  mnemonic: string | null;          // Mnemónico de la instrucción (si la hay)
  rawOperands: string[];          // Operandos crudos, tal como se separaron inicialmente
  cleanedInstructionText: string; // Texto de la instrucción sin etiqueta ni comentario
}

// Representa una instrucción después del 2do recorrido (validación de formato y operandos)
interface ValidatedInstruction {
  originalLineNumber: number;
  address: number;                 // Dirección simulada (BASE_ADDRESS + indice * 4)
  mnemonic: string;
  validatedOperands: ValidatedOperand[]; // Operandos parseados y validados por tipo
}

// Tipo detallado para operandos después de la validación de tipo y formato
type ValidatedOperand =
  | { type: 'register'; name: string }         // ej: { type: 'register', name: 't0' }
  | { type: 'immediate'; value: number }       // ej: { type: 'immediate', value: 100 }
  | { type: 'label'; name: string }            // ej: { type: 'label', name: 'loop' } (aún no resuelta)
  | { type: 'loadStore'; offset: number; baseRegister: string }; // ej: { type: 'loadStore', offset: 8, baseRegister: 'sp' }

// Define qué tipo de operando se espera en cada posición
type OperandExpectation = 'register' | 'immediate16s' | 'immediate16u' | 'shamt5u' | 'label' | 'loadStore';

// --- Servicio Principal ---
@Injectable({
  providedIn: 'root'
})
export class AssemblyParserService {
  // Inyectar TranslatorService para acceder a instructionMap y registerMap
  private translator = inject(TranslatorService);
  // Mapa inverso para buscar número de registro por nombre
  private registerMapByName: Map<string, string>;
  // Dirección base típica MIPS para el segmento de texto (importante para saltos J)
  private readonly BASE_ADDRESS = 0x00400000; // Puedes ajustar esto si es necesario

  constructor() {
    // Crear mapa inverso nombre -> binario '00000'
    this.registerMapByName = new Map();
    for (const numBin in registerMap) {
      this.registerMapByName.set(registerMap[numBin], numBin);
    }
  }

  /**
   * Parsea un bloque de código ensamblador MIPS, validando y resolviendo etiquetas.
   * @param assemblyCode El código ensamblador como un string multilinea.
   * @returns Un objeto ParseResult con instrucciones y errores.
   */
  parseAssembly(assemblyCode: string): ParseResult {
    const errors: string[] = [];
    const labelMap = new Map<string, LabelInfo>(); // Mapa: nombre_etiqueta_minusculas -> LabelInfo
    const parsedLines: ParsedLine[] = [];          // Líneas con potencial instrucción tras 1er recorrido
    let instructionCounter = 0;                  // Contador para asignar índices/direcciones

    if (!assemblyCode || assemblyCode.trim() === '') {
      errors.push('No se proporcionó código ensamblador.');
      return { instructions: [], errors };
    }

    const rawLines = assemblyCode.split('\n');

    // --- 1er Recorrido: Limpiar, encontrar etiquetas, separar líneas ---
    rawLines.forEach((line, index) => {
      const lineNumber = index + 1;
      const commentMatch = line.indexOf('#');
      const lineWithoutComment = commentMatch === -1 ? line : line.substring(0, commentMatch);
      const trimmedLine = lineWithoutComment.trim();

      if (trimmedLine.length === 0) return; // Ignorar líneas vacías

      let label: string | null = null;
      let instructionText = trimmedLine;

      // Buscar etiqueta al inicio (palabra seguida de ':')
      const labelRegex = /^([a-zA-Z_][a-zA-Z0-9_]*):(.*)/;
      const match = trimmedLine.match(labelRegex);

      if (match) {
        label = match[1];
        instructionText = match[2].trim();

        if (!/^[a-zA-Z_]/.test(label)) { // Validación básica del nombre
          errors.push(`Línea ${lineNumber}: Nombre de etiqueta inválido '${label}'.`);
        } else {
          const lowerLabel = label.toLowerCase();
          if (labelMap.has(lowerLabel)) {
            errors.push(`Línea ${lineNumber}: Etiqueta duplicada '${label}'.`);
          } else {
            // Mapear etiqueta a la dirección simulada de la *próxima* instrucción
            labelMap.set(lowerLabel, {
              name: label, // Guardar nombre original si se quiere
              address: this.BASE_ADDRESS + instructionCounter * 4,
              lineNumber: lineNumber
            });
          }
        }
      }

      // Si queda texto (posible instrucción)
      if (instructionText.length > 0) {
        const parts = instructionText.split(/\s+/);
        const mnemonic = parts[0].toLowerCase();
        const rawOperands = instructionText.substring(parts[0].length)
                                      .split(',')
                                      .map(op => op.trim())
                                      .filter(op => op.length > 0);

        parsedLines.push({
          originalLineNumber: lineNumber,
          label: label,
          mnemonic: mnemonic,
          rawOperands: rawOperands,
          cleanedInstructionText: instructionText,
        });
        instructionCounter++; // Incrementar solo si hay instrucción potencial
      }
    });

    console.log("Mapa de Etiquetas:", labelMap);
    if (errors.length > 0) return { instructions: [], errors }; // Errores fatales del 1er recorrido

    // --- 2do Recorrido: Validar formato y operandos ---
    const validatedInstructions: ValidatedInstruction[] = [];
    const pass2Errors: string[] = [];

    parsedLines.forEach((line, index) => {
      if (!line.mnemonic) return;
      const instructionAddress = this.BASE_ADDRESS + index * 4;

      // Validar la instrucción y sus operandos crudos
      const { validatedOps, validationErrors } = this._validateInstructionAndOperands(
          line.mnemonic,
          line.rawOperands, // Pasar los operandos crudos separados por coma
          line.originalLineNumber
      );

      if (validationErrors.length > 0) {
          pass2Errors.push(...validationErrors);
          // Continuamos para encontrar todos los errores de formato posibles
      } else {
         // Guardar solo si la validación básica de formato fue exitosa
         validatedInstructions.push({
             originalLineNumber: line.originalLineNumber,
             address: instructionAddress,
             mnemonic: line.mnemonic,
             validatedOperands: validatedOps // Guardar los operandos ya validados y parseados
         });
      }
    });

     // --- 3er Recorrido: Resolver saltos/branches ---
     const finalInstructions: string[] = [];
     const pass3Errors: string[] = [];

     validatedInstructions.forEach((inst) => {
         const { resolvedOperands, jumpBranchErrors } = this._resolveJumpBranchTargets(
             inst.mnemonic,
             inst.validatedOperands, // Usar operandos ya validados
             inst.address,
             labelMap,
             inst.originalLineNumber
         );

         if (jumpBranchErrors.length > 0) {
             pass3Errors.push(...jumpBranchErrors);
         } else {
              // Reconstruir la instrucción final en formato "mnemónico op1 op2 op3" (sin comas)
              finalInstructions.push(`${inst.mnemonic} ${resolvedOperands.join(' ')}`.trim());
         }
     });

    // Combinar todos los errores
    errors.push(...pass2Errors, ...pass3Errors);

    return {
      instructions: errors.length === 0 ? finalInstructions : [],
      errors
    };
  }

  // =====================================================
  // --- Funciones Auxiliares de Validación y Parseo ---
  // =====================================================

   /** Devuelve el array de tipos esperados para los operandos de una instrucción */
   private _getOperandExpectation(mnemonic: string): OperandExpectation[] {
        const info = this.translator.instructionMap[mnemonic];
        if (!info) return [];

        // Lógica basada en MIPS estándar y mapa existente
        if (mnemonic === 'nop' || mnemonic === 'syscall') return [];

        // R-Types específicos
        if (info.funct) {
             if (mnemonic === 'sll' || mnemonic === 'srl' || mnemonic === 'sra') return ['register', 'register', 'shamt5u']; // rd, rt, shamt
             if (mnemonic === 'sllv' || mnemonic === 'srlv' || mnemonic === 'srav') return ['register', 'register', 'register']; // rd, rt, rs
             if (mnemonic === 'jr') return ['register']; // rs
             if (mnemonic === 'jalr') return ['register', 'register']; // rd, rs (asumiendo formato 2 operandos)
             if (mnemonic === 'mult' || mnemonic === 'div' || mnemonic === 'multu' || mnemonic === 'divu') return ['register', 'register']; // rs, rt
             if (mnemonic === 'mfhi' || mnemonic === 'mflo') return ['register']; // rd
             if (mnemonic === 'mthi' || mnemonic === 'mtlo') return ['register']; // rs
             // Default R-Type: rd, rs, rt
             return ['register', 'register', 'register'];
        }

        // I-Types específicos
        if (mnemonic === 'lw' || mnemonic === 'sw' || mnemonic === 'lb' || mnemonic === 'lbu' || mnemonic === 'lh' || mnemonic === 'lhu' || mnemonic === 'sb' || mnemonic === 'sh') return ['register', 'loadStore']; // rt, offset(rs)
        if (mnemonic === 'beq' || mnemonic === 'bne') return ['register', 'register', 'label']; // rs, rt, label
        if (mnemonic === 'blez' || mnemonic === 'bgtz') return ['register', 'label']; // rs, label
        if (mnemonic === 'addi' || mnemonic === 'slti') return ['register', 'register', 'immediate16s']; // rt, rs, imm (signed)
        if (mnemonic === 'addiu' || mnemonic === 'sltiu' || mnemonic === 'andi' || mnemonic === 'ori' || mnemonic === 'xori') return ['register', 'register', 'immediate16u']; // rt, rs, imm (unsigned)
        if (mnemonic === 'lui') return ['register', 'immediate16u']; // rt, imm

        // J-Types
        if (mnemonic === 'j' || mnemonic === 'jal') return ['label'];

        console.warn(`Formato de operandos no definido explícitamente para ${mnemonic}`);
        return []; // Devolver vacío si no se definió
   }

   /** Valida una instrucción y sus operandos crudos, devolviendo operandos validados o errores */
   private _validateInstructionAndOperands(mnemonic: string, rawOperands: string[], lineNumber: number): { validatedOps: ValidatedOperand[], validationErrors: string[] } {
       const validationErrors: string[] = [];
       const validatedOps: ValidatedOperand[] = [];

       if (!this.translator.instructionMap[mnemonic]) {
           validationErrors.push(`Línea ${lineNumber}: Instrucción desconocida '${mnemonic}'.`);
           return { validatedOps, validationErrors };
       }

       const expectedFormat = this._getOperandExpectation(mnemonic);

       if (rawOperands.length !== expectedFormat.length) {
           validationErrors.push(`Línea ${lineNumber}: '${mnemonic}' espera ${expectedFormat.length} operandos, recibió ${rawOperands.length} ('${rawOperands.join(', ')}').`);
           return { validatedOps, validationErrors };
       }

       for (let i = 0; i < expectedFormat.length; i++) {
           const expected = expectedFormat[i];
           const actualRaw = rawOperands[i];
           let validated: ValidatedOperand | null = null;

           switch (expected) {
               case 'register':
                   const regName = this._parseRegister(actualRaw);
                   if (regName) {
                       validated = { type: 'register', name: regName };
                   } else {
                       validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un registro MIPS válido.`);
                   }
                   break;
               case 'immediate16s':
               case 'immediate16u':
                   const imm16 = this._parseImmediate(actualRaw);
                   if (imm16 !== null) {
                       const isSigned = expected === 'immediate16s';
                       const min = isSigned ? -32768 : 0;
                       const max = isSigned ? 32767 : 65535;
                       if (imm16 < min || imm16 > max) {
                           validationErrors.push(`Línea ${lineNumber}: Inmediato '${actualRaw}' (${imm16}) fuera de rango para '${mnemonic}' (${min} a ${max}).`);
                       } else {
                           validated = { type: 'immediate', value: imm16 };
                       }
                   } else {
                       validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un número inmediato válido.`);
                   }
                   break;
               case 'shamt5u':
                   const shamt = this._parseImmediate(actualRaw);
                   if (shamt !== null) {
                       if (shamt < 0 || shamt > 31) {
                           validationErrors.push(`Línea ${lineNumber}: Valor de shift ('${actualRaw}') fuera de rango para '${mnemonic}' (0 a 31).`);
                       } else {
                           validated = { type: 'immediate', value: shamt };
                       }
                   } else {
                       validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un inmediato válido para shamt.`);
                   }
                   break;
               case 'loadStore':
                   const memOp = this._parseLoadStoreOperand(actualRaw);
                   if (memOp) {
                       if (memOp.offset < -32768 || memOp.offset > 32767) {
                           validationErrors.push(`Línea ${lineNumber}: Offset '${memOp.offset}' fuera de rango para '${mnemonic}' (-32768 a 32767).`);
                       } else {
                           validated = { type: 'loadStore', offset: memOp.offset, baseRegister: memOp.base };
                       }
                   } else {
                       validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no tiene el formato offset(base) válido.`);
                   }
                   break;
               case 'label':
                   if (this._isPotentialLabel(actualRaw)) {
                       validated = { type: 'label', name: actualRaw.toLowerCase() };
                   } else if (this._parseImmediate(actualRaw) !== null){
                       // Permitir números como posibles offsets/direcciones ya resueltos? Podría ser problemático.
                       // Por ahora, exigimos que sea una etiqueta válida si se espera una.
                       // validated = { type: 'immediate', value: this._parseImmediate(actualRaw)! };
                       validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un nombre de etiqueta válido para '${mnemonic}'.`);
                   } else {
                        validationErrors.push(`Línea ${lineNumber}: Operando #${i + 1} ('${actualRaw}') no es un nombre de etiqueta válido para '${mnemonic}'.`);
                   }
                   break;
           }

           if (validationErrors.length > 0) break; // No seguir si un operando falla
           if (validated) {
               validatedOps.push(validated);
           } else {
                validationErrors.push(`Línea ${lineNumber}: Error interno procesando operando #${i+1} para '${mnemonic}'.`);
                break;
           }
       }

       return { validatedOps, validationErrors };
   }


/** Resuelve etiquetas en operandos de saltos/branches y devuelve la lista de operandos como strings */
private _resolveJumpBranchTargets(
  mnemonic: string,
  validatedOperands: ValidatedOperand[], // Operandos ya validados por tipo
  currentAddress: number,               // Dirección simulada de esta instrucción
  labelMap: Map<string, LabelInfo>,     // Mapa de etiquetas a { name, address: dirección }
  lineNumber: number
): { resolvedOperands: string[], jumpBranchErrors: string[] } {
  const jumpBranchErrors: string[] = [];
  // Copiar los operandos para modificarlos si es necesario
  let resolvedOperands = [...validatedOperands];
  let hasJumpBranchError = false; // <-- ¡DECLARACIÓN AÑADIDA AQUÍ!

  const isJump = mnemonic === 'j' || mnemonic === 'jal';
  const isBranch = mnemonic === 'beq' || mnemonic === 'bne'; // Añadir más branches aquí

  // Iterar sobre los operandos para encontrar el que necesita resolución (si aplica)
  for (let i = 0; i < resolvedOperands.length; i++) {
    const operand = resolvedOperands[i];

    // Solo procesar si es una etiqueta Y está en la posición correcta para J/Branch
    if (operand.type === 'label' && ((isJump && i === 0) || (isBranch && i === resolvedOperands.length - 1))) {
      const labelName = operand.name;

      if (labelMap.has(labelName)) {
        const targetLabelInfo = labelMap.get(labelName)!;
        const targetAddress = targetLabelInfo.address;
        let targetValue: number; // El valor numérico que reemplazará la etiqueta

        if (isBranch) {
          const pc_plus_4 = currentAddress + 4;
          const byteOffset = targetAddress - pc_plus_4;

          if (byteOffset % 4 !== 0) {
            jumpBranchErrors.push(`Línea ${lineNumber}: Error interno, offset de branch para '${labelName}' (${byteOffset}) no es múltiplo de 4.`);
            hasJumpBranchError = true; break; // Salir del bucle for
          }
          const wordOffset = byteOffset / 4;
          if (wordOffset < -32768 || wordOffset > 32767) {
            jumpBranchErrors.push(`Línea ${lineNumber}: Salto branch fuera de rango para '${labelName}'. Offset ${wordOffset} no cabe en 16 bits.`);
            hasJumpBranchError = true; break; // Salir del bucle for
          }
          targetValue = wordOffset;
           console.log(`Resolviendo etiqueta branch '${labelName}' (Addr 0x${targetAddress.toString(16)}) a offset ${targetValue}`);
           // Reemplazar el operando etiqueta por un operando inmediato con el offset
           resolvedOperands[i] = { type: 'immediate', value: targetValue };

        } else { // Es Jump (j, jal)
          if (targetAddress % 4 !== 0) {
            jumpBranchErrors.push(`Línea ${lineNumber}: Dirección de salto para '${labelName}' (0x${targetAddress.toString(16)}) no está alineada a palabra.`);
            hasJumpBranchError = true; break; // Salir del bucle for
          }
          // Calcular campo de 26 bits (simplificado, asumiendo misma región de 256MB)
          const jumpTargetField = (targetAddress >> 2) & 0x03FFFFFF;
          targetValue = jumpTargetField;
           if ( ( (currentAddress+4) & 0xF0000000) !== (targetAddress & 0xF0000000) ) {
              console.warn(`Advertencia línea ${lineNumber}: Salto J/JAL a '${labelName}' cruza límite de región de 256MB.`);
           }
           console.log(`Resolviendo etiqueta jump '${labelName}' (Addr 0x${targetAddress.toString(16)}) a target field ${targetValue}`);
           // Reemplazar el operando etiqueta por un operando inmediato con el target field
           resolvedOperands[i] = { type: 'immediate', value: targetValue };
        }
      } else {
        jumpBranchErrors.push(`Línea ${lineNumber}: Etiqueta de salto no definida '${labelName}'.`);
        hasJumpBranchError = true; break; // Salir del bucle for
      }
    }
    // Si no es una etiqueta a resolver, el operando ya está validado y se queda como está en la copia 'resolvedOperands'
  } // Fin del bucle for

  // Convertir la lista final de operandos (ya resueltos) a strings
  const finalOperandStrings = resolvedOperands.map(op => this._formatValidatedOperand(op));

  // Si hubo error dentro del bucle, retornar errores y lista de strings vacía
  if (hasJumpBranchError) {
    return { resolvedOperands: [], jumpBranchErrors };
  }

  return { resolvedOperands: finalOperandStrings, jumpBranchErrors };
}

// --- ASEGÚRATE DE TENER EL RESTO DE MÉTODOS AUXILIARES ---
// _getOperandExpectation, _validateInstructionAndOperands, _parseRegister,
// _parseImmediate, _parseLoadStoreOperand, _isPotentialLabel, _formatValidatedOperand
// Deben estar como en la respuesta anterior.


   /** Parsea y valida un operando de registro, devuelve el nombre normalizado o null */
   private _parseRegister(reg: string | undefined): string | null {
       if (!reg) return null;
       const cleanedReg = reg.toLowerCase().replace(/^\$/, '');
       if (this.registerMapByName.has(cleanedReg)) return cleanedReg; // Es nombre válido
       const regNum = parseInt(cleanedReg); // Es número?
       if (!isNaN(regNum) && regNum >= 0 && regNum <= 31) {
           for (const [numBin, name] of Object.entries(registerMap)) {
               if (parseInt(numBin, 2) === regNum) return name; // Devolver nombre
           }
       }
       return null; // No es válido
   }

   /** Parsea un inmediato (dec, hex) o devuelve null */
   private _parseImmediate(imm: string | undefined): number | null {
        if (imm === undefined || imm === null || imm.trim() === '') return null;
        const cleanedImm = imm.toLowerCase().trim();
        let value: number;
        try {
            if (cleanedImm.startsWith('0x')) value = parseInt(cleanedImm.substring(2), 16);
            else if (cleanedImm.startsWith('-0x')) value = -parseInt(cleanedImm.substring(3), 16);
            else value = parseInt(cleanedImm, 10);
        } catch (e) { return null; }
        return isNaN(value) ? null : value;
   }

   /** Parsea el formato 'offset(base)' o devuelve null */
   private _parseLoadStoreOperand(operand: string | undefined): { offset: number, base: string } | null {
       if (!operand) return null;
       const loadStoreRegex = /^(-?(?:\d+|0x[0-9a-f]+))\s*\(\s*(\$[a-z0-9]+)\s*\)$/i;
       const match = operand.match(loadStoreRegex);
       if (!match) return null;

       const offset = this._parseImmediate(match[1]);
       const baseRegName = this._parseRegister(match[2]);

       if (offset === null || baseRegName === null) return null;
       return { offset, base: baseRegName };
   }

    /** Comprueba si un string podría ser un nombre de etiqueta válido */
    private _isPotentialLabel(str: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str);
    }

    /** Convierte un operando validado de vuelta a string para la instrucción final */
    private _formatValidatedOperand(operand: ValidatedOperand): string {
        switch (operand.type) {
            case 'register': return `$${operand.name}`;
            case 'immediate': return operand.value.toString();
            case 'label': return operand.name; // Se resolverá/reemplazará en el 3er recorrido
            case 'loadStore': return `${operand.offset} $${operand.baseRegister}`; // Formato normalizado
        }
    }
}
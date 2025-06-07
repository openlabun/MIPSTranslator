import { Component, inject, OnInit } from '@angular/core';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';

@Component({
  selector: 'app-instruction-table',
  standalone: true,
  imports: [],
  templateUrl: './instruction-table.component.html',
  styleUrl: './instruction-table.component.css',
})
export class InstructionTableComponent implements OnInit {
  instructionType: string = '';
  instructionData: any = null;
  tableService = inject(TableInstructionService);
  isHexToMips = inject(FormInputManagerService).isHexToMips;
  parts: any = null;
  currentInstruction: string = '';
  showTooltip: boolean = false;
  tooltipText: string = '';
  tooltipPosition = { x: 0, y: 0 };

  // Mapa de opcodes a nombres de instrucciones
  private opcodeToInstructionMap: {[key: string]: string} = {
    // I-Type Instructions
    '001000': 'addi',
    '001001': 'addiu',
    '001100': 'andi',
    '001101': 'ori',
    '001110': 'xori',
    '100011': 'lw',
    '101011': 'sw',
    '100000': 'lb',
    '100100': 'lbu',
    '100001': 'lh',
    '100101': 'lhu',
    '101000': 'sb',
    '101001': 'sh',
    '000100': 'beq',
    '000101': 'bne',
    '000111': 'bgtz',
    '000110': 'blez',
    '000001': 'bltz/bgez', // Se maneja especial por rt
    '001111': 'lui',
    '001010': 'slti',
    '001011': 'sltiu',
    
    // J-Type Instructions
    '000010': 'j',
    '000011': 'jal',
    
    // Trap Instructions
    '000000': 'trap' // Para instrucciones especiales
  };

  constructor() {}

  ngOnInit() {
    this.tableService.selectedLineText$.subscribe((value) => {
      let draft = value;
      if (!this.isHexToMips.value) draft = this.tableService.converter.translateMIPStoHex(value);
      
      const result = this.tableService.explainInstruction();
      this.instructionType = result.type;
      this.instructionData = result.data;
      
      if (this.instructionType === 'R') {
        this.parts = this.tableService.produceRInstruction(draft);
        this.currentInstruction = this.tableService.converter.convertFunctToName(this.parts.funct);
      } else if (this.instructionType === 'I') {
        this.parts = this.tableService.produceIInstruction(draft);
        this.currentInstruction = this.resolveInstructionFromOpcode(this.parts.opcode, this.parts.rt);
      } else if (this.instructionType === 'J') {
        this.parts = this.tableService.produceJInstruction(draft);
        this.currentInstruction = this.resolveInstructionFromOpcode(this.parts.opcode);
      } else if (this.instructionType === 'RTrap') {
        this.parts = this.tableService.produceRTrapInstruction(draft);
        this.currentInstruction = this.tableService.converter.convertFunctToName(this.parts.funct);
      } else if (this.instructionType === 'ITrap') {
        this.parts = this.tableService.produceITrapInstruction(draft);
        this.currentInstruction = this.resolveInstructionFromOpcode(this.parts.opcode);
      }
      
      this.tooltipText = this.getInstructionDescription(this.currentInstruction);
    });
  }

  // Resuelve el nombre de la instrucción basado en el opcode
  private resolveInstructionFromOpcode(opcode: string, rt?: string): string {
    // Caso especial para bltz/bgez que comparten opcode
    if (opcode === '000001') {
      if (rt === '00000') return 'bltz';
      if (rt === '00001') return 'bgez';
    }
    
    return this.opcodeToInstructionMap[opcode] || `Unknown (${opcode})`;
  }

  getInstructionDescription(instruction: string): string {
    if (!instruction) return 'No instruction detected';
    
    const instructionMap: {[key: string]: string} = {
      // R-Type
      'add': 'Adds two registers (with overflow). Example: add $t1, $t2, $t3 → $t1 = $t2 + $t3',
      'addu': 'Adds two registers (no overflow). Example: addu $t1, $t2, $t3 → $t1 = $t2 + $t3',
      'sub': 'Subtracts two registers (with overflow). Example: sub $t1, $t2, $t3 → $t1 = $t2 - $t3',
      'subu': 'Subtracts two registers (no overflow). Example: subu $t1, $t2, $t3 → $t1 = $t2 - $t3',
      'and': 'Bitwise AND. Example: and $t1, $t2, $t3 → $t1 = $t2 & $t3',
      'or': 'Bitwise OR. Example: or $t1, $t2, $t3 → $t1 = $t2 | $t3',
      'xor': 'Bitwise XOR. Example: xor $t1, $t2, $t3 → $t1 = $t2 ^ $t3',
      'nor': 'Bitwise NOR. Example: nor $t1, $t2, $t3 → $t1 = ~($t2 | $t3)',
      'sll': 'Logical shift left. Example: sll $t1, $t2, 2 → $t1 = $t2 << 2',
      'sllv': 'Variable logical shift left. Example: sllv $t1, $t2, $t3 → $t1 = $t2 << $t3',
      'srl': 'Logical shift right. Example: srl $t1, $t2, 2 → $t1 = $t2 >>> 2',
      'srlv': 'Variable logical shift right. Example: srlv $t1, $t2, $t3 → $t1 = $t2 >>> $t3',
      'sra': 'Arithmetic shift right. Preserves sign bit. Example: sra $t1, $t2, 2',
      'srav': 'Variable arithmetic shift right. Example: srav $t1, $t2, $t3',
      'slt': 'Set if less than (signed). Example: slt $t1, $t2, $t3 → $t1 = ($t2 < $t3) ? 1 : 0',
      'mult': 'Multiply signed. Result stored in HI (high) and LO (low).',
      'multu': 'Multiply unsigned. Result stored in HI and LO.',
      'div': 'Divide signed. Quotient in LO, remainder in HI.',
      'divu': 'Divide unsigned. Quotient in LO, remainder in HI.',
      'mfhi': 'Move from HI. Copies the HI register to destination.',
      'mflo': 'Move from LO. Copies the LO register to destination.',
      'mthi': 'Move to HI. Stores value into HI register.',
      'mtlo': 'Move to LO. Stores value into LO register.',
      'jalr': 'Jump and link register. Saves return address in $ra and jumps to address in register.',
      'jr': 'Jump register. Unconditional jump to address in register.',
      'syscall': 'System call. Performs system-level service defined in $v0.',
      'break': 'Break instruction. Causes a breakpoint exception.',
      'teq': 'Trap if equal. Triggers exception if rs == rt.',
      'tge': 'Trap if greater or equal. Triggers exception if rs >= rt.',
      'tgeu': 'Trap if greater or equal unsigned. Triggers exception if rs >= rt.',
      'tlt': 'Trap if less than. Triggers exception if rs < rt.',
      'tltu': 'Trap if less than unsigned. Triggers exception if rs < rt.',
      'tne': 'Trap if not equal. Triggers exception if rs != rt.',
  
      // I-Type
      'addi': 'Add immediate (signed). Example: addi $t1, $t2, 100 → $t1 = $t2 + 100',
      'addiu': 'Add immediate unsigned. No overflow detection.',
      'andi': 'Bitwise AND with immediate. Example: andi $t1, $t2, 0xFF',
      'ori': 'Bitwise OR with immediate. Example: ori $t1, $t2, 0xFF',
      'xori': 'Bitwise XOR with immediate. Example: xori $t1, $t2, 0xFF',
      'lw': 'Load word from memory. Example: lw $t1, 4($t2) → $t1 = MEM[$t2 + 4]',
      'sw': 'Store word to memory. Example: sw $t1, 4($t2) → MEM[$t2 + 4] = $t1',
      'lb': 'Load byte from memory with sign extension.',
      'lbu': 'Load byte unsigned from memory.',
      'lh': 'Load halfword from memory with sign extension.',
      'lhu': 'Load halfword unsigned from memory.',
      'sb': 'Store byte to memory. Only the least significant byte is stored.',
      'sh': 'Store halfword to memory. Stores the lower 16 bits.',
      'beq': 'Branch if equal. Jumps to label if $rs == $rt.',
      'bne': 'Branch if not equal. Jumps to label if $rs != $rt.',
      'bgtz': 'Branch if greater than zero. Jumps if $rs > 0.',
      'blez': 'Branch if less than or equal to zero. Jumps if $rs <= 0.',
      'bltz': 'Branch if less than zero. Jumps if $rs < 0.',
      'bgez': 'Branch if greater or equal zero. Jumps if $rs >= 0.',
      'lui': 'Load upper immediate. Loads value into upper 16 bits of register, lower bits set to 0.',
      'slti': 'Set if less than immediate (signed). Example: slti $t1, $t2, 5 → $t1 = ($t2 < 5) ? 1 : 0',
      'sltiu': 'Set if less than immediate (unsigned).',
  
      // J-Type
      'j': 'Jump. Unconditional jump to target address.',
      'jal': 'Jump and link. Jumps to address and saves return address in $ra.',
    };

    return instructionMap[instruction.toLowerCase()] || `No description available for: ${instruction}`;
  }

  showDescription(event: MouseEvent, instructionName?: string) {
    const instructionToShow = instructionName || this.currentInstruction;
    if (!instructionToShow) return;

    this.tooltipText = this.getInstructionDescription(instructionToShow);
    
    if (this.tooltipText) {
      this.showTooltip = true;
      this.tooltipPosition = {
        x: event.clientX + 15,
        y: event.clientY + 20
      };
    }
  }

  hideDescription() {
    this.showTooltip = false;
  }
}
export interface Instruction {
    opcode: string;
    funct?: string;

}

export const instructionMap: { [key: string]: Instruction } = {
    "add": { opcode: "000000", funct: "100000" },
    "sub": { opcode: "000000", funct: "100010" },
    "and": { opcode: "000000", funct: "100100" },
    "or": { opcode: "000000", funct: "100101" },
    "jalr": { opcode: "000000", funct: "001001" },
    "jr": { opcode: "000000", funct: "001000" },
    "slt": { opcode: "000000", funct: "101010" },
    "mfhi": { opcode: "000000", funct: "010000" },
    "mflo": { opcode: "000000", funct: "010010" },
    "mthi": { opcode: "000000", funct: "010001" },
    "mtlo": { opcode: "000000", funct: "010011" },
    "teq": { opcode: "000000", funct: "110100" },
    "tge": { opcode: "000000", funct: "110000" },
    "tgeu": { opcode: "000000", funct: "110001" },
    "tlt": { opcode: "000000", funct: "110010" },
    "tltu": { opcode: "000000", funct: "110011" },
    "tne": { opcode: "000000", funct: "110110" },
    "addu": { opcode: "000000", funct: "100001" },
    "div": { opcode: "000000", funct: "011010" },
    "divu": { opcode: "000000", funct: "011011" },
    "mult": { opcode: "000000", funct: "011000" },
    "multu": { opcode: "000000", funct: "011001" },
    "nor": { opcode: "000000", funct: "100111" },
    "sll": { opcode: "000000", funct: "000000" },
    "sllv": { opcode: "000000", funct: "000100" },
    "sra": { opcode: "000000", funct: "000011" },
    "srav": { opcode: "000000", funct: "000111" },
    "srl": { opcode: "000000", funct: "000010" },
    "srlv": { opcode: "000000", funct: "000110" },
    "subu": { opcode: "000000", funct: "100011" },
    "xor": { opcode: "000000", funct: "100110" },
    "addi": { opcode: "001000" },
    "addiu": { opcode: "001001" },
    "andi": { opcode: "001100" },
    "ori": { opcode: "001101" },
    "xori": { opcode: "001110" },
    "lw": { opcode: "100011" },
    "sw": { opcode: "101011" },
    "lb": { opcode: "100000" },
    "lbu": { opcode: "100100" },
    "lh": { opcode: "100001" },
    "lhu": { opcode: "100101" },
    "sb": { opcode: "101000" },
    "sh": { opcode: "101001" },
    "beq": { opcode: "000100" },
    "bne": { opcode: "000101" },
    "bgtz": { opcode: "000111" },
    "blez": { opcode: "000110" },
    "j": { opcode: "000010" },
    "jal": { opcode: "000011" },
    "lui": { opcode: "001111" },
    "nop": { opcode: "000000", funct: "000000" }
  };

export const registerMap: { [key: string]: string } = {
    "00000": "zero", "00001": "at", "00010": "v0", "00011": "v1",
    "00100": "a0", "00101": "a1", "00110": "a2", "00111": "a3",
    "01000": "t0", "01001": "t1", "01010": "t2", "01011": "t3",
    "01100": "t4", "01101": "t5", "01110": "t6", "01111": "t7",
    "10000": "s0", "10001": "s1", "10010": "s2", "10011": "s3",
    "10100": "s4", "10101": "s5", "10110": "s6", "10111": "s7",
    "11000": "t8", "11001": "t9", "11010": "k0", "11011": "k1",
    "11100": "gp", "11101": "sp", "11110": "fp", "11111": "ra"
  };

function memDechex(dec: number): string {
    return dec.toString(16).padStart(8, '0');
}

function processInput(input: string ): string[] {
    return input.split('\n').map(line => line.trim()) .filter(line => line !== ''); 
}

// Enumeración para tipos de línea
enum LineType {
    UNASSIGNED,
    COMMENT,
    R,
    I,
    LA_FIRST,
    LA_THIRD,
    J,
    SYSCALL,
    LABEL,
    INVALID
}

class Line {
    inputLineNumber: number = 0;
    originalCode: string = "";
    lineType: LineType = LineType.UNASSIGNED;
    label: string = "";
    op: string = "";
    operands: string[] = [];
    memAddress: number = 0;
    private debugLog: string[] = [];
    private symbolTable: Map<string, number>;

    constructor(symbolTable: Map<string, number>, debugMode: boolean = false) {
        this.symbolTable = symbolTable;
    }

    private registerToNumber(reg: string): number {
        const regName = reg.slice(1); // Elimina el "$"
        const binaryCode = Object.entries(registerMap).find(([_, name]) => name === regName)?.[0];
        if (!binaryCode) throw new Error(`Registro inválido: ${reg}`);
        return parseInt(binaryCode, 2);
    }

    private getInstructionInfo(op: string): Instruction {
        const instr = instructionMap[op];
        if (!instr) throw new Error(`Instrucción no soportada: ${op}`);
        return instr;
    }

    private rHandler(op: string, operands: string[]): string {
    if (op === "nop") {
        return "00000000"; 
    }

    const instr = this.getInstructionInfo(op);
    const funct = parseInt(instr.funct!, 2);

     if (op === "jr") {
        const [rs] = operands;
        const rsNum = this.registerToNumber(rs);
        
        return this.convertToHex(
            (parseInt(instr.opcode, 2) << 26) |
            (rsNum << 21) | (0 << 16) | (0 << 11) | (0 << 6) | funct
        );
    }
    else if (op === "jalr") {
        let rdNum: number, rsNum: number;
        
        if (operands.length === 1) {
            rsNum = this.registerToNumber(operands[0]);
            rdNum = 31;
        } else {
            const [rd, rs] = operands; 
            rdNum = this.registerToNumber(rd);
            rsNum = this.registerToNumber(rs);
        }

        return this.convertToHex(
            (parseInt(instr.opcode, 2) << 26) |
            (rsNum << 21) | (0 << 16) | (rdNum << 11) | (0 << 6) | funct
        );
    }

    // Caso especial: mult y div solo usan rs y rt
    if (["mult", "multu", "div", "divu"].includes(op)){
        const [rs, rt] = operands; // No hay rd
        const rsNum = this.registerToNumber(rs);
        const rtNum = this.registerToNumber(rt);

        const binaryValue = 
            (parseInt(instr.opcode, 2) << 26) |
            (rsNum << 21) |
            (rtNum << 16) |
            (0 << 11) | // rd = 0
            (0 << 6) |  // shamt = 0
            funct;

        return this.convertToHex(binaryValue);
    } else if  (op === "mfhi" || op === "mflo") {
        // Formato: rd
        const [rd] = operands;
        const rdNum = this.registerToNumber(rd);
        
        const binaryValue = 
            (parseInt(instr.opcode, 2) << 26) |
            (0 << 21) |     // rs = 0
            (0 << 16) |     // rt = 0
            (rdNum << 11) |
            (0 << 6) |      // shamt = 0
            funct;

        return this.convertToHex(binaryValue);
    } 
    else if (op === "mthi" || op === "mtlo") {
        // Formato: rs
        const [rs] = operands;
        const rsNum = this.registerToNumber(rs);
        
        const binaryValue = 
            (parseInt(instr.opcode, 2) << 26) |
            (rsNum << 21) | // rs
            (0 << 16) |     // rt = 0
            (0 << 11) |     // rd = 0
            (0 << 6) |      // shamt = 0
            funct;

        return this.convertToHex(binaryValue);
    } else if (["teq", "tge", "tgeu", "tlt", "tltu", "tne"].includes(op)) {
        // Formato: rs, rt
        const [rs, rt] = operands;
        const rsNum = this.registerToNumber(rs);
        const rtNum = this.registerToNumber(rt);

        const binaryValue = 
            (parseInt(instr.opcode, 2) << 26) |
            (rsNum << 21) |     // rs
            (rtNum << 16) |     // rt
            (0 << 11) |         // rd = 0
            (0 << 6) |          // shamt = 0
            funct;

        return this.convertToHex(binaryValue);
    }else if (["sll", "sra", "srl"].includes(op)) {
        const [rd, rt, shamt] = operands;
        const shamtNum = parseInt(shamt);

        if (shamtNum < 0 || shamtNum > 31) {
            throw new Error(`Valor shamt inválido: ${shamt}`);
        }

        const binaryValue = (parseInt(instr.opcode, 2) << 26) |
            (0 << 21) | // rs = 0
            (this.registerToNumber(rt) << 16) |
            (this.registerToNumber(rd) << 11) |
            (shamtNum << 6) |
            funct;

        return this.convertToHex(binaryValue);
    }else if (["sllv", "srav", "srlv"].includes(op)) {
        const [rd, rt, rs] = operands;
        
        const binaryValue = (
            (parseInt(instr.opcode, 2) << 26) |
            (this.registerToNumber(rs) << 21) | // rs = registro fuente
            (this.registerToNumber(rt) << 16) |
            (this.registerToNumber(rd) << 11) |
            (0 << 6) | // shamt = 0
            funct
        );
        return this.convertToHex(binaryValue)
    }

    // Caso normal (add, sub, etc.)
    const [rd, rs, rt] = operands;
    const rsNum = this.registerToNumber(rs);
    const rtNum = this.registerToNumber(rt);
    const rdNum = this.registerToNumber(rd);

    const binaryValue = 
        (parseInt(instr.opcode, 2) << 26) |
        (rsNum << 21) |
        (rtNum << 16) |
        (rdNum << 11) |
        (0 << 6) | // shamt = 0
        funct;

    return this.convertToHex(binaryValue);
}

    private iHandler(op: string, operands: string[]): string {
    const instr = this.getInstructionInfo(op);
    let rsNum = 0;
    let rtNum = 0;
    let immNum = 0;

    if (["lw", "sw", "lb", "lbu", "lh", "lhu", "sb", "sh"].includes(op)) {
        const [rt, address] = operands;
        
        // Solo manejar formato offset($base)
        const offsetMatch = address.match(/(-?\d+)\((\$?\w+)\)/);
        if (!offsetMatch) throw new Error(`Formato inválido: ${address}`);
        
        const offset = parseInt(offsetMatch[1], 10);
        const baseReg = offsetMatch[2];
        
        // Validar rango del offset
        if (offset < -32768 || offset > 32767) {
            throw new Error(`Offset excede 16 bits: ${offset}`);
        }

        rsNum = this.registerToNumber(baseReg);
        rtNum = this.registerToNumber(rt);
        immNum = offset & 0xffff; // Convertir a 16 bits con signo

    } else if (op === "lui") {
        // Manejar lui rt, imm
        rtNum = this.registerToNumber(operands[0]);
        immNum = parseInt(operands[1], 16) & 0xffff; // Imm de 16 bits

    } else if (op === "beq" || op === "bne" || op === "bgtz" || op === "blez") {
        let rs: string, label: string;
        let rt: string = "$0";
        
        if (op === "bgtz" || op === "blez") {
            [rs, label] = operands;
            rtNum = 0;
        } else {
            [rs, rt, label] = operands;
            rtNum = this.registerToNumber(rt);
        }

        rsNum = this.registerToNumber(rs);

        let offset: number;
        if (/^-?\d+$/.test(label)) {
            offset = parseInt(label, 10);
        } else {
            const targetAddress = this.symbolTable.get(label);
            if (!targetAddress) throw new Error(`Etiqueta no encontrada: ${label}`);
            const currentPC = this.memAddress + 4;
            offset = Math.floor((targetAddress - currentPC) / 4);
        }

        if (offset < -32768 || offset > 32767) {
            throw new Error(`Offset inválido: ${offset}`);
        }

        immNum = offset & 0xffff;

    } else {
        // Otras instrucciones tipo I (addi, andi, etc.)
        const [rt, rs, imm] = operands;
        rsNum = this.registerToNumber(rs);
        rtNum = this.registerToNumber(rt);
        immNum = parseInt(imm, 10) & 0xffff;
    }

    const binaryValue = 
        (parseInt(instr.opcode, 2) << 26) |
        (rsNum << 21) |
        (rtNum << 16) |
        immNum;

    return this.convertToHex(binaryValue);
}


    private jHandler(op: string, operands: string[]): string {
        const instr = this.getInstructionInfo(op);
        const target = operands[0];
        
        // Obtener dirección de la etiqueta
        let targetAddress = this.symbolTable.get(target);
        if (targetAddress === undefined) {
            throw new Error(`Etiqueta no encontrada: ${target}`);
        }
    
        // Calcular dirección relativa (en palabras)
        const relativeAddress = targetAddress >>> 2; // Dividir entre 4

        const binaryValue = 
            (parseInt(instr.opcode, 2) << 26) |
            (relativeAddress & 0x03ffffff); // Máscara de 26 bits
        
        return this.convertToHex(binaryValue);
    }
    
    private convertToHex(value: number): string {
        return (value >>> 0) // Asegura 32 bits sin signo
               .toString(16)
               .padStart(8, '0'); // 8 caracteres hexadecimales
    }

    assemble(): string {
        let hexCode = "";
        
        if (this.lineType === LineType.LABEL) {
            hexCode  = `${memDechex(this.memAddress)}: <${this.label}>`;
        } else if ([LineType.R, LineType.I, LineType.J, LineType.SYSCALL].includes(this.lineType)) {
            hexCode  = `\t${memDechex(this.memAddress)}: `;
        }

        switch(this.lineType) {
            case LineType.R:
                hexCode  = this.rHandler(this.op, this.operands);
                break;
                
            case LineType.I:
                hexCode  = this.iHandler(this.op, this.operands);
                break;
                
            case LineType.J:
                hexCode  = this.jHandler(this.op, this.operands);
                break;

                case LineType.SYSCALL: {
                    const binaryValue = 
                        (0x00 << 26) | // Opcode
                        (0x00 << 21) | // rs
                        (0x00 << 16) | // rt
                        (0x00 << 6) |  // shamt
                        0x0c;          // funct
                        hexCode  = this.convertToHex(binaryValue);
                    break;
                }
                
                case LineType.LA_FIRST: {
                    const tempAddr = this.symbolTable.get(this.operands[0]) || 0;
                    const upper = (tempAddr >> 16) & 0xffff;
                    const binaryValue = 
                        (0x0f << 26) | // Opcode lui
                        (0 << 21) |    // rs no usado
                        (this.registerToNumber(this.op) << 16 |
                        upper);
                        hexCode  = this.convertToHex(binaryValue);
                    break;
                }
                
                case LineType.LA_THIRD: {
                    const tempAddr2 = this.symbolTable.get(this.operands[0]) || 0;
                    const lower = tempAddr2 & 0xffff;
                    const binaryValue = 
                        (0x0d << 26) | // Opcode ori
                        (this.registerToNumber(this.op) << 21) |
                        (this.registerToNumber(this.op) << 16 |
                        lower);
                        hexCode  = this.convertToHex(binaryValue);
                    break;
                }
        }

        return `${memDechex(this.memAddress)}: ${hexCode}`;
    }
}



// Función principal de ensamblado
export function assembleFull(input: string): string {
    const lines = processInput(input);
    const symbolTable = new Map<string, number>();
    const dataAddressStart = 0x00c00000;
    const textAddressStart = 0x00400000;
    let currentAddress = textAddressStart;
    const parsedLines: Line[] = [];
    let dataSection = false;
    const outputJSON: { [key: string]: string } = {};

    // Primera pasada: construir tabla de símbolos
    for (const lineStr of lines) {
        if (lineStr.startsWith('#')) continue;
        
        if (lineStr === '.data') {
            dataSection = true;
            currentAddress = dataAddressStart;
            continue;
        }
        
        if (lineStr === '.text') {
            dataSection = false;
            currentAddress = textAddressStart;
            continue;
        }

        const labelMatch = lineStr.match(/^([^:]+):/);
        if (labelMatch) {
            const label = labelMatch[1];
            symbolTable.set(label, currentAddress);
        }

        if (!dataSection && !lineStr.startsWith('.')) {
            const line = new Line(symbolTable);
            line.originalCode = lineStr.replace(/^\s*/, '');
            line.memAddress = currentAddress;
            
            const parts = lineStr.trim().split(/[\s,]+/).filter(p => p);
            if (parts.length === 0) continue;

            if (parts[0].endsWith(':')) continue; // Ignorar etiquetas en parsedLines
            
            parsedLines.push(line);
            currentAddress += 4;
        }
    }

    // Segunda pasada: generar JSON
    for (const line of parsedLines) {
        const parts = line.originalCode.split(/[\s,]+/).filter(p => p);
        if (parts.length === 0 || parts[0].startsWith('#')) continue;

        line.op = parts[0].toLowerCase();
        line.operands = parts.slice(1);

        try {
            if (line.op === 'la') {
                // Manejar pseudoinstrucción la
                const rt = line.operands[0];
                const label = line.operands[1];
                const addr = symbolTable.get(label) || 0;
                
                if (addr === 0) throw new Error(`Etiqueta no definida: ${label}`);
                
                // Generar lui
                const upper = (addr >> 16) & 0xffff;
                const luiCode = `lui ${rt}, 0x${upper.toString(16)}`;
                const luiLine = new Line(symbolTable);
                luiLine.op = 'lui';
                luiLine.operands = [rt, `0x${upper.toString(16)}`];
                luiLine.lineType = LineType.I;
                const luiHex = luiLine.assemble().split(': ')[1]?.trim();
                
                // Generar ori
                const lower = addr & 0xffff;
                const oriCode = `ori ${rt}, ${rt}, 0x${lower.toString(16)}`;
                const oriLine = new Line(symbolTable);
                oriLine.op = 'ori';
                oriLine.operands = [rt, rt, `0x${lower.toString(16)}`];
                oriLine.lineType = LineType.I;
                const oriHex = oriLine.assemble().split(': ')[1]?.trim();

                if (luiHex) outputJSON[luiCode] = luiHex;
                if (oriHex) outputJSON[oriCode] = oriHex;
            } else {
                // Determinar tipo de instrucción
                if (instructionMap[line.op]?.opcode === "000000") {
                    line.lineType = LineType.R;
                } else if (['j', 'jal'].includes(line.op)) {
                    line.lineType = LineType.J;
                } else if (line.op === 'syscall') {
                    line.lineType = LineType.SYSCALL;
                } else if (line.op === 'nop') {
                    line.op = 'sll';
                    line.operands = ['$zero', '$zero', '0'];
                    line.lineType = LineType.R;
                } else {
                    line.lineType = LineType.I;
                }

                const hex = line.assemble().split(': ')[1]?.trim();
                if (hex) outputJSON[line.originalCode] = hex;
            }
        } catch (e) {
            console.error(`Error ensamblando: ${line.originalCode}`, e);
            if (e instanceof Error) {
                outputJSON[line.originalCode] = `Error: ${e.message}`;
              } else {
                outputJSON[line.originalCode] = `Error desconocido`;
              }
        }
    }

    return JSON.stringify(outputJSON, null, 4);
}
/*
const testCode =`
     .data

    .text
    main:
        lui $t0, 0x00c0      
        ori $t0, $t0, 0x0000  

        addi $s0, $zero, 1      
        addi $s1, $zero, 5      
        addi $s2, $zero, 10     
        
        lw $t1, 0($t0)         
        lh $t2, 4($t0)        
        
        sw $s0, 0($t5)        
        sh $s1, 6($t0)        
        
        addi $t2, $zero, 3       
        addi $t3, $zero, 4     
        j fine

    somma:
        add $s3, $s1, $s2        
        lw $t4, 0($t5)          
        j fine

    sottrazione:
        sub $s3, $s1, $s2       
        sw $s3, 8($t0)         
        j fine


     molt:
        mult $s1, $s2            
        j fine                   

    div:
        div $s1, $s2             
        j fine                  

    or:
        or $s3, $s1, $s2         
        j fine                   

    and:
        and $s3, $s1, $s2        
        j fine                   

    andi:
        andi $s3, $s1, 0x0F     
        j fine                   

    xor:
        xor $s3, $s1, $s2       
        j fine                  

    fine:
        sh $s2, 12($t0)
        xori $t3 $t7 50745  
        j main 
        addu $t1 $t4 $t3
        jal xor
        nop
`
*/

/*
const testCode = `
    .data
    array: .word 0x1234, 0x5678
    
    .text
    main:
        la $t0, array       # Cargar dirección del array
        lw $t1, 0($t0)      # Cargar primer elemento
        sw $t2, 4($t0)      # Almacenar en segunda posición
        lb $t3, 2($t0)      # Cargar byte
        sh $t4, 6($t0)      # Almacenar half-word
`;
*/


const testCode = `
    .text
    add $t0, $t1, $t2
    sub $t3, $t4, $t5
    and $t6, $t7, $t8
    or $t9, $s0, $s1
    jalr $s2, $s3    
    jr $s4            
    slt $s5, $s6, $s7
    mfhi $t0          
    mflo $t1          
    mthi $t2          
    mtlo $t3          
    teq $t5, $t4      
    tge $t6, $t7      
    tgeu $t8, $t9     
    tlt $s0, $s1      
    tltu $s2, $s3     
    tne $s4, $s5     
    addu $s6, $s7, $t0
    div $t1, $t2
    divu $t3, $t4     
    mult $t5, $t6
    multu $t7, $t8    
    nor $t9, $s0, $s1
    sll $s2, $s3, 1    
    sllv $s4, $s5, $s6
    sra $s7, $t0, 2     
    srav $t1, $t2, $t3
    srl $t4, $t5, 3
    srlv $t6, $t7, $t8
    subu $t9, $s0, $s1
    xor $s2, $s3, $s4
    addi $s5, $s6, 100
    addiu $s7, $t0, 200
    andi $t1, $t2, 0xFF
    ori $t3, $t4, 0x0F
    xori $t5, $t6, 0xAA
    lw $t7, 0($sp)
    sw $t8, 4($sp)
    lb $t9, 8($sp)
    lbu $s0, 12($sp)
    lh $s1, 16($sp)
    lhu $s2, 20($sp)
    sb $s3, 24($sp)
    sh $s4, 28($sp)
    beq $s5, $s6, fine
    bne $s7, $t0, fine
    bgtz $t1, 0        
    blez $t2, 0        
    j fine
    jal fine
    lui $t3, 0x1234
    nop
    fine: 

`
// console.log("=== Resultado del Ensamblado ===");

//Llamar a la funcion principal
// console.log(assembleFull(testCode));
// const instructionNames: string[] = Object.keys(instructionMap);
//  console.log(instructionNames);
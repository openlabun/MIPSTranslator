export const RV32I_INSTRUCTIONS: { [key: string]: string } = {
    // Instrucciones de tipo U
    "lui": "Load Upper Immediate", 
    "auipc": "Add Upper Immediate to PC",
    
    // Instrucciones de tipo J
    "jal": "Jump and Link",
    
    // Instrucciones de tipo I
    "jalr": "Jump and Link Register",
    "lb": "Load Byte",
    "lh": "Load Halfword",
    "lw": "Load Word",
    "lbu": "Load Byte Unsigned",
    "lhu": "Load Halfword Unsigned",
    "addi": "Add Immediate",
    "slti": "Set Less Than Immediate",
    "sltiu": "Set Less Than Immediate Unsigned",
    "xori": "Xor Immediate",
    "ori": "Or Immediate",
    "andi": "And Immediate",
    "slli": "Shift Left Logical Immediate",
    "srli": "Shift Right Logical Immediate",
    "srai": "Shift Right Arithmetic Immediate",
    
    // Instrucciones de tipo S
    "sb": "Store Byte",
    "sh": "Store Halfword",
    "sw": "Store Word",
    
    // Instrucciones de tipo B
    "beq": "Branch Equal",
    "bne": "Branch Not Equal",
    "blt": "Branch Less Than",
    "bge": "Branch Greater Than or Equal",
    "bltu": "Branch Less Than Unsigned",
    "bgeu": "Branch Greater Than or Equal Unsigned",
    
    // Instrucciones de tipo R
    "add": "Add",
    "sub": "Subtract",
    "sll": "Shift Left Logical",
    "slt": "Set Less Than",
    "sltu": "Set Less Than Unsigned",
    "xor": "Xor",
    "srl": "Shift Right Logical",
    "sra": "Shift Right Arithmetic",
    "or": "Or",
    "and": "And",
    
    // Instrucciones de sistema
    "fence": "Fence",
    "ecall": "Environment Call",
    "ebreak": "Environment Break"
  };
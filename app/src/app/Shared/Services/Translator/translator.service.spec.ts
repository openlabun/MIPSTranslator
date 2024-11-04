import { TestBed } from '@angular/core/testing';
import { TranslatorService } from './translator.service';

describe('TranslatorService', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('R-type instruction tests', () => {
        it('should translate "add $t1, $t2, $t3" to hex', () => {
            const result = service.translateInstructionToHex('add $t1 $t2 $t3');
            expect(result).toEqual('014B4820');
        });
        it('should translate "014B4820" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4820');
            expect(result).toEqual('add $t1 $t2 $t3');
        });

        it('should translate "sub $s1, $s2, $s3" to hex', () => {
            const result = service.translateInstructionToHex('sub $s1 $s2 $s3');
            expect(result).toEqual('02538822');
        });
        it('should translate "02538822" to mips', () => {
            const result = service.translateInstructionToMIPS('02538822');
            expect(result).toEqual('sub $s1 $s2 $s3');
        });
        it('should translate "and t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('and t1 t2 t3');
            expect(result).toEqual('014B4824');
        });
        it('should translate "014B4824" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4824');
            expect(result).toEqual('and $t1 $t2 $t3');
        });
        it('should translate "or t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('or t1 t2 t3');
            expect(result).toEqual('014B4825');
        });
        it('should translate "014B4825" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4825');
            expect(result).toEqual('or $t1 $t2 $t3');
        });
        it('should translate "jalr t1" to hex', () => {
            const result = service.translateInstructionToHex('jalr t1');
            expect(result).toEqual('0120F809');
        });
        it('should translate "0120F809" to mips', () => {
            const result = service.translateInstructionToMIPS('0120F809');
            expect(result).toEqual('jalr $t1 $ra');
        });
        it('should translate "jr t1" to hex', () => {
            const result = service.translateInstructionToHex('jr t1');
            expect(result).toEqual('01200008');
        });
        it('should translate "01200008" to mips', () => {
            const result = service.translateInstructionToMIPS('01200008');
            expect(result).toEqual('jr $t1');
        });
        it('should translate "slt $s1, $s2, $s3" to hex', () => {
            const result = service.translateInstructionToHex('slt $s1 $s2 $s3');
            expect(result).toEqual('0253882A');
        });
        it('should translate "0253882A" to mips', () => {
            const result = service.translateInstructionToMIPS('0253882A');
            expect(result).toEqual('slt $s1 $s2 $s3');
        });
        it('should translate "mfhi t1" to hex', () => {
            const result = service.translateInstructionToHex('mfhi t1');
            expect(result).toEqual('00004810');
        });
        it('should translate "00004810" to mips', () => {
            const result = service.translateInstructionToMIPS('00004810');
            expect(result).toEqual('mfhi $t1');
        });
        it('should translate "mflo t1" to hex', () => {
            const result = service.translateInstructionToHex('mflo t1');
            expect(result).toEqual('00004812');
        });
        it('should translate "00004812" to mips', () => {
            const result = service.translateInstructionToMIPS('00004812');
            expect(result).toEqual('mflo $t1');
        });
        it('should translate "mthi t1" to hex', () => {
            const result = service.translateInstructionToHex('mthi t1');
            expect(result).toEqual('01200011');
        });
        it('should translate "00004810" to mips', () => {
            const result = service.translateInstructionToMIPS('01200011');
            expect(result).toEqual('mthi $t1');
        });
        it('should translate "mtlo t1" to hex', () => {
            const result = service.translateInstructionToHex('mtlo t1');
            expect(result).toEqual('01200013');
        });
        it('should translate "01200013" to mips', () => {
            const result = service.translateInstructionToMIPS('01200013');
            expect(result).toEqual('mtlo $t1');
        });
        it('should translate "teq t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('teq t0 t1 10');
            expect(result).toEqual('012802B4');
        });
        it('should translate "012802B4" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B4');
            expect(result).toEqual('teq $t0 $t1 0x00A');
        });
        it('should translate "tge t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tge t0 t1 10');
            expect(result).toEqual('012802B0');
        });
        it('should translate "012802B0" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B0');
            expect(result).toEqual('tge $t0 $t1 0x00A');
        });
        it('should translate "tgeu t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tgeu t0 t1 10');
            expect(result).toEqual('012802B1');
        });
        it('should translate "012802B1" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B1');
            expect(result).toEqual('tgeu $t0 $t1 0x00A');
        });
        it('should translate "tlt t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tlt t0 t1 10');
            expect(result).toEqual('012802B2');
        });
        it('should translate "012802B2" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B2');
            expect(result).toEqual('tlt $t0 $t1 0x00A');
        });
        it('should translate "tltu t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tltu t0 t1 10');
            expect(result).toEqual('012802B3');
        });
        it('should translate "012802B3" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B3');
            expect(result).toEqual('tltu $t0 $t1 0x00A');
        });
        it('should translate "tne t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tne t0 t1 10');
            expect(result).toEqual('012802B6');
        });
        it('should translate "012802B6" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B6');
            expect(result).toEqual('tne $t0 $t1 0x00A');
        });
        it('should translate "addu t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('addu t1 t2 t3');
            expect(result).toEqual('014B4821');
        });
        it('should translate "014B4821" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4821');
            expect(result).toEqual('addu $t1 $t2 $t3');
        });
        it('should translate "div t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('div t1 t2');
            expect(result).toEqual('012A001A');
        });
        it('should translate "012A001A" to mips', () => {
            const result = service.translateInstructionToMIPS('012A001A');
            expect(result).toEqual('div $t1 $t2');
        });
        it('should translate "divu t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('divu t1 t2');
            expect(result).toEqual('012A001B');
        });
        it('should translate "012A001B" to mips', () => {
            const result = service.translateInstructionToMIPS('012A001B');
            expect(result).toEqual('divu $t1 $t2');
        });
        it('should translate "mult t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('mult t1 t2');
            expect(result).toEqual('012A0018');
        });
        it('should translate "012A0018" to mips', () => {
            const result = service.translateInstructionToMIPS('012A0018');
            expect(result).toEqual('mult $t1 $t2');
        });
        it('should translate "multu t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('multu t1 t2');
            expect(result).toEqual('012A0019');
        });
        it('should translate "012A0019" to mips', () => {
            const result = service.translateInstructionToMIPS('012A0019');
            expect(result).toEqual('multu $t1 $t2');
        });
        it('should translate "nor t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('nor t1 t2 t3');
            expect(result).toEqual('014B4827');
        });
        it('should translate "014B4827" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4827');
            expect(result).toEqual('nor $t1 $t2 $t3');
        });
        it('should translate "sll $t1, $t2, 4" to hex', () => {
            const result = service.translateInstructionToHex('sll $t1 $t2 4');
            expect(result).toEqual('000A4900');
        });
        it('should translate "000A4900" to mips', () => {
            const result = service.translateInstructionToMIPS('000A4900');
            expect(result).toEqual('sll $t1 $t2 0x04');
        });
        it('should translate "sllv t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('sllv t1 t2 t3');
            expect(result).toEqual('014B4804');
        });
        it('should translate "014B4804" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4804');
            expect(result).toEqual('sllv $t1 $t2 $t3');
        });
        it('should translate "sra $t1, $t2, 4" to hex', () => {
            const result = service.translateInstructionToHex('sra $t1 $t2 4');
            expect(result).toEqual('000A4903');
        });
        it('should translate "000A4903" to mips', () => {
            const result = service.translateInstructionToMIPS('000A4903');
            expect(result).toEqual('sra $t1 $t2 0x04');
        });
        it('should translate "srav t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('srav t1 t2 t3');
            expect(result).toEqual('014B4807');
        });
        it('should translate "014B4807" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4807');
            expect(result).toEqual('srav $t1 $t2 $t3');
        });
        it('should translate "srl $t1, $t2, 4" to hex', () => {
            const result = service.translateInstructionToHex('srl $t1 $t2 4');
            expect(result).toEqual('000A4902');
        });
        it('should translate "000A4902" to mips', () => {
            const result = service.translateInstructionToMIPS('000A4902');
            expect(result).toEqual('srl $t1 $t2 0x04');
        });
        it('should translate "srlv t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('srlv t1 t2 t3');
            expect(result).toEqual('014B4806');
        });
        it('should translate "014B4806" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4806');
            expect(result).toEqual('srlv $t1 $t2 $t3');
        });
        it('should translate "subu t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('subu t1 t2 t3');
            expect(result).toEqual('014B4823');
        });
        it('should translate "014B4823" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4823');
            expect(result).toEqual('subu $t1 $t2 $t3');
        });
        it('should translate "xor $s1, $s2, $s3" to hex', () => {
            const result = service.translateInstructionToHex('xor $s1 $s2 $s3');
            expect(result).toEqual('02538826');
        });
        it('should translate "02538826" to mips', () => {
            const result = service.translateInstructionToMIPS('02538826');
            expect(result).toEqual('xor $s1 $s2 $s3');
        });

    });

    describe('I-type instruction tests', () => {
        it('should translate "addi $t1, $t2, 100" to hex', () => {
            const result = service.translateInstructionToHex('addi $t1 $t2 100');
            expect(result).toEqual('21490064');
        });
        it('should translate "21490064" to mips', () => {
            const result = service.translateInstructionToMIPS('21490064');
            expect(result).toEqual('addi $t1 $t2 0x0064');
        });
        it('should translate "addiu t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('addiu t1 t2 10');
            expect(result).toEqual('2549000A');
        });
        it('should translate "2549000A" to mips', () => {
            const result = service.translateInstructionToMIPS('2549000A');
            expect(result).toEqual('addiu $t1 $t2 0x000A');
        });
        it('should translate "andi t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('andi t1 t2 10');
            expect(result).toEqual('3149000A');
        });
        it('should translate "3149000A" to mips', () => {
            const result = service.translateInstructionToMIPS('3149000A');
            expect(result).toEqual('andi $t1 $t2 0x000A');
        });
        it('should translate "ori t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('ori t1 t2 10');
            expect(result).toEqual('3549000A');
        });
        it('should translate "3549000A" to mips', () => {
            const result = service.translateInstructionToMIPS('3549000A');
            expect(result).toEqual('ori $t1 $t2 0x000A');
        });
        it('should translate "xori t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('xori t1 t2 10');
            expect(result).toEqual('3949000A');
        });
        it('should translate "3949000A" to mips', () => {
            const result = service.translateInstructionToMIPS('3949000A');
            expect(result).toEqual('xori $t1 $t2 0x000A');
        });
    });

    describe('load and storage instructions test', () => {
        it('should translate "lw $t0, 32 $t1" to hex', () => {
            const result = service.translateInstructionToHex('lw $t0 32 $t1');
            expect(result).toEqual('8D280020');
        });
        it('should translate "8D280020" to mips', () => {
            const result = service.translateInstructionToMIPS('8D280020');
            expect(result).toEqual('lw $t0 0x0020 $t1');
        });
        it('should translate "sw t1 0 t2" to hex', () => {
            const result = service.translateInstructionToHex('sw t1 0 t2');
            expect(result).toEqual('AD490000');
        });
        it('should translate "AD490000" to mips', () => {
            const result = service.translateInstructionToMIPS('AD490000');
            expect(result).toEqual('sw $t1 0x0000 $t2');
        });
        it('should translate "lb t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lb t0 4 t1');
            expect(result).toEqual('81280004');
        });
        it('should translate "81280004" to mips', () => {
            const result = service.translateInstructionToMIPS('81280004');
            expect(result).toEqual('lb $t0 0x0004 $t1');
        });
        it('should translate "lbu t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lbu t0 4 t1');
            expect(result).toEqual('91280004');
        });
        it('should translate "91280004" to mips', () => {
            const result = service.translateInstructionToMIPS('91280004');
            expect(result).toEqual('lbu $t0 0x0004 $t1');
        });
        it('should translate "lh t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lh t0 4 t1');
            expect(result).toEqual('85280004');
        });
        it('should translate "85280004" to mips', () => {
            const result = service.translateInstructionToMIPS('85280004');
            expect(result).toEqual('lh $t0 0x0004 $t1');
        });
        it('should translate "lhu t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lhu t0 4 t1');
            expect(result).toEqual('95280004');
        });
        it('should translate "95280004" to mips', () => {
            const result = service.translateInstructionToMIPS('95280004');
            expect(result).toEqual('lhu $t0 0x0004 $t1');
        });
        it('should translate "sb t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('sb t0 4 t1');
            expect(result).toEqual('A1280004');
        });
        it('should translate "A1280004" to mips', () => {
            const result = service.translateInstructionToMIPS('A1280004');
            expect(result).toEqual('sb $t0 0x0004 $t1');
        });
        it('should translate "sh t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('sh t0 4 t1');
            expect(result).toEqual('A5280004');
        });
        it('should translate "A5280004" to mips', () => {
            const result = service.translateInstructionToMIPS('A5280004');
            expect(result).toEqual('sh $t0 0x0004 $t1');
        });
    });

    describe('branch instructions test', () => {
        it('should translate "beq t1 t0 10" to hex', () => {
            const result = service.translateInstructionToHex('beq t1 t0 10');
            expect(result).toEqual('1128000A');
        });
        it('should translate "1128000A" to mips', () => {
            const result = service.translateInstructionToMIPS('1128000A');
            expect(result).toEqual('beq $t1 $t0 0x000A');
        });
        it('should translate "bne t1 t2 30" to hex', () => {
            const result = service.translateInstructionToHex('bne t1 t2 30');
            expect(result).toEqual('152A001E');
        });
        it('should translate "152A001E" to mips', () => {
            const result = service.translateInstructionToMIPS('152A001E');
            expect(result).toEqual('bne $t1 $t2 0x001E');
        });
        it('should translate "bgtz t1 45" to hex', () => {
            const result = service.translateInstructionToHex('bgtz t1 45');
            expect(result).toEqual('1D20002D');
        });
        it('should translate "1D20002D" to mips', () => {
            const result = service.translateInstructionToMIPS('1D20002D');
            expect(result).toEqual('bgtz $t1 0x002D');
        });
        it('should translate "blez t1 45" to hex', () => {
            const result = service.translateInstructionToHex('blez t1 45');
            expect(result).toEqual('1920002D');
        });
        it('should translate "1D20002D" to mips', () => {
            const result = service.translateInstructionToMIPS('1920002D');
            expect(result).toEqual('blez $t1 0x002D');
        });
    });

    describe('J-type instruction tests', () => {
        it('should translate "j 1024" to hex', () => {
            const result = service.translateInstructionToHex('j 1024');
            expect(result).toEqual('08000400');
        });
        it('should translate "08000400" to mips', () => {
            const result = service.translateInstructionToMIPS('08000400');
            expect(result).toEqual('j 0x0000400');
        });

        it('should translate "jal 2048" to hex', () => {
            const result = service.translateInstructionToHex('jal 2048');
            expect(result).toEqual('0C000800');
        });
        it('should translate "0C000800" to mips', () => {
            const result = service.translateInstructionToMIPS('0C000800');
            expect(result).toEqual('jal 0x0000800');
        });
    });

    describe('it must accept 0x hex instructions', () => {
        it('should translate "0x1920009F" to mips', () => {
            const result = service.translateInstructionToMIPS('0x1920009F');
            expect(result).toEqual('blez $t1 0x009F');
        });
    })

});

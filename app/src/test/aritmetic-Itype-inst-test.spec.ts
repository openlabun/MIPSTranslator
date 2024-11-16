import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService aritmetic I-type instruction tests', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    describe('Translate I-type instruction to hex', () => {
        it('should translate "addi $t1, $t2, 100" to hex', () => {
            const result = service.translateInstructionToHex('addi $t1 $t2 100');
            expect(result).toEqual('21490064');
        });
        it('should translate "addiu t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('addiu t1 t2 10');
            expect(result).toEqual('2549000A');
        });
        it('should translate "andi t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('andi t1 t2 10');
            expect(result).toEqual('3149000A');
        });
        it('should translate "ori t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('ori t1 t2 10');
            expect(result).toEqual('3549000A');
        });
        it('should translate "xori t1 t2 10" to hex', () => {
            const result = service.translateInstructionToHex('xori t1 t2 10');
            expect(result).toEqual('3949000A');
        });
    });

    describe('Translate hext to I-type instruc', () => {
        it('should translate "21490064" to mips', () => {
            const result = service.translateInstructionToMIPS('21490064');
            expect(result).toEqual('addi $t1 $t2 0x0064');
        });
        it('should translate "2549000A" to mips', () => {
            const result = service.translateInstructionToMIPS('2549000A');
            expect(result).toEqual('addiu $t1 $t2 0x000A');
        });
        it('should translate "3149000A" to mips', () => {
            const result = service.translateInstructionToMIPS('3149000A');
            expect(result).toEqual('andi $t1 $t2 0x000A');
        });
        it('should translate "3549000A" to mips', () => {
            const result = service.translateInstructionToMIPS('3549000A');
            expect(result).toEqual('ori $t1 $t2 0x000A');
        });
        it('should translate "3949000A" to mips', () => {
            const result = service.translateInstructionToMIPS('3949000A');
            expect(result).toEqual('xori $t1 $t2 0x000A');
        });
    });

});

import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService aritmetic R-type instructions', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });
    describe('Translate R-type instructions to hex', () => {
        it('should translate "add $t1, $t2, $t3" to hex', () => {
            const result = service.translateInstructionToHex('add $t1 $t2 $t3');
            expect(result).toEqual('014B4820');
        });
        it('should translate "sub $s1, $s2, $s3" to hex', () => {
            const result = service.translateInstructionToHex('sub $s1 $s2 $s3');
            expect(result).toEqual('02538822');
        });
        it('should translate "and t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('and t1 t2 t3');
            expect(result).toEqual('014B4824');
        });
        it('should translate "or t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('or t1 t2 t3');
            expect(result).toEqual('014B4825');
        });
        it('should translate "addu t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('addu t1 t2 t3');
            expect(result).toEqual('014B4821');
        });
        it('should translate "div t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('div t1 t2');
            expect(result).toEqual('012A001A');
        });
        it('should translate "divu t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('divu t1 t2');
            expect(result).toEqual('012A001B');
        });
        it('should translate "mult t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('mult t1 t2');
            expect(result).toEqual('012A0018');
        });
        it('should translate "multu t1 t2" to hex', () => {
            const result = service.translateInstructionToHex('multu t1 t2');
            expect(result).toEqual('012A0019');
        });
        it('should translate "nor t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('nor t1 t2 t3');
            expect(result).toEqual('014B4827');
        });
        it('should translate "sll $t1, $t2, 4" to hex', () => {
            const result = service.translateInstructionToHex('sll $t1 $t2 4');
            expect(result).toEqual('000A4900');
        });
        it('should translate "sllv t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('sllv t1 t2 t3');
            expect(result).toEqual('014B4804');
        });
        it('should translate "sra $t1, $t2, 4" to hex', () => {
            const result = service.translateInstructionToHex('sra $t1 $t2 4');
            expect(result).toEqual('000A4903');
        });
        it('should translate "srav t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('srav t1 t2 t3');
            expect(result).toEqual('014B4807');
        });
        it('should translate "srl $t1, $t2, 4" to hex', () => {
            const result = service.translateInstructionToHex('srl $t1 $t2 4');
            expect(result).toEqual('000A4902');
        });
        it('should translate "srlv t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('srlv t1 t2 t3');
            expect(result).toEqual('014B4806');
        });
        it('should translate "subu t1 t2 t3" to hex', () => {
            const result = service.translateInstructionToHex('subu t1 t2 t3');
            expect(result).toEqual('014B4823');
        });
        it('should translate "xor $s1, $s2, $s3" to hex', () => {
            const result = service.translateInstructionToHex('xor $s1 $s2 $s3');
            expect(result).toEqual('02538826');
        });
    });
    
    describe('Translate hex to Type-R instructions', () => {
        it('should translate "014B4820" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4820');
            expect(result).toEqual('add $t1 $t2 $t3');
        });
        it('should translate "02538822" to mips', () => {
            const result = service.translateInstructionToMIPS('02538822');
            expect(result).toEqual('sub $s1 $s2 $s3');
        });
        it('should translate "014B4824" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4824');
            expect(result).toEqual('and $t1 $t2 $t3');
        });
        it('should translate "014B4825" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4825');
            expect(result).toEqual('or $t1 $t2 $t3');
        })
        it('should translate "014B4821" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4821');
            expect(result).toEqual('addu $t1 $t2 $t3');
        });
        it('should translate "012A001A" to mips', () => {
            const result = service.translateInstructionToMIPS('012A001A');
            expect(result).toEqual('div $t1 $t2');
        });
        it('should translate "012A001B" to mips', () => {
            const result = service.translateInstructionToMIPS('012A001B');
            expect(result).toEqual('divu $t1 $t2');
        });
        it('should translate "012A0018" to mips', () => {
            const result = service.translateInstructionToMIPS('012A0018');
            expect(result).toEqual('mult $t1 $t2');
        });
        it('should translate "012A0019" to mips', () => {
            const result = service.translateInstructionToMIPS('012A0019');
            expect(result).toEqual('multu $t1 $t2');
        });
        it('should translate "014B4827" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4827');
            expect(result).toEqual('nor $t1 $t2 $t3');
        });
        it('should translate "000A4900" to mips', () => {
            const result = service.translateInstructionToMIPS('000A4900');
            expect(result).toEqual('sll $t1 $t2 0x04');
        });
        it('should translate "014B4804" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4804');
            expect(result).toEqual('sllv $t1 $t2 $t3');
        });
        it('should translate "000A4903" to mips', () => {
            const result = service.translateInstructionToMIPS('000A4903');
            expect(result).toEqual('sra $t1 $t2 0x04');
        });
        it('should translate "014B4807" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4807');
            expect(result).toEqual('srav $t1 $t2 $t3');
        });
        it('should translate "000A4902" to mips', () => {
            const result = service.translateInstructionToMIPS('000A4902');
            expect(result).toEqual('srl $t1 $t2 0x04');
        });
        it('should translate "014B4806" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4806');
            expect(result).toEqual('srlv $t1 $t2 $t3');
        });
        it('should translate "014B4823" to mips', () => {
            const result = service.translateInstructionToMIPS('014B4823');
            expect(result).toEqual('subu $t1 $t2 $t3');
        });
        it('should translate "02538826" to mips', () => {
            const result = service.translateInstructionToMIPS('02538826');
            expect(result).toEqual('xor $s1 $s2 $s3');
        });
    });
});

import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService branch instruction tests', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    describe('Translate branch instructions to hex', () => {
        it('should translate "beq t1 t0 10" to hex', () => {
            const result = service.translateInstructionToHex('beq t1 t0 10');
            expect(result).toEqual('1128000A');
        });
        it('should translate "bne t1 t2 30" to hex', () => {
            const result = service.translateInstructionToHex('bne t1 t2 30');
            expect(result).toEqual('152A001E');
        });
        it('should translate "bgtz t1 45" to hex', () => {
            const result = service.translateInstructionToHex('bgtz t1 45');
            expect(result).toEqual('1D20002D');
        });
        it('should translate "blez t1 45" to hex', () => {
            const result = service.translateInstructionToHex('blez t1 45');
            expect(result).toEqual('1920002D');
        });
    });
    describe('Translate hex to branch instructions', () => { 
        it('should translate "1128000A" to mips', () => {
            const result = service.translateInstructionToMIPS('1128000A');
            expect(result).toEqual('beq $t1 $t0 0x000A');
        });
        it('should translate "152A001E" to mips', () => {
            const result = service.translateInstructionToMIPS('152A001E');
            expect(result).toEqual('bne $t1 $t2 0x001E');
        });
        it('should translate "1D20002D" to mips', () => {
            const result = service.translateInstructionToMIPS('1D20002D');
            expect(result).toEqual('bgtz $t1 0x002D');
        });
        it('should translate "1D20002D" to mips', () => {
            const result = service.translateInstructionToMIPS('1920002D');
            expect(result).toEqual('blez $t1 0x002D');
        });
    });
});

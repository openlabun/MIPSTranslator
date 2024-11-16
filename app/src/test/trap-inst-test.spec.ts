import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService I-type instruction tests', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    describe('Translate trap instructions to hex', ()=>{
        it('should translate "teq t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('teq t0 t1 10');
            expect(result).toEqual('012802B4');
        });
        it('should translate "tge t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tge t0 t1 10');
            expect(result).toEqual('012802B0');
        });
        it('should translate "tgeu t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tgeu t0 t1 10');
            expect(result).toEqual('012802B1');
        });
        it('should translate "tlt t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tlt t0 t1 10');
            expect(result).toEqual('012802B2');
        });
        it('should translate "tltu t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tltu t0 t1 10');
            expect(result).toEqual('012802B3');
        });
        it('should translate "tne t0 t1 10" to hex', () => {
            const result = service.translateInstructionToHex('tne t0 t1 10');
            expect(result).toEqual('012802B6');
        });
    });
    describe('Translate hex to trap instructions', ()=>{
        it('should translate "012802B4" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B4');
            expect(result).toEqual('teq $t0 $t1 0x00A');
        });
        it('should translate "012802B0" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B0');
            expect(result).toEqual('tge $t0 $t1 0x00A');
        });
        it('should translate "012802B1" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B1');
            expect(result).toEqual('tgeu $t0 $t1 0x00A');
        });
        it('should translate "012802B2" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B2');
            expect(result).toEqual('tlt $t0 $t1 0x00A');
        });
        it('should translate "012802B3" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B3');
            expect(result).toEqual('tltu $t0 $t1 0x00A');
        });
        it('should translate "012802B6" to mips', () => {
            const result = service.translateInstructionToMIPS('012802B6');
            expect(result).toEqual('tne $t0 $t1 0x00A');
        });
    });
});